import React from 'react';
import {FolderOpen,FolderArchive,Layers3,BookOpen,ShieldCheck,ChevronRight,Files,Stamp,FileArchive,Archive,ScanLine,LibraryBig,ClipboardCheck,ListChecks,Leaf,CalendarDays} from 'lucide-react';
import {num,mb,Section,Badge} from './common';
import res from '../../lib/resources.json';
const groups=[
 {name:'阅读版 ZIP',detail:'JPG 阅读资源',meta:mb(res.reading[0].bytes),I:FileArchive,theme:'mint'},
 {name:'PNG 原图无损分卷',detail:'001–025 · 二进制分卷',meta:'25 个分卷',I:Layers3,theme:'sand'},
 {name:'已核实 414 张历史资源',detail:'历史基准 · 独立归档',meta:'12 个 ZIP · 1 份 PDF',I:Archive,theme:'lilac'}
];
export {groups};
export default function Dashboard({go,showReading,openCard,accepted,activeIssues,stats,latest,ready}){
 const tiles=[['交付目标','1,000','张','项目约定数量',LibraryBig,'mint',()=>go('resources')],
 ['阅读版实测','1,000','张','已解码 · 编号连续',ScanLine,'blue',showReading],
 ['原图分卷','25','/ 25','编号 001–025 连续',Layers3,'sand',()=>go('volumes')],
 ['原图内容验收',ready?num(accepted):'…','张','五项人工复核通过',ClipboardCheck,'lilac',()=>go('reviews')]];
 return <><section className="hero"><div className="heroGrid"/><div className="heroText"><div className="heroKicker"><span className="kline"/> 当前交付项目</div><h2>苗苗汉字学习卡</h2><p>全套 1,000 张 · 资源核验与交付档案</p><button onClick={()=>go('resources')}><FolderOpen size={15}/> 查看交付清单</button></div><div className="fan" aria-label="来自阅读版的花、山、水三张原卡"><img className="fanLeft" src="/previews/0003.webp" alt="花字卡"/><img className="fanRight" src="/previews/0002.webp" alt="水字卡"/><img className="fanMid" src="/previews/0001.webp" alt="山字卡"/></div></section>
 <div className="metrics">{tiles.map(([label,value,unit,foot,I,c,fn])=><button key={label} className="metric" onClick={fn}><div className="metricLabel"><span className={'miniIcon '+c}><I size={17}/></span>{label}</div><div className="metricNum">{value}<span>{unit}</span></div><small>{foot}</small></button>)}</div>
 <div className="dashGrid"><Section title="交付资源" action="查看全部" onClick={()=>go('resources')}><div className="resourceRows">{groups.map(({name,detail,meta,I,theme},i)=><button key={name} onClick={()=>go(i===0?'resources':i===1?'volumes':'historyfiles')} className="resourceRow"><span className={'fileIcon '+theme}><I size={22}/></span><span className="rowName"><b>{name}</b><small>{detail}</small></span><span className="rowMeta">{meta}</span><ChevronRight size={16}/></button>)}</div></Section>
 <Section title="核验进度" action="查看记录" onClick={()=>go('logs')}><div className="progressbox">{[['阅读版解码',1000,'1,000 / 1,000','green'],['原图解码',stats.originalChecked?stats.origCount:0,stats.originalChecked?num(stats.origCount)+' / 1,000':'待核验','green'],['原图内容验收',accepted,ready?num(accepted)+' / 1,000':'读取中','gold']].map(([t,n,txt,c])=><div className="progressItem" key={t}><div><span>{t}</span><b>{txt}</b></div><div className="track"><i className={c} style={{width:Math.min(100,100*n/1000)+'%'}}/></div></div>)}</div></Section></div>
 <Section title="卡片抽样复核" action="进入卡片库" onClick={()=>go('cards')}><div className="sampleGrid">{[['0001','山'],['0002','水'],['0003','花'],['0007','雨'],['0008','雪'],['0009','风']].map(([id,han])=><button key={id} className="sample" onClick={()=>openCard(id)}><img loading="lazy" src={'/previews/'+id+'.webp'} alt={han+'字原卡预览'}/><span><b>{han}</b><small>#{id}</small></span></button>)}</div></Section>
 </>
}
