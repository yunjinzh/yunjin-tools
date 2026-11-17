/* Three.js world: functional terrain, actors, gates, routes and guard perception. */
(function(root){
 'use strict';
 const T=root.THREE;
 const C={own:0x2d7086,enemy:0xad483b,neutral:0xc3a267,stone:0x9da28e,roof:0x414b44,wood:0x735d43,grass:0x78866c,gold:0xdfbd70};
 const nodePos=n=>root.StratagemGameTypes.pos(n);
 class StratagemThreeScene{
  constructor(container,game,callbacks={}){
   if(!T?.WebGLRenderer)throw new Error('三维引擎没有加载');this.el=container;this.game=game;this.callbacks=callbacks;this.pickables=[];this.unitMeshes=new Map();this.nodeMeshes=new Map();this.labels=new Map();this.clock=new T.Clock();this.disposed=false;this.ray=new T.Raycaster();this.pointer=new T.Vector2();this.down=null;this.dragging=false;this.navigation=false;this.view='perspective';this.lastHud=0;this.reducedMotion=root.matchMedia?.('(prefers-reduced-motion:reduce)').matches||false;
   this.renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.2;
   this.canvas=this.renderer.domElement;this.canvas.className='world-canvas';this.canvas.setAttribute('aria-label','三维局势沙盘，可旋转、缩放与操作队伍');this.canvas.tabIndex=0;container.prepend(this.canvas);
   this.scene=new T.Scene();this.scene.background=new T.Color(0xaebdb8);this.scene.fog=new T.Fog(0xaebdb8,70,145);
   this.camera=new T.PerspectiveCamera(43,1,.1,320);this.controls=new T.OrbitControls(this.camera,this.canvas);this.controls.enableDamping=true;this.controls.dampingFactor=.08;this.controls.minDistance=24;this.controls.maxDistance=190;this.controls.maxPolarAngle=Math.PI*.47;this.controls.minPolarAngle=.15;this.controls.target.set(0,0,0);this.controls.mouseButtons={LEFT:T.MOUSE.ROTATE,MIDDLE:T.MOUSE.DOLLY,RIGHT:T.MOUSE.PAN};
   const hemi=new T.HemisphereLight(0xf6eed6,0x495751,2.3);this.scene.add(hemi);const sun=new T.DirectionalLight(0xffe8bd,3);sun.position.set(-30,55,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-43,right:43,top:35,bottom:-35,near:1,far:130});sun.shadow.bias=-.0008;this.scene.add(sun);
   this.world=new T.Group();this.scene.add(this.world);this.routes=new T.Group();this.scene.add(this.routes);this.fx=new T.Group();this.scene.add(this.fx);this.ghost=this.ring(1.9,C.gold);this.ghost.visible=false;this.scene.add(this.ghost);this.planLine=null;
   this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();this.resetCamera();this.events();this.ready=true;container.classList.add('is-3d');
   this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();game.paused=true;this.callbacks.error?.('三维画面暂时中断，请刷新页面恢复。');});
   this.animate();
   document.fonts?.ready.then(()=>{if(!this.disposed)this.refreshLabels();});
  }
  material(color,extra={}){return new T.MeshStandardMaterial({color,roughness:.86,metalness:.05,...extra});}
  box(w,h,d,color,x=0,y=0,z=0){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),this.material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
  ring(radius,color){const ring=new T.Mesh(new T.RingGeometry(radius-.08,radius,48),new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:.95,depthWrite:false}));ring.rotation.x=-Math.PI/2;return ring;}
  riverCenter(){return this.game.s.id===1?6.4:0;}
  height(x,z){let y=.18*Math.sin(x*.22)*Math.cos(z*.3);if(this.game.biome==='river')return Math.abs(z-this.riverCenter())<6?-1:y;if(this.game.biome==='swamp')return y*.6-.15;
   const hills=this.game.biome==='mountain'?[[15,-12,6,10,8],[-23,-11,5,9,9],[28,14,3,8,7]]:[[28,-17,4,8,7],[-29,-16,5,8,8],[30,18,2.5,7,6]];
   for(const [cx,cz,h,rx,rz]of hills)y+=h*Math.exp(-((x-cx)**2/rx**2+(z-cz)**2/rz**2)*2.2);return y;
  }
  floorY(x,z){return this.game.biome==='river'&&Math.abs(z-this.riverCenter())<6?.30:Math.max(this.game.biome==='swamp'?.18:-2,this.height(x,z));}
  actor(color,boat=false){
   const group=new T.Group();
   if(boat){
    const shape=new T.Shape();shape.moveTo(-.9,-2);shape.lineTo(.9,-2);shape.lineTo(1.25,.5);shape.lineTo(0,2.8);shape.lineTo(-1.25,.5);shape.closePath();const hull=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:true,bevelSize:.15,bevelThickness:.15,bevelSegments:1}),this.material(C.wood));hull.rotation.x=-Math.PI/2;hull.position.y=.2;hull.castShadow=true;group.add(hull);group.add(this.box(.10,4,.10,C.wood,0,2,0));const sail=new T.Mesh(new T.PlaneGeometry(2.3,3.1),this.material(0xeae1c5,{side:T.DoubleSide}));sail.position.set(.06,2.5,0);group.add(sail);const mark=new T.Mesh(new T.CircleGeometry(.37,16),this.material(color,{side:T.DoubleSide}));mark.position.set(.08,2.6,.015);group.add(mark);for(let i=0;i<3;i++)group.add(this.box(.5,.5,.5,C.gold,(i-1)*.55,.8,-.9));
   }else{
    for(let i=0;i<4;i++){const person=new T.Group();person.position.set((i%2-.5)*.9,0,(Math.floor(i/2)-.5)*.95);person.add(this.box(.35,.7,.25,C.roof,0,.55,0));const body=new T.Mesh(new T.CylinderGeometry(.30,.40,.8,6),this.material(color));body.position.y=1;body.castShadow=true;person.add(body);const head=new T.Mesh(new T.SphereGeometry(.22,8,6),this.material(0xc7b497));head.position.y=1.68;person.add(head);const helmet=new T.Mesh(new T.ConeGeometry(.31,.28,8),this.material(C.roof));helmet.position.y=1.91;person.add(helmet);person.add(this.box(.06,2.2,.06,C.wood,.42,1.1,0));const shield=new T.Mesh(new T.CylinderGeometry(.36,.36,.08,8),this.material(color));shield.rotation.x=Math.PI/2;shield.position.set(-.20,1,.30);person.add(shield);group.add(person);}
    group.add(this.box(.09,3.6,.09,C.wood,0,1.8,-.5));const flag=new T.Mesh(new T.PlaneGeometry(1.3,.85),this.material(color,{side:T.DoubleSide}));flag.position.set(.65,3.15,-.5);group.add(flag);
   }
   group.userData.actor=true;return group;
  }
  flag(color){const group=new T.Group();group.add(this.box(.07,2.7,.07,C.wood,0,1.35,0));const flag=new T.Mesh(new T.PlaneGeometry(1.4,.8),this.material(color,{side:T.DoubleSide}));flag.position.set(.7,2.25,0);group.add(flag);return group;}
  station(n){
   const group=new T.Group(),color=C[n.team]||C.neutral;const fort=/城门|后方|阵地|指挥|核心能力|高位/.test(n.label)||(['enemy','roof'].includes(n.id)&&this.game.biome==='fort');
   if(fort){
    group.add(this.box(4,.55,4,0x8b8e7a,0,.18,0));for(const x of [-1.7,1.7])for(const z of [-1.7,1.7]){group.add(this.box(.8,2.2,.8,C.stone,x,1.1,z));const roof=new T.Mesh(new T.ConeGeometry(.8,.85,4),this.material(C.roof));roof.rotation.y=Math.PI/4;roof.position.set(x,2.5,z);roof.castShadow=true;group.add(roof);}
    group.add(this.box(3.2,1.5,.4,C.stone,0,.9,-1.7));group.add(this.box(.4,1.5,3.2,C.stone,-1.7,.9,0));group.add(this.box(.4,1.5,3.2,C.stone,1.7,.9,0));group.add(this.box(1.1,1.5,.4,C.stone,-1.1,.9,1.7));group.add(this.box(1.1,1.5,.4,C.stone,1.1,.9,1.7));const door=this.box(1.1,1.2,.18,C.wood,0,.7,1.72);door.userData.door=true;group.add(door);
   }else if(['a','b'].includes(n.id)&&this.game.s.id===22){
    group.add(this.box(5.5,.35,3.5,C.stone,0,.1,0));group.add(this.box(.65,3,.65,C.stone,-2,1.5,0));group.add(this.box(.65,3,.65,C.stone,2,1.5,0));group.add(this.box(4.8,.5,.8,C.roof,0,3,0));const door=this.box(3.2,2.5,.3,C.wood,0,1.4,0);door.userData.door=true;group.add(door);
   }else if(/资源|补给|筹码|支撑/.test(n.label)){
    group.add(this.box(3,.25,3,C.wood,0,.1,0));for(let i=0;i<6;i++)group.add(this.box(.75,.7,.75,i%2?C.gold:C.wood,(i%3-1)*.85,.6+(i>2?.6:0),(Math.floor(i/3)-.5)*.85));
   }else if(/连接|通道|航线|接触点|位置/.test(n.label)){
    const platform=new T.Mesh(new T.CylinderGeometry(1.9,2,.22,12),this.material(0xb9b49a));platform.position.y=.1;platform.receiveShadow=true;group.add(platform);
   }else if(this.game.s.id===35&&['a','b','c'].includes(n.id)){
    const gear=new T.Mesh(new T.TorusGeometry(1.15,.26,6,12),this.material(C.gold));gear.rotation.x=Math.PI/2;gear.position.y=.4;group.add(gear);for(let i=0;i<8;i++){const tooth=this.box(.55,.35,.50,C.gold,Math.cos(i*Math.PI/4)*1.2,.4,Math.sin(i*Math.PI/4)*1.2);tooth.rotation.y=-i*Math.PI/4;group.add(tooth);}
   }else{
    const tent=new T.Mesh(new T.ConeGeometry(1.8,2.1,4),this.material(0xc6b895));tent.rotation.y=Math.PI/4;tent.position.y=1;tent.castShadow=true;group.add(tent);group.add(this.box(2.6,.14,2.6,C.wood,0,.1,0));
   }
   const flag=this.flag(color);flag.position.set(2,0,-.5);group.add(flag);const ring=this.ring(2.25,color);ring.position.y=.14;group.add(ring);group.userData.nodeId=n.id;group.userData.ring=ring;group.userData.flag=flag;group.traverse(obj=>{obj.userData.nodeId=n.id;});return group;
  }
  label(text,color='#253e39'){
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=100;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,100);ctx.fillStyle='rgba(245,237,214,.93)';ctx.beginPath();ctx.roundRect(14,13,484,70,5);ctx.fill();ctx.strokeStyle='rgba(105,96,70,.50)';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=color;ctx.font='500 31px "Stratagem Serif SC", "Microsoft YaHei", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,49,464);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(8.8,1.72,1);sprite.renderOrder=8;return sprite;
  }
  refreshLabels(){for(const [id,sprite]of this.labels){const node=this.game.nodes.get(id);if(!node)continue;const replacement=this.label(node.label,node.team==='enemy'?'#913d32':node.team==='own'?'#24566a':'#5f543b');replacement.position.copy(sprite.position);sprite.parent.add(replacement);sprite.parent.remove(sprite);sprite.material.map.dispose();sprite.material.dispose();this.labels.set(id,replacement);}}
  clear(group){const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});for(const g of geometries)g.dispose();for(const m of materials){m.map?.dispose();m.dispose();}group.clear();}
  load(s,state){
   this.clear(this.world);this.clear(this.routes);this.clear(this.fx);this.pickables=[];this.unitMeshes.clear();this.nodeMeshes.clear();this.labels.clear();this.lastState='';this.deploymentCount=0;this.water=null;this.ladder=null;this.selectedRing=null;this.supplyMarkers=[];this.resourcePiles=null;this.showFlags=null;
   const terrain=new T.PlaneGeometry(66,44,66,44);terrain.rotateX(-Math.PI/2);const points=terrain.attributes.position,colors=[];for(let i=0;i<points.count;i++){const x=points.getX(i),z=points.getZ(i),h=this.height(x,z);points.setY(i,h);const color=new T.Color(this.game.biome==='swamp'?0x697c69:C.grass);color.lerp(new T.Color(0xb6b39a),Math.min(1,Math.max(0,h)/7));color.multiplyScalar(1+.06*Math.sin(x*1.6+z*1.3));colors.push(color.r,color.g,color.b);}terrain.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();const ground=new T.Mesh(terrain,this.material(0xffffff,{vertexColors:true,flatShading:true}));ground.receiveShadow=true;ground.userData.ground=true;this.world.add(ground);this.ground=ground;
   const base=this.box(66,2,44,0x3b4942,0,-1.5,0);base.receiveShadow=true;this.world.add(base);const edge=this.box(67,.35,45,0x8c8063,0,-2.5,0);this.world.add(edge);
   if(['river','swamp'].includes(this.game.biome)){
    const waterGeo=new T.PlaneGeometry(65,this.game.biome==='river'?12:40,40,16);waterGeo.rotateX(-Math.PI/2);const water=new T.Mesh(waterGeo,this.material(0x3f7f82,{transparent:true,opacity:this.game.biome==='river'?.88:.3,roughness:.24,metalness:.26}));water.position.y=this.game.biome==='river'?.12:.02;water.position.z=this.game.biome==='river'?this.riverCenter():0;water.receiveShadow=true;this.world.add(water);this.water=water;
   }
   // Mountains and groves are part of the navigable terrain; units follow floor height.
   for(let i=0;i<55;i++){const x=-31+(i*17.31)%62,z=i%2?-18.5-(i%3)*.6:17.8+(i%4)*.4;if(this.game.biome==='river'&&Math.abs(z)<6)continue;const h=this.floorY(x,z),tree=new T.Group();tree.add(this.box(.15,1.1,.15,C.wood,0,.55,0));const crown=new T.Mesh(new T.ConeGeometry(.75+(i%3)*.16,2.4,5),this.material(i%2?0x475e50:0x60735a));crown.position.y=1.8;crown.castShadow=true;tree.add(crown);tree.position.set(x,h,z);this.world.add(tree);}
   for(const n of state.nodes){if(n.id==='own')continue;const p=nodePos(n),station=this.station(n);station.position.set(p.x,this.floorY(p.x,p.z),p.z);this.world.add(station);this.nodeMeshes.set(n.id,station);this.pickables.push(station);const label=this.label(n.label,n.team==='enemy'?'#913d32':n.team==='own'?'#24566a':'#5f543b');label.position.set(p.x,this.floorY(p.x,p.z)+4.5,p.z);this.world.add(label);this.labels.set(n.id,label);}
   const boat=s.id===1||this.game.biome==='river'&&[9,35].includes(s.id);this.playerMesh=this.actor(C.own,boat);this.playerMesh.userData.nodeId='own';this.playerMesh.traverse(o=>{o.userData.nodeId='own';});this.world.add(this.playerMesh);this.pickables.push(this.playerMesh);this.selectedRing=this.ring(2.3,C.gold);this.world.add(this.selectedRing);
   const ownLabel=this.label('我方 · '+(s.nodes.find(n=>n.id==='own')?.label||'队伍'),'#24566a');this.world.add(ownLabel);this.labels.set('own',ownLabel);
   this.actionPulse=this.ring(1.5,C.gold);this.actionPulse.visible=false;this.world.add(this.actionPulse);
   for(const guard of this.game.guards)this.addGuard(guard);
   if(s.id===11){this.resourcePiles={};for(const id of ['core','outer']){const p=this.game.nodes.get(id),pile=[];for(let i=0;i<10;i++){const block=this.box(.55,.55,.55,C.gold,p.x+(i%5-2)*.65,this.floorY(p.x,p.z)+.35+Math.floor(i/5)*.6,p.z+3);this.world.add(block);pile.push(block);}this.resourcePiles[id]=pile;}}
   if(s.id===19){for(let i=0;i<6;i++){const marker=new T.Mesh(new T.SphereGeometry(.2,7,6),new T.MeshBasicMaterial({color:C.gold}));this.world.add(marker);this.supplyMarkers.push(marker);}const p=this.game.nodes.get('enemy');this.supplyBar=this.box(4,.25,.35,C.gold,p.x,this.floorY(p.x,p.z)+3.5,p.z);this.world.add(this.supplyBar);}
   if(s.id===13){for(const id of ['a','b','c']){const p=this.game.nodes.get(id);for(let i=0;i<12;i++){const grass=new T.Mesh(new T.ConeGeometry(.2,.9,3),this.material(0x516744));grass.position.set(p.x+Math.sin(i*2)*2.2,this.floorY(p.x,p.z)+.4,p.z+Math.cos(i*2)*2.2);this.world.add(grass);}}}
   if(s.id===29){this.showFlags=[];const p=this.game.nodes.get('show');for(let i=0;i<10;i++){const flag=this.flag(C.gold);flag.position.set(p.x+(i%5-2)*1.3,this.floorY(p.x,p.z),p.z+(Math.floor(i/5)-.5)*2.2);this.world.add(flag);this.showFlags.push(flag);}}
   this.rearMesh=null;if(this.game.rear){this.rearMesh=this.actor(0x6c93a0,false);this.rearMesh.scale.setScalar(.7);this.world.add(this.rearMesh);}
   if(s.id===28){const a=this.game.nodes.get('ladder'),b=this.game.nodes.get('roof'),start=new T.Vector3(a.x,this.floorY(a.x,a.z)+.3,a.z),end=new T.Vector3(b.x,this.floorY(b.x,b.z)+2,b.z),direction=end.clone().sub(start),length=direction.length();this.ladder=new T.Group();for(const x of [-.5,.5])this.ladder.add(this.box(.13,length,.13,C.wood,x,0,0));for(let y=-length/2;y<length/2;y+=.6)this.ladder.add(this.box(1.1,.1,.15,C.wood,0,y,0));this.ladder.position.copy(start.clone().add(end).multiplyScalar(.5));this.ladder.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());this.world.add(this.ladder);}
   this.navigation=false;this.ghost.visible=false;this.resetCamera();this.update(state);this.callbacks.loaded?.();
  }
  addGuard(g){if(this.unitMeshes.has(g.id))return;const actor=this.actor(C.enemy,false);actor.userData.nodeId=g.id;actor.traverse(o=>{o.userData.nodeId=g.id;});this.world.add(actor);const coneGeometry=new T.CircleGeometry(7,36,-.65,1.3);const cone=new T.Mesh(coneGeometry,new T.MeshBasicMaterial({color:C.enemy,transparent:true,opacity:.16,side:T.DoubleSide,depthWrite:false}));cone.rotation.x=-Math.PI/2;this.world.add(cone);this.unitMeshes.set(g.id,{actor,cone});}
  drawCurve(points,color,width=.045,dashed=false){if(points.length<2)return null;const raised=points.map(p=>new T.Vector3(p.x,this.floorY(p.x,p.z)+.34,p.z));const curve=new T.CatmullRomCurve3(raised,false,'centripetal');if(dashed){const geo=new T.BufferGeometry().setFromPoints(curve.getPoints(80));const line=new T.Line(geo,new T.LineDashedMaterial({color,dashSize:.4,gapSize:.3}));line.computeLineDistances();return line;}const line=new T.Mesh(new T.TubeGeometry(curve,Math.max(20,points.length*12),width,5,false),new T.MeshBasicMaterial({color}));return line;}
  update(state){
   if(!this.ready)return;const signature=JSON.stringify({phase:state.phase,nodes:state.nodes,paths:state.paths});if(signature!==this.lastState){
    this.lastState=signature;this.clear(this.routes);
    for(const n of state.nodes){if(n.id==='own')continue;let station=this.nodeMeshes.get(n.id);if(!station)continue;const p=nodePos(n);station.position.set(p.x,this.floorY(p.x,p.z),p.z);const label=this.labels.get(n.id);if(label)label.position.set(p.x,this.floorY(p.x,p.z)+4.5,p.z);station.userData.ring.material.color.setHex(C[n.team]||C.neutral);station.userData.flag.children.find(o=>o.geometry?.type==='PlaneGeometry')?.material.color.setHex(C[n.team]||C.neutral);}
    this.refreshLabels();
    const paths=state.paths.length?state.paths:(this.game.s.id===19?[{from:'supply',to:'link',kind:'enemy'},{from:'link',to:'enemy',kind:'enemy'}]:this.game.s.id===18?['a','b','c'].map(to=>({from:'king',to,kind:'enemy'})):[]);
    for(const path of paths){const a=this.game.nodes.get(path.from),b=this.game.nodes.get(path.to);if(!a||!b)continue;const line=this.drawCurve([a,b],path.kind==='enemy'?C.enemy:path.kind==='decoy'?C.gold:C.own,.05,path.kind==='hidden'||path.kind==='cut');if(line)this.routes.add(line);}
   }
   const task=this.game.s.steps[state.phase];for(const [id,node]of this.nodeMeshes){const available=!!task?.options.some(x=>x.node===id);node.userData.ring.material.opacity=available?1:.40;node.userData.ring.scale.setScalar(available?1.08:1);}
   this.drawPlan();
  }
  drawPlan(){if(this.planLine){this.scene.remove(this.planLine);this.planLine.geometry.dispose();this.planLine.material.dispose();this.planLine=null;}const points=this.game.planned.length?[this.game.player,...this.game.planned]:this.game.order?.route.length?[this.game.order.snapshot.player,...this.game.order.route]:[];if(points.length>1){this.planLine=this.drawCurve(points,C.gold,.07,true);this.scene.add(this.planLine);}}
  visuals(){
   const g=this.game,t=this.game.t,player=g.player;this.playerMesh?.position.set(player.x,this.floorY(player.x,player.z)+.2+(this.game.biome==='river'&&!this.reducedMotion?Math.sin(t*2)*.045:0),player.z);if(this.playerMesh)this.playerMesh.rotation.y=player.angle;
   if(this.selectedRing){this.selectedRing.position.set(player.x,this.floorY(player.x,player.z)+.16,player.z);this.selectedRing.visible=this.navigation||!!g.active;this.selectedRing.scale.setScalar(1+Math.sin(t*3)*.03);}
   if(this.rearMesh&&g.rear)this.rearMesh.position.set(g.rear.x,this.floorY(g.rear.x,g.rear.z)+.1,g.rear.z);
   const ownLabel=this.labels.get('own');if(ownLabel)ownLabel.position.set(player.x,this.floorY(player.x,player.z)+5,player.z);
   if(this.actionPulse){const order=g.order;this.actionPulse.visible=!!order&&!root.StratagemGameTypes.MOVING.has(order.kind);if(this.actionPulse.visible){this.actionPulse.position.set(order.target.x,this.floorY(order.target.x,order.target.z)+.25,order.target.z);this.actionPulse.scale.setScalar(order.kind==='probe'?1+(order.elapsed%1.5)*4:1.3+Math.sin(order.elapsed*4)*.2);this.actionPulse.material.opacity=order.kind==='probe'?Math.max(.1,1-order.elapsed/1.5):.65;}}
   if(this.showFlags){const amount=g.state.phase===0?0:g.state.phase===1?g.parameter:10-g.metrics.resource;this.showFlags.forEach((flag,i)=>flag.visible=i<amount);}
   if(g.s.id===21&&g.state.phase>0){const shell=this.nodeMeshes.get('shell');if(shell)shell.visible=g.flags.shell;}
   if(this.resourcePiles){const amount=g.state.phase===0?5:g.state.phase===1?g.parameter:(10-g.metrics.resource);for(const id of ['core','outer'])this.resourcePiles[id].forEach((block,i)=>block.visible=i<(id==='core'?amount:10-amount));}
   if(this.supplyMarkers.length){const a=g.nodes.get('supply'),b=g.nodes.get('link'),c=g.nodes.get('enemy');this.supplyMarkers.forEach((marker,i)=>{const progress=(t*.14+i/6)%1,start=progress<.5?a:b,end=progress<.5?b:c,ratio=(progress%.5)*2;marker.position.set(T.MathUtils.lerp(start.x,end.x,ratio),this.floorY(start.x,start.z)+.6,T.MathUtils.lerp(start.z,end.z,ratio));marker.visible=!g.flags.cut;});this.supplyBar.scale.x=Math.max(.02,g.metrics.supply/100);}
   const cameraRange=this.camera.position.distanceTo(this.controls.target);this.scene.fog.near=Math.max(40,cameraRange+15-(g.s.id===20?(g.parameter||0)*.6:0));this.scene.fog.far=cameraRange+90;
   for(const guard of g.guards){this.addGuard(guard);const {actor,cone}=this.unitMeshes.get(guard.id);actor.position.set(guard.x,this.floorY(guard.x,guard.z)+.15,guard.z);actor.rotation.y=guard.angle;const label=this.labels.get(guard.id);if(label)label.position.set(guard.x,this.floorY(guard.x,guard.z)+4.5,guard.z);cone.position.set(guard.x,this.floorY(guard.x,guard.z)+.06,guard.z);cone.rotation.z=guard.angle-Math.PI/2;cone.visible=!g.state.done&&guard.watch>0;cone.material.opacity=.08+guard.watch/100*.10;}
   for(const [id,station]of this.nodeMeshes){station.traverse(obj=>{if(obj.userData.door){let closed=true;if(g.s.id===22)closed=id==='a'?g.flags.closedA:g.flags.closedB;if(g.s.id===32)closed=g.state.phase<2;obj.scale.y=T.MathUtils.lerp(obj.scale.y,closed?1:.06,.15);}if(g.s.id===35&&obj.geometry?.type==='TorusGeometry'&&(id==='a'?g.flags.firstRing:id==='b'?g.flags.secondRing:g.state.done))obj.rotation.z+=.025;});}
   if(this.ladder)this.ladder.visible=!g.flags.ladderRemoved;
   if(this.water&&!this.reducedMotion){const p=this.water.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.sin(p.getX(i)*.35+t*1.1)*.07+Math.cos(p.getZ(i)*.7+t*.8)*.04);p.needsUpdate=true;}
   while(this.deploymentCount<g.deployments.length){const d=g.deployments[this.deploymentCount++],deployed=this.flag(d.valid?C.gold:C.enemy);deployed.position.set(d.x,this.floorY(d.x,d.z)+.1,d.z);this.fx.add(deployed);const circle=this.ring(2.1,d.valid?C.gold:C.enemy);circle.position.set(d.x,this.floorY(d.x,d.z)+.15,d.z);this.fx.add(circle);}
  }
  pointerRay(event){const r=this.canvas.getBoundingClientRect();this.pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);return this.ray;}
  pick(event){const ray=this.pointerRay(event),hits=ray.intersectObjects(this.pickables,true);return hits[0]?.object.userData.nodeId||null;}
  point(event){const ray=this.pointerRay(event);const hit=ray.intersectObject(this.ground,false)[0];if(hit)return {x:hit.point.x,z:hit.point.z};const p=new T.Vector3();if(ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),0),p))return {x:p.x,z:p.z};return null;}
  events(){
   this.canvas.addEventListener('contextmenu',e=>e.preventDefault());
   this.canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;const id=this.pick(e),info=this.game.info();this.down={x:e.clientX,y:e.clientY,id,point:this.point(e),placement:info.placing&&!!this.game.active,connection:info.kind==='connect'&&!!id};this.dragging=false;if(id==='own'||this.down.placement||this.down.connection){this.controls.enabled=false;this.canvas.setPointerCapture(e.pointerId);}},true);
   this.canvas.addEventListener('pointermove',e=>{if(!this.down)return;const moved=Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)>7;if(moved&&(this.down.id==='own'||this.down.placement||this.down.connection)){this.dragging=true;const p=this.point(e);if(p){this.ghost.visible=true;this.ghost.position.set(p.x,this.floorY(p.x,p.z)+.25,p.z);}}});
   this.canvas.addEventListener('pointerup',e=>{if(!this.down)return;const down=this.down;this.down=null;this.controls.enabled=true;this.ghost.visible=false;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y)>7;const p=this.point(e),id=this.pick(e);
    if(down.placement&&p){this.callbacks.place?.(p);return;}
    if(down.connection&&this.dragging){if(id)this.callbacks.connect?.(down.id,id);else this.game.message('将连接拖到下一个对象上。');this.dragging=false;return;}
    if(this.dragging&&p){this.navigation=true;this.callbacks.drag?.(p,id);this.dragging=false;return;}
    if(moved)return;
    if(id==='own'){this.navigation=!this.navigation;this.callbacks.selection?.(this.navigation);return;}
    if(id){this.callbacks.node?.(id);return;}
    if(this.navigation&&p)this.callbacks.route?.(p);
   });
   this.canvas.addEventListener('pointercancel',()=>{this.down=null;this.controls.enabled=true;this.ghost.visible=false;});
   this.canvas.addEventListener('keydown',e=>{if(e.key==='Escape'){this.navigation=false;this.game.cancel();}if(e.key===' '){e.preventDefault();this.game.paused=!this.game.paused;this.callbacks.pause?.();}});
  }
  cameraFit(){return Math.max(1,Math.min(2.2,1.35/this.camera.aspect));}
  resetCamera(){this.view='perspective';this.camera.position.set(45,40,48).multiplyScalar(this.cameraFit());this.controls.target.set(0,0,0);this.controls.update();}
  topView(){this.view='top';this.camera.position.set(0,63*this.cameraFit(),.2);this.controls.target.set(0,0,0);this.controls.update();}
  resize(){const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  animate(){if(this.disposed)return;requestAnimationFrame(()=>this.animate());const dt=Math.min(.05,this.clock.getDelta());if(this.ready&&this.playerMesh&&this.game.s){this.game.tick(dt*this.game.speed);this.visuals();}this.controls.update();this.renderer.render(this.scene,this.camera);this.lastHud+=dt;if(this.lastHud>.12){this.lastHud=0;this.callbacks.frame?.();}}
  dispose(){this.disposed=true;this.resizeObserver.disconnect();this.controls.dispose();this.clear(this.world);this.clear(this.routes);this.clear(this.fx);for(const object of [this.ghost,this.planLine])if(object){object.geometry.dispose();object.material.dispose();this.scene.remove(object);}this.scene.traverse(object=>object.shadow?.map?.dispose());this.renderer.dispose();this.canvas.remove();}
 }
 root.StratagemThreeScene=StratagemThreeScene;
})(typeof window!=='undefined'?window:globalThis);
