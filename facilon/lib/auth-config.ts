import type { Role } from "./status-machine";
import { STORES } from "./mock-data";

/**
 * 역할별 로그인 방식 정의 (데모 인증 — Firebase 커스텀 클레임으로 치환 예정)
 * 실서비스에서는 각 검증을 서버(Route Handler + Admin SDK)로 이동한다.
 */

export const ROLE_HOME: Record<Role, string> = {
  OWNER: "/my-store",
  OFC: "/home",
  FM: "/pool",
  PARTNER_ADMIN: "/board",
  PARTNER_WORKER: "/today",
  ADMIN: "/dashboard",
};

export const ROLE_LOGIN_LABEL: Record<Role, string> = {
  OWNER: "점포 경영주",
  OFC: "OFC (운영 담당)",
  FM: "시설담당자",
  PARTNER_ADMIN: "협력사 관리자",
  PARTNER_WORKER: "협력사 작업자",
  ADMIN: "본부 관리자",
};

export const ROLE_LOGIN_METHOD: Record<Role, string> = {
  OWNER: "점포 접속 코드 입력",
  OFC: "회사 이메일 인증 (@gsretail.com)",
  FM: "사번 로그인",
  PARTNER_ADMIN: "발급받은 협력사 ID",
  PARTNER_WORKER: "승인된 작업자 ID",
  ADMIN: "관리자 ID · 비밀번호",
};

// ── 경영주 점포 접속 코드 (데모: 점포코드 뒤4자리 + 'ON') ──
export function ownerCodeFor(storeCode: string) {
  return `${storeCode.slice(-4)}ON`;
}

export function verifyOwnerCode(code: string) {
  const store = STORES.find(
    (s) => ownerCodeFor(s.storeCode).toUpperCase() === code.trim().toUpperCase(),
  );
  return store
    ? { ok: true as const, storeId: store.id, name: store.ownerName, storeName: store.name }
    : { ok: false as const };
}

// ── OFC 회사 이메일 인증 ──
export const OFC_EMAIL_DOMAIN = "@gsretail.com";

export function isValidOfcEmail(email: string) {
  return /^[^\s@]+@gsretail\.com$/i.test(email.trim());
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── 관리자 ID·비밀번호 (데모) ──
export const ADMIN_CREDENTIALS = { id: "admin", password: "facilon2026" };

export function verifyAdmin(id: string, password: string) {
  return (
    id.trim() === ADMIN_CREDENTIALS.id &&
    password === ADMIN_CREDENTIALS.password
  );
}

// ── FM 사번 (데모) ──
export const FM_ACCOUNTS: Record<string, string> = {
  "fm-kim": "김시설",
  "fm-na": "나담당",
};

// ── 협력사 관리자 ID (본부가 발급 — 데모 목록) ──
export const PARTNER_ADMIN_ACCOUNTS: Record<
  string,
  { name: string; company: string }
> = {
  "cooltech-admin": { name: "이협력", company: "쿨테크서비스" },
  "hanbit-admin": { name: "김한빛", company: "한빛사인" },
  "woori-admin": { name: "박우리", company: "우리설비" },
};

// ── 협력사 작업자 ID (협력사 관리자가 승인 — 데모 목록) ──
export const PARTNER_WORKER_ACCOUNTS: Record<
  string,
  { name: string; company: string }
> = {
  "choi-01": { name: "최기사", company: "쿨테크서비스" },
  "park-02": { name: "박기사", company: "쿨테크서비스" },
  "jung-03": { name: "정기사", company: "한빛사인" },
};
