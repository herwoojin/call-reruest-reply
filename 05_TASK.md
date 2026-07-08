# TASK — 시설ON (FacilON) v2
## 작업 분해 구조 (WBS)

- 문서 버전: v2.0 | ⬜대기/🔄진행/✅완료 | ★난이도 | [의존]

---

## Phase 0. 셋업 (0.5주)
- ⬜ T0-1 (★1) Next.js 14+TS+Tailwind+shadcn 초기화, 다크 토큰
- ⬜ T0-2 (★1) Supabase dev/prod, postgis·pg_net·pg_cron 활성화
- ⬜ T0-3 (★1) **Google Cloud 프로젝트: Sheets/Drive API 활성화, 서비스 계정 키 발급, 템플릿 시트 2종(TPL_견적서/TPL_단가표) 생성** ⭐
- ⬜ T0-4 (★1) GitHub+Vercel, .env 체계, ESLint/CI
- ⬜ T0-5 (★1) 폴더 구조: app/(owner|ofc|admin|fm|partner-admin|worker)

## Phase 1. 데이터 기반 (1.5주)
- ⬜ T1-1 (★2) regions/stores/profiles/categories + GIST
- ⬜ T1-2 (★2) facility_requests(progress_pct 포함) + 상태머신 표 + 번호 트리거
- ⬜ T1-3 (★2) **quotes / quote_sheets / standard_prices** ⭐
- ⬜ T1-4 (★2) approvals / chat 3테이블 / work_logs / **work_progress** / worker_locations
- ⬜ T1-5 (★2) 이력 5테이블 + ai_prechecks / manuals / partners
- ⬜ T1-6 (★2) **page_registry / page_permissions / user_page_overrides + 기본 매트릭스 시드** ⭐
- ⬜ T1-7 (★3) helper 함수 + 전 테이블 RLS (FLOW 열람 원칙 반영) 작성·테스트
- ⬜ T1-8 (★2) 트리거: trg_work_event(시작/완료→상태), trg_progress(%갱신), trg_quote_threshold, 시스템 메시지, audit
- ⬜ T1-9 (★2) RPC: get_map_requests / get_region_counts / claim_request
- ⬜ T1-10 (★1) 시드 + 점포 18,000 CSV 임포트 스크립트

## Phase 2. 인증 & 권한 매트릭스 (1주)
- ⬜ T2-1 (★2) Supabase Auth + 역할 클레임 (Auth Hook)
- ⬜ T2-2 (★3) **middleware 화면 권한 검사 (매트릭스 캐시 + perm:invalidate 무효화)** ⭐
- ⬜ T2-3 (★2) **ADMIN 권한 매트릭스 그리드 UI + 사용자 예외 부여** ⭐
- ⬜ T2-4 (★2) ADMIN 사용자 관리 (역할·지역·협력사 매핑)

## Phase 3. 지도 (2주) ⭐
- ⬜ T3-1 (★2) OSM Leaflet 베이스 (openstreetmap.org 타일, attribution, map-config 추상화)
- ⬜ T3-2 (★3) 줌 분기: 집계 버블 / cluster / 개별 핀
- ⬜ T3-3 (★3) DivIcon: 카테고리색 + 상태 오버레이 + **IN_PROGRESS 진행율 링(%)**
- ⬜ T3-4 (★2) 필터바 + URL 동기화
- ⬜ T3-5 (★3) Realtime 구독(status·progress_pct) → 핀 patch — **작업시작/완료 즉시 반영 검증**
- ⬜ T3-6 (★2) 요약 카드 → 상세 진입, OWNER 자동 센터링
- ⬜ T3-7 (★2) 성능: 핀 3,000개 60fps

## Phase 4. OFC 요청 + AI (1.5주)
- ⬜ T4-1 (★2) 요청 위저드 4단계 (점포 검색→카테고리→AI→상세)
- ⬜ T4-2 (★3) ai-precheck Edge Function (6종 취합→Claude→캐시·fallback)
- ⬜ T4-3 (★2) AI 브리핑 카드 UI + 중복 감지
- ⬜ T4-4 (★2) **OFC my-requests 스텝퍼 화면 (본인 요청 추적)** ⭐
- ⬜ T4-5 (★2) 이미지 WebP 업로드 파이프라인

