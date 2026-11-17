import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'地图研习社 · MAP ATELIER',description:'从高播放、高点赞的地图设计作品中学习。精选制图原理、视觉表达、地形与动态地图，支持收藏和学习笔记。',metadataBase:new URL('https://map-design-learning.yunjinzh.chatgpt.site'),manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/icons/icon-192.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><head><meta name="map-atelier-shell" content="1"/><meta name="theme-color" content="#263e35"/></head><body>{children}</body></html>}
