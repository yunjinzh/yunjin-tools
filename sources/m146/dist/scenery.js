/* Hand-built roadside miniatures. Shared primitive geometry and materials;
   all same-colour parts are baked into one mesh per vignette. No image/CDN assets. */
(function(){'use strict';
let cache;
function kit(T,root){
 if(!cache||cache.T!==T){cache={T,geo:{box:new T.BoxGeometry(1,1,1),ball:new T.IcosahedronGeometry(1,0),rock:new T.IcosahedronGeometry(1,0),cyl:new T.CylinderGeometry(1,1,1,8),cone:new T.ConeGeometry(1,1,8),roof:new T.ConeGeometry(1,1,4),ring:new T.TorusGeometry(1,.09,4,16),stem:new T.CylinderGeometry(1,1,1,4),sprig:new T.ConeGeometry(1,1,4)},mat:new Map()};Object.values(cache.geo).forEach(g=>{if(g.index){const n=g.toNonIndexed();g.copy(n);n.dispose();}});}
 const batches=new Map(),matrix=new T.Matrix4(),q=new T.Quaternion(),v=new T.Vector3(),normal=new T.Vector3(),nm=new T.Matrix3();
 function part(kind,c,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const g=cache.geo[kind],a=g.attributes.position,n=g.attributes.normal;matrix.compose(new T.Vector3(x,y,z),q.setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));nm.getNormalMatrix(matrix);let b=batches.get(c);if(!b){b={p:[],n:[]};batches.set(c,b);}for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(matrix);b.p.push(v.x,v.y,v.z);normal.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();b.n.push(normal.x,normal.y,normal.z);}}
 const box=(c,x,y,z,w,h,d,rz=0)=>part('box',c,x,y,z,w,h,d,0,0,rz),ball=(c,x,y,z,r,s=1)=>part('ball',c,x,y,z,r,r*s,r),cyl=(c,x,y,z,r,h,rx=0,rz=0)=>part('cyl',c,x,y,z,r,h,r,rx,0,rz);
 function beam(c,a,b,r=.065){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),mid=new T.Vector3(...a).addScaledVector(d,.5);const e=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize()));part('cyl',c,mid.x,mid.y,mid.z,r,d.length(),r,e.x,e.y,e.z);}
 function finish(){batches.forEach((b,c)=>{const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(b.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));if(!cache.mat.has(c)){const mat=new T.MeshStandardMaterial({color:c,roughness:.88});mat.userData.roadShared=true;cache.mat.set(c,mat);}const mesh=new T.Mesh(geo,cache.mat.get(c));mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);});return root;}
 return {part,box,ball,cyl,beam,finish};
}
const wood=0x956b49,cream=0xf3e6c8,leaf=0x688f55,dark=0x385c50,red=0xc66a4f,stone=0xa1aaa1,ink=0x405969;
function build(T,group,theme,x,z,variant,side,portal){const root=new T.Group();root.position.set(x,0,z);group.add(root);if(!portal&&side<0)root.rotation.y=Math.PI;const k=kit(T,root),{part,box,ball,cyl,beam}=k;const v=((variant||0)%3+3)%3;
 function tree(px,pz,fruit=false,s=1){cyl(wood,px,.85*s,pz,.14*s,1.7*s);beam(wood,[px,1.2*s,pz],[px-.5*s,2*s,pz],.09*s);ball(leaf,px,2.1*s,pz,.85*s);ball(0x91af6d,px-.4*s,2.55*s,pz,.62*s);if(fruit)for(let j=0;j<5;j++){const a=j*2.4;ball(j%2?0xe6b15b:red,px+Math.sin(a)*.66*s,(1.9+j*.14)*s,pz+Math.cos(a)*.66*s,.12*s);}}
 function fence(px,pz,len=3){for(let j=0;j<5;j++){const xx=px-len/2+j*len/4;box(wood,xx,.55,pz,.13,1.1,.13);part('roof',wood,xx,1.15,pz,.12,.16,.12,0,Math.PI/4);}box(cream,px,.45,pz,len,.12,.09);box(cream,px,.85,pz,len,.12,.09);}
 function flower(px,pz){cyl(leaf,px,.28,pz,.025,.5);ball(0xd5a55d,px,.55,pz,.12);}
 function roof(px,py,pz,w,d,c=red){part('roof',c,px,py,pz,w*.72,.9,d*.72,0,Math.PI/4);}
 function house(px,pz,w=2,h=2,c=cream){box(c,px,h/2,pz,w,h,1.8);roof(px,h+.42,pz,w+.4,2.2);box(wood,px,h*.35,pz+.91,.42,h*.7,.035);for(const dx of [-.62,.62]){box(cream,px+dx,h*.65,pz+.93,.42,.54,.06);box(ink,px+dx,h*.65,pz+.97,.29,.41,.02);box(wood,px+dx,h*.65,pz+1,.035,.43,.02);}box(wood,px+.65,h+.6,pz-.3,.3,1,.3);}
 function bench(px,pz){box(wood,px,.62,pz,1.65,.15,.58);box(wood,px,1.05,pz-.22,1.65,.37,.1);for(const dx of [-.6,.6])box(dark,px+dx,.3,pz,.1,.6,.4);}
 function cloud(px,py,pz,s=1){ball(0xf1eddf,px,py,pz,.58*s,.6);ball(cream,px-.52*s,py-.08*s,pz,.4*s,.65);ball(0xf6f2e5,px+.48*s,py-.04*s,pz,.43*s,.7);}
 function wheel(px,py,pz,r=1,c=wood){part('ring',c,px,py,pz,r,r,r);cyl(c,px,py,pz,.14,.2,Math.PI/2);for(let j=0;j<8;j++){const a=j*Math.PI/4;beam(c,[px,py,pz],[px+Math.cos(a)*r,py+Math.sin(a)*r,pz],.045);}}
 function book(px,py,pz,w,h,d,c){box(cream,px,py,pz,w*.86,h*.9,d);for(const dx of [-w*.5,w*.5])box(c,px+dx,py,pz,.07,h,d+.1);box(c,px,py,pz-d*.5,w,h,.08);for(let j=0;j<3;j++)box(0xcbbb9b,px,py-h*.25+j*h*.25,pz+d*.51,w*.7,.022,.015);}
 if(portal){
 // An eight-unit carriageway remains free beneath every thematic portal.
 const a=4.3;
 if(theme===0){for(const s of [-1,1]){cyl(wood,s*a,2.3,0,.25,4.6);tree(s*5.2,.3,true,1.35);}beam(wood,[-a,4.5,0],[a,4.5,0],.18);for(let i=-3;i<=3;i++)ball(leaf,i,4.65,0,.8,.5);for(const i of [-3,-1,1,3])ball(red,i,4.3,.3,.2);}
 if(theme===1){for(const s of [-1,1])for(let j=0;j<4;j++)part('rock',stone,s*a, j*1.1+.55,0,.7,.7,.65,0,j*.7);for(let j=0;j<7;j++)part('rock',j%2?stone:0xc4c6b7,-3.6+j*1.2,4.35+Math.sin(j/6*Math.PI)*.7,0,.85,.48,.65);}
 if(theme===2){for(const s of [-1,1]){cyl(0x9ba8b2,s*a,2.3,0,.22,4.6);cloud(s*a,4.7,0,1.4);}beam(cream,[-a,4.7,0],[a,4.7,0],.13);for(const i of [-2,0,2])cloud(i,5.1,0,.9);cyl(0xcba565,0,5.9,0,.38,.14,Math.PI/2);}
 if(theme===3){for(const s of [-1,1]){house(s*4.9,0,1.4,3.7);roof(s*4.9,4.5,0,2,2.2);}box(cream,0,4.7,0,8.4,.65,.6);roof(0,5.2,0,8.7,1.5);}
 if(theme===4){for(const s of [-1,1]){cyl(wood,s*a,2.3,0,.2,4.6);cyl(0xc29961,s*a,4.8,0,.4,.7);ball(cream,s*a,5.3,0,.5,.65);}box(red,0,4.5,0,8.6,.25,1);for(let j=0;j<9;j++)box(j%2?cream:0xd78863,j-4,4.7,0,.95,.16,1.1);}
 if(theme===5){for(const s of [-1,1]){cyl(wood,s*a,2.3,0,.16,4.6);wheel(s*5.1,1.9,0,1.3);}beam(wood,[-a,4.7,0],[a,4.7,0],.13);for(let j=-3;j<=3;j++){box(j%2?0xaf7a9a:0xe1b186,j,4.4,0,.65,.7,.08);part('roof',j%2?0xaf7a9a:0xe1b186,j,3.95,0,.46,.35,.07,0,Math.PI/4,Math.PI);}}
 if(theme===6){for(const s of [-1,1]){box(cream,s*a,2.3,0,.5,4.6,.5);flower(s*4.8,1);}roof(0,5.1,0,9,1.8,0x7f9275);box(wood,0,4.6,0,8.8,.25,.5);for(const s of [-1,1])fence(s*5.4,0,1.7);}
 if(theme===7){for(const s of [-1,1]){for(let j=0;j<3;j++)book(s*a,j*1.4+.7,0,.6,1.35,1.3,[0x698ca2,0xa88273,0x86a38e][j]);}book(0,4.7,0,8.6,.6,1.4,0x698ca2);wheel(0,5.7,0,.65,0xc8a467);}
 return k.finish();}
 if(theme===0){
 if(v===0){tree(-.7,0,true,1.35);tree(1.25,-.6,true,.85);fence(0,1.3);flower(-1.5,1.7);flower(1.4,1.5);}
 if(v===1){for(const s of [-1,1]){box(wood,s*1.3,1.1,0,.13,2.2,.13);box(wood,s*1.3,1.1,-1.4,.13,2.2,.13);}for(let j=0;j<5;j++)box(wood,-1.5+j*.75,2.25,-.7,.1,.1,2);for(let j=0;j<5;j++){ball(leaf,-1.2+j*.6,2.3,-.7,.55,.38);for(let q=0;q<3;q++)ball(0x8b7297,-1.2+j*.6,1.95-q*.13,-.5,.13);}box(wood,0,.25,.9,1.1,.5,.65);for(let j=0;j<4;j++)ball(red,-.36+j*.24,.55,.9,.15);}
 if(v===2){tree(0,-.5,true,1.6);bench(0,1);fence(-2,-.5,1.3);for(let j=0;j<4;j++)flower(-1.5+j*.4,1.8);}
 }
 if(theme===1){
 if(v===0){for(let j=0;j<3;j++)part('rock',[0x8d9e93,0xb5b9a3,0xc9c6b1][j],-.9+j*.8,1.4+j*.55,-.3,.95,2.1+j*.6,1.1,0,j*.6);part('cone',cream,.7,4.2,-.3,.45,.55,.45);box(0x83b9bd,0,.03,1.3,4,.05,.8);for(let j=0;j<4;j++)part('rock',stone,-1.5+j, .2,1.7,.35,.25,.3);}
 if(v===1){box(0x86bac0,0,.03,0,4.4,.05,2);for(const s of [-1,1])for(let j=0;j<4;j++)box(stone,-1.8+j*1.2,.3+Math.sin(j/3*Math.PI)*.3,s*.65,1.1,.4,.3);for(let j=0;j<7;j++)box(0xc2bda8,-1.8+j*.6,.6+Math.sin(j/6*Math.PI)*.38,0,.62,.17,1.1);tree(-2,-1.2,false,.65);}
 if(v===2){for(let j=0;j<4;j++)part('rock',stone,-1.3+j*.7,.35,-.7,.65,.55,.65,0,j);cyl(cream,0,1.5,-.6,.45,3);cyl(red,0,2.7,-.6,.46,.35);cyl(ink,0,3.2,-.6,.6,.55);part('cone',red,0,3.7,-.6,.75,.5,.75);box(0x8fbac0,0,.04,1.2,4,.08,1);}
 }
 if(theme===2){
 if(v===0){cyl(cream,0,1.8,0,1,3.6);cyl(0x9aafbd,0,3.6,0,1.15,.3);ball(0x7f96a9,0,3.8,0,1.1,.7);box(ink,0,1.2,1.01,.45,.85,.03);cyl(wood,0,4.65,0,.045,.65);beam(wood,[-.6,4.9,0],[.6,4.9,0],.04);part('cone',red,.75,4.9,0,.16,.4,.16,0,0,-Math.PI/2);}
 if(v===1){for(const s of [-1,1])beam(wood,[s*.8,0,.6],[0,1.7,0],.07);beam(wood,[0,0,-.8],[0,1.7,0],.07);cyl(0x8d9ca8,0,2,0,.23,1.6,Math.PI/3);cyl(cream,0,2.4,-.7,.29,.23,Math.PI/3);wheel(1.5,1.1,0,.5,0xb8a16d);cyl(wood,1.5,.5,0,.05,1);}
 if(v===2){for(let j=0;j<3;j++){cyl(0xc5c9cd,-1+j,1+j*.65,-.4,.12,2+j*1.3);cloud(-1+j,2.1+j*1.3,-.4,.9);}wheel(0,1.2,.4,.9,0xb7a77c);cyl(wood,0,.5,.4,.09,1);}
 }
 if(theme===3){
 if(v===0){house(-1,-.4,1.8,2.4);house(1.25,-1,1.5,3,0xe0c5a0);box(0xc9b991,.03,.03,1,3.6,.06,1);flower(-1.9,1);}
 if(v===1){box(cream,0,2.3,0,1.5,4.6,1.5);roof(0,5,0,2,2,0x688a81);cyl(cream,0,3.8,.78,.48,.06,Math.PI/2);beam(ink,[0,3.8,.84],[0,4.12,.84],.025);beam(ink,[0,3.8,.85],[.24,3.65,.85],.025);box(wood,0,.65,.76,.48,1.3,.04);bench(1.8,.5);}
 if(v===2){house(0,-.5,2.6,2,0xe4c6a7);bench(-1.4,1.4);tree(2,-.5,false,1.1);box(0xa4b390,0,.04,1,1,.08,1.2);}
 }
 if(theme===4){
 if(v===0){cyl(0xc69a77,0,.65,0,1,.9);ball(0xd1aa85,0,1.1,0,1.05,.75);box(ink,0,.85,.91,.65,.7,.1);box(wood,0,.35,1.1,1.6,.1,.5);cyl(0xb88f75,0,1.9,-.25,.22,1.2);cloud(.05,2.8,-.25,.38);cloud(.2,3.35,-.3,.5);}
 if(v===1){box(wood,0,.8,0,2.9,.2,1.4);for(const s of [-1,1])box(wood,s*1.3,1.2,0,.13,2.4,.13);for(let j=0;j<6;j++)box(j%2?cream:red,-1.25+j*.5,2.5,0,.5,.14,1.8);for(let j=0;j<3;j++){box(wood,-.9+j*.9,1.05,.1,.7,.3,.7);for(let n=0;n<3;n++)ball(j%2?0xe5b659:leaf,-1.1+j*.9+n*.2,1.28,.1,.14);}for(const s of [-1,1])wheel(s*1.05,.42,0,.35);}
 if(v===2){box(cream,0,.6,0,2.5,1.2,1.5);for(const s of [-1,1]){cyl(ink,s*.65,1.3,0,.5,.15);cyl(0x8c9c96,s*.65,1.58,0,.43,.45);cyl(cream,s*.65,1.83,0,.47,.06);ball(wood,s*.65,1.93,0,.1);}cloud(-.6,2.4,0,.35);cloud(-.5,2.9,0,.42);box(wood,0,.65,.78,1.7,.3,.05);}
 }
 if(theme===5){
 if(v===0){wheel(0,1.7,0,1.5);for(const s of [-1,1])beam(wood,[s*1.1,0,0],[0,1.7,0],.1);box(wood,0,.15,0,2.8,.2,.6);cyl(0xb88baf,1.8,1.8,0,.35,1.1,Math.PI/2);beam(cream,[0,1.7,0],[1.8,1.8,0],.025);}
 if(v===1){for(const s of [-1,1])cyl(wood,s*1.7,1.5,0,.08,3);beam(wood,[-1.7,2.8,0],[1.7,2.8,0],.04);for(let j=0;j<3;j++){box([0x9aa9bf,0xc28f9f,0xc5b288][j],-1.05+j*1.05,2,0,.8,1.45,.06);box(cream,-1.05+j*1.05,1.6,.04,.8,.08,.02);}bench(0,-.8);}
 if(v===2){for(let j=0;j<3;j++){const x=-1+j; cyl([0xa97c9b,0x91a5a5,0xd2b07b][j],x,.7,0,.38,1.25);for(const yy of [.1,1.3])cyl(wood,x,yy,0,.47,.1);for(let q=0;q<5;q++)cyl(j%2?0xb8c4bf:0xc5a4b5,x,.3+q*.18,0,.39,.025);}box(wood,0,.05,0,3.5,.1,1.5);}
 }
 if(theme===6){
 if(v===0){house(0,-.6,2.8,2.3,0xf0dbb7);fence(0,1.6,3.6);for(const s of [-1,1]){cyl(red,s*1.2,.25,1,.22,.5);ball(leaf,s*1.2,.65,1,.38);flower(s*1.2,1);} }
 if(v===1){box(wood,0,.9,0,1.5,.13,1.5);for(const s of [-1,1])for(const a of [-1,1])box(wood,s*.6,.45,a*.6,.08,.9,.08);bench(0,-1.1);cyl(cream,0,1.15,0,.15,.36);ball(leaf,0,1.45,0,.23);tree(1.8,.2,false,1.25);}
 if(v===2){for(const s of [-1,1]){box(wood,s*1.3,1.5,0,.13,3,.13);beam(wood,[s*1.3,0,1],[s*1.3,3,0],.08);}box(wood,0,3,0,2.8,.14,.2);for(const s of [-1,1])beam(cream,[s*.5,2.9,0],[s*.5,.8,.15],.025);box(wood,0,.8,.15,1.2,.12,.5);fence(0,-1.1,3.2);}
 }
 if(theme===7){
 if(v===0){for(const s of [-1,1])book(s*1.3,1.3,0,.7,2.6,1.1,s<0?0x7b9cac:0xbb967c);book(0,2.9,0,3.5,.5,1.2,0x91ab9e);box(cream,0,.04,0,3.6,.08,2.3);}
 if(v===1){for(const s of [-1,1])beam(wood,[s*1.1,0,.4],[s*1.1,2.7,-.2],.08);box(wood,0,1.8,0,2.6,1.6,.15);box(dark,0,1.8,.1,2.35,1.35,.04);for(let j=0;j<3;j++)box(cream,-.3+j*.3,1.8,.13,.04,.7-j*.15,.01);box(cream,.65,1.8,.13,.45,.04,.01);box(wood,0,1,.2,2.7,.08,.3);book(.4,.2,1.1,.6,.35,.9,0xb69172);}
 if(v===2){for(const x of [-1.6,0,1.6]){cyl(cream,x,1.5,0,.16,3);cyl(0xb6baa5,x,.15,0,.27,.3);cyl(0xb6baa5,x,2.95,0,.28,.15);}box(0xa9b6ab,0,3.15,0,3.8,.22,.7);roof(0,3.6,0,4,1.4,0x728b9a);bench(0,-.6);}
 }
 return k.finish();}
