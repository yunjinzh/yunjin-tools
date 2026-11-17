import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "城迹 · 中国地标三维图鉴",
  description: "在三维空间探索七座城市的古今地标，切换昼夜，阅读建筑故事，上传自己的 glTF 模型。",
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
