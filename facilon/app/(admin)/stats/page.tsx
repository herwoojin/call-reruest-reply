"use client";

import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFacilon } from "@/lib/store";

// 주간 추이 목업 (통계 백엔드 연결 전)
const WEEKLY = [
  { week: "6/8", 요청: 42, 완료: 35 },
  { week: "6/15", 요청: 51, 완료: 44 },
  { week: "6/22", 요청: 47, 완료: 49 },
  { week: "6/29", 요청: 58, 완료: 51 },
  { week: "7/6", 요청: 63, 완료: 55 },
];

const REGION = [
  { region: "수도권", 건수: 28 },
  { region: "충청", 건수: 9 },
  { region: "영남", 건수: 14 },
  { region: "호남", 건수: 8 },
  { region: "강원", 건수: 4 },
];

const AXIS = {
  tick: { fontSize: 11, fill: "#94a3b8" },
  axisLine: { stroke: "#334155" },
  tickLine: false as const,
};
const TOOLTIP_STYLE = {
  background: "#101828",
  border: "1px solid #334155",
  borderRadius: 8,
  fontSize: 12,
};

export default function AdminStats() {
  const requests = useFacilon((s) => s.requests);
  const closed = requests.filter((r) => r.status === "CLOSED");
  const rated = closed.filter((r) => r.rating);
  const avgRating = rated.length
    ? (rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length).toFixed(1)
    : "-";

  return (
    <div className="space-y-5 p-4">
      <h1 className="text-xl font-bold">전국 통계</h1>

      <section className="grid grid-cols-3 gap-2">
        {(
          [
            ["접수→배정", "27분", "목표 30분"],
            ["지방 분산율", "34%", "목표 30%"],
            ["평균 만족도", `${avgRating}점`, `${rated.length}건 평가`],
          ] as const
        ).map(([label, v, sub]) => (
          <div key={label} className="rounded-xl border bg-card p-3 text-center">
            <p className="text-xl font-bold tabular-nums">{v}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">주간 요청·완료 추이</h2>
        <div className="mt-3 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={WEEKLY} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
              <XAxis dataKey="week" {...AXIS} />
              <YAxis allowDecimals={false} {...AXIS} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="요청"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#3B82F6" }}
              />
              <Line
                type="monotone"
                dataKey="완료"
                stroke="#EA580C"
                strokeWidth={2}
                dot={{ r: 3, fill: "#EA580C" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">지역별 처리 건수 (이번 달)</h2>
        <div className="mt-3 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REGION} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis dataKey="region" {...AXIS} />
              <YAxis allowDecimals={false} {...AXIS} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.08)" }}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="건수" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <table className="mt-3 w-full text-xs">
          <tbody>
            {REGION.map((r) => (
              <tr key={r.region} className="border-b border-border/50">
                <td className="py-1.5 text-muted-foreground">{r.region}</td>
                <td className="py-1.5 text-right tabular-nums">{r.건수}건</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button className="w-full rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
        📊 월간 리포트 xlsx 다운로드 (백엔드 연결 후)
      </button>
    </div>
  );
}
