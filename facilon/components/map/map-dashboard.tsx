"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { KOREA_CENTER, KOREA_DEFAULT_ZOOM, MAP_TILE } from "@/lib/map-config";
import {
  CATEGORIES,
  categoryOf,
  storeOf,
  type FacilityRequest,
} from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

type StatusGroup = "ALL" | "WAITING" | "WORKING" | "DONE";

const GROUP_OF: Record<StatusGroup, (r: FacilityRequest) => boolean> = {
  ALL: () => true,
  WAITING: (r) =>
    ["SUBMITTED", "OPEN_POOL", "CLAIMED", "APPROVING", "APPROVED", "ORDERED", "QUOTED", "QUOTE_APPROVED", "SCHEDULED"].includes(r.status),
  WORKING: (r) => r.status === "IN_PROGRESS",
  DONE: (r) => ["WORK_DONE", "OWNER_CONFIRMED", "CLOSED"].includes(r.status),
};

/** 핀 DivIcon (TRD §3.1): 바탕원=카테고리색, 오버레이=상태 */
function pinIcon(r: FacilityRequest): L.DivIcon {
  const color = categoryOf(r.categoryCode).colorHex;
  let overlay = "";
  let core = "";
  let pulse = "";

  if (r.status === "SUBMITTED" || r.status === "OPEN_POOL") {
    overlay = `<div class="fpin-dashed"></div>`;
  } else if (r.status === "IN_PROGRESS") {
    pulse = "fpin-pulse";
    overlay = `<div class="fpin-ring" style="background:conic-gradient(#34d399 ${r.progressPct * 3.6}deg, rgba(148,163,184,.35) 0)"></div>`;
    core = `${r.progressPct}%`;
  } else if (["WORK_DONE", "OWNER_CONFIRMED", "CLOSED"].includes(r.status)) {
    overlay = `<div class="fpin-badge">✓</div>`;
  } else {
    overlay = `<div class="fpin-badge">⏳</div>`;
  }

  return L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div class="fpin ${pulse}">${overlay}<div class="fpin-core" style="background:${color}">${core}</div></div>`,
  });
}

export function MapDashboard() {
  const requests = useFacilon((s) => s.requests);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [group, setGroup] = useState<StatusGroup>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.status !== "CANCELED" &&
          (!catFilter || r.categoryCode === catFilter) &&
          GROUP_OF[group](r),
      ),
    [requests, catFilter, group],
  );

  const selected = requests.find((r) => r.id === selectedId);
  const counts = {
    WAITING: requests.filter(GROUP_OF.WAITING).length,
    WORKING: requests.filter(GROUP_OF.WORKING).length,
    DONE: requests.filter(GROUP_OF.DONE).length,
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={KOREA_CENTER}
        zoom={KOREA_DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer url={MAP_TILE.url} attribution={MAP_TILE.attribution} maxZoom={MAP_TILE.maxZoom} />
        {visible.map((r) => {
          const s = storeOf(r.storeId);
          return (
            <Marker
              key={`${r.id}-${r.status}-${r.progressPct}`}
              position={[s.lat, s.lng]}
              icon={pinIcon(r)}
              eventHandlers={{ click: () => setSelectedId(r.id) }}
            />
          );
        })}
      </MapContainer>

      {/* 필터바 */}
      <div className="absolute inset-x-0 top-0 z-[1000] space-y-2 p-3">
        <div className="flex gap-1.5 overflow-x-auto">
          {(
            [
              ["ALL", `전체 ${requests.length}`],
              ["WAITING", `대기 ${counts.WAITING}`],
              ["WORKING", `작업중 ${counts.WORKING}`],
              ["DONE", `완료 ${counts.DONE}`],
            ] as [StatusGroup, string][]
          ).map(([g, label]) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={cn(
                "!min-h-0 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur",
                group === g
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background/85 text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setCatFilter(catFilter === c.code ? null : c.code)}
              className={cn(
                "!min-h-0 flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] backdrop-blur",
                catFilter === c.code
                  ? "border-primary bg-primary/20"
                  : "bg-background/85",
              )}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: c.colorHex }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 요약 카드 (핀 클릭) */}
      {selected && (
        <div className="absolute inset-x-3 bottom-3 z-[1000] rounded-xl border bg-card/95 p-4 shadow-xl backdrop-blur">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {storeOf(selected.storeId).name} ·{" "}
                {categoryOf(selected.categoryCode).name}
              </p>
              <p className="truncate font-semibold">{selected.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selected.requestNo}
                {selected.workerName && ` · 작업자 ${selected.workerName}`}
                {selected.scheduledAt && ` · ${selected.scheduledAt}`}
              </p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="!min-h-0 shrink-0 text-muted-foreground"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <StatusBadge status={selected.status} />
            <Link
              href={`/case/${selected.id}`}
              className="text-sm font-medium text-primary"
            >
              상세 보기 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
