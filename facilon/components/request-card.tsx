import Link from "next/link";
import { categoryOf, storeOf, type FacilityRequest } from "@/lib/mock-data";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

/** 요청 요약 카드 — 목록 화면 공용 */
export function RequestCard({
  request,
  href,
  right,
  children,
}: {
  request: FacilityRequest;
  href?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const cat = categoryOf(request.categoryCode);
  const store = storeOf(request.storeId);

  const body = (
    <div
      className={cn(
        "rounded-xl border bg-card p-4",
        href && "transition-colors hover:bg-accent",
        request.delayed && "border-amber-500/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: cat.colorHex }}
            />
            <span className="text-xs text-muted-foreground">
              {cat.name} · {store.region} {store.name}
            </span>
          </div>
          <p className="mt-1 truncate font-semibold">{request.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {request.requestNo} · {request.createdAt}
            {request.delayed && (
              <span className="ml-2 font-medium text-amber-400">지연</span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={request.status} />
          {right}
        </div>
      </div>
      {children}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
