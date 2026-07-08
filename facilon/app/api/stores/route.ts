import { NextResponse } from "next/server";
import {
  isSheetsConfigured,
  readStoresFromSheet,
  type StoreRow,
} from "@/lib/google/sheets";
import { STORES } from "@/lib/mock-data";

export const runtime = "nodejs";

const mockStores = (): StoreRow[] =>
  STORES.map((s) => ({
    id: s.id,
    storeCode: s.storeCode,
    name: s.name,
    region: s.region,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    ownerName: s.ownerName,
    ofcName: s.ofcName,
  }));

/** 점포 목록 조회 — 시트 연결 시 시트 원본, 아니면 목업 */
export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({
      source: "mock",
      configured: false,
      stores: mockStores(),
    });
  }
  try {
    const stores = await readStoresFromSheet();
    return NextResponse.json({ source: "sheet", configured: true, stores });
  } catch (e) {
    return NextResponse.json({
      source: "mock",
      configured: true,
      error: e instanceof Error ? e.message : "시트 읽기 실패",
      stores: mockStores(),
    });
  }
}
