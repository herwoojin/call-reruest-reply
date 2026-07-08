import type { RequestStatus, Role } from "./status-machine";
import type { PageKey } from "./page-access";

/**
 * Phase UI: Firebase 연결 전 목업 데이터.
 * 이후 Firestore 컬렉션(stores, facility_requests, quotes, chat_messages...)으로 1:1 치환.
 */

// ── 카테고리 (PRD F1-2 핀 색상)
export interface Category {
  code: string;
  name: string;
  colorHex: string;
}

export const CATEGORIES: Category[] = [
  { code: "COLD", name: "냉장·냉동", colorHex: "#3B82F6" },
  { code: "SIGN", name: "간판", colorHex: "#F97316" },
  { code: "COFFEE", name: "커피머신", colorHex: "#8B5A2B" },
  { code: "ELEC", name: "전기", colorHex: "#EAB308" },
  { code: "INTERIOR", name: "인테리어·영선", colorHex: "#22C55E" },
  { code: "PLUMB", name: "누수·배관", colorHex: "#38BDF8" },
  { code: "ETC", name: "기타", colorHex: "#94A3B8" },
];

export const categoryOf = (code: string) =>
  CATEGORIES.find((c) => c.code === code) ?? CATEGORIES[6];

// ── 점포
export interface StoreInfo {
  id: string;
  storeCode: string;
  name: string;
  region: string;
  address: string;
  lat: number;
  lng: number;
  ownerName: string;
  ofcName: string;
}

export const STORES: StoreInfo[] = [
  { id: "S001", storeCode: "10231", name: "강남테헤란점", region: "서울", address: "서울 강남구 테헤란로 152", lat: 37.4995, lng: 127.0284, ownerName: "정점주", ofcName: "박운영" },
  { id: "S002", storeCode: "10547", name: "마포서교점", region: "서울", address: "서울 마포구 양화로 78", lat: 37.5551, lng: 126.9139, ownerName: "한사장", ofcName: "박운영" },
  { id: "S003", storeCode: "20112", name: "인천부평역점", region: "인천", address: "인천 부평구 부평대로 33", lat: 37.5072, lng: 126.7218, ownerName: "오점주", ofcName: "박운영" },
  { id: "S004", storeCode: "20388", name: "수원영통점", region: "경기", address: "경기 수원시 영통구 봉영로 415", lat: 37.2513, lng: 127.0713, ownerName: "임사장", ofcName: "박운영" },
  { id: "S005", storeCode: "30271", name: "대전둔산점", region: "대전", address: "대전 서구 둔산로 201", lat: 36.3512, lng: 127.3846, ownerName: "송점주", ofcName: "김충청" },
  { id: "S006", storeCode: "40195", name: "대구동성로점", region: "대구", address: "대구 중구 동성로 25", lat: 35.8692, lng: 128.5955, ownerName: "배사장", ofcName: "이영남" },
  { id: "S007", storeCode: "50033", name: "부산서면점", region: "부산", address: "부산 부산진구 중앙대로 692", lat: 35.1574, lng: 129.0594, ownerName: "황점주", ofcName: "이영남" },
  { id: "S008", storeCode: "60412", name: "광주상무점", region: "광주", address: "광주 서구 상무중앙로 84", lat: 35.1524, lng: 126.8514, ownerName: "문사장", ofcName: "최호남" },
  { id: "S009", storeCode: "60518", name: "전주효자점", region: "전북", address: "전북 전주시 완산구 효자로 225", lat: 35.8102, lng: 127.1129, ownerName: "유점주", ofcName: "최호남" },
  { id: "S010", storeCode: "70108", name: "강릉교동점", region: "강원", address: "강원 강릉시 경강로 2100", lat: 37.7645, lng: 128.9012, ownerName: "신사장", ofcName: "김강원" },
];

export const storeOf = (id: string) => STORES.find((s) => s.id === id)!;

