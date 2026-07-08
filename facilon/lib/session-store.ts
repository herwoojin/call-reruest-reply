"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "./status-machine";

export interface Session {
  role: Role;
  name: string;
  /** OWNER 전용 */
  storeId?: string;
  storeName?: string;
  /** PARTNER_* 전용 */
  company?: string;
  /** OFC 전용 */
  email?: string;
  /** 로그인 계정 식별자 */
  accountId?: string;
}

interface SessionState {
  session: Session | null;
  hydrated: boolean;
  login: (s: Session) => void;
  logout: () => void;
  _setHydrated: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,
      login: (session) => set({ session }),
      logout: () => set({ session: null }),
      _setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "facilon-session",
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
);
