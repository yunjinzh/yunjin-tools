import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'知音工坊 · 让知识成为旋律',description:'把文档中的知识，变成值得记住的歌。资料提炼、歌词创作、编曲与演唱方案、AI音乐创作包。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
