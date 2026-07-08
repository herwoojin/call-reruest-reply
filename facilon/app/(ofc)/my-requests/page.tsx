"use client";

import { RequestCard } from "@/components/request-card";
import { FlowStepper } from "@/components/flow-stepper";
import { PERSONAS } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";

export default function MyRequests() {
  const requests = useFacilon((s) => s.requests);
  const mine = requests.filter((r) => r.requesterName === PERSONAS.OFC.name);

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-xl font-bold">내 요청 {mine.length}건</h1>
      <p className="text-sm text-muted-foreground">
        요청→접수→발주→견적→일정→작업→완료 단계를 실시간 추적합니다.
      </p>
      {mine.map((r) => (
        <RequestCard key={r.id} request={r} href={`/case/${r.id}`}>
          <div className="mt-3">
            <FlowStepper status={r.status} progressPct={r.progressPct} />
          </div>
        </RequestCard>
      ))}
      {mine.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          등록한 요청이 없습니다.
        </p>
      )}
    </div>
  );
}
