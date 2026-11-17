import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'视野 FIELDNOTES · YouTube 知识研究站',description:'从可核查的优秀视频，走向下一次创作。地图设计、空间智能、数字孪生与具身智能研究工作台。'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
