"use client";
import { useState } from "react";
import { ArrowDown, CheckSquare2, FileCheck2, GitBranch, Layers3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const layers=[
{name:"需求输入层",tag:"INPUT",color:"#e07563",items:["合同与技术要求","甲方审核意见","数据接收清单"],detail:"统一接收合同、技术要求和甲方审核意见，确认场景面积、目标口径、输入格式、运行环境与测试安排。"},
{name:"需求分解层",tag:"DECOMPOSE",color:"#da9a4c",items:["需求条目","量化指标","功能单元"],detail:"建立需求—指标—功能的逐级映射，将抽象目标转化为可实现、可检查的工程任务。"},
{name:"研发控制层",tag:"CONTROL",color:"#3d7c72",items:["基线管理","变更影响分析","版本控制"],detail:"对已确认内容形成基线；所有变更书面记录，并分析对场景、算法、进度、测试和交付的影响。"},
{name:"验证交付层",tag:"VERIFY",color:"#355a83",items:["测试用例","验收证据","交付物"],detail:"将功能与测试用例、验收证据和交付物绑定，确保每条需求都有验证方法和最终输出。"}
];
export default function Home(){const [active,setActive]=useState(1);return <main className="app accent-coral"><header className="topbar"><div className="brand"><span className="brand-mark"><GitBranch size={20}/></span><strong>需求分解与质量控制</strong><span>FRAMEWORK</span></div><div className="status"><i/> 基线 V1.0</div></header>
<section className="hero compact"><div><p className="eyebrow">REQUIREMENT TRACEABILITY</p><h1>把每一项需求<br/>追踪到<em>验证与交付</em></h1><p className="lede">以五级对应矩阵贯穿项目全过程，控制需求变化，降低返工，让质量结论有据可查。</p></div><div className="metric-stack"><div><b>05</b><span>对应层级</span></div><div><b>100%</b><span>需求可追踪</span></div><div><b>闭环</b><span>变更与验证</span></div></div></section>
<section className="workspace two-col"><div className="panel"><div className="panel-title"><span><Layers3 size={18}/> 分层控制框架</span><small>点击层级查看说明</small></div><div style={{display:"grid",gap:10}}>{layers.map((l,i)=><div key={l.name}><button className={`node ${active===i?"active":""}`} onClick={()=>setActive(i)} style={{width:"100%",display:"grid",gridTemplateColumns:"80px 1fr 1.6fr",alignItems:"center",gap:14,textAlign:"left",borderLeft:`7px solid ${l.color}`}}><span className="eyebrow">{l.tag}</span><strong>{l.name}</strong><span style={{color:"var(--muted)",fontSize:13}}>{l.items.join(" · ")}</span></button>{i<layers.length-1&&<ArrowDown size={18} style={{margin:"7px auto",color:"var(--muted)"}}/>}</div>)}</div></div>
<aside className="panel"><div className="panel-title"><span><ShieldCheck size={18}/> {layers[active].name}</span><span className="pill">{layers[active].tag}</span></div><p className="lede" style={{fontSize:15}}>{layers[active].detail}</p><div className="cards" style={{gridTemplateColumns:"1fr",marginTop:24}}>{layers[active].items.map((x,i)=><article className="card" key={x}><span className="pill">0{i+1}</span><h3>{x}</h3><p>设定责任人、确认状态、依据来源及对应验证记录。</p></article>)}</div><Button className="primary-action" style={{marginTop:18}}><FileCheck2 size={16}/> 生成需求追踪矩阵</Button></aside></section>
<section className="workspace"><div className="cards"><article className="card"><CheckSquare2/><h3>未经确认不进主线</h3><p>避免两个月周期内反复返工，确保开发对象稳定。</p></article><article className="card"><GitBranch/><h3>变更必须分析影响</h3><p>覆盖场景、算法、进度、测试与交付文件五个维度。</p></article><article className="card"><ShieldCheck/><h3>验收证据前置设计</h3><p>在开发前明确测试用例和交付物，降低验收风险。</p></article></div></section><footer><span>需求分解与质量控制框架图</span><span>需求 · 指标 · 功能 · 测试 · 交付</span></footer></main>}
