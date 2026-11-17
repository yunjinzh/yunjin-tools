import presets from './presets.json';
import {GRID_SIZE,GRID_LAYOUT,SELECTION_DIAMETER_M,SELECTION_RADIUS_M,gridCoordinate,footprintExtrema} from './geography.js';
export const PLACES={hangzhou:{lat:30.2343,lng:120.1217,name:'杭州 · 西湖群山'},guilin:{lat:24.9853,lng:110.3518,name:'桂林 · 漓江山水'},alps:{lat:46.5775,lng:8.0053,name:'瑞士 · 阿尔卑斯'},fuji:{lat:35.3606,lng:138.7274,name:'日本 · 富士山'}};
const TILE_SIZE=256,ZOOM=13,N=GRID_SIZE,TILE_COUNT=2**ZOOM,tileCache=new Map();
export function tileXY(lat,lng){const r=lat*Math.PI/180;return [(lng+180)/360*TILE_COUNT,(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*TILE_COUNT]}
export const coordForPixel=gridCoordinate;
function pixelAddress(px,py){const rawX=Math.floor(px/TILE_SIZE),x=((rawX%TILE_COUNT)+TILE_COUNT)%TILE_COUNT,y=Math.max(0,Math.min(TILE_COUNT-1,Math.floor(py/TILE_SIZE)));return {key:`${x}/${y}`,x,y,px:((px%TILE_SIZE)+TILE_SIZE)%TILE_SIZE,py:Math.max(0,Math.min(255,py-y*TILE_SIZE))}}
function loadTile(x,y,signal){
 const key=`${x}/${y}`;if(tileCache.has(key))return Promise.resolve(tileCache.get(key));
 return new Promise((resolve,reject)=>{
  const img=new Image();img.crossOrigin='anonymous';let complete=false;
  const done=(fn,value)=>{if(complete)return;complete=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);fn(value)};
  const cancel=()=>{done(reject,new DOMException('Aborted','AbortError'));img.src=''};
  const timer=setTimeout(()=>done(reject,new Error('高程服务连接超时')),18000);
  signal?.addEventListener('abort',cancel,{once:true});
  img.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=TILE_SIZE;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,TILE_SIZE,TILE_SIZE).data;tileCache.set(key,pixels);done(resolve,pixels)}catch(e){done(reject,e)}};
  img.onerror=()=>done(reject,new Error('高程数据暂未连接'));
  img.src=`https://elevation-tiles-prod.s3.amazonaws.com/terrarium/${ZOOM}/${x}/${y}.png`;
  if(signal?.aborted)cancel();
 });
}
export async function getTerrain(lat,lng,signal){
 for(const [key,p] of Object.entries(PLACES))if(Math.abs(lat-p.lat)<1e-9&&Math.abs(lng-p.lng)<1e-9&&presets[key]?.layout===GRID_LAYOUT)return {...presets[key],lat,lng,name:p.name,source:'内置真实高程',real:true,cached:true};
 const points=[],tilesNeeded=new Map();
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const c=gridCoordinate(lat,lng,x,y),t=tileXY(c.lat,c.lng);
  // Terrarium pixels describe pixel centers. Read neighbors across tile seams.
  const px=t[0]*TILE_SIZE-.5,py=t[1]*TILE_SIZE-.5,a=Math.floor(px),b=Math.floor(py);
  const corners=[pixelAddress(a,b),pixelAddress(a+1,b),pixelAddress(a,b+1),pixelAddress(a+1,b+1)];
  for(const address of corners)tilesNeeded.set(address.key,address);
  points.push({corners,fx:px-a,fy:py-b});
 }
 const tiles={};await Promise.all([...tilesNeeded.values()].map(async a=>{tiles[a.key]=await loadTile(a.x,a.y,signal)}));
 if(signal?.aborted)throw new DOMException('Aborted','AbortError');
 const decode=a=>{const i=(a.py*TILE_SIZE+a.px)*4,d=tiles[a.key];if(d[i+3]===0)throw new Error('圈选区域高程样本缺失');return d[i]*256+d[i+1]+d[i+2]/256-32768};
 const heights=points.map(({corners,fx,fy})=>{const h=corners.map(decode);return +((h[0]*(1-fx)+h[1]*fx)*(1-fy)+(h[2]*(1-fx)+h[3]*fx)*fy).toFixed(3)});
 const range=footprintExtrema(heights,N);
 return {layout:GRID_LAYOUT,n:N,zoom:ZOOM,heights,...range,lat,lng,span:SELECTION_DIAMETER_M,radius:SELECTION_RADIUS_M,source:'在线真实高程',real:true,name:`${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,collected:'在线读取'};
}
