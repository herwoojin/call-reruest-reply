"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  ClipboardList,
  Home,
  Inbox,
  ListChecks,
  LogOut,
  Map,
  PlusCircle,
  Settings,
  Shield,
  Store,
  Tag,
  Users,
  Wrench,
} from "lucide-react";
import { useSession } from "@/lib/session-store";
import { cn } from "@/lib/utils";

const ICONS = {
  home: Home,
  map: Map,
  plus: PlusCircle,
  list: ListChecks,
  inbox: Inbox,
  briefcase: Briefcase,
  wrench: Wrench,
  store: Store,
  chart: BarChart3,
  shield: Shield,
  users: Users,
  tag: Tag,
  book: BookOpen,
  clipboard: ClipboardList,
  settings: Settings,
} as const;

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
};

export function AppShell({
  title,
  roleLabel,
  nav,
  children,
}: {
  title: string;
  roleLabel: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession((s) => s.session);
  const logout = useSession((s) => s.logout);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const doLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-dvh">
      {/* ── 데스크톱/태블릿 사이드바 (md+) ── */}
      <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-card/40 md:flex md:w-20 lg:w-60">
        <Link
          href="/"
          className="flex h-16 items-center justify-center gap-2 border-b lg:justify-start lg:px-6"
        >
          <span className="brand-neon text-lg font-bold tracking-tight">
            <span className="lg:hidden">GS25</span>
            <span className="hidden lg:inline">GS25시설요청관리</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 p-2 lg:p-3">
          {nav.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium lg:justify-start",
                  "justify-center",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-2 lg:p-3">
          <Link
            href="/settings"
            title="설정"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium lg:justify-start",
              "justify-center",
              isActive("/settings")
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span className="hidden lg:inline">설정</span>
          </Link>
          <div className="mt-1 hidden items-center gap-2 rounded-xl px-3 py-2 lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
              {(session?.name ?? title)[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                {session?.name ?? title}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {roleLabel}
              </p>
            </div>
            <button
              onClick={doLogout}
              title="로그아웃"
              className="!min-h-0 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── 메인 컬럼 ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 상단 헤더 (모바일은 브랜드+설정, 데스크톱은 컨텍스트) */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur">
          <Link
            href="/"
            className="brand-neon text-base font-bold tracking-tight md:hidden"
          >
            GS25시설요청관리
          </Link>
          <span className="hidden text-sm font-semibold md:inline">
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground md:hidden">
              {title}
            </span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {roleLabel}
            </span>
            <Link
              href="/settings"
              aria-label="설정"
              className="!min-h-0 text-muted-foreground md:hidden"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 pb-24 md:pb-8">
          <div className="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-3xl">
            {children}
          </div>
        </main>
      </div>

      {/* ── 모바일 하단 탭바 (md 미만) ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div
          className="mx-auto grid max-w-md"
          style={{ gridTemplateColumns: `repeat(${nav.length}, 1fr)` }}
        >
          {nav.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
