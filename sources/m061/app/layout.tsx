import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoScene OSM 三维场景生成器",
  description: "在地图上框选区域，自动提取 OSM、影像与真实地形，并生成可预览、可导出的三维场景。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
