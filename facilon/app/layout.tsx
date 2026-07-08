import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { themeInitScript } from "@/components/theme-sync";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GS25시설요청관리 — 편의점 시설 AS 통합 관리",
  description:
    "전국 편의점 시설물 AS를 디지털트윈 지도로 접수·배정·발주·작업·완료까지 실시간 관리",
  applicationName: "GS25시설요청관리",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 테마는 설정 스토어(주간/야간/종이질감)로 제어 — 기본 야간
    <html lang="ko" data-theme="night" data-font="normal" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
