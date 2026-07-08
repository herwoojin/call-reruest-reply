"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/settings-store";

/** 설정 스토어의 테마·글자 크기를 <html> 속성에 반영 */
export function ThemeSync() {
  const theme = useSettings((s) => s.theme);
  const fontScale = useSettings((s) => s.fontScale);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-font", fontScale);
  }, [theme, fontScale]);

  return null;
}

/** 하이드레이션 전 깜빡임 방지 — localStorage 값을 즉시 <html>에 적용 */
export const themeInitScript = `
(function(){try{
  var s=JSON.parse(localStorage.getItem('facilon-settings')||'{}').state||{};
  document.documentElement.setAttribute('data-theme', s.theme||'night');
  document.documentElement.setAttribute('data-font', s.fontScale||'normal');
}catch(e){
  document.documentElement.setAttribute('data-theme','night');
  document.documentElement.setAttribute('data-font','normal');
}})();
`;
