'use client';
import {useEffect,useRef,useState} from 'react';
import {RotateCcw} from 'lucide-react';
import type {Artifact} from './exhibits';

export default function MapImage({artifact,full=false,className='',style,onLoaded}:{artifact:Artifact;full?:boolean;className?:string;style?:React.CSSProperties;onLoaded?:(w:number,h:number)=>void}){
 const [loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0),[variant,setVariant]=useState(0);
 const candidates=full?[artifact.image]:[artifact.thumb,artifact.preview,artifact.image];
 const url=candidates[Math.min(variant,candidates.length-1)]+(retry?`?reload=${retry}`:'');
 const imageRef=useRef<HTMLImageElement>(null),onLoadedRef=useRef(onLoaded);onLoadedRef.current=onLoaded;
 useEffect(()=>{const image=imageRef.current;if(image?.complete&&image.naturalWidth>0){setLoaded(true);setFailed(false);onLoadedRef.current?.(image.naturalWidth,image.naturalHeight);}},[url]);
 return <span className={`map-image ${full?'map-image-full':''} ${loaded?'is-loaded':''} ${className}`} style={style} data-map-id={artifact.id} data-image-status={failed?'error':loaded?'ready':'loading'}>
  {full&&<img className="map-preview-layer" src={artifact.preview} alt="" aria-hidden="true" draggable={false}/>}
  <img ref={imageRef} key={url} className="map-image-main" src={url} alt={artifact.title} loading={full?'eager':'lazy'} decoding="async" draggable={false} onLoad={e=>{if(e.currentTarget.naturalWidth>0){setLoaded(true);setFailed(false);onLoadedRef.current?.(e.currentTarget.naturalWidth,e.currentTarget.naturalHeight);}}} onError={()=>{if(!full&&variant<candidates.length-1)setVariant(v=>v+1);else setFailed(true);}}/>
  {!loaded&&full&&!failed&&<span className="image-loading" role="status">正在展开高清地图…</span>}
  {failed&&<span className="image-retry"><span>{full?'预览保留 · 高清图加载未完成':'地图加载未完成'}</span>{full?<button onClick={e=>{e.stopPropagation();setFailed(false);setLoaded(false);setRetry(Date.now());}} aria-label={`重新加载${artifact.title}`}><RotateCcw size={14}/>重新加载</button>:<span>点击打开原图</span>}</span>}
 </span>;
}