// ── 데모 페르소나 (로그인 연결 전 역할 체험용)
export const PERSONAS = {
  OWNER: { name: "정점주", storeId: "S001" },
  OFC: { name: "박운영" },
  FM: { name: "김시설", capacity: 10 },
  PARTNER_ADMIN: { name: "이협력", company: "쿨테크서비스" },
  PARTNER_WORKER: { name: "최기사", company: "쿨테크서비스" },
  ADMIN: { name: "본부관리자" },
} as const;

export const PARTNERS = [
  { id: "P01", name: "쿨테크서비스", categories: ["COLD", "COFFEE"], regions: ["서울", "경기", "인천"] },
  { id: "P02", name: "한빛사인", categories: ["SIGN", "ELEC"], regions: ["전국"] },
  { id: "P03", name: "우리설비", categories: ["PLUMB", "INTERIOR"], regions: ["전국"] },
];

// ── 견적
export interface QuoteItem {
  name: string;
  spec: string;
  qty: number;
  unitPrice: number;
  amount: number;
  overStandard: boolean;
}

export interface Quote {
  id: string;
  requestId: string;
  partnerName: string;
  round: number;
  items: QuoteItem[];
  totalAmount: number;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  sheetUrl: string;
  rejectReason?: string;
}

// ── 대화
export type ChatType = "text" | "system" | "progress" | "quote" | "schedule";
export interface ChatMessage {
  id: number;
  requestId: string;
  sender: string | null; // null = 시스템
  senderRole?: Role;
  type: ChatType;
  content: string;
  at: string; // "07-07 14:30"
}

// ── 작업 사진 (목업: 그라디언트 placeholder)
export interface WorkPhoto {
  id: string;
  label: string;
  phase: "전" | "중" | "후";
  gradient: string;
  at: string;
}

export type WorkEvent = "NONE" | "DEPART" | "ARRIVE" | "START" | "DONE";

// ── 요청 건
export interface FacilityRequest {
  id: string;
  requestNo: string;
  storeId: string;
  categoryCode: string;
  title: string;
  description: string;
  status: RequestStatus;
  progressPct: number;
  requesterName: string; // OFC
  fmName?: string;
  partnerName?: string;
  workerName?: string;
  workEvent: WorkEvent;
  estimatedCost?: number;
  finalCost?: number;
  preferredDate?: string;
  scheduledAt?: string;
  createdAt: string;
  photos: WorkPhoto[];
  rating?: number;
  delayed?: boolean;
  approvalRequired?: boolean;
}

const G = [
  "linear-gradient(135deg,#1e3a5f,#2d6a8f)",
  "linear-gradient(135deg,#3f2d5f,#6a4a8f)",
  "linear-gradient(135deg,#2d5f3a,#4a8f6a)",
  "linear-gradient(135deg,#5f3a2d,#8f6a4a)",
];

