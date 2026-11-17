import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MUSE 资源展示平台",
  description: "会员制图片与 PPT 资源展示、预览及下载平台。",
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
