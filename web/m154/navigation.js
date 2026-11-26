import * as T from 'three';
const rad=Math.PI/180,clamp=T.MathUtils.clamp;
const ox=116.407,oy=39.925,mx=85359.2,my=111033.1;
export const project=(lon,lat)=>({x:(lon-ox)*mx,z:(oy-lat)*my});
export const corePoint=(lon,lat)=>lon>=116.35&&lon<=116.498&&lat>=39.86&&lat<=40.015;
export const unproject=(x,z)=>({lon:x/mx+ox,lat:oy-z/my});
const sw=project(116.351,39.861),ne=project(116.497,40.014),outerSW=project(115.32,39.25),outerNE=project(117.50,40.78);
export function navigation({camera,canvas,getCity,getTerrain,stepHeight,onInteraction,onMode}){
 const target=new T.Vector3(),aim=new T.Vector3(),move=new T.Vector3(),tmp=new T.Vector3(),keys=new Set();
 let alpha=0,elev=.25,dist=140,mode='fly',yaw=0,pitch=0,eye=new T.Vector3(),dest=null,drag=null,pointers=new Map(),pinch=0,current=null,cameraDirty=true,focused=true;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ground=(x,z)=>(getTerrain()?.groundAt?.(x,z)||0)+(mode==='walk'?(stepHeight?.(x,z)||0):0);
 const blocked=(x,z)=>Boolean(getCity()?.isBlocked(x,z,.48));
 const confined=(p,wide=false)=>{const a=wide?outerSW:sw,b=wide?outerNE:ne;p.x=clamp(p.x,a.x,b.x);p.z=clamp(p.z,b.z,a.z);return p};
 function sync(){if(mode==='walk'){camera.position.copy(eye);aim.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));target.copy(eye).addScaledVector(aim,70);camera.lookAt(target);}else{const d=Math.cos(elev)*dist;camera.position.set(target.x+Math.sin(alpha)*d,Math.max(ground(target.x,target.z)+2.5,target.y+Math.sin(elev)*dist),target.z-Math.cos(alpha)*d);camera.position.y=Math.max(camera.position.y,ground(camera.position.x,camera.position.z)+2.5);camera.lookAt(target);}camera.updateMatrixWorld();cameraDirty=false;}
 function choice(lm,walk=false){const p=project(lm.lon,lm.lat),v=lm.view;const b=(lm.id==='tiantan'?193:v.azimuth)*rad;const aspect=camera.aspect||1;const narrow=Math.max(1,.89/aspect);const framing={tiantan:.77,palace:1.12,zun:1.26,cctv:1.15,cube:1.13,stadium:1.15};const factor=(framing[lm.id]||1.10)*narrow;
 return {center:new T.Vector3(p.x,v.targetHeight??lm.height*.39,p.z),alpha:b,elev:(lm.id==='tiantan'?2:v.elevation)*rad,dist:v.distance*factor,b};}
 function safeWalk(x,z,preferred=20){if(!blocked(x,z))return [x,z];for(let r=2;r<=Math.max(360,preferred);r+=r<36?3:12){for(let i=0;i<32;i++){const a=i*Math.PI/16,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;if(!blocked(xx,zz))return[xx,zz]}}return null;}
 function land(lm,fromFocus=true){const p=project(lm.lon,lm.lat),b=lm.view.azimuth*rad;let x=fromFocus?p.x+Math.sin(b)*lm.walkDistance:camera.position.x,z=fromFocus?p.z-Math.cos(b)*lm.walkDistance:camera.position.z;
 const q=confined(new T.Vector3(x,0,z));let safe=safeWalk(q.x,q.z);if(!safe)safe=safeWalk(p.x+lm.walkDistance*1.6,p.z+lm.walkDistance*1.6);if(!safe)return false;
 [x,z]=safe;const surface=(getTerrain()?.groundAt?.(x,z)||0)+(stepHeight?.(x,z)||0);eye.set(x,surface+1.72,z);if(fromFocus){yaw=Math.atan2(p.x-x,z-p.z);pitch=Math.atan2(Math.min(lm.height*.46,105)-1.72,Math.hypot(p.x-x,p.z-z));}else{camera.getWorldDirection(tmp);yaw=Math.atan2(tmp.x,-tmp.z);pitch=.02;}mode='walk';dest=null;sync();return true;}
 function go(lm,instant=false){current=lm;focused=true;if(mode==='walk'){land(lm);return;}const v=choice(lm);if(instant||reduced||target.lengthSq()===0){target.copy(v.center);alpha=v.alpha;elev=v.elev;dist=v.dist;dest=null;sync();return;}
 const len=target.distanceTo(v.center),aDelta=Math.atan2(Math.sin(v.alpha-alpha),Math.cos(v.alpha-alpha));
 dest={elapsed:0,sec:clamp(.8+len/4800,.8,2.9),old:target.clone(),to:v.center,startAlpha:alpha,aDelta,e0:elev,e1:v.elev,d0:dist,d1:v.dist,lift:Math.min(len*.20,1350)};}
 function switchMode(m){if(mode===m)return true;cancel();if(m==='walk'){const at=unproject(camera.position.x,camera.position.z);if(!corePoint(at.lon,at.lat)||!land(current,focused))return false;}else{mode='fly';target.copy(eye).add(new T.Vector3(Math.sin(yaw)*80,12,-Math.cos(yaw)*80));alpha=yaw+Math.PI;elev=.25;dist=110;if(focused&&current)go(current,true);else sync();}onMode?.(mode);return true;}
 function cancel(){dest=null;onInteraction?.();}
 function zoom(factor){cancel();if(mode==='fly')dist=clamp(dist*factor,12,36000);else stride(factor<1?2.4:-2.4,0);cameraDirty=true;}
 function stride(forward,side){const heading=mode==='walk'?yaw:alpha+Math.PI;move.set(Math.sin(heading)*forward+Math.cos(heading)*side,0,-Math.cos(heading)*forward+Math.sin(heading)*side);
 if(mode==='walk'){
  const sub=Math.max(1,Math.ceil(move.length()/.43));for(let k=0;k<sub;k++){const x=clamp(eye.x+move.x/sub,sw.x,ne.x),z=clamp(eye.z+move.z/sub,ne.z,sw.z);const base=eye.y-1.72;if(!blocked(x,eye.z)&&Math.abs(ground(x,eye.z)-base)<.54)eye.x=x;if(!blocked(eye.x,z)&&Math.abs(ground(eye.x,z)-base)<.54)eye.z=z;eye.y=ground(eye.x,eye.z)+1.72;}eye.y=ground(eye.x,eye.z)+1.72;
 }else {const offset=target.y-ground(target.x,target.z);confined(target.add(move),true);target.y=Math.max(0,ground(target.x,target.z)+offset);}focused=false;cameraDirty=true;}
 function key(code,down){const allowed=['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','ShiftLeft','ShiftRight'];if(!allowed.includes(code))return false;if(down){if(!keys.has(code))cancel();keys.add(code);}else keys.delete(code);return true;}
 addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(key(e.code,true))e.preventDefault();});
 addEventListener('keyup',e=>key(e.code,false));addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
 canvas.oncontextmenu=e=>e.preventDefault();canvas.onwheel=e=>{e.preventDefault();zoom(Math.exp(clamp(e.deltaY,-280,280)*.0019))};
 function pinchDist(){const a=[...pointers.values()];return a.length>=2?Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]):0;}
 canvas.onpointerdown=e=>{canvas.focus({preventScroll:true});cancel();canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);pinch=pinchDist();drag={x:e.clientX,y:e.clientY,pan:e.button===2||e.shiftKey};canvas.classList.add('drag')};
 canvas.onpointermove=e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size>1){const d=pinchDist();if(d>10&&pinch>10)zoom(pinch/d);pinch=d;return}if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(mode==='walk'){yaw+=dx*.004;pitch=clamp(pitch-dy*.004,-1.33,1.35);}else if(drag.pan){stride(dy*dist*.0018,-dx*dist*.0018);}else{alpha-=dx*.005;elev=clamp(elev+dy*.004,-.04,1.49);}cameraDirty=true;};
 function end(e){pointers.delete(e.pointerId);pinch=0;if(pointers.size){const [x,y]=pointers.values().next().value;drag={x,y,pan:false}}else{drag=null;canvas.classList.remove('drag');}}
 canvas.onpointerup=canvas.onpointercancel=end;
 function update(dt){
 if(dest){const d=dest;d.elapsed+=dt;const t=clamp(d.elapsed/d.sec,0,1),k=t*t*(3-2*t),arc=Math.sin(k*Math.PI);target.lerpVectors(d.old,d.to,k);target.y+=arc*d.lift*.5;alpha=d.startAlpha+d.aDelta*k;elev=T.MathUtils.lerp(d.e0,d.e1,k)+arc*.18;dist=T.MathUtils.lerp(d.d0,d.d1,k)+arc*d.lift*.7;cameraDirty=true;if(t===1)dest=null;}
 if(keys.size){const f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),s=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),u=Number(keys.has('KeyE'))-Number(keys.has('KeyQ'));const speed=(mode==='walk'?3.3:clamp(dist*.69,25,1300))*(keys.has('ShiftLeft')||keys.has('ShiftRight')?3:1)*dt/(f&&s?Math.SQRT2:1);if(f||s)stride(f*speed,s*speed);if(u&&mode==='fly'){target.y=clamp(target.y+speed*u,0,5600);cameraDirty=true;}}
 if(cameraDirty)sync();
 }
 return {go,zoom,key,update,switchMode,get mode(){return mode},get target(){return target},get distance(){return mode==='fly'?dist:85},get heading(){return mode==='walk'?yaw:alpha+Math.PI},get focused(){return focused},get transitioning(){return Boolean(dest)},stop(){keys.clear()},orbit(dx){if(mode==='fly'&&!dest){alpha+=dx;cameraDirty=true;}},north(){if(mode==='walk')switchMode('fly');cancel();alpha=Math.PI;elev=1.15;dist=Math.max(dist,490);cameraDirty=true;},safe(){if(mode==='walk'&&blocked(eye.x,eye.z)){const safe=safeWalk(eye.x,eye.z);if(safe){eye.x=safe[0];eye.z=safe[1];eye.y=ground(eye.x,eye.z)+1.72;cameraDirty=true;}}},mapFly(lon,lat){if(mode==='walk')switchMode('fly');cancel();const p=project(lon,lat);target.set(p.x,Math.max(0,ground(p.x,p.z)),p.z);alpha=Math.PI;elev=corePoint(lon,lat)?.91:.31;dist=corePoint(lon,lat)?700:7300;focused=false;cameraDirty=true;},getCamera(){return {...unproject(camera.position.x,camera.position.z),height:Math.max(0,camera.position.y-ground(camera.position.x,camera.position.z)),heading:this.heading}}};
}
