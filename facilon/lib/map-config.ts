/**
 * 지도 타일 설정 추상화 (TRD §3.1)
 * OSM 공개 타일은 파일럿 한정 — 전국 오픈 시 이 파일의 URL만
 * OSM 기반 상용 타일(MapTiler 등)로 교체한다 (교체 1곳 원칙).
 */
export const MAP_TILE = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
} as const;

/** 줌 분기 (TRD §3.1): ≤9 서버 집계 버블 / 10–13 markercluster / ≥14 개별 DivIcon */
export const ZOOM_BREAKS = {
  regionBubbleMax: 9,
  clusterMax: 13,
  pctLabelMin: 15, // 진행율 % 텍스트 표시 최소 줌
} as const;

/** 대한민국 전국 뷰 기본값 */
export const KOREA_CENTER: [number, number] = [36.3, 127.8];
export const KOREA_DEFAULT_ZOOM = 7;
