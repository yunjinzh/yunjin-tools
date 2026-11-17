import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'CIM研习社 · 自主学习与实训中心',description:'从理解空间数据，到独立完成CIM任务。36个微课、11段原始操作视频与交互实训，陪你建立完整的平台操作能力。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
