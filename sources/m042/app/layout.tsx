import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "观 · 无界画廊",
  description: "在六个不同形状的展厅中探索世界名画，体验昼夜光影，自由布置你的艺术空间。",
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
