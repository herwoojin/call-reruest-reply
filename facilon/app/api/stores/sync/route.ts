import { NextResponse } from "next/server";
import { isSheetsConfigured, readStoresFromSheet } from "@/lib/google/sheets";

export const runtime = "nodejs";

/** 구글시트 → 앱 강제 동기화 (관리자 [동기화] 버튼 / pg_cron 대체) */
export async function POST() {
  if (!isSheetsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message:
          "구글시트 미연결 — GOOGLE_SERVICE_ACCOUNT_JSON, SHEET_STORES_ID 설정 후 동기화할 수 있습니다.",
      },
      { status: 200 },
    );
  }
  try {
    const stores = await readStoresFromSheet();
    return NextResponse.json({
      ok: true,
      configured: true,
      count: stores.length,
      syncedAt: new Date().toISOString(),
      stores,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        message: e instanceof Error ? e.message : "동기화 실패",
      },
      { status: 502 },
    );
  }
}
