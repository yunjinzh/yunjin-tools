import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Splat Studio 3D", description: "从照片与全景视频生成三维高斯模型的工作台" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
