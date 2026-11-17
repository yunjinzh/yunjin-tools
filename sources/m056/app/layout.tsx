import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"供应商协同管理系统",description:"供应商准入、采购需求、报价与履约协同管理"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
