"use client";
import {useEffect,useState} from 'react';
import {Plus,Eye,EyeOff,Trash2,MapPin,Route,MessageSquareText} from 'lucide-react';
import {Slider} from '@/components/ui/slider';
import type {AnnotationInfo} from '@/lib/studio/tour';
import type {StudioEngine} from '@/lib/studio/engine';

export function AnnotationPanel({engine,annotations,selected,disabled,onTour}:{engine:StudioEngine|null;annotations:AnnotationInfo[];selected:string|null;disabled:boolean;onTour:()=>void}){
 const current=annotations.find(a=>a.id===selected);
 const[text,setText]=useState('部件说明');const[color,setColor]=useState('#4856ed');const[relocating,setRelocating]=useState(false);
 useEffect(()=>{if(current){setText(current.text);setColor(current.color);}setRelocating(false);},[current?.id,current?.text,current?.color,current?.meshId,current?.anchor.join(',')]);
 useEffect(()=>engine?.setAnnotationDraft({text,color}),[engine,text,color]);
 return <section className="panel-section annotation-panel" aria-label="文本标注设置"><div className="section-heading"><h3><MessageSquareText size={16}/>部件标注</h3><span>{annotations.length} / 40</span></div>
  <fieldset disabled={disabled}><label className="annotation-label">{current?'编辑所选标注':'新标注内容'}<textarea aria-label="标注文本" maxLength={280} rows={4} value={text} onChange={e=>{setText(e.target.value);if(current)engine?.updateAnnotation(current.id,{text:e.target.value});}} placeholder="输入部件名称、结构说明或讲解内容"/></label><div className="annotation-color"><label htmlFor="annotation-color">标注颜色</label><input id="annotation-color" aria-label="标注颜色" type="color" value={color} onChange={e=>{setColor(e.target.value);if(current)engine?.updateAnnotation(current.id,{color:e.target.value});}}/><span>{text.length} / 280</span></div>
  <p className="field-note annotation-hint">{relocating?'点击模型表面，重新指定这条标注的锚点。':'点击模型部件添加标注。按住空格可临时旋转；炸开后也可直接点击构件。'}</p>
  {current&&<><p className="annotation-part" title={current.partName}>锚定部件：{current.partName}</p><div className="annotation-offset"><label>文字水平位置</label><Slider aria-label="标注水平位置" min={-.5} max={.5} step={.01} value={[current.offset[0]]} onValueChange={v=>engine?.updateAnnotation(current.id,{offset:[v[0],current.offset[1]]})}/></div><div className="annotation-offset"><label>文字垂直位置</label><Slider aria-label="标注垂直位置" min={-.5} max={.5} step={.01} value={[current.offset[1]]} onValueChange={v=>engine?.updateAnnotation(current.id,{offset:[current.offset[0],v[0]]})}/></div><button className="button secondary full" onClick={()=>{engine?.relocateSelectedAnnotation();setRelocating(true);}}><MapPin size={15}/>重新定位锚点</button><button className="button secondary full" onClick={()=>{engine?.selectAnnotation(null);setText('部件说明');setRelocating(false);}}><Plus size={15}/>准备下一条标注</button></>}
  </fieldset>
  <div className="annotation-list" aria-label="当前视角标注列表">{annotations.map(a=><div className={'annotation-row '+(a.id===selected?'selected':'')} key={a.id}><button className="annotation-select" disabled={disabled} onClick={()=>engine?.selectAnnotation(a.id)}><i style={{background:a.color}}/><span>{a.text.trim()||'空白标注'}</span></button><button aria-label={(a.visible?'隐藏标注 ':'显示标注 ')+a.text} disabled={disabled} onClick={()=>engine?.updateAnnotation(a.id,{visible:!a.visible})}>{a.visible?<Eye size={15}/>:<EyeOff size={15}/>}</button><button aria-label={'删除标注 '+a.text} disabled={disabled} onClick={()=>engine?.removeAnnotation(a.id)}><Trash2 size={14}/></button></div>)}</div>
  <button className="button secondary full" onClick={onTour} disabled={disabled}><Route size={16}/>保存到导览关键帧</button><p className="field-note">每个关键帧保存独立的标注内容、显隐和位置。标注会一同输出到图片与视频。</p>
 </section>;
}
