"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { ROLE_HOME, ROLE_LOGIN_LABEL, ROLE_LOGIN_METHOD } from "@/lib/auth-config";
import { useSession } from "@/lib/session-store";
import type { Role } from "@/lib/status-machine";

const ROLE_ORDER: Role[] = [
  "OWNER",
  "OFC",
  "FM",
  "PARTNER_ADMIN",
  "PARTNER_WORKER",
  "ADMIN",
];

const ROLE_EMOJI: Record<Role, string> = {
  OWNER: "🏪",
  OFC: "📋",
  FM: "🔧",
  PARTNER_ADMIN: "🏢",
  PARTNER_WORKER: "👷",
  ADMIN: "🛡️",
};

export default function Home() {
  const router = useRouter();
  const session = useSession((s) => s.session);
  const hydrated = useSession((s) => s.hydrated);
  const logout = useSession((s) => s.logout);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <header className="space-y-2 text-center">
        <h1 className="brand-neon text-3xl font-bold tracking-tight">
          GS25시설요청관리
        </h1>
        <p className="text-sm text-muted-foreground">
          전국 편의점 시설 AS 통합 관리 — 디지털트윈 지도
        </p>
      </header>

      {hydrated && session ? (
        <div className="space-y-3 rounded-xl border bg-card p-4 text-center">
          <p className="text-sm">
            <span className="font-semibold">{session.name}</span> 님 ·{" "}
            <span className="text-primary">
              {ROLE_LOGIN_LABEL[session.role]}
            </span>
            {session.storeName && (
              <span className="text-muted-foreground"> · {session.storeName}</span>
            )}
          </p>
          <div className="grid gap-2">
            <button
              onClick={() => router.push(ROLE_HOME[session.role])}
              className="rounded-xl bg-primary p-3 font-semibold text-primary-foreground"
            >
              내 화면으로 이동 →
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/settings"
                className="flex items-center justify-center gap-1 rounded-xl border p-3 text-sm"
              >
                <Settings className="h-4 w-4" /> 설정
              </Link>
              <button
                onClick={() => logout()}
                className="rounded-xl border p-3 text-sm text-muted-foreground"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-xl bg-primary p-4 text-center font-semibold text-primary-foreground"
        >
          로그인 / 입장하기
        </Link>
      )}

      <div>
        <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
          입장 방식 선택 (역할별 로그인)
        </p>
        <nav className="grid gap-2.5">
          {ROLE_ORDER.map((r) => (
            <Link
              key={r}
              href={`/login?role=${r}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent"
            >
              <span className="text-xl">{ROLE_EMOJI[r]}</span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  {ROLE_LOGIN_LABEL[r]}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {ROLE_LOGIN_METHOD[r]}
                </div>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs">
        <Link href="/map" className="text-primary">
          🗺️ 전국 지도
        </Link>
        <Link href="/settings" className="text-primary">
          ⚙️ 화면 설정 (테마·글자)
        </Link>
      </div>
    </main>
  );
}
