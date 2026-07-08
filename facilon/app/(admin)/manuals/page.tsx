"use client";

import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { MANUALS, categoryOf } from "@/lib/mock-data";

export default function AdminManuals() {
  const [q, setQ] = useState("");
  const list = MANUALS.filter(
    (m) => m.title.includes(q) || m.summary.includes(q),
  );

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">표준 매뉴얼 (SOP)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          전국 통일 처리 기준 — FM 접수 시 자동 표시됩니다.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="자연어 검색 (예: 간판 흔들릴 때 비용 부담)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" /> AI 검색은 백엔드 연결
        후 활성화됩니다 — 지금은 제목·내용 검색.
      </p>

      <div className="space-y-3">
        {list.map((m) => {
          const cat = categoryOf(m.category);
          return (
            <section key={m.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.colorHex }}
                  />
                  {m.title}
                </p>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">
                  {m.version}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{m.summary}</p>
              <ul className="mt-2 space-y-1">
                {m.checklist.map((c) => (
                  <li key={c} className="text-xs text-muted-foreground">
                    ☐ {c}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] text-muted-foreground">
                개정 {m.updated} · FM 개정 서명 3/4명
              </p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
