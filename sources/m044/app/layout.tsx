import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "诗词山河｜四年级古诗四阶背诵游戏",
  description: "现行人教版四年级上下册18首古典诗词，借助诗境插画、四阶闯关和间隔复习培养自主背诵能力。",
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
