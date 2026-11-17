import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"需求分解与质量控制框架图",description:"需求、指标、功能、测试与交付物五级追踪框架"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
