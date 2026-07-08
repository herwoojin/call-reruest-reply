# TRD — 시설ON (FacilON) v2
## 기술 요구사항 정의서

- 문서 버전: v2.0 (구글시트 견적 연동, 진행율 실시간, 화면 권한 매트릭스 추가)
- 기준: 01_PRD.md v2

---

## 1. 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 14 (App Router) + TypeScript | Vercel |
| UI | Tailwind CSS + shadcn/ui | 다크 모바일 퍼스트 |
| 지도 | **Leaflet + OpenStreetMap 타일 (openstreetmap.org)** + react-leaflet + leaflet.markercluster | © OpenStreetMap contributors 표기 |
| 상태 | Zustand + TanStack Query | |
| 백엔드 | Supabase (PostgreSQL + PostGIS, RLS, Realtime, Storage, Edge Functions) | |
| **견적/단가** | **Google Sheets API v4 + Google Drive API v3** (서비스 계정) 또는 GAS 웹앱 대안 | §3.6 |
| AI | Anthropic Claude API (사전 검토·매뉴얼 검색) | Edge Function 경유 |
| 푸시 | Web Push (VAPID) | |
| PWA | next-pwa + manifest → pwabuilder.com TWA | |
| 차트 | Recharts / 리포트 SheetJS | |

## 2. 아키텍처

```
[PWA 클라이언트]
 ├ OSM 지도 레이어 (핀=카테고리색, 상태 뱃지, 진행율 링)
 ├ Realtime 구독: requests / progress / chat / worker presence
 └ Service Worker (오프라인 셸, Web Push)
      │
[Vercel Next.js] ─ Route Handlers (BFF, 화면권한 middleware)
      │
[Supabase]
 ├ PostgreSQL+PostGIS (RLS + page_permissions)
 ├ Realtime (map, request:{id}, worksite:{id})
 ├ Storage (media/, signatures/)
 └ Edge Functions
    ├ ai-precheck        # 6종 이력 → Claude 브리핑
    ├ routing-engine     # 풀 공개·결재선(임계값)·SLA
    ├ sheet-quote        # ⭐ 견적 시트 복제·공유·값 읽기·검증
    ├ sheet-price-sync   # ⭐ 마스터 단가 시트 주기 동기화
    ├ push-notify / report-gen
      │
[외부] Anthropic API / Google Sheets·Drive API / (배치) 이력 CSV
```

## 3. 핵심 기술 설계

### 3.1 지도 (OpenStreetMap 확정)
- 타일: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` — `lib/map-config.ts`에 추상화 (오픈 확대 시 MapTiler 등 OSM 기반 상용 타일로 URL만 교체). Attribution 필수 표기
- 줌 분기: ≤9 서버 집계 버블 / 10–13 markercluster / ≥14 개별 DivIcon
- **핀 DivIcon 구성**: 바탕원 = `categories.color_hex`, 오버레이 = 상태
  - SUBMITTED/OPEN_POOL: 점선 링
  - CLAIMED~SCHEDULED: 모래시계 뱃지
  - **IN_PROGRESS: 펄스 애니메이션 + SVG 원형 진행율 링(conic, `progress_pct`)**
  - WORK_DONE~CLOSED: 체크 뱃지
- **작업시작/완료 즉시 반영**: `facility_requests`(status)와 `work_progress`(pct) Postgres Changes 구독 → 해당 핀만 patch
- 역할별 지도 데이터 범위는 RLS가 자동 제한 (동일 RPC 사용)

### 3.2 실시간 진행율 파이프라인
```
작업자 [진행율 50%] 탭
 → insert work_progress(request_id, pct, note, photo)
 → 트리거: facility_requests.progress_pct 갱신 + chat 시스템 메시지
 → Realtime → 지도 핀 링 / 경영주 홈 게이지 / OFC 스텝퍼 동시 갱신 (2초 내)
