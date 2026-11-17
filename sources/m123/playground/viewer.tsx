import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowUpRight, ArrowRight, ArrowLeft, Search, Play, Pause, RotateCcw, Monitor, Smartphone, StepForward, Layers, ChevronDown } from 'lucide-react'
import { examples } from './catalog'
import { labels, categories, category } from './labels'
import './viewer.css'

function Preview({id}:{id:string}) {
 const ref=useRef<HTMLDivElement>(null); const [visible,setVisible]=useState(false)
 useEffect(()=>{const o=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{rootMargin:'100px'});if(ref.current)o.observe(ref.current);return()=>o.disconnect()},[])
 return <div ref={ref} className="tile-art">{visible&&<iframe tabIndex={-1} loading="lazy" title={`${labels[id]?.[0]||id} 静态预览`} src={`?capture=${id}&still=1`}/>}</div>
}
function Viewer() {
 const initial=new URLSearchParams(location.search).get('example')
 const [name,setName]=useState(examples.some(e=>e.id===initial)?initial!:'hero-demo')
 const [phone,setPhone]=useState(false),[still,setStill]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)
 const [playing,setPlaying]=useState(true),[speed,setSpeed]=useState(1),[revision,replay]=useState(0)
 const [height,setHeight]=useState(420),[ready,setReady]=useState(false),[staticScene,setStaticScene]=useState(false),[elapsed,setElapsed]=useState(0)
 const [error,setError]=useState(''),[filter,setFilter]=useState('全部效果'),[query,setQuery]=useState('')
 const iframe=useRef<HTMLIFrameElement>(null), visible=useRef(true), stage=useRef<HTMLElement>(null)
 const selected=examples.find(e=>e.id===name)!,idx=examples.indexOf(selected)
 const title=labels[name]?.[0]||selected.name, description=labels[name]?.[1]||selected.note
 const source=useMemo(()=>`?embed=${name}&still=${still?1:0}`,[name,revision,still])
 const send=(data:object)=>iframe.current?.contentWindow?.postMessage({type:'stageshow:control',...data},location.origin)
 const choose=(id:string,scroll=true)=>{setName(id);setPlaying(true);if(id===name)replay(n=>n+1);if(scroll)stage.current?.scrollIntoView({behavior:'smooth',block:'start'})}
 useEffect(()=>{
  const receive=(event:MessageEvent)=>{
   if(event.origin!==location.origin||event.source!==iframe.current?.contentWindow||event.data?.type!=='stageshow:status')return
   const d=event.data
   if(Number.isFinite(d.height))setHeight(Math.max(1,d.height))
   if(Number.isFinite(d.elapsed))setElapsed(d.elapsed)
   if(typeof d.staticScene==='boolean')setStaticScene(d.staticScene)
   if(d.error){setError(String(d.error));setReady(false)}
   else if(d.ready){setReady(true);send({playing:playing&&!still,speed,visible:visible.current})}
  };window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive)
 },[playing,still,speed])
 useEffect(()=>{send({playing:playing&&!still,speed})},[playing,still,speed])
 useEffect(()=>{
  const o=new IntersectionObserver(([e])=>{visible.current=e.isIntersecting;send({visible:visible.current})});if(iframe.current)o.observe(iframe.current);return()=>o.disconnect()
 },[name,revision,still])
 useEffect(()=>{setReady(false);setStaticScene(false);setElapsed(0);setError('');const u=new URL(location.href);u.searchParams.set('example',name);history.replaceState(null,'',u)},[name,revision,still])
 const filtered=examples.filter(e=>(filter==='全部效果'||category(e)===filter)&&`${e.name} ${e.id} ${(labels[e.id]||[]).join(' ')}`.toLowerCase().includes(query.toLowerCase()))
 const disabled=!ready||still||staticScene
 return <div className="gallery">
  <header className="site-nav"><a className="brand" href="./">stageshow<span className="brand-dot">·</span></a><nav><a href="#collection">效果总览 <span>{examples.length.toString().padStart(2,'0')}</span></a><a href="#stage">演示舞台</a></nav><span className="nav-note"><i/> 交互设计实验室</span></header>
  <main>
   <section className="intro"><div className="eyebrow">THE INTERFACE, IN MOTION <span>VOL. 01 / 2026</span></div><div className="intro-row"><h1>让界面，<br/>把故事<span>演出来。</span></h1><div className="intro-copy"><p>从一次光标点击，到完整的产品叙事。<br/>在这里，一次看遍 Stageshow 的<br/>界面、构图与交互动效。</p><a className="primary-link" href="#collection">探索全部效果 <ArrowUpRight size={18}/></a></div></div><div className="intro-bottom"><span>REACT + CSS · REAL MOTION</span><span>{examples.length} 个演示 · 7 个分类 · 自由播放 <ChevronDown size={13}/></span></div></section>
   <section id="stage" ref={stage} className="theatre" aria-label="演示舞台">
    <div className="stage-heading"><span><i/> NOW SHOWING</span><span>{String(idx+1).padStart(2,'0')} / {examples.length}</span></div>
    <div className="stage-grid"><div className="stage-left"><div className="viewport" data-phone={phone||undefined}>
     <iframe key={`${name}-${revision}-${still}`} ref={iframe} title={title} src={source} style={{height}} onLoad={()=>send({playing:playing&&!still,speed,visible:visible.current})}/>
     {error&&<div className="error" role="alert">加载遇到问题：{error}<button onClick={()=>replay(n=>n+1)}>重新加载</button></div>}
    </div></div><aside className="stage-info"><div className="info-top"><span className="tag">{category(selected)}</span><h2>{title}</h2><span className="english-name">{selected.name}</span><p>{description}</p></div><div className="info-bottom"><div className="scene-status"><i/>{still?'静态海报':staticScene?'静态构图':playing?'正在演示':'已暂停'}</div><p>这些是界面与动效演示，<br/>点击下方控件控制播放。</p><div className="next-prev"><button aria-label="上一个效果" onClick={()=>choose(examples[(idx-1+examples.length)%examples.length].id,false)}><ArrowLeft size={17}/></button><button aria-label="下一个效果" onClick={()=>choose(examples[(idx+1)%examples.length].id,false)}>下一个效果 <ArrowRight size={17}/></button></div></div></aside></div>
    <div className="transport"><div className="transport-group"><button className="play-button" disabled={disabled} onClick={()=>setPlaying(p=>!p)} aria-label={playing?'暂停':'播放'}>{playing?<Pause size={15}/>:<Play size={15}/>}<span>{playing?'暂停':'播放'}</span></button><button onClick={()=>{replay(n=>n+1);setPlaying(true)}} aria-label="重播"><RotateCcw size={15}/><span>重播</span></button><button disabled={disabled} onClick={()=>{setPlaying(false);send({step:true})}} aria-label="前进一帧"><StepForward size={15}/></button><output>{(elapsed/1000).toFixed(1)}<small> s</small></output><select aria-label="播放速度" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={0.25}>0.25×</option><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></div><div className="transport-group"><div className="device-toggle"><button aria-label="桌面宽度" aria-pressed={!phone} onClick={()=>setPhone(false)}><Monitor size={16}/></button><button aria-label="手机宽度" aria-pressed={phone} onClick={()=>setPhone(true)}><Smartphone size={16}/></button></div><label className="poster-control"><input type="checkbox" checked={still} onChange={e=>setStill(e.target.checked)}/> 静态海报</label></div></div>
   </section>
   <section id="collection" className="collection"><div className="collection-heading"><div><div className="eyebrow">THE COLLECTION</div><h2>每一种细节，都有戏。</h2></div><p>选择一张卡片，在上方舞台完整观看。</p></div>
    <div className="filterbar"><div className="tabs" role="group" aria-label="效果分类">{categories.map(c=><button key={c} aria-pressed={filter===c} onClick={()=>setFilter(c)}>{c}<span>{c==='全部效果'?examples.length:examples.filter(e=>category(e)===c).length}</span></button>)}</div><label className="search"><Search size={16}/><input placeholder="搜索效果…" aria-label="搜索效果" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
    <div className="result-line"><span>{filter} <span className="muted">/ {filtered.length} 个演示</span></span><span>SELECT TO PREVIEW <ArrowUpRight size={12}/></span></div>
    <div className="cards">{filtered.map(e=><button className="demo-card" key={e.id} onClick={()=>choose(e.id)} aria-label={`查看${labels[e.id]?.[0]||e.name}`} data-selected={name===e.id||undefined}><Preview id={e.id}/><div className="card-info"><div><span className="card-category">{category(e)}</span><h3>{labels[e.id]?.[0]||e.name}</h3><p>{e.name}</p></div><span className="card-arrow"><ArrowUpRight size={19}/></span></div></button>)}</div>
    {filtered.length===0&&<div className="empty"><Layers size={30}/><h3>没有找到对应效果</h3><p>试试“光标”“手机”“玻璃”，或清除搜索。</p><button onClick={()=>{setQuery('');setFilter('全部效果')}}>查看全部效果</button></div>}
   </section>
  </main><footer><a className="brand" href="#">stageshow<span className="brand-dot">·</span></a><p>小小的界面，完整的故事。<br/><span>基于 benjitaylor / skills · Stageshow 原始演示库</span></p><a href="#stage">回到舞台 ↑</a></footer>
 </div>
}
export function mount(){createRoot(document.getElementById('root')!).render(<Viewer/>)}

