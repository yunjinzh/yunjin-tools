import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "论文可视化解读生成器",
  description: "上传论文 PDF，使用自选大模型生成编辑式可视化长图与原文二维码。",
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
        <link
          rel="preload"
          href="/fonts/source-han-serif-sc-700.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
