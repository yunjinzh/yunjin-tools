import {featureName} from './data.mjs';

export const THEMES={
 classic:{name:'纸上山河',paper:'#F4F0E6',road:'#B94D3B',water:'#3E8294',park:'#58755C',landmark:'#243D49',ink:'#293C40',muted:'#7D847B'},
 ink:{name:'水墨留白',paper:'#F1F0EA',road:'#4E5551',water:'#8A9996',park:'#687772',landmark:'#212E2A',ink:'#26332F',muted:'#8C948E'},
 blueprint:{name:'深海蓝图',paper:'#173E4B',road:'#E7B99A',water:'#8DD0DC',park:'#A8CAB1',landmark:'#E8EBDF',ink:'#EBEDE3',muted:'#A4B9BB'},
 rose:{name:'瑞士赤陶',paper:'#F1F0EC',road:'#D17362',water:'#6995A2',park:'#7C8E75',landmark:'#4A5152',ink:'#3F4849',muted:'#858B85'}
};
export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export function mercator(lng,lat){return [(lng+180)/360,(1-Math.log(Math.tan(Math.PI/4+clamp(lat,-85.0511,85.0511)*Math.PI/360))/Math.PI)/2];}
export function makeProjector(b,w,h,pad=0){let east=b.east;if(east<b.west)east+=360;const a=mercator(b.west,b.north),z=mercator(east,b.south);const sx=(w-pad*2)/(z[0]-a[0]),sy=(h-pad*2)/(z[1]-a[1]),scale=Math.min(sx,sy),ox=(w-(z[0]-a[0])*scale)/2,oy=(h-(z[1]-a[1])*scale)/2,mid=(b.west+east)/2;return ([lng,lat])=>{while(lng-mid>180)lng-=360;while(lng-mid< -180)lng+=360;const [x,y]=mercator(lng,lat);return [(x-a[0])*scale+ox,(y-a[1])*scale+oy];};}
export function ringArea(r){let a=0;for(let i=0,j=r.length-1;i<r.length;j=i++)a+=r[j][0]*r[i][1]-r[i][0]*r[j][1];return Math.abs(a/2);}
export function boundsOf(points){let x=Infinity,y=Infinity,r=-Infinity,b=-Infinity;for(const p of points){x=Math.min(x,p[0]);y=Math.min(y,p[1]);r=Math.max(r,p[0]);b=Math.max(b,p[1]);}return {x,y,r,b,w:r-x,h:b-y};}
export function insideRing(p,r){let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
export function insidePolygon(p,rings){return !!rings?.length&&insideRing(p,rings[0])&&!rings.slice(1).some(r=>insideRing(p,r));}
const intersect=(a,b)=>a.x<b.r&&a.r>b.x&&a.y<b.b&&a.b>b.y;
export function scanIntervals(rings,y){const xs=[];for(const ring of rings)for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[j],b=ring[i];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);const out=[];for(let i=0;i+1<xs.length;i+=2)if(xs[i+1]>xs[i])out.push([xs[i],xs[i+1]]);return out;}
export function subtractIntervals(intervals,cuts){let result=intervals;for(const [a,b]of cuts){const next=[];for(const [l,r]of result){if(b<=l||a>=r)next.push([l,r]);else{if(l<a)next.push([l,a]);if(b<r)next.push([b,r]);}}result=next;}return result;}
function segDist(p,a,b){let x=a[0],y=a[1],dx=b[0]-x,dy=b[1]-y;if(dx||dy){const t=clamp(((p[0]-x)*dx+(p[1]-y)*dy)/(dx*dx+dy*dy),0,1);x+=dx*t;y+=dy*t;}return Math.hypot(p[0]-x,p[1]-y);}
function interiorAnchor(poly,excludes,w,h){const b=poly.box;let best=null,bestD=-1;const x1=Math.max(10,b.x),x2=Math.min(w-10,b.r),y1=Math.max(10,b.y),y2=Math.min(h-30,b.b);if(x1>=x2||y1>=y2)return null;for(let iy=0;iy<=14;iy++)for(let ix=0;ix<=14;ix++){const p=[x1+(x2-x1)*(ix+.5)/15,y1+(y2-y1)*(iy+.5)/15];if(!insidePolygon(p,poly.rings)||excludes.some(q=>insidePolygon(p,q.rings)))continue;let d=Infinity;for(const rr of [poly,...excludes])for(const ring of rr.rings)for(let i=0,j=ring.length-1;i<ring.length;j=i++)d=Math.min(d,segDist(p,ring[j],ring[i]));if(d>bestD){bestD=d;best={p,d};}}return best;}
class CollisionGrid{constructor(){this.cells=new Map();}keys(b){const out=[];for(let x=Math.floor(b.x/48);x<=Math.floor(b.r/48);x++)for(let y=Math.floor(b.y/48);y<=Math.floor(b.b/48);y++)out.push(x+','+y);return out;}hits(b){const seen=new Set();for(const k of this.keys(b))for(const other of this.cells.get(k)||[]){if(seen.has(other))continue;seen.add(other);if(intersect(b,other))return true;}return false;}insert(b){for(const k of this.keys(b)){if(!this.cells.has(k))this.cells.set(k,[]);this.cells.get(k).push(b);}}}
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
export function lineMetrics(line){const d=[0];for(let i=1;i<line.length;i++)d.push(d[i-1]+Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]));return {line,d,total:d.at(-1)||0};}
function along(m,d){if(d<0||d>m.total)return null;let lo=1,hi=m.d.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(m.d[mid]<d)lo=mid+1;else hi=mid;}const i=lo,a=m.line[i-1],b=m.line[i];if(!a||!b)return null;const t=(d-m.d[i-1])/(m.d[i]-m.d[i-1]||1);return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,angle:Math.atan2(b[1]-a[1],b[0]-a[0])};}
function mergeLines(lines){const result=[];const groups=new Map();for(const p of lines){const k=p.category+'|'+p.name+'|'+(p.tags.highway||'');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p);}for(const entries of groups.values()){const pending=[...entries];while(pending.length){const first=pending.shift();let coords=[...first.line],changed=true;while(changed&&coords.length<6000){changed=false;for(let i=0;i<pending.length;i++){const q=pending[i].line,a=coords[0],b=coords.at(-1),c=q[0],d=q.at(-1);const near=(u,v)=>Math.hypot(u[0]-v[0],u[1]-v[1])<1.5;if(near(b,c))coords.push(...q.slice(1));else if(near(b,d))coords.push(...q.slice(0,-1).reverse());else if(near(a,d))coords.unshift(...q.slice(0,-1));else if(near(a,c))coords.unshift(...q.slice(1).reverse());else continue;pending.splice(i,1);changed=true;break;}}result.push({...first,line:coords});}}return result;}

