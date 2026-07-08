"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STANDARD_PRICES,
  categoryOf,
  storeOf,
  type QuoteItem,
} from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";
import { cn } from "@/lib/utils";

/** 견적 작성 화면 — 실서비스에서는 구글시트 편집, 여기서는 동일 항목표 UI 목업 */
export default function QuoteEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const request = useFacilon((s) => s.requests.find((r) => r.id === id));
  const quote = useFacilon((s) => s.quotes.find((q) => q.requestId === id));
  const updateQuoteItems = useFacilon((s) => s.updateQuoteItems);
  const submitQuote = useFacilon((s) => s.submitQuote);

  const [rows, setRows] = useState<QuoteItem[]>(
    quote?.items.length
      ? quote.items
      : [{ name: "", spec: "", qty: 1, unitPrice: 0, amount: 0, overStandard: false }],
  );

  if (!request || !quote)
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        발주 건을 찾을 수 없습니다.{" "}
        <Link href="/board" className="text-primary">
          보드로
        </Link>
      </div>
    );

  const stdOf = (name: string) =>
    STANDARD_PRICES.find((p) => p.name === name);

  const setRow = (i: number, patch: Partial<QuoteItem>) =>
    setRows((rs) =>
      rs.map((r, x) => {
        if (x !== i) return r;
        const next = { ...r, ...patch };
        next.amount = next.qty * next.unitPrice;
        const std = stdOf(next.name);
        next.overStandard = !!std && next.unitPrice > std.price;
        return next;
      }),
    );

  const addFromStandard = (code: string) => {
    const p = STANDARD_PRICES.find((x) => x.code === code)!;
    setRows((rs) => [
      ...rs.filter((r) => r.name !== ""),
      { name: p.name, spec: p.spec, qty: 1, unitPrice: p.price, amount: p.price, overStandard: false },
    ]);
  };

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const valid = rows.length > 0 && rows.every((r) => r.name && r.unitPrice > 0);

  const submit = () => {
    updateQuoteItems(request.id, rows);
    submitQuote(request.id);
    router.push("/board");
  };

  return (
    <div className="space-y-4 p-4">
      <header>
        <Link
          href="/board"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> 보드로
        </Link>
        <h1 className="mt-1 text-lg font-bold">견적 작성</h1>
        <p className="text-sm text-muted-foreground">
          {request.requestNo} · {storeOf(request.storeId).name} ·{" "}
          {categoryOf(request.categoryCode).name}
        </p>
        {quote.rejectReason && (
          <p className="mt-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-300">
            반려 사유: {quote.rejectReason} — 수정 후 재제출해 주세요.
          </p>
        )}
      </header>

      <Select onValueChange={addFromStandard}>
        <SelectTrigger>
          <SelectValue placeholder="＋ 표준 단가표에서 품목 추가" />
        </SelectTrigger>
        <SelectContent>
          {STANDARD_PRICES.filter(
            (p) => p.category === request.categoryCode || request.categoryCode === "ETC",
          ).map((p) => (
            <SelectItem key={p.code} value={p.code}>
              {p.name} — {p.price.toLocaleString()}원
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {rows.map((r, i) => {
          const std = stdOf(r.name);
          return (
            <div
              key={i}
              className={cn(
                "rounded-xl border bg-card p-3",
                r.overStandard && "border-red-500/60",
              )}
            >
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder="품목명"
                  value={r.name}
                  onChange={(e) => setRow(i, { name: e.target.value })}
                />
                <button
                  onClick={() => setRows((rs) => rs.filter((_, x) => x !== i))}
                  className="!min-h-0 shrink-0 p-2 text-muted-foreground"
                  aria-label="행 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <Input
                  placeholder="규격"
                  value={r.spec}
                  onChange={(e) => setRow(i, { spec: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="수량"
                  value={r.qty || ""}
                  onChange={(e) => setRow(i, { qty: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="단가"
                  value={r.unitPrice || ""}
                  onChange={(e) => setRow(i, { unitPrice: Number(e.target.value) })}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span
                  className={cn(
                    r.overStandard ? "font-medium text-red-300" : "text-muted-foreground",
                  )}
                >
                  {std
                    ? r.overStandard
                      ? `⚠ 표준단가 ${std.price.toLocaleString()}원 초과`
                      : `표준단가 ${std.price.toLocaleString()}원 이내`
                    : "표준 단가표 외 품목"}
                </span>
                <span className="font-semibold tabular-nums">
                  {r.amount.toLocaleString()}원
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          setRows((rs) => [
            ...rs,
            { name: "", spec: "", qty: 1, unitPrice: 0, amount: 0, overStandard: false },
          ])
        }
      >
        <Plus className="mr-1 h-4 w-4" /> 직접 입력 행 추가
      </Button>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm">합계</span>
          <span className="text-xl font-bold tabular-nums">
            {total.toLocaleString()}원
          </span>
        </div>
        {total > 300000 && (
          <p className="mt-1 text-xs text-amber-400">
            임계값(300,000원) 초과 — FM 승인 시 결재 라인이 생성됩니다.
          </p>
        )}
      </div>

      <Button className="w-full" size="lg" disabled={!valid} onClick={submit}>
        견적 제출 (시트 값 자동 반영)
      </Button>
    </div>
  );
}
