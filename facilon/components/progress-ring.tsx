"use client";

import { cn } from "@/lib/utils";

/** SVG 원형 진행율 게이지 — 지도 핀·경영주 홈·작업자 위젯 공용 */
export function ProgressRing({
  pct,
  size = 64,
  stroke = 6,
  className,
  showLabel = true,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  className?: string;
  showLabel?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="stroke-emerald-400 transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      {showLabel && (
        <span
          className="absolute font-bold tabular-nums"
          style={{ fontSize: size / 4 }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}
