"use client";

import { RequestCard } from "@/components/request-card";
import { PERSONAS } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";

export default function MyCases() {
  const requests = useFacilon((s) => s.requests);
  const mine = requests.filter((r) => r.fmName === PERSONAS.FM.name);
  const active = mine.filter((r) => !["CLOSED", "CANCELED"].includes(r.status));
  const closed = mine.filter((r) => ["CLOSED", "CANCELED"].includes(r.status));

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">내 접수 건</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          진행중 {active.length}건
        </h2>
        {active.map((r) => (
          <RequestCard key={r.id} request={r} href={`/case/${r.id}`} />
        ))}
      </section>

      {closed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            종결 {closed.length}건
          </h2>
          {closed.map((r) => (
            <RequestCard key={r.id} request={r} href={`/case/${r.id}`} />
          ))}
        </section>
      )}
    </div>
  );
}
