import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "四维秀秀 · 3D DIY 创作工作台",
  description: "上传三维模型，自由喷涂、绘画、添加文字与贴纸，导出图片和创作视频。",
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
