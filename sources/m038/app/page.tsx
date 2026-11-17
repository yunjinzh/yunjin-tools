"use client";
import dynamic from 'next/dynamic';
const Studio = dynamic(() => import('@/components/studio'), {ssr:false,loading:()=> <div className="opening"><strong>四维秀秀</strong><p>正在准备三维工作台…</p></div>});
export default function Home(){ return <Studio/>; }