## Phase 5. FM 접수 → 발주 → 견적 (2.5주) ⭐핵심
- ⬜ T5-1 (★2) FM 풀 화면 + claim (경합 처리) + 상한
- ⬜ T5-2 (★2) 케이스 화면: 매뉴얼 자동 표시·체크리스트
- ⬜ T5-3 (★3) [T0-3] **sheet-quote Edge Function: 시트 복제→기입→공유→링크 저장** 
- ⬜ T5-4 (★3) **견적 파싱(values.get)→quotes 반영→단가 초과 플래그**
- ⬜ T5-5 (★2) FM 견적 승인/반려 UI (초과 행 경고, PDF 보관, 시트 읽기전용 전환)
- ⬜ T5-6 (★2) **sheet-price-sync (마스터 단가 1h 동기화) + ADMIN 단가 화면**
- ⬜ T5-7 (★2) 임계값 초과 결재 4단계 (합의/반려·타임라인·리마인더)
- ⬜ T5-8 (★1) 시트 실패 시 xlsx 수동 업로드 폴백

## Phase 6. 대화창 (1주)
- ⬜ T6-1 (★3) RequestChat (Broadcast+DB, 무한스크롤, 읽음, 멘션)
- ⬜ T6-2 (★2) 미디어 + 시스템 메시지(발주/견적/일정/시작/진행율/완료)
- ⬜ T6-3 (★2) 알림 연동 (notifications+푸시)

## Phase 7. 협력사 & 작업자 & 경영주 (2.5주)
- ⬜ T7-1 (★2) PARTNER_ADMIN 칸반 + **작업자 업무지시·일정 확정 → 경영주/OFC 알림** ⭐
- ⬜ T7-2 (★2) 작업자 today 화면 + OSM 길찾기
- ⬜ T7-3 (★3) 상태 버튼 4단계 + 사진 강제 + work_logs → **지도 반영 E2E 확인**
- ⬜ T7-4 (★2) **진행율 위젯(25/50/75/100+슬라이더) → work_progress → 실시간 전파** ⭐
- ⬜ T7-5 (★3) 위치 공유 (동의→watchPosition→Presence→지도 레이어→72h 파기)
- ⬜ T7-6 (★2) **경영주 my-store: 일정 D-day + 진행율 게이지 + 사진 타임라인 + 대화** ⭐
- ⬜ T7-7 (★2) 완료 서명 캔버스 → 확인 → 별점 평가 → CLOSED

## Phase 8. 매뉴얼 & 통계 (1주)
- ⬜ T8-1 (★2) 매뉴얼 CRUD·버전·개정 서명 + AI 검색
- ⬜ T8-2 (★2) 통계 대시보드 (건수·SLA·비용·분산·AI 효과) + 월간 xlsx

## Phase 9. PWA & APK (1주)
- ⬜ T9-1 (★2) next-pwa + manifest + 아이콘 + 타일 캐시
- ⬜ T9-2 (★3) Web Push 구독·발송 + 알림 설정
- ⬜ T9-3 (★1) Lighthouse PWA/성능 90+
- ⬜ T9-4 (★2) **pwabuilder.com APK + assetlinks.json + 실기기 테스트** (GUIDE §5)
- ⬜ T9-5 (★1) prod 배포·도메인·Sentry

## Phase 10. QA & 파일럿 (1주)
- ⬜ T10-1 (★2) **FLOW 전체 E2E: OFC요청→FM접수→발주→시트견적→승인→지시→시작→진행율→완료→경영주확인** ⭐
- ⬜ T10-2 (★2) 동시성(셀프접수)·RLS·권한매트릭스 침투 테스트
- ⬜ T10-3 (★2) 구글시트 장애 시나리오 (API 쿼터·공유 실패·폴백)
- ⬜ T10-4 (★1) 파일럿 1지역 2주 → 개선 반영 → 전국 오픈 체크

---

## 마일스톤
| M | 완료 기준 | 누적 |
|---|---|---|
| M1 | P0–1 데이터·권한 기반 | 2주 |
| M2 | P2–3 지도 시연 (진행율 링 포함) | 5주 |
| M3 | P4–5 요청→발주→시트 견적→승인 완결 | 9주 |
| M4 | P6–7 지시→작업→진행율→경영주 확인 완결 | 13주 |
| M5 | P8–10 PWA/APK + 파일럿 | 16주 |

## 리스크
| 리스크 | 대응 |
|---|---|
| OSM 공개 타일 트래픽 정책 | 파일럿 공개 타일+캐시, 전국 오픈 전 OSM 기반 상용 타일 전환 (map-config 1시간 교체) |
| 구글시트 외부 공유 정책 (Workspace 제한) | 사전 T0-3에서 정책 확인, 막히면 GAS 웹앱 방식(방식 B) 전환 |
| Sheets API 쿼터 | 건별 캐시·배치, 폴백 xlsx (T5-8) |
| 셀프 접수 쏠림 | 상한+강제배정+처리량 지표 |
| iOS 푸시 | 16.4+ 홈화면 설치 안내, 미지원 폴백 알림센터 |
