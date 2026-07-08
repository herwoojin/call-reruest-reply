"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Camera, ChevronLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestChat } from "@/components/chat/request-chat";
import { PhotoStrip } from "@/components/photo-strip";
import { ProgressRing } from "@/components/progress-ring";
import { StatusBadge } from "@/components/status-badge";
import { PERSONAS, categoryOf, storeOf, type WorkEvent } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";
import { cn } from "@/lib/utils";

const FLOW: { ev: WorkEvent; label: string }[] = [
  { ev: "DEPART", label: "출발" },
  { ev: "ARRIVE", label: "도착" },
  { ev: "START", label: "작업시작" },
  { ev: "DONE", label: "작업완료" },
];

export default function WorkerJob() {
  const { id } = useParams<{ id: string }>();
  const request = useFacilon((s) => s.requests.find((r) => r.id === id));
  const workEvent = useFacilon((s) => s.workEvent);
  const setProgress = useFacilon((s) => s.setProgress);

  const [pct, setPct] = useState(25);
  const [note, setNote] = useState("");

  if (!request)
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        작업을 찾을 수 없습니다.{" "}
        <Link href="/today" className="text-primary">
          오늘의 작업으로
        </Link>
      </div>
    );

  const store = storeOf(request.storeId);
  const currentIdx = FLOW.findIndex((f) => f.ev === request.workEvent);

  return (
    <div className="space-y-4 p-4">
      <header>
        <Link
          href="/today"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> 오늘의 작업
        </Link>
        <div className="mt-1 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold">{request.title}</h1>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {store.name} · {store.address}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {categoryOf(request.categoryCode).name} · {request.scheduledAt} 방문
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </header>

      <Tabs defaultValue="work">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="work">작업 보고</TabsTrigger>
          <TabsTrigger value="chat">대화</TabsTrigger>
        </TabsList>

        <TabsContent value="work" className="mt-4 space-y-4">
          {/* 상태 버튼 4단계 */}
          <section className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold">현장 상태 보고</p>
            <p className="mt-1 text-xs text-muted-foreground">
              작업시작 시 위치 공유에 동의하게 되며(작업 시간 한정, 72시간 후
              파기), 각 단계 사진이 필요합니다.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {FLOW.map((f, i) => {
                const done = i <= currentIdx;
                const isNext = i === currentIdx + 1;
                return (
                  <button
                    key={f.ev}
                    disabled={!isNext}
                    onClick={() => workEvent(request.id, f.ev)}
                    className={cn(
                      "rounded-xl border p-2 text-xs font-medium",
                      done && "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
                      isNext && "border-primary bg-primary text-primary-foreground",
                      !done && !isNext && "text-muted-foreground opacity-50",
                    )}
                  >
                    {done ? "✓ " : ""}
                    {f.label}
                  </button>
                );
              })}
            </div>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
              <Camera className="h-4 w-4" /> 단계 사진 촬영 (전/중/후 필수)
            </button>
          </section>

          {/* 진행율 위젯 (F6) */}
          {request.status === "IN_PROGRESS" && (
            <section className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">당일 작업 진행율</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    보고 즉시 지도 핀·경영주 화면에 반영됩니다.
                  </p>
                </div>
                <ProgressRing pct={request.progressPct} size={56} stroke={5} />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPct(n)}
                    className={cn(
                      "rounded-xl border py-2 text-sm font-semibold tabular-nums",
                      pct === n && "border-primary bg-primary/15 text-primary",
                    )}
                  >
                    {n}%
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Slider
                  value={[pct]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={([v]) => setPct(v)}
                />
                <p className="mt-1 text-center text-xs tabular-nums text-muted-foreground">
                  {pct}%
                </p>
              </div>
              <Input
                className="mt-2"
                placeholder="코멘트 (예: 배관 교체 중)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                className="mt-3 w-full"
                onClick={() => {
                  setProgress(request.id, pct, note || undefined);
                  setNote("");
                }}
              >
                진행율 {pct}% 보고
              </Button>
            </section>
          )}

          {request.status === "WORK_DONE" && (
            <section className="rounded-xl border border-teal-500/40 bg-card p-4 text-center">
              <p className="font-semibold text-teal-300">작업 완료 보고됨</p>
              <p className="mt-1 text-xs text-muted-foreground">
                경영주 확인 서명을 기다리는 중입니다. 경영주 &lsquo;내
                점포&rsquo; 화면에서 확인·평가가 진행됩니다.
              </p>
            </section>
          )}

          <section className="rounded-xl border bg-card p-4">
            <p className="mb-2 text-sm font-semibold">작업 사진</p>
            <PhotoStrip photos={request.photos} />
          </section>
        </TabsContent>

        <TabsContent value="chat" className="mt-2">
          <div className="rounded-xl border bg-card">
            <RequestChat
              requestId={request.id}
              me={PERSONAS.PARTNER_WORKER.name}
              myRole="PARTNER_WORKER"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
