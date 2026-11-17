import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "数字孪生空间智能实训平台",
  description:
    "集课程资源、数字资源、AI助教、考试评价、软件实训、孪生场景与空间智能训练于一体的教学实训平台。",
  openGraph: {
    title: "数字孪生空间智能实训平台",
    description: "课程 · 数据 · 场景 · 算法 · 项目实训",
    type: "website",
    images: [
      {
        url: "https://digital-twin-spatial-intelligence.yunjinzh.chatgpt.site/og.png",
        width: 1200,
        height: 630,
        alt: "数字孪生空间智能实训平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "数字孪生空间智能实训平台",
    description: "课程 · 数据 · 场景 · 算法 · 项目实训",
    images: [
      "https://digital-twin-spatial-intelligence.yunjinzh.chatgpt.site/og.png",
    ],
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
