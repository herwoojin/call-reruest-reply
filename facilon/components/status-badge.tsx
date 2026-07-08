import { cn } from "@/lib/utils";
import {
  STATUS_LABELS,
  type RequestStatus,
} from "@/lib/status-machine";

const TONE: Partial<Record<RequestStatus, string>> = {
  SUBMITTED: "bg-slate-500/15 text-slate-300",
  OPEN_POOL: "bg-blue-500/15 text-blue-400",
  CLAIMED: "bg-indigo-500/15 text-indigo-400",
  APPROVING: "bg-amber-500/15 text-amber-400",
  APPROVED: "bg-amber-500/15 text-amber-300",
  ORDERED: "bg-violet-500/15 text-violet-400",
  QUOTED: "bg-fuchsia-500/15 text-fuchsia-400",
  QUOTE_APPROVED: "bg-violet-500/15 text-violet-300",
  SCHEDULED: "bg-cyan-500/15 text-cyan-400",
  IN_PROGRESS: "bg-emerald-500/15 text-emerald-400",
  WORK_DONE: "bg-teal-500/15 text-teal-300",
  OWNER_CONFIRMED: "bg-teal-500/15 text-teal-200",
  CLOSED: "bg-slate-500/15 text-slate-400",
  REJECTED: "bg-red-500/15 text-red-400",
  CANCELED: "bg-slate-500/15 text-slate-500",
};

export function StatusBadge({
  status,
  className,
}: {
  status: RequestStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        TONE[status] ?? "bg-muted text-muted-foreground",
        status === "IN_PROGRESS" && "animate-pulse",
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
