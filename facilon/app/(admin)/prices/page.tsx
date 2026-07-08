"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { STANDARD_PRICES, categoryOf } from "@/lib/mock-data";

export default function AdminPrices() {
  const [syncedAt, setSyncedAt] = useState("07-08 13:00");
  const [syncing, setSyncing] = useState(false);

  const sync = () => {
    setSyncing(true);
    setTimeout(() => {
      const d = new Date();
      setSyncedAt(
        `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      );
      setSyncing(false);
    }, 900);
  };

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">표준 단가표</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          마스터는 구글시트에서 편집 — 앱은 1시간 주기 자동 동기화하며 견적
          검증에 사용합니다.
        </p>
      </header>

      <section className="flex items-center justify-between rounded-xl border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">마스터 단가 시트</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            마지막 동기화 {syncedAt}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://docs.google.com/spreadsheets/d/TPL_PRICE_DEMO"
              target="_blank"
              rel="noreferrer"
            >
              시트 열기 <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
          <Button size="sm" onClick={sync} disabled={syncing}>
            <RefreshCw
              className={`mr-1 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
            />
            동기화
          </Button>
        </div>
      </section>

      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[480px] text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-2 text-left font-medium">코드</th>
              <th className="py-2 text-left font-medium">카테고리</th>
              <th className="py-2 text-left font-medium">품목</th>
              <th className="py-2 text-left font-medium">규격</th>
              <th className="py-2 text-right font-medium">표준단가</th>
            </tr>
          </thead>
          <tbody>
            {STANDARD_PRICES.map((p) => (
              <tr key={p.code} className="border-b border-border/50">
                <td className="py-2.5 font-mono text-muted-foreground">
                  {p.code}
                </td>
                <td className="py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: categoryOf(p.category).colorHex }}
                    />
                    {categoryOf(p.category).name}
                  </span>
                </td>
                <td className="py-2.5">{p.name}</td>
                <td className="py-2.5 text-muted-foreground">{p.spec}</td>
                <td className="py-2.5 text-right tabular-nums">
                  {p.price.toLocaleString()}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
