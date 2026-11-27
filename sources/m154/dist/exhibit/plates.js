// Native-resolution scene plate viewer, with keyboard and two-finger control.
export function plateViewer(onOpen,onClose){
 const dlg=document.querySelector('#plate'),box=dlg.querySelector('.plate-stage'),img=dlg.querySelector('img'),message=dlg.querySelector('[role=status]'),counter=dlg.querySelector('output');
 const pointers=new Map();let prevPinch=0,zoom=1,x=0,y=0,serial=0;
 const range=(v,a,b)=>Math.max(a,Math.min(b,v));
 function fit(){return Math.min(box.clientWidth/(img.naturalWidth||3840),box.clientHeight/(img.naturalHeight||2160));}
 function draw(){const f=fit(),w=(img.naturalWidth||3840)*f,h=(img.naturalHeight||2160)*f;
  x=range(x,-Math.max(0,(w*zoom-box.clientWidth)/2),Math.max(0,(w*zoom-box.clientWidth)/2));y=range(y,-Math.max(0,(h*zoom-box.clientHeight)/2),Math.max(0,(h*zoom-box.clientHeight)/2));
  img.style.width=w+'px';img.style.height=h+'px';img.style.transform='translate(calc(-50% + '+x+'px),calc(-50% + '+y+'px)) scale('+zoom+')';
  counter.value=Math.round(f*zoom*100)+'%';box.style.cursor=zoom>1.01?'grab':'zoom-in';
 }
 function change(z,cx=0,cy=0){const old=zoom;zoom=range(z,1,Math.max(4,1/Math.max(.05,fit())*1.5));x=cx-(cx-x)*zoom/old;y=cy-(cy-y)*zoom/old;draw();}
 function point(e){const r=box.getBoundingClientRect();return[e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2];}
 function length(){const p=[...pointers.values()];return p.length>1?Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]):0;}
 box.onwheel=e=>{e.preventDefault();change(zoom*Math.exp(-range(e.deltaY,-300,300)*.0025),...point(e));};
 box.ondblclick=e=>change(zoom>1.01?1:Math.max(2,1/fit()),...point(e));
 box.onpointerdown=e=>{box.setPointerCapture(e.pointerId);pointers.set(e.pointerId,point(e));prevPinch=length();};
 box.onpointermove=e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId),p=point(e);pointers.set(e.pointerId,p);const current=length();if(current>0&&prevPinch>0){const pts=[...pointers.values()];change(zoom*current/prevPinch,(pts[0][0]+pts[1][0])/2,(pts[0][1]+pts[1][1])/2);}else{x+=p[0]-old[0];y+=p[1]-old[1];draw();}prevPinch=current;};
 box.onpointerup=box.onpointercancel=e=>{pointers.delete(e.pointerId);prevPinch=length();};
 dlg.querySelector('[data-action=fit]').onclick=()=>change(1);dlg.querySelector('[data-action=actual]').onclick=()=>change(Math.max(1,1/fit()));
 dlg.querySelector('[data-action=in]').onclick=()=>change(zoom*1.4);dlg.querySelector('[data-action=out]').onclick=()=>change(zoom/1.4);
 dlg.querySelector('[data-action=close]').onclick=()=>dlg.close();
 dlg.onkeydown=e=>{if(e.key==='+'||e.key==='=')change(zoom*1.4);else if(e.key==='-')change(zoom/1.4);else if(e.key==='Home')change(1);else if(e.key.startsWith('Arrow')){x+=e.key==='ArrowRight'?-50:e.key==='ArrowLeft'?50:0;y+=e.key==='ArrowDown'?-50:e.key==='ArrowUp'?50:0;draw();}else return;e.preventDefault();e.stopPropagation();};
 new ResizeObserver(()=>{if(dlg.open)draw();}).observe(box);
 dlg.onclose=()=>{serial++;pointers.clear();onClose();};
 return async c=>{
  const version=++serial;onOpen();dlg.showModal();zoom=1;x=y=0;img.hidden=true;message.textContent='正在载入 4K 画面';dlg.querySelector('h2').textContent=c.name;
  img.src='exhibit/'+c.id+'-4k.webp';img.alt=c.name+' · 三维原生渲染';try{await img.decode();if(version!==serial)return;if(img.naturalWidth!==3840||img.naturalHeight!==2160)throw Error();img.hidden=false;message.textContent='';draw();}catch{if(version===serial)message.textContent='4K 画面载入失败，请退出后重试。';}
 };
}
