import * as THREE from 'three';
const C={gold:0xeac26b,cream:0xf5e7c8,mint:0x89bfa6,coral:0xdf9277,blue:0x8bbcd0,wood:0x98784f,ink:0x426259};
const glow=(m,color=C.gold,intensity=1)=>{m.material.emissive=new THREE.Color(color);m.material.emissiveIntensity=intensity;return m};
const group=(parent,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g};

export function createMechanism(w,unit,parent){
 const root=group(parent),moving=[],lamps=[],state={energy:0,pulse:0,elapsed:0,progress:0};let wheel,vehicle,rocket,envelope,tree,bridge=[],lanterns=[],bars=[],carriages=[];
 w.cyl(2.6,2.8,.25,0xd8cba7,root,0,.2,0,48);w.cyl(2.4,2.45,.06,C.cream,root,0,.37,0,48);
 if(unit===0){
  wheel=group(root,0,2.75,0);w.mesh(new THREE.TorusGeometry(1.85,.10,10,64),C.gold,wheel);w.mesh(new THREE.TorusGeometry(1.58,.035,6,64),C.cream,wheel);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,b=w.box(.06,3.65,.06,C.cream,wheel);b.rotation.z=a;const cabin=group(wheel,Math.cos(a)*1.85,Math.sin(a)*1.85,0);w.box(.45,.42,.55,[C.coral,C.mint,C.blue,C.gold][i%4],cabin,0,-.15,0);lamps.push(glow(w.ball(.07,C.gold,cabin,0,.12,.3),C.gold,.2));carriages.push(cabin)}
  for(const x of [-.6,.6]){const leg=w.box(.19,2.7,.22,C.coral,root,x,1.45,-.2);leg.rotation.z=x*.36}w.ball(.22,C.gold,wheel,0,0,.16);
 } else if(unit===1){
  for(const x of [-1.8,1.8]){w.cyl(.2,.3,2.8,C.cream,root,x,1.8,-.6);w.box(.65,.18,.65,C.gold,root,x,3.22,-.6)}w.box(4.3,.25,1.5,C.cream,root,0,3.4,-.6);
  for(let i=0;i<3;i++){const g=group(root,(i-1)*1.3,.5,.15);w.cyl(.46,.6,.8,0xbbaa8a,g,0,.4,0);const gem=glow(w.mesh(new THREE.IcosahedronGeometry(.35,0),[C.gold,C.mint,C.blue][i],g,0,1.3,0),C.gold,.2);moving.push(gem);const glass=w.box(.95,1.5,.95,0xbde4d8,g,0,1.25,0);glass.material.transparent=true;glass.material.opacity=.15;glass.material.depthWrite=false;lamps.push(gem)}
 } else if(unit===2){
  tree=group(root);w.cyl(.22,.45,2.3,C.wood,tree,0,1.4,0);for(let i=0;i<5;i++){const a=i*2.4,g=group(tree,Math.cos(a)*.7,1.7+i*.18,Math.sin(a)*.7);w.ball(.75,0x77ab7a,g,0,.4,0);w.ball(.55,0x9ac493,g,.2,.9,0)}
  for(let i=0;i<12;i++){const a=i*2.4,r=1.1+i%3*.42,g=group(root,Math.cos(a)*r,.5,Math.sin(a)*r);w.cyl(.025,.04,.6,0x7c9b66,g,0,.3,0);for(let j=0;j<5;j++)w.ball(.13,[C.coral,C.gold,0xc4a1b4][i%3],g,Math.cos(j*1.256)*.16,.65,Math.sin(j*1.256)*.16);w.ball(.09,C.gold,g,0,.71,0);g.scale.setScalar(.2);moving.push(g)}
 } else if(unit===3||unit===4){
  const curve=new THREE.EllipseCurve(0,0,2,1.7,0,Math.PI*2,false,0),pts=curve.getPoints(90).map(p=>new THREE.Vector3(p.x,.48,p.y));
  const path=new THREE.CatmullRomCurve3(pts,true);w.mesh(new THREE.TubeGeometry(path,90,.06,6,true),unit===4?C.wood:0xa8b5a5,root);
  if(unit===4){for(let i=0;i<32;i++){const a=i/32*Math.PI*2,p=w.box(.45,.07,.14,C.wood,root,Math.cos(a)*2,.45,Math.sin(a)*1.7);p.rotation.y=-a}}
  for(let i=0;i<(unit===4?3:1);i++){const car=group(root);w.box(.85,.6,.55,[C.coral,C.gold,C.blue][i%3],car,0,.5,0);w.box(.43,.35,.57,C.cream,car,.15,.88,0);w.box(.05,.2,.42,C.blue,car,.38,.88,0);for(const x of [-.28,.28])for(const z of [-.32,.32])w.ball(.13,C.ink,car,x,.22,z);if(unit===3){const light=glow(w.ball(.10,C.coral,car,0,1.15,0),C.coral,1);lamps.push(light);w.box(.3,.3,.02,C.cream,car,0,.55,.29)}else if(i===0)w.cyl(.1,.14,.5,C.ink,car,-.27,1.02,0);moving.push(car)}
  w.house(root,0,-.7,C.mint,'house',.45);vehicle=true;
 } else if(unit===5){
  w.box(2.6,.24,1.6,C.wood,root,0,.75,0);for(const x of [-1,1])for(const z of [-.6,.6])w.box(.13,.6,.13,C.wood,root,x,.4,z);
  envelope=group(root,0,1.45,0);w.box(1.9,1.3,.12,C.cream,envelope);const flap=group(envelope,0,.65,0);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.95,0,0,.95,0,0,0,-.7,.06],3));geo.computeVertexNormals();const m=w.mesh(geo,C.gold,flap);m.material.side=THREE.DoubleSide;moving.push(flap);lamps.push(glow(w.mesh(new THREE.OctahedronGeometry(.21),C.coral,envelope,0,-.05,.16),C.coral,.2));
  w.mesh(new THREE.TorusGeometry(.46,.06,8,40),C.gold,root,1.75,1.6,.4);w.box(.08,.7,.08,C.wood,root,1.5,1,.4).rotation.z=-.4;
 } else if(unit===6){
  for(let i=0;i<9;i++){const x=(i-4)*.5,y=.75+Math.sin(i/8*Math.PI)*.65;const plank=w.box(.46,.16,1.25,[C.coral,C.gold,C.mint,C.blue,0xbaabd2][i%5],root,x,y,0);plank.scale.y=.15;bridge.push(plank)}
  for(const x of [-2.4,2.4]){w.cyl(.12,.18,1.3,C.wood,root,x,1,0);lamps.push(glow(w.ball(.16,C.gold,root,x,1.7,0),C.gold,.3))}
  const pet=w.pet(root,-2.1,.2,.65,'gold');moving.push(pet);for(let i=0;i<3;i++)w.mesh(new THREE.TorusGeometry(2.3+i*.17,.045,6,60,Math.PI),[C.coral,C.gold,C.blue][i],root,0,.8,-.8);
 } else if(unit===7){
  for(let i=0;i<7;i++){const x=(i-3)*.55,h=1+(i%3)*.3;const bar=w.box(.38,h,.55,[C.coral,C.gold,C.mint,C.blue][i%4],root,x,.5+h/2,0);bar.userData.baseHeight=h;bars.push(bar);lamps.push(glow(w.ball(.09,C.gold,root,x,2.7,0),C.gold,.15))}
  for(const x of [-2.2,2.2]){w.box(.5,1.5,.65,C.ink,root,x,1.2,-.7);for(const y of [.9,1.5])w.ball(.17,C.gold,root,x,y,-.33)}
 } else if(unit===8){
  w.cyl(1.3,1.45,.3,0x96a5a4,root,0,.55,0,32);rocket=group(root,0,.75,0);w.cyl(.52,.52,2.25,C.cream,rocket,0,1.2,0,32);w.mesh(new THREE.ConeGeometry(.52,.85,24),C.coral,rocket,0,2.75,0);w.ball(.22,C.blue,rocket,0,1.6,.45);w.mesh(new THREE.TorusGeometry(.24,.035,8,32),C.gold,rocket,0,1.6,.48);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3,g=group(rocket,Math.sin(a)*.52,.45,Math.cos(a)*.52);g.rotation.y=a;w.mesh(new THREE.ConeGeometry(.35,1.0,3),C.mint,g)}const fire=glow(w.mesh(new THREE.ConeGeometry(.28,1.05,12),C.gold,rocket,0,-.4,0),0xffa957,2);fire.rotation.x=Math.PI;moving.push(fire);
  for(let i=0;i<3;i++){const orb=w.ball(.16,[C.gold,C.blue,C.coral][i],root,Math.cos(i*2.1)*2.0,3.1,Math.sin(i*2.1)*.8);lamps.push(glow(orb,C.gold,.2))}
 } else {
  w.mesh(new THREE.ConeGeometry(1.4,2.1,4),C.gold,root,-.8,1.5,-.4).rotation.y=Math.PI/4;w.box(.75,1.0,.05,C.wood,root,-.8,.95,.6);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;w.ball(.13,0x9d9b83,root,Math.cos(a)*.47,.55,1.2+Math.sin(a)*.47)}const fire=glow(w.mesh(new THREE.ConeGeometry(.35,.85,8),C.coral,root,0,.98,1.2),0xefad5c,.7);moving.push(fire);
  for(let i=0;i<5;i++){const g=group(root,(i-2)*.82,2.1+(i%2)*.6,-.9);const lamp=w.cyl(.19,.15,.35,C.cream,g,0,0,0,12);lamps.push(glow(lamp,C.gold,.9));w.box(.25,.06,.25,C.wood,g,0,-.22,0);lanterns.push(g)}
 }
 // The same six energy sockets visibly link every chapter to its word progress.
 const sockets=[];for(let i=0;i<6;i++){const a=(i/5*.65+.17)*Math.PI;const orb=w.ball(.10,C.gold,root,Math.cos(a)*2.8,.62,Math.sin(a)*2.8);sockets.push(glow(orb,C.gold,.08))}
 const api={root,state,sockets,unit,charge(progress){state.progress=Math.max(state.progress,Math.min(1,progress));state.energy=1;state.pulse=1;state.elapsed=0;},setProgress(p){state.progress=Math.max(0,Math.min(1,p));},tick(dt,time,motion=true){
  state.energy=Math.max(0,state.energy-dt*.24);state.pulse=Math.max(0,state.pulse-dt*.7);state.elapsed+=dt;const active=motion?state.energy:0,phase=motion?time:0;
  sockets.forEach((m,i)=>m.material.emissiveIntensity=i<Math.ceil(state.progress*6)?1.35:.06);lamps.forEach((m,i)=>m.material.emissiveIntensity=.2+state.progress*.6+active*(.7+.4*Math.sin(phase*7+i)));
  if(wheel){if(motion)wheel.rotation.z-=dt*(.06+active*1.4);carriages.forEach(c=>c.rotation.z=-wheel.rotation.z)}
  if(unit===1)moving.forEach((m,i)=>{m.position.y=1.3+active*.45+(motion?Math.sin(phase*1.6+i)*.08:0);m.rotation.y=phase*.35});
  if(tree){tree.scale.setScalar(.88+state.progress*.18+(motion?state.pulse*.04:0));moving.forEach((o,i)=>o.scale.setScalar(.18+Math.max(0,Math.min(1,state.progress*1.8-i*.05))*.82));}
  if(vehicle)moving.forEach((o,i)=>{if(motion)o.userData.travel=(o.userData.travel||0)+dt*(.1+active*1.8);const a=(o.userData.travel||0)-i*.7;o.position.set(Math.cos(a)*2,.48,Math.sin(a)*1.7);o.rotation.y=-a-Math.PI/2});
  if(envelope){moving[0].rotation.x=-(state.progress+active*.6)*1.4;envelope.position.y=1.45+active*.4+(motion?Math.sin(phase*1.5)*.08:0)}
  if(bridge.length){bridge.forEach((b,i)=>{b.scale.y=i<Math.ceil(state.progress*9)?1:.15;b.material.emissiveIntensity=i<Math.ceil(state.progress*9)?.10:0;b.material.emissive=new THREE.Color(C.gold)});const p=state.progress;moving[0].position.set(-2.1+p*4.2,.75+Math.sin(p*Math.PI)*.65+.08*Math.sin(phase*10),.2)}
  if(bars.length)bars.forEach((o,i)=>{const k=1+active*.35*Math.sin(phase*8+i);o.scale.y=k;o.position.y=.5+o.userData.baseHeight*k/2});
  if(rocket){const lift=active>0?Math.sin(Math.min(1,state.elapsed/3.5)*Math.PI)*2.5:0;rocket.position.y=.75+(motion?lift:state.progress*.25);rocket.rotation.z=active*.025*Math.sin(phase*12);moving[0].scale.set(.7+active*.4,.25+active*(.9+.2*Math.sin(phase*20)),.7+active*.4)}
  if(unit===9){moving[0].scale.y=.85+.15*Math.sin(phase*9)+active*.35;lanterns.forEach((l,i)=>l.position.y=2.1+(i%2)*.6+active*(1.2+i*.12)+Math.sin(phase+i)*.08)}
 }};api.tick(0,0,false);return api;
}

