const bounds=[116.35,39.86,116.498,40.015],wm=12650,hm=17213;
const image=new Image();image.src='./data/locator.webp';const regionImage=new Image();regionImage.src='./terrain-data/beijing-region.webp';
const outerBounds=[115.30,39.23,117.52,40.80];
const xy=(lon,lat)=>[(lon-bounds[0])/(bounds[2]-bounds[0])*wm,(bounds[3]-lat)/(bounds[3]-bounds[1])*hm];
export function locator({landmarks,getCamera,go,flyTo}){
 let big=null,zoom=1,center=[wm/2,hm/2],pins=[],drag=null,base=1,selected='',wide=false;
 const regA=xy(outerBounds[0],outerBounds[3]),regB=xy(outerBounds[2],outerBounds[1]);
 const mini=document.querySelector('#mini');
 function paint(canvas,isMini){
   if(!canvas)return;
   const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;const eye=getCamera(),pos=xy(eye.lon,eye.lat);
   const scale=isMini?W/(Math.max(1800,Math.min(8000,eye.height*3+2700))):(wide?Math.min(W/((regB[0]-regA[0])*1.02),H/((regB[1]-regA[1])*1.02)):Math.min(W/(wm*1.13),H/(hm*1.10)))*zoom;
   const [cx,cy]=isMini?pos:center;
   const pt=(p)=>[(p[0]-cx)*scale+W/2,(p[1]-cy)*scale+H/2];
   c.fillStyle='#202b2a';c.fillRect(0,0,W,H);const [rx,ry]=pt(regA),[rx2,ry2]=pt(regB);if(regionImage.complete&&regionImage.naturalWidth){c.globalAlpha=wide&&!isMini?.86:.44;c.drawImage(regionImage,rx,ry,rx2-rx,ry2-ry);c.globalAlpha=1;}const [ox,oy]=pt([0,0]);if(image.complete&&image.naturalWidth)c.drawImage(image,ox,oy,wm*scale,hm*scale);
   if(!isMini)pins=[];
   for(const lm of landmarks){
    const [x,y]=pt(xy(lm.lon,lm.lat));if(x<-20||y<-20||x>W+20||y>H+20)continue;
    const active=lm.id===selected;const r=isMini?3:active?6:4.5;
    c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=active?'#ffa67c':'#e2d8b0';c.fill();c.strokeStyle='#292b23';c.lineWidth=1;c.stroke();
    if(!isMini){
     let dx=9,dy=1,align='left';if(lm.id==='cube'||lm.id==='ncpa'){dx=-9;align='right'}if(lm.id==='cctv')dy=-12;if(lm.id==='zun')dy=15;if(lm.id==='palace')dy=-7;
     if(wide&&!isMini&&zoom<4&&!active)continue;const text=lm.short;c.font='bold 13px system-ui,sans-serif';c.textAlign=align;c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#202825';c.strokeText(text,x+dx,y+dy);c.fillStyle=active?'#ffd8b3':'#f0ead7';c.fillText(text,x+dx,y+dy);
     const tw=c.measureText(text).width;pins.push({id:lm.id,x,y,l:align==='left'?x+dx:x+dx-tw,r:align==='left'?x+dx+tw:x+dx,t:y+dy-8,b:y+dy+8});
    }
   }
   const [px,py]=pt(pos);c.save();c.translate(px,py);c.rotate(eye.heading||0);c.beginPath();c.moveTo(0,-13);c.lineTo(7,8);c.lineTo(0,5);c.lineTo(-7,8);c.closePath();c.fillStyle='#f0a16d';c.fill();c.strokeStyle='#332d26';c.lineWidth=1.3;c.stroke();c.restore();
   if(!isMini){base=scale;c.textAlign='left';c.font='11px monospace';c.fillStyle='#e0e4d4';c.fillText('N ↑',14,18);const len=wide?(zoom>2?15000:40000):(zoom>2?1000:3000);c.fillRect(14,H-18,len*scale,2);c.fillText(len/1000+' km',14,H-22);}
 }
 function draw(){paint(mini,true);if(big&&big.isConnected)paint(big,false);}
 function attach(canvas){big=canvas;wide=false;zoom=1;center=[wm/2,hm/2];const size=()=>{const r=big.getBoundingClientRect();if(r.width&&r.height){big.width=Math.round(r.width);big.height=Math.round(r.height);draw();}};requestAnimationFrame(size);
   const where=e=>{const r=canvas.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
   canvas.onwheel=e=>{e.preventDefault();const [x,y]=where(e),ox=(x-canvas.width/2)/base,oy=(y-canvas.height/2)/base;const n=Math.max(1,Math.min(9,zoom*Math.exp(-e.deltaY*.0017)));center[0]+=ox*(1-zoom/n);center[1]+=oy*(1-zoom/n);zoom=n;draw()};
   canvas.onpointerdown=e=>{const p=where(e);drag={p,start:p,dist:0};canvas.setPointerCapture(e.pointerId)};
   canvas.onpointermove=e=>{if(!drag)return;const p=where(e);drag.dist+=Math.hypot(p[0]-drag.p[0],p[1]-drag.p[1]);center[0]=Math.max(wide?regA[0]:0,Math.min(wide?regB[0]:wm,center[0]-(p[0]-drag.p[0])/base));center[1]=Math.max(wide?regA[1]:0,Math.min(wide?regB[1]:hm,center[1]-(p[1]-drag.p[1])/base));drag.p=p;draw()};
   canvas.onpointerup=e=>{if(!drag)return;const [x,y]=where(e);if(drag.dist<5){const hit=pins.find(i=>Math.hypot(i.x-x,i.y-y)<10||(x>=i.l&&x<=i.r&&y>=i.t&&y<=i.b));if(hit)go(hit.id);}drag=null};
   canvas.onpointercancel=()=>drag=null;
   canvas.ondblclick=e=>{const [x,y]=where(e);const xx=(x-canvas.width/2)/base+center[0],yy=(y-canvas.height/2)/base+center[1];if(wide?(xx>regA[0]&&xx<regB[0]&&yy>regA[1]&&yy<regB[1]):(xx>=0&&yy>=0&&xx<=wm&&yy<=hm))flyTo(bounds[0]+xx/wm*(bounds[2]-bounds[0]),bounds[3]-yy/hm*(bounds[3]-bounds[1]))};
 }
 image.onload=regionImage.onload=draw;
 return {draw,attach,setRegion(value){wide=value;zoom=1;center=wide?[(regA[0]+regB[0])/2,(regA[1]+regB[1])/2]:[wm/2,hm/2];draw();},select(id){selected=id;draw()},detach(){big=null;drag=null}};
}
