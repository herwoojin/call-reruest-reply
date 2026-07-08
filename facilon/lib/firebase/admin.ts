import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * 서버 전용 Firebase Admin SDK (Route Handler / Server Component)
 * - ID 토큰 검증, 커스텀 클레임(role) 부여, 보안 규칙 우회 쓰기
 * - FIREBASE_SERVICE_ACCOUNT_JSON: 서비스 계정 키 JSON의 base64
 * 지연 초기화 — env 미설정 상태에서 빌드가 깨지지 않도록 한다.
 */
let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0];
    return adminApp;
  }
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!b64) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON 환경변수가 없습니다 (.env.local 확인)",
    );
  }
  const serviceAccount = JSON.parse(
    Buffer.from(b64, "base64").toString("utf8"),
  );
  adminApp = initializeApp({ credential: cert(serviceAccount) });
  return adminApp;
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());

/** 역할 커스텀 클레임 부여 (ADMIN 사용자 관리 화면에서 호출 — Phase 2) */
export async function setUserRole(uid: string, role: string) {
  await adminAuth().setCustomUserClaims(uid, { role });
}
