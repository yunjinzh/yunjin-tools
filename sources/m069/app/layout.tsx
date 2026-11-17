import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoAI Vision Studio｜影像智能识别平台",
  description: "上传 JPG、PNG、GeoTIFF 影像，识别空间目标并导出包含位置、置信度与属性的 GeoJSON。",
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
