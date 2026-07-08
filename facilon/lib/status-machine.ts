/**
 * 요청 상태머신 (PRD §6 / TRD §5)
 * 서버 검증 전용 — 클라이언트는 이 표를 UI 표시에만 사용하고,
 * 실제 전이는 전용 엔드포인트 + DB request_status_transitions로 검증한다.
 */
export const REQUEST_STATUSES = [
  "SUBMITTED",
  "OPEN_POOL",
  "CLAIMED",
  "APPROVING",
  "APPROVED",
  "ORDERED",
  "QUOTED",
  "QUOTE_APPROVED",
  "SCHEDULED",
  "IN_PROGRESS",
  "WORK_DONE",
  "OWNER_CONFIRMED",
  "CLOSED",
  "REJECTED",
  "CANCELED",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export type Role =
  | "OWNER"
  | "OFC"
  | "ADMIN"
  | "FM"
  | "PARTNER_ADMIN"
  | "PARTNER_WORKER";

/** from → 허용되는 to 목록. */
export const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  SUBMITTED: ["OPEN_POOL", "CANCELED"],
  OPEN_POOL: ["CLAIMED", "CANCELED"],
  CLAIMED: ["APPROVING", "ORDERED"], // 예상비용 임계값 초과 시 APPROVING
  APPROVING: ["APPROVED", "REJECTED"],
  APPROVED: ["ORDERED"],
  ORDERED: ["QUOTED"],
  // TRD §3.5: 견적 금액이 임계값 초과로 올라오면 결재 라인 소급 생성
  QUOTED: ["QUOTE_APPROVED", "APPROVING", "ORDERED"], // ORDERED = 견적 반려 재작성
  QUOTE_APPROVED: ["SCHEDULED"],
  SCHEDULED: ["IN_PROGRESS"],
  IN_PROGRESS: ["WORK_DONE"],
  WORK_DONE: ["OWNER_CONFIRMED"],
  OWNER_CONFIRMED: ["CLOSED"],
  CLOSED: [],
  REJECTED: [],
  CANCELED: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** 상태 한글 라벨 (쉬운 한글 원칙) */
export const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: "요청 등록",
  OPEN_POOL: "접수 대기",
  CLAIMED: "담당자 접수",
  APPROVING: "결재 진행",
  APPROVED: "결재 완료",
  ORDERED: "협력사 발주",
  QUOTED: "견적 제출",
  QUOTE_APPROVED: "견적 승인",
  SCHEDULED: "방문 일정 확정",
  IN_PROGRESS: "작업 중",
  WORK_DONE: "작업 완료",
  OWNER_CONFIRMED: "경영주 확인",
  CLOSED: "종결",
  REJECTED: "결재 반려",
  CANCELED: "취소",
};