export const INITIAL_REQUESTS: FacilityRequest[] = [
  { id: "R001", requestNo: "FR-20260708-0001", storeId: "S002", categoryCode: "COLD", title: "워크인 냉장고 온도 이상", description: "설정 3℃인데 실제 8℃까지 상승, 음료 진열대 이슬 맺힘.", status: "OPEN_POOL", progressPct: 0, requesterName: "박운영", workEvent: "NONE", estimatedCost: 180000, preferredDate: "07-10 오전", createdAt: "07-08 09:12", photos: [] },
  { id: "R002", requestNo: "FR-20260708-0002", storeId: "S005", categoryCode: "SIGN", title: "간판 LED 부분 소등", description: "전면 간판 우측 1/3 소등. 야간 시인성 저하.", status: "OPEN_POOL", progressPct: 0, requesterName: "김충청", workEvent: "NONE", estimatedCost: 250000, preferredDate: "07-11", createdAt: "07-08 08:40", photos: [] },
  { id: "R003", requestNo: "FR-20260706-0031", storeId: "S007", categoryCode: "PLUMB", title: "창고 천장 누수", description: "장마철 우천 시 창고 천장에서 물방울 낙하, 박스 젖음.", status: "OPEN_POOL", progressPct: 0, requesterName: "이영남", workEvent: "NONE", estimatedCost: 400000, preferredDate: "07-09", createdAt: "07-06 15:02", photos: [], delayed: true },
  { id: "R004", requestNo: "FR-20260707-0018", storeId: "S003", categoryCode: "ELEC", title: "카운터 콘센트 스파크", description: "POS 뒤 콘센트에서 플러그 삽입 시 스파크 발생. 사용 중지 조치함.", status: "CLAIMED", progressPct: 0, requesterName: "박운영", fmName: "김시설", workEvent: "NONE", estimatedCost: 120000, preferredDate: "07-09 오후", createdAt: "07-07 11:25", photos: [] },
  { id: "R005", requestNo: "FR-20260707-0021", storeId: "S004", categoryCode: "COFFEE", title: "커피머신 추출 불량", description: "에스프레소 추출 시간이 2배로 늘고 크레마 없음. 정기 청소는 완료 상태.", status: "ORDERED", progressPct: 0, requesterName: "박운영", fmName: "김시설", partnerName: "쿨테크서비스", workEvent: "NONE", estimatedCost: 200000, preferredDate: "07-10", createdAt: "07-07 13:44", photos: [] },
  { id: "R006", requestNo: "FR-20260706-0027", storeId: "S006", categoryCode: "COLD", title: "오픈쇼케이스 컴프레서 소음", description: "심야 소음 민원 발생 수준의 컴프레서 이상음. 냉기 유지됨.", status: "QUOTED", progressPct: 0, requesterName: "이영남", fmName: "김시설", partnerName: "쿨테크서비스", workEvent: "NONE", estimatedCost: 450000, preferredDate: "07-12", createdAt: "07-06 10:18", photos: [], approvalRequired: true },
  { id: "R007", requestNo: "FR-20260705-0044", storeId: "S008", categoryCode: "INTERIOR", title: "출입문 자동문 오작동", description: "센서 감지 지연으로 문이 늦게 열림. 고객 충돌 위험.", status: "QUOTE_APPROVED", progressPct: 0, requesterName: "최호남", fmName: "김시설", partnerName: "우리설비", workEvent: "NONE", finalCost: 280000, preferredDate: "07-09", createdAt: "07-05 09:30", photos: [] },
  { id: "R008", requestNo: "FR-20260705-0046", storeId: "S009", categoryCode: "SIGN", title: "돌출간판 흔들림", description: "바람 불면 돌출간판이 흔들림. 고정 브래킷 점검 필요.", status: "SCHEDULED", progressPct: 0, requesterName: "박운영", fmName: "김시설", partnerName: "한빛사인", workerName: "최기사", workEvent: "NONE", finalCost: 150000, scheduledAt: "07-10 10:00", createdAt: "07-05 14:11", photos: [] },
  { id: "R009", requestNo: "FR-20260704-0052", storeId: "S001", categoryCode: "COLD", title: "냉동고 성에 과다·냉각 저하", description: "아이스크림 냉동고 성에 과다, 온도 -12℃까지밖에 안 내려감.", status: "IN_PROGRESS", progressPct: 50, requesterName: "박운영", fmName: "김시설", partnerName: "쿨테크서비스", workerName: "최기사", workEvent: "START", finalCost: 320000, scheduledAt: "07-08 09:00", createdAt: "07-04 10:05", photos: [ { id: "PH1", label: "작업 전 성에 상태", phase: "전", gradient: G[0], at: "07-08 09:05" }, { id: "PH2", label: "히터 코일 교체 중", phase: "중", gradient: G[1], at: "07-08 11:30" } ] },
  { id: "R010", requestNo: "FR-20260704-0058", storeId: "S010", categoryCode: "ELEC", title: "매장 조명 절반 소등", description: "천장 LED 라인 절반이 꺼짐. 안정기 불량 추정.", status: "IN_PROGRESS", progressPct: 75, requesterName: "김강원", fmName: "김시설", partnerName: "한빛사인", workerName: "최기사", workEvent: "START", finalCost: 190000, scheduledAt: "07-08 14:00", createdAt: "07-04 16:40", photos: [ { id: "PH3", label: "안정기 교체 전", phase: "전", gradient: G[2], at: "07-08 14:10" } ] },
  { id: "R011", requestNo: "FR-20260703-0061", storeId: "S002", categoryCode: "PLUMB", title: "화장실 배수 역류", description: "화장실 바닥 배수구 역류. 임시 마감 조치 완료.", status: "WORK_DONE", progressPct: 100, requesterName: "박운영", fmName: "김시설", partnerName: "우리설비", workerName: "최기사", workEvent: "DONE", finalCost: 220000, scheduledAt: "07-07 13:00", createdAt: "07-03 09:55", photos: [ { id: "PH4", label: "배관 세척 전", phase: "전", gradient: G[3], at: "07-07 13:10" }, { id: "PH5", label: "고압 세척 작업", phase: "중", gradient: G[0], at: "07-07 14:20" }, { id: "PH6", label: "작업 완료 확인", phase: "후", gradient: G[2], at: "07-07 15:40" } ] },
  { id: "R012", requestNo: "FR-20260628-0083", storeId: "S001", categoryCode: "INTERIOR", title: "진열대 선반 파손 교체", description: "음료 진열대 2단 선반 파손 교체 완료 건.", status: "CLOSED", progressPct: 100, requesterName: "박운영", fmName: "김시설", partnerName: "우리설비", workerName: "최기사", workEvent: "DONE", finalCost: 90000, scheduledAt: "06-30 10:00", createdAt: "06-28 11:00", photos: [ { id: "PH7", label: "교체 완료", phase: "후", gradient: G[1], at: "06-30 11:20" } ], rating: 5 },
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: "Q005", requestId: "R005", partnerName: "쿨테크서비스", round: 1, status: "DRAFT",
    sheetUrl: "https://docs.google.com/spreadsheets/d/TPL_DEMO_R005",
    items: [
      { name: "추출 유닛 분해 정비", spec: "그룹헤드 O링 포함", qty: 1, unitPrice: 120000, amount: 120000, overStandard: false },
      { name: "정수 필터 교체", spec: "CF-200", qty: 1, unitPrice: 45000, amount: 45000, overStandard: false },
    ],
    totalAmount: 165000,
  },
  {
    id: "Q006", requestId: "R006", partnerName: "쿨테크서비스", round: 1, status: "SUBMITTED",
    sheetUrl: "https://docs.google.com/spreadsheets/d/TPL_DEMO_R006",
    items: [
      { name: "컴프레서 교체", spec: "1.5HP 저소음형", qty: 1, unitPrice: 380000, amount: 380000, overStandard: true },
      { name: "냉매 충전", spec: "R-404A 2kg", qty: 1, unitPrice: 60000, amount: 60000, overStandard: false },
      { name: "출장비", spec: "대구권", qty: 1, unitPrice: 30000, amount: 30000, overStandard: false },
    ],
    totalAmount: 470000,
  },
];