window.RoadScenery=function(T,group,themeIndex,x,z,variant=0,side=1){return build(T,group,themeIndex,x,z,variant,side,false);};
window.RoadPortal=function(T,group,themeIndex,x,z){return build(T,group,themeIndex,x,z,0,1,true);};
/* Continuous cultivated roadside layer: local x is the road centre,
   local z is the leading edge of a 16 m segment; side is -1 or +1. */
window.TrailLandscape=function(T,parent,theme,x,z,variant=0,side=1){
 const root=new T.Group();root.position.set(x,0,z);parent.add(root);
 const {part,box,ball,finish}=kit(T,root);
 const cyl=(c,x,y,z,r,h)=>part('stem',c,x,y,z,r,h,r);
 function beam(c,a,b,r=.06){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),mid=new T.Vector3(...a).addScaledVector(d,.5),e=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize()));part('box',c,mid.x,mid.y,mid.z,r*2,d.length(),r*2,e.x,e.y,e.z);}
 const flip=side<0?-1:1, X=n=>flip*n;
 const lime=0x8dbd50,green=0x639a42,moss=0x4d823a,bark=0x9a633c,sun=0xf0c453;
 const row=variant%2, v=variant%3;
 function shadow(a,b,r){part('sprig',0x719344,X(a),.035,b,r,.035,r*.72,0,.3);}
 function shrub(a,b,r=.7,c=green){part('rock',c,X(a),r*.52,b,r,r*.65,r*.8,0,a);}
 function orchard(a,b,h=3,fruit=true){
  shadow(a,b,h*.46);cyl(bark,X(a),h*.31,b,.14,h*.62);
  if(fruit)beam(bark,[X(a),h*.3,b],[X(a-.42),h*.64,b-.2],.075);
  if(fruit)beam(bark,[X(a),h*.4,b],[X(a+.35),h*.76,b+.12],.065);
  ball(green,X(a),h*.73,b,h*.37,.92);if(fruit)ball(lime,X(a-.42),h*.94,b-.12,h*.29,.9);
  
  if(fruit)for(let j=0;j<3;j++){const angle=j*2.1;ball(j%2?0xffaf36:0xe85536,X(a+Math.sin(angle)*h*.31),h*(.65+j*.065),b+Math.cos(angle)*h*.29,.15);}
 }
 function grass(a,b,count=3){for(let j=0;j<count;j++)part('sprig',j%2?lime:green,X(a+j*.15),.23+(j%2)*.08,b+j%2*.15,.12,.5+(j%2)*.15,.06,0,j*.6,.16*(j-1));}
 function patch(a,b,c=0xeaae5d){part('sprig',0x88ae4e,X(a),.04,b,1.2,.05,.8,0,a);for(let j=0;j<3;j++){const xx=a+Math.sin(j*2.4)*.8,zz=b+Math.cos(j*2.4)*.55;cyl(moss,X(xx),.25,zz,.022,.45);part('sprig',j%2?c:0xf6e1a8,X(xx),.5,zz,.13,.08,.13);}}
 function fence(a,b,n=4){for(let j=0;j<n;j++)box(bark,X(a),.55,b-j*.8,.12,1.1,.12);box(0xd4ab71,X(a),.4,b-(n-1)*.4,.07,.1,n*.8);box(0xd4ab71,X(a),.85,b-(n-1)*.4,.07,.1,n*.8);}
 function wallhouse(a,b,w,h,c,roofC){shadow(a,b,w);box(c,X(a),h/2,b,w,h,w*.85);part('roof',roofC,X(a),h+.65,b,w*.84,1.3,w*.7,0,Math.PI/4);box(0x966b48,X(a),h*.32,b+w*.43,.6,h*.64,.04);for(const d of [-.8,.8]){box(0xffe8ba,X(a+d),h*.62,b+w*.44,.5,.65,.06);box(0x6d9b9b,X(a+d),h*.62,b+w*.46,.35,.48,.02);}box(roofC,X(a+.7),h+.65,b-.5,.35,1.1,.35);}
 function cloth(a,b,c){for(const d of [-1.4,1.4])cyl(bark,X(a+d),1.65,b,.07,3.3);beam(bark,[X(a-1.4),3.1,b],[X(a+1.4),3.1,b],.04);for(let j=0;j<3;j++){box(j%2?0xf2cf99:c,X(a-1+j),2.25,b,.78,1.7,.05);box(0xf7e6be,X(a-1+j),1.75,b+.04,.78,.08,.02);}}
 function rock(a,b,r=.6){part('rock',0xa9b6ad,X(a),r*.35,b,r,r*.6,r*.8,0,a);}
 function cloud(a,y,b,s){ball(0xfff5e4,X(a),y,b,s,.5);ball(0xf2eee4,X(a-.8*s),y-.1,b,s*.65,.65);ball(0xffffff,X(a+.7*s),y+.1,b,s*.7,.6);}
 // Background rows anchor the horizon; foreground details provide moving parallax.
 if(theme===0){
  orchard(8+row,-4,3.3,true);orchard(10-row,-12,3.8,true);
  orchard(15,-2,4.5,false);orchard(18,-10,4.9,false);orchard(23,-6,5.3,false);
  shrub(14,-14,1.25);shrub(21,-15,1.8);patch(6.5,-8,0xee8c77);patch(12,-6,0xf8c85d);
  fence(6.3,-10,5);for(let j=0;j<3;j++)grass(7+j*1.8,-1-j*4,2);rock(6.2,-2,.38);rock(7,-14,.45);
 }
 if(theme===1){
  // Interconnected water reaches end-to-end, backed by reeds and rounded banks.
  box(0x70c9d1,X(11),.025,-8,5,.05,16);box(0x9de0d8,X(8.6),.04,-8,.65,.035,16);
  for(let j=0;j<5;j++){rock(8,-1-j*3,.5+j%2*.2);grass(7.3,-2-j*3,3);}
  for(let j=0;j<3;j++){part('rock',[0x93aa92,0xb5bd9c,0xd0c6a0][j],X(18+j*2),2+j,-5-j*3,2.3,3+j,2.4,0,j);}
  orchard(16,-13,3.5,false);patch(7,-11,0xcfc8e7);
 }
 if(theme===2){
  for(let j=0;j<4;j++){const a=10+j*4,b=-2-j*3;part('rock',0x9aaed0,X(a),.2,b,2.6,.45,1.8,0,j);cloud(a,1+j*.4,b,2.2);cloud(a+.5,5+j*.6,b-2,1.6);}
  for(const a of [7,14]){cyl(0xcda76b,X(a),1.5,-10,.06,3);part('sprig',0xf6cd75,X(a),3,-10,.6,.12,.6,Math.PI/2);}
  patch(7,-4,0xada5dc);grass(7,-13);
 }
 if(theme===3){
  wallhouse(12,-3,3.5,3.5,0xf0c892,0xcb7350);wallhouse(18,-10,4,4.6,0xf3dfb3,0x6c9c9c);
  wallhouse(24,-1,4.3,4.8,0xe9bd99,0xc57553);box(0xdab983,X(9),.04,-8,1.6,.08,16);
  orchard(8,-12,3.3,false);fence(7,-1,5);patch(7,-9,0xe57d65);shrub(15,-14,1.2);grass(8,-7);
 }
 if(theme===4){
  for(let j=0;j<2;j++){const a=10+j*7,b=-3-j*4;box(bark,X(a),.9,b,3,.18,1.6);for(const d of [-1.4,1.4])cyl(bark,X(a+d),1.8,b,.08,3.6);for(let q=0;q<6;q++)box(q%2?0xffe5af:0xea8b58,X(a-1.25+q*.5),3.55,b,.5,.16,2.3);for(let q=0;q<3;q++){box(0xb98552,X(a-.9+q*.9),1.15,b,.7,.35,.7);ball(q%2?0xeec047:0xe66c48,X(a-.9+q*.9),1.5,b,.25);}}
  orchard(8,-13,3.5,true);patch(7,-6,0xf0c25d);grass(6.5,-2);fence(7,-9,4);
 }
 if(theme===5){
  cloth(9,-3,0xcc85ae);cloth(15,-9,0x71b5bb);box(0xb3a0d2,X(21),2,-3,2.8,2,.05);
  wallhouse(21,-12,4,3.4,0xf1d8b2,0xaf819d);orchard(8,-12,3.2,false);
  for(let j=0;j<3;j++){const a=12+j*.8;cyl([0xd68fa9,0xf0c586,0x89bcc3][j],X(a),.55,-7,.28,.9);for(const y of [.1,1])cyl(bark,X(a),y,-7,.35,.1);}
  patch(7,-7,0xdd9fb6);grass(7,-1);fence(7,-10,4);
 }
 if(theme===6){
  wallhouse(15,-4,4.4,3,0xf5dbac,0xd27e5d);wallhouse(23,-11,4.8,4,0xf1d2b8,0x85a078);
  fence(7,-2,6);fence(11,-10,6);orchard(9,-11,3.5,true);orchard(21,-2,4,false);
  patch(8,-5,0xe78378);shrub(12,-9,.6,lime);box(0xc18e5a,X(10),.7,-7,2.2,.16,.6);for(const a of [9.2,10.8])box(bark,X(a),.35,-7,.12,.7,.45);shrub(18,-14,1.2);
 }
 if(theme===7){
  for(let j=0;j<4;j++){const a=11+j*3;box(0xf0ddb4,X(a),1.7,-5,.38,3.4,.5);box(0xd3b67d,X(a),3.5,-5,3.1,.28,.8);part('roof',0x779fac,X(a+1.4),3.95,-5,2.1,.7,.85,0,Math.PI/4);}
  for(let j=0;j<5;j++){const a=14+j*.65;box([0x769eab,0xd2a17e,0xa6b17e][j%3],X(a),1.1,-12,.5,2.2+j%2*.4,1.2);box(0xf8e9cc,X(a),1.1,-11.38,.37,1.8,.03);}
  orchard(8,-11,3.3,false);patch(7,-5,0xe7c366);fence(7,-1,4);grass(8,-8);shrub(24,-11,1.3);
 }
 return finish();
};
})();
