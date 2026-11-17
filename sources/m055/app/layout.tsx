import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"问卷调研工作台",description:"问卷设计、发布、回收与统计分析工具"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
