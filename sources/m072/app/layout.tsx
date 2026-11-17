import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"产教融合空间智能教学门户",description:"连接课程、数字资源、工具、实训与行业案例"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
