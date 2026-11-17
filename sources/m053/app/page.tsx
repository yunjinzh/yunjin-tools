"use client";

import { useState } from "react";
import { Download, Layers3, Map, MapPin, Palette, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const styles = ["城市墨线", "青绿山水", "午夜霓虹", "米白出版"];

export default function Home(){
  const [theme,setTheme]=useState(styles[0]);
  const [place,setPlace]=useState("武汉 · 长江两岸");
  const download=()=>{
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="100%" height="100%" fill="#f4f1ea"/><path d="M0 760 C360 650 520 850 820 720 S1280 530 1600 700" fill="none" stroke="#287e92" stroke-width="95"/><g fill="none" stroke="#17201d" stroke-width="8" opacity=".8"><path d="M80 80L430 420L820 210L1400 500"/><path d="M160 1040L600 650L980 930L1500 760"/></g><text x="90" y="150" font-size="64" font-family="serif">${place}</text><text x="90" y="1080" font-size="34">${theme} · PrettyMaps Studio</text></svg>`;
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));a.download="prettymaps.svg";a.click();URL.revokeObjectURL(a.href);
  };
  return <main className="app accent-coral">
    <header className="topbar"><div className="brand"><span className="brand-mark"><Map size={20}/></span><strong>PRETTYMAPS</strong><span>地图艺术工坊</span></div><div className="status"><i/> 高清制图画布</div></header>
    <section className="hero compact"><div><p className="eyebrow">CARTOGRAPHIC DESIGN STUDIO</p><h1>把任意地点<br/>变成一张<em>地图作品</em></h1><p className="lede">定位城市、框选区域、切换视觉主题，并导出适合海报与汇报的高清矢量图。</p></div><div className="metric-stack"><div><b>04</b><span>预设风格</span></div><div><b>SVG</b><span>矢量输出</span></div><div><b>自由</b><span>区域构图</span></div></div></section>
    <section className="workspace two-col">
      <aside className="panel">
        <div className="panel-title"><span><MapPin size={18}/> 地图配置</span><small>STEP 01—03</small></div>
        <div className="toolbar"><Search size={18}/><input value={place} onChange={e=>setPlace(e.target.value)} aria-label="地点"/></div>
        <div className="field-row"><div><label>画面比例</label><div className="select-like">4:3 · 横向画布</div></div><div><label>道路细节</label><div className="select-like">精细</div></div></div>
        <label className="eyebrow"><Palette size={15} style={{display:"inline",marginRight:8}}/>视觉主题</label>
        <div className="cards" style={{gridTemplateColumns:"1fr 1fr",marginTop:12}}>{styles.map((s,i)=><button key={s} className={`card ${theme===s?"node active":"node"}`} onClick={()=>setTheme(s)} style={{textAlign:"left"}}><span className="pill">0{i+1}</span><h3>{s}</h3></button>)}</div>
        <div className="field-row"><div><label>线条密度</label><input type="range" min="1" max="10" defaultValue="7" style={{width:"100%",accentColor:"var(--accent)"}}/></div><div><label>输出尺寸</label><div className="select-like">1600 × 1200</div></div></div>
        <Button className="primary-action" onClick={download}><Download size={16}/> 导出高清 SVG</Button>
      </aside>
      <div className="panel"><div className="panel-title"><span><Layers3 size={18}/> 实时画布</span><small>{theme}</small></div>
        <div className="viz" style={{padding:0}}><svg viewBox="0 0 800 560" width="100%" height="100%" aria-label="地图预览"><rect width="800" height="560" fill="#eee9df"/><path d="M0 360 C180 310 260 420 420 355 S650 265 800 340" fill="none" stroke="#448ba0" strokeWidth="42"/><g fill="none" stroke="#303c37" strokeWidth="4" opacity=".75"><path d="M20 60L180 210L380 96L710 235"/><path d="M60 510L270 325L480 490L760 365"/><path d="M115 0L290 190L520 30L790 145"/><path d="M15 270L250 140L500 260L780 85"/></g><g fill="#e07563"><circle cx="390" cy="285" r="10"/><circle cx="565" cy="190" r="7"/></g><text x="42" y="75" fontSize="28" fontFamily="serif" fill="#17201d">{place}</text><text x="42" y="520" fontSize="15" fill="#59645f">{theme} · 1:25,000</text></svg></div>
      </div>
    </section><footer><span>PrettyMaps 地图艺术工坊</span><span>定位 · 设计 · 高清导出</span></footer>
  </main>
}
