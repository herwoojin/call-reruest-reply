"use client";

import { create } from "zustand";
import {
  type ApprovalStep,
  type ChatMessage,
  type FacilityRequest,
  type PermMatrix,
  type Quote,
  type WorkEvent,
  DEFAULT_PERMISSIONS,
  INITIAL_APPROVALS,
  INITIAL_CHATS,
  INITIAL_QUOTES,
  INITIAL_REQUESTS,
  USERS,
} from "./mock-data";
import type { RequestStatus, Role } from "./status-machine";

/**
 * UI Phase 전용 인메모리 스토어 — Firebase 연결 시 Firestore 훅으로 치환.
 * 화면 간 상태 연동(접수→발주→진행율→완료)이 실제로 흐르는 것이 목적.
 */

const now = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

let chatSeq = 100;
let reqSeq = 100;

interface FacilonState {
  requests: FacilityRequest[];
  quotes: Quote[];
  chats: ChatMessage[];
  approvals: Record<string, ApprovalStep[]>;
  permissions: PermMatrix;
  users: typeof USERS;

  addRequest: (
    r: Pick<
      FacilityRequest,
      "storeId" | "categoryCode" | "title" | "description" | "preferredDate"
    > & { estimatedCost?: number },
  ) => FacilityRequest;
  claim: (id: string, fmName: string) => void;
  order: (id: string, partnerName: string) => void;
  updateQuoteItems: (requestId: string, items: Quote["items"]) => void;
  submitQuote: (requestId: string) => void;
  decideQuote: (requestId: string, approve: boolean, reason?: string) => void;
  schedule: (
    id: string,
    workerName: string,
    at: string,
    sheetUrl?: string,
  ) => void;
  workEvent: (id: string, ev: WorkEvent) => void;
  setProgress: (id: string, pct: number, note?: string) => void;
  confirmClose: (id: string, rating: number) => void;
  sendMessage: (requestId: string, sender: string, role: Role, content: string) => void;
  togglePermission: (page: keyof PermMatrix, role: Role) => void;
  setUserRole: (userId: string, role: Role) => void;
}

