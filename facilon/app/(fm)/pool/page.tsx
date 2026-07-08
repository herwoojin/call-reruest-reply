"use client";

import { RequestCard } from "@/components/request-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PERSONAS } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";

export default function FmPool() {
  const requests = useFacilon((s) => s.requests);
  const claim = useFacilon((s) => s.claim);

  const pool = requests.filter((r) => r.status === "OPEN_POOL");
  const myCount = requests.filter(
    (r) =>
      r.fmName === PERSONAS.FM.name &&
      !["CLOSED", "CANCELED"].includes(r.status),
  ).length;
  const capacity = PERSONAS.FM.capacity;

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">전국 접수 풀</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          지역 무관 선착순 셀프 접수 — 처리 기준은 표준 매뉴얼을 따릅니다.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">
            {PERSONAS.FM.name} FM 처리 부하
          </span>
          <span className="tabular-nums text-muted-foreground">
            {myCount}/{capacity}건
          </span>
        </div>
        <Progress className="mt-2 h-2" value={(myCount / capacity) * 100} />
        {myCount >= capacity && (
          <p className="mt-2 text-xs text-amber-400">
            상한 도달 — 추가 접수가 제한됩니다.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">
          대기 중 <span className="text-primary">{pool.length}건</span>
        </h2>
        {pool.map((r) => (
          <RequestCard key={r.id} request={r}>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                예상 {r.estimatedCost?.toLocaleString()}원 · 희망{" "}
                {r.preferredDate}
              </span>
              <Button
                size="sm"
                disabled={myCount >= capacity}
                onClick={() => claim(r.id, PERSONAS.FM.name)}
              >
                내가 접수
              </Button>
            </div>
          </RequestCard>
        ))}
        {pool.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            대기 중인 요청이 없습니다. 🎉
          </p>
        )}
      </section>
    </div>
  );
}
