import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'数字教材政策合规与实训任务验收工作台',description:'昆明冶金职业大学 · 政策、项目、任务与证据的全过程审查',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
