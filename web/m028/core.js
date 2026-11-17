(function(root){
  'use strict';
  const CLASSES={person:'人员',car:'汽车',truck:'货车',bus:'客车',motorcycle:'摩托车',bicycle:'自行车'};
  const kind=c=>c==='person'?'person':'vehicle';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function iou(a,b){const x=Math.max(a[0],b[0]),y=Math.max(a[1],b[1]),r=Math.min(a[0]+a[2],b[0]+b[2]),d=Math.min(a[1]+a[3],b[1]+b[3]);const area=Math.max(0,r-x)*Math.max(0,d-y);return area/(a[2]*a[3]+b[2]*b[3]-area||1)}
  function clock(t,ms=false){if(!Number.isFinite(t))return '00:00';t=Math.max(0,t);const h=Math.floor(t/3600),m=Math.floor(t/60)%60,s=Math.floor(t)%60;return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+(ms?'.'+String(Math.floor(t*1000)%1000).padStart(3,'0'):'')}
  class Tracker{
    constructor(){this.records=[];this.active=[];this.seq={person:0,vehicle:0};this.segment=1}
    discontinuity(){this.active=[];this.segment++}
    update(detections,time){
      this.active=this.active.filter(t=>time-t.last>=0&&time-t.last<=1.3&&t.misses<4);
      const assigned=new Set(),taken=new Set(),pairs=[];
      for(let i=0;i<detections.length;i++)for(const t of this.active){const d=detections[i];if(kind(d.class)!==t.kind)continue;if(d.class!==t.class&&[d.class,t.class].some(c=>c==='bicycle'||c==='motorcycle'))continue;const gap=Math.max(.001,time-t.last),pred=t.bbox.map((x,j)=>x+(j<2?t.velocity[j]*Math.min(gap,.6):0)),overlap=iou(d.bbox,pred);const dx=(d.bbox[0]+d.bbox[2]/2)-(pred[0]+pred[2]/2),dy=(d.bbox[1]+d.bbox[3]/2)-(pred[1]+pred[3]/2);const distance=Math.hypot(dx,dy)/Math.max(30,Math.hypot(pred[2],pred[3]));const ratio=(d.bbox[2]*d.bbox[3])/(pred[2]*pred[3]||1);if(ratio>.3&&ratio<3.3&&(overlap>.12||distance<(gap>.5?.85:.45)))pairs.push({i,t,score:overlap*.72+Math.max(0,1-distance)*.28})}
      pairs.sort((a,b)=>b.score-a.score);const matched=new Map();for(const p of pairs){if(!assigned.has(p.i)&&!taken.has(p.t.id)){assigned.add(p.i);taken.add(p.t.id);matched.set(p.i,p.t)}}
      for(const t of this.active)t.misses++;
      return detections.map((d,i)=>{
        let t=matched.get(i);if(!t){const k=kind(d.class);t={id:(k==='person'?'P':'V')+'-'+String(++this.seq[k]).padStart(4,'0'),kind:k,class:d.class,first:time,last:time,bbox:d.bbox.slice(),velocity:[0,0],peak:d.score,score:d.score,observations:0,misses:0,segment:this.segment,snapshot:null,snapshotTime:time,snapshotQuality:0,features:null,details:null,detailState:'未接入',detailError:'',attempts:0,logs:[]};this.records.push(t);this.active.push(t)}else{const dt=time-t.last;if(dt>.01){t.velocity=[0,1].map(j=>clamp((d.bbox[j]-t.bbox[j])/dt,-1000,1000)*.65+t.velocity[j]*.35)}if(d.score>t.peak)t.class=d.class}
        t.last=time;t.bbox=d.bbox.slice();t.score=d.score;t.peak=Math.max(t.peak,d.score);t.observations++;t.misses=0;return t;
      });
    }
  }
  function colorName(r,g,b){const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,v=max/255,s=max?delta/max:0;if(v<.20)return '黑色';if(s<.12&&v>.82)return '白色';if(s<.18)return v>.65?'浅灰色':'灰色';let h=delta===0?0:max===r?60*((g-b)/delta%6):max===g?60*((b-r)/delta+2):60*((r-g)/delta+4);if(h<0)h+=360;if(h<18||h>345)return v<.48?'棕色':'红色';if(h<45)return v<.65?'棕色':s<.5?'米色':'橙色';if(h<70)return s<.4?'米色':'黄色';if(h<165)return '绿色';if(h<200)return '青色';if(h<255)return v<.5?'深蓝色':'蓝色';if(h<290)return '紫色';return '粉色'}
  function dominant(data){const counts={};let total=0;for(let i=0;i<data.length;i+=16){if(data[i+3]<128)continue;const c=colorName(data[i],data[i+1],data[i+2]);counts[c]=(counts[c]||0)+1;total++}const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]);return {value:entries[0]?.[0]||'无法确认',share:total?(entries[0]?.[1]||0)/total:0}}
  function normalizeDetails(raw,person){const fields=person?['appearance','hair','upper','lower','accessories']:['color','make','model','plate'];const out={};for(const k of fields){const x=raw?.[k];const confidence=typeof x?.confidence==='number'&&Number.isFinite(x.confidence)&&x.confidence>=0&&x.confidence<=1?x.confidence:0;const text=typeof x?.value==='string'?x.value.trim().slice(0,240):'';const blocked=/^(null|unknown|none|n\/a|无法确认|不确定|未知|未识别)/i.test(text)||/可能|大概|疑似|或许|似乎|估计/.test(text);out[k]={value:confidence>=.9&&text&&!blocked?text:'无法确认',confidence,rawValue:text};}return out}
  const api={CLASSES,kind,clamp,iou,clock,Tracker,colorName,dominant,normalizeDetails};root.FramewiseCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
