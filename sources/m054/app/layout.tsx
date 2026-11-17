import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "云金｜空间与数字孪生作品集",
  description: "空间信息产品设计、GIS、数字孪生与时空数据实践作品集。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/fonts/source-han-serif-sc-vf/font.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
