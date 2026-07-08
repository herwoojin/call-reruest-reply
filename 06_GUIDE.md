# GUIDE — 시설ON (FacilON) v2
## 개발·배포·운영 가이드

- 문서 버전: v2.0

---

## 1. 개발 환경 세팅

### 1.1 준비물
- Node.js 20 LTS, pnpm, Supabase CLI
- 계정: Supabase, Vercel, GitHub, Anthropic API, **Google Cloud (Sheets/Drive API)**

### 1.2 설치
```bash
pnpm create next-app@14 facilon --typescript --tailwind --app
cd facilon && pnpm dlx shadcn@latest init   # 다크, slate
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add leaflet react-leaflet leaflet.markercluster && pnpm add -D @types/leaflet
pnpm add zustand @tanstack/react-query next-pwa recharts date-fns
pnpm add googleapis            # 서버 전용 (Sheets/Drive)
```

### 1.3 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL= / NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # 서버 전용
ANTHROPIC_API_KEY=                    # Edge Function 시크릿
GOOGLE_SERVICE_ACCOUNT_JSON=          # base64, Edge Function 시크릿 ⭐
SHEET_TPL_QUOTE_ID= / SHEET_TPL_PRICE_ID=   # 템플릿 시트 파일 ID ⭐
NEXT_PUBLIC_VAPID_PUBLIC_KEY= / VAPID_PRIVATE_KEY=
```

## 2. 구글시트 연동 세팅 ⭐ (T0-3 상세)

### 2.1 서비스 계정 방식 (권장)
1. Google Cloud Console → 프로젝트 생성 → **Google Sheets API, Google Drive API 활성화**
2. IAM → 서비스 계정 생성 → 키(JSON) 발급 → base64 인코딩하여 Supabase 시크릿 등록
3. 드라이브에 폴더 `FacilON견적` 생성 → 서비스 계정 이메일(`...@...iam.gserviceaccount.com`)에 **편집자 공유**
4. 폴더 안에 템플릿 2종 작성:
   - **TPL_견적서**: A1 영역 헤더(요청번호/점포명/카테고리/발주일 — 자동 기입 셀), 항목표(품목|규격|수량|단가|금액), 합계 셀 `=SUM()`, 협력사 확인란. 품목 열은 TPL_단가표 범위 **데이터 검증 드롭다운** 연결
   - **TPL_단가표**: 카테고리|품목코드|품목명|규격|단위|표준단가|적용일 — 관리자만 편집
5. 시트 파일 ID(URL의 `/d/{ID}/`)를 환경변수 등록

### 2.2 조직 정책 확인 사항
- Workspace에서 **외부 도메인 공유 허용** 여부 확인 (협력사 이메일에 공유 필요)
- 막혀 있으면 → **방식 B: GAS 웹앱** 전환: 시트 소유 계정에서 Apps Script `doPost` 웹앱 배포 (복제/기입/읽기 함수), Edge Function은 웹앱 URL만 호출, 토큰은 PropertiesService 관리

### 2.3 견적 흐름 운영 규칙
- 확정 금액의 원본은 항상 DB(quotes) — 시트는 교환 양식·증빙
- 승인 시: 시트 읽기전용 전환 + PDF 보관 / 종결 시: 협력사 접근 회수 (일 배치)
- 협력사 등록 시 `quote_email` 필수 입력·검증

## 3. 폴더 구조
```
app/
  (auth)/login
  (owner)/my-store
  (ofc)/home, request/new, my-requests
  (admin)/dashboard, permissions, users, rules, prices, manuals, stats
  (fm)/pool, my-cases, case/[id]
  (partner-admin)/board, quote/[id]
  (worker)/today, job/[id]
  api/ (map, requests, quotes, work, ai, admin...)
components/ map | chat | quote | approval | progress | ui
lib/ supabase, map-config, status-machine, page-access
supabase/ migrations, functions/{ai-precheck,routing-engine,sheet-quote,sheet-price-sync,push-notify,report-gen}
prompts/  public/(icons, manifest, .well-known/assetlinks.json)
```

## 4. 핵심 구현 주의사항

### 4.1 Leaflet + OSM
- `dynamic(import, {ssr:false})` 필수, 높이 `dvh`
- 타일: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` + attribution `© OpenStreetMap contributors`
- **OSM 타일 정책**: 공개 서버는 대량/상업 트래픽 제한 — 파일럿까지만 사용, 전국 오픈 시 `lib/map-config.ts`에서 OSM 기반 상용 타일 URL로 교체 (코드 변경 1곳)
- 진행율 링: DivIcon 내부 SVG `conic-gradient` 또는 `<circle stroke-dasharray>` — 리렌더 대신 DOM patch로 % 갱신

