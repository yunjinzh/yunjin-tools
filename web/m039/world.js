import * as THREE from './vendor/three.module.js';
import {batchStatic} from './batch.js';

export const WORLD = {minZ:-2000,maxZ:680,halfWidth:710};
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function riverX(z){return Math.sin(z/280)*47+Math.sin(z/112)*10;}
export function terrainY(x,z){
  const d=Math.abs(x-riverX(z));
  const shore=clamp((d-8)/14,0,1);
  const hills=Math.pow(Math.max(0,d-38)/93,1.48)*(10+4*Math.sin(z*.006)+2*Math.sin(x*.013));
  return -2.35+shore*4.1+hills+(Math.sin(x*.027+z*.013)*1.1+Math.sin(z*.031)*.7)*shore;
}
function rng(seed=1903){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function makeWorld(scene){
  const rand=rng(), colliders=[], spatial=new Map(), gates=[], birds=[], smoke=[];
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const materialCache=new Map();
  const standard=(color,extra={})=>{const key=color+JSON.stringify(extra);if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({color,roughness:.93,flatShading:true,...extra}));return materialCache.get(key);};
  const trunkMat=standard(0x645445),green=standard(0xffffff),red=standard(0xb6442b),black=standard(0x343d35);
  const roofMat=standard(0x495955),plaster=standard(0xeee0ba),timber=standard(0x6a4c32),stone=standard(0x858c79);
  function mesh(geo,mat,parent=scene){const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(parent,size,pos,mat){const m=mesh(new THREE.BoxGeometry(...size),mat,parent);m.position.set(...pos);return m;}
  function cylinder(parent,r1,r2,h,pos,mat,seg=8){const m=mesh(new THREE.CylinderGeometry(r1,r2,h,seg),mat,parent);m.position.set(...pos);return m;}
  function collider(x,z,r,bottom,top,type){
    const c={x,z,r,bottom,top,type};colliders.push(c);
    const a=Math.floor((x-r)/32),b=Math.floor((x+r)/32),c1=Math.floor((z-r)/32),d=Math.floor((z+r)/32);
    for(let i=a;i<=b;i++)for(let j=c1;j<=d;j++){const key=i+','+j;if(!spatial.has(key))spatial.set(key,[]);spatial.get(key).push(c);}
  }
  // A single continuous, coloured terrain mesh keeps hill collision and rendering aligned.
  const groundGeo=new THREE.PlaneGeometry(WORLD.halfWidth*2,WORLD.maxZ-WORLD.minZ,150,256);
  groundGeo.rotateX(-Math.PI/2);groundGeo.translate(0,0,(WORLD.maxZ+WORLD.minZ)/2);
  const p=groundGeo.attributes.position,colors=[];
  const c=new THREE.Color();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),h=terrainY(x,z);p.setY(i,h);
    const d=Math.abs(x-riverX(z)),n=Math.sin(x*.052)*Math.cos(z*.048)*.023+rand()*.025;
    if(d<20)c.setHSL(.17,.21,.39+n);else c.setHSL(.233+Math.sin(x*.01+z*.007)*.015,.24,.33+n+Math.min(h*.0006,.08));
    colors.push(c.r,c.g,c.b);
  }
  groundGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));groundGeo.computeVertexNormals();
  const ground=mesh(groundGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));ground.castShadow=false;
  // The river is a procedural ribbon. Its soft highlights are generated in the shader.
  const rp=[],ri=[],ru=[];
  for(let i=0;i<=480;i++){
    const z=WORLD.maxZ-i/480*(WORLD.maxZ-WORLD.minZ),x=riverX(z),w=10.5+Math.sin(z*.022)*1.3;
    for(const side of [-1,1]){rp.push(x+side*w,-.68,z);ru.push((side+1)/2,i/10);}
    if(i<480){const a=i*2;ri.push(a,a+2,a+1,a+1,a+2,a+3);}
  }
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(ru,2));rg.setIndex(ri);rg.computeVertexNormals();
  const waterMat=new THREE.MeshStandardMaterial({color:0x79a6a0,roughness:.38,metalness:.1,side:THREE.DoubleSide});
  const waterTime={value:0};
  waterMat.onBeforeCompile=s=>{s.uniforms.uFlow=waterTime;s.vertexShader='varying vec2 vRiver;\n'+s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvRiver=uv;');s.fragmentShader='uniform float uFlow;varying vec2 vRiver;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat glint=pow(max(0.0,sin(vRiver.y*34.0+sin(vRiver.x*70.0)*1.7-uFlow*1.3)),26.0);diffuseColor.rgb+=glint*0.075;');};
  mesh(rg,waterMat).castShadow=false;
  function mountain(x,z,r,h,color,snow=false){
    const pos=[],cols=[],rings=12,sides=38;
    const point=(j,k)=>{const t=j/rings,a=k/sides*Math.PI*2,rr=r*Math.pow(1-t,1.16)*(1+.13*Math.sin(a*5)+.07*Math.sin(a*9));return [x+Math.cos(a)*rr,t*h-20+Math.sin(a*7)*r*.019*(1-t),z+Math.sin(a)*rr];};
    for(let j=0;j<rings;j++)for(let k=0;k<sides;k++){
      const vs=[point(j,k),point(j+1,k),point(j,k+1),point(j,k+1),point(j+1,k),point(j+1,k+1)];
      const col=new THREE.Color(snow&&j/rings>.71+(Math.sin(k*3)*.06)?0xebeee3:color);col.multiplyScalar(.88+rand()*.15);
      for(const v of vs){pos.push(...v);cols.push(col.r,col.g,col.b);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();
    const m=mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,fog:false}));m.castShadow=false;return m;
  }
  mountain(400,-2410,760,565,0x9eb7ad,true);
  for(let i=0;i<18;i++){
    const side=i%2===0?-1:1;
    mountain(side*(640+rand()*570),520-i*178,340+rand()*350,170+rand()*340,i%3===0?0x86a399:0x799a8d);
  }
  // Traditional timber homes with curved gable roofs and shoji-style lattice.
  function roof(parent,width,depth,y,height,mat=roofMat){
    const a=[],ix=[],steps=8;
    for(let i=0;i<=steps;i++){
      const t=i/steps*2-1,yy=y+height*(1-Math.abs(t))+.27*Math.pow(Math.abs(t),5);
      a.push(t*width/2,yy,-depth/2,t*width/2,yy,depth/2);
      if(i<steps){let q=i*2;ix.push(q,q+1,q+2,q+1,q+3,q+2);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g.setIndex(ix);g.computeVertexNormals();
    const m=mesh(g,mat,parent);m.material.side=THREE.DoubleSide;
    box(parent,[.3,.3,depth+.45],[0,y+height+.12,0],mat);
    for(const s of [-1,1])box(parent,[.14,.22,depth],[s*width/2,y+.25,0],timber);
    for(let i=0;i<=10;i++)box(parent,[.085,.04,depth],[(-.5+i/10)*width,y+height*(1-Math.abs(-1+i/5))+.29,0],mat);
  }
  const homePositions=[];
  function house(x,z,scale=1,angle=0,pagoda=false){
    const g=new THREE.Group();const y=terrainY(x,z);g.position.set(x,y,z);g.rotation.y=angle;g.scale.setScalar(scale);scene.add(g);homePositions.push({x,z,r:11*scale});
    box(g,[9,.55,7],[0,.25,0],stone);box(g,[8,4,6],[0,2.5,0],plaster);
    for(const xx of [-4,-2,0,2,4])box(g,[.17,4.2,.22],[xx,2.5,3.08],timber);
    for(const yy of [.58,1.3,3.9,4.45])box(g,[8.2,.14,.17],[0,yy,3.12],timber);
    for(const xx of [-3,1,3]){
      box(g,[1.5,2.1,.09],[xx,2.5,3.11],standard(0xd6d9ba));
      for(let k=0;k<4;k++)box(g,[.043,2.1,.08],[xx-.7+k*.47,2.5,3.2],timber);
      for(let k=0;k<4;k++)box(g,[1.5,.04,.08],[xx,1.5+k*.67,3.2],timber);
    }
    for(const xx of [-4,4])for(const zz of [-3,3])box(g,[.22,4.4,.22],[xx,2.5,zz],timber);
    box(g,[1.4,2.8,.12],[-1,2,3.16],timber);box(g,[9,.23,1.35],[0,.65,3.7],timber);
    roof(g,10,8,4.52,2.2);
    if(pagoda){box(g,[4.3,3.5,3.8],[0,7,0],plaster);roof(g,7.4,6.2,8.7,1.75);cylinder(g,.09,.15,2.2,[0,11.2,0],timber);}
    collider(x,z,5.2*scale,y,y+(pagoda?12:7)*scale,'房屋');
    return g;
  }
  for(const [z,side,count] of [[110,-1,4],[-470,1,7],[-1070,-1,5],[-1600,1,4]]){
    for(let j=0;j<count;j++){const zz=z+(j%3)*24,x=riverX(zz)+side*(49+Math.floor(j/3)*25);house(x,zz,.85+rand()*.25,side<0?-.23:Math.PI+.18,j===0&&z===-1070);}
  }
  // Flight gates are deliberately larger than real torii, to fit the 12.2 m span.
  const gateZ=[190,-10,-230,-470,-720,-990,-1280,-1600];
  const names=['杉林初见','溪上朱门','雾隐山径','山村来信','千杉回响','古社之风','云下归途','远山之约'];
  gateZ.forEach((z,i)=>{
    const x=riverX(z),heading=Math.atan((riverX(z+1)-riverX(z-1))/2),base=1.05;
    const g=new THREE.Group();g.position.set(x,base,z);g.rotation.y=heading;scene.add(g);
    for(const s of [-1,1]){
      cylinder(g,.75,1.03,27,[s*17,13.5,0],red,10);cylinder(g,1.05,1.18,2.6,[s*17,1.3,0],black,10);
      box(g,[3.4,.75,3.4],[s*17,.37,0],stone);
      const worldP=V(s*17,0,0).applyAxisAngle(V(0,1,0),heading).add(g.position);
      collider(worldP.x,worldP.z,1.2,base,base+27,'鸟居立柱');
    }
    box(g,[39,1.2,1.4],[0,24.6,0],red);box(g,[1.0,4.9,1.0],[0,26.1,0],red);
    const capGeo=new THREE.BoxGeometry(44,1.4,2.4,22,1,1),cp=capGeo.attributes.position;
    for(let j=0;j<cp.count;j++)cp.setY(j,cp.getY(j)+Math.pow(Math.abs(cp.getX(j))/22,3)*1.4);
    capGeo.computeVertexNormals();const cap=mesh(capGeo,black,g);cap.position.y=28.4;
    const under=mesh(capGeo.clone(),red,g);under.position.y=27.45;under.scale.set(.97,.6,.87);
    box(g,[2.5,3.5,.25],[0,26.2,1.0],black);
    box(g,[.15,2.0,.05],[0,26.2,1.16],standard(0xc4aa72));
    gates.push({index:i,name:names[i],x,z,base,heading,halfWidth:16,top:24,group:g,passed:false});
  });
  // Small shrines and stone lanterns on the banks.
  for(let i=0;i<26;i++){
    const z=255-i*76,x=riverX(z)+(i%2?1:-1)*27,y=terrainY(x,z),g=new THREE.Group();g.position.set(x,y,z);scene.add(g);
    box(g,[1.5,.4,1.5],[0,.2,0],stone);cylinder(g,.29,.46,1.65,[0,1.15,0],stone,6);box(g,[.88,.9,.88],[0,2.2,0],stone);
    box(g,[.44,.42,.91],[0,2.2,0],standard(0xf3cb84,{emissive:0x755423,emissiveIntensity:.4}));
    const cap=mesh(new THREE.ConeGeometry(1.1,.65,4),stone,g);cap.position.y=2.95;cap.rotation.y=Math.PI/4;
    collider(x,z,.85,y,y+3.3,'石灯笼');
  }
  // A low arched bridge across the water.
  for(const z of [-350,-910]){
    const x=riverX(z),g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
    for(let i=0;i<28;i++){
      const xx=(i/27-.5)*31,yy=1.5+Math.cos(xx/31*Math.PI)*1.9;
      box(g,[1.12,.2,5.0],[xx,yy,0],timber);
      for(const s of [-1,1]){if(i%3===0)box(g,[.19,1.6,.19],[xx,yy+.8,s*2.4],red);box(g,[1.2,.14,.15],[xx,yy+1.6,s*2.4],red);}
    }
    collider(x,z,3.1,-2,5.4,'木桥');
  }
  // Thousands of cedars, built from instanced polygon crowns and trunks.
  const treeData=[];
  for(let i=0;i<7600;i++){
    const z=550-rand()*2420,x=riverX(z)+(rand()-.5)*1260,d=Math.abs(x-riverX(z));
    if(d<30||homePositions.some(h=>Math.hypot(x-h.x,z-h.z)<h.r+4))continue;
    const y=terrainY(x,z),h=10+rand()*16+(d<75?3:0),radius=h*(.13+rand()*.055);
    treeData.push({x,y,z,h,radius,rot:rand()*6.28,tint:rand()});
  }
  const trunkGeo=new THREE.CylinderGeometry(.55,.95,1,5),foliageGeo=new THREE.ConeGeometry(1,1,7);
  const trunks=new THREE.InstancedMesh(trunkGeo,trunkMat,treeData.length);
  const crowns=new THREE.InstancedMesh(foliageGeo,green,treeData.length*4);
  const dummy=new THREE.Object3D();
  treeData.forEach((t,i)=>{
    dummy.position.set(t.x,t.y+t.h*.29,t.z);dummy.rotation.set(0,t.rot,0);dummy.scale.set(t.h*.019,t.h*.58,t.h*.019);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
    for(let j=0;j<4;j++){
      const f=1-j*.19,hh=t.h*(.58-j*.058);
      dummy.position.set(t.x+Math.sin(t.rot)*j*.13,t.y+t.h*(.44+j*.13),t.z);dummy.scale.set(t.radius*f,hh,t.radius*f);dummy.updateMatrix();crowns.setMatrixAt(i*4+j,dummy.matrix);
      crowns.setColorAt(i*4+j,new THREE.Color().setHSL(.276+t.tint*.03,.22+t.tint*.14,.205+j*.021+t.tint*.06));
    }
    collider(t.x,t.z,t.radius*.72,t.y,t.y+t.h,'杉树');
  });
  trunks.castShadow=true;crowns.castShadow=true;trunks.receiveShadow=true;crowns.receiveShadow=true;scene.add(trunks,crowns);
  // A few broadleaf trees add warm accents to the cedar canopy.
  const leafGeo=new THREE.IcosahedronGeometry(1,1),leafMat=standard(0xd78f64);
  for(let i=0;i<54;i++){
    const z=380-i*38,x=riverX(z)+(i%2?1:-1)*(33+rand()*25),y=terrainY(x,z),h=6+rand()*5;
    cylinder(scene,.18,.4,h,[x,y+h/2,z],trunkMat,6);
    for(let k=0;k<3;k++){const m=mesh(leafGeo,leafMat);m.position.set(x+(k-1)*2,y+h-k*.65,z+Math.sin(k*3)*1.3);m.scale.set(2.8,2.4,2.8);}
    collider(x,z,4.2,y,y+h+2.5,'枫树');
  }
  const rockGeo=new THREE.IcosahedronGeometry(1,0),rocks=new THREE.InstancedMesh(rockGeo,stone,330);
  for(let i=0;i<330;i++){
    const z=500-rand()*2420,x=riverX(z)+(rand()>.5?1:-1)*(11+rand()*10),s=.35+rand()*1.6;
    dummy.position.set(x,terrainY(x,z)+s*.2,z);dummy.rotation.set(rand(),rand(),rand());dummy.scale.set(s*1.6,s*.9,s);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
  }
  rocks.castShadow=true;rocks.receiveShadow=true;scene.add(rocks);
  batchStatic(scene,o=>!o.geometry.attributes.color&&o.material!==waterMat);
  // Cloud clusters, also geometry; no images or environment maps.
  const cloudGeo=new THREE.IcosahedronGeometry(1,2),cloudMat=new THREE.MeshBasicMaterial({color:0xeff0da,transparent:true,opacity:.36,depthWrite:false,fog:false});
  const clouds=new THREE.InstancedMesh(cloudGeo,cloudMat,112);
  for(let i=0;i<112;i++){
    const cluster=Math.floor(i/7),xx=Math.sin(cluster*5.4)*950,zz=200-cluster*180;
    dummy.position.set(xx+(i%7-3)*38,230+Math.sin(cluster*7)*42+rand()*20,zz+rand()*45);
    dummy.scale.set(70+rand()*28,13+rand()*10,28+rand()*23);dummy.rotation.set(0,0,0);dummy.updateMatrix();clouds.setMatrixAt(i,dummy.matrix);
  }
  scene.add(clouds);
  const birdMat=standard(0x344b41);
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-1.1,.05,.26,-.38,0,-.21,0,0,0,1.1,.05,.26,.38,0,-.21],3));bg.computeVertexNormals();birdMat.side=THREE.DoubleSide;
  for(let i=0;i<18;i++){const b=mesh(bg.clone(),birdMat);b.position.set(riverX(-i*100)+(rand()-.5)*90,34+rand()*25,200-i*110);birds.push({mesh:b,start:b.position.clone(),phase:rand()*6.28});}
  const marker=new THREE.Group();scene.add(marker);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(7.1,.07,4,56),new THREE.MeshBasicMaterial({color:0xf9e7b2,transparent:true,opacity:.63,depthWrite:false}));marker.add(ring);
  function checkCollision(pos,heading,bank=0,pitch=0){
    const points=[[-5.5,0,0],[5.5,0,0],[0,-.65,0],[0,.7,-2.9]];
    for(const [xx,yy,zz] of points){
      const x1=xx*Math.cos(bank)-yy*Math.sin(bank),y1=xx*Math.sin(bank)+yy*Math.cos(bank);
      const y2=y1*Math.cos(pitch)-zz*Math.sin(pitch),z2=y1*Math.sin(pitch)+zz*Math.cos(pitch);
      const x=pos.x+x1*Math.cos(heading)+z2*Math.sin(heading),z=pos.z-x1*Math.sin(heading)+z2*Math.cos(heading),y=pos.y+y2;
      if(y<terrainY(x,z)+.22)return '地面';
      if(y<-.55)return '溪水';
      const list=spatial.get(Math.floor(x/32)+','+Math.floor(z/32))||[];
      for(const c of list){if(y>c.top+.2||y<c.bottom)continue;
        let radius=c.r;
        if(c.type==='杉树')radius*=clamp((c.top-y)/(c.top-c.bottom)*1.9,.07,1);
        if((x-c.x)**2+(z-c.z)**2<(radius+.25)**2)return c.type;
      }
    }
    for(const g of gates){const dx=pos.x-g.x,dz=pos.z-g.z,localZ=dx*Math.sin(g.heading)+dz*Math.cos(g.heading),localX=dx*Math.cos(g.heading)-dz*Math.sin(g.heading);
      if(Math.abs(localZ)<1.25&&Math.abs(localX)<25&&pos.y+1.6>g.base+23.9&&pos.y-.65<g.base+30.5)return '鸟居横梁';
    }
    return null;
  }
  return {gates,treeCount:treeData.length,checkCollision,marker,update(time,targetIndex){
    waterTime.value=time;
    const target=gates[targetIndex];marker.visible=!!target;
    if(target){marker.position.set(target.x,target.base+14,target.z);marker.rotation.y=target.heading;ring.scale.setScalar(1+Math.sin(time*1.6)*.018);}
    for(const b of birds){b.mesh.position.x=b.start.x+Math.sin(time*.12+b.phase)*16;b.mesh.position.z=b.start.z+Math.cos(time*.12+b.phase)*16;b.mesh.rotation.y=-time*.12-b.phase;
      const arr=b.mesh.geometry.attributes.position;arr.setY(1,Math.sin(time*5+b.phase)*.45);arr.setY(4,Math.sin(time*5+b.phase)*.45);arr.needsUpdate=true;}
  }};
}