export const useFacilon = create<FacilonState>((set, get) => {
  const patch = (id: string, p: Partial<FacilityRequest>) =>
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, ...p } : r)),
    }));

  const sys = (
    requestId: string,
    content: string,
    type: ChatMessage["type"] = "system",
  ) =>
    set((s) => ({
      chats: [
        ...s.chats,
        { id: ++chatSeq, requestId, sender: null, type, content, at: now() },
      ],
    }));

  return {
    requests: INITIAL_REQUESTS,
    quotes: INITIAL_QUOTES,
    chats: INITIAL_CHATS,
    approvals: INITIAL_APPROVALS,
    permissions: DEFAULT_PERMISSIONS,
    users: USERS,

    addRequest: (r) => {
      const d = new Date();
      const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
      const req: FacilityRequest = {
        id: `R${++reqSeq}`,
        requestNo: `FR-${ymd}-${String(reqSeq).padStart(4, "0")}`,
        status: "OPEN_POOL", // trg_routing 목업: 등록 즉시 전국 풀 공개
        progressPct: 0,
        requesterName: "박운영",
        workEvent: "NONE",
        createdAt: now(),
        photos: [],
        ...r,
      };
      set((s) => ({ requests: [req, ...s.requests] }));
      sys(req.id, "박운영 OFC가 요청을 등록했습니다. 전국 풀에 공개되었습니다.");
      return req;
    },

    claim: (id, fmName) => {
      const target = get().requests.find((r) => r.id === id);
      if (!target || target.status !== "OPEN_POOL") return; // 원자 처리 목업
      patch(id, { status: "CLAIMED", fmName, delayed: false });
      sys(id, `${fmName} FM이 접수했습니다.`);
    },

    order: (id, partnerName) => {
      patch(id, { status: "ORDERED", partnerName });
      const req = get().requests.find((r) => r.id === id)!;
      set((s) => ({
        quotes: [
          ...s.quotes,
          {
            id: `Q-${id}`,
            requestId: id,
            partnerName,
            round: 1,
            items: [],
            totalAmount: 0,
            status: "DRAFT",
            sheetUrl: `https://docs.google.com/spreadsheets/d/TPL_DEMO_${id}`,
          },
        ],
      }));
      sys(id, `${partnerName}에 발주되었습니다. 견적서 시트가 발행되었습니다. (${req.requestNo})`, "quote");
    },

    updateQuoteItems: (requestId, items) =>
      set((s) => ({
        quotes: s.quotes.map((q) =>
          q.requestId === requestId
            ? {
                ...q,
                items,
                totalAmount: items.reduce((sum, it) => sum + it.amount, 0),
              }
            : q,
        ),
      })),

    submitQuote: (requestId) => {
      set((s) => ({
        quotes: s.quotes.map((q) =>
          q.requestId === requestId ? { ...q, status: "SUBMITTED" } : q,
        ),
      }));
      const q = get().quotes.find((q) => q.requestId === requestId);
      patch(requestId, { status: "QUOTED" });
      sys(
        requestId,
        `견적이 제출되었습니다 — ${q ? q.totalAmount.toLocaleString() : 0}원`,
        "quote",
      );
    },

    decideQuote: (requestId, approve, reason) => {
      const q = get().quotes.find((q) => q.requestId === requestId);
      if (approve) {
        set((s) => ({
          quotes: s.quotes.map((x) =>
            x.requestId === requestId ? { ...x, status: "APPROVED" } : x,
          ),
        }));
        patch(requestId, { status: "QUOTE_APPROVED", finalCost: q?.totalAmount });
        sys(requestId, `견적이 승인되었습니다 — 확정 ${q?.totalAmount.toLocaleString()}원`, "quote");
      } else {
        set((s) => ({
          quotes: s.quotes.map((x) =>
            x.requestId === requestId
              ? { ...x, status: "REJECTED", rejectReason: reason }
              : x,
          ),
        }));
        patch(requestId, { status: "ORDERED" });
        sys(requestId, `견적이 반려되었습니다 — ${reason ?? "사유 미기재"}. 시트 수정 후 재제출해 주세요.`, "quote");
      }
    },

    schedule: (id, workerName, at, sheetUrl) => {
      patch(id, { status: "SCHEDULED", workerName, scheduledAt: at });
      sys(id, `방문 일정 확정: ${at} (작업자 ${workerName})`, "schedule");
      if (sheetUrl) {
        sys(id, `작업 현황 구글시트가 발행되었습니다: ${sheetUrl}`, "system");
      }
    },

    workEvent: (id, ev) => {
      if (ev === "START") {
        patch(id, { workEvent: ev, status: "IN_PROGRESS" });
        sys(id, "작업이 시작되었습니다.");
      } else if (ev === "DONE") {
        patch(id, { workEvent: ev, status: "WORK_DONE", progressPct: 100 });
        sys(id, "작업이 완료되었습니다. 경영주 확인을 기다립니다.");
      } else {
        patch(id, { workEvent: ev });
        sys(id, ev === "DEPART" ? "작업자가 출발했습니다." : "작업자가 현장에 도착했습니다.");
      }
    },

    setProgress: (id, pct, note) => {
      patch(id, { progressPct: pct });
      sys(id, `진행율 ${pct}%${note ? ` — ${note}` : ""}`, "progress");
    },

    confirmClose: (id, rating) => {
      patch(id, { status: "CLOSED", rating });
      sys(id, `경영주 확인 완료 — 만족도 ${"★".repeat(rating)} (${rating}/5). 종결되었습니다.`);
    },

    sendMessage: (requestId, sender, role, content) =>
      set((s) => ({
        chats: [
          ...s.chats,
          {
            id: ++chatSeq,
            requestId,
            sender,
            senderRole: role,
            type: "text",
            content,
            at: now(),
          },
        ],
      })),

    togglePermission: (page, role) =>
      set((s) => ({
        permissions: {
          ...s.permissions,
          [page]: { ...s.permissions[page], [role]: !s.permissions[page][role] },
        },
      })),

    setUserRole: (userId, role) =>
      set((s) => ({
        users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)),
      })),
  };
});

/** 요청 목록에서 파생 통계 (관리자 대시보드) */
export const countByStatus = (
  requests: FacilityRequest[],
): Record<string, number> =>
  requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

export type { RequestStatus };
