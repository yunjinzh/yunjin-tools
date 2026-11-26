const $=s=>document.querySelector(s),clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),rad=Math.PI/180;
export function fieldViewer(){
 const dialog=$('#fieldDialog'),screen=$('#fieldScreen'),img=$('#fieldImage'),canvas=$('#fieldSphere'),msg=$('#fieldMessage');
 let catalog,items=[],item,index=0,version=0,scale=1,yaw=0,pitch=0,dx=0,dy=0,drag=null,source,frame=0,token=0;
 const isSphere=()=>item?.type==='sphere',sphericalImages=new Map();
 function reset(){scale=1;dx=dy=0;yaw=(item?.initialYaw??item?.yaw??102)*rad;pitch=(item?.initialPitch??item?.pitch??7)*rad;render();}
 function render(){if(!isSphere()){img.style.transform='translate('+dx+'px,'+dy+'px) scale('+scale+')';return;}
  if(!source||frame)return;
  frame=requestAnimationFrame(()=>{frame=0;if(!dialog.open||!isSphere()||!source)return;
   const {width:sw,height:sh,data}=source,W=Math.min(1050,Math.round(screen.clientWidth)),H=Math.max(1,Math.round(W*screen.clientHeight/Math.max(1,screen.clientWidth)));
   if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
   const ctx=canvas.getContext('2d'),image=ctx.createImageData(W,H),pixels=new Uint32Array(image.data.buffer),src=new Uint32Array(data.buffer);
   const focal=H/(2*Math.tan((72/Math.sqrt(scale))*rad/2)),ca=Math.cos(pitch),sa=Math.sin(pitch);
   for(let y=0,k=0;y<H;y++){const vy=(H/2-y)/focal,yw=sa+vy*ca,zw=ca-vy*sa;
    for(let x=0;x<W;x++,k++){const vx=(x-W/2)/focal,az=Math.atan2(vx,zw)+yaw,alt=Math.atan2(yw,Math.hypot(vx,zw));
     const u=(((az/(2*Math.PI)+.5)%1+1)%1)*sw,v=clamp((.5-alt/Math.PI)*sh,0,sh-1);pixels[k]=src[(v|0)*sw+(u|0)];}}
   ctx.putImageData(image,0,0);});
 }
 function zoom(n){if(!item)return;scale=clamp(scale*n,1,isSphere()?8:6);if(scale===1){dx=0;dy=0;}render();}
 async function choose(i){
  item=items[index=i];if(!item)return;const row=item,key=++token;
  source=null;img.hidden=isSphere();canvas.hidden=!isSphere();msg.textContent='正在载入实景…';reset();
  $('#fieldName').textContent=row.name;$('#fieldType').textContent=isSphere()?'360° 球面全景 · 拖动环视':(row.format||'实景摄影')+' · 可放大';$('#fieldDescription').textContent=row.description;
  const credit=$('#fieldCredit');credit.replaceChildren();
  const a=document.createElement('a'),license=document.createElement('a');a.href=row.url;a.textContent=row.credit;license.href=row.licenseUrl;license.textContent=row.license;
  for(const link of [a,license]){link.target='_blank';link.rel='noopener';}
  credit.append(row.date?(/^\d{4}-\d\d-\d\d/.test(row.date)?row.date.slice(0,10):row.date)+'　摄影 ':'摄影 ',a,'　·　',license);
  [...$('#fieldStrip').children].forEach((el,j)=>el.setAttribute('aria-pressed',String(j===index)));
  try{
   if(isSphere()){
    if(!sphericalImages.has(row.file))sphericalImages.set(row.file,(async()=>{const im=new Image();im.src=row.file;await im.decode();const c=document.createElement('canvas');c.width=Math.min(4096,im.width);c.height=c.width/2;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,c.width,c.height);return g.getImageData(0,0,c.width,c.height);})().catch(e=>{sphericalImages.delete(row.file);throw e;}));
    const result=await sphericalImages.get(row.file);if(key!==token)return;source=result;render();
   }else{img.src=row.file;img.alt=row.name;await img.decode();}
   if(key===token)msg.textContent='';
  }catch{if(key===token)msg.textContent='这张影像加载失败，可选择其他视点或再点一次。';}
 }
 async function open(id,title){const v=++version;dialog.showModal();$('#fieldTitle').textContent=title+' · 实景对照';msg.textContent='正在读取影像';$('#fieldClose').focus();
  try{catalog??=await fetch('field/index.json').then(r=>r.json());if(v!==version||!dialog.open)return;items=catalog[id];const strip=$('#fieldStrip');strip.replaceChildren();
   items.forEach((r,i)=>{const b=document.createElement('button');b.title=r.name;b.setAttribute('aria-label',r.name);const im=document.createElement('img');im.src=r.thumb;im.alt='';b.append(im);b.onclick=()=>choose(i);strip.append(b);});await choose(0);
  }catch{msg.textContent='实景目录加载失败，请关闭后重试。';}}
 $('#fieldClose').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{version++;token++;drag=null;});
 $('#fieldPlus').onclick=()=>zoom(1.45);$('#fieldMinus').onclick=()=>zoom(1/1.45);$('#fieldReset').onclick=reset;
 screen.onwheel=e=>{e.preventDefault();zoom(Math.exp(-clamp(e.deltaY,-300,300)*.002));};screen.ondblclick=()=>scale>1?reset():zoom(2);
 screen.onpointerdown=e=>{screen.setPointerCapture(e.pointerId);drag=[e.clientX,e.clientY];};
 screen.onpointerup=screen.onpointercancel=()=>{drag=null;};
 screen.onpointermove=e=>{if(!drag)return;const x=e.clientX-drag[0],y=e.clientY-drag[1];drag=[e.clientX,e.clientY];if(isSphere()){yaw-=x*.004/Math.sqrt(scale);pitch=clamp(pitch+y*.004/Math.sqrt(scale),-1.54,1.54);}else{dx=clamp(dx+x,-screen.clientWidth*(scale-1)/2,screen.clientWidth*(scale-1)/2);dy=clamp(dy+y,-screen.clientHeight*(scale-1)/2,screen.clientHeight*(scale-1)/2);}render();};
 dialog.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();choose((index+items.length+(e.key==='ArrowRight'?1:-1))%items.length);}else if(e.key==='+'||e.key==='=')zoom(1.4);else if(e.key==='-')zoom(1/1.4);};
 new ResizeObserver(render).observe(screen);return {open,isOpen:()=>dialog.open};
}
