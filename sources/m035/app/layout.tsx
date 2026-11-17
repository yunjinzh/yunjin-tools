import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "智造图谱 · 20设备三维展示",
  description: "浏览20套先进制造设备和智能制造单元，旋转缩放三维模型，探索部件及技术参数。",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
