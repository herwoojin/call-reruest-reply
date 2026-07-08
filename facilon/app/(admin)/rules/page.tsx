"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES } from "@/lib/mock-data";

const SLA_DEFAULT: Record<string, number> = {
  COLD: 4, SIGN: 24, COFFEE: 24, ELEC: 4, INTERIOR: 48, PLUMB: 12, ETC: 48,
};

export default function AdminRules() {
  const [threshold, setThreshold] = useState(300000);
  const [ownerDirect, setOwnerDirect] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">라우팅·결재 규칙</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          전국 풀 공개·SLA·전결 임계값 설정
        </p>
      </header>

      <section className="rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold">결재 임계값 (FM 전결 한도)</p>
        <p className="mt-1 text-xs text-muted-foreground">
          이 금액 초과 건은 파트장→영업팀장→지역장→부담당자 4단계 합의·결재를
          거칩니다. 견적 제출 시점에 재평가됩니다.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="text-right tabular-nums"
          />
          <span className="shrink-0 text-sm">원</span>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">경영주 직접 요청 개방</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              기본 OFF — 요청 등록 주체는 OFC입니다.
            </p>
          </div>
          <Switch checked={ownerDirect} onCheckedChange={setOwnerDirect} />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold">카테고리별 SLA (접수 기한)</p>
        <div className="mt-3 space-y-2">
          {CATEGORIES.map((c) => (
            <div key={c.code} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.colorHex }}
              />
              <span className="flex-1">{c.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {SLA_DEFAULT[c.code]}시간
              </span>
            </div>
          ))}
        </div>
      </section>

      <Button className="w-full" onClick={() => setSaved(true)}>
        저장
      </Button>
      {saved && (
        <p className="text-center text-xs text-emerald-400">
          저장되었습니다 — 신규 요청부터 적용됩니다.
        </p>
      )}
    </div>
  );
}
