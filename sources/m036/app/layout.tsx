import type { Metadata } from "next";
import "./globals.css";
import "./fonts-v2.css";

export const metadata: Metadata = {
  title: "山河入图 · 古今中外地图三维展厅",
  description: "近观古今中外地图佳作，漫游三维展厅，在山河沙盘上亲手体验制图方法。",
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
