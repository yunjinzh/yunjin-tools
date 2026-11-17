import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"Image to 3D Studio",description:"从单张图片生成可预览与导出的三维模型"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
