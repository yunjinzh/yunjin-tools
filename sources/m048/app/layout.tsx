import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "高校实验室安全分级分类管理系统",
  description: "依据《高等学校实验室安全分级分类管理办法（试行）》设计的交互式安全治理原型。",
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
