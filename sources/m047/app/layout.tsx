import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的 ChatGPT Sites 总门户",
  description: "集中管理并快速访问过去与未来创建的 ChatGPT Sites。",
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