### 4.2 실시간
- 구독 채널: 지도(전역 filter), request:{id}(대화), worksite:{id}(위치)
- 페이지 이탈 시 unsubscribe, 재연결 시 뷰포트 재조회
- 진행율 갱신은 낙관적 UI (즉시 링 반영 → 실패 시 롤백)

### 4.3 상태 전이·권한
- status 직접 update 금지 → 전용 엔드포인트 (서버 전이표 검증)
- 화면 접근: middleware(page_permissions 캐시) + RLS 2중 — **둘 다 통과해야 데이터 표시**
- 권한 변경 후 `perm:invalidate` broadcast로 전 클라이언트 캐시 갱신

### 4.4 RLS 검증 루틴
- 역할별 테스트 JWT 6종으로 회귀 스크립트 (`scripts/rls-test.ts`)
- 특히: OWNER가 타 점포 건 조회 0건, OFC가 타인 요청 편집 불가, PARTNER가 타사 견적 접근 불가

## 5. PWA → APK (pwabuilder.com) ⭐

### 5.1 사전 체크
- [ ] HTTPS 프로덕션 URL / [ ] manifest 유효(standalone, 192/512+maskable) / [ ] SW 등록 / [ ] Lighthouse PWA 통과

### 5.2 절차
1. https://www.pwabuilder.com → URL 입력 → Start → 점수 보완
2. Package for Stores → **Android**
3. 옵션: Package ID `com.facilon.app`(변경 불가, 신중), App name 시설ON, Signing key **새로 생성 → keystore·비밀번호 안전 보관 (분실 시 업데이트 불가)**
4. Download → zip 내 `app-release-signed.apk`(사내 배포) + `.aab`(플레이스토어)

### 5.3 assetlinks.json (주소창 제거)
zip의 assetlinks.json(또는 SHA-256 지문) → `public/.well-known/assetlinks.json` 배치 → 재배포 → `https://도메인/.well-known/assetlinks.json` 확인 → APK 재설치 시 브라우저 UI 제거 확인

### 5.4 배포·업데이트
- 사내: APK 파일 배포(MDM/포털), "출처 불명 앱 허용" 안내 / 스토어: .aab 내부 테스트 트랙
- iOS: Safari 홈 화면 추가 배너 (16.4+ Web Push 지원)
- TWA 특성상 웹 배포만으로 즉시 갱신 — APK 재빌드는 아이콘/이름/권한 변경 시만

## 6. 운영 가이드

### 6.1 역할별 일상
- **ADMIN**: OPEN_POOL 장기 체류 확인·강제 배정 / 권한 매트릭스 분기 점검 / 단가표 개정 시 시트 수정 → 동기화 확인
- **FM**: 견적 초과 플래그 건 우선 검토, 매뉴얼 개정 서명
- **협력사**: 견적 시트 회신 SLA(24h), 일정 확정 즉시 등록 (경영주 알림 자동)

### 6.2 데이터 적재
- 이력 6종 CSV 포맷 정의서(UTF-8, 날짜 YYYY-MM-DD, 열 고정) → `scripts/import-*.ts` 월 배치 + 실패 행 리포트

### 6.3 장애 대응
| 증상 | 조치 |
|---|---|
| 지도 타일 미표시 | 타일 제공자 상태 → map-config 대체 타일 전환 |
| 시트 생성/공유 실패 | Google API 쿼터·공유 정책 확인 → xlsx 폴백 안내 |
| 진행율 미반영 | Realtime 상태 확인, 새로고침 공지, work_progress 적재 여부 확인 |
| AI 검토 오류 | fallback 자동 노출 — Anthropic 상태·토큰 확인 |
| 푸시 미수신 | 구독 만료 정리, iOS 홈화면 설치 안내 |

### 6.4 보안 점검 (분기)
RLS 회귀 / 권한 매트릭스 감사 / service_role·구글 키 로테이션 / 종결 건 시트 접근 회수 확인 / 위치 파기 cron 확인
