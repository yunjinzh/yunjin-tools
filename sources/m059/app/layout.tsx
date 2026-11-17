import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "高校教学成效评价知识图谱",
  description: "面向高校课堂教学与学生学习成效的多维评价体系、指标知识图谱与综合评分工具。",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
