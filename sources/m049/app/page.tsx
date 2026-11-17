"use client";

import { useState } from "react";
import { Box, Camera, Cuboid, Download, Film, Play, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = ["素材检查", "相机位姿", "高斯训练", "模型优化"];

export default function Home() {
  const [file, setFile] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [quality, setQuality] = useState("均衡");

  return (
    <main className="app accent-lime dark-app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Cuboid size={20} /></span><strong>SPLAT STUDIO</strong><span>3D</span></div>
        <div className="status"><i /> 本地工作流就绪</div>
      </header>
      <section className="hero compact">
        <div>
          <p className="eyebrow">3D GAUSSIAN WORKSPACE</p>
          <h1>从影像到可漫游的<br/><em>三维高斯场景</em></h1>
          <p className="lede">导入多角度照片或全景视频，配置训练质量，生成可预览、可导出的 PLY 模型。</p>
        </div>
        <div className="metric-stack">
          <div><b>01</b><span>导入素材</span></div><div><b>02</b><span>训练重建</span></div><div><b>03</b><span>浏览导出</span></div>
        </div>
      </section>
      <section className="workspace two-col">
        <div className="panel">
          <div className="panel-title"><span><Upload size={18}/> 新建重建任务</span><small>支持 JPG / PNG / MP4</small></div>
          <label className="dropzone">
            <input type="file" accept="image/*,video/*" onChange={(e)=>setFile(e.target.files?.[0]?.name || "")} />
            <div className="drop-icon"><Camera size={30}/><Film size={24}/></div>
            <strong>{file || "拖入照片组或全景视频"}</strong>
            <span>{file ? "素材已加入任务，可继续配置" : "也可以点击选择本地文件"}</span>
          </label>
          <div className="field-row">
            <div><label>训练质量</label><div className="segmented">{["快速","均衡","精细"].map(x=><button key={x} className={quality===x?"active":""} onClick={()=>setQuality(x)}>{x}</button>)}</div></div>
            <div><label>输出格式</label><div className="select-like">PLY · Gaussian Splat</div></div>
          </div>
          <Button className="primary-action" disabled={!file} onClick={()=>setRunning(true)}><Play size={16}/> 开始生成三维模型</Button>
        </div>
        <div className="panel viewer-panel">
          <div className="panel-title"><span><Box size={18}/> 场景预览</span><small>{running ? "处理中" : "等待任务"}</small></div>
          <div className="viewer">
            <div className="orb"><span/><span/><span/></div>
            <p>{running ? "正在解析影像特征…" : "模型将在这里显示"}</p>
            <small>鼠标拖动旋转 · 滚轮缩放 · 双击聚焦</small>
          </div>
          <div className="progress-list">
            {steps.map((s,i)=><div key={s} className={running && i===0?"doing":""}><span>{i+1}</span><b>{s}</b><small>{running && i===0?"进行中":"待处理"}</small></div>)}
          </div>
          <Button variant="outline" disabled className="secondary-action"><Download size={16}/> 导出 PLY</Button>
        </div>
      </section>
      <footer><span>Splat Studio 3D</span><span>影像重建 · 高斯训练 · 三维漫游</span></footer>
    </main>
  );
}
