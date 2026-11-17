import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "光境 · 户型与光影设计台",
  description: "二维户型、三维布置、材质搭配与全天日照的一体化设计工具。",
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
