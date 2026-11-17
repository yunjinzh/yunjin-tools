import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"PrettyMaps 地图艺术工坊",description:"在线制作并导出风格化地图作品"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