// ── 결재 (임계값 30만원 초과 건 — R006)
export interface ApprovalStep {
  step: number;
  position: string;
  approver: string;
  decision: "APPROVED" | "REJECTED" | null;
  at?: string;
}

export const INITIAL_APPROVALS: Record<string, ApprovalStep[]> = {
  R006: [
    { step: 1, position: "파트장", approver: "강파트", decision: "APPROVED", at: "07-07 09:10" },
    { step: 2, position: "영업팀장", approver: "조팀장", decision: null },
    { step: 3, position: "지역장", approver: "윤지역", decision: null },
    { step: 4, position: "부담당자", approver: "서부장", decision: null },
  ],
};

export const INITIAL_CHATS: ChatMessage[] = [
  { id: 1, requestId: "R009", sender: null, type: "system", content: "박운영 OFC가 요청을 등록했습니다.", at: "07-04 10:05" },
  { id: 2, requestId: "R009", sender: null, type: "system", content: "김시설 FM이 접수했습니다.", at: "07-04 10:32" },
  { id: 3, requestId: "R009", sender: "김시설", senderRole: "FM", type: "text", content: "점주님, 냉동고 전원은 유지해 주시고 상품은 보조 냉동고로 옮겨 주세요.", at: "07-04 10:40" },
  { id: 4, requestId: "R009", sender: "정점주", senderRole: "OWNER", type: "text", content: "네, 옮겨두었습니다. 빠른 처리 부탁드려요.", at: "07-04 11:02" },
  { id: 5, requestId: "R009", sender: null, type: "quote", content: "견적이 승인되었습니다 — 확정 320,000원 (쿨테크서비스)", at: "07-05 14:20" },
  { id: 6, requestId: "R009", sender: null, type: "schedule", content: "방문 일정 확정: 07-08 09:00 (작업자 최기사)", at: "07-05 16:00" },
  { id: 7, requestId: "R009", sender: null, type: "system", content: "작업이 시작되었습니다.", at: "07-08 09:05" },
  { id: 8, requestId: "R009", sender: null, type: "progress", content: "진행율 50% — 히터 코일 교체 중", at: "07-08 11:30" },
  { id: 9, requestId: "R006", sender: null, type: "quote", content: "견적이 제출되었습니다 — 470,000원 (표준 단가 초과 1건 포함)", at: "07-07 08:50" },
  { id: 10, requestId: "R006", sender: "이협력", senderRole: "PARTNER_ADMIN", type: "text", content: "저소음형 컴프레서라 단가가 표준보다 높습니다. 민원 건이라 권장드립니다.", at: "07-07 08:52" },
];

