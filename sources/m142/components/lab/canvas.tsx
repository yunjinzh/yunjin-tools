'use client';
import {useEffect,useRef,useState,forwardRef,useImperativeHandle} from 'react';
import type {LabConfig} from '@/lib/lab/model';
import type {Engine} from './scene-engine';
export type CanvasHandle={view:(v:'home'|'top'|'front')=>void;restart:()=>void;capture:()=>Promise<Blob>};
export const LabCanvas=forwardRef<CanvasHandle,{config:LabConfig;onPick:(id:string)=>void;onProgress:(n:number)=>void}>(({config,onPick,onProgress},ref)=>{
 const host=useRef<HTMLDivElement>(null),engine=useRef<Engine|null>(null),latest=useRef({config,onPick,onProgress});latest.current={config,onPick,onProgress};const [error,setError]=useState(''),[ready,setReady]=useState(false),[retry,setRetry]=useState(0),[compatible,setCompatible]=useState(false);
 useImperativeHandle(ref,()=>({view:v=>engine.current?.view(v),restart:()=>engine.current?.restart(),capture:()=>engine.current?engine.current.capture():Promise.reject(Error('三维场景尚未就绪。'))}),[]);
 useEffect(()=>{let cancelled=false;setReady(false);setError('');import('./scene-engine').then(({createEngine})=>{if(cancelled||!host.current)return;try{engine.current=createEngine(host.current,latest.current.config,id=>latest.current.onPick(id),n=>latest.current.onProgress(n),setError);setCompatible(engine.current.mode==='compatible');setReady(true);}catch(e){setError('当前环境无法初始化WebGL三维场景。可继续参数与流程练习，或换用支持硬件加速的浏览器。');}}).catch(()=>setError('三维组件未载入，请检查网络后重新载入。'));return()=>{cancelled=true;engine.current?.dispose();engine.current=null;};},[retry]);
 useEffect(()=>{engine.current?.update(config);},[config]);
 return <><div ref={host} className="lab-canvas-host"/>{ready&&!error&&<span className="lab-compat-badge">{compatible?'教学模拟 · 草案 · 兼容模式':'教学模拟 · 草案'}</span>}{!ready&&!error&&<div className="lab-scene-message"><i/><strong>正在构建三维教学场景</strong><p>模型、材质与交互工具载入中</p></div>}{error&&<div className="lab-scene-message lab-scene-error" role="alert"><strong>三维视图暂不可用</strong><p>{error}</p><button onClick={()=>setRetry(x=>x+1)}>重新载入场景</button></div>}</>;
});LabCanvas.displayName='LabCanvas';
