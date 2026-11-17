"use client";
import {useEffect,useState,type FormEvent} from 'react';
import {Box,ExternalLink,Plus,Sparkles,Trash2} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {toast} from 'sonner';

type ModelingLink={name:string;url:string};
const PRESETS:ModelingLink[]=[
  {name:'腾讯混元 3D',url:'https://3d.hunyuan.tencent.com/'},
  {name:'Tripo Studio',url:'https://studio.tripo3d.ai/'},
  {name:'Hyper3D',url:'https://hyper3d.ai/'},
];
const STORAGE_KEY='siwei:3d-modeling-links:v1';

function normalizeLink(value:unknown):ModelingLink|null{
  if(!value||typeof value!=='object')return null;
  const {name,url}=value as Partial<ModelingLink>;
  if(typeof name!=='string'||typeof url!=='string'||!name.trim()||name.trim().length>40||url.length>2048)return null;
  try{
    const parsed=new URL(url.trim());
    if(!['https:','http:'].includes(parsed.protocol)||!parsed.hostname||parsed.username||parsed.password)return null;
    return {name:name.trim(),url:parsed.href};
  }catch{return null;}
}

export function GenerationDialog({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
  const[links,setLinks]=useState<ModelingLink[]>([]);
  const[name,setName]=useState(''),[url,setUrl]=useState(''),[error,setError]=useState('');
  const[storageNote,setStorageNote]=useState('链接保存在当前浏览器，可随时删除。');
  useEffect(()=>{
    try{
      const stored:unknown=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
      if(!Array.isArray(stored))return;
      const seen=new Set(PRESETS.map(link=>link.url));
      const valid:ModelingLink[]=[];
      for(const value of stored.slice(0,20)){const link=normalizeLink(value);if(link&&!seen.has(link.url)){seen.add(link.url);valid.push(link);}}
      setLinks(valid);
    }catch{setStorageNote('当前浏览器无法读取已保存的链接；新增链接仍可在本次会话使用。');}
  },[]);
  const save=(next:ModelingLink[])=>{
    setLinks(next);
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setStorageNote('链接保存在当前浏览器，可随时删除。');}
    catch{setStorageNote('当前浏览器无法保存设置；这些链接仅在本次会话可用。');}
  };
  const add=(event:FormEvent)=>{
    event.preventDefault();
    const link=normalizeLink({name,url});
    if(!link){setError('请填写平台名称及完整的 http:// 或 https:// 网址。');return;}
    if([...PRESETS,...links].some(item=>item.url===link.url)){setError('这个网址已在列表中。');return;}
    if(links.length>=20){setError('已保存 20 个自定义平台，请先删除不再使用的链接。');return;}
    save([...links,link]);setName('');setUrl('');setError('');toast.success('已添加建模平台。');
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="studio-dialog generation-dialog"><DialogHeader><DialogTitle><Sparkles size={22}/>生成三维模型</DialogTitle><DialogDescription>选择建模平台，在新标签页中开始创作。</DialogDescription></DialogHeader>
    <div className="generation-platforms">{PRESETS.map((link,index)=><a className={'generation-platform platform-'+index} key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={'前往'+link.name+'建模（新标签页）'}><span className="platform-symbol"><Box size={25} strokeWidth={1.6}/></span><span className="platform-copy"><strong>{link.name}</strong><span>{new URL(link.url).hostname}</span></span><ExternalLink size={18}/></a>)}</div>
    {!!links.length&&<section className="custom-platforms" aria-label="已添加的建模平台"><h3>我的建模平台</h3>{links.map(link=><div className="custom-platform-row" key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={'前往'+link.name+'建模（新标签页）'}><span className="platform-copy"><strong>{link.name}</strong><span>{link.url}</span></span><ExternalLink size={16}/></a><button aria-label={'删除平台'+link.name} className="icon-button" onClick={()=>{save(links.filter(item=>item.url!==link.url));setError('');}}><Trash2 size={16}/></button></div>)}</section>}
    <details className="custom-platform-form"><summary><Plus size={16}/>添加自定义建模平台</summary><form onSubmit={add} noValidate><label>平台名称<input aria-label="建模平台名称" value={name} onChange={event=>{setName(event.target.value);setError('');}} placeholder="例如：峥嵘大模型" maxLength={40} autoComplete="off"/></label><label>平台网址<input aria-label="建模平台网址" type="url" inputMode="url" value={url} onChange={event=>{setUrl(event.target.value);setError('');}} placeholder="https://…" maxLength={2048} autoComplete="off" spellCheck={false}/></label>{error&&<p className="generation-error" role="alert">{error}</p>}<button type="submit" className="button secondary full"><Plus size={15}/>添加平台</button><p className="field-note">{storageNote}</p></form></details>
    <p className="generation-return"><Box size={17}/><span>建模完成后下载模型，回到四维秀秀点击“导入模型”，继续 DIY。</span></p>
  </DialogContent></Dialog>;
}
