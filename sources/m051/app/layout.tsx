import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agent-business-guide.yunjinzh.chatgpt.site"),
  title: "Agent时代做生意：零基础图解",
  description: "用一张图和五个认知翻转，看懂 Agent 如何改变产品、团队与生意。",
  openGraph: {
    title: "Agent时代做生意：零基础图解",
    description: "100条反常识，一张图看懂。",
    type: "website",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "Agent时代做生意：零基础图解" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent时代做生意：零基础图解",
    description: "100条反常识，一张图看懂。",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
