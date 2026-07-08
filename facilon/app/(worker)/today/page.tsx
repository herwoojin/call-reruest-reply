"use client";

import Link from "next/link";
import { Navigation } from "lucide-react";
import { RequestCard } from "@/components/request-card";
import { ProgressRing } from "@/components/progress-ring";
import { PERSONAS, storeOf } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";

export default function WorkerToday() {
  const requests = useFacilon((s) => s.requests);
  const mine = requests.filter(
    (r) =>
      r.workerName === PERSONAS.PARTNER_WORKER.name &&
      ["SCHEDULED", "IN_PROGRESS", "WORK_DONE"].includes(r.status),
  );

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">오늘의 작업 {mine.length}건</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          작업시작·진행율·완료 보고는 지도와 경영주 화면에 즉시 반영됩니다.
        </p>
      </header>

      {mine.map((r) => {
        const store = storeOf(r.storeId);
        return (
          <RequestCard
            key={r.id}
            request={r}
            href={`/job/${r.id}`}
            right={
              r.status === "IN_PROGRESS" ? (
                <ProgressRing pct={r.progressPct} size={40} stroke={4} />
              ) : undefined
            }
          >
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {r.scheduledAt} 방문 · {store.address}
              </span>
              <a
                href={`https://www.openstreetmap.org/directions?to=${store.lat}%2C${store.lng}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-primary"
              >
                <Navigation className="h-3.5 w-3.5" /> 길찾기
              </a>
            </div>
          </RequestCard>
        );
      })}

      {mine.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          배정된 작업이 없습니다.
        </p>
      )}
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/board" className="text-primary">
          협력사 보드
        </Link>
        에서 일정을 확정하면 여기에 나타납니다.
      </p>
    </div>
  );
}
