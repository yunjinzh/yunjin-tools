import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"智枢 · 工业数字孪生调度中心",description:"工业数字孪生调度与决策交互演示，覆盖生产、人员、车辆、设备、事件回放及数据治理。",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN" className="swiss-paper"><body><svg className="print-filter" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><filter id="paper-grain" x="0%" y="0%" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" seed="17"/><feColorMatrix type="saturate" values="0"/></filter></defs></svg>{children}<div className="paper-grain" aria-hidden="true"/></body></html>}
