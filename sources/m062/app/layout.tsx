import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "诗田四季 · 唐诗种植乐园",
  description: "在种植、成长与收获中学会唐诗的儿童互动游戏。",
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