export function buildScene(features,bounds,width,height,settings={},measureText){
 const theme=THEMES[settings.theme]||THEMES.classic,base=Number(settings.fontSize)||14,density=Number(settings.density)||1,language=settings.language||'zh',overrides=settings.overrides||{},layers=settings.layers||{road:true,water:true,park:true,landmark:true};
 const project=makeProjector(bounds,width,height),font= settings.fontFamily==='sans'?'sans-serif':'AtlasSerif';
 const measure=(t,s)=>measureText?measureText(t,s,font):Array.from(t).reduce((n,c)=>n+s*(/[\u2e80-\uffff]/.test(c)?1:.58),0);
 const commands=[],polys=[],lines=[],pois=[],grid=new CollisionGrid(),drawn=new Set();let omitted=0;
 const frame={x:5,y:5,r:width-5,b:height-28};
 for(const f of features){if(!layers[f.category]||overrides[f.id]?.hidden)continue;const name=featureName(f,language,overrides);if(!name)continue;const g=f.geometry,common={id:f.id,name,category:f.category,tags:f.tags||{}};
  const polygon=coords=>{const rings=coords.map(r=>r.map(project));if(rings[0]?.length<4)return;const box=boundsOf(rings[0]);if(!intersect(box,frame))return;const area=ringArea(rings[0])-rings.slice(1).reduce((n,r)=>n+ringArea(r),0);if(area<45){omitted++;return;}polys.push({...common,rings,box,area});};
  const line=coords=>{const points=coords.map(project);if(points.length<2||!intersect(boundsOf(points),frame))return;lines.push({...common,line:points});};
  if(g.type==='Polygon')polygon(g.coordinates);else if(g.type==='MultiPolygon')g.coordinates.forEach(polygon);else if(g.type==='LineString')line(g.coordinates);else if(g.type==='MultiLineString')g.coordinates.forEach(line);else {const pts=g.type==='Point'?[g.coordinates]:g.coordinates;for(const p of pts){const q=project(p);if(q[0]>8&&q[0]<width-8&&q[1]>8&&q[1]<height-32)pois.push({...common,p:q});}}
 }
 polys.sort((a,b)=>b.area-a.area);if(polys.length>500){omitted+=polys.length-500;polys.length=500;}
 function exclusion(p){return polys.filter(q=>q!==p&&q.area<p.area*.97&&intersect(q.box,p.box)&&(q.category!==p.category||q.name!==p.name));}
 function fitBox(p,s,text,angle=0){const tw=measure(text,s),co=Math.abs(Math.cos(angle)),si=Math.abs(Math.sin(angle));return {x:p[0]-(tw*co+s*si)/2-2,y:p[1]-(tw*si+s*co)/2-2,r:p[0]+(tw*co+s*si)/2+2,b:p[1]+(tw*si+s*co)/2+2};}
 function inFrame(b){return b.x>=frame.x&&b.y>=frame.y&&b.r<=frame.r&&b.b<=frame.b;}
 function rectInside(b,p,ex=[]){for(const x of [b.x,(b.x+b.r)/2,b.r])for(const y of [b.y,(b.y+b.b)/2,b.b]){if(!insidePolygon([x,y],p.rings)||ex.some(q=>insidePolygon([x,y],q.rings)))return false;}return true;}
 function add(text,x,y,size,category,id,kind='fill',angle=0,opacity=1){commands.push({text,x,y,size,category,id,kind,angle,opacity,color:theme[category],font});drawn.add(id);}
 // Reserve the names of major geographic areas first. Every label stays in its polygon.
 const titles=[];
 for(const p of polys){if(p.area<900)continue;const ex=exclusion(p),anchor=interiorAnchor(p,ex,width,height);if(!anchor)continue;let size=clamp(Math.sqrt(p.area)/8,base*1.25,base*2.9);if(p.category==='landmark')size=Math.min(size,base*1.8);let placed=false;
  while(size>=base*.9){const b=fitBox(anchor.p,size,p.name);if(inFrame(b)&&rectInside(b,p,ex)&&!grid.hits(b)){grid.insert(b);titles.push({p:anchor.p,name:p.name,size,category:p.category,id:p.id});placed=true;break;}size-=1;}
  if(!placed&&p.name.length>=6&&anchor.d>base*1.3){const cs=Array.from(p.name);const cut=Math.ceil(cs.length/2),ls=[cs.slice(0,cut).join(''),cs.slice(cut).join('')];size=Math.min(base*1.55,anchor.d*.68);const boxes=ls.map((t,i)=>fitBox([anchor.p[0],anchor.p[1]+(i-.5)*size*1.3],size,t));if(boxes.every(b=>inFrame(b)&&rectInside(b,p,ex)&&!grid.hits(b))){boxes.forEach(b=>grid.insert(b));ls.forEach((name,i)=>titles.push({p:[anchor.p[0],anchor.p[1]+(i-.5)*size*1.3],name,size,category:p.category,id:p.id}));}}
 }
 const labelNames=new Set(titles.map(t=>t.name));
 const placePoi=(p)=>{if(labelNames.has(p.name))return;const s=base*(p.tags.historic||p.tags.tourism?1:.85);const b=fitBox(p.p,s,p.name);if(inFrame(b)&&!grid.hits(b)){grid.insert(b);titles.push({p:p.p,name:p.name,size:s,category:p.category,id:p.id});labelNames.add(p.name);}else omitted++;};
 pois.sort((a,b)=>(b.tags.historic?3:b.tags.tourism?2:1)-(a.tags.historic?3:a.tags.tourism?2:1));pois.slice(0,240).forEach(placePoi);omitted+=Math.max(0,pois.length-240);
 const outlineGlyphs=(line,p,size,step,kind)=>{
  let arr=line;const first=arr[0],last=arr.at(-1);if(!first||!last)return;
  const dx=last[0]-first[0],dy=last[1]-first[1];if((Math.abs(dx)>Math.abs(dy)*.4&&dx<0)||(Math.abs(dx)<=Math.abs(dy)*.4&&dy<0))arr=[...line].reverse();
  const m=lineMetrics(arr),chars=Array.from(p.name),cjk=/[\u2e80-\uffff]/.test(p.name);const widths=chars.map(c=>measure(c,size)+(cjk?size*.1:size*.025));const full=widths.reduce((a,b)=>a+b,0);if(m.total<full+8)return;
  const interval=full+step;for(let dist=Math.min(size*1.2,(m.total-full)/2);dist+full<m.total&&commands.length<24000;dist+=interval){const chunk=[];let at=dist,ok=true,previousAngle=null;for(let i=0;i<chars.length;i++){const a=along(m,at+widths[i]/2);at+=widths[i];if(!a){ok=false;break;}let angle=a.angle;if(angle>Math.PI/2)angle-=Math.PI;if(angle< -Math.PI/2)angle+=Math.PI;if(cjk&&Math.abs(angle)>Math.PI*.33)angle=0;if(previousAngle!==null&&Math.abs(angle-previousAngle)>1.2){ok=false;break;}previousAngle=angle;const box=fitBox([a.x,a.y],size,chars[i],angle);if(!inFrame(box)||grid.hits(box)){ok=false;break;}chunk.push({a,box,ch:chars[i],angle});}
   if(ok){for(const v of chunk){add(v.ch,v.a.x,v.a.y,size,p.category,p.id,kind,v.angle,kind==='contour'?.7:1);grid.insert(v.box);}}
  }
 };
 const roadRank={motorway:9,trunk:8,primary:7,secondary:6,tertiary:5,residential:4,unclassified:3,service:2,pedestrian:2,footway:1,path:1};
 const merged=mergeLines(lines).sort((a,b)=>(roadRank[b.tags.highway]||4)-(roadRank[a.tags.highway]||4));
 for(const p of merged.slice(0,700)){const rank=roadRank[p.tags.highway]||4,size=base*(p.category==='water'?.88:rank>=6?1.05:rank>=4?.87:.72);outlineGlyphs(p.line,p,Math.max(9,size),base*(rank>=5?1.8:2.4)/density,'path');}
 omitted+=Math.max(0,merged.length-700);
 // Smaller shapes occlude larger shapes; no park names are placed over a lake or island.
 const fills=[...polys].sort((a,b)=>a.area-b.area);
 for(const p of fills){if(commands.length>=23500){omitted++;continue;}const ex=exclusion(p),s=base*(p.category==='water'?.8:p.category==='park'?.77:.7);const minY=Math.max(frame.y,p.box.y),maxY=Math.min(frame.b,p.box.b),rowGap=s*(2.18/density),wordGap=s*(1.2/density),tw=measure(p.name,s);if(tw>width*1.2)continue;
  const phase=(hash(p.id)%100)/100;let row=0;
  for(let y=minY+s+phase*rowGap;y<maxY-s;y+=rowGap,row++){
   let ints=scanIntervals(p.rings,y);const cuts=ex.flatMap(q=>scanIntervals(q.rings,y));ints=subtractIntervals(ints,cuts);
   for(const [left,right]of ints){let start=Math.max(left+s*.3,frame.x),end=Math.min(right-s*.3,frame.r);const available=end-start;if(available<tw+3)continue;const repeats=Math.floor((available+wordGap)/(tw+wordGap));const packed=repeats*tw+(repeats-1)*wordGap;start+=(available-packed)/2;
    for(let col=0;col<repeats&&commands.length<23500;col++){const x=start+tw/2+col*(tw+wordGap);const b=fitBox([x,y],s,p.name);if(inFrame(b)&&rectInside(b,p,ex)&&!grid.hits(b)){add(p.name,x,y,s,p.category,p.id,'fill',0,p.category==='landmark'?.68:.82);grid.insert(b);}}
   }
  }
  if(settings.contours!==false&&p.area>8000&&p.category!=='landmark'){for(const ring of p.rings.slice(0,1))outlineGlyphs(ring,p,Math.max(9,s*.93),base*2/density,'contour');}
 }
 for(const t of titles)add(t.name,t.p[0],t.p[1],t.size,t.category,t.id,'title',0,1);
 const counts={road:0,water:0,park:0,landmark:0};for(const f of features)if(drawn.has(f.id))counts[f.category]++;
 return {width,height,bounds:{...bounds},commands,theme,font,counts,featureCount:drawn.size,glyphCount:commands.reduce((n,c)=>n+Array.from(c.text).length,0),omitted,metadata:{source:'OpenStreetMap contributors',attribution:'© OpenStreetMap contributors · openstreetmap.org/copyright'}};
}
export function drawScene(ctx,scene,{scale=1,transparent=false,title='',footer=true}={}){
 ctx.save();ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,scene.width,scene.height);if(!transparent){ctx.fillStyle=scene.theme.paper;ctx.fillRect(0,0,scene.width,scene.height);}ctx.textAlign='center';ctx.textBaseline='middle';
 for(const c of scene.commands){ctx.save();ctx.translate(c.x,c.y);if(c.angle)ctx.rotate(c.angle);ctx.globalAlpha=c.opacity;ctx.fillStyle=c.color;ctx.font=`400 ${c.size}px ${c.font==='AtlasSerif'?'"AtlasSerif", serif':'sans-serif'}`;ctx.fillText(c.text,0,0);ctx.restore();}
 if(footer){ctx.globalAlpha=.8;ctx.fillStyle=scene.theme.muted;ctx.font='9px sans-serif';ctx.textAlign='right';ctx.fillText(scene.metadata.attribution,scene.width-12,scene.height-12);if(title){ctx.textAlign='left';ctx.fillText(title.slice(0,55),12,scene.height-(scene.width<750?24:12),scene.width<750?scene.width-24:scene.width-350);}}
 ctx.restore();
}
export function escapeXML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
export function sceneSVG(scene,{transparent=false,title='',fontData=''}={}){
 const esc=escapeXML;const body=scene.commands.map(c=>`<text x="${c.x.toFixed(2)}" y="${c.y.toFixed(2)}" font-size="${c.size.toFixed(2)}" fill="${c.color}" opacity="${c.opacity}"${c.angle?` transform="rotate(${(c.angle*180/Math.PI).toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)})"`:''} data-osm-id="${esc(c.id)}">${esc(c.text)}</text>`).join('');
 const style=fontData?`<style>@font-face{font-family:AtlasSerif;src:url(data:font/woff2;base64,${fontData}) format('woff2');font-weight:400}text{font-family:AtlasSerif,serif}</style>`:`<style>text{font-family:${scene.font==='AtlasSerif'?"'Noto Serif CJK SC','Songti SC',serif":'sans-serif'}}</style>`;
 return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}"><title>${esc(title||'文字地图')}</title><metadata>${esc(JSON.stringify({bounds:scene.bounds,source:'OpenStreetMap',license:'ODbL',url:'https://www.openstreetmap.org/copyright'}))}</metadata>${style}${transparent?'':`<rect width="100%" height="100%" fill="${scene.theme.paper}"/>`}<g text-anchor="middle" dominant-baseline="central" font-weight="400">${body}</g><g fill="${scene.theme.muted}" font-family="sans-serif" font-size="9"><text x="12" y="${scene.height-(scene.width<750?22:9)}">${esc(title.slice(0,55))}</text><text x="${scene.width-12}" y="${scene.height-9}" text-anchor="end">${esc(scene.metadata.attribution)}</text></g></svg>`;
}