export function createEcology(w,parent){
 const root=group(parent),birds=[],flies=[];
 for(let i=0;i<7;i++){const bird=group(root);const body=w.ball(.09,0xf1edd4,bird);body.scale.set(1,.7,1.9);const wings=[];for(const side of [-1,1]){const wing=group(bird,side*.04,0,0);w.box(.36,.025,.13,0xf4eed9,wing,side*.16,0,0);wings.push(wing)}birds.push({bird,wings,offset:i*.75})}
 const geo=new THREE.BufferGeometry(),positions=[];for(let i=0;i<90;i++)positions.push(Math.sin(i*2.4)*(4+i%7),.7+(i%5)*.55,Math.cos(i*2.4)*(4+i%7));geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const fireflies=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffd987,size:.10,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));root.add(fireflies);
 const starsGeo=new THREE.BufferGeometry(),sp=[];for(let i=0;i<250;i++){const a=i*2.39996,y=.2+(i%79)/100,r=Math.sqrt(1-y*y);sp.push(Math.cos(a)*r*110,y*110,Math.sin(a)*r*110)}starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xfff1c7,size:.19,transparent:true,opacity:0,depthWrite:false}));root.add(stars);
 const moon=w.ball(2.2,0xffecc9,root,-34,39,-65);moon.material.dispose();moon.material=new THREE.MeshBasicMaterial({color:0xffecc9});moon.visible=false;
 return {root,stars,fireflies,moon,tick(dt,time,dark,motion=true){birds.forEach(({bird,wings,offset},i)=>{bird.visible=dark<.7;const a=(motion?time*.09:0)+offset;bird.position.set(Math.cos(a)*(14+i*.45),5.8+Math.sin(a*2+i)*.7,Math.sin(a)*(12+i*.3)-4);bird.rotation.y=-a;wings.forEach((wing,k)=>wing.rotation.z=(k?1:-1)*(.2+(motion?Math.sin(time*7+i)*.55:0)))});stars.material.opacity=dark*.86;fireflies.material.opacity=dark*.8;moon.visible=dark>.55;if(motion){const a=fireflies.geometry.attributes.position;for(let i=0;i<90;i++){a.setY(i,.75+(i%5)*.55+Math.sin(time*.6+i)*.25)}a.needsUpdate=true}}};
}

export function createAirship(w,parent){const g=group(parent);const balloon=w.ball(1.1,C.cream,g,0,1.4,0);balloon.scale.set(1.8,.72,.72);for(const x of [-.75,.75])w.mesh(new THREE.TorusGeometry(.70,.025,6,40),C.gold,g,x,1.4,0).rotation.y=Math.PI/2;w.box(1.1,.3,.48,C.wood,g,0,.2,0);for(const x of [-.45,.45])w.box(.035,.65,.035,C.wood,g,x,.65,0);const prop=group(g,-1.8,1.4,0);w.box(.06,.6,.10,C.mint,prop);w.box(.06,.10,.6,C.mint,prop);g.userData.prop=prop;return g}
