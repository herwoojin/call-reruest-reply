"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Leaflet은 SSR 불가 (GUIDE §4.1)
const MapDashboard = dynamic(
  () =>
    import("@/components/map/map-dashboard").then((m) => m.MapDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        지도를 불러오는 중…
      </div>
    ),
  },
);

export default function MapPage() {
  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col">
      <header className="z-40 flex items-center gap-2 border-b bg-background px-3 py-3">
        <Link href="/" aria-label="뒤로" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-bold">전국 시설 지도</h1>
        <span className="ml-auto text-[10px] text-muted-foreground">
          © OpenStreetMap contributors
        </span>
      </header>
      <div className="min-h-0 flex-1">
        <MapDashboard />
      </div>
    </div>
  );
}
