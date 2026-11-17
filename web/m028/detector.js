/* YOLOX preprocessing/decoding follows Megvii-BaseDetection/YOLOX (Apache-2.0).
 * Weights: official YOLOX-Tiny 0.1.1rc0; runtime: Microsoft ONNX Runtime Web 1.20.1. */
(function(root){
'use strict';
const SIZE=416,AREA=SIZE*SIZE,CLASSES={0:'person',1:'bicycle',2:'car',3:'motorcycle',5:'bus',7:'truck'};
const canvas=(w,h)=>typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):Object.assign(document.createElement('canvas'),{width:w,height:h});
function iou(a,b){const w=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0])),h=Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));return w*h/(a[2]*a[3]+b[2]*b[3]-w*h||1)}
function sameKind(a,b){return (a==='person')===(b==='person')}
function nms(items,threshold=.45){const kept=[];for(const d of items.sort((a,b)=>b.score-a.score)){if(!kept.some(k=>sameKind(k.class,d.class)&&iou(k.bbox,d.bbox)>threshold))kept.push(d);if(kept.length>=250)break}return kept}
function regions(width,height,scene){
  const out=[{x:0,y:0,w:width,h:height,whole:true}],enhanced=scene==='aerial'||(scene==='auto'&&Math.max(width,height)>=1600);
  if(!enhanced)return out;
  const side=Math.min(960,Math.min(width,height)),cols=Math.max(1,Math.ceil((width-side)/(side*.8))+1),rows=Math.max(1,Math.ceil((height-side)/(side*.8))+1);
  if(cols===1&&rows===1)return out;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)out.push({x:cols===1?0:Math.round(x*(width-side)/(cols-1)),y:rows===1?0:Math.round(y*(height-side)/(rows-1)),w:side,h:side,whole:false});
  return out;
}
function decode(raw,ratio,region,threshold,imageWidth,imageHeight,minPersonScore=0){
  const out=[];let index=0;
  for(const stride of [8,16,32]){const grid=SIZE/stride;for(let gy=0;gy<grid;gy++)for(let gx=0;gx<grid;gx++,index++){
    const j=index*85;if(raw[j+4]<threshold)continue;let score=0,id=-1;for(let c=0;c<80;c++)if(raw[j+5+c]>score){score=raw[j+5+c];id=c}score*=raw[j+4];if(score<Math.max(threshold,id===0?minPersonScore:0)||!CLASSES[id])continue;
    const cx=(raw[j]+gx)*stride,cy=(raw[j+1]+gy)*stride,w=Math.exp(raw[j+2])*stride/ratio,h=Math.exp(raw[j+3])*stride/ratio;
    if(!Number.isFinite(w+h)||w<3||h<3)continue;
    // An aerial tile is for small objects; large terrain-shaped false positives are excluded.
    if(!region.whole&&w*h>region.w*region.h*.1)continue;
    let x=region.x+cx/ratio-w/2,y=region.y+cy/ratio-h/2;
    const left=Math.max(region.x,0,x),top=Math.max(region.y,0,y),right=Math.min(imageWidth,region.x+region.w,x+w),bottom=Math.min(imageHeight,region.y+region.h,y+h);
    if(right-left<3||bottom-top<3)continue;
    const edge=!region.whole&&((x<region.x+3&&region.x>0)||(y<region.y+3&&region.y>0)||(x+w>region.x+region.w-3&&region.x+region.w<imageWidth)||(y+h>region.y+region.h-3&&region.y+region.h<imageHeight));
    out.push({class:CLASSES[id],score,bbox:[left,top,right-left,bottom-top],edge});
  }}return out;
}
function merge(items){
  // Suppress border fragments only when a complete, overlapping detection contains them.
  const clean=items.filter(d=>!d.edge||!items.some(k=>k!==d&&!k.edge&&sameKind(k.class,d.class)&&Math.max(0,Math.min(d.bbox[0]+d.bbox[2],k.bbox[0]+k.bbox[2])-Math.max(d.bbox[0],k.bbox[0]))*Math.max(0,Math.min(d.bbox[1]+d.bbox[3],k.bbox[1]+k.bbox[3])-Math.max(d.bbox[1],k.bbox[1]))/(d.bbox[2]*d.bbox[3])>.65));
  return nms(clean).map(({edge,...d})=>d);
}
class Detector{
  constructor(session,ort){this.session=session;this.ort=ort;this.input=canvas(SIZE,SIZE);this.ctx=this.input.getContext('2d',{willReadFrequently:true});this.data=new Float32Array(AREA*3)}
  async detect(image,options={},progress=()=>{},cancelled=()=>false){
    const width=image.width,height=image.height,tiles=regions(width,height,options.scene||'auto'),all=[];const started=performance.now();
    for(let i=0;i<tiles.length;i++){
      if(cancelled())throw Object.assign(new Error('分析已暂停'),{name:'AbortError'});
      const r=tiles[i],ratio=Math.min(SIZE/r.w,SIZE/r.h),w=Math.floor(r.w*ratio),h=Math.floor(r.h*ratio),ctx=this.ctx;
      ctx.fillStyle='rgb(114,114,114)';ctx.fillRect(0,0,SIZE,SIZE);ctx.drawImage(image,r.x,r.y,r.w,r.h,0,0,w,h);
      const rgba=ctx.getImageData(0,0,SIZE,SIZE).data;for(let p=0;p<AREA;p++){this.data[p]=rgba[p*4+2];this.data[AREA+p]=rgba[p*4+1];this.data[AREA*2+p]=rgba[p*4]}
      const input=new this.ort.Tensor('float32',this.data,[1,3,SIZE,SIZE]);let output;
      try{output=await this.session.run({[this.session.inputNames[0]]:input});const raw=output[this.session.outputNames[0]];if(raw.dims[1]!==3549||raw.dims[2]!==85)throw new Error('检测模型输出格式不匹配');all.push(...decode(raw.data,ratio,r,options.threshold??.4,width,height,tiles.length>1?.6:0))}finally{input.dispose?.();if(output)for(const t of Object.values(output))t.dispose?.()}
      progress({done:i+1,total:tiles.length,elapsed:performance.now()-started});
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    if(cancelled())throw Object.assign(new Error('分析已暂停'),{name:'AbortError'});
    return {detections:merge(all),passes:tiles.length,elapsed:performance.now()-started};
  }
}
const api={Detector,decode,regions,nms,merge,SIZE};root.FramewiseDetector=api;if(typeof module!=='undefined')module.exports=api;
})(typeof self!=='undefined'?self:globalThis);
