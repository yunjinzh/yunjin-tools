import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "画间 · ListenHub 批量制图",
  description: "让灵感成组呈现。使用自己的 ListenHub API Key，批量生成、管理与下载图片。",
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
