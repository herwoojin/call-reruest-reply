import "server-only";
import { google } from "googleapis";

/**
 * 구글시트 연동 (서버 전용, Node 런타임 Route Handler에서 호출)
 * - 서비스 계정 키(GOOGLE_SERVICE_ACCOUNT_JSON, base64)로 인증
 * - 자격증명/시트 ID 미설정 시 isSheetsConfigured=false → 라우트가 목업 폴백
 * TRD §3.6 방식 A. 실패 시 절대 예외를 던지지 않고 폴백 신호를 반환한다.
 */

export interface StoreRow {
  id: string;
  storeCode: string;
  name: string;
  region: string;
  address: string;
  lat: number;
  lng: number;
  ownerName: string;
  ofcName: string;
  partnerName?: string;
  workerName?: string;
}

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

export function isSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.SHEET_STORES_ID,
  );
}

function getAuth() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON!;
  const credentials = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  return new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
}

/** 점포 마스터 시트 → StoreRow[] (헤더 고정: 열 순서는 아래 STORE_COLS) */
const STORE_COLS = [
  "id",
  "storeCode",
  "name",
  "region",
  "address",
  "lat",
  "lng",
  "ownerName",
  "ofcName",
  "partnerName",
  "workerName",
] as const;

export async function readStoresFromSheet(): Promise<StoreRow[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_STORES_ID!,
    range: "점포!A2:K", // A1은 헤더
  });
  const rows: string[][] = (res.data.values as string[][]) ?? [];
  return rows.map((r) => {
    const obj: Record<string, string> = {};
    STORE_COLS.forEach((c, i) => (obj[c] = r[i] ?? ""));
    return {
      id: obj.id,
      storeCode: obj.storeCode,
      name: obj.name,
      region: obj.region,
      address: obj.address,
      lat: Number(obj.lat) || 0,
      lng: Number(obj.lng) || 0,
      ownerName: obj.ownerName,
      ofcName: obj.ofcName,
      partnerName: obj.partnerName || undefined,
      workerName: obj.workerName || undefined,
    };
  });
}

/** 웹 관리자 수정 → 시트 특정 행 갱신 (id로 행 탐색 후 update) */
export async function writeStoreToSheet(store: StoreRow): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.SHEET_STORES_ID!;

  const idCol = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "점포!A2:A",
  });
  const ids: string[] = ((idCol.data.values as string[][]) ?? []).map(
    (r) => r[0],
  );
  const rowIndex = ids.findIndex((v: string) => v === store.id);
  const values = [STORE_COLS.map((c) => String(store[c] ?? ""))];

  if (rowIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "점포!A2:K",
      valueInputOption: "RAW",
      requestBody: { values },
    });
  } else {
    const rowNo = rowIndex + 2; // A2 기준
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `점포!A${rowNo}:K${rowNo}`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }
}

/** 작업 건별 상태 시트 생성 (TPL 복제) → 시트 URL 반환 */
export async function createWorkSheet(request: {
  id: string;
  requestNo: string;
  storeName: string;
  title: string;
}): Promise<{ sheetId: string; url: string }> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const copy = await drive.files.copy({
    fileId: process.env.SHEET_TPL_WORK_ID!,
    requestBody: { name: `작업_${request.requestNo}_${request.storeName}` },
  });
  const sheetId = copy.data.id!;
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: "A1:B4",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        ["요청번호", request.requestNo],
        ["점포", request.storeName],
        ["작업명", request.title],
        ["상태", "일정확정"],
      ],
    },
  });
  return {
    sheetId,
    url: `https://docs.google.com/spreadsheets/d/${sheetId}`,
  };
}
