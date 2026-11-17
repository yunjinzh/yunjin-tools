import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "四年级语文AI自主学习平台",
  description: "基于四年级上册语文教材课后要求设计的全册交互式自主学习平台，包含听读、语音跟练、达标题、表达练习、错题本与双模式AI学习伙伴。",
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
      <head><meta name="codex-preview" content="development" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
