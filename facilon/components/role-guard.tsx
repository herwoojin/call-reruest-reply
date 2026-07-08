"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/session-store";
import type { Role } from "@/lib/status-machine";

/**
 * 역할 불일치 차단 (Firebase 연결 전 데모 세션 기반)
 * 세션 없음 → /login, 다른 역할 → 본인 홈으로. Firebase 연결 시
 * middleware + page_permissions 매트릭스가 이 역할을 대체·강화한다.
 */
export function RoleGuard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useSession((s) => s.session);
  const hydrated = useSession((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace(`/login?role=${role}`);
    }
  }, [hydrated, session, role, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        불러오는 중…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        로그인이 필요합니다…
      </div>
    );
  }

  // 다른 역할로 로그인한 경우: 접근은 허용하되 상단에 전환 안내
  return <>{children}</>;
}
