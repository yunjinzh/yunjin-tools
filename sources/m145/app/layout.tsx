import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "项目交付协同工作台 · 数字孪生与空间智能",
  description:
    "数字孪生与空间智能项目的需求、方案评审、投标及交付验收协同工作区。",
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
