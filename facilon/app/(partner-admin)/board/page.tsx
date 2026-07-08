"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { ProgressRing } from "@/components/progress-ring";
import { categoryOf, storeOf, type FacilityRequest } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";

const WORKERS = ["최기사", "박기사", "정기사"];

const COLUMNS: { key: string; label: string; match: (r: FacilityRequest) => boolean }[] = [
  { key: "received", label: "발주수신", match: (r) => r.status === "ORDERED" },
  { key: "quoting", label: "견적중", match: (r) => ["QUOTED", "APPROVING"].includes(r.status) },
  { key: "scheduled", label: "일정확정", match: (r) => ["QUOTE_APPROVED", "SCHEDULED"].includes(r.status) },
  { key: "working", label: "작업중", match: (r) => r.status === "IN_PROGRESS" },
  { key: "done", label: "완료", match: (r) => ["WORK_DONE", "OWNER_CONFIRMED", "CLOSED"].includes(r.status) },
];

export default function PartnerBoard() {
  const requests = useFacilon((s) => s.requests);
  const quotes = useFacilon((s) => s.quotes);
  const schedule = useFacilon((s) => s.schedule);

  const ours = requests.filter((r) => r.partnerName); // 자사 발주 건 (목업: 전체 협력사)
  const [assignId, setAssignId] = useState<string | null>(null);
  const [worker, setWorker] = useState(WORKERS[0]);
  const [when, setWhen] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const assignTarget = ours.find((r) => r.id === assignId);

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">작업 보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          발주 수신 → 견적 → 작업자 지시·일정 → 작업 → 완료
        </p>
      </header>

      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {COLUMNS.map((col) => {
          const items = ours.filter(col.match);
          return (
            <section
              key={col.key}
              className="w-64 shrink-0 snap-start rounded-xl border bg-card/50 p-3"
            >
              <h2 className="mb-2 flex items-center justify-between text-sm font-semibold">
                {col.label}
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
                  {items.length}
                </span>
              </h2>
              <div className="space-y-2">
                {items.map((r) => {
                  const q = quotes.find((x) => x.requestId === r.id);
                  const store = storeOf(r.storeId);
                  return (
                    <div key={r.id} className="rounded-lg border bg-card p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: categoryOf(r.categoryCode).colorHex }}
                        />
                        {store.region} {store.name}
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-tight">
                        {r.title}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <StatusBadge status={r.status} />
                        {r.status === "IN_PROGRESS" && (
                          <ProgressRing pct={r.progressPct} size={36} stroke={4} />
                        )}
                      </div>

                      {q && r.status === "ORDERED" && (
                        <div className="mt-2 grid gap-1.5">
                          <a
                            href={q.sheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-primary"
                          >
                            견적 시트 열기 <ExternalLink className="h-3 w-3" />
                          </a>
                          <Button size="sm" asChild>
                            <Link href={`/quote/${r.id}`}>견적 작성·제출</Link>
                          </Button>
                        </div>
                      )}

                      {r.status === "QUOTE_APPROVED" && (
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => setAssignId(r.id)}
                        >
                          작업자 지시·일정 확정
                        </Button>
                      )}

                      {r.scheduledAt && r.status !== "QUOTE_APPROVED" && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {r.scheduledAt} · {r.workerName}
                        </p>
                      )}
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    없음
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <Dialog open={!!assignId} onOpenChange={(o) => !o && setAssignId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>작업자 지시 · 일정 확정</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {assignTarget?.title}
          </p>
          <Select value={worker} onValueChange={setWorker}>
            <SelectTrigger>
              <SelectValue placeholder="작업자 선택" />
            </SelectTrigger>
            <SelectContent>
              {WORKERS.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="방문 일시 (예: 07-10 10:00)"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
          <Button
            disabled={!when || scheduling}
            onClick={async () => {
              const id = assignId!;
              setScheduling(true);
              // 작업 건별 상태 구글시트 발행 (미연결 시 데모 URL 반환)
              let sheetUrl: string | undefined;
              try {
                const res = await fetch(`/api/work/${id}/sheet`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    requestNo: assignTarget?.requestNo ?? id,
                    storeName: assignTarget
                      ? storeOf(assignTarget.storeId).name
                      : "",
                    title: assignTarget?.title ?? "",
                  }),
                });
                const data = await res.json();
                sheetUrl = data.url;
              } catch {
                // 시트 발행 실패해도 일정 확정은 진행
              }
              schedule(id, worker, when, sheetUrl);
              setScheduling(false);
              setAssignId(null);
              setWhen("");
            }}
          >
            {scheduling ? "발행 중…" : "확정 — 경영주·OFC 자동 알림"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
