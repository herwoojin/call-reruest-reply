import { NextResponse } from "next/server";
import {
  isSheetsConfigured,
  writeStoreToSheet,
  type StoreRow,
} from "@/lib/google/sheets";

export const runtime = "nodejs";

/** 웹 관리자 점포 수정 → 시트 양방향 반영 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = (await req.json()) as Partial<StoreRow>;
  const store: StoreRow = { ...(body as StoreRow), id: params.id };

  if (!isSheetsConfigured()) {
    // 미연결 시: 웹 로컬 반영만 (클라이언트가 상태 유지). 시트 쓰기는 생략.
    return NextResponse.json({
      ok: true,
      configured: false,
      persisted: "local",
      store,
    });
  }
  try {
    await writeStoreToSheet(store);
    return NextResponse.json({
      ok: true,
      configured: true,
      persisted: "sheet",
      store,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        message: e instanceof Error ? e.message : "시트 쓰기 실패",
      },
      { status: 502 },
    );
  }
}
