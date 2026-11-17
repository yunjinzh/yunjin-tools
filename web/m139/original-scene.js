/* Image-based reconstruction. All dimensions are working estimates, not survey data. */
(function(){
'use strict';
if(window.HAS_GL===false)return;
const T=THREE, scene=new T.Scene(); scene.background=new T.Color('#c5cbd0');
const renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
document.getElementById('viewport').appendChild(renderer.domElement);
const camera=new T.PerspectiveCamera(74,innerWidth/innerHeight,.08,250);camera.rotation.order='YXZ';
const groups={};['floor','structure','roof','walls','facilities','exterior'].forEach(n=>{groups[n]=new T.Group();groups[n].name=n;scene.add(groups[n]);});
const colliders=[];const V=(x,y,z)=>new T.Vector3(x,y,z);
let seed=1729;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function canvasTex(w,h,paint,repeat){let c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);let t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);}return t;}
function concrete(base,rep){return canvasTex(512,512,(c,w,h)=>{c.fillStyle=base;c.fillRect(0,0,w,h);for(let i=0;i<60000;i++){let v=rand()>.5?255:20;c.fillStyle=`rgba(${v},${v},${v},${rand()*.055})`;c.fillRect(rand()*w,rand()*h,1+rand()*3,1+rand()*3);}for(let i=0;i<110;i++){let x=rand()*w,y=rand()*h,r=rand()*80+8;let g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(47,40,31,.025)');g.addColorStop(1,'rgba(47,40,31,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}},rep);}
const floorTex=canvasTex(1024,1024,(c,w,h)=>{c.fillStyle='#b3ad9f';c.fillRect(0,0,w,h);for(let i=0;i<180000;i++){let v=rand()>.55?245:48;c.fillStyle=`rgba(${v},${v},${v},${rand()*.045})`;c.fillRect(rand()*w,rand()*h,rand()*3+.5,rand()*3+.5);}for(let i=0;i<190;i++){let x=rand()*w,y=rand()*h,r=20+rand()*150;let g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(80,67,45,.018)');g.addColorStop(1,'rgba(80,67,45,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}for(let i=0;i<12;i++){let x=rand()*w,y=rand()*h;c.beginPath();c.moveTo(x,y);for(let j=0;j<14;j++){x+=rand()*18-8;y+=rand()*15-5;c.lineTo(x,y);}c.strokeStyle='rgba(60,55,43,.10)';c.lineWidth=.8;c.stroke();}},[9,10.5]);
const roofTex=canvasTex(256,256,(c,w,h)=>{c.fillStyle='#a3a39c';c.fillRect(0,0,w,h);for(let i=0;i<w;i+=32){c.fillStyle='#878b86';c.fillRect(i,0,2,h);c.fillStyle='#bebeb4';c.fillRect(i+2,0,2,h);c.fillStyle='#969b94';c.fillRect(i+4,0,2,h);}for(let i=0;i<10000;i++){c.fillStyle=`rgba(40,45,39,${rand()*.04})`;c.fillRect(rand()*w,rand()*h,1,1);}},[3,1]);
function mat(color,opt={}){return new T.MeshStandardMaterial({color,roughness:.85,...opt});}
const m={floor:mat('#f0eee4',{map:floorTex,bumpMap:floorTex,bumpScale:.018,roughness:.88}),column:mat('#d3d0c4',{map:concrete('#bab8ac',[1,3]),bumpScale:.04}),beam:mat('#76786c',{metalness:.32,roughness:.7}),steel:mat('#293a3f',{metalness:.58,roughness:.58}),gold:mat('#a77937',{metalness:.35,roughness:.72}),wall:mat('#e4e2d5',{map:concrete('#dddcd3',[2,2])}),roof:mat('#cecec3',{map:roofTex,bumpMap:roofTex,bumpScale:.025,side:T.DoubleSide}),sky:mat('#f8f5d8',{emissive:'#e5e7d6',emissiveIntensity:1.05,roughness:.36,side:T.DoubleSide}),frame:mat('#28312d',{metalness:.5,roughness:.65}),white:mat('#e4e5da',{roughness:.55}),silver:mat('#b4b9b0',{metalness:.68,roughness:.4}),black:mat('#242724'),orange:mat('#bd6d37',{metalness:.3}),blue:mat('#496c7a',{metalness:.25}),red:mat('#962f23',{roughness:.5}),green:mat('#76a14e',{emissive:'#4b8c2c',emissiveIntensity:.7}),glass:mat('#c5d8d4',{metalness:.05,roughness:.3,transparent:true,opacity:.50,side:T.DoubleSide}),darkGlass:mat('#263e42',{metalness:.15,roughness:.18}),yellow:mat('#d1a848')};
let active=groups.structure;
const boxGeo=new T.BoxGeometry(1,1,1),cylGeo=new T.CylinderGeometry(1,1,1,16);
function mesh(geo,material,x,y,z,parent=active){let o=new T.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(w,h,d,x,y,z,material=m.column,parent=active){let o=mesh(boxGeo,material,x,y,z,parent);o.scale.set(w,h,d);return o;}
function cyl(r,h,x,y,z,material=m.silver,parent=active){let o=mesh(cylGeo,material,x,y,z,parent);o.scale.set(r,h,r);return o;}
function rod(a,b,r,material=m.steel,parent=active){let av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av),o=cyl(r,d.length(),...(av.clone().add(bv).multiplyScalar(.5).toArray()),material,parent);o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return o;}
function beam(a,b,width,depth,material=m.steel,parent=active){const av=V(...a),bv=V(...b),d=bv.clone().sub(av),len=d.length();let g=new T.Group();g.position.copy(av.clone().add(bv).multiplyScalar(.5));let axis=d.clone().normalize(),up=V(0,1,0),depthAxis=up.clone().addScaledVector(axis,-up.dot(axis)).normalize();if(depthAxis.length()<.1)depthAxis=V(0,0,1);let widthAxis=axis.clone().cross(depthAxis).normalize();g.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(widthAxis,axis,depthAxis));parent.add(g);box(width,len,depth*.13,0,0,depth*.435,material,g);box(width,len,depth*.13,0,0,-depth*.435,material,g);box(width*.12,len,depth*.87,0,0,0,material,g);return g;}
function blocker(x,z,w,d){colliders.push({minX:x-w/2-.28,maxX:x+w/2+.28,minZ:z-d/2-.28,maxZ:z+d/2+.28});}
const shadeTex=canvasTex(128,128,(c)=>{let g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(17,19,14,.42)');g.addColorStop(.35,'rgba(17,19,14,.23)');g.addColorStop(1,'rgba(17,19,14,0)');c.fillStyle=g;c.fillRect(0,0,128,128);});
const shadeMat=new T.MeshBasicMaterial({map:shadeTex,transparent:true,depthWrite:false});
function shadow(x,z,w,d,parent=groups.floor){let o=mesh(new T.PlaneGeometry(w,d),shadeMat,x,.014,z,parent);o.rotation.x=-Math.PI/2;o.castShadow=false;return o;}
// Concrete slab, construction joints, and two longitudinal drainage trenches.
active=groups.floor;const floor=box(36.5,.24,43,-0,-.13,0,m.floor);floor.name='walkable-floor';
const jointMat=mat('#858275');for(let x=-18;x<=18;x+=4.5)box(.012,.006,42,x,.003,0,jointMat);for(let z=-21;z<=21;z+=7)box(36,.006,.015,0,.004,z,jointMat);
for(let x of [-9.8,9.8]){box(.5,.012,42,x,.006,0,mat('#8e8e7d'));for(let z=-20.8;z<21;z+=.22){for(let dx of [-.14,.06])box(.12,.015,.055,x+dx,.015,z,m.black);}}
// Columns and primary frame: repeated rhythm inferred from image perspective.
active=groups.structure;const zs=[-21,-14,-7,0,7,14,21],xs=[-18,-9,9,18];
for(let x of xs)for(let z of zs){let h=(Math.abs(x)===18?11.1:11.8);box(.58,h,.66,x,h/2,z,m.column);box(.78,.13,.86,x,.065,z,m.beam);for(let dx of [-.31,.31])for(let dz of [-.34,.34])cyl(.035,.08,x+dx,.17,z+dz,m.steel);box(.7,.22,.82,x,7.63,z,m.column);let dir=Math.abs(x)===18?-Math.sign(x):Math.sign(x);box(1.02,.32,.78,x+dir*.32,7.35,z,m.column);rod([x,6.65,z],[x+dir*.62,7.24,z],.11,m.column);shadow(x,z,2.5,2.8);blocker(x,z,.7,.78);
 if(Math.abs(x)===9&&z>=0&&z<=14){box(.12,.55,.1,x+.35,1.2,z+.33,m.red);box(.10,.06,.02,x+.36,1.62,z+.39,m.white);cyl(.11,.58,x+.5,.4,z+.13,m.red);rod([x+.5,.68,z+.13],[x+.5,.83,z+.13],.025,m.black);box(.23,.1,.03,x,1.05,z+.35,m.green);}}
function roofY(x){return 12.85-Math.abs(x)*.095;}
for(let z of zs){for(let seg of [[-18,-9],[-9,0],[0,9],[9,18]])beam([seg[0],roofY(seg[0])-.27,z],[seg[1],roofY(seg[1])-.27,z],.28,.62,m.beam);}
// Long dark runway beams, flanges, stiffeners, and rails.
for(let x of [-17.6,-9.45,-8.55,8.55,9.45,17.6]){beam([x,8.0,-21],[x,8.0,21],.44,.68,m.steel);box(.08,.12,42,x,8.42,0,m.silver);for(let z=-21;z<=21;z+=1.75)box(.04,.60,.43,x,8,z,m.steel);}
// Wall bracing and interior X braces; no invented overhead travelling crane.
for(let x of [-17.72,17.72])for(let z of [-10.5,10.5]){rod([x,.35,z-3.3],[x,7.48,z+3.3],.065,m.beam);rod([x,7.48,z-3.3],[x,.35,z+3.3],.065,m.beam);box(.12,.32,.32,x,3.9,z,m.silver);}
for(let x of [-9,9]){let z=-3.5;rod([x,.2,z-3.3],[x,7.6,z+3.3],.055,m.steel);rod([x,7.6,z-3.3],[x,.2,z+3.3],.055,m.steel);}
// Access ladders to runway level.
for(let [x,z,sign] of [[-8.65,10.5,1],[8.65,12.3,-1],[-8.65,-16,1],[8.65,-15,-1]]){let a=[x,0,z+1.6],b=[x,8.25,z-1.2];for(let dx of [-.25,.25])rod([a[0]+dx,a[1],a[2]],[b[0]+dx,b[1],b[2]],.034,m.steel);for(let i=0;i<27;i++){let t=i/26;rod([x-.25,t*8.25,a[2]+(b[2]-a[2])*t],[x+.25,t*8.25,a[2]+(b[2]-a[2])*t],.024,m.steel);}blocker(x,z+.5,.6,1.5);}
// Roof panels split around genuine skylight bands, with longitudinal ochre purlins.
active=groups.roof;
function roofPanel(x1,x2,z1,z2,material){let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([x1,roofY(x1),z1,x2,roofY(x2),z1,x2,roofY(x2),z2,x1,roofY(x1),z2],3));geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,(x2-x1)/3,0,(x2-x1)/3,(z2-z1)/7,0,(z2-z1)/7],2));geo.setIndex([0,2,1,0,3,2]);geo.computeVertexNormals();let o=mesh(geo,material,0,0,0);if(material===m.sky)o.castShadow=false;return o;}
const strips=[[-18,-15.3,false],[-15.3,-13.1,true],[-13.1,-7.6,false],[-7.6,-5.5,true],[-5.5,0,false],[0,5.5,false],[5.5,7.6,true],[7.6,13.1,false],[13.1,15.3,true],[15.3,18,false]];
for(let k=0;k<6;k++){let z=zs[k];for(let [x1,x2,sky] of strips){if(sky){roofPanel(x1,x2,z,z+.7,m.roof);roofPanel(x1,x2,z+.7,z+6.3,m.sky);roofPanel(x1,x2,z+6.3,z+7,m.roof);for(let zz=z+.7;zz<=z+6.3;zz+=.52)rod([x1,roofY(x1)-.025,zz],[x2,roofY(x2)-.025,zz],.023,m.white);for(let xx=x1;xx<=x2+.01;xx+=.35)rod([xx,roofY(xx)-.03,z+.7],[xx,roofY(xx)-.03,z+6.3],.018,m.beam);}else roofPanel(x1,x2,z,z+7,m.roof);}}
for(let x=-17.5;x<=17.5;x+=1.4){box(.09,.17,42,x,roofY(x)-.15,0,m.gold);}
for(let k of [1,3,5])for(let [x1,x2] of [[-17.6,-9.4],[-8.6,8.6],[9.4,17.6]]){let z=zs[k-1];rod([x1,roofY(x1)-.35,z+.1],[x2,roofY(x2)-.35,z+6.9],.035,m.gold);rod([x1,roofY(x1)-.35,z+6.9],[x2,roofY(x2)-.35,z+.1],.035,m.gold);}
// Pendant industrial luminaires.
for(let x of [-14,-6,-2,2,6,14])for(let z of [-17.5,-10.5,-3.5,3.5,10.5,17.5]){let h=roofY(x)-1.1;rod([x,h+.12,z],[x,roofY(x)-.1,z],.012,m.black);let lamp=mesh(new T.CylinderGeometry(.06,.22,.17,20),m.white,x,h,z);let lens=cyl(.205,.025,x,h-.09,z,m.sky);lens.castShadow=false;}
// Outer walls assembled around real window openings, no window textures pasted onto solid walls.
active=groups.walls;
const greenery=canvasTex(512,512,(c,w,h)=>{let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#d9e8e9');g.addColorStop(.5,'#bbd5d1');g.addColorStop(1,'#8faa92');c.fillStyle=g;c.fillRect(0,0,w,h);for(let i=0;i<1500;i++){let x=rand()*w,y=180+rand()*380,r=3+rand()*28;c.fillStyle=`rgba(${80+rand()*50},${116+rand()*45},${90+rand()*40},${.05+rand()*.15})`;c.beginPath();c.ellipse(x,y,r,r*1.5,0,0,7);c.fill();}for(let i=0;i<15;i++){let x=rand()*w;c.strokeStyle='#849c8c55';c.lineWidth=2+rand()*5;c.beginPath();c.moveTo(x,h);c.lineTo(x+rand()*45-20,180+rand()*120);c.stroke();}},null);
const viewMat=new T.MeshBasicMaterial({map:greenery,color:'#c9d9cd',side:T.DoubleSide});
function windowUnit(width,height,x,y,z,parent,upper=false){const g=new T.Group();g.position.set(x,y,z);parent.add(g);let p=mesh(new T.PlaneGeometry(width,height),viewMat,0,0,-.09,g);p.castShadow=false;let glass=box(width,height,.022,0,0,0,m.glass,g);glass.castShadow=false;for(let dx of [-width/2,width/2])box(.055,height+.05,.08,dx,0,.025,m.frame,g);for(let dy of [-height/2,height/2])box(width,.055,.08,0,dy,.025,m.frame,g);if(!upper){box(width,.055,.08,0,-height*.12,.025,m.frame,g);box(width,.065,.08,0,-height*.31,.025,m.frame,g);box(.043,height*.19,.08,0,-height*.405,.025,m.frame,g);box(width,height*.23,.07,0,height*.385,.025,m.black,g);for(let yy=height*.28;yy<height*.5;yy+=.09)box(width,.014,.09,0,yy,.03,m.frame,g);}else box(.04,height,.08,0,0,.025,m.frame,g);}
function wall(length,position,rotation,doors=[]){const g=new T.Group();g.position.set(...position);g.rotation.y=rotation;active.add(g);let cells=Math.round(length/2.25),step=length/cells;
 box(length,.35,.24,0,.175,0,m.wall,g);box(length,1.6,.24,0,6.55,0,m.wall,g);box(length,1.12,.24,0,10.61,0,m.wall,g);
 for(let i=0;i<cells;i++){let x=-length/2+step*(i+.5),isDoor=doors.some(d=>Math.abs(x-d)<2.0);if(isDoor){box(step,5.6,.2,x,3.1,0,m.wall,g);}else{box(step-1.15,5.4,.24,x-step/2+(step-1.15)/2,3.05,0,m.wall,g);windowUnit(1.15,5.4,x+(step-1.15)/2,3.05,.02,g);}box(step-1.1,2.7,.24,x-step/2+(step-1.1)/2,8.7,0,m.wall,g);windowUnit(1.1,2.7,x+(step-1.1)/2,8.7,.02,g,true);}
 // Elevated maintenance gallery and silver safety railing.
 box(length,.18,.85,0,7.55,.47,m.beam,g);box(length,.14,.1,0,7.45,.9,m.steel,g);for(let x=-length/2;x<=length/2;x+=1.25)box(.035,1.0,.035,x,8.12,.9,m.silver,g);for(let y of [7.8,8.1,8.4,8.62])box(length,.025,.025,0,y,.9,m.silver,g);
 for(let x of doors){box(3.7,4.0,.15,x,2.0,.18,m.frame,g);for(let y=.06;y<4;y+=.09)box(3.55,.025,.06,x,y,.28,m.beam,g);box(4,.2,.4,x,4.13,.13,m.steel,g);}
 return g;}
wall(42,[-18.12,0,0],Math.PI/2,[13]);wall(42,[18.12,0,0],-Math.PI/2,[0]);wall(36,[0,0,-21.12],0,[]);wall(36,[0,0,21.12],Math.PI,[0]);
// End-wall gables close the roof envelope above the upper window band.
for(let z of [-21.18,20.98]){let shape=new T.Shape();shape.moveTo(-18,11.1);shape.lineTo(-18,roofY(-18));shape.lineTo(0,roofY(0));shape.lineTo(18,roofY(18));shape.lineTo(18,11.1);shape.closePath();mesh(new T.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:false}),m.wall,0,0,z);}
// Low-level pipes and cable trays along the outer walls.
for(let x of [-17.8,17.8]){rod([x,6.9,-21],[x,6.9,21],.035,m.red);box(.16,.14,42,x,7.16,0,m.silver);}
// Facilities: visible external shapes reconstructed, hidden mechanical details omitted.
active=groups.facilities;
function tabletop(x,z,w=2,d=.85,h=.8){box(w,.07,d,x,h,z,m.silver);for(let dx of [-w/2+.08,w/2-.08])for(let dz of [-d/2+.08,d/2-.08])box(.045,h,.045,x+dx,h/2,z+dz,m.silver);box(w-.1,.04,.04,x,h*.3,z,m.silver);shadow(x,z,w+1,d+1);blocker(x,z,w,d);}
function cabinet(x,z,w=1,h=1.9,d=.6,color=m.white){box(w,h,d,x,h/2,z,color);box(w-.08,h-.1,.025,x,h/2,z+d/2+.01,m.silver);box(.04,.32,.04,x+w*.32,h*.57,z+d/2+.05,m.frame);box(.28,.17,.03,x-w*.18,h*.72,z+d/2+.03,m.darkGlass);for(let i=0;i<5;i++)box(w*.5,.015,.03,x,h*.22+i*.055,z+d/2+.03,m.beam);for(let dx of [-w/2+.12,w/2-.12])box(.12,.08,d*.8,x+dx,.04,z,m.frame);shadow(x,z,w+.8,d+.8);blocker(x,z,w,d);}
function labelTexture(text,bg='#243d65',fg='#eceae0'){return canvasTex(1024,256,(c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.fillStyle='#e5e3d7';c.fillRect(0,0,w,64);c.fillStyle='#62685e';c.font='26px "Microsoft YaHei",sans-serif';c.textAlign='center';c.fillText('实训教学 · 空间复原',w/2,42);c.fillStyle=fg;c.font='bold 88px "Microsoft YaHei",sans-serif';c.fillText(text,w/2,180);});}
const stripe=canvasTex(256,128,(c,w,h)=>{c.fillStyle='#c78939';c.fillRect(0,0,w,h);c.fillStyle='#292d27';for(let x=-128;x<400;x+=64){c.beginPath();c.moveTo(x,0);c.lineTo(x+34,0);c.lineTo(x-30,h);c.lineTo(x-64,h);c.fill();}},[12,1]);
const stripeMat=mat('#e5d1b3',{map:stripe});
const fenceMeshTex=canvasTex(64,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#a9a79a';c.lineWidth=1;c.strokeRect(0,0,64,64);},[10,7]);const fenceMeshMat=mat('#c7c6bc',{map:fenceMeshTex,transparent:true,alphaTest:.1,side:T.DoubleSide});
function fence(x,z,length,rotation){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;active.add(g);box(length,.23,.16,0,.115,0,stripeMat,g);for(let xx=-length/2;xx<=length/2+.01;xx+=1.5){box(.055,1.35,.055,xx,.76,0,m.orange,g);box(.18,.035,.3,xx,.03,0,m.orange,g);}for(let h of [.24,1.4])box(length,.055,.055,0,h,0,m.orange,g);let net=mesh(new T.PlaneGeometry(length,1.13),fenceMeshMat,0,.81,0,g);net.castShadow=false;return g;}
fence(-10.7,2,18,Math.PI/2);fence(-14.2,-7,7,0);fence(-14.2,11,7,0);blocker(-14.2,2,7,18);
const bannerMat=mat('#ffffff',{map:labelTexture('风力发电实训室'),side:T.DoubleSide,roughness:1});let banner=mesh(new T.PlaneGeometry(6.6,1.22),bannerMat,-10.65,.82,2);banner.rotation.y=Math.PI/2;
// Large horizontal nacelle / shell and open circular flange.
let nacelle=mesh(new T.CylinderGeometry(.84,1.02,8.5,48,1,true),m.white,-14.2,1.35,2.2);nacelle.rotation.x=Math.PI/2;
for(let z of [-2,6.45]){let ring=mesh(new T.TorusGeometry(.96,.12,10,48),m.white,-14.2,1.35,z);for(let i=0;i<20;i++){let a=i*Math.PI/10;let bolt=cyl(.035,.12,-14.2+Math.cos(a)*.96,1.35+Math.sin(a)*.96,z+.1,m.silver);bolt.rotation.x=Math.PI/2;}}
let darkInner=mesh(new T.CircleGeometry(.77,40),m.black,-14.2,1.35,6.13);let innerRing=mesh(new T.TorusGeometry(.72,.08,8,40),m.beam,-14.2,1.35,6.38);
for(let z of [-.7,4.6]){box(2.5,.18,1.2,-14.2,.15,z,m.white);box(.22,.55,1,-15.1,.42,z,m.beam);box(.22,.55,1,-13.3,.42,z,m.beam);}
for(let z of [-4.5,-.9,2.7]){let housing=box(2.3,1.25,2.8,-16,1,z,m.white);box(2.42,.12,2.85,-16,1.7,z,m.white);for(let i=0;i<8;i++)box(.03,.85,.02,-16.85+i*.24,1,z+1.41,m.silver);}
// Tapered white blade-like training component alongside the nacelle.
const bladeShape=new T.Shape();bladeShape.moveTo(-.65,0);bladeShape.bezierCurveTo(-.95,2,-.6,5,-.1,7.5);bladeShape.bezierCurveTo(.25,5.5,.75,2,.65,0);bladeShape.closePath();let blade=mesh(new T.ExtrudeGeometry(bladeShape,{depth:.16,bevelEnabled:true,bevelThickness:.07,bevelSize:.06,bevelSegments:2,steps:1}),m.white,-12.1,.58,6);blade.rotation.x=-Math.PI/2;
shadow(-14,2,8,20);
// White stacked components at the far left.
for(let z of [-10,-12.6,-15.2])for(let x of [-16.1,-13.3]){for(let k=0;k<3;k++){box(2.15,.32,.9,x,.23+k*.48,z,m.white);box(2.1,.06,.82,x,.06+k*.48,z,m.frame);}blocker(x,z,2.2,1.0);shadow(x,z,2.7,1.8);}
// Back wall equipment and workbenches.
for(let x of [-7,-3,1,5,13]){tabletop(x,-19,2.5,1,.82);if(x===1||x===5)box(1.3,.7,.7,x,1.2,-19,mat('#b8a889'));}
for(let x of [-15,-11]){cabinet(x,-19,1.45,2.8,.85);let g=new T.Group();active.add(g);for(let dx of [-.85,.85])box(.1,3.5,.1,x+dx,1.75,-17,m.frame,g);box(1.8,.12,.12,x,3.5,-17,m.frame,g);}
// Right training platform seen in the video: two levels, open stair and guardrails.
const px=14.4,pz=11.7;box(5.3,.18,6.0,px,.09,pz,m.beam);box(5.3,.24,4.9,px,3.1,pz-.4,m.white);
for(let x of [px-2.4,px+2.4])for(let z of [pz-2.7,pz+2])box(.25,3.05,.25,x,1.5,z,m.white);
box(4.9,2.7,.15,px,1.5,pz-2.6,m.wall);box(.12,2.7,4.5,px+2.4,1.5,pz-.3,m.wall);box(1.25,2.3,.12,px+1.05,1.3,pz-2.49,m.black);
function railing(a,b,y){let len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let i=0;i<=Math.ceil(len/.7);i++){let t=i/Math.ceil(len/.7);rod([a[0]+(b[0]-a[0])*t,y,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,y+1,a[1]+(b[1]-a[1])*t],.025,m.silver);}for(let h of [.35,.7,1])rod([a[0],y+h,a[1]],[b[0],y+h,b[1]],.025,m.silver);}
railing([px-2.5,pz-2.8],[px+2.5,pz-2.8],3.25);railing([px+2.5,pz-2.8],[px+2.5,pz+2],3.25);railing([px-2.5,pz+2],[px+2.5,pz+2],3.25);
for(let i=0;i<16;i++){let z=pz+4-i*.35,y=.1+i*.195;box(1.15,.08,.38,px-2,y,z,m.silver);}for(let dx of [-.62,.62]){rod([px-2+dx,.1,pz+4.15],[px-2+dx,3.15,pz-1.35],.04,m.silver);rod([px-2+dx,1.05,pz+4.15],[px-2+dx,4.1,pz-1.35],.028,m.silver);for(let i=0;i<8;i++)rod([px-2+dx,.15+i*.39,pz+4-i*.7],[px-2+dx,1.1+i*.39,pz+4-i*.7],.018,m.silver);}
blocker(px,pz,5.3,6);blocker(px-2,pz+3,1.4,2.8);shadow(px,pz,7,8);
for(let i=0;i<5;i++){cabinet(10.8,7+i*1.7,.58,1.12,.48,m.silver);box(.25,.17,.04,10.8,1.08,7.26+i*1.7,m.darkGlass);}
// Visible training frames, work tables, cabinets, red/blue components in the east bay.
for(let z of [-13,-7,-1,4]){tabletop(14.7,z,3.4,1.35,.85);for(let x of [13.3,16.1])box(.09,2.4,.09,x,1.2,z,m.blue);box(2.9,.09,.09,14.7,2.4,z,m.blue);box(2.7,1.1,.13,14.7,1.64,z,m.white);for(let x of [13.9,14.7,15.5]){cyl(.13,.4,x,1.22,z+.38,m.red);box(.35,.26,.25,x,1.0,z+.4,m.silver);}blocker(14.7,z,3.6,1.4);}
for(let z of [-18.6,-16])cabinet(16.7,z,1.2,2,.65);for(let z of [-8,-5])cabinet(11.7,z,.8,1.7,.5);
// Entrance display boards visible in the video, using neutral unreadable-text placeholders.
const boardTex=canvasTex(256,512,(c,w,h)=>{c.fillStyle='#e3e5df';c.fillRect(0,0,w,h);c.fillStyle='#3d859c';c.fillRect(0,0,w,66);c.fillStyle='#eaf0e7';c.font='20px sans-serif';c.textAlign='center';c.fillText('实训教学展示',w/2,42);for(let i=0;i<3;i++){c.fillStyle=['#a4b1a7','#afbbb6','#91a6a7'][i];c.fillRect(16,90+i*122,88,68);c.fillStyle='#839187';for(let j=0;j<6;j++)c.fillRect(114,92+i*122+j*10,120-rand()*22,2);for(let j=0;j<3;j++)c.fillRect(16,168+i*122+j*8,220-rand()*24,2);}c.fillStyle='#294e65';c.fillRect(0,h-26,w,26);});
for(let i=0;i<6;i++){let x=-16+i*1.5,z=18.4;box(1.05,1.9,.045,x,1.25,z,m.frame);let p=mesh(new T.PlaneGeometry(.96,1.8),mat('#ffffff',{map:boardTex}),x,1.25,z-.03);p.rotation.y=Math.PI;for(let dx of [-.36,.36]){box(.03,.7,.03,x+dx,.35,z,m.frame);rod([x+dx,.25,z],[x+dx,0,z-.45],.025,m.frame);rod([x+dx,.25,z],[x+dx,0,z+.45],.025,m.frame);}blocker(x,z,1.1,.7);}
// Small site details: stools, cable spool, covered materials.
for(let [x,z] of [[-11,-16],[11,-17],[16,-10],[13,-3]]){box(.35,.07,.35,x,.42,z,m.white);for(let dx of [-.13,.13])for(let dz of [-.13,.13])box(.025,.4,.025,x+dx,.2,z+dz,m.silver);}
let spool=cyl(.32,.55,-12,.33,-12.5,mat('#9b7851'));spool.rotation.z=Math.PI/2;for(let x of [-12.3,-11.7]){let o=cyl(.45,.06,x,.45,-12.5,mat('#a48b61'));o.rotation.z=Math.PI/2;}
// Soft contact occlusion underneath the wall and low fixtures.
for(let x of [-18,18])for(let z=-20;z<21;z+=3)shadow(x,z,2,5);for(let z of [-21,21])for(let x=-18;x<18;x+=3)shadow(x,z,5,2);
// Natural overcast daylight plus a sun direction passing through the skylight apertures.
const hemi=new T.HemisphereLight('#dce9ee','#77725f',2.6);scene.add(hemi);const ambient=new T.AmbientLight('#d8d4bd',.5);scene.add(ambient);
const sun=new T.DirectionalLight('#fff0ce',3.0);sun.position.set(-13,38,15);sun.target.position.set(0,0,-3);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-34;sun.shadow.camera.right=34;sun.shadow.camera.top=36;sun.shadow.camera.bottom=-36;sun.shadow.camera.near=1;sun.shadow.camera.far=85;sun.shadow.normalBias=.035;sun.shadow.bias=-.00012;sun.shadow.radius=3;
const fill=new T.DirectionalLight('#dce7e5',1.1);fill.position.set(2,7,-25);scene.add(fill);
// Batch static geometry by material and shadow behavior for smooth roaming.
function batch(group){group.updateMatrixWorld(true);let sets=new Map(),old=[];group.traverse(o=>{if(o.isMesh&& !Array.isArray(o.material)){let key=o.material.uuid+o.castShadow+o.receiveShadow;if(!sets.has(key))sets.set(key,{material:o.material,cast:o.castShadow,receive:o.receiveShadow,items:[]});sets.get(key).items.push(o);old.push(o);}});
 for(let set of sets.values()){let count=0;for(let o of set.items)count+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count);let pos=new Float32Array(count*3),norm=new Float32Array(count*3),uv=new Float32Array(count*2),k=0;for(let o of set.items){let geo=o.geometry,gp=geo.attributes.position,gn=geo.attributes.normal,gu=geo.attributes.uv,idx=geo.index,normalMatrix=new T.Matrix3().getNormalMatrix(o.matrixWorld);for(let j=0,n=idx?idx.count:gp.count;j<n;j++){let id=idx?idx.array[j]:j,p=V(gp.getX(id),gp.getY(id),gp.getZ(id)).applyMatrix4(o.matrixWorld),v=V(gn?gn.getX(id):0,gn?gn.getY(id):1,gn?gn.getZ(id):0).applyMatrix3(normalMatrix).normalize();pos.set(p.toArray(),k*3);norm.set(v.toArray(),k*3);if(gu)uv.set([gu.getX(id),gu.getY(id)],k*2);k++;}}let geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(norm,3));geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.computeBoundingSphere();let obj=new T.Mesh(geo,set.material);obj.castShadow=set.cast;obj.receiveShadow=set.receive;set.newMesh=obj;}
 group.clear();for(let s of sets.values())group.add(s.newMesh);}
for(let name of ['floor','structure','roof','walls','facilities'])batch(groups[name]);
window.Factory={T,scene,renderer,camera,groups,colliders,floor,hemi,sun,ambient,estimate:{width:36,length:42,height:12.85},baseExposure:1.06};
})();
