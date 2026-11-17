'use strict';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const geoPoint=(lon,lat,h=.6)=>V((lon-105)*1.12,h,(35-lat)*1.35);
const planeInfo=[{id:'mint',name:'薄荷螺旋桨',need:0,color:'#159a7d',fill:'#d5f5de',speed:8},{id:'sun',name:'阳光双翼机',need:5,color:'#eba84b',fill:'#fff0c0',speed:10},{id:'jet',name:'蓝鲸喷气机',need:12,color:'#598bc4',fill:'#ddeaff',speed:13}];
class ChinaWorld{
 constructor(canvas,events){
  this.canvas=canvas;this.events=events;this.scene=new THREE.Scene();this.scene.fog=new THREE.Fog(0xd2eee5,135,250);
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));this.renderer.setClearColor(0x000000,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.camera=new THREE.OrthographicCamera(-45,45,34,-34,.1,300);this.target=V(1,0,1.5);this.yaw=-.08;this.pitch=1.08;this.zoom=1;this.wantedZoom=1;this.wantedTarget=this.target.clone();this.provinceMeshes=[];this.pickables=[];this.markers=new Map();this.mapObjects=new Map();this.labels=new Map();this.clouds=[];this.keys=new Set();this.manual=false;this.paused=false;this.labelsOn=true;this.category='all';this.selected=null;this.flight=null;this.heading=0;this.arrivalCooldown=new Map();this.disposed=false;
  this.scene.add(new THREE.HemisphereLight(0xf5ffed,0x7aab86,2.0));const sun=new THREE.DirectionalLight(0xfff3d3,3.8);sun.position.set(-22,60,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55,near:1,far:150});sun.shadow.normalBias=.05;sun.shadow.bias=-.00015;this.scene.add(sun);const fill=new THREE.DirectionalLight(0xd8f2ff,1.2);fill.position.set(35,22,-35);this.scene.add(fill);
  this.land=new THREE.Group();this.scene.add(this.land);this.features=new THREE.Group();this.scene.add(this.features);this.buildLand();this.buildTerrain();this.buildRivers();this.buildMarkers();this.buildClouds();this.createPlane('mint');this.plane.position.copy(geoPoint(104.2,33.0,7));this.plane.rotation.y=-.7;this.createInset();this.createEvents();this.resize();this.last=performance.now();this.animate=this.animate.bind(this);this.raf=requestAnimationFrame(this.animate);
 }
 material(color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.86,metalness:0,...extra});}
 mesh(geo,mat,parent=this.scene,pos,scale){const m=new THREE.Mesh(geo,mat);if(pos)m.position.copy(pos);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 sphere(parent,color,pos,scale,segments=12){return this.mesh(new THREE.SphereGeometry(1,segments,8),this.material(color),parent,V(...pos),scale);}
 polygonList(f){return f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;}
 shapeFrom(rings){const convert=ring=>ring.map(c=>{const p=geoPoint(...c);return new THREE.Vector2(p.x,-p.z)});const s=new THREE.Shape(convert(rings[0]));rings.slice(1).forEach(r=>s.holes.push(new THREE.Path(convert(r))));return s;}
 buildLand(){
  const sides=this.material(0xd1e2b4);const palette=[0xa8cd95,0xb4d59e,0xa2c990,0xabcfa0,0xbacf93,0xb5d09a,0xa2c6a3];
  GEO.features.forEach((f,fi)=>{const id='province-'+f.properties.adcode;const dest=DATA.places.find(p=>p.id===id);const lon=(f.properties.centroid||f.properties.center||[110])[0];const top=this.material(lon<101?0xc5cc9a:palette[fi%palette.length]);top.userData.original=top.color.clone();
   for(const rings of this.polygonList(f)){
    if(rings[0].every(c=>c[1]<17.5))continue;
    let shape;try{shape=this.shapeFrom(rings)}catch{continue;}
    const g=new THREE.ExtrudeGeometry(shape,{depth:.7,bevelEnabled:false,steps:1});g.rotateX(-Math.PI/2);const m=this.mesh(g,[top,sides],this.land);m.userData.id=dest?.id||null;m.userData.province=true;this.provinceMeshes.push(m);if(dest)this.pickables.push(m);
    for(const ring of rings){const pts=ring.filter(c=>c[1]>=17.3).map(c=>geoPoint(c[0],c[1],.73));if(pts.length>1){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xf5ffe9,transparent:true,opacity:.8}));this.land.add(line);}}
   }
  });
  const floor=this.mesh(new THREE.PlaneGeometry(230,230),new THREE.ShadowMaterial({color:0x488867,opacity:.16}),this.scene,V(0,-.12,0));floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  const grid=new THREE.GridHelper(130,26,0xa5d1c4,0xa5d1c4);grid.position.y=-.08;grid.material.transparent=true;grid.material.opacity=.11;this.scene.add(grid);
 }
 inside(lon,lat){for(const f of GEO.features){if(!f.properties.name)continue;for(const poly of this.polygonList(f)){let inside=false;const ring=poly[0];for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if(((a[1]>lat)!==(b[1]>lat))&&(lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}if(inside)return true;}}return false;}
 addPeak(parent,p,height,radius,snow,color){
  const geo=new THREE.ConeGeometry(radius,height,5,1);const rock=this.mesh(geo,this.material(color),parent,p.clone().add(V(0,height/2,0)));rock.rotation.y=Math.sin(p.x*5)*2;
  if(snow){const cap=this.mesh(new THREE.ConeGeometry(radius*.34,height*.34,5),this.material(0xfffdf1),parent,p.clone().add(V(0,height*.83,0)));cap.rotation.y=rock.rotation.y;}
 }
 terrainPatch(place,rx,rz,height,color,basin=false){
  const g=new THREE.BufferGeometry(),pos=[],colors=[],indices=[],c=new THREE.Color(color),center=geoPoint(...place.coord);const segments=48,rings=9;
  for(let r=0;r<=rings;r++)for(let i=0;i<=segments;i++){const t=r/rings,a=i/segments*Math.PI*2;const x=Math.cos(a)*rx*t,z=Math.sin(a)*rz*t;let h=basin?height*Math.exp(-Math.pow((t-.79)/.18,2)):(Math.pow(1-t*t,.55)*height);h+=.04*Math.sin(i*2.8+r*2.4)*t;pos.push(center.x+x,.76+h,center.z+z);const col=c.clone().lerp(new THREE.Color(basin?0xc2ae7d:0xe4dec0),clamp(h/height*.45,0,.6));colors.push(col.r,col.g,col.b);if(r<rings&&i<segments){const k=r*(segments+1)+i;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}}
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();const m=this.mesh(g,this.material(0xffffff,{vertexColors:true,side:THREE.DoubleSide}),this.features);m.userData.id=place.id;this.pickables.push(m);this.mapObjects.set(place.id,m);
 }
 batchPeaks(group,id){
  const batches=new Map();group.updateMatrixWorld(true);const old=[];
  group.traverse(m=>{if(!m.isMesh)return;old.push(m);const key=m.material.color.getHex();if(!batches.has(key))batches.set(key,{positions:[],normals:[],material:m.material.clone()});const b=batches.get(key);const g=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrix);b.positions.push(...g.attributes.position.array);b.normals.push(...g.attributes.normal.array);g.dispose();});
  for(const m of old){group.remove(m);const i=this.pickables.indexOf(m);if(i>=0)this.pickables.splice(i,1);m.geometry.dispose();m.material.dispose();}
  for(const b of batches.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.normals,3));g.computeBoundingSphere();const m=this.mesh(g,b.material,group);m.userData.id=id;this.pickables.push(m);}
 }
 buildTerrain(){
  const patches=[['plateau-qinghai',10,5.7,1.3,0xc2c5a0],['plateau-mongolia',8,1.9,.5,0xabcc8c],['plateau-loess',3.5,2.5,.65,0xc8b279],['plateau-yungui',3.2,2.0,.55,0xa9be81],['basin-tarim',7.3,3.4,1.0,0xe1c998,true],['basin-junggar',4.3,2,0.7,0xd2c192,true],['basin-qaidam',3.2,1.5,.7,0xd6c3a1,true],['basin-sichuan',2.7,2.3,.65,0xa5c286,true]];
  patches.forEach(([id,...args])=>this.terrainPatch(DATA.places.find(p=>p.id===id),...args));
  Object.entries(DATA.mountains).forEach(([id,path])=>{const group=new THREE.Group();this.features.add(group);const snow=['mountain-himalaya','mountain-kunlun','mountain-tianshan','mountain-qilian'].includes(id);const base=id==='mountain-himalaya'?3:id==='mountain-kunlun'?2.1:snow?1.8:1.2;
   for(let i=0;i<path.length-1;i++){const a=geoPoint(...path[i]),b=geoPoint(...path[i+1]),len=a.distanceTo(b);const count=Math.max(2,Math.ceil(len/.65));for(let j=0;j<count;j++){const p=a.clone().lerp(b,j/count);p.y=.8+(id==='mountain-himalaya'?.0:snow?.2:0);const noise=(Math.sin((i*30+j)*32.18)*.5+.5);const h=base*(.55+noise*.5);this.addPeak(group,p,h,.4+h*.25,snow,snow?0xb5b998:0x739b6c);if(j%2===0){const q=p.clone().add(V(.55,0,.5));this.addPeak(group,q,h*.65,.35+h*.16,snow,snow?0xbcc29b:0x86ab76);}}}
   group.traverse(o=>{if(o.isMesh){o.userData.id=id;this.pickables.push(o)}});this.batchPeaks(group,id);this.mapObjects.set(id,group);
  });
  const seed=(a)=>Math.sin(a*78.23)*43758.32%1;
  // Small tree clusters help distinguish eastern lowlands without changing geographic boundaries.
  const treeGeo=new THREE.ConeGeometry(.19,.75,5),trunkGeo=new THREE.CylinderGeometry(.045,.06,.22,5),treeMat=this.material(0x599568),trunkMat=this.material(0x9b8a64);
  for(let i=0;i<55;i++){const lon=104+Math.abs(seed(i+3))*24,lat=23+Math.abs(seed(i+191))*25;if(this.inside(lon,lat)){const p=geoPoint(lon,lat,.82);this.mesh(trunkGeo,trunkMat,this.features,p.clone().add(V(0,.05,0)));this.mesh(treeGeo,treeMat,this.features,p.clone().add(V(0,.42,0)));}}
  DATA.places.filter(p=>p.category==='lake').forEach(p=>{const group=new THREE.Group(),pos=geoPoint(...p.coord,.93),size=p.id==='lake-qinghai'?.86:p.id==='lake-tianchi'?.33:.6;group.position.copy(pos);this.features.add(group);const l=this.mesh(new THREE.SphereGeometry(1,24,12),this.material(0x68b8ce,{roughness:.25,metalness:.03}),group,V(),[size,.11,size*.66]);l.userData.id=p.id;this.pickables.push(l);const rim=new THREE.Mesh(new THREE.TorusGeometry(size,.034,6,40),this.material(0xc5e7cf));rim.rotation.x=Math.PI/2;rim.scale.y=.66;rim.position.y=.01;group.add(rim);this.mapObjects.set(p.id,group);});
  DATA.places.filter(p=>p.category==='plain').forEach((p,idx)=>{const center=geoPoint(...p.coord,.82);const g=new THREE.Group();this.features.add(g);for(let i=0;i<7;i++){const field=this.mesh(new THREE.BoxGeometry(.7,.025,.36),this.material(i%2?0xced78a:0x91bf74),g,center.clone().add(V((i%3)*.77-1,.01,Math.floor(i/3)*.5-.5)));field.userData.id=p.id;this.pickables.push(field);}this.mapObjects.set(p.id,g);});
 }
 riverHeight(lon,lat){let h=.84;if(lon<101&&lat>28&&lat<36)h=1.6;return h;}
 buildRivers(){
  Object.entries(DATA.rivers).forEach(([id,path])=>{const points=path.map(([lon,lat])=>geoPoint(lon,lat,this.riverHeight(lon,lat)));const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');const isMajor=['river-yangtze','river-yellow'].includes(id);const tube=this.mesh(new THREE.TubeGeometry(curve,Math.max(100,path.length*12),isMajor?.095:.065,6,false),this.material(id==='river-yellow'?0xc3a761:0x61b9d5,{roughness:.35}),this.features);tube.userData.id=id;this.pickables.push(tube);this.mapObjects.set(id,tube);
   // A slightly wider translucent ribbon makes the real learning target easier to click.
   const hit=this.mesh(new THREE.TubeGeometry(curve,80,.25,4,false),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),this.features);hit.userData.id=id;hit.castShadow=false;hit.receiveShadow=false;this.pickables.push(hit);
  });
 }
 markerY(place){if(place.category==='mountain')return 3.8;if(place.id==='plateau-qinghai')return 3.2;if(place.category==='plateau'||place.category==='basin')return 2.3;return 1.35;}
 buildMarkers(){
  this.markerGroup=new THREE.Group();this.scene.add(this.markerGroup);
  for(const p of DATA.places){const cat=DATA.categories.find(c=>c.id===p.category);const group=new THREE.Group();group.position.copy(geoPoint(...p.coord,this.markerY(p)));this.markerGroup.add(group);
   const stick=this.mesh(new THREE.CylinderGeometry(.026,.026,.45,6),this.material(0xfffdf0),group,V(0,.2,0));
   const ball=this.mesh(new THREE.SphereGeometry(.16,12,8),this.material(cat.color),group,V(0,.5,0));const outline=this.mesh(new THREE.TorusGeometry(.16,.035,6,18),this.material(0xffffff),group,V(0,.5,0));outline.rotation.x=-.25;
   const hit=this.mesh(new THREE.SphereGeometry(.48,8,6),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),group,V(0,.35,0));hit.userData.id=p.id;hit.castShadow=false;this.pickables.push(hit);this.markers.set(p.id,group);
   const label=document.createElement('button');label.type='button';label.className='map-label';label.textContent=p.name;label.setAttribute('aria-label','飞往'+p.name);label.onclick=e=>{e.stopPropagation();if(!this.paused)this.events.onPick(p);};document.getElementById('map-labels').append(label);this.labels.set(p.id,label);
  }
  this.selectionRing=this.mesh(new THREE.TorusGeometry(.65,.055,8,48),this.material(0xffd66d,{emissive:0xe4a93c,emissiveIntensity:.3}),this.scene);this.selectionRing.rotation.x=Math.PI/2;this.selectionRing.visible=false;
  this.setCategory('all');
 }
 buildClouds(){
  const cloudMat=this.material(0xffffff,{transparent:true,opacity:.82,depthWrite:false});const clouds=[[-38,5,-19,1.9],[33,4,-12,2.2],[-29,3,21,1.5],[18,4,24,1.9],[29,3,6,1.2],[-13,3,-28,1.5]];
  clouds.forEach(([x,y,z,s],i)=>{const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);for(const [dx,dy,dz,r]of[[-.7,0,0,.8],[.1,.24,0,1.05],[.95,-.1,.1,.68],[.3,-.23,.2,.85]]){const m=this.mesh(new THREE.SphereGeometry(r,12,8),cloudMat,g,V(dx,dy,dz),[1,.62,1]);m.castShadow=false;}this.scene.add(g);this.clouds.push({group:g,x,phase:i});});
 }
 createPlane(id){
  if(this.plane){this.scene.remove(this.plane);this.plane.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});}
  const config=planeInfo.find(x=>x.id===id)||planeInfo[0];this.planeType=config;const group=new THREE.Group(),model=new THREE.Group();group.add(model);this.scene.add(group);this.plane=group;this.planeModel=model;const body=this.material(config.color),cream=this.material(0xfff4d7),glass=this.material(0x71c3d0,{roughness:.18,metalness:.15}),dark=this.material(0x456c66);
  const fuselage=this.mesh(new THREE.SphereGeometry(1,20,12),body,model,V(0,0,0),[.4,.38,1.25]);const nose=this.mesh(new THREE.SphereGeometry(1,16,10),cream,model,V(0,0,-.83),[.4,.37,.52]);this.mesh(new THREE.SphereGeometry(1,16,10),glass,model,V(0,.26,-.16),[.29,.25,.44]);
  const wing=this.mesh(new THREE.BoxGeometry(id==='jet'?3.0:3.7,.09,.5),cream,model,V(0,0,-.1));wing.geometry.translate(0,0,0);
  if(id==='jet'){wing.rotation.y=.15;for(const sx of[-.8,.8])this.mesh(new THREE.CylinderGeometry(.17,.15,.7,12),body,model,V(sx,-.1,.25)).rotation.x=Math.PI/2;}
  if(id==='sun'){this.mesh(new THREE.BoxGeometry(3.4,.08,.48),cream,model,V(0,.65,-.1));for(const x of[-1.25,1.25])this.mesh(new THREE.CylinderGeometry(.025,.025,.65,6),body,model,V(x,.32,-.1));}
  this.mesh(new THREE.BoxGeometry(1.35,.08,.34),body,model,V(0,.12,.87));const fin=this.mesh(new THREE.BoxGeometry(.07,.62,.43),cream,model,V(0,.35,.87));fin.rotation.x=.25;
  const prop=new THREE.Group();prop.position.z=-1.35;model.add(prop);this.mesh(new THREE.BoxGeometry(.08,1.22,.045),dark,prop);this.mesh(new THREE.SphereGeometry(.105,10,8),cream,prop,V(0,0,-.07));prop.visible=id!=='jet';this.propeller=prop;
  for(const x of[-1,1])this.mesh(new THREE.BoxGeometry(.24,.012,.46),body,model,V(x,.054,-.1));
  const oldPos=this.lastPlanePosition||geoPoint(104.2,33,7);group.position.copy(oldPos);group.scale.setScalar(.85);
  if(!this.trail){this.trailPositions=new Float32Array(90*3);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(this.trailPositions,3));this.trail=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xfffef1,transparent:true,opacity:.7}));this.trail.frustumCulled=false;this.scene.add(this.trail);this.trailPoints=[];}
 }
 setPlane(id){this.lastPlanePosition=this.plane.position.clone();const h=this.plane.rotation.y;this.createPlane(id);this.plane.rotation.y=h;}
 select(id){this.selected=id;for(const m of this.provinceMeshes){const mat=m.material[0];mat.color.copy(mat.userData.original);if(m.userData.id===id)mat.color.lerp(new THREE.Color(0xf9dc78),.65);}
  this.labels.forEach((el,key)=>el.classList.toggle('selected',key===id));const p=DATA.places.find(p=>p.id===id);if(p){this.selectionRing.position.copy(geoPoint(...p.coord,1.12));this.selectionRing.visible=true;this.selectionRing.position.y=p.category==='mountain'?1.5:1.12;}
  this.setCategory(this.category);
 }
 setLearned(ids){this.labels.forEach((el,key)=>el.classList.toggle('learned',ids.includes(key)));}
 setCategory(cat){this.category=cat;const recommended=new Set(['plateau-qinghai','mountain-himalaya','mountain-tianshan','basin-tarim','river-yangtze','river-yellow','plain-northeast','lake-qinghai','province-110000','province-650000','province-540000','province-310000','province-440000','province-710000','province-460000']);this.visiblePlaces=DATA.places.filter(p=>p.id===this.selected||(cat==='all'?recommended.has(p.id):p.category===cat));const ids=new Set(this.visiblePlaces.map(p=>p.id));this.markers.forEach((m,id)=>m.visible=ids.has(id));this.labels.forEach((el,id)=>el.hidden=!ids.has(id)||!this.labelsOn);}
 setLabels(on){this.labelsOn=on;this.setCategory(this.category);}
 setFlat(flat){this.flat=flat;this.pitchGoal=flat?Math.PI/2-.02:1.08;this.yaw=flat?0:this.yaw;}
 reset(){this.yaw=-.08;this.pitchGoal=1.08;this.flat=false;this.wantedZoom=1;this.wantedTarget.set(1,0,1.5);}
 flyTo(place){this.manual=false;this.keys.clear();this.select(place.id);const end=geoPoint(...place.coord,6.3),start=this.plane.position.clone();const dist=start.distanceTo(end);this.flight={place,start,end,time:0,duration:clamp(dist/this.planeType.speed,1.3,5.5)};this.trailPoints=[];this.events.onFlight?.(place);this.wantedTarget.set(1,0,1.5);this.wantedZoom=Math.min(this.wantedZoom,1.3);}
 cancelFlight(){this.flight=null;this.events.onCancel?.();}
 setManual(on){this.manual=on;this.flight=null;this.keys.clear();this.events.onManual?.(on);}
 setPaused(on){this.paused=on;this.keys.clear();}
 createInset(){const c=document.createElement('canvas');c.width=220;c.height=280;c.className='south-inset';c.setAttribute('aria-label','南海诸岛位置示意');Object.assign(c.style,{position:'absolute',right:'19px',top:'43%',width:'78px',height:'99px',opacity:'.8',pointerEvents:'none',border:'1px solid #80b4b5',borderRadius:'7px',background:'#d8eeeaaa'});this.canvas.parentElement.append(c);const ctx=c.getContext('2d');ctx.strokeStyle='#88aa89';ctx.fillStyle='#abc593';ctx.lineWidth=1.5;const pt=([lon,lat])=>[(lon-105)*12+12,(23-lat)*12+9];for(const f of GEO.features)for(const poly of this.polygonList(f)){if(!poly[0].some(c=>c[1]<18))continue;ctx.beginPath();for(const ring of poly){ring.forEach((p,i)=>{const [x,y]=pt(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();}ctx.fill();ctx.stroke();}ctx.fillStyle='#567f79';ctx.font='17px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.fillText('南海诸岛',110,266);this.inset=c;}
 createEvents(){
  this.abort=new AbortController();const signal=this.abort.signal;const on=(target,type,fn,opts={})=>target.addEventListener(type,fn,{...opts,signal});let pointers=new Map(),last=null,start=null,moved=false,pinch=0;
  on(this.canvas,'pointerdown',e=>{this.canvas.focus({preventScroll:true});this.canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);last=[e.clientX,e.clientY];start=last;moved=false;if(pointers.size===2){const a=[...pointers.values()];pinch=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);}});
  on(this.canvas,'pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pinch>0)this.wantedZoom=clamp(this.wantedZoom*d/pinch,.75,3.6);pinch=d;moved=true;return;}if(last){const dx=e.clientX-last[0],dy=e.clientY-last[1];if(e.shiftKey||e.buttons===2){const rate=.09/this.zoom;this.wantedTarget.x-=dx*rate;this.wantedTarget.z-=dy*rate;}else{this.yaw-=dx*.004;this.pitch=clamp(this.pitch+dy*.003,.6,Math.PI/2-.02);this.pitchGoal=null;this.flat=false;}if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)moved=true;last=[e.clientX,e.clientY];}});
  on(this.canvas,'pointerup',e=>{pointers.delete(e.pointerId);if(!moved&&start)this.pick(e);last=null;start=null;});on(this.canvas,'pointercancel',()=>{pointers.clear();last=null;start=null});on(this.canvas,'contextmenu',e=>e.preventDefault());
  on(this.canvas,'wheel',e=>{e.preventDefault();this.wantedZoom=clamp(this.wantedZoom*Math.exp(-e.deltaY*.001),.75,3.6);},{passive:false});
  on(window,'keydown',e=>{if(!this.manual||document.querySelector('dialog[open]')||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName))return;const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)){e.preventDefault();this.keys.add(key);}});on(window,'keyup',e=>this.keys.delete(e.key.toLowerCase()));on(window,'blur',()=>this.keys.clear());on(document,'visibilitychange',()=>{this.keys.clear();this.last=performance.now();});
  on(this.canvas,'webglcontextlost',e=>{e.preventDefault();this.contextLost=true;this.events.onError?.();});on(this.canvas,'webglcontextrestored',()=>{this.contextLost=false;this.events.onRestore?.();});
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.canvas.parentElement);
 }
 pick(e){if(this.paused)return;const r=this.canvas.getBoundingClientRect(),point=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(point,this.camera);
  // The large marker targets also make small regions such as Hong Kong and Macao selectable.
  let nearest=null,dist=25;for(const p of this.visiblePlaces){const v=geoPoint(...p.coord,this.markerY(p)+.5).project(this.camera);const x=(v.x+1)/2*r.width,y=(1-v.y)/2*r.height;const d=Math.hypot(e.clientX-r.left-x,e.clientY-r.top-y);if(d<dist){nearest=p;dist=d;}}if(nearest){this.events.onPick(nearest);return;}
  const hits=ray.intersectObjects(this.pickables,false).filter(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});const h=hits[0];if(h?.object.userData.id){const p=DATA.places.find(p=>p.id===h.object.userData.id);if(p)this.events.onPick(p);}
 }
 resize(){const r=this.canvas.parentElement.getBoundingClientRect();this.width=Math.max(r.width,1);this.height=Math.max(r.height,1);this.renderer.setSize(this.width,this.height,false);const aspect=this.width/this.height;this.frustum=Math.max(52,75/aspect);this.camera.left=-this.frustum*aspect/2;this.camera.right=this.frustum*aspect/2;this.camera.top=this.frustum/2;this.camera.bottom=-this.frustum/2;this.camera.updateProjectionMatrix();if(this.inset)this.inset.style.display=this.width<500?'none':'';}
 updateLabels(now){if(now-(this.labelTime||0)<60)return;this.labelTime=now;const occupied=[];const ordered=[...this.visiblePlaces].sort((a,b)=>(b.id===this.selected?1:0)-(a.id===this.selected?1:0));const cardOpen=!document.getElementById('discovery-card').hidden;
  for(const p of ordered){const el=this.labels.get(p.id);if(!this.labelsOn){el.hidden=true;continue;}const v=geoPoint(...p.coord,this.markerY(p)+.8).project(this.camera);const x=(v.x+1)/2*this.width,y=(1-v.y)/2*this.height;const w=p.name.length*13+20,h=27;let hide=v.z>1||x<20||x>this.width-20||y<85||y>this.height-100;if(cardOpen&&this.width>650&&x>this.width-335&&y<400&&p.id!==this.selected)hide=true;if(!hide&&p.id!==this.selected)hide=occupied.some(o=>Math.abs(x-o.x)<(w+o.w)/2+5&&Math.abs(y-o.y)<h+7);el.hidden=hide;if(!hide){el.style.left=x+'px';el.style.top=y+'px';occupied.push({x,y,w});}}
  const compass=document.querySelector('.compass svg');if(compass)compass.style.transform=`rotate(${Math.atan2(Math.sin(this.yaw),Math.cos(this.yaw)*Math.sin(this.pitch))*180/Math.PI}deg)`;
  for(const [selector,coord] of [['.east-sea',[127.5,27]],['.south-sea',[115,18.5]]]){const e=document.querySelector(selector),v=geoPoint(...coord,0).project(this.camera);if(e){e.style.left=(v.x+1)/2*this.width+'px';e.style.top=(1-v.y)/2*this.height+'px';e.style.right='auto';e.style.bottom='auto';}}
 }
 animate(now){if(this.disposed)return;this.raf=requestAnimationFrame(this.animate);const dt=Math.min((now-this.last)/1000,.06);this.last=now;if(document.hidden||this.contextLost)return;this.zoom+=(this.wantedZoom-this.zoom)*Math.min(dt*7,1);this.target.lerp(this.wantedTarget,Math.min(dt*5,1));if(this.pitchGoal!=null)this.pitch+=(this.pitchGoal-this.pitch)*Math.min(dt*7,1);this.camera.position.set(this.target.x+Math.sin(this.yaw)*Math.cos(this.pitch)*95,Math.sin(this.pitch)*95,this.target.z+Math.cos(this.yaw)*Math.cos(this.pitch)*95);this.camera.lookAt(this.target);this.camera.zoom=this.zoom;this.camera.updateProjectionMatrix();
  if(!this.paused){this.propeller.rotation.z+=dt*35;this.planeModel.position.y=Math.sin(now*.003)*.065;let flying=false;
   if(this.flight){const f=this.flight;f.time+=dt;const t=clamp(f.time/f.duration,0,1),ease=t*t*(3-2*t);this.plane.position.lerpVectors(f.start,f.end,ease);this.plane.position.y+=Math.sin(t*Math.PI)*3;const d=f.end.clone().sub(f.start);this.plane.rotation.y=Math.atan2(-d.x,-d.z);this.planeModel.rotation.z=Math.sin(t*Math.PI*2)*.15;flying=true;if(t>=1){this.flight=null;this.arrivalCooldown.set(f.place.id,now+12000);this.events.onArrive?.(f.place);}}
   if(this.manual){const dx=(this.keys.has('arrowright')||this.keys.has('d')?1:0)-(this.keys.has('arrowleft')||this.keys.has('a')?1:0),dz=(this.keys.has('arrowdown')||this.keys.has('s')?1:0)-(this.keys.has('arrowup')||this.keys.has('w')?1:0);if(dx||dz){const v=V(dx,0,dz).normalize();this.plane.position.addScaledVector(v,dt*this.planeType.speed*.7);this.plane.position.x=clamp(this.plane.position.x,-36,36);this.plane.position.z=clamp(this.plane.position.z,-27,24);this.plane.position.y=7;this.plane.rotation.y=Math.atan2(-v.x,-v.z);this.planeModel.rotation.z=-dx*.15;flying=true;let nearest=null,distance=1.2;for(const p of DATA.places){const target=geoPoint(...p.coord);const d=Math.hypot(target.x-this.plane.position.x,target.z-this.plane.position.z);if(d<distance&&now>(this.arrivalCooldown.get(p.id)||0)){nearest=p;distance=d;}}if(nearest){this.arrivalCooldown.set(nearest.id,now+15000);this.keys.clear();this.events.onArrive?.(nearest);}}else this.planeModel.rotation.z*=.9;}
   if(flying){if(now-(this.lastTrail||0)>45){this.lastTrail=now;this.trailPoints.push(this.plane.position.clone());if(this.trailPoints.length>90)this.trailPoints.shift();for(let i=0;i<90;i++){const p=this.trailPoints[Math.max(0,this.trailPoints.length-1-i)]||this.plane.position;this.trailPositions[i*3]=p.x;this.trailPositions[i*3+1]=p.y;this.trailPositions[i*3+2]=p.z;}this.trail.geometry.attributes.position.needsUpdate=true;this.trail.geometry.setDrawRange(0,this.trailPoints.length);}}
   this.clouds.forEach(c=>{c.group.position.x=c.x+Math.sin(now*.00012+c.phase)*.7;});
  }
  if(this.selectionRing.visible){this.selectionRing.scale.setScalar(1+Math.sin(now*.004)*.13);this.selectionRing.material.emissiveIntensity=.3+Math.sin(now*.003)*.12;}
  this.scene.updateMatrixWorld();this.camera.updateMatrixWorld();this.updateLabels(now);this.renderer.render(this.scene,this.camera);
 }
 dispose(){this.disposed=true;cancelAnimationFrame(this.raf);this.abort.abort();this.observer.disconnect();this.scene.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose()});this.renderer.dispose();this.inset?.remove();document.getElementById('map-labels').replaceChildren();}
}
