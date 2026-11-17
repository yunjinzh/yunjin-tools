import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORM · AI 人像实验室",
  description:
    "上传一张照片，生成证件照、商务照、写真、表情包、修复照、换装照、场景写真与 AI 头像。",
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
