import * as THREE from './vendor/three.module.js';

// An original, compressed Beijing-inspired game set. Distances and districts
// are intentionally composed for play and do not represent a survey map.
export function buildWorld(scene) {
  const root = new THREE.Group(); root.name = 'Beijing city'; scene.add(root);
  const colliders = [], landmarks = [], mapFeatures = [], animated = [];
  const roadCoords = [-400, -200, 0, 200, 400];
  const water = { minX: -380, maxX: -218, minZ: -380, maxZ: -220, y: .08 };
  const spawn = { x: -18, z: 35, y: 0, yaw: Math.PI };
  let seed = 41528;
  const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const batches = new Map(), materials = {};
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8);
  const sphere = new THREE.IcosahedronGeometry(1, 0);
  const cone = new THREE.ConeGeometry(1, 1, 8);
  const plane = new THREE.PlaneGeometry(1, 1);
  const temp = new THREE.Object3D();
  const makeMat = (name, color, extra = {}) => materials[name] = new THREE.MeshStandardMaterial({ color, roughness: .86, ...extra });
  makeMat('ground', '#76806b'); makeMat('asphalt', '#40494b'); makeMat('sidewalk', '#a49e8c');
  makeMat('stripe', '#d6cfb9'); makeMat('yellow', '#d6b569'); makeMat('grass', '#778451');
  makeMat('brick', '#7e7770'); makeMat('red', '#aa4232'); makeMat('wood', '#5f3b28');
  makeMat('gold', '#c59743', { metalness: .15, roughness: .66 }); makeMat('roof', '#505c5b');
  makeMat('blueRoof', '#23556b', { roughness: .52 }); makeMat('stone', '#c0baa5');
  makeMat('dark', '#2d3432'); makeMat('iron', '#45534c', { metalness: .45 });
  makeMat('trunk', '#6c5841'); makeMat('ginkgo', '#b4a849'); makeMat('ginkgoGold', '#d3b456');
  makeMat('green', '#5d7752'); makeMat('willow', '#7d8c55'); makeMat('tileRed', '#92573d');
  makeMat('glass', '#729294', { metalness: .45, roughness: .35 });
  makeMat('lamp', '#f1d993', { emissive: '#ffc762', emissiveIntensity: .85 });
  makeMat('lantern', '#ba3b2a', { emissive: '#bf2713', emissiveIntensity: .2 });
  makeMat('pool', '#527d78', { transparent: true, opacity: .86, roughness: .26, metalness: .35 });

  function canvasTexture(draw, w = 256, h = 256) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const cx = c.getContext('2d'); draw(cx, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4; return t;
  }
  const plasterTexture = canvasTexture((c, w, h) => {
    c.fillStyle = '#9e988a'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 24) for (let x = -30; x < w; x += 58) {
      c.fillStyle = ['#aaa394', '#9e998e', '#918f84'][Math.floor(rand() * 3)];
      c.fillRect(x + (y % 48 ? 29 : 0), y, 56, 22);
    }
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(0,0,0,${rand() * .13})`; c.fillRect(rand() * w, rand() * h, 2, 2); }
  });
  materials.brick.map = plasterTexture;
  function facadeTexture(base, window, cols, floors) {
    return canvasTexture((c, w, h) => {
      c.fillStyle = base; c.fillRect(0, 0, w, h);
      const cw = w / cols, ch = h / floors;
      for (let row = 0; row < floors; row++) for (let col = 0; col < cols; col++) {
        c.fillStyle = '#343d3c'; c.fillRect(col * cw + 5, row * ch + 6, cw - 10, ch - 12);
        c.fillStyle = rand() > .75 ? '#c0b28c' : window;
        c.fillRect(col * cw + 7, row * ch + 7, cw - 14, ch - 15);
        c.fillStyle = 'rgba(225,231,211,.23)'; c.fillRect(col * cw + 8, row * ch + 8, cw - 17, 2);
        c.fillStyle = '#737a71'; c.fillRect(col * cw + cw / 2, row * ch + 7, 2, ch - 15);
      }
    }, 256, 512);
  }
  makeMat('facade', '#ffffff', { map: facadeTexture('#aaa397', '#647272', 4, 7) });
  makeMat('facadeWarm', '#ffffff', { map: facadeTexture('#b9ad94', '#657571', 4, 7) });
  makeMat('facadeDark', '#ffffff', { map: facadeTexture('#465a5d', '#789292', 6, 16), roughness: .5, metalness: .2 });
  makeMat('office', '#ffffff', { map: facadeTexture('#465e69', '#6c8c95', 8, 24), metalness: .55, roughness: .33 });
  makeMat('factory', '#ffffff', { map: facadeTexture('#8f5d4b', '#5e7374', 5, 3) });

  function put(geometry, material, x, y, z, sx = 1, sy = 1, sz = 1, ry = 0, rx = 0, rz = 0) {
    const mat = typeof material === 'string' ? materials[material] : material;
    const key = geometry.uuid + '/' + mat.uuid;
    if (!batches.has(key)) batches.set(key, { geometry, mat, matrices: [] });
    temp.position.set(x, y, z); temp.rotation.set(rx, ry, rz); temp.scale.set(sx, sy, sz); temp.updateMatrix();
    batches.get(key).matrices.push(temp.matrix.clone());
  }
  const box = (x, y, z, w, h, d, mat, ry = 0) => put(cube, mat, x, y, z, w, h, d, ry);
  const paint = (x,z,w,d,mat,y=.09) => put(plane,mat,x,y,z,w,d,1,0,-Math.PI/2);
  function collision(x, z, w, d, type = 'building', color = '#958b76') {
    colliders.push({ x, z, w, d }); mapFeatures.push({ x, z, w, d, color, type });
  }
  const feature = (x, z, w, d, color, type) => mapFeatures.push({ x, z, w, d, color, type });
  function beam(a, b, width, material = 'iron', depth = width) {
    const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b), dir = bv.clone().sub(av);
    const mat = materials[material], key = cube.uuid + '/' + mat.uuid;
    if (!batches.has(key)) batches.set(key, { geometry: cube, mat, matrices: [] });
    temp.position.copy(av.add(bv).multiplyScalar(.5)); temp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    temp.scale.set(width, dir.length(), depth); temp.updateMatrix(); batches.get(key).matrices.push(temp.matrix.clone());
  }
  function unique(geometry, mat, x, y, z, ry = 0) {
    const mesh = new THREE.Mesh(geometry, typeof mat === 'string' ? materials[mat] : mat);
    mesh.position.set(x, y, z); mesh.rotation.y = ry; mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); return mesh;
  }
  function sign(text, x, y, z, width = 16, height = 4, bg = '#284e42', ry = 0, detail = '') {
    const texture = canvasTexture((c, w, h) => {
      c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = '#d9c68e'; c.lineWidth = 4; c.strokeRect(8, 8, w - 16, h - 16);
      c.fillStyle = '#f0dfb0'; c.font = `bold ${Math.min(73, 480 / Math.max(3, text.length))}px "Microsoft YaHei",sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, detail ? h * .43 : h * .52);
      if (detail) { c.font = '18px sans-serif'; c.fillStyle = '#c5bc9a'; c.fillText(detail, w / 2, h * .82); }
    }, 512, 160);
    const m = new THREE.MeshStandardMaterial({ map: texture, roughness: .8, emissive: '#ffffff', emissiveMap: texture, emissiveIntensity: .08, side: THREE.DoubleSide });
    put(plane, m, x, y, z, width, height, 1, ry);
  }
  function roofGeometry() {
    const outline = [[-.5,-.5], [0,-.5], [.5,-.5], [.5,0], [.5,.5], [0,.5], [-.5,.5], [-.5,0]];
    const top = [[-.31,-.19], [0,-.19], [.31,-.19], [.31,0], [.31,.19], [0,.19], [-.31,.19], [-.31,0]];
    const verts = [], uv = [];
    const add = p => { verts.push(...p); uv.push(p[0]+.5,p[2]+.5); };
    for(let i=0;i<8;i++) { const j=(i+1)%8, a=[outline[i][0],i%2===0?.15:0,outline[i][1]], b=[outline[j][0],j%2===0?.15:0,outline[j][1]], c=[top[i][0],1,top[i][1]], d=[top[j][0],1,top[j][1]]; [a,c,b,b,c,d].forEach(add); }
    [[-.31,1,-.19],[.31,1,.19],[.31,1,-.19],[-.31,1,-.19],[-.31,1,.19],[.31,1,.19]].forEach(add);
    const g = new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
  }
  const roofShape = roofGeometry();
  function roof(x, y, z, w, d, height = 3.5, mat = 'roof') {
    put(roofShape, mat, x, y, z, w, height, d);
    box(x, y + .13, z, w, .34, d, mat);
    box(x, y + height + .25, z, w * .62, .65, .65, mat);
    for (const s of [-1,1]) box(x + s*w*.32, y + height+.7, z, .6,1.4,.6,mat);
  }
  function traditional(x,z,w,d,h=9,mat='brick',roofMat='roof') {
    box(x,h/2+.2,z,w,h,d,mat);box(x,.4,z,w+.8,.8,d+.8,'stone');roof(x,h+.2,z,w+3,d+3,Math.min(5,w*.11),roofMat);
    collision(x,z,w,d,'building',roofMat==='gold'?'#b69a55':'#8d8c79');
    for(let p=-w/2+3;p<w/2;p+=5) {
      box(x+p,4.2,z+d/2+.05,2.8,4,.18,'wood');box(x+p,4.2,z+d/2+.17,.13,4,.1,'gold');box(x+p,4.2,z+d/2+.18,2.8,.13,.1,'gold');
    }
  }
  function lantern(x,y,z,scale=1) {
    put(sphere,'lantern',x,y,z,.7*scale,scale,.7*scale);box(x,y+scale+.2,z,.15,.65,.15,'iron');box(x,y-scale-.35,z,.12,.8,.12,'gold');
  }
  function tree(x,z,height=9,kind='ginkgo') {
    if(x>water.minX&&x<water.maxX&&z>water.minZ&&z<water.maxZ)return;
    put(cylinder,'trunk',x,height*.28,z,.25,height*.56,.25);
    const color=kind==='willow'?'willow':rand()>.4?'ginkgo':'ginkgoGold';
    put(sphere,color,x,height*.77,z,height*.34,height*.36,height*.32,rand()*3);
    if(kind==='willow') { put(sphere,'willow',x-1,height*.61,z+1,height*.31,height*.46,height*.31,.8);put(sphere,'willow',x+1.1,height*.64,z-1,height*.30,height*.43,height*.28,2); }
    else {put(sphere,color,x+1.2,height*.7,z-.3,height*.23,height*.29,height*.25,1);}
  }
  function lamp(x,z,ry=0) {
    put(cylinder,'iron',x,4.8,z,.13,9.6,.13);box(x,9.4,z,4.5,.16,.18,'iron',ry);
    const dx=Math.cos(ry)*2,dz=-Math.sin(ry)*2;
    for(const s of [-1,1])box(x+s*dx,9.18,z+s*dz,1.4,.2,.65,'lamp',ry);
    box(x,.35,z,.5,.7,.5,'iron');
  }
  function bench(x,z,ry=0) {
    box(x,1,z,3.6,.18,1.1,'wood',ry);box(x,1.6,z-.5,3.6,1.1,.12,'wood',ry);
    for(const s of [-1,1])box(x+s*1.3,.5,z,.16,1,.8,'iron',ry);
  }
  function park(x,z,w=164,d=164) {box(x,.04,z,w,.08,d,'grass');feature(x,z,w,d,'#7f8d65','park');}
  function marker(id,name,x,z,color,description){landmarks.push({id,name,x,z,color,description});}

  // Pavements, lane markings and crossings share instanced batches.
  box(0,-.3,0,1040,.6,1040,'ground');
  for(const c of roadCoords) {
    box(c,.035,0,24,.07,1020,'asphalt');box(0,.037,c,1020,.074,24,'asphalt');
    for(const s of [-1,1]){box(c+s*16,.07,0,8,.14,1020,'sidewalk');box(0,.07,c+s*16,1020,.14,8,'sidewalk');}
    for(let t=-490;t<=490;t+=12){
      if(roadCoords.some(r=>Math.abs(r-t)<20))continue;
      for(const s of [-1,1]){paint(c+s*.35,t,.14,6,'yellow');paint(t,c+s*.35,6,.14,'yellow');}
      paint(c+6,t,.12,4,'stripe');paint(c-6,t,.12,4,'stripe');
      paint(t,c+6,4,.12,'stripe');paint(t,c-6,4,.12,'stripe');
    }
    for(let t=-470;t<=470;t+=52){if(roadCoords.some(r=>Math.abs(r-t)<29))continue;for(const s of [-1,1]){tree(c+s*22,t,7+rand()*2);tree(t,c+s*22,7+rand()*2);}}
    for(let t=-440;t<=440;t+=80){if(roadCoords.some(r=>Math.abs(r-t)<25))continue;lamp(c+13.7,t);lamp(t,c-13.7,Math.PI/2);}
  }
  for(const x of roadCoords)for(const z of roadCoords){
    box(x,.08,z,25,.08,25,'asphalt');
    for(let i=-9;i<=9;i+=3)for(const s of [-1,1]){paint(x+i,z+s*17,1.5,5,'stripe',.16);paint(x+s*17,z+i,5,1.5,'stripe',.16);}
    for(const s of [-1,1]) {box(x+s*15.5,3,z+15.5,.16,6,.16,'iron');box(x+s*15.5,6,z+15.5,.8,1.8,.7,'dark');box(x+s*15.5,6.45,z+15.9,.38,.38,.08,'lantern');box(x+s*15.5,5.7,z+15.9,.38,.38,.08,'green');}
  }
  for(const [label,x,z,rotation] of [['长安街',-20,15,0],['平安大街',-16,-184,0],['前门大街',16,180,Math.PI/2],['东二环路',216,15,0],['鼓楼大街',-20,-385,0],['西城街巷',-216,15,0]]) {
    box(x,4.2,z,.2,8.4,.2,'iron');sign(label,x,7.4,z,10,2.7,'#28514c',rotation);
  }

  // Forbidden City and Tian'anmen: layered glazed roofs, red walls, a broad plaza.
  box(100,.06,-294,174,.12,170,'sidewalk'); feature(100,-294,174,170,'#ad9e76','plaza');
  for(const x of [21,179]){box(x,5,-305,3,10,154,'red');collision(x,-305,3,154);roof(x,10,-305,5,157,1.2,'gold');}
  box(100,5,-380,160,10,3,'red');collision(100,-380,160,3);roof(100,10,-380,164,5,1.1,'gold');
  traditional(100,-345,55,26,12,'red','gold');traditional(100,-297,67,30,15,'red','gold');
  box(100,2,-245,116,4,31,'stone');
  collision(100,-245,116,31,'landmark','#b2704f');
  for(const x of [54,77,100,123,146])box(x,9,-245,14,14,22,'red');
  box(100,17.5,-245,110,5,22,'red');roof(100,20,-245,117,31,7,'gold');roof(100,27,-245,88,24,5.5,'gold');
  for(let x=48;x<=152;x+=8)put(cylinder,'red',x,21.7,-231.8,.55,7,.55);
  sign('天安门',100,17,-233.7,18,4.3,'#8f3028');
  for(const x of [42,158]){put(cylinder,'stone',x,6,-219,1.1,12,1.1);put(sphere,'stone',x,12.5,-219,2,1.2,2);}
  marker('forbidden','故宫 · 天安门',100,-216,'#c3964f','红墙黄瓦与中轴线广场，历史城区的任务起点。');

  // Drum Tower / Jingshan park.
  park(-100,-300);box(-100,.09,-261,146,.18,80,'sidewalk');
  box(-100,6,-260,58,12,38,'stone');box(-100,17,-260,47,10,30,'red');roof(-100,22,-260,60,42,7,'roof');
  box(-100,29,-260,36,7,24,'red');roof(-100,32.5,-260,48,34,6,'roof');collision(-100,-260,58,38,'landmark','#94745a');sign('鼓楼',-100,18,-244.8,13,5,'#692d28');
  for(let i=0;i<4;i++){put(cone,'grass',-106+i*3,3+i*2,-342,55-i*9,6+i*4,35-i*3);}
  collision(-100,-342,105,70,'park','#778451');
  traditional(-98,-340,21,17,8,'red','gold');
  for(let i=0;i<20;i++)tree(-174+rand()*146,-374+rand()*80,8+rand()*6);
  marker('drum','鼓楼 · 景山',-100,-214,'#caa66a','登楼听钟，在秋叶与街巷之间寻找旧时录音。');

  // Shichahai water, narrow shore promenades and an accessible east pier.
  box(-300,.02,-300,175,.04,175,'stone');
  const waterMesh = unique(new THREE.PlaneGeometry(water.maxX-water.minX,water.maxZ-water.minZ,12,12),'pool',(water.minX+water.maxX)/2,water.y,(water.minZ+water.maxZ)/2);
  waterMesh.rotation.x=-Math.PI/2;waterMesh.castShadow=false;waterMesh.name='Shichahai water';
  feature(-299,-300,162,160,'#577d80','water');
  // Small water highlights are geometry, so the scene remains offline.
  for(let i=0;i<56;i++)box(-372+rand()*145,.103,-372+rand()*143,3+rand()*10,.014,.12,'glass',rand()*.3);
  box(-217,water.y+.18,-280,24,.5,9,'wood');box(-231,water.y+.18,-280,9,.5,21,'wood');
  for(let z=-286;z<=-274;z+=6)put(cylinder,'wood',-234,.1,z,.3,3,.3);
  for(let x=-373;x<-225;x+=26){tree(x,-388,11,'willow');tree(x,-212,10,'willow');}
  for(let z=-360;z<-240;z+=25){tree(-390,z,11,'willow');bench(-211,z,Math.PI/2);}
  // A high decorative bridge at the north edge leaves the open lake navigable.
  for(let i=0;i<8;i++){box(-357+i*9,2+Math.sin(i/7*Math.PI)*2,-366,9.3,.65,7,'stone');for(const s of [-1,1])box(-357+i*9,3.2+Math.sin(i/7*Math.PI)*2,-366+s*3.3,.35,2,.35,'stone');}
  sign('什刹海游船',-210,3.5,-290,11,3.4,'#31524a',Math.PI/2);
  marker('lake','什刹海码头',-210,-280,'#73a4a1','沿水岸散步，或在码头登船穿过秋日湖面。');

  // Courtyard houses: walkable central courts and gateways, no filled-in block.
  box(-100,.07,-100,174,.14,174,'sidewalk');feature(-100,-100,174,174,'#aaa28b','hutong');
  function courtyard(x,z){
    box(x,.14,z,44,.14,43,'stone');traditional(x,z-15,42,10,7);traditional(x-17,z,8,25,6.2);traditional(x+17,z,8,25,6.2);
    traditional(x-12.5,z+16,16,8,6);traditional(x+12.5,z+16,16,8,6);roof(x,6,z+16,11,10,2.2,'roof');
    box(x,6.3,z+20.1,7,.85,.25,'red');lantern(x-3.2,5.2,z+21.2,.62);lantern(x+3.2,5.2,z+21.2,.62);
    tree(x-7,z-1,6);put(cylinder,'stone',x+6,.7,z+5,1.2,1.4,1.2);
  }
  for(const x of [-151,-89,-38])for(const z of [-153,-84])courtyard(x,z);
  traditional(-147,-29,43,13,7);sign('胡同邮局',-147,5.8,-22.1,22,3.5);traditional(-47,-29,43,13,7);sign('北平茶庄',-47,5.8,-22.1,22,3.5,'#754333');
  for(const x of [-176,-20])tree(x,-33,10);
  marker('hutong','南锣鼓巷',-100,-17,'#aab19b','青砖四合院、茶铺与邮局，适合徒步探索的街区。');

  // Guomao skyline: a recognizable tapered Zun and CCTV's angled closed loop.
  box(300,.08,-100,174,.16,174,'sidewalk');feature(300,-100,174,174,'#728b8f','cbd');
  const zunProfile=[[24,0],[22,15],[19,48],[16,83],[19,125],[26,160]].map(v=>new THREE.Vector2(v[0],v[1]));
  unique(new THREE.LatheGeometry(zunProfile,4), 'office', 345,.2,-138,Math.PI/4);box(345,160.5,-138,36,.9,36,'dark');collision(345,-138,48,48,'landmark','#547d86');
  for(let y=10;y<160;y+=10){const r=22-Math.sin(y/160*Math.PI)*5;box(345,y,-138,r*1.45,.12,r*1.45,'glass');}
  beam([248,0,-120],[270,102,-132],20,'facadeDark',23);beam([312,0,-83],[302,122,-103],21,'facadeDark',22);
  beam([270,102,-132],[286,120,-122],20,'facadeDark',23);beam([286,120,-122],[302,122,-103],20,'facadeDark',23);
  collision(250,-120,30,28,'landmark','#577b81');collision(312,-83,28,30,'landmark','#577b81');
  for(let j=0;j<8;j++){const y=j*12+5;beam([248+y*.21-11,y,-108-y*.12],[248+(y+12)*.21+11,y+12,-108-(y+12)*.12],.35,'stone');}
  box(298,1.1,-50,125,2.2,40,'stone');box(298,2.24,-50,115,.08,30,'pool');collision(298,-50,125,40,'plaza','#6e8d88');
  sign('国贸 CENTRAL BUSINESS DISTRICT',300,4,-26,60,5,'#243e47');
  for(const x of [230,265,335,370])tree(x,-28,9);
  marker('cbd','国贸 · 中国尊',213,-100,'#83b4bd','玻璃幕墙、高架剪影和现代都市的夜色。');

  // Temple of Heaven: three blue circular roof tiers and white stone terraces.
  park(100,300);box(100,.1,300,25,.2,160,'stone');
  for(let i=0;i<3;i++)put(cylinder,'stone',100,1+i*.7,310,36-i*5,1.4,36-i*5);
  put(cylinder,'red',100,8.1,310,17,10,17);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;put(cylinder,'red',100+Math.cos(a)*17,8.4,310+Math.sin(a)*17,.65,11,.65);}
  for(const [y,r,h] of [[13.2,24,8],[20.2,19,7],[26.6,13.8,7]]){put(cone,'blueRoof',100,y+h/2,310,r,h,r);put(cylinder,'gold',100,y+.15,310,r,.3,r);}
  put(sphere,'gold',100,34.8,310,1.5,2.6,1.5);collision(100,310,72,72,'landmark','#477b8c');
  for(const z of [245,275,345,370])for(const x of [38,54,146,162])tree(x,z,10,'willow');
  for(const x of [70,130])box(x,5,239,4,10,4,'red');roof(100,10,239,70,13,4,'blueRoof');sign('天坛',100,7.8,246,15,4.5,'#523a2d');
  marker('temple','天坛 · 祈年殿',100,218,'#709aa1','三重蓝瓦穹顶与白石台基，在松柏间寻找城市的回声。');

  // Qianmen: a long, genuinely open walking street and paired rows of shops.
  box(-100,.1,100,175,.2,175,'sidewalk');feature(-100,100,175,175,'#b1a28a','market');
  const names=['正阳书局','京味小馆','大栅栏百货','北京照相馆','糖葫芦','老字号茶铺'];
  for(let i=0;i<3;i++)for(const s of [-1,1]){
    const x=-100+s*52,z=56+i*48;traditional(x,z,58,36,10,i%2?'brick':'red','roof');
    const frontX=x-s*29.2;sign(names[i*2+(s>0?1:0)],frontX,8,z,26,4,'#3a5346',-s*Math.PI/2);
    for(const zz of [-12,12])lantern(frontX-s*1.5,8,z+zz,.9);
    box(frontX-s*1,3.4,z,2,5,12,'wood');
  }
  for(const x of [-126,-74]){put(cylinder,'red',x,8,28,1.1,16,1.1);box(x,1,28,4,2,4,'stone');}
  box(-100,13,28,63,3,4,'wood');roof(-100,14.5,28,68,13,4,'gold');sign('前门大街',-100,12,30.1,30,4,'#354c42');
  for(const x of [-116,-84])for(const z of [52,107,160]){bench(x,z);tree(x,z+12,8);}
  marker('qianmen','前门 · 大栅栏',-100,17,'#bf9a66','牌楼下接取街坊委托，把包裹送进老城。');

  // Olympic stadium: low bowl, open center and crossed structural ribbons.
  park(300,-300);box(300,.12,-300,174,.24,174,'stone');
  const ring=new THREE.TorusGeometry(49,8,6,44);const stadium=unique(ring,'stone',300,12,-310);stadium.rotation.x=Math.PI/2;stadium.scale.set(1.35,1,1);
  const inner=new THREE.CircleGeometry(43,32);const field=unique(inner,'grass',300,.3,-310);field.rotation.x=-Math.PI/2;field.scale.set(1.35,1,1);field.castShadow=false;
  for(let i=0;i<34;i++){const a=i/34*Math.PI*2,b=a+.44;beam([300+Math.cos(a)*72,4,-310+Math.sin(a)*52],[300+Math.cos(b)*67,27,-310+Math.sin(b)*48],.8,'iron');beam([300+Math.cos(a)*72,4,-310+Math.sin(a)*52],[300+Math.cos(a-.4)*67,27,-310+Math.sin(a-.4)*48],.8,'stone');}
  collision(300,-310,145,108,'landmark','#8d968d');sign('国家体育场',300,4,-240,30,4,'#375149');
  marker('olympic','奥体 · 鸟巢',300,-216,'#a7b4ae','交织钢架组成的城市体育地标，环城计时路线的北端。');

  // 798: low red-brick halls, clerestory roof strips, chimney and sculpture.
  box(300,.05,300,174,.1,174,'sidewalk');feature(300,300,174,174,'#9a7c69','art');
  for(const [x,z,w,d] of [[270,264,69,43],[337,337,72,54],[260,348,45,40]]){
    box(x,7,z,w,14,d,'factory');collision(x,z,w,d,'building','#a36b54');roof(x,14,z,w+2,d+2,4,'roof');
    for(let i=-2;i<=2;i++)box(x+i*10,18.4,z,6,.2,d*.6,'glass');
  }
  // Keep the courtyard clear for the 12 m patrol loop centred at (350, 255).
  put(cylinder,'tileRed',375,26,250,3,52,3);put(cylinder,'dark',375,52.4,250,3.2,.8,3.2);collision(375,250,7,7);
  put(sphere,'red',310,8,290,8,8,8,.7);box(310,1,290,15,2,15,'stone');collision(310,290,16,16);
  sign('798 艺术街区',268,10,286,44,6,'#893c30');sign('城市记忆展',337,8,364.2,32,4,'#324c46');
  for(const x of [223,375])for(const z of [240,300,365])tree(x,z,9);
  marker('art','798 艺术街区',215,300,'#c18160','红砖厂房与艺术装置，雨夜委托的目的地。');

  // Beihai park and a stylized white dagoba.
  park(-300,-100);box(-300,.1,-100,15,.2,158,'stone');
  put(cone,'grass',-310,4,-127,51,8,38);put(cylinder,'stone',-310,8,-127,18,8,18);
  collision(-310,-127,90,70,'park','#778451');
  put(sphere,'stone',-310,19,-127,14,17,14);put(cylinder,'stone',-310,33,-127,5,14,5);put(cone,'gold',-310,44,-127,6,11,6);put(sphere,'gold',-310,50,-127,1.5,2,1.5);collision(-310,-127,35,35,'landmark','#cfceb8');
  for(let i=0;i<26;i++){const x=-375+rand()*150,z=-175+rand()*150;if(Math.hypot(x+310,z+127)>34)tree(x,z,8+rand()*4,'willow');}
  sign('北海公园',-300,4,-24,22,4,'#3c554a');marker('beihai','北海 · 白塔',-300,-17,'#a7b99c','白塔、古树和安静的园路，适合慢下来探索。');

  // Remaining city blocks: mixed-use buildings, roof equipment and shopfronts.
  const reserved=new Set(['100,-300','-100,-300','-300,-300','-100,-100','300,-100','100,300','-100,100','300,-300','300,300','-300,-100']);
  const shopLabels=['京城便利店','国营修车铺','城市书房','京华面馆','街角唱片','便民超市','运河快递','金秋旅店'];let labelIndex=0;
  for(const bx of [-300,-100,100,300])for(const bz of [-300,-100,100,300]){
    if(reserved.has(`${bx},${bz}`))continue;
    box(bx,.055,bz,174,.11,174,'sidewalk');
    for(const ox of [-48,48])for(const oz of [-45,45]){
      const x=bx+ox,z=bz+oz,w=48+rand()*14,d=45+rand()*15,h=17+rand()*28;
      box(x,h/2+.15,z,w,h,d,rand()>.4?'facade':'facadeWarm');box(x,h+.5,z,w+1,1,d+1,'stone');box(x,h+1.3,z,w-4,.8,d-4,'roof');collision(x,z,w,d);
      box(x+8,h+3.1,z+6,8,3,8,'dark');put(cylinder,'stone',x-8,h+4,z-6,2.6,5,2.6);
      if(oz>0){sign(shopLabels[labelIndex++%shopLabels.length],x,4.6,z+d/2+.12,w-5,4.4,labelIndex%2?'#3e5b4c':'#794734');box(x,2,z+d/2+.25,w-6,2.2,.2,'glass');}
    }
  }
  marker('garage','前门车坊',-218,110,'#8ea99a','驶入面向主路的车坊前场，更换车身涂装与修整车辆，整装后再出发。');
  // The east-facing entrance opens onto the fixed garage interaction point.
  // Compact dimensions keep the workshop clear of the neighbouring residence.
  box(-234,5,106,14,10,22,'factory');roof(-234,10,106,16,24,2.2,'roof');collision(-234,106,14,22);
  box(-221,.08,110,10,.16,13,'stone');
  sign('前门车坊',-226.8,8.1,106,19,3,'#2a4f47',Math.PI/2);
  box(-226.8,3.3,110,.16,6.4,9,'dark');
  box(-226.6,3.3,105.3,.25,6.8,.25,'gold');box(-226.6,3.3,114.7,.25,6.8,.25,'gold');
  paint(-221,106.4,8,.16,'stripe',.18);paint(-221,113.6,8,.16,'stripe',.18);

  // Peripheral housing gives the skyline depth without placing obstacles on the road grid.
  for(const side of [-1,1])for(let t=-455;t<=455;t+=65){
    if(roadCoords.some(c=>Math.abs(c-t)<35))continue;
    const h=20+rand()*28;box(side*464,h/2,t,46,h,40,'facade');box(t,h/2,side*464,40,h,46,'facadeWarm');
    collision(side*464,t,46,40);collision(t,side*464,40,46);
    roof(side*464,h,t,48,42,2,'roof');roof(t,h,side*464,42,48,2,'roof');
  }

  for(const {geometry,mat,matrices} of batches.values()){
    const mesh=new THREE.InstancedMesh(geometry,mat,matrices.length);
    matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;
    mesh.castShadow=!['ground','asphalt','sidewalk','stripe','yellow','grass','pool'].some(k=>materials[k]===mat);
    mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);
  }
  const stats={instances:[...batches.values()].reduce((n,b)=>n+b.matrices.length,0),batches:batches.size,drawObjects:root.children.length,colliders:colliders.length,landmarks:landmarks.length};
  root.userData.stats=stats;
  return {colliders,landmarks,water,animated,roadCoords,mapFeatures,spawn,root,stats};
}
