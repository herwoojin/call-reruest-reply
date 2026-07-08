"use client";

import { useState } from "react";
import { CalendarDays, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestChat } from "@/components/chat/request-chat";
import { PhotoStrip } from "@/components/photo-strip";
import { ProgressRing } from "@/components/progress-ring";
import { SignaturePad } from "@/components/signature-pad";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-badge";
import {
  PERSONAS,
  STORE_HISTORY,
  STORES,
  categoryOf,
  storeOf,
} from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";
import { useSession } from "@/lib/session-store";

export default function MyStore() {
  // 경영주가 로그인 시 입력한 접속 코드의 점포를 표시
  const session = useSession((s) => s.session);
  const store =
    STORES.find((s) => s.id === session?.storeId) ??
    storeOf(PERSONAS.OWNER.storeId);
  // 셀렉터는 안정 참조만 반환 (새 배열 반환 시 무한 리렌더)
  const allRequests = useFacilon((s) => s.requests);
  const requests = allRequests.filter((r) => r.storeId === store.id);
  const confirmClose = useFacilon((s) => s.confirmClose);

  const [chatId, setChatId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [rating, setRating] = useState(0);

  const active = requests.filter((r) => !["CLOSED", "CANCELED"].includes(r.status));
  const closed = requests.filter((r) => r.status === "CLOSED");

  const dday = (scheduledAt?: string) => {
    if (!scheduledAt) return null;
    const [mm, dd] = scheduledAt.split(" ")[0].split("-").map(Number);
    const target = new Date(2026, mm - 1, dd);
    const today = new Date(2026, 6, 8);
    const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
    return diff === 0 ? "오늘" : diff > 0 ? `D-${diff}` : "진행됨";
  };

  return (
    <div className="space-y-4 p-4">
      <header className="rounded-xl border bg-card p-4">
        <h1 className="text-lg font-bold">
          {store.name}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            #{store.storeCode}
          </span>
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{store.address}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          담당 OFC {store.ofcName} · 경영주 {store.ownerName}
        </p>
      </header>

      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">AS 현황</TabsTrigger>
          <TabsTrigger value="history">시설 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            진행중 {active.length}건
          </h2>
          {active.map((r) => (
            <section key={r.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {categoryOf(r.categoryCode).name} · {r.requestNo}
                  </p>
                  <p className="mt-0.5 font-semibold">{r.title}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="mt-3 flex items-center gap-4">
                <ProgressRing pct={r.progressPct} size={64} />
                <div className="flex-1 space-y-1 text-sm">
                  {r.scheduledAt && (
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {r.scheduledAt} 방문{" "}
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                        {dday(r.scheduledAt)}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    담당 {r.fmName ?? "배정 중"} ·{" "}
                    {r.partnerName ?? "협력사 선정 중"}
                    {r.workerName && ` · ${r.workerName} 기사`}
                  </p>
                </div>
              </div>

              {r.photos.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    작업 사진
                  </p>
                  <PhotoStrip photos={r.photos} />
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setChatId(r.id)}
                >
                  <MessageCircle className="mr-1 h-4 w-4" /> 대화 참여
                </Button>
                {r.status === "WORK_DONE" && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setConfirmId(r.id);
                      setSigned(false);
                      setRating(0);
                    }}
                  >
                    완료 확인·평가
                  </Button>
                )}
              </div>
            </section>
          ))}
          {active.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              진행중인 AS가 없습니다.
            </p>
          )}

          {closed.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-muted-foreground">
                완료 {closed.length}건
              </h2>
              {closed.map((r) => (
                <section
                  key={r.id}
                  className="rounded-xl border bg-card p-4 opacity-80"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.requestNo}
                      </p>
                    </div>
                    <StarRating value={r.rating ?? 0} size={16} />
                  </div>
                </section>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">① 시설 정보</h3>
            <div className="mt-2 space-y-2">
              {STORE_HISTORY.facilities.map((f) => (
                <div key={f.name} className="rounded-lg bg-secondary p-2.5 text-xs">
                  <p className="font-medium">
                    {f.name}{" "}
                    <span className="text-muted-foreground">({f.model})</span>
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    설치 {f.installed} · 보증 {f.warrantyUntil} · {f.vendor}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">② 최근 해피콜</h3>
            {STORE_HISTORY.happyCalls.map((h) => (
              <p key={h.date} className="mt-2 text-xs text-muted-foreground">
                {h.date} · {h.content}{" "}
                <span className="text-foreground">[{h.sentiment}]</span>
              </p>
            ))}
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">③④ 투자·비용 이력</h3>
            {STORE_HISTORY.costs.map((c) => (
              <div
                key={c.date + c.desc}
                className="mt-2 flex justify-between text-xs"
              >
                <span className="text-muted-foreground">
                  {c.date} · [{c.type}] {c.desc}
                </span>
                <span className="tabular-nums">{c.amount.toLocaleString()}원</span>
              </div>
            ))}
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">⑤ 정기점검</h3>
            {STORE_HISTORY.inspections.map((i) => (
              <p key={i.date} className="mt-2 text-xs text-muted-foreground">
                {i.date} · [{i.kind}] {i.finding}
              </p>
            ))}
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">⑥ 영선 사전 요청</h3>
            {STORE_HISTORY.preMaintenance.map((p) => (
              <p key={p.date} className="mt-2 text-xs text-muted-foreground">
                {p.date} · {p.content} [{p.status}]
              </p>
            ))}
          </section>
        </TabsContent>
      </Tabs>

      {/* 대화 */}
      <Dialog open={!!chatId} onOpenChange={(o) => !o && setChatId(null)}>
        <DialogContent className="max-w-sm p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-base">건별 대화</DialogTitle>
          </DialogHeader>
          {chatId && (
            <RequestChat requestId={chatId} me={PERSONAS.OWNER.name} myRole="OWNER" />
          )}
        </DialogContent>
      </Dialog>

      {/* 완료 확인: 서명 → 별점 */}
      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>작업 완료 확인</DialogTitle>
          </DialogHeader>
          {!signed ? (
            <>
              <p className="text-sm text-muted-foreground">
                작업 내용을 확인하셨다면 아래에 서명해 주세요.
              </p>
              <SignaturePad onDone={() => setSigned(true)} />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                이번 AS 처리에 얼마나 만족하시나요?
              </p>
              <div className="flex justify-center py-2">
                <StarRating value={rating} onChange={setRating} />
              </div>
              <Button
                disabled={rating === 0}
                onClick={() => {
                  confirmClose(confirmId!, rating);
                  setConfirmId(null);
                }}
              >
                평가 제출 · 종결
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
