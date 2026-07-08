/**
 * 화면별 권한 매트릭스 (PRD F10 / ERD §2.19)
 * page_registry의 page_key와 라우트 경로 매핑.
 * 실제 판정은 middleware(캐시된 page_permissions + user_page_overrides)
 * + RLS 2중 검사 — 이 파일은 키/경로 상수만 정의한다. (Phase 2에서 구현)
 */
export const PAGE_KEYS = [
  "map",
  "request_new",
  "my_requests",
  "my_store",
  "pool",
  "case_detail",
  "orders",
  "quotes",
  "partner_board",
  "worker_today",
  "manuals",
  "stats",
  "reports",
  "admin_users",
  "admin_rules",
  "admin_prices",
  "admin_permissions",
  "admin_manuals",
] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

/** 라우트 prefix → page_key (middleware 검사용) */
export const ROUTE_PAGE_MAP: Record<string, PageKey> = {
  "/map": "map",
  "/request/new": "request_new",
  "/my-requests": "my_requests",
  "/my-store": "my_store",
  "/pool": "pool",
  "/case": "case_detail",
  "/orders": "orders",
  "/quote": "quotes",
  "/board": "partner_board",
  "/today": "worker_today",
  "/manuals": "manuals",
  "/stats": "stats",
  "/permissions": "admin_permissions",
  "/users": "admin_users",
  "/rules": "admin_rules",
  "/prices": "admin_prices",
};