// ── 표준 단가 (마스터 시트 동기화 사본 목업)
export const STANDARD_PRICES = [
  { code: "CD-001", category: "COLD", name: "컴프레서 교체", spec: "1.5HP 표준형", unit: "EA", price: 320000 },
  { code: "CD-002", category: "COLD", name: "냉매 충전", spec: "R-404A 1kg", unit: "kg", price: 30000 },
  { code: "CD-003", category: "COLD", name: "제상 히터 교체", spec: "표준", unit: "EA", price: 110000 },
  { code: "SG-001", category: "SIGN", name: "LED 모듈 교체", spec: "50W", unit: "EA", price: 40000 },
  { code: "SG-002", category: "SIGN", name: "간판 브래킷 보강", spec: "돌출형", unit: "식", price: 120000 },
  { code: "CF-001", category: "COFFEE", name: "추출 유닛 정비", spec: "O링 포함", unit: "식", price: 130000 },
  { code: "EL-001", category: "ELEC", name: "콘센트 교체", spec: "접지 2구", unit: "EA", price: 35000 },
  { code: "EL-002", category: "ELEC", name: "LED 안정기 교체", spec: "40W", unit: "EA", price: 45000 },
  { code: "PL-001", category: "PLUMB", name: "배관 고압 세척", spec: "50A 이하", unit: "식", price: 180000 },
  { code: "IN-001", category: "INTERIOR", name: "자동문 센서 교체", spec: "표준", unit: "EA", price: 220000 },
];

