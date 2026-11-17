import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '空间智能 · 项目知识工作台', description: '让每一份方案，成为下一次创新的起点。项目、知识与交付的一体化工作台。' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="zh-CN"><body>{children}</body></html> }
