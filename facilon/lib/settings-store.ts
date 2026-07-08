"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "day" | "night" | "paper";
export type FontScale = "normal" | "large";

export const THEME_LABELS: Record<Theme, string> = {
  day: "주간 모드",
  night: "야간 모드",
  paper: "종이질감 모드",
};

export const THEME_DESC: Record<Theme, string> = {
  day: "밝은 백색 배경 — 낮·실내 환경",
  night: "어두운 검정 배경 — 야간·눈부심 감소",
  paper: "따뜻한 종이 질감 — 장시간 열람",
};

interface SettingsState {
  theme: Theme;
  fontScale: FontScale;
  setTheme: (t: Theme) => void;
  setFontScale: (f: FontScale) => void;
  toggleLargeFont: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "night",
      fontScale: "normal",
      setTheme: (theme) => set({ theme }),
      setFontScale: (fontScale) => set({ fontScale }),
      toggleLargeFont: () =>
        set((s) => ({
          fontScale: s.fontScale === "normal" ? "large" : "normal",
        })),
    }),
    { name: "facilon-settings" },
  ),
);