// ── 매뉴얼 (SOP)
export const MANUALS = [
  { id: "M01", category: "COLD", title: "냉장·냉동 온도 이상 표준 처리", version: "v3.2", updated: "2026-06-01", summary: "온도 로그 확인 → 응축기 청소 여부 → 냉매/컴프레서 진단 순서. 보증기간 내 무상 AS 우선.", checklist: ["온도 설정값·실측값 기록", "응축기 필터 청소 상태 확인", "최근 1년 동일 증상 이력 확인", "보증기간(warranty) 확인"] },
  { id: "M02", category: "SIGN", title: "간판 소등·파손 처리 기준", version: "v2.1", updated: "2026-05-12", summary: "LED 모듈 단위 교체 원칙. 구조물 흔들림은 안전 최우선 — 당일 출동.", checklist: ["소등 범위 사진 확보", "안전 위험 여부 판단(당일/일반)", "표준 단가 내 견적 확인"] },
  { id: "M03", category: "ELEC", title: "전기 안전 관련 즉시 조치", version: "v4.0", updated: "2026-06-20", summary: "스파크·누전은 자가조치 절대 금지. 해당 회로 차단 후 당일 처리 원칙.", checklist: ["차단기 OFF 안내 완료", "점포 임시 운영 가이드 전달", "당일 협력사 배정"] },
  { id: "M04", category: "PLUMB", title: "누수·배관 처리 표준", version: "v2.4", updated: "2026-04-08", summary: "누수 원인(옥상/배관/결로) 구분 후 발주. 장마철 우선순위 상향.", checklist: ["누수 위치·범위 사진", "상부 세대/옥상 확인", "임시 조치 여부 기록"] },
  { id: "M05", category: "COFFEE", title: "커피머신 추출 불량 진단", version: "v1.8", updated: "2026-03-30", summary: "정기 청소 이력 확인 → 필터/그라인더 → 추출 유닛 순. 소모품은 점포 부담 기준.", checklist: ["정기 청소 이력 확인", "소모품/부품 비용 부담 구분", "표준 단가 확인"] },
];

// ── 화면 권한 매트릭스 기본값 (ERD §2.19)
export const PAGE_LABELS: Record<PageKey, string> = {
  map: "지도 대시보드", request_new: "요청 등록", my_requests: "내 요청(OFC)", my_store: "내 점포(경영주)",
  pool: "전국 접수 풀", case_detail: "케이스 상세", orders: "발주 관리", quotes: "견적",
  partner_board: "협력사 보드", worker_today: "오늘의 작업", manuals: "표준 매뉴얼", stats: "통계",
  reports: "리포트", admin_users: "사용자 관리", admin_rules: "라우팅·결재 규칙", admin_prices: "표준 단가표",
  admin_permissions: "권한 매트릭스", admin_manuals: "매뉴얼 관리",
};

export const ROLES: Role[] = ["OWNER", "OFC", "FM", "PARTNER_ADMIN", "PARTNER_WORKER", "ADMIN"];

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "경영주", OFC: "OFC", FM: "시설담당", PARTNER_ADMIN: "협력사", PARTNER_WORKER: "작업자", ADMIN: "관리자",
};

export type PermMatrix = Record<PageKey, Record<Role, boolean>>;

const allow = (roles: Role[]): Record<Role, boolean> =>
  Object.fromEntries(ROLES.map((r) => [r, roles.includes(r)])) as Record<Role, boolean>;

export const DEFAULT_PERMISSIONS: PermMatrix = {
  map: allow(["OWNER", "OFC", "FM", "PARTNER_ADMIN", "PARTNER_WORKER", "ADMIN"]),
  request_new: allow(["OFC", "ADMIN"]),
  my_requests: allow(["OFC", "ADMIN"]),
  my_store: allow(["OWNER", "ADMIN"]),
  pool: allow(["FM", "ADMIN"]),
  case_detail: allow(["OFC", "FM", "PARTNER_ADMIN", "ADMIN"]),
  orders: allow(["FM", "ADMIN"]),
  quotes: allow(["FM", "PARTNER_ADMIN", "ADMIN"]),
  partner_board: allow(["PARTNER_ADMIN", "ADMIN"]),
  worker_today: allow(["PARTNER_WORKER", "ADMIN"]),
  manuals: allow(["OFC", "FM", "PARTNER_ADMIN", "ADMIN"]),
  stats: allow(["FM", "ADMIN"]),
  reports: allow(["ADMIN"]),
  admin_users: allow(["ADMIN"]),
  admin_rules: allow(["ADMIN"]),
  admin_prices: allow(["ADMIN"]),
  admin_permissions: allow(["ADMIN"]),
  admin_manuals: allow(["ADMIN"]),
};

