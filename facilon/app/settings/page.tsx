"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  THEME_DESC,
  THEME_LABELS,
  useSettings,
  type Theme,
} from "@/lib/settings-store";
import { useSession } from "@/lib/session-store";
import { ROLE_LOGIN_LABEL } from "@/lib/auth-config";
import { cn } from "@/lib/utils";

const THEME_ORDER: Theme[] = ["day", "night", "paper"];

const THEME_SWATCH: Record<Theme, string> = {
  day: "linear-gradient(135deg,#ffffff 50%,#e2e8f0 50%)",
  night: "linear-gradient(135deg,#0B1220 50%,#1e293b 50%)",
  paper: "linear-gradient(135deg,#efe6d0 50%,#d8c9a8 50%)",
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, fontScale, setTheme, toggleLargeFont } = useSettings();
  const { session, logout } = useSession();

  return (
    <div className="mx-auto max-w-2xl">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background px-4 py-3">
        <button
          onClick={() => router.back()}
          aria-label="뒤로"
          className="!min-h-0 text-muted-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">설정</h1>
      </header>

      <div className="space-y-6 p-4">
        {/* 화면 테마 */}
        <section>
          <h2 className="mb-2 text-sm font-semibold">화면 테마</h2>
          <div className="grid grid-cols-3 gap-3">
            {THEME_ORDER.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 bg-card p-3 text-center transition-colors",
                  theme === t ? "border-primary" : "border-border",
                )}
              >
                <span
                  className="h-12 w-full rounded-lg border"
                  style={{ background: THEME_SWATCH[t] }}
                />
                <span className="text-xs font-semibold">{THEME_LABELS[t]}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {THEME_DESC[theme]}
          </p>
        </section>

        {/* 큰글자 모드 */}
        <section>
          <h2 className="mb-2 text-sm font-semibold">글자 크기</h2>
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">큰글자 모드</p>
                <p className="text-xs text-muted-foreground">
                  전체 화면 글자·버튼을 크게 표시 (경영주 권장)
                </p>
              </div>
            </div>
            <Switch
              checked={fontScale === "large"}
              onCheckedChange={toggleLargeFont}
            />
          </div>
          <div className="mt-2 rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">미리보기</p>
            <p className="mt-1 font-semibold">냉장고 온도 이상 — 작업 중 50%</p>
            <p className="text-sm text-muted-foreground">
              현재 {fontScale === "large" ? "큰글자" : "일반"} 모드입니다.
            </p>
          </div>
        </section>

        {/* 계정 */}
        {session && (
          <section>
            <h2 className="mb-2 text-sm font-semibold">계정</h2>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm">
                <span className="font-semibold">{session.name}</span>
                <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                  {ROLE_LOGIN_LABEL[session.role]}
                </span>
              </p>
              {session.storeName && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {session.storeName}
                </p>
              )}
              {session.company && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {session.company}
                </p>
              )}
              {session.email && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {session.email}
                </p>
              )}
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                로그아웃
              </Button>
            </div>
          </section>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="text-primary">
            홈으로
          </Link>
        </p>
      </div>
    </div>
  );
}
