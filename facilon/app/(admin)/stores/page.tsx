"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { StoreRow } from "@/lib/google/sheets";
import { cn } from "@/lib/utils";

const FIELDS: { key: keyof StoreRow; label: string }[] = [
  { key: "ownerName", label: "경영주" },
  { key: "ofcName", label: "OFC" },
  { key: "partnerName", label: "협력사 관리자" },
  { key: "workerName", label: "작업자" },
];

export default function AdminStores() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<StoreRow | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/stores");
    const data = await res.json();
    setStores(data.stores);
    setConfigured(data.configured);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const sync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    const res = await fetch("/api/stores/sync", { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setStores(data.stores);
      setSyncMsg(`✅ ${data.count.toLocaleString()}개 점포 동기화 완료`);
    } else {
      setSyncMsg(`⚠ ${data.message}`);
    }
    setSyncing(false);
  };

  const saveEdit = async () => {
    if (!edit) return;
    setSaving(true);
    const res = await fetch(`/api/stores/${edit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });
    const data = await res.json();
    if (data.ok) {
      // 웹 수정 → 즉시 화면 반영 (시트 연결 시 시트에도 기록됨)
      setStores((prev) => prev.map((s) => (s.id === edit.id ? edit : s)));
      setEdit(null);
    }
    setSaving(false);
  };

  const filtered = stores.filter(
    (s) =>
      s.name.includes(q) ||
      s.storeCode.includes(q) ||
      s.ownerName?.includes(q) ||
      s.ofcName?.includes(q),
  );

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">점포 관리 · 매칭</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          전국 18,000 점포를 구글시트와 양방향 동기화하고, 경영주·OFC·협력사·작업자를
          매칭합니다.
        </p>
      </header>

      {/* 연결 상태 + 동기화 */}
      <section
        className={cn(
          "flex items-center justify-between rounded-xl border p-4",
          configured ? "border-emerald-500/40 bg-card" : "border-amber-500/40 bg-card",
        )}
      >
        <div className="flex items-center gap-2">
          {configured ? (
            <Cloud className="h-5 w-5 text-emerald-400" />
          ) : (
            <CloudOff className="h-5 w-5 text-amber-400" />
          )}
          <div>
            <p className="text-sm font-semibold">
              {configured ? "구글시트 연결됨" : "구글시트 미연결 (로컬 데모)"}
            </p>
            <p className="text-xs text-muted-foreground">
              {configured
                ? "시트 편집 시 앱에 반영, 앱 수정 시 시트에 기록"
                : ".env: GOOGLE_SERVICE_ACCOUNT_JSON, SHEET_STORES_ID 설정 시 활성화"}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={sync} disabled={syncing}>
          <RefreshCw className={cn("mr-1 h-3.5 w-3.5", syncing && "animate-spin")} />
          동기화
        </Button>
      </section>
      {syncMsg && (
        <p className="text-center text-xs text-muted-foreground">{syncMsg}</p>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="점포명·코드·담당자 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          점포를 불러오는 중…
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {filtered.length.toLocaleString()}개 표시
            {stores.length > filtered.length &&
              ` (전체 ${stores.length.toLocaleString()})`}
          </p>
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setEdit({ ...s })}
              className="w-full rounded-xl border bg-card p-3 text-left transition-colors hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {s.name}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    #{s.storeCode} · {s.region}
                  </span>
                </p>
                <span className="text-xs text-primary">수정</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>👤 {s.ownerName || "-"}</span>
                <span>📋 {s.ofcName || "-"}</span>
                <span>🏢 {s.partnerName || "미지정"}</span>
                <span>👷 {s.workerName || "미지정"}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 매칭 수정 다이얼로그 */}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {edit?.name}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                #{edit?.storeCode}
              </span>
            </DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-3">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {f.label}
                  </p>
                  <Input
                    value={(edit[f.key] as string) ?? ""}
                    onChange={(e) =>
                      setEdit({ ...edit, [f.key]: e.target.value })
                    }
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                {configured
                  ? "저장 시 구글시트 해당 행이 갱신됩니다."
                  : "구글시트 미연결 — 저장 시 웹에만 반영됩니다."}
              </p>
              <Button className="w-full" disabled={saving} onClick={saveEdit}>
                {saving ? "저장 중…" : "저장"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
