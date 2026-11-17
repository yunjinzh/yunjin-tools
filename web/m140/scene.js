import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

/** Procedural, asset-independent Three.js learning landscape. */
export function createWorld(container, {onSelect = () => {}, onReady = () => {}, onTourChange = () => {}, onContextLost = () => {}, onContextRestored = () => {}} = {}) {
  const mobile = () => container.clientWidth < 760;
  const scene = new THREE.Scene();
  const night = new THREE.Color('#071c22'), day = new THREE.Color('#c4d8d2');
  scene.background = night.clone();
  scene.fog = new THREE.FogExp2(night, .011);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile() ? 1.5 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.domElement.setAttribute('aria-label','可拖动、缩放的三字经水上书院。六处发光题签可点击进入对应学习主题。');
  renderer.domElement.style.touchAction = 'none';
  container.appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 230);
  const defaultPosition = new THREE.Vector3(23,20,29);
  camera.position.copy(defaultPosition);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,1.8,0);
  controls.enableDamping = true;
  controls.dampingFactor = .055;
  controls.minDistance = 18;
  controls.maxDistance = 57;
  controls.minPolarAngle = .26;
  controls.maxPolarAngle = Math.PI / 2.13;
  controls.enablePan = false;
  controls.rotateSpeed = .48;
  controls.zoomSpeed = .7;
  const hemi = new THREE.HemisphereLight('#bbede3','#142526',1.85);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe4ae',3.5);
  sun.position.set(10,25,12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:.5,far:70});
  sun.shadow.bias = -.0005;
  sun.shadow.normalBias = .05;
  scene.add(sun);
  const rim = new THREE.DirectionalLight('#7bc5c3',2.4);
  rim.position.set(-15,12,-12);scene.add(rim);
  const fill = new THREE.PointLight('#e6ba6d',30,30,2);fill.position.set(0,5,5);scene.add(fill);
  const world = new THREE.Group();scene.add(world);
  let seed = 7499;
  const random = () => ((seed = (seed * 16807) % 2147483647)-1)/2147483646;
  const mat = (color, extra={}) => new THREE.MeshStandardMaterial({color,roughness:.8,metalness:.05,...extra});
  const stone = mat('#66817a'), stoneDark=mat('#304f4c'), stoneLight=mat('#a5b7a1');
  const wood = mat('#452e27'), redwood=mat('#754a37'), teal=mat('#1f5755',{roughness:.49,metalness:.13});
  const gold = mat('#d5b16e',{roughness:.38,metalness:.65});
  const paper = mat('#f4e4ba',{roughness:.77,side:THREE.DoubleSide});
  const glowing = mat('#f4c77d',{emissive:'#ffbb60',emissiveIntensity:1.4,roughness:.4});
  function mesh(geometry,material,parent=world,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,material,parent=world,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z);}
  function cyl(rt,rb,h,material,parent=world,x=0,y=0,z=0,segments=12){return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material,parent,x,y,z);}
  function line(points,color,opacity=.7,parent=world){const g=new THREE.BufferGeometry().setFromPoints(points);const m=new THREE.LineBasicMaterial({color,transparent:true,opacity});const l=new THREE.Line(g,m);parent.add(l);return l;}
  function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,222,150,1)');g.addColorStop(.12,'rgba(255,206,113,.8)');g.addColorStop(.35,'rgba(233,173,76,.25)');g.addColorStop(1,'rgba(200,140,30,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
  const glowMap=glowTexture();
  const glowMaterial=new THREE.SpriteMaterial({map:glowMap,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:'#ffd687'});
  function glow(parent,x,y,z,size=2){const s=new THREE.Sprite(glowMaterial.clone());s.position.set(x,y,z);s.scale.set(size,size,1);parent.add(s);return s;}

  // A gently moving jade lake, with distance haze and fine caustic lines.
  const waterMat = new THREE.ShaderMaterial({transparent:false,uniforms:{uTime:{value:0},uDay:{value:0}},vertexShader:`varying vec3 vP; void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float uTime;uniform float uDay;varying vec3 vP;void main(){float r=length(vP.xy);float a=sin(vP.x*.47+uTime*.12)+sin(vP.y*.63-uTime*.1);float ripple=pow(max(0.,sin(r*2.2-uTime*.5+a*.55)),22.);float crossing=pow(max(0.,sin(vP.x*.5+vP.y*.8+uTime*.1)),30.);vec3 base=mix(vec3(.018,.10,.118),vec3(.29,.49,.46),uDay);float haze=smoothstep(16.,90.,r);base=mix(base,mix(vec3(.027,.11,.13),vec3(.77,.85,.82),uDay),haze);gl_FragColor=vec4(base+(ripple*.027+crossing*.008)*(1.-haze),1.);}`});
  const water = new THREE.Mesh(new THREE.PlaneGeometry(260,260),waterMat);water.rotation.x=-Math.PI/2;water.position.y=-2.05;scene.add(water);

  // Hand-cut stepped limestone island; a different silhouette on every ring.
  const ringSegments=80;
  const profile=[[-1.95,7.6],[-1.65,9.1],[-1.05,10.1],[-.4,10.25],[.1,9.85],[.35,9.4]];
  const vertices=[],indices=[];
  const outline=Array.from({length:ringSegments},(_,i)=>1+.045*Math.sin(i*.78)+.03*Math.cos(i*1.41));
  profile.forEach(([y,r],j)=>{for(let i=0;i<ringSegments;i++){const a=i/ringSegments*Math.PI*2;vertices.push(Math.cos(a)*r*outline[i],y,Math.sin(a)*r*outline[i]*.8);}});
  for(let j=0;j<profile.length-1;j++)for(let i=0;i<ringSegments;i++){let a=j*ringSegments+i,b=j*ringSegments+(i+1)%ringSegments,c=a+ringSegments,d=b+ringSegments;indices.push(a,c,b,b,c,d);}
  const islandGeo=new THREE.BufferGeometry();islandGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));islandGeo.setIndex(indices);islandGeo.computeVertexNormals();
  mesh(islandGeo,stoneDark);
  const land=mesh(new THREE.CylinderGeometry(9.44,9.5,.18,80),stone,world,0,.33,0);land.scale.z=.8;
  profile.slice(1,5).forEach(([y,r])=>{const pts=[];for(let i=0;i<=ringSegments;i++){const j=i%ringSegments,a=j/ringSegments*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r*outline[j],y+.01,Math.sin(a)*r*outline[j]*.8));}line(pts,'#74988a',.25);});
  // Concentric courtyard, carved steps, stepping stones.
  cyl(5.7,5.95,.2,stoneLight,world,0,.52,0,64);
  cyl(5.3,5.5,.12,stone,world,0,.68,0,64);
  for(let r of [4.6,5.3]){const ring=mesh(new THREE.TorusGeometry(r,.018,4,100),gold,world,0,.76,0);ring.rotation.x=Math.PI/2;}
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2;const p=box(.42,.08,.6,stoneLight,world,Math.cos(a)*6.3,.5,Math.sin(a)*5.05);p.rotation.y=-a;}
  for(let i=0;i<7;i++)box(3.4+i*.15,.18,1,stoneLight,world,0,.65-i*.105,5.0+i*.39);

  function roof(parent,y,size,height){
    // Four sloping roof skirts with upward-curving corners.
    const v=[],ix=[],n=14;
    for(let side=0;side<4;side++){
      for(let row=0;row<=4;row++)for(let j=0;j<=n;j++){
        const t=row/4,along=j/n*2-1,outer=size*(.2+.8*t),xx=along*outer,zz=outer;
        let yy=y+height*(1-t)+.21*Math.pow(Math.abs(along),5)*t+.22*Math.pow(t,8);
        const a=side*Math.PI/2;v.push(xx*Math.cos(a)+zz*Math.sin(a),yy,-xx*Math.sin(a)+zz*Math.cos(a));
      }
      const start=side*5*(n+1);
      for(let row=0;row<4;row++)for(let j=0;j<n;j++){const a=start+row*(n+1)+j,b=a+n+1;ix.push(a,b,a+1,a+1,b,b+1);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();
    const r=mesh(g,teal,parent);r.material.side=THREE.DoubleSide;
    for(let side=0;side<4;side++){
      const a=side*Math.PI/2;const edge=[];
      for(let j=0;j<=28;j++){const q=j/28*2-1,x=q*size,z=size;edge.push(new THREE.Vector3(x*Math.cos(a)+z*Math.sin(a),y+.22+.21*Math.pow(Math.abs(q),5),-x*Math.sin(a)+z*Math.cos(a)));}line(edge,'#c7ab6e',1,parent);
      for(let j=-6;j<=6;j++){const pts=[];for(let k=0;k<=10;k++){const t=k/10,q=j/7,x=q*size*(.2+.8*t),z=size*(.2+.8*t);pts.push(new THREE.Vector3(x*Math.cos(a)+z*Math.sin(a),y+height*(1-t)+.21*Math.pow(Math.abs(q),5)*t+.22*Math.pow(t,8)+.017,-x*Math.sin(a)+z*Math.cos(a)));}line(pts,'#639584',.45,parent);}
    }
    return r;
  }
  function lantern(parent,x,y,z,scale=1){const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(scale);cyl(.17,.2,.4,glowing,g,0,0,0,8);cyl(.22,.22,.05,gold,g,0,.22,0,8);cyl(.22,.22,.05,gold,g,0,-.22,0,8);cyl(.018,.018,.22,gold,g,0,.35,0,6);glow(g,0,0,0,1.6);return g;}
  function pavilion(x,z,scale=1){
    const g=new THREE.Group();g.position.set(x,.8,z);g.scale.setScalar(scale);world.add(g);
    box(5.4,.25,4.8,stoneLight,g,0,0,0);box(4.9,.18,4.3,stoneDark,g,0,.19,0);
    for(const xx of [-1.92,1.92])for(const zz of [-1.65,1.65]){cyl(.14,.18,2.7,redwood,g,xx,1.63,zz);cyl(.22,.24,.24,gold,g,xx,.4,zz);box(.38,.18,.38,gold,g,xx,2.92,zz);}
    for(let xx of [-1.92,1.92]){box(.12,1.65,3.1,wood,g,xx,1.5,-.05);for(let j=-4;j<=4;j++)box(.14,1.6,.035,gold,g,xx+.03,1.5,j*.3);}
    box(3.7,2.25,.12,wood,g,0,1.7,-1.62);
    for(let i=-5;i<=5;i++){box(.045,1.8,.05,gold,g,i*.3,1.7,-1.52);}
    box(4.3,.25,3.9,redwood,g,0,2.95,0);roof(g,3.05,2.9,1.1);
    box(2.55,.95,2.3,wood,g,0,4.45,0);for(let x of [-.85,-.42,0,.42,.85])box(.16,.63,.05,glowing,g,x,4.43,1.18);
    roof(g,4.9,2.15,.95);
    box(1.1,.6,1.1,wood,g,0,6.03,0);roof(g,6.3,1.48,.8);
    cyl(.06,.15,.65,gold,g,0,7.42,0,8);mesh(new THREE.SphereGeometry(.14,10,8),gold,g,0,7.81,0);
    for(let x of [-1.85,1.85])lantern(g,x,2.48,1.95,.8);
    for(let i=0;i<3;i++)box(2.9+i*.3,.16, .6,stoneLight,g,0,-.13-i*.15,2.65+i*.38);
    return g;
  }
  const temple=pavilion(-.8,-1.4,1.07);

  // Jade mountains and miniature pine/ bamboo groves.
  function rock(x,y,z,size){const geo=new THREE.IcosahedronGeometry(size,1);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const f=.85+random()*.28;pos.setXYZ(i,pos.getX(i)*f,pos.getY(i)*(.9+random()*.5),pos.getZ(i)*f);}geo.computeVertexNormals();const r=mesh(geo,stoneDark,world,x,y,z);r.rotation.set(random()*.8,random()*6,random()*.5);return r;}
  for(let i=0;i<10;i++){const a=Math.PI*.65+i*.12;const r=7.2+random();const s=.6+random()*.65;rock(Math.cos(a)*r,.9,Math.sin(a)*r*.7-4,s);}
  function bamboo(x,z,h){const g=new THREE.Group();g.position.set(x,.5,z);world.add(g);for(let n=0;n<3;n++){const xx=(random()-.5)*.45,zz=(random()-.5)*.45,hh=h*(.7+random()*.3);cyl(.035,.05,hh,teal,g,xx,hh/2,zz,6);for(let y=.4;y<hh;y+=.42){cyl(.06,.06,.025,gold,g,xx,y,zz,6);if(y>hh*.45){for(let j=0;j<3;j++){const leaf=mesh(new THREE.SphereGeometry(1,5,3),stoneLight,g,xx+(random()-.5)*.6,y,zz+(random()-.5)*.6);leaf.scale.set(.06,.025,.38);leaf.rotation.y=random()*6;leaf.rotation.z=.45;}}}}return g;}
  for(let i=0;i<29;i++){const a=1.1+random()*3.3,r=6.6+random()*1.7;bamboo(Math.cos(a)*r,Math.sin(a)*r*.72,1.5+random()*1.7);}
  for(let i=0;i<17;i++){const a=random()*Math.PI*2,r=8.5+random()*.8;rock(Math.cos(a)*r,.18,Math.sin(a)*r*.78,.3+random()*.42);}

  // Arched moon bridge and its railings.
  const bridge=new THREE.Group();bridge.position.set(7,.1,2.6);bridge.rotation.y=-.8;world.add(bridge);
  const bridgeCurve=(t)=>new THREE.Vector3(0,.45+Math.sin(t*Math.PI)*1.05,(t-.5)*6);
  for(let i=0;i<22;i++){const t=i/21,p=bridgeCurve(t);const s=box(1.8,.18,.3,stoneLight,bridge,p.x,p.y,p.z);s.rotation.x=-Math.cos(t*Math.PI)*.47;for(let x of [-.85,.85])box(.07,.78,.07,gold,bridge,x,p.y+.45,p.z);}
  for(let x of [-.85,.85]){const pts=[];for(let i=0;i<=45;i++){const p=bridgeCurve(i/45);p.x=x;p.y+=.85;pts.push(p);}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),45,.045,5,false),gold,bridge);}
  for(let z of [-3,3])for(let x of [-.9,.9])lantern(bridge,x,1.6,z,.65);

  function textTexture(title,subtitle,index){const c=document.createElement('canvas');c.width=640;c.height=280;const ctx=c.getContext('2d');ctx.fillStyle='rgba(13,38,40,.93)';ctx.beginPath();ctx.roundRect(2,2,636,276,28);ctx.fill();ctx.strokeStyle='rgba(216,185,119,.8)';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='rgba(216,185,119,.18)';ctx.strokeRect(13,13,614,254);ctx.fillStyle='#d5b374';ctx.font='20px sans-serif';ctx.textAlign='center';ctx.letterSpacing='5px';ctx.fillText(`0${index+1}  ·  ${subtitle}`,320,64);ctx.font='72px "Noto Serif SC","Songti SC",serif';ctx.fillStyle='#f6eccd';ctx.fillText(title,320,163);ctx.font='20px sans-serif';ctx.fillStyle='#b8cdc4';ctx.fillText('选择课程',320,230);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
  const names=['启蒙','礼仪','博物','典籍','历史','勤学'];
  const subtitles=['初见本心','修身立德','天地万物','书香寻径','古今长河','向学而行'];
  const coords=[[-6.9,3.4],[-6.7,-2.4],[-.2,-6.3],[6,-3.6],[7.2,3.5],[.8,7.2]];
  const stations=[],targets=[],halos=[];
  coords.forEach(([x,z],i)=>{
    const g=new THREE.Group();g.position.set(x,.65,z);world.add(g);
    const pedestal=cyl(.62,.78,.24,stoneDark,g,0,0,0,12);
    const torus=mesh(new THREE.TorusGeometry(.63,.022,5,50),gold,g,0,.16,0);torus.rotation.x=Math.PI/2;
    cyl(.08,.11,1.55,gold,g,0,.85,0,8);cyl(.2,.26,.13,gold,g,0,1.6,0,8);glow(g,0,1.7,0,1.3);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:textTexture(names[i],subtitles[i],i),transparent:true,depthTest:false,depthWrite:false}));sprite.position.set(0,2.72,0);sprite.scale.set(3.3,1.44,1);sprite.userData.station=i;g.add(sprite);targets.push(sprite);
    const halo=mesh(new THREE.TorusGeometry(.92,.025,6,64),glowing,g,0,.2,0);halo.rotation.x=Math.PI/2;halos.push(halo);
    stations.push(g);
  });

  // An illuminated, open book is the central learning object.
  const book = new THREE.Group();book.position.set(.5,1.55,3.1);book.rotation.y=.12;world.add(book);
  const bookWidth=1.8, bookHeight=2.35;
  function page(side){const group=new THREE.Group();book.add(group);group.rotation.z=side*.14;box(bookWidth,.13,bookHeight,redwood,group,side*bookWidth/2,-.03,0);box(bookWidth-.05,.1,bookHeight-.07,paper,group,side*bookWidth/2,.09,0);for(let j=0;j<5;j++)box(bookWidth-.06,.013,bookHeight-.08,gold,group,side*bookWidth/2,.015+j*.017,0);const c=document.createElement('canvas');c.width=512;c.height=640;const ctx=c.getContext('2d');ctx.fillStyle='#f4e7bd';ctx.fillRect(0,0,512,640);ctx.fillStyle='#564b36';ctx.textAlign='center';ctx.font='50px "Noto Serif SC","Songti SC",serif';const chars=side<0?['人之初','性本善']:['性相近','习相远'];chars.forEach((col,i)=>col.split('').forEach((ch,j)=>ctx.fillText(ch,side<0?325-i*170:325-i*170,180+j*125)));ctx.strokeStyle='#c1a77a';ctx.lineWidth=2;ctx.strokeRect(30,30,452,580);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const plane=mesh(new THREE.PlaneGeometry(bookWidth-.1,bookHeight-.12),new THREE.MeshStandardMaterial({map:tex,roughness:.85,side:THREE.DoubleSide}),group,side*bookWidth/2,.151,0);plane.rotation.x=-Math.PI/2;return group;}
  page(-1);page(1);cyl(.06,.06,bookHeight,gold,book,0,.03,0,10).rotation.x=Math.PI/2;
  const bookLight=new THREE.PointLight('#ffe0a0',17,9,2);bookLight.position.set(0,1,0);book.add(bookLight);glow(book,0,.3,0,5);
  const orbitPages=[];
  for(let i=0;i<7;i++){const p=mesh(new THREE.PlaneGeometry(.42,.65),paper,world);p.material=paper.clone();p.material.emissive=new THREE.Color('#bb873c');p.material.emissiveIntensity=.4;p.userData.phase=i/7*Math.PI*2;p.rotation.x=-.3;p.rotation.y=i*.8;orbitPages.push(p);}

  // Low fog banks: translucent ribbon shapes, never hiding the architecture.
  const fogSprites=[];
  const mistMat=new THREE.SpriteMaterial({map:glowMap,color:'#91b5a7',opacity:.09,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  for(let i=0;i<13;i++){const s=new THREE.Sprite(mistMat);const a=i/13*Math.PI*2;s.position.set(Math.cos(a)*12,-1.15,Math.sin(a)*9);s.scale.set(12,1.8,1);world.add(s);fogSprites.push(s);}
  const count=mobile()?170:330;const pointPos=new Float32Array(count*3),basePos=[];
  for(let i=0;i<count;i++){const p=[(random()-.5)*36,random()*11+.3,(random()-.5)*27];basePos.push(p);pointPos.set(p,i*3);}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pointPos,3));
  const pm=new THREE.PointsMaterial({color:'#e8c78a',size:.09,map:glowMap,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
  const particles=new THREE.Points(pg,pm);scene.add(particles);
  const starsGeo=new THREE.BufferGeometry(),starPositions=[];for(let i=0;i<130;i++)starPositions.push((random()-.5)*130,20+random()*35,-20-random()*50);starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:'#b3d2ce',size:.12,transparent:true,opacity:.4}));scene.add(stars);
  // Golden orbit inscribes the journey around the island.
  const journey=[];for(let i=0;i<=180;i++){const a=i/180*Math.PI*2;journey.push(new THREE.Vector3(Math.cos(a)*12,-1.8,Math.sin(a)*9.8));}line(journey,'#cfb77e',.2);

  // Bake the small architectural pieces by material: hundreds of bamboo
  // leaves become a handful of draw calls, while animated learning objects stay live.
  world.updateMatrixWorld(true);
  const batches=new Map();
  world.traverse(o=>{
    if(!o.isMesh || halos.includes(o) || orbitPages.includes(o)) return;
    let parent=o;while(parent){if(parent===book)return;parent=parent.parent;}
    if(Array.isArray(o.material))return;
    if(!batches.has(o.material))batches.set(o.material,[]);
    batches.get(o.material).push(o);
  });
  batches.forEach((items,material)=>{
    if(items.length<3)return;
    const pieces=items.map(item=>{const g=item.geometry.index?item.geometry.toNonIndexed():item.geometry.clone();g.applyMatrix4(item.matrixWorld);return g;});
    const count=pieces.reduce((n,g)=>n+g.attributes.position.count,0);
    const merged=new THREE.BufferGeometry();
    for(const [name,size] of [['position',3],['normal',3],['uv',2]]){
      const values=new Float32Array(count*size);let cursor=0;
      for(const g of pieces){const attr=g.attributes[name];if(attr)values.set(attr.array,cursor);cursor+=g.attributes.position.count*size;}
      merged.setAttribute(name,new THREE.BufferAttribute(values,size));
    }
    merged.computeBoundingSphere();
    const combined=new THREE.Mesh(merged,material);combined.castShadow=true;combined.receiveShadow=true;world.add(combined);
    items.forEach(item=>{item.removeFromParent();item.geometry.dispose();});pieces.forEach(g=>g.dispose());
  });

  let disposed=false, paused=false, contextLost=false, ready=false, pendingRestore=false;
  let motion=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isDay=false, active=0, tourMode=false, last=null, time=0, celebration=0, rafId=null;
  let cameraMove=null;
  const resizeObserver=new ResizeObserver(resize);

  function setTour(value){
    const next=Boolean(value)&&motion&&!contextLost;
    controls.autoRotate=next;
    if(tourMode===next)return;
    tourMode=next;
    onTourChange(next);
  }
  function schedule(){
    if(!disposed&&!paused&&!contextLost&&rafId===null)rafId=requestAnimationFrame(animate);
  }
  function halt(){
    if(rafId!==null)cancelAnimationFrame(rafId);
    rafId=null;
    last=null;
  }
  function moveCamera(position,target){
    if(motion)cameraMove={position,target};
    else{camera.position.copy(position);controls.target.copy(target);cameraMove=null;}
    schedule();
  }
  function resize(){
    if(disposed)return;
    const w=container.clientWidth||window.innerWidth,h=container.clientHeight||window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,w<760?1.5:1.75));
    renderer.setSize(w,h);
    camera.aspect=w/h;
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(39/2))*Math.max(1,.76/camera.aspect)));
    if(w>=900)camera.setViewOffset(w,h,-w*.115,0,w,h);else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    schedule();
  }
  resizeObserver.observe(container);
  resize();
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const activePointers=new Set();
  let pointerDown=null;
  function hit(e){
    const r=renderer.domElement.getBoundingClientRect();
    if(!r.width||!r.height)return null;
    pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer,camera);
    return raycaster.intersectObjects(targets,false)[0];
  }
  function userControl(){cameraMove=null;setTour(false);schedule();}
  const down=e=>{
    if(paused||contextLost||disposed||(e.button!==undefined&&e.button!==0))return;
    const id=e.pointerId??1;
    activePointers.add(id);
    userControl();
    if(activePointers.size!==1){pointerDown=null;return;}
    const station=hit(e)?.object.userData.station;
    pointerDown={id,x:e.clientX,y:e.clientY,moved:false,station};
  };
  const move=e=>{
    if(pointerDown&&pointerDown.id===(e.pointerId??1)){
      if(Math.hypot(pointerDown.x-e.clientX,pointerDown.y-e.clientY)>7)pointerDown.moved=true;
    }
    if(e.pointerType!=='touch'&&!paused&&!contextLost)renderer.domElement.style.cursor=hit(e)?'pointer':'grab';
  };
  const up=e=>{
    const id=e.pointerId??1, candidate=pointerDown;
    const singlePointer=activePointers.size===1;
    activePointers.delete(id);
    pointerDown=null;
    if(paused||contextLost||disposed||!candidate||candidate.id!==id||candidate.moved||!singlePointer)return;
    if(Math.hypot(candidate.x-e.clientX,candidate.y-e.clientY)>7||candidate.station===undefined)return;
    const target=hit(e);
    if(target&&target.object.userData.station===candidate.station)onSelect(candidate.station);
  };
  const cancel=e=>{activePointers.delete(e.pointerId??1);pointerDown=null;};
  const lost=e=>{
    e.preventDefault?.();
    if(disposed||contextLost)return;
    contextLost=true;
    controls.enabled=false;
    pendingRestore=false;
    pointerDown=null;
    activePointers.clear();
    setTour(false);
    halt();
    onContextLost();
  };
  const restored=()=>{
    if(disposed)return;
    contextLost=false;
    controls.enabled=!paused;
    pendingRestore=true;
    last=null;
    schedule();
  };
  renderer.domElement.style.cursor='grab';
  renderer.domElement.addEventListener('pointerdown',down);
  renderer.domElement.addEventListener('pointermove',move);
  renderer.domElement.addEventListener('pointerup',up);
  renderer.domElement.addEventListener('pointercancel',cancel);
  renderer.domElement.addEventListener('webglcontextlost',lost);
  renderer.domElement.addEventListener('webglcontextrestored',restored);
  controls.addEventListener('start',userControl);

  function animate(ms){
    rafId=null;
    if(disposed||paused||contextLost)return;
    const dt=last===null?0:Math.min(Math.max((ms-last)/1000,0),.04);
    last=ms;
    if(motion)time+=dt;
    waterMat.uniforms.uTime.value=time;
    if(cameraMove){
      camera.position.lerp(cameraMove.position,.032);
      controls.target.lerp(cameraMove.target,.04);
      if(camera.position.distanceTo(cameraMove.position)<.04)cameraMove=null;
    }
    controls.autoRotate=tourMode&&motion;
    controls.autoRotateSpeed=.38;
    controls.update();
    book.position.y=1.55+Math.sin(time*.75)*.1;
    book.rotation.z=Math.sin(time*.5)*.025;
    orbitPages.forEach(p=>{const a=p.userData.phase+time*.12;p.position.set(.5+Math.cos(a)*2.65,3.1+Math.sin(a*2+time*.3)*.4,3.1+Math.sin(a)*1.4);p.rotation.y=a+Math.PI/2;p.rotation.z=Math.sin(a)*.3;});
    halos.forEach((h,i)=>{h.visible=i===active;h.scale.setScalar(1+Math.sin(time*2)*.07);});
    targets.forEach((s,i)=>{s.position.y=2.72+Math.sin(time*.6+i)*.08;s.material.opacity=i===active?1:.94;s.scale.set(3.3,1.44,1).multiplyScalar(i===active?1.05:1);});
    if(motion){
      const ps=pg.attributes.position.array;
      for(let i=0;i<count;i++){ps[i*3]=basePos[i][0]+Math.sin(time*.2+i)*.45;ps[i*3+1]=basePos[i][1]+Math.sin(time*.35+i*.5)*.35+(celebration>0?Math.sin(celebration)*2:0);ps[i*3+2]=basePos[i][2]+Math.cos(time*.17+i)*.4;}
      pg.attributes.position.needsUpdate=true;
    }
    if(celebration>0){celebration=Math.max(0,celebration-dt);pm.size=.09+Math.sin(Math.min(celebration,Math.PI))*.1;}else pm.size=.09;
    try{
      renderer.render(scene,camera);
    }catch(error){
      contextLost=true;
      controls.enabled=false;
      setTour(false);
      halt();
      onContextLost(error);
      return;
    }
    if(!ready){ready=true;onReady();}
    if(pendingRestore){pendingRestore=false;onContextRestored();}
    schedule();
  }
  schedule();
  return {
    setChapter(index,theme=0){
      active=Math.max(0,Math.min(5,theme));
      const a=(active-2.5)*.04,p=defaultPosition.clone();
      p.applyAxisAngle(new THREE.Vector3(0,1,0),a);
      moveCamera(p,new THREE.Vector3(0,1.8,0));
    },
    setTheme(mode){
      isDay=mode==='day';scene.background.copy(isDay?day:night);scene.fog.color.copy(isDay?day:night);
      scene.fog.density=isDay?.009:.011;waterMat.uniforms.uDay.value=isDay?1:0;
      hemi.intensity=isDay?2.6:1.85;sun.intensity=isDay?3.9:3.5;rim.intensity=isDay?1.4:2.4;
      renderer.toneMappingExposure=isDay?1.1:1.18;stars.visible=!isDay;pm.opacity=isDay?.45:.8;
      schedule();
    },
    setMotion(value){
      motion=Boolean(value);
      if(!motion){
        setTour(false);
        if(cameraMove){camera.position.copy(cameraMove.position);controls.target.copy(cameraMove.target);cameraMove=null;}
        celebration=0;
      }
      schedule();
    },
    setPaused(value){
      paused=Boolean(value);
      controls.enabled=!paused&&!contextLost;
      if(paused){pointerDown=null;activePointers.clear();halt();}
      else{last=null;schedule();}
    },
    reset(){setTour(false);moveCamera(defaultPosition.clone(),new THREE.Vector3(0,1.8,0));},
    tour(){setTour(!tourMode);cameraMove=null;schedule();return tourMode;},
    celebrate(){if(motion)celebration=3;schedule();},
    dispose(){
      if(disposed)return;
      disposed=true;halt();resizeObserver.disconnect();
      controls.removeEventListener('start',userControl);controls.dispose();
      for(const [event,handler] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['webglcontextlost',lost],['webglcontextrestored',restored]])renderer.domElement.removeEventListener(event,handler);
      const geometries=new Set(),materials=new Set(),textures=new Set();
      scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>{materials.add(m);Object.values(m).forEach(v=>{if(v?.isTexture)textures.add(v);});});});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
      renderer.dispose();renderer.domElement.remove();
    }
  };
}
