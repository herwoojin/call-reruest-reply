# ERD — 시설ON (FacilON) v2
## 데이터베이스 설계서 (Supabase PostgreSQL + PostGIS)

- 문서 버전: v2.0 (quotes/quote_sheets/work_progress/page_permissions 추가)

---

## 1. 개체 관계 개요

```
regions ─┬─ stores ─┬─ facility_requests ─┬─ chat_messages(+reads/participants)
         │          │                     ├─ approvals (임계값 초과 시)
         │          │                     ├─ ai_prechecks
         │          │                     ├─ quotes ── quote_sheets ⭐
         │          │                     ├─ work_logs / work_progress ⭐
         │          │                     ├─ worker_locations
         │          │                     └─ request_media
         │          └─ 이력 5테이블 (facilities/happy_calls/cost_history/inspections/pre_maintenance)
         └─ org_positions
profiles / partners / categories ─ routing_rules / standard_prices ⭐
manuals(+acks) / page_registry + page_permissions + user_page_overrides ⭐
notifications / push_subscriptions / audit_logs / request_status_transitions
```

## 2. 테이블 정의

### 2.1 regions
(id uuid PK, parent_id FK, name, level smallint[1본부 2지역 3팀], boundary geometry(MultiPolygon,4326))

### 2.2 stores — 점포 마스터 (~18,000)
(id uuid PK, store_code UNIQUE, name, region_id FK, address, **location geometry(Point,4326) GIST**, open_date, owner_id FK profiles, ofc_id FK profiles, status, meta jsonb)
인덱스: gist(location), (region_id), (store_code), (owner_id), (ofc_id)

### 2.3 profiles
(id uuid PK=auth.users.id, role CHECK in [OWNER,OFC,ADMIN,FM,PARTNER_ADMIN,PARTNER_WORKER], name, phone, **email** (시트 공유용), region_ids uuid[], partner_id FK NULL, fm_capacity smallint default 10, is_active bool)

### 2.4 org_positions — 결재선 (임계값 초과 건용)
(id, region_id FK, position [PART_LEAD/SALES_LEAD/REGION_HEAD/DEPUTY], user_id FK, valid_from, valid_to)

### 2.5 categories — 핀 색상
(id, code UNIQUE [COLD/SIGN/COFFEE/ELEC/INTERIOR/PLUMB/ETC], name, **color_hex**, icon, symptoms jsonb, sort_order)

### 2.6 routing_rules
(id, category_id FK, symptom_code NULL, sla_hours int, **approval_threshold int** — 이 금액 초과 시 결재 4단계, partner_hint uuid NULL, priority, is_active)
> v2: 모든 건이 수동(풀 공개) 기본. AUTO 직배정은 partner_hint + mode 컬럼으로 옵션 유지 가능.

### 2.7 facility_requests — 핵심
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id uuid PK / request_no UNIQUE | | FR-YYYYMMDD-#### 트리거 |
| store_id / category_id | FK | |
| symptom_code, title, description | | |
| status | text | PRD §6 상태머신 |
| requester_id | FK profiles | **OFC (요청 주체)** |
| fm_id | FK NULL | 셀프 접수 FM |
| partner_id / worker_id | FK NULL | 발주 협력사 / 지시받은 작업자 |
| quote_id | uuid FK NULL | 승인된 견적 |
| ai_precheck_id | FK NULL | |
| estimated_cost / final_cost | int | 예상(AI) / 확정(견적 승인) |
| **progress_pct** | smallint default 0 | 최신 진행율 (트리거 갱신) |
| preferred_visit tstzrange / scheduled_at | | 희망 / 확정 일정 |
| location | geometry(Point,4326) GIST | 점포 위치 복제 |
| claimed_at/ordered_at/quote_approved_at/work_started_at/work_done_at/confirmed_at/closed_at | timestamptz | FLOW 타임스탬프 |
| sla_due_at, rating smallint, created_at, updated_at | | |

인덱스: gist(location), (status), (category_id,status), (fm_id,status), (partner_id,status), (requester_id,created_at desc), (store_id,created_at desc), partial where status='OPEN_POOL'

### 2.8 quotes ⭐ — 견적 (DB가 확정값 SoT)
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id uuid PK / request_id FK | | |
| partner_id FK | | |
| round | smallint | 반려 재제출 회차 |
| items | jsonb | [{name, spec, qty, unit_price, amount, over_standard bool}] |
| total_amount | int | |
| status | text | DRAFT/SUBMITTED/APPROVED/REJECTED |
| decided_by FK / decided_at / reject_reason | | FM 승인 정보 |
| pdf_path | text NULL | 승인 시 시트 PDF 보관 |
| created_at | | |

### 2.9 quote_sheets ⭐ — 구글시트 메타
(id uuid PK, quote_id FK, request_id FK, **sheet_id text** (Google file id), sheet_url text, shared_email text, permission_state [WRITER/READONLY/REVOKED], template_version text, created_at, revoked_at)

### 2.10 standard_prices ⭐ — 표준 단가 (마스터 시트 동기화 사본)
(id, category_id FK, item_code, item_name, spec, unit, unit_price int, effective_from date, synced_at, source_sheet_id text)
UNIQUE(category_id, item_code, effective_from)

### 2.11 approvals (임계값 초과 건)
(id, request_id FK, step 1–4, position, approver_id FK, decision NULL[APPROVED/REJECTED], comment, decided_at) UNIQUE(request_id, step)

