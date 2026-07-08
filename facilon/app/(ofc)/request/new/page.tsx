"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORIES,
  MOCK_PRECHECK,
  PERSONAS,
  STORES,
  type StoreInfo,
} from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";
import { cn } from "@/lib/utils";

const SYMPTOMS: Record<string, string[]> = {
  COLD: ["온도 이상", "성에 과다", "소음", "누수(응축수)"],
  SIGN: ["부분 소등", "완전 소등", "파손·흔들림"],
  COFFEE: ["추출 불량", "전원 불량", "누수"],
  ELEC: ["스파크·누전", "조명 꺼짐", "차단기 떨어짐"],
  INTERIOR: ["문·창 불량", "바닥·벽 파손", "집기 파손"],
  PLUMB: ["누수", "배수 역류", "수압 저하"],
  ETC: ["기타 증상"],
};

export default function RequestWizard() {
  const addRequest = useFacilon((s) => s.addRequest);
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const [symptom, setSymptom] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [preferred, setPreferred] = useState("");
  const [doneNo, setDoneNo] = useState<string | null>(null);

  // 담당 점포 (박운영 OFC)
  const myStores = STORES.filter((s) => s.ofcName === PERSONAS.OFC.name);
  const filtered = myStores.filter(
    (s) => s.name.includes(query) || s.storeCode.includes(query),
  );

  // AI 사전 검토 목업 호출 (Phase 4에서 /api/ai/precheck 연결)
  useEffect(() => {
    if (step === 3 && !aiDone) {
      setAiLoading(true);
      const t = setTimeout(() => {
        setAiLoading(false);
        setAiDone(true);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [step, aiDone]);

  const submit = () => {
    const req = addRequest({
      storeId: store!.id,
      categoryCode: cat!,
      title: title || `${symptom} 조치 요청`,
      description: desc,
      preferredDate: preferred || "협의",
      estimatedCost: MOCK_PRECHECK.estimated_cost_range[1],
    });
    setDoneNo(req.requestNo);
  };

  if (doneNo) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 pt-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-400" />
        <h1 className="text-xl font-bold">요청이 등록되었습니다</h1>
        <p className="rounded-lg bg-secondary px-4 py-2 font-mono text-sm">
          {doneNo}
        </p>
        <p className="text-sm text-muted-foreground">
          전국 시설담당자 풀에 공개되었습니다.
          <br />
          접수되면 알림으로 알려드릴게요.
        </p>
        <div className="grid w-full gap-2">
          <Button asChild>
            <Link href="/my-requests">내 요청에서 추적하기</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/home">홈으로</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">시설 요청 등록</h1>
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                n <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {step}/4 ·{" "}
          {["점포 선택", "카테고리·증상", "AI 사전 검토", "상세 입력"][step - 1]}
        </p>
      </header>

      {step === 1 && (
        <section className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="점포명·점포코드 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setStore(s)}
              className={cn(
                "w-full rounded-xl border bg-card p-3 text-left",
                store?.id === s.id && "border-primary ring-1 ring-primary",
              )}
            >
              <p className="font-semibold">
                {s.name}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  #{s.storeCode}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{s.address}</p>
            </button>
          ))}
          <Button className="w-full" disabled={!store} onClick={() => setStep(2)}>
            다음
          </Button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">카테고리</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCat(c.code);
                    setSymptom(null);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border bg-card p-3 text-sm",
                    cat === c.code && "border-primary ring-1 ring-primary",
                  )}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: c.colorHex }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          {cat && (
            <div>
              <p className="mb-2 text-sm font-medium">증상</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS[cat].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSymptom(s)}
                    className={cn(
                      "!min-h-0 rounded-full border px-3 py-1.5 text-sm",
                      symptom === s && "border-primary bg-primary/15 text-primary",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              이전
            </Button>
            <Button
              className="flex-1"
              disabled={!cat || !symptom}
              onClick={() => setStep(3)}
            >
              다음
            </Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3">
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> AI 사전 검토
            </p>
            {aiLoading ? (
              <p className="mt-3 animate-pulse text-sm text-muted-foreground">
                {store?.name}의 시설 이력 6종을 분석하는 중…
              </p>
            ) : (
              <div className="mt-3 space-y-3 text-sm">
                <p>{MOCK_PRECHECK.history_summary}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    보증: {MOCK_PRECHECK.warranty_status}
                  </span>
                  <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-300">
                    예상 {MOCK_PRECHECK.estimated_cost_range[0].toLocaleString()}~
                    {MOCK_PRECHECK.estimated_cost_range[1].toLocaleString()}원
                  </span>
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                    의견: {MOCK_PRECHECK.opinion}
                  </span>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-xs">
                  <p className="font-medium">유사 사례</p>
                  {MOCK_PRECHECK.similar_cases.map((c) => (
                    <p key={c.date} className="mt-1 text-muted-foreground">
                      {c.date} · {c.result} · {c.cost.toLocaleString()}원
                    </p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 {MOCK_PRECHECK.opinion_reason}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
              이전
            </Button>
            <Button className="flex-1" disabled={aiLoading} onClick={() => setStep(4)}>
              확인, 계속 진행
            </Button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-3">
          <div>
            <p className="mb-1.5 text-sm font-medium">제목</p>
            <Input
              placeholder={`예: ${symptom} 발생`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">상세 내용</p>
            <Textarea
              rows={4}
              placeholder="증상이 언제부터, 어떤 상황에서 발생하는지 적어주세요."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">현장 사진</p>
            <button className="w-full rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
              + 사진 추가 (촬영/앨범) — WebP 자동 변환
            </button>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">희망 방문 일정</p>
            <Input
              placeholder="예: 07-10 오전"
              value={preferred}
              onChange={(e) => setPreferred(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
              이전
            </Button>
            <Button className="flex-1" disabled={!desc} onClick={submit}>
              요청 제출
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
