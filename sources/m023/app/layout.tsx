import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EV-SIM · 新能源汽修实训",
  description: "电池拆装、故障诊断与教学考核虚拟实训工作台",
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
