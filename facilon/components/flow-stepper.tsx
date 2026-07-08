import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/lib/status-machine";

/** OFC 내 요청 추적용 단계 스텝퍼 (PRD F8) */
const STEPS: { label: string; reached: RequestStatus[] }[] = [
  { label: "요청", reached: ["SUBMITTED", "OPEN_POOL"] },
  { label: "접수", reached: ["CLAIMED", "APPROVING", "APPROVED"] },
  { label: "발주", reached: ["ORDERED"] },
  { label: "견적", reached: ["QUOTED", "QUOTE_APPROVED"] },
  { label: "일정", reached: ["SCHEDULED"] },
  { label: "작업", reached: ["IN_PROGRESS"] },
  { label: "완료", reached: ["WORK_DONE", "OWNER_CONFIRMED", "CLOSED"] },
];

export function stepIndexOf(status: RequestStatus): number {
  const i = STEPS.findIndex((s) => s.reached.includes(status));
  return i === -1 ? 0 : i;
}

export function FlowStepper({
  status,
  progressPct,
}: {
  status: RequestStatus;
  progressPct?: number;
}) {
  const current = stepIndexOf(status);

  return (
    <ol className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "h-0.5 flex-1",
                  i === 0 ? "bg-transparent" : done || active ? "bg-primary" : "bg-muted",
                )}
              />
              <div
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  done && "bg-primary",
                  active && "bg-primary ring-4 ring-primary/25",
                  !done && !active && "bg-muted",
                )}
              />
              <div
                className={cn(
                  "h-0.5 flex-1",
                  i === STEPS.length - 1 ? "bg-transparent" : done ? "bg-primary" : "bg-muted",
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px]",
                active ? "font-semibold text-primary" : "text-muted-foreground",
              )}
            >
              {s.label}
              {active && s.label === "작업" && progressPct != null
                ? ` ${progressPct}%`
                : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
