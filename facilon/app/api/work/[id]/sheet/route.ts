import { NextResponse } from "next/server";
import { createWorkSheet, isSheetsConfigured } from "@/lib/google/sheets";

export const runtime = "nodejs";

/** 작업 건별 상태 구글시트 생성/연동 (일정 확정 시 발행) */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = (await req.json()) as {
    requestNo: string;
    storeName: string;
    title: string;
  };

  if (!isSheetsConfigured() || !process.env.SHEET_TPL_WORK_ID) {
    // 미연결 시: 데모용 안내 URL 반환
    return NextResponse.json({
      ok: true,
      configured: false,
      url: `https://docs.google.com/spreadsheets/d/WORK_DEMO_${params.id}`,
      message: "구글시트 미연결 — 데모 링크. 키·TPL 설정 시 실제 시트 생성.",
    });
  }
  try {
    const { sheetId, url } = await createWorkSheet({ id: params.id, ...body });
    return NextResponse.json({ ok: true, configured: true, sheetId, url });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        message: e instanceof Error ? e.message : "작업 시트 생성 실패",
      },
      { status: 502 },
    );
  }
}
