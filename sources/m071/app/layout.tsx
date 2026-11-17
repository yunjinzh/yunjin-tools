import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"飞渡岗位能力与知识图谱",description:"数字孪生岗位任务、能力、知识与课程关联图谱"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