### 2.12 chat_messages / chat_reads / chat_participants
- chat_messages(id bigint identity, request_id FK, sender_id FK NULL(시스템), type[text/image/video/file/system/**quote/schedule/progress**], content, media_path, mentions uuid[], created_at)
- chat_reads(request_id, user_id, last_read_at) PK복합 / chat_participants(request_id, user_id, joined_at)

### 2.13 work_logs — 현장 이벤트
(id, request_id FK, worker_id FK, event [DEPART/ARRIVE/**START**/**DONE**], photo_paths text[], note, location geometry NULL, created_at)
> START insert → requests.status=IN_PROGRESS + work_started_at / DONE → WORK_DONE + work_done_at (트리거) → **지도 즉시 반영**

### 2.14 work_progress ⭐ — 당일 진행율
(id, request_id FK, worker_id FK, **pct smallint CHECK 0–100**, note, photo_paths text[], created_at)
> insert 트리거 → facility_requests.progress_pct 갱신 + chat 시스템 메시지 "진행율 50% — 배관 교체 중"

### 2.15 worker_locations (휘발, 72h cron 파기)
(request_id+worker_id PK, location geometry(Point,4326), updated_at)

### 2.16 이력 5테이블 (AI 사전 검토 원천 — v1 동일)
- store_facilities(①): store_id, category_id, equipment_name, model, install_date, lifespan_months, **warranty_until**, vendor, meta
- happy_calls(②): store_id, call_date, category_id, content, sentiment, result
- cost_history(③④): store_id, spent_at, type[INVEST/EXPENSE], category_id, amount, bearer, description, request_id NULL
- inspections(⑤): store_id, kind[COLD/SIGN/COFFEE], inspected_at, findings, action_needed, linked_request_id
- pre_maintenance_requests(⑥ 영선): store_id, requested_at, content, status, linked_request_id

### 2.17 ai_prechecks
(id, store_id, category_id, requested_by FK, input jsonb, result jsonb, opinion [적정/재검토권장/자가조치가능], model, tokens, created_at) — 캐시 키 (store,category,input hash,1h)

### 2.18 manuals / manual_acks
(id, category_id, symptom_code NULL, title, version, content_md, checklist jsonb, cost_bearer_rule jsonb, published_at, is_active) + acks(manual_id, user_id, acked_at)

### 2.19 page_registry / page_permissions / user_page_overrides ⭐
**page_registry**(page_key PK, name, group_name, sort) — 시드:
`map, request_new, my_requests(OFC), my_store(OWNER), pool(FM), case_detail, orders(FM발주), quotes, partner_board, worker_today, manuals, stats, reports, admin_users, admin_rules, admin_prices, admin_permissions, admin_manuals`

**page_permissions**(role, page_key FK, can_view bool, can_edit bool) PK(role,page_key)
**user_page_overrides**(user_id FK, page_key FK, can_view, can_edit, granted_by, granted_at) PK(user_id,page_key)
> 판정: override 존재 시 우선, 없으면 role 기본. 변경 시 audit + `perm:invalidate` broadcast

기본 매트릭스 시드(발췌):
| page_key | OWNER | OFC | FM | P_ADMIN | P_WORKER | ADMIN |
|---|---|---|---|---|---|---|
| map | ✅(본인점포) | ✅(담당군) | ✅전국 | ✅자사 | ✅배정건 | ✅ |
| request_new | ❌(토글) | ✅ | ❌ | ❌ | ❌ | ✅ |
| my_store | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| my_requests | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| pool / orders | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| quotes | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| partner_board | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| worker_today | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| stats/reports | ❌ | ❌ | 열람 | ❌ | ❌ | ✅ |
| admin_* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 2.20 partners
(id, name, biz_no, contact, **quote_email** (시트 공유 수신), contract_regions uuid[], contract_categories uuid[], is_active)

### 2.21 공통
notifications / push_subscriptions / audit_logs(actor, action, entity, before/after jsonb) / request_status_transitions(from,to,allowed_roles[])

## 3. 주요 RLS (v2 요약)

```sql
-- facility_requests SELECT (FLOW 열람 원칙)
create policy req_select on facility_requests for select using (
  auth_role()='ADMIN'
  or (auth_role()='OWNER' and store_id = any(auth_store_ids()))          -- 본인 점포
  or (auth_role()='OFC' and (requester_id = auth.uid()                    -- 본인 요청
       or store_region(store_id) = any(auth_region_ids())))               -- 담당군 열람
  or (auth_role()='FM' and (status='OPEN_POOL' or fm_id=auth.uid()))
  or (auth_role() like 'PARTNER%' and partner_id = auth_partner_id())
);

-- work_progress: 해당 건 열람자 전원 SELECT / 배정 작업자만 INSERT
-- quotes: FM(해당건)·해당 협력사·ADMIN
-- page_permissions: ADMIN만 write, 전체 read
```

## 4. 함수/트리거

| 이름 | 역할 |
|---|---|
| trg_request_no / trg_copy_location | 번호 생성 / 점포 좌표 복제 |
| trg_routing (AFTER INSERT) | OPEN_POOL 공개 + SLA + 알림 |
| trg_work_event | START/DONE → 상태·타임스탬프 전이 (지도 반영 원천) |
| trg_progress | work_progress → requests.progress_pct + 시스템 메시지 |
| trg_quote_threshold | 견적 제출 시 approval_threshold 초과면 approvals 생성 |
| trg_status_msg / trg_audit | 시스템 메시지 / 감사 |
| rpc get_map_requests(bbox,filters) / get_region_counts / claim_request | 지도·집계·셀프접수 |
| fn check_page_access(user, page) | middleware 보조 |
| cron purge_worker_locations / sla_reminder / revoke_closed_sheets | 파기·리마인더·시트 회수 |

## 5. 시드
regions 계층, 데모 점포 500 (실데이터 CSV 임포트 스크립트), categories 7+색상, routing_rules(임계값 300,000원 기본), page_registry+기본 매트릭스, manuals 샘플, standard_prices 샘플, TPL 시트 ID 환경변수
