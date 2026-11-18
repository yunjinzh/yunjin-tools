import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"苗苗汉字学习卡全套1000张核验与交付工作台",description:"学习卡资源清点、交付核验与抽样复核。",icons:{icon:"/favicon.svg"}};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
