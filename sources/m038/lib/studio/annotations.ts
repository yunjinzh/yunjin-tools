import * as THREE from 'three';
import type {AnnotationInfo, AnnotationPaint} from './tour';

export function annotationWorldPoint(annotation:AnnotationInfo, meshes:THREE.Mesh[]) {
  const mesh=meshes.find(mesh=>mesh.uuid===annotation.meshId);
  if(!mesh||!mesh.visible)return null;
  mesh.updateWorldMatrix(true,false);
  return mesh.localToWorld(new THREE.Vector3(...annotation.anchor));
}

function wrapText(ctx:CanvasRenderingContext2D,text:string,width:number) {
  const lines:string[]=[];
  for(const paragraph of text.split('\n')){
    let line='';
    for(const char of paragraph){
      if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=char;}
      else line+=char;
    }
    lines.push(line);
  }
  return lines;
}

// The same canvas painter is used for on-screen labels, stills, and video frames.
export function paintAnnotations(ctx:CanvasRenderingContext2D, width:number, height:number,
  camera:THREE.PerspectiveCamera, meshes:THREE.Mesh[], items:AnnotationPaint[], selected:string|null=null) {
  const scale=Math.max(.7,Math.min(width/900,height/560));
  const fontSize=15*scale, lineHeight=22*scale, padding=12*scale;
  camera.updateMatrixWorld(true);
  ctx.save();
  ctx.font=`500 ${fontSize}px "Noto Sans SC", "Microsoft YaHei", sans-serif`;
  ctx.textBaseline='top';
  const boxes:{x:number;y:number;w:number;h:number;id:string}[]=[];
  for(const {annotation:a,opacity} of items){
    if(!a.visible||!a.text.trim()||opacity<.005)continue;
    const world=annotationWorldPoint(a,meshes);if(!world)continue;
    const point=world.project(camera);
    if(point.z< -1||point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1)continue;
    const x=(point.x+1)*width/2,y=(1-point.y)*height/2;
    const maxWidth=Math.min(250*scale,width*.64);
    const lines=wrapText(ctx,a.text,maxWidth-padding*2).slice(0,10);
    if(wrapText(ctx,a.text,maxWidth-padding*2).length>10)lines[9]=lines[9].slice(0,-1)+'…';
    const w=Math.min(maxWidth,Math.max(85*scale,Math.max(...lines.map(l=>ctx.measureText(l).width))+padding*2));
    const h=lines.length*lineHeight+padding*2;
    const margin=9*scale;
    let left=THREE.MathUtils.clamp(x+a.offset[0]*width,margin,Math.max(margin,width-w-margin));
    let top=THREE.MathUtils.clamp(y+a.offset[1]*height,margin,Math.max(margin,height-h-margin));
    // Keep independent annotations legible; a crossfade of the same ID intentionally overlaps.
    for(let attempt=0;attempt<6;attempt++){
      const overlap=boxes.find(b=>b.id!==a.id&&left<b.x+b.w+5*scale&&left+w>b.x-5*scale&&top<b.y+b.h+5*scale&&top+h>b.y-5*scale);
      if(!overlap)break;
      const below=overlap.y+overlap.h+8*scale;
      top=below+h<height-margin?below:Math.max(margin,overlap.y-h-8*scale);
      if(attempt>2)left=THREE.MathUtils.clamp(x-w-35*scale,margin,Math.max(margin,width-w-margin));
    }
    boxes.push({x:left,y:top,w,h,id:a.id});
    ctx.globalAlpha=opacity;
    ctx.strokeStyle=a.color;ctx.lineWidth=(selected===a.id?2:1.5)*scale;
    const endX=THREE.MathUtils.clamp(x,left,left+w),endY=THREE.MathUtils.clamp(y,top,top+h);
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(endX,endY);ctx.stroke();
    ctx.fillStyle=a.color;ctx.beginPath();ctx.arc(x,y,4.5*scale,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5*scale;ctx.stroke();
    ctx.shadowColor='#17223b24';ctx.shadowBlur=12*scale;ctx.shadowOffsetY=3*scale;
    ctx.fillStyle='#fffffff2';ctx.beginPath();ctx.roundRect(left,top,w,h,8*scale);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.strokeStyle=selected===a.id?a.color:'#d8deea';ctx.lineWidth=scale;ctx.stroke();
    ctx.fillStyle=a.color;ctx.fillRect(left,top+9*scale,3*scale,h-18*scale);
    ctx.fillStyle='#293347';lines.forEach((line,i)=>ctx.fillText(line,left+padding,top+padding+i*lineHeight));
  }
  ctx.restore();
}
