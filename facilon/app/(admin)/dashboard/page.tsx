"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORIES } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";

export default function AdminDashboard() {
  const requests = useFacilon((s) => s.requests);

  const open = requests.filter((r) => r.status === "OPEN_POOL").length;
  const working = requests.filter((r) => r.status === "IN_PROGRESS").length;
  const closed = requests.filter((r) => r.status === "CLOSED").length;
  const delayed = requests.filter((r) => r.delayed).length;

  const byCat = CATEGORIES.map((c) => ({
    name: c.name.slice(0, 4),
    건수: requests.filter((r) => r.categoryCode === c.code).length,
  })).filter((d) => d.건수 > 0);

  return (
    <div className="space-y-5 p-4">
      <h1 className="text-xl font-bold">본부 대시보드</h1>

      <section className="grid grid-cols-2 gap-2">
        {(
          [
            ["전체 요청", requests.length, ""],
            ["접수 대기", open, delayed ? `지연 ${delayed}건` : ""],
            ["작업중", working, ""],
            ["종결", closed, ""],
          ] as const
        ).map(([label, n, sub]) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-3xl font-bold tabular-nums">{n}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            {sub && <p className="mt-0.5 text-xs text-amber-400">{sub}</p>}
          </div>
        ))}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">카테고리별 요청 건수</h2>
        <div className="mt-3 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCat} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.08)" }}
                contentStyle={{
                  background: "#101828",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="건수" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        {[
          { href: "/rules", label: "라우팅·결재 규칙", desc: "임계값 30만원" },
          { href: "/manuals", label: "매뉴얼 관리", desc: `${5}종 배포됨` },
          { href: "/permissions", label: "권한 매트릭스", desc: "역할×화면" },
          { href: "/prices", label: "표준 단가표", desc: "시트 동기화" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border bg-card p-3 transition-colors hover:bg-accent"
          >
            <p className="text-sm font-semibold">{l.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{l.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
