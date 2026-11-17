import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export const metadata: Metadata = {
  title: "DTS 数字孪生学习门户｜从入门到精通",
  description:
    "基于 DTS 白皮书、Engine、Explorer、Cloud 与 SDK 资料构建的数字孪生实战学习门户。",
  keywords: ["数字孪生", "DTS", "Engine", "Explorer", "Cloud", "SDK"],
  authors: [{ name: "DTS Digital Twin Academy" }],
  openGraph: {
    title: "DTS 数字孪生学习门户",
    description: "从数据处理、场景搭建、云端发布到 SDK 二次开发。",
    type: "website",
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
      <body>
        <a className="skip-link" href="#main-content">跳到正文</a>
        <svg className="paper-noise" aria-hidden="true">
          <filter id="paperNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="3"
              seed="8"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#paperNoise)" />
        </svg>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
