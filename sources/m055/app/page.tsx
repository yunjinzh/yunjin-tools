"use client";
import { useMemo,useState } from "react";
import { BarChart3, ClipboardList, FilePlus2, Search, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const seed=[{name:"数字孪生培训需求调研",state:"回收中",count:128,rate:"64%"},{name:"高校实验室安全认知调查",state:"草稿",count:0,rate:"—"},{name:"空间智能课程满意度",state:"已结束",count:286,rate:"92%"}];
export default function Home(){const [q,setQ]=useState("");const [items,setItems]=useState(seed);const list=useMemo(()=>items.filter(x=>x.name.includes(q)),[q,items]);
return <main className="app accent-violet"><header className="topbar"><div className="brand"><span className="brand-mark"><ClipboardList size={20}/></span><strong>问卷调研工作台</strong><span>SURVEY</span></div><div className="status"><i/> 数据自动汇总</div></header>
<section className="hero compact"><div><p className="eyebrow">RESEARCH WORKBENCH</p><h1>从问题设计到<br/><em>调研结论</em>的一站式工作台</h1><p className="lede">创建问卷、发布回收、跟踪进度并快速查看统计结果。</p></div><div className="metric-stack"><div><b>{items.length}</b><span>全部问卷</span></div><div><b>414</b><span>累计答卷</span></div><div><b>78%</b><span>平均完成率</span></div></div></section>
<section className="workspace"><div className="panel"><div className="section-title"><div><p className="eyebrow">MY SURVEYS</p><h2>问卷项目</h2></div><Button className="primary-action" style={{width:"auto"}} onClick={()=>setItems(v=>[{name:`未命名问卷 ${v.length+1}`,state:"草稿",count:0,rate:"—"},...v])}><FilePlus2 size={16}/> 新建问卷</Button></div>
<div className="toolbar"><Search size={18}/><input placeholder="搜索问卷标题" value={q} onChange={e=>setQ(e.target.value)}/><Button variant="outline"><BarChart3 size={16}/> 汇总分析</Button></div>
<div className="table"><div className="row head"><span>问卷名称</span><span>状态</span><span>答卷 / 完成率</span><span>操作</span></div>{list.map(x=><div className="row" key={x.name}><strong>{x.name}</strong><span className="tag">{x.state}</span><span>{x.count} 份 · {x.rate}</span><Button variant="ghost" size="sm">编辑</Button></div>)}</div></div>
<div className="cards" style={{marginTop:18}}><article className="card"><span className="pill"><Users size={13}/> 样本</span><h3>受访人群管理</h3><p>按组织、角色或标签管理发放对象，清晰掌握样本覆盖情况。</p></article><article className="card"><span className="pill"><Send size={13}/> 发布</span><h3>多渠道回收</h3><p>生成问卷访问入口，集中查看提交量与完成率。</p></article><article className="card"><span className="pill"><BarChart3 size={13}/> 洞察</span><h3>自动统计分析</h3><p>针对单选、多选和量表题形成结构化统计视图。</p></article></div></section><footer><span>问卷调研工作台</span><span>设计 · 发布 · 回收 · 分析</span></footer></main>}
