import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoModel · 通用三维模型浏览器",
  description: "在浏览器本地查看 FBX、GLB、GLTF、IFC、STEP、STL、OBJ、PLY、3MF、DAE 等三维模型。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
