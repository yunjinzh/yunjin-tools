"use client";
import {Camera,Plus,Play,Pause,Square,RefreshCw,ArrowUp,ArrowDown,Trash2,MessageSquareText,Video,Route,Loader2} from 'lucide-react';
import {Slider} from '@/components/ui/slider';
import type {TourKeyframe,TourPlayback} from '@/lib/studio/tour';
import type {StudioEngine} from '@/lib/studio/engine';

export function timeLabel(seconds:number){const value=Math.max(0,seconds);return `${Math.floor(value/60)}:${Math.floor(value%60).toString().padStart(2,'0')}`;}
type Props={engine:StudioEngine|null;frames:TourKeyframe[];selected:string|null;playback:TourPlayback;disabled:boolean;saving:boolean;recording:boolean;onSave:(id?:string)=>void;onAnnotate:()=>void;onPlay:()=>void;onExport:()=>void;};
export function TourPanel({engine,frames,selected,playback,disabled,saving,recording,onSave,onAnnotate,onPlay,onExport}:Props){
 const active=frames.find(f=>f.id===selected);const locked=disabled||saving||playback.status!=='stopped';
 return <div className="tour-panel">
  <section className="panel-section tour-intro"><div className="section-heading"><h3><Route size={16}/>场景导览</h3><span>{frames.length} / 30 帧</span></div><p className="field-note">调整视角、炸开程度和标注，再保存为关键帧。按顺序播放，画面自然过渡。</p>
   <button className="button primary full" onClick={()=>onSave()} disabled={locked||frames.length>=30}>{saving?<Loader2 size={16} className="spin"/>:<Plus size={16}/>}添加当前视角</button>
   <button className="button secondary full" onClick={onAnnotate} disabled={locked}><MessageSquareText size={16}/>为当前视角添加标注</button>
  </section>
  <section className="panel-section tour-preview"><div className="section-heading"><h3>播放预览</h3><span>{timeLabel(playback.duration)}</span></div>
   <div className="tour-play-actions"><button className="button primary" aria-label={playback.status==='playing'?'暂停导览':playback.status==='paused'?'继续导览':'播放导览'} disabled={disabled||saving||frames.length<2} onClick={()=>playback.status==='playing'?engine?.pauseTour():onPlay()}>{playback.status==='playing'?<Pause size={15}/>:<Play size={15}/>} {playback.status==='playing'?'暂停':playback.status==='paused'?'继续':'播放'}</button><button className="button secondary" aria-label="停止导览" disabled={recording||playback.status==='stopped'} onClick={()=>engine?.stopTour()}><Square size={14}/>停止</button></div>
   <div className="tour-time"><span>{timeLabel(playback.time)}</span><span>{timeLabel(playback.duration)}</span></div><Slider aria-label="导览进度" min={0} max={Math.max(1,playback.duration)} step={.1} value={[playback.time]} disabled={disabled||saving||frames.length<2} onValueChange={v=>engine?.seekTour(v[0])}/>
   <p className="field-note">{playback.status==='stopped'?'至少 2 个关键帧即可播放。停止后保留当前画面。':`正在${playback.status==='paused'?'暂停于':'播放'}：${frames[playback.frameIndex]?.name??'导览'}。停止后可继续编辑。`}</p>
  </section>
  <section className="panel-section tour-frames" aria-label="导览关键帧列表"><div className="section-heading"><h3>关键帧</h3><span>按下列顺序播放</span></div>
   {!frames.length&&<div className="tour-empty"><Camera size={28}/><b>从第一个观察角度开始</b><p>转动模型，然后点击“添加当前视角”。</p></div>}
   <div className="keyframe-list">{frames.map((frame,index)=><div className={'keyframe-card '+(selected===frame.id?'active':'')+(playback.status!=='stopped'&&playback.frameIndex===index?' playing':'')} key={frame.id}>
    <button className="keyframe-open" aria-label={'查看关键帧 '+frame.name} onClick={()=>engine?.jumpKeyframe(frame.id)} disabled={disabled||saving||playback.status!=='stopped'}><div className="keyframe-thumb"><img src={frame.thumbnail} alt={frame.name+'视角缩略图'}/><span>{String(index+1).padStart(2,'0')}</span></div><div><strong>{frame.name||'未命名视角'}</strong><small>{frame.view.annotations.filter(a=>a.visible).length} 条标注 · 炸开 {Math.round(frame.view.explosion)}%</small><small>停留 {frame.hold} 秒{index<frames.length-1?` · 过渡 ${frame.transition} 秒`:''}</small></div></button>
    <div className="keyframe-actions"><button aria-label={'上移关键帧 '+frame.name} disabled={locked||index===0} onClick={()=>engine?.moveKeyframe(frame.id,-1)}><ArrowUp size={14}/></button><button aria-label={'下移关键帧 '+frame.name} disabled={locked||index===frames.length-1} onClick={()=>engine?.moveKeyframe(frame.id,1)}><ArrowDown size={14}/></button><button aria-label={'删除关键帧 '+frame.name} disabled={locked} onClick={()=>engine?.removeKeyframe(frame.id)}><Trash2 size={14}/></button></div>
   </div>)}</div>
   {active&&<fieldset className="keyframe-editor" disabled={locked}><label>关键帧名称<input aria-label="关键帧名称" maxLength={40} value={active.name} onChange={e=>engine?.updateKeyframe(active.id,{name:e.target.value})}/></label><div className="keyframe-timing"><label>停留（秒）<input type="number" aria-label="关键帧停留秒数" min={.5} max={15} step={.5} value={active.hold} onChange={e=>engine?.updateKeyframe(active.id,{hold:Number(e.target.value)})}/></label><label>到下一帧（秒）<input type="number" aria-label="关键帧过渡秒数" min={.5} max={15} step={.5} value={active.transition} disabled={locked||frames.at(-1)?.id===active.id} onChange={e=>engine?.updateKeyframe(active.id,{transition:Number(e.target.value)})}/></label></div>
    <button className="button secondary full" onClick={()=>onSave(active.id)}><RefreshCw size={15}/>更新画面与标注</button><p className="field-note">修改视角或标注后，点击上方按钮覆盖此帧；其他关键帧保持各自的标注。最后一帧只使用停留时间。</p>
   </fieldset>}
  </section>
  <section className="panel-section tour-export"><button className="button primary full" onClick={onExport} disabled={disabled||saving||frames.length<2||playback.status!=='stopped'}><Video size={16}/>导出导览视频</button><p className="field-note">包含视角过渡、炸开变化与文本标注。总时长最多 3 分钟；切换模型或关闭页面前请导出。</p></section>
 </div>;
}
