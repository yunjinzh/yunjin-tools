import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {Item,matById,Material,Design,Wall} from './data';
const textures=new Map<string,T.CanvasTexture>();
const swatches=new Map<string,string>();
let seed=1;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
export function swatch(id:string){if(swatches.has(id))return swatches.get(id)!;const m=matById(id),c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d')!;seed=id.split('').reduce((a,b)=>a+b.charCodeAt(0),29);x.fillStyle=m.color;x.fillRect(0,0,256,256);
 if(m.kind==='wood'){for(let y=0;y<256;y+=32){x.fillStyle=`rgba(${rnd()>.5?'255,245,220':'53,26,12'},${.025+rnd()*.045})`;x.fillRect(0,y,256,32);x.strokeStyle='rgba(55,28,15,.17)';x.lineWidth=.65;x.beginPath();x.moveTo(0,y);x.lineTo(256,y);x.stroke();let seam=(y*3.71)%240;x.fillStyle='rgba(62,36,16,.16)';x.fillRect(seam,y,1,32);}for(let i=0;i<340;i++){const y=rnd()*256;x.strokeStyle=`rgba(50,27,10,${rnd()*.13})`;x.lineWidth=.25+rnd()*.5;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(65,y-3*rnd(),190,y+3*rnd(),256,y);x.stroke();}}
 else if(m.kind==='stone'){for(let i=0;i<1800;i++){x.fillStyle=`rgba(${rnd()>.5?'255,255,245':'55,60,55'},${rnd()*(id==='terrazzo'?.38:.11)})`;let r=id==='terrazzo'?rnd()*4.5:rnd()*1.2;x.beginPath();x.arc(rnd()*256,rnd()*256,r,0,Math.PI*2);x.fill();}if(id==='marble'||id==='travertine'){for(let i=0;i<12;i++){x.strokeStyle=`rgba(96,94,81,${rnd()*.2})`;x.lineWidth=.25+rnd()*1.1;let y=rnd()*256;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(100,y-120,120,y+80,256,y-60);x.stroke();}}if(id.startsWith('tile')){x.strokeStyle='#7d827c';x.lineWidth=1.8;x.strokeRect(0,0,256,256);}}
 else if(m.kind==='fabric'){for(let i=0;i<256;i+=2){x.strokeStyle=`rgba(32,35,24,${.03+rnd()*.045})`;x.beginPath();x.moveTo(i,0);x.lineTo(i,256);x.stroke();x.strokeStyle='rgba(255,250,220,.07)';x.beginPath();x.moveTo(0,i);x.lineTo(256,i);x.stroke();}}
 else{for(let i=0;i<2500;i++){x.fillStyle=`rgba(${rnd()>.5?'255,255,245':'50,50,40'},.025)`;x.fillRect(rnd()*256,rnd()*256,1.5,1.5);}}
 const url=c.toDataURL();swatches.set(id,url);const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;textures.set(id,tex);return url;
}
export function material(id:string,color?:string,low=false){const m=matById(id);if(!low&&!textures.has(id))swatch(id);return new T.MeshStandardMaterial({color:color&&color!==m.color?color:low?m.color:'#ffffff',map:low?null:textures.get(id),roughness:m.rough,metalness:0,bumpMap:low?null:textures.get(id),bumpScale:m.kind==='fabric'?.004:m.kind==='wood'?.006:.001});}
const metal=(c='#64665f')=>new T.MeshStandardMaterial({color:c,roughness:.28,metalness:.7});
const plain=(c:string,roughness=.7)=>new T.MeshStandardMaterial({color:c,roughness});
function mesh(geo:T.BufferGeometry,m:T.Material){const o=new T.Mesh(geo,m);o.castShadow=true;o.receiveShadow=true;return o;}
export function box(w:number,h:number,d:number,m:T.Material,x=0,y=0,z=0,rounded=false,low=false){const o=mesh(rounded&&!low?new RoundedBoxGeometry(w,h,d,2,Math.min(.055,w/5,h/5,d/5)):new T.BoxGeometry(w,h,d,low?Math.max(1,Math.ceil(w/.4)):1,low?Math.max(1,Math.ceil(h/.7)):1,low?Math.max(1,Math.ceil(d/.4)):1),m);o.position.set(x,y+h/2,z);return o;}
function cyl(rt:number,rb:number,h:number,m:T.Material,x=0,y=0,z=0,seg=16){const o=mesh(new T.CylinderGeometry(rt,rb,h,seg),m);o.position.set(x,y+h/2,z);return o;}
function sphere(w:number,h:number,d:number,m:T.Material,x=0,y=0,z=0,low=false){const o=mesh(new T.SphereGeometry(1,low?8:20,low?6:12),m);o.scale.set(w,h,d);o.position.set(x,y,z);return o;}
function rod(a:number[],b:number[],r:number,m:T.Material){const p=new T.Vector3(...a),q=new T.Vector3(...b),o=cyl(r,r,p.distanceTo(q),m);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.sub(p).normalize());return o;}
export function furniture(f:Item,low=false){const g=new T.Group(),{w,d,h}=f,mt=material(f.material,f.color,low),wood=material('walnut',undefined,low),light=material('ivory',undefined,low),white=plain('#edeae1'),dark=plain('#272e2d'),steel=metal();const add=(o:T.Object3D)=>{g.add(o);return o;};const b=(W:number,H:number,D:number,m:T.Material,X=0,Y=0,Z=0,r=true)=>add(box(W,H,D,m,X,Y,Z,r,low));
 const legs=(H:number,inset=.08)=>{for(const xx of [-1,1])for(const zz of [-1,1])b(.045,H,.045,wood,xx*(w/2-inset),0,zz*(d/2-inset),false);};
 switch(f.type){
 case 'sofa':case 'sectional':case 'armchair':{
 const seatH=h*.46,arm=Math.min(.15,w*.13);legs(.14);b(w,h*.23,d,mt,0,.12);b(w,h*.63,.17,mt,0,h*.35,-d/2+.085);b(arm,h*.6,d,mt,-w/2+arm/2,.18);b(arm,h*.6,d,mt,w/2-arm/2,.18);const n=w>2?3:w>1.3?2:1;for(let j=0;j<n;j++){const xx=-(w-arm*2)/2+(w-arm*2)/n*(j+.5);b((w-arm*2)/n-.025,h*.18,d-.23,mt,xx,seatH,-.005);const c=b((w-arm*2)/n-.035,h*.33,.13,mt,xx,h*.56,-d/2+.20);c.rotation.x=-.15;}for(const s of [-1,1]){const cushion=b(Math.min(.32,w*.25),.3,.13,material(s<0?'linen':'clay',undefined,low),s*(w/2-.26),seatH+.12,-d*.11);cushion.rotation.z=s*.19;cushion.rotation.x=-.22;}
 if(f.type==='sectional')b(w*.32,h*.23,d*.56,mt,w*.29,h*.34,d*.26);break;}
 case 'bed':{legs(.14);b(w,.19,d,wood,0,.1);b(w+.06,h,.1,mt,0,0,-d/2+.03);b(w-.03,.2,d-.08,light,0,.29);b(w+.01,.075,d*.65,mt,0,.49,d*.16);for(let j=0;j<(w>1.4?2:1);j++)b(w/(w>1.4?2:1)-.12,.13,.43,light,(w>1.4?j===0?-w*.25:w*.25:0),.50,-d*.34);b(w,.025,.32,material('clay',undefined,low),0,.568,d*.35);break;}
 case 'crib':{legs(.3);b(w,.13,d,mt,0,.28);b(w-.08,.06,d-.08,light,0,.41);for(const z of [-d/2,d/2]){b(w,.05,.035,mt,0,h-.06,z);for(let j=0;j<10;j++)b(.025,h-.36,.025,mt,-w/2+j*w/9,.36,z);}b(.05,h,d,mt,-w/2,0);b(.05,h,d,mt,w/2,0);break;}
 case 'rug':{b(w,h,d,mt,0,.02);break;}
 case 'table':case 'desk':case 'round':case 'stool':{if(f.type==='round'){add(cyl(w/2,w/2,.06,mt,0,h-.06,0,low?20:48));add(cyl(.07,.13,h-.07,wood));add(cyl(w*.22,w*.28,.04,wood));}else{legs(h-.07);b(w,.065,d,mt,0,h-.065);if(f.type==='desk'){b(.32,h*.60,d*.84,mt,-w/2+.21,.12);b(.32,.012,d*.85,dark,-w/2+.21,h*.46);b(w*.35,.012,d*.29,material('blue',undefined,low),w*.16,h,-d*.1);}}
 if(f.type==='table'&&h<.5){add(cyl(.15,.15,.016,plain('#c5b7a0'),-.22,h,-.03));add(cyl(.048,.055,.16,plain('#8c9985'),.25,h,-.08));b(.22,.02,.16,white,.07,h,.10);}
 break;}
 case 'chair':case 'officechair':{if(f.type==='officechair'){add(cyl(.035,.045,.42,steel));for(let a=0;a<5;a++){const t=a*Math.PI*.4;add(rod([0,.12,0],[Math.cos(t)*w*.45,.08,Math.sin(t)*d*.45],.025,steel));}}else legs(.43,.065);b(w,.07,d,mt,0,.43);const back=b(w,.32,.075,mt,0,.51,-d/2+.035);back.rotation.x=-.10;if(f.type==='officechair'){for(const x of [-w*.44,w*.44]){b(.04,.18,.04,steel,x,.49);b(.07,.04,d*.7,dark,x,.66);}}break;}
 case 'beanbag':{add(sphere(w*.5,h*.4,d*.5,mt,0,h*.40,0,low));add(sphere(w*.43,h*.4,d*.28,mt,0,h*.62,-d*.19,low));break;}
 case 'wardrobe':case 'cabinet':case 'kitchen':case 'island':case 'vanity':case 'basin':{
 legs(.08);const hh=f.type==='vanity'?.72:h;b(w,hh-.08,d,mt,0,.08);const n=Math.max(1,Math.round(w/.55));for(let j=0;j<n;j++){const xx=-w/2+w/n*(j+.5);b(w/n-.018,hh-.15,.025,mt,xx,.10,d/2+.012,false);b(.012,.18,.035,steel,xx+w/n*.28,hh*.48,d/2+.035,false);}
 if(['kitchen','island','basin'].includes(f.type))b(w+.025,.045,d+.025,material('marble',undefined,low),0,hh);
 if(f.type==='basin'){const n=w>1?2:1;for(let j=0;j<n;j++){let x=n===1?0:j===0?-w*.25:w*.25;b(w/n*.7,.025,d*.62,white,x,hh+.055);b(w/n*.47,.028,d*.38,plain('#b8c5c1'),x,hh+.07);add(rod([x,hh+.07,-d*.32],[x,hh+.28,-d*.32],.012,steel));add(rod([x,hh+.28,-d*.32],[x,hh+.28,-d*.12],.012,steel));}}
 if(f.type==='vanity'){add(sphere(w*.3,.36,.025,metal('#b0c3bb'),0,1.08,-d/2+.06,low));}break;}
 case 'shelf':{b(w,.045,d,mt,0,0);b(w,h,.025,mt,0,0,-d/2);b(.035,h,d,mt,-w/2,0);b(.035,h,d,mt,w/2,0);for(let r=1;r<=4;r++){b(w,.035,d,mt,0,h*r/4-.035);for(let j=0;j<5;j++){b(.065+(j%2)*.025,h*.16,d*.65,plain(['#a87b5a','#879387','#e0d2ba','#8e9fac','#495952'][j]),-w*.37+j*w*.17,h*(r-1)/4+.04,0,false);}}break;}
 case 'lamp':{add(cyl(w*.29,w*.32,.04,metal('#716350')));add(cyl(.016,.019,h*.83,metal('#9a8156')));const shade=new T.MeshStandardMaterial({color:'#ece1bd',emissive:'#f6c47e',emissiveIntensity:.35,side:T.DoubleSide,roughness:.8});add(cyl(w*.32,w*.5,h*.19,shade,0,h*.80,0,low?12:32));break;}
 case 'plant':{const pot=plain('#b7b4a6');add(cyl(w*.26,w*.2,h*.28,pot));add(cyl(w*.24,w*.24,.012,plain('#484433'),0,h*.28));for(let j=0;j<9;j++){const a=j*2.4,yy=h*.35+j*h*.065,rr=w*.42;add(rod([0,h*.15,0],[Math.cos(a)*rr,yy,Math.sin(a)*rr],.01,plain('#536047')));const leaf=add(sphere(w*.25,h*.085,w*.065,plain(j%2?'#6b805d':'#435d48'),Math.cos(a)*rr*.8,yy,Math.sin(a)*rr*.8,low));leaf.rotation.set(-.3,a,.35);}break;}
 case 'tv':{b(w,h,d,dark,0,.52);b(w-.04,h-.045,.008,plain('#324844',.15),0,.54,d/2+.002);for(const x of [-w*.32,w*.32])b(.18,.025,.22,dark,x,.495);break;}
 case 'fridge':{b(w,h,d,mt);b(w-.04,.01,.018,dark,0,h*.33,d/2+.02);for(let j=0;j<(w>.8?2:1);j++)b(.025,.42,.045,steel,(j===0?-1:1)*w*.34,h*.50,d/2+.03);if(w>.8)b(.01,h-.05,.01,dark,0,.03,d/2+.02);break;}
 case 'washer':{b(w,h,d,mt);const r=w*.32;const ring=new T.Mesh(new T.TorusGeometry(r,.025,low?6:12,low?16:32),steel);ring.position.set(0,h*.47,d/2+.02);add(ring);const glass=cyl(r-.02,r-.02,.024,plain('#3c4c4b',.08),0,0,0,low?16:40);glass.rotation.x=Math.PI/2;glass.position.set(0,h*.47,d/2+.025);add(glass);b(w-.05,.075,.016,dark,0,h*.83,d/2+.02);break;}
 case 'toilet':{b(w,.43,d*.28,white,0,.28,-d*.34);add(sphere(w*.48,.20,d*.39,white,0,.30,d*.12,low));add(sphere(w*.34,.023,d*.24,plain('#aebcb6'),0,.48,d*.12,low));add(cyl(w*.27,w*.33,.29,white,0,0,d*.10));break;}
 case 'bath':{b(w,h,d,white);b(w-.13,.035,d-.13,plain('#c4dad6'),0,h+.002);b(w-.25,.045,d-.25,plain('#dce6df'),0,h+.005);break;}
 case 'shower':{b(w,.04,d,material('marble',undefined,low));const glass=new T.MeshStandardMaterial({color:'#b8d9d4',roughness:.08,transparent:true,opacity:low?.14:.2,depthWrite:false});b(.02,h,d,glass,-w/2,0);b(w,h,.02,glass,0,0,d/2);for(const x of [-w/2,w/2])b(.025,h,.025,steel,x,0,d/2);b(w,.025,.025,steel,0,h,d/2);add(rod([0,.65,-d/2],[0,1.85,-d/2],.013,steel));add(cyl(.09,.09,.023,steel,0,1.85,-d*.25));break;}
 case 'sink':{b(w,.035,d,steel,0,.87);b(w*.68,.018,d*.62,plain('#84938c'),0,.91);add(rod([0,.91,-d*.35],[0,1.18,-d*.35],.013,steel));add(rod([0,1.18,-d*.35],[0,1.18,0],.013,steel));break;}
 case 'stove':{b(w,.025,d,dark,0,.89);for(const x of [-w*.27,w*.27]){add(cyl(.105,.105,.013,steel,x,.919));add(cyl(.068,.068,.018,dark,x,.93));}break;}
 case 'acwall':{b(w,h,d,mt,0,2.15);b(w*.83,.027,d*.8,dark,0,2.17,d*.17);break;}
 case 'acfloor':case 'purifier':{b(w,h,d,mt);for(let j=0;j<9;j++)b(w*.8,.013,.008,steel,0,h*.56+j*h*.03,d/2+.006,false);break;}
 case 'heater':{const o=cyl(h/2,h/2,w,white);o.rotation.z=Math.PI/2;o.position.set(0,1.9,0);add(o);break;}
 case 'dishwasher':case 'oven':{b(w,h,d,mt);const hh=f.type==='oven'?.5:h*.7;b(w-.06,hh,.016,dark,0,h*.28,d/2+.015);b(w*.6,.025,.04,steel,0,h*.28+hh-.08,d/2+.04);break;}
 case 'piano':{b(w,h,d*.6,mt,0,0,-d*.2);b(w,.06,d*.5,mt,0,h*.55,d*.2);for(let j=0;j<28;j++)b(w*.9/28-.002,.018,d*.38,white,-w*.45+j*w*.9/28,h*.60,d*.27,false);break;}
 case 'treadmill':{b(w,.12,d,dark);b(w*.75,.02,d*.8,plain('#404743'),0,.13);for(const x of [-w*.42,w*.42])add(rod([x,.1,-d*.4],[x,h,-d*.27],.035,steel));const con=b(w,.12,.27,dark,0,h,-d*.27);con.rotation.x=.25;break;}
 default:b(w,h,d,mt);
 }
 g.position.set(f.x,0,f.z);g.rotation.y=-f.rotation*Math.PI/180;g.userData={kind:'item',id:f.id};g.traverse(o=>{o.userData={kind:'item',id:f.id};if(o instanceof T.Mesh&&!Array.isArray(o.material)&&o.material.transparent&&o.material.opacity<.4)o.castShadow=false;});return g;
}
function wallHeight(w:Wall,s:Design['settings']){if(s.wallMode==='low')return .28;if(s.wallMode==='full')return s.wallHeight;return w.outside?(w.id==='north'||w.id==='west'?s.wallHeight:.23):.85;}
export function architecture(d:Design,low=false,walk=false){const g=new T.Group(),s={...d.settings,wallMode:walk?'full' as const:d.settings.wallMode};const foundation=box(10.85,.3,8.45,plain('#d9d5c7'),0,-.31,0,true,low);g.add(foundation);
 for(const r of d.rooms){const floor=box(r.w,.032,r.d,material(r.material,undefined,low),r.x+r.w/2,0,r.z+r.d/2,false,low);floor.userData={kind:'room',id:r.id};g.add(floor);
 if(low&&matById(r.material).kind==='wood'){const lineMat=plain('#70593e');lineMat.transparent=true;lineMat.opacity=.10;for(let z=r.z+.22;z<r.z+r.d;z+=.22)g.add(box(r.w,.001,.005,lineMat,r.x+r.w/2,.034,z));}
 if(walk){const ceiling=box(r.w,.06,r.d,plain('#dfded4'),r.x+r.w/2,s.wallHeight,r.z+r.d/2);g.add(ceiling);}
 }
 for(const w of d.walls){if(w.removed)continue;const height=wallHeight(w,s),len=Math.hypot(w.x2-w.x1,w.z2-w.z1),dx=(w.x2-w.x1)/len,dz=(w.z2-w.z1)/len,mt=material(d.settings.bearing&&w.bearing?'ink':w.material,undefined,low);let cursor=0;
 const section=(from:number,to:number,bottom:number,top:number)=>{if(top<=bottom||to<=from)return;const obj=box(to-from,top-bottom,.16,mt,w.x1+dx*(from+to)/2,bottom,w.z1+dz*(from+to)/2,false,low);obj.rotation.y=-Math.atan2(dz,dx);obj.userData={kind:'wall',id:w.id};g.add(obj);if(bottom===0){const skirt=box(to-from,.065,.18,plain('#d1c9b6'),obj.position.x,.03,obj.position.z);skirt.rotation.copy(obj.rotation);skirt.userData={kind:'wall',id:w.id};g.add(skirt);}};
 for(const opening of [...w.openings||[]].sort((a,b)=>a.from-b.from)){section(cursor,opening.from,0,height);const sill=opening.type==='window'?.85:0,top=opening.type==='window'?2.5:2.1;section(opening.from,opening.from+opening.width,0,Math.min(sill,height));section(opening.from,opening.from+opening.width,top,height);
 if(opening.type==='window'&&height>sill){const gh=Math.min(top,height)-sill,frame=metal('#68736c'),xx=w.x1+dx*(opening.from+opening.width/2),zz=w.z1+dz*(opening.from+opening.width/2);const frameGroup=new T.Group();frameGroup.position.set(xx,0,zz);frameGroup.rotation.y=-Math.atan2(dz,dx);const glass=new T.MeshStandardMaterial({color:'#b1d5d3',transparent:true,opacity:low?.10:.16,roughness:.07,metalness:.1,depthWrite:false});frameGroup.add(box(opening.width,gh,.016,glass,0,sill));for(let j=0;j<=2;j++)frameGroup.add(box(.035,gh,.075,frame,-opening.width/2+j*opening.width/2,sill));for(const yy of [sill,Math.min(top,height)-.035])frameGroup.add(box(opening.width,.035,.075,frame,0,yy));frameGroup.traverse(o=>{o.userData={kind:'wall',id:w.id};if(o instanceof T.Mesh&&!Array.isArray(o.material)&&o.material.transparent)o.castShadow=false;});g.add(frameGroup);}
 cursor=opening.from+opening.width;}
 section(cursor,len,0,height);
 }
 return g;
}
export function disposeGroup(g:T.Group){g.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});g.clear();}