// ── 사용자 목록 (관리자 화면)
export const USERS = [
  { id: "U01", name: "정점주", email: "owner.gangnam@example.com", role: "OWNER" as Role, region: "서울", active: true },
  { id: "U02", name: "박운영", email: "park.ofc@example.com", role: "OFC" as Role, region: "수도권", active: true },
  { id: "U03", name: "김시설", email: "kim.fm@example.com", role: "FM" as Role, region: "전국", active: true },
  { id: "U04", name: "나담당", email: "na.fm@example.com", role: "FM" as Role, region: "전국", active: true },
  { id: "U05", name: "이협력", email: "lee@cooltech.co.kr", role: "PARTNER_ADMIN" as Role, region: "쿨테크서비스", active: true },
  { id: "U06", name: "최기사", email: "choi@cooltech.co.kr", role: "PARTNER_WORKER" as Role, region: "쿨테크서비스", active: true },
  { id: "U07", name: "본부관리자", email: "admin@hq.example.com", role: "ADMIN" as Role, region: "본부", active: true },
  { id: "U08", name: "구계정", email: "old@example.com", role: "OFC" as Role, region: "-", active: false },
];

// ── 점포 시설 이력 6종 (경영주 열람·AI 사전 검토 원천 — S001)
export const STORE_HISTORY = {
  facilities: [
    { name: "워크인 냉장고", model: "WC-2400", installed: "2023-03-15", warrantyUntil: "2026-03-15", vendor: "쿨테크서비스" },
    { name: "아이스크림 냉동고", model: "FZ-800", installed: "2024-11-02", warrantyUntil: "2027-11-02", vendor: "쿨테크서비스" },
    { name: "전면 LED 간판", model: "SG-F120", installed: "2023-03-10", warrantyUntil: "2025-03-10", vendor: "한빛사인" },
    { name: "커피머신", model: "CM-Pro2", installed: "2025-01-20", warrantyUntil: "2027-01-20", vendor: "카페텍" },
  ],
  happyCalls: [
    { date: "2026-05-14", content: "냉장고 소음 문의 — 전화 안내로 해결", sentiment: "보통" },
    { date: "2026-02-03", content: "간판 밝기 만족", sentiment: "긍정" },
  ],
  costs: [
    { date: "2026-06-30", type: "비용", desc: "진열대 선반 교체", amount: 90000 },
    { date: "2026-03-22", type: "비용", desc: "커피머신 필터 교체", amount: 45000 },
    { date: "2024-11-02", type: "투자", desc: "냉동고 신규 설치", amount: 2800000 },
    { date: "2023-03-15", type: "투자", desc: "냉장 설비 일체", amount: 12000000 },
  ],
  inspections: [
    { date: "2026-06-10", kind: "냉장", finding: "응축기 필터 청소 필요 — 완료", action: false },
    { date: "2026-05-20", kind: "간판", finding: "이상 없음", action: false },
  ],
  preMaintenance: [
    { date: "2026-06-25", content: "여름철 대비 냉방기 점검 요청", status: "완료" },
  ],
};

// ── AI 사전 검토 목업 응답 (04_PROMPT B-1 스키마)
export const MOCK_PRECHECK = {
  history_summary:
    "이 점포의 냉동고(FZ-800)는 2024년 11월 설치되어 보증기간이 2027년 11월까지 남아 있습니다. 최근 1년 내 동일 증상 접수 이력은 없으며, 6월 정기점검에서 응축기 필터 청소가 완료되었습니다. 성에 과다는 제상 히터 계통 불량 가능성이 높습니다.",
  warranty_status: "무상AS가능" as const,
  similar_cases: [
    { date: "2025-12-11", result: "타 점포 동일 모델 제상 히터 교체", cost: 110000 },
  ],
  estimated_cost_range: [0, 110000] as [number, number],
  opinion: "적정" as const,
  opinion_reason:
    "보증기간 이내 설비로 무상 AS 대상 가능성이 높습니다. 제조사 접수를 우선 진행하세요.",
  self_fix_guide: null,
};
