'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,LoaderCircle,BookOpen,Check,ChevronRight,Clock3} from 'lucide-react';
export type Any=any;
export async function api(path:string,body?:any){const r=await fetch('/api/'+path,{method:body===undefined?'GET':'POST',headers:body instanceof FormData?{}:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});const d:any=await r.json();if(!r.ok)throw new Error(d.error||'连接暂时中断，请重试');return d;}
export const duration=(s=0)=>s>=3600?`${Math.floor(s/3600)}小时${Math.floor(s%3600/60)}分`:`${Math.floor(s/60)}分${Math.floor(s%60)}秒`;
export const clock=(s=0)=>`${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;
export const date=(s:number)=>new Date(s).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai',month:'short',day:'numeric'});
export function Button({children,onClick,variant='',disabled=false,type='button',className=''}:any){return <button type={type} className={'button '+variant+' '+className} onClick={onClick} disabled={disabled}>{children}</button>}
export function Empty({title,children,action}:any){return <div className="empty"><BookOpen size={30}/><h3>{title}</h3><p>{children}</p>{action}</div>}
export function Tag({children,tone=''}:any){return <span className={'tag '+tone}>{children}</span>}
export function Bar({value=0}:any){return <div className="bar" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}><span style={{width:Math.min(100,Math.max(0,value))+'%'}}/></div>}
export function SectionHead({eyebrow,title,children,action}:any){return <div className="section-heading"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{children&&<p>{children}</p>}</div>{action}</div>}
export function Source({pages=[],videoId,time,onVideo}:any){return <div className="source"><BookOpen size={14}/><span>资料依据</span>{pages.length>0&&<a href={'/documents/cim-whitepaper-2022.pdf#page='+pages[0]} target="_blank" rel="noreferrer">白皮书 P{pages.join('、')} <ArrowUpRight size={12}/></a>}{videoId&&onVideo&&<button onClick={()=>onVideo(videoId,time||0)}>视频 {videoId.toUpperCase()} {time!=null?clock(time):''}<ChevronRight size={12}/></button>}</div>}
export function Busy(){return <span className="busy"><LoaderCircle className="spin" size={17}/>正在保存…</span>}
export function useActivity(kind:string,lessonId:string,enabled:boolean,video?:{playing:boolean,position:number}){
 const ref=useRef({kind,lessonId,enabled,video});ref.current={kind,lessonId,enabled,video};const [sync,setSync]=useState('已同步');
 useEffect(()=>{let last=Date.now(),active=Date.now(),oldPosition=ref.current.video?.position||0,oldLesson=lessonId,sending=false,ticks=0,pending:any=null;
 function flush(){if(!pending||pending.seconds<1){pending=null;return;}try{const queue=JSON.parse(localStorage.getItem('cim-pulses')||'[]');queue.push({...pending,eventId:crypto.randomUUID()});localStorage.setItem('cim-pulses',JSON.stringify(queue.slice(-500)));}catch{}pending=null;}
 async function send(){if(sending)return;sending=true;try{const queue=JSON.parse(localStorage.getItem('cim-pulses')||'[]');for(const pulse of queue.slice(0,12)){await api('heartbeat',pulse);const current=JSON.parse(localStorage.getItem('cim-pulses')||'[]');localStorage.setItem('cim-pulses',JSON.stringify(current.filter((p:any)=>p.eventId!==pulse.eventId)));}setSync('已同步');if(queue.length)window.dispatchEvent(new Event('cim-synced'));}catch{setSync('等待连接')}finally{sending=false}}
 function sample(){const now=Date.now(),r=ref.current,seconds=Math.min(1.5,(now-last)/1000),pos=r.video?.position||0;last=now;const sameLesson=oldLesson===r.lessonId;
 const valid=r.enabled&&sameLesson&&document.visibilityState==='visible'&&(r.kind==='video'?r.video?.playing:now-active<120000);
 const videoRange=r.kind==='video'&&pos>oldPosition&&pos-oldPosition<=seconds*2.2+.4;
 if(valid&&seconds>0){const contiguous=pending&&pending.kind===r.kind&&pending.lessonId===r.lessonId&&(r.kind!=='video'||(videoRange&&pending.to!==undefined&&Math.abs(pending.to-oldPosition)<.5));if(!contiguous)flush();if(!pending)pending={kind:r.kind,lessonId:r.lessonId,seconds:0,from:videoRange?oldPosition:undefined};pending.seconds+=seconds;pending.endAt=now;pending.to=videoRange?pos:undefined;pending.position=pos;if(pending.seconds>=15)flush();}else flush();oldPosition=pos;oldLesson=r.lessonId;
 if(++ticks%15===0){flush();void send();}}
 const activity=()=>{active=Date.now()};const visibility=()=>{flush();last=Date.now();oldPosition=ref.current.video?.position||0;void send()};
 ['pointerdown','keydown','scroll','touchstart'].forEach(e=>window.addEventListener(e,activity,{passive:true}));document.addEventListener('visibilitychange',visibility);const timer=setInterval(sample,1000);void send();
 return()=>{sample();flush();void send();clearInterval(timer);['pointerdown','keydown','scroll','touchstart'].forEach(e=>window.removeEventListener(e,activity));document.removeEventListener('visibilitychange',visibility);};
 },[]);return sync;
}
export function exportFile(name:string,data:any){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
