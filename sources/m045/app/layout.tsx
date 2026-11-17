import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "四年级数学AI自主学习平台",
  description: "人教版四年级数学上册全册交互学习平台：教材原页、自主探究、分步解题、即时诊断与教师导学。",
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
