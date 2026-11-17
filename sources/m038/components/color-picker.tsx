"use client";
import {useEffect,useState} from 'react';

export function ColorPicker({value,onChange,label='创作'}:{value:string;onChange:(color:string)=>void;label?:string}){
  const[draft,setDraft]=useState(value.slice(1).toUpperCase());
  const[invalid,setInvalid]=useState(false);
  useEffect(()=>{setDraft(value.slice(1).toUpperCase());setInvalid(false);},[value]);
  const channels=[1,3,5].map(index=>parseInt(value.slice(index,index+2),16));
  const submit=()=>{
    const raw=draft.replace(/^#/,'').trim();
    if(!/^([\da-f]{3}|[\da-f]{6})$/i.test(raw)){setInvalid(true);return;}
    const hex=raw.length===3?raw.split('').map(c=>c+c).join(''):raw;
    onChange('#'+hex.toLowerCase());setDraft(hex.toUpperCase());setInvalid(false);
  };
  return <div className="custom-color-editor">
    <div className="custom-color-heading"><span>自定义{label==='背景'?'背景':''}颜色</span><small>HEX / RGB</small></div>
    <div className="color-value-row"><label className="color-well" title="打开取色器"><input type="color" aria-label={'自定义'+label+'颜色'} value={value} onChange={e=>onChange(e.target.value)}/></label><label className="hex-field"><span>#</span><input aria-label={label+' HEX 色号'} value={draft} spellCheck={false} maxLength={7} aria-invalid={invalid} onChange={e=>{const next=e.target.value.toUpperCase();setDraft(next);setInvalid(false);if(/^#?[\dA-F]{6}$/.test(next))onChange('#'+next.replace('#','').toLowerCase());}} onBlur={submit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();submit();}}}/><span>HEX</span></label></div>
    <div className="rgb-fields">{['R','G','B'].map((channel,index)=><label key={channel}><span>{channel}</span><input type="number" min={0} max={255} step={1} aria-label={label+' '+channel+' 通道'} value={channels[index]} onChange={e=>{if(e.target.value==='')return;const next=[...channels];next[index]=Math.round(Math.min(255,Math.max(0,Number(e.target.value)||0)));onChange('#'+next.map(n=>n.toString(16).padStart(2,'0')).join(''));}}/></label>)}</div>
    {invalid&&<p className="color-error" role="alert">请输入 3 位或 6 位十六进制色号。</p>}
  </div>;
}
