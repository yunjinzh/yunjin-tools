import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paper-visual-guide.yunjinzh.chatgpt.site"),
  title: "论文零基础大图解",
  description: "用大图和少量文字，看懂京津冀地下水储量预测研究。",
  openGraph: {
    title: "京津冀地下水，未来会怎样？",
    description: "空间 × 时间 × 三种情景，一张图看懂地下水预测研究。",
    type: "website",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "京津冀地下水，未来会怎样？" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "京津冀地下水，未来会怎样？",
    description: "空间 × 时间 × 三种情景",
    images: ["/og.png"],
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