```

### 3.3 화면별 권한 매트릭스 (F10)
- `page_permissions(role, page_key, can_view, can_edit)` + `user_page_overrides(user_id, page_key, can_view, can_edit)`
- `page_registry`: 페이지 목록 시드 (map, request_new, pool, orders, quotes, partner_board, worker_today, my_store, my_requests, manuals, stats, admin_users, admin_rules, admin_permissions...)
- 검사 2중화:
  1. Next.js middleware: 세션 role → 서버 캐시된 매트릭스로 라우트 차단 (미허용 시 403 페이지)
  2. RLS: 데이터 레벨 최종 방어
- ADMIN 설정 UI: 역할×페이지 체크박스 그리드 + 사용자 검색 예외 부여, 변경 시 audit_logs + 캐시 무효화(Realtime broadcast `perm:invalidate`)

### 3.4 FM 셀프 접수 (동시성)
```sql
update facility_requests set fm_id=:me, status='CLAIMED', claimed_at=now()
where id=:id and status='OPEN_POOL';  -- 0행이면 선점됨
```

### 3.5 결재 (임계값 조건부)
- `routing_rules.approval_threshold` — 예상비용(견적 전) 또는 견적금액이 임계값 초과 시 approvals 4단계 생성, 이하 FM 전결
- 견적 승인 시점에 금액 확정되므로 **QUOTED 상태에서 임계값 재평가** (견적이 임계값 초과로 올라오면 결재 라인 소급 생성)

### 3.6 구글시트 견적/단가 연동 ⭐ (sheet-quote / sheet-price-sync)

**방식 A (권장): 서비스 계정 + Sheets/Drive API**
1. Google Cloud 프로젝트 → Sheets API·Drive API 활성화 → 서비스 계정 키(JSON) → Supabase Edge Function 시크릿 저장
2. 템플릿 시트 2종을 서비스 계정 소유 드라이브 폴더에 준비
   - `TPL_견적서`: 헤더(요청번호/점포/카테고리), 항목표(품목·규격·수량·단가·금액), 합계, 협력사 서명란 — **품목·단가 열은 마스터 단가표 데이터 검증(dropdown) 연결**
   - `TPL_단가표`: 카테고리별 표준 품목·단가 (관리자 편집 마스터)
3. 발주 시 흐름:
   - `drive.files.copy(TPL_견적서)` → 파일명 `견적_FR-20260707-0341_협력사명`
   - `values.update`로 요청 정보 자동 기입
   - `permissions.create`로 협력사 관리자 이메일에 writer 공유 (도메인 외부 공유 정책 확인)
   - 링크를 `quote_sheets` 저장 + 대화창 시스템 메시지 첨부
4. 협력사 [견적 제출] 클릭 → `values.get`으로 항목·합계 파싱 → `quotes` 테이블 반영 → **단가 검증**: 마스터 단가 초과 항목 플래그
5. FM 승인 → 시트 보호(읽기 전용 전환 `permissions.update`) + PDF 내보내기(`files.export`) Storage 보관
6. `sheet-price-sync`: pg_cron 1시간 주기 마스터 단가표 → `standard_prices` 테이블 동기화

**방식 B (대안): GAS 웹앱** — Workspace 외부 API 사용이 막힌 경우, 사용자 보유 GAS 경험 활용해 시트 측 doPost 웹앱으로 복제/기입/읽기를 위임 (Edge Function은 GAS URL 호출만). PropertiesService로 시크릿 관리

**공통 규칙**
- 시트가 SoT(원본)가 아니라 **교환 양식**: 확정 수치는 항상 DB(quotes)에 저장, 시트는 증빙 보관
- 공유 범위 최소화: 건별 시트는 해당 협력사 계정만, 종결 시 접근 회수
- API 실패 대비: 시트 생성 실패 시 수동 업로드(xlsx) 폴백 경로 제공

### 3.7 AI 사전 검토
- v1과 동일 (6종 이력 → Claude → JSON: 이력요약/보증여부/유사건/예상비용/의견) + 1h 캐시, 결과는 요청 건·결재 화면에 첨부

### 3.8 채팅 / 위치
- 건별 Broadcast + chat_messages, 시스템 메시지(접수/발주/견적/일정/시작/진행율/완료 자동 기록)
- 작업자 위치: 작업시작 동의 → watchPosition 30s → Presence `worksite:{id}` → 최신만 worker_locations upsert, 72h cron 파기

### 3.9 PWA/APK
- manifest(standalone, theme #0B1220, 192/512 maskable) + Workbox(앱 셸 precache, OSM 타일 CacheFirst 500장/30일, API NetworkFirst)
- HTTPS 배포 → pwabuilder.com → Android TWA(APK/AAB) + `/.well-known/assetlinks.json` (GUIDE §5)

## 4. API 설계 (v2 변경분 포함)

| Method | Path | 설명 | 권한 |
|---|---|---|---|
| GET | /api/map/requests?bbox= | 뷰포트 핀 (RLS 범위 자동) | 로그인 |
| POST | /api/requests | OFC 요청 생성 | OFC |
| POST | /api/requests/:id/claim | FM 셀프 접수 | FM |
| POST | /api/requests/:id/order | 협력사 발주 + 견적 시트 발행 | FM |
| POST | /api/quotes/:id/submit | 견적 제출(시트 파싱) | PARTNER_ADMIN |
| POST | /api/quotes/:id/decide | 견적 승인/반려 | FM |
| POST | /api/requests/:id/assign-worker | 작업자 지시·일정 | PARTNER_ADMIN |
| POST | /api/work/:id/event | 출발/도착/시작/완료 (+사진) | PARTNER_WORKER |
| POST | /api/work/:id/progress | **진행율 % 보고** | PARTNER_WORKER |
| POST | /api/requests/:id/confirm | 경영주 확인·평가 | OWNER |
| GET/PUT | /api/admin/permissions | 화면 권한 매트릭스 | ADMIN |
| POST | /api/ai/precheck | AI 사전 검토 | OFC |
| GET | /api/stats/overview | 통계 | 권한 매트릭스 |

## 5. 상태 머신 (서버 검증 전용)
PRD §6 참조. 전이표 `request_status_transitions(from,to,allowed_roles)` — 클라이언트 직접 update 금지, `/status`·전용 엔드포인트만.

## 6. 보안
- 전 테이블 RLS + 화면 권한 매트릭스 2중, service_role은 Edge Function만
- 구글 서비스 계정 키·VAPID·Anthropic 키는 Supabase 시크릿
- 시트 외부 공유는 협력사 등록 이메일만, 종결 시 회수 잡
- audit_logs 트리거 (권한 변경·견적 승인 포함) 3년 보존

## 7. 배포/운영
- dev/staging/prod 분리, GitHub Actions(lint·typecheck·마이그레이션 검증)→Vercel
- pg_cron: worker_locations 파기(매시) / sla_reminder(30분) / sheet-price-sync(1h) / 시트 접근 회수(일)
- 모니터링: Sentry + Supabase 로그 + Google API 쿼터 알림
