"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";

/** 홈 상단 로그인 상태 표시 (로그인 동작 검증용) */
export function AuthStatus() {
  const { user, role, loading, configured, signOut } = useAuth();

  if (loading) return null;

  if (!configured) {
    return (
      <p className="text-xs text-muted-foreground">
        Firebase 미설정 — .env.local 기입 후 로그인 사용 가능
      </p>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-xl border bg-card px-4 py-2 text-sm hover:bg-accent"
      >
        구글 계정으로 로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 text-sm">
      <span>
        <span className="font-semibold">{user.displayName}</span>
        <span className="text-muted-foreground">
          {" "}
          · {role ?? "역할 미부여"}
        </span>
      </span>
      <button
        onClick={() => signOut()}
        className="rounded-lg border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
      >
        로그아웃
      </button>
    </div>
  );
}
