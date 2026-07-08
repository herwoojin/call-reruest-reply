"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { RequestCard } from "@/components/request-card";
import { FlowStepper } from "@/components/flow-stepper";
import { PERSONAS } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";

export default function OfcHome() {
  const requests = useFacilon((s) => s.requests);
  const mine = requests.filter((r) => r.requesterName === PERSONAS.OFC.name);
  const active = mine.filter((r) => !["CLOSED", "CANCELED"].includes(r.status));
  const working = mine.filter((r) => r.status === "IN_PROGRESS");

  return (
    <div className="space-y-5 p-4">
      <section>
        <h1 className="text-xl font-bold">
          {PERSONAS.OFC.name}님, 안녕하세요 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          담당 점포의 시설 요청을 등록하고 추적하세요.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        {(
          [
            ["내 요청", mine.length],
            ["진행중", active.length],
            ["작업중", working.length],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{n}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <Link
        href="/request/new"
        className="flex items-center justify-center gap-2 rounded-xl bg-primary p-4 font-semibold text-primary-foreground"
      >
        <PlusCircle className="h-5 w-5" /> 새 시설 요청 등록
      </Link>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">최근 요청</h2>
          <Link href="/my-requests" className="text-xs text-primary">
            전체 보기 →
          </Link>
        </div>
        {mine.slice(0, 3).map((r) => (
          <RequestCard key={r.id} request={r} href={`/case/${r.id}`}>
            <div className="mt-3">
              <FlowStepper status={r.status} progressPct={r.progressPct} />
            </div>
          </RequestCard>
        ))}
      </section>
    </div>
  );
}
