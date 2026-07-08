"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BookOpen, ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RequestChat } from "@/components/chat/request-chat";
import { PhotoStrip } from "@/components/photo-strip";
import { ProgressRing } from "@/components/progress-ring";
import { StatusBadge } from "@/components/status-badge";
import {
  MANUALS,
  PARTNERS,
  PERSONAS,
  categoryOf,
  storeOf,
} from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const request = useFacilon((s) => s.requests.find((r) => r.id === id));
  const quote = useFacilon((s) => s.quotes.find((q) => q.requestId === id));
  const approvals = useFacilon((s) => s.approvals[id!]);
  const order = useFacilon((s) => s.order);
  const decideQuote = useFacilon((s) => s.decideQuote);

  const [orderOpen, setOrderOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!request)
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        요청을 찾을 수 없습니다.{" "}
        <Link href="/pool" className="text-primary">
          풀로 이동
        </Link>
      </div>
    );

  const cat = categoryOf(request.categoryCode);
  const store = storeOf(request.storeId);
  const manual = MANUALS.find((m) => m.category === request.categoryCode);
  const partnersSorted = [...PARTNERS].sort((a, b) =>
    a.categories.includes(request.categoryCode) ===
    b.categories.includes(request.categoryCode)
      ? 0
      : a.categories.includes(request.categoryCode)
        ? -1
        : 1,
  );

  return (
    <div className="space-y-4 p-4">
      <header className="space-y-2">
        <Link
          href="/pool"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> 목록으로
        </Link>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">
              {request.requestNo} · {cat.name}
            </p>
            <h1 className="text-lg font-bold">{request.title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {store.region} {store.name} · {store.address}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <p className="rounded-lg bg-secondary p-3 text-sm">
          {request.description}
        </p>
      </header>

      <Tabs defaultValue="work">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="work">처리</TabsTrigger>
          <TabsTrigger value="chat">대화</TabsTrigger>
        </TabsList>

        <TabsContent value="work" className="mt-4 space-y-4">
          {/* 표준 매뉴얼 (F3 — 접수 시 자동 표시) */}
          {manual && (
            <section className="rounded-xl border bg-card p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-primary" /> {manual.title}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {manual.version}
                </span>
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {manual.summary}
              </p>
              <div className="mt-3 space-y-2">
                {manual.checklist.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <Checkbox /> {c}
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* 발주 (CLAIMED → ORDERED) */}
          {request.status === "CLAIMED" && (
            <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">협력사 발주 + 견적 시트 발행</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>협력사 선택</DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground">
                  계약 카테고리·지역 매칭 우선 정렬. 발주 시 구글시트 견적서가
                  자동 발행·공유됩니다.
                </p>
                <div className="space-y-2">
                  {partnersSorted.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        order(request.id, p.name);
                        setOrderOpen(false);
                      }}
                      className="w-full rounded-xl border bg-card p-3 text-left hover:bg-accent"
                    >
                      <p className="font-semibold">
                        {p.name}
                        {p.categories.includes(request.categoryCode) && (
                          <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                            카테고리 일치
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.regions.join("·")} / {p.categories.join("·")}
                      </p>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* 견적 (ORDERED~) */}
          {quote && (
            <section className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  견적서 — {quote.partnerName}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {quote.round}차
                  </span>
                </p>
                <a
                  href={quote.sheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-primary"
                >
                  구글시트 <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {quote.items.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  협력사 견적 작성 대기 중…
                </p>
              ) : (
                <>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="py-1.5 text-left font-medium">품목</th>
                          <th className="py-1.5 text-right font-medium">수량</th>
                          <th className="py-1.5 text-right font-medium">단가</th>
                          <th className="py-1.5 text-right font-medium">금액</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((it) => (
                          <tr
                            key={it.name}
                            className={cn(
                              "border-b border-border/50",
                              it.overStandard && "bg-red-500/10 text-red-300",
                            )}
                          >
                            <td className="py-2">
                              {it.name}
                              {it.overStandard && (
                                <span className="ml-1 text-[10px]">
                                  ⚠ 표준 초과
                                </span>
                              )}
                              <p className="text-[10px] text-muted-foreground">
                                {it.spec}
                              </p>
                            </td>
                            <td className="py-2 text-right">{it.qty}</td>
                            <td className="py-2 text-right tabular-nums">
                              {it.unitPrice.toLocaleString()}
                            </td>
                            <td className="py-2 text-right tabular-nums">
                              {it.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-right font-bold">
                    합계 {quote.totalAmount.toLocaleString()}원
                  </p>
                </>
              )}

              {request.status === "QUOTED" && quote.status === "SUBMITTED" && (
                <div className="mt-3 flex gap-2">
                  <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        반려
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>견적 반려 사유</DialogTitle>
                      </DialogHeader>
                      <Textarea
                        rows={3}
                        placeholder="예: 컴프레서 표준 단가 초과 — 표준형으로 재견적 요청"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <Button
                        variant="destructive"
                        onClick={() => {
                          decideQuote(request.id, false, reason);
                          setRejectOpen(false);
                        }}
                      >
                        반려 확정
                      </Button>
                    </DialogContent>
                  </Dialog>
                  <Button
                    className="flex-1"
                    onClick={() => decideQuote(request.id, true)}
                  >
                    승인
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* 결재 라인 (임계값 30만원 초과) */}
          {request.approvalRequired && approvals && (
            <section className="rounded-xl border border-amber-500/40 bg-card p-4">
              <p className="text-sm font-semibold text-amber-300">
                결재 진행 — 임계값(300,000원) 초과 건
              </p>
              <ol className="mt-3 space-y-2">
                {approvals.map((a) => (
                  <li key={a.step} className="flex items-center gap-3 text-sm">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        a.decision === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {a.decision === "APPROVED" ? "✓" : a.step}
                    </span>
                    <span className="flex-1">
                      {a.position} {a.approver}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {a.decision === "APPROVED" ? a.at : "대기"}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* 작업 현황 */}
          {["SCHEDULED", "IN_PROGRESS", "WORK_DONE", "OWNER_CONFIRMED", "CLOSED"].includes(request.status) && (
            <section className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">작업 현황</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {request.partnerName} · {request.workerName} ·{" "}
                    {request.scheduledAt}
                  </p>
                  {request.finalCost && (
                    <p className="mt-1 text-xs">
                      확정 금액{" "}
                      <b>{request.finalCost.toLocaleString()}원</b>
                    </p>
                  )}
                </div>
                <ProgressRing pct={request.progressPct} size={56} stroke={5} />
              </div>
              <div className="mt-3">
                <PhotoStrip photos={request.photos} />
              </div>
            </section>
          )}
        </TabsContent>

        <TabsContent value="chat" className="mt-2">
          <div className="rounded-xl border bg-card">
            <RequestChat
              requestId={request.id}
              me={PERSONAS.FM.name}
              myRole="FM"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
