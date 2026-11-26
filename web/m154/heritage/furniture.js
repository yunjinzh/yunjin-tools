import * as THREE from 'three';
import { waist, scroll, marbleGrain } from './furniture-carving.js';
import { maskImage, vatWear } from './furniture-metal.js';

// All measures are in metres. Local +Z points toward the south courtyard.
const PI = Math.PI, TURN = 2 * PI;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const identity = new THREE.Matrix4();
const stone = 0xcfc7b5, lightStone = 0xdcd5c4, shadowStone = 0xb7ae9b;
const bronze = 0x5a513c, patina = 0x514d3f;
const linearColor = new Map();
function pigment(rgb) {
  if (!linearColor.has(rgb)) linearColor.set(rgb, new THREE.Color(rgb));
  return linearColor.get(rgb);
}
function matrix(pos, rot = [0, 0, 0], scale = [1, 1, 1]) {
  return new THREE.Matrix4().compose(V(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), V(...scale));
}

// One indexed surface per material and object type. Keep the vertex colours for
// the software renderer as well as the roughness/metalness in the GPU renderer.
const detailMaterials = new Map();
function detailMaterial(kind) {
  if (detailMaterials.has(kind)) return detailMaterials.get(kind);
  const metal=kind==='metal', source=metal?wearData:unpack(marbleGrain);
  // The colour is baked into geometry for both renderers. GPU close-ups also
  // catch light on the small texture relief, independently of the mesh density.
  const rgba=new Uint8Array(source.w*source.h*4);
  for(let i=0;i<source.pixels.length;i++){
    const value=source.pixels[i]; rgba.set([value,value,value,255],4*i);
  }
  const texture=new THREE.DataTexture(rgba,source.w,source.h);
  texture.wrapS=texture.wrapT=THREE.MirroredRepeatWrapping;
  texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;texture.needsUpdate=true;
  const material=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,
    roughness:metal?.53:.90,metalness:metal?.40:.015,bumpMap:texture,bumpScale:metal?.006:.009});
  detailMaterials.set(kind,material);return material;
}
class Sculpture {
  constructor(name) { this.name = name; this.parts = new Map(); }
  add(geometry, tone, frame = identity, material = 'marble') {
    geometry.applyMatrix4(frame);
    const attrib = geometry.attributes, points = attrib.position, normals = attrib.normal;
    if (!this.parts.has(material)) this.parts.set(material, {p: [], n: [], c: [], uv: [], ix: []});
    const part = this.parts.get(material), first = part.p.length / 3;
    const fixed = typeof tone === 'function' ? null : pigment(tone);
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
      const nx=normals.getX(i), ny=normals.getY(i), nz=normals.getZ(i);
      part.p.push(x, y, z); part.n.push(nx,ny,nz);
      if(Math.abs(ny)>.74)part.uv.push(x*1.8,z*1.3);
      else part.uv.push((Math.abs(nx)>Math.abs(nz)?z:x)*1.8,y*1.3);
      const color = fixed || tone(x, y, z);
      const grain = 0.98 + 0.02 * Math.sin(x * 16.9 + y * 21.1 + z * 37.3);
      part.c.push(color.r * grain, color.g * grain, color.b * grain);
    }
    if (geometry.index) for (const i of geometry.index.array) part.ix.push(first + i);
    else for (let i = 0; i < points.count; i++) part.ix.push(first + i);
    geometry.dispose();
  }
  box(x, y, z, w, h, d, tone = stone, kind = 'marble') {
    this.add(new THREE.BoxGeometry(w, h, d), tone, matrix([x, y + h / 2, z]), kind);
  }
  ellipsoid(x, y, z, rx, ry, rz, tone, kind = 'marble', rot = [0, 0, 0], slices = 12) {
    this.add(new THREE.SphereGeometry(1, slices, 7), tone, matrix([x, y, z], rot, [rx, ry, rz]), kind);
  }
  lathe(profile, segments, tone, kind = 'marble', frame = identity) {
    this.add(new THREE.LatheGeometry(profile.map(([r,y]) => new THREE.Vector2(r,y)), segments), tone, frame, kind);
  }
  // A square plinth with a very short bevel across each corner and moulded fascia.
  plinth(levels, tone = stone, at = [0,0,0], ratio = 1) {
    const p = [], idx = [], bevel = .05;
    for (const [r,y] of levels) {
      for (const [a,b] of [[-1,-1+bevel],[-1,1-bevel],[-1+bevel,1],[1-bevel,1],[1,1-bevel],[1,-1+bevel],[1-bevel,-1],[-1+bevel,-1]]) p.push(a*r, y, b*r*ratio);
    }
    for (let j = 1; j < levels.length; j++) for (let i = 0; i < 8; i++) {
      const a = (j-1)*8+i, b = (j-1)*8+(i+1)%8;
      idx.push(a,b,b+8,a,b+8,a+8);
    }
    const cap=(levels.length-1)*8;
    for (let i=1;i<7;i++) idx.push(cap,cap+i,cap+i+1);
    const g = new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.setIndex(idx);
    const flat = g.toNonIndexed(); g.dispose(); flat.computeVertexNormals(); this.add(flat,tone,matrix(at));
  }
  rod(a,b,r0,r1,tone,kind = 'marble', segments = 8) {
    const va=V(...a), vb=V(...b), dir=vb.clone().sub(va), length=dir.length();
    const q=new THREE.Quaternion().setFromUnitVectors(V(0,1,0),dir.normalize());
    const frame=new THREE.Matrix4().compose(va.add(vb).multiplyScalar(.5),q,V(1,1,1));
    this.add(new THREE.CylinderGeometry(r1,r0,length,segments),tone,frame,kind);
  }
  ring(x,y,z,r,tube,tone,rot=[0,0,0],kind='metal',scale=[1,1,1],segments=36) {
    this.add(new THREE.TorusGeometry(r,tube,6,segments),tone,matrix([x,y,z],rot,scale),kind);
  }
  finish() {
    const root = new THREE.Group(); root.name = this.name;
    for (const [kind,d] of this.parts) {
      const geom = new THREE.BufferGeometry();
      for (const [name,values] of [['position',d.p],['normal',d.n],['color',d.c]]) geom.setAttribute(name,new THREE.Float32BufferAttribute(values,3));
      geom.setAttribute('uv',new THREE.Float32BufferAttribute(d.uv,2));
      geom.setIndex(d.ix); geom.computeBoundingSphere();
      const material=detailMaterial(kind);
      const mesh=new THREE.Mesh(geom,material); mesh.name=this.name; mesh.castShadow=mesh.receiveShadow=true; root.add(mesh);
    }
    return root;
  }
}

// Approximate inscriptions in twelve sectors. Each short integer is one row of
// an Earthly Branch character. Continuous strokes become single strips.
const branches = [
  [3580,3584,1536,384,192,4288,16383,192,192,192,192,192,240,96],
  [3476,4092,1056,1056,1056,1056,2044,1584,1072,1072,1072,1552,5648,16383],
  [192,192,16382,5123,2041,192,4092,3276,4092,3276,4092,1584,7736,12294],
  [48,15676,12675,4531,4531,4531,4531,4531,4543,4535,6544,408,396,386],
  [6144,8188,4,4084,4,4100,16380,2228,3510,822,562,3762,15475,4113],
  [4095,3579,3073,3075,3073,3075,4095,1025,3,3,4099,4097,14339,16382],
  [24,8,8188,204,198,194,4288,16383,192,192,192,192,192,192],
  [192,192,3264,3792,192,4288,16382,480,1008,1752,3276,14534,4289,192],
  [192,64,16383,12483,4161,8191,4291,4161,6371,6339,65,64,64,64],
  [12288,16383,288,8190,6582,6438,6454,7958,6158,6150,6166,6150,8190,6150],
  [1408,3200,6528,16382,390,6534,3334,3454,1798,774,1794,11394,14435,12305],
  [64,192,12672,112,1584,792,508,3268,1648,796,966,3184,6172,4102],
];
function dialInscriptions(s,frame,sign,tone) {
  const positions=[],indices=[];
  for(let sector=0;sector<12;sector++) {
    const angle=-sector*TURN/12, sin=Math.sin(angle),cos=Math.cos(angle);
    const point=(col,row)=>{const across=(col/14-.5)*.030*sign,radial=.296+(.5-row/14)*.030;return [sin*radial+cos*across,sign*.0436,cos*radial-sin*across];};
    for(let row=0;row<14;row++){
      let col=0;
      while(col<14){
        if(!(branches[sector][row]&(1<<col))){col++;continue;}
        const first=col;while(col<14 && (branches[sector][row]&(1<<col)))col++;
        const i=positions.length/3;positions.push(...point(first,row),...point(col,row),...point(col,row+1),...point(first,row+1));indices.push(i,i+1,i+2,i,i+2,i+3);
      }
    }
  }
  const text=new THREE.BufferGeometry();text.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));text.setIndex(indices);text.computeVertexNormals();s.add(text,tone,frame);
}
function sundial(siteYaw) {
  const s=new Sculpture('太和殿东 · 赤道式日晷');
  // Palace Museum measured the plinth at 2.70 m and its side at 1.65 m.
  s.plinth([[.825,0],[.825,.11],[.78,.15],[.78,.33],[.75,.365]],stone);
  for (let i=0;i<3;i++) s.box(0,i*.105,.825+(2.5-i)*.205,.80,.105,.21,i===2?lightStone:stone);
  for (const x of [-.422,.422]) for (const z of [-.422,.422]) {
    s.plinth([[.245,.36],[.245,.405],[.203,.445],[.193,.48],[.177,.475]],stone,[x,0,z]);
    s.plinth([[.176,.475],[.176,1.90],[.186,1.93]],stone,[x,0,z]);
  }
  s.plinth([[.64,1.88],[.69,1.93],[.75,1.97],[.77,2.05],[.78,2.13],[.824,2.16],[.825,2.26],[.802,2.28]],lightStone);
  s.plinth([[.39,2.27],[.39,2.669],[.385,2.69],[.35,2.70]],stone);
  const tilt = -50*PI/180, rim=.3625, half=.0425;
  const centre=V(0,2.70+rim*Math.sin(-tilt)-.075,0);
  const frame=matrix(centre.toArray(),[0,-siteYaw,0]).multiply(new THREE.Matrix4().makeRotationX(tilt));
  const dialPoint=(x,y,z)=>V(x,y,z).applyMatrix4(frame).toArray();
  // The elevated end of the polar pin faces north. Micro-engraving is a readable
  // reconstruction of the 12 double hours and their subdivisions, on both faces.
  s.lathe([[0,-half],[rim-.012,-half],[rim,-half+.009],[rim,half-.009],[rim-.012,half],[0,half]],80,lightStone,'marble',frame);
  for (const sign of [-1,1]) {
    const surface=sign*(half+.0008), boundary=sign===1?0xc3bcad:0xa19a8a;
    for (const rr of [.102,.277,.319]) {
      const ring=new THREE.TorusGeometry(rr,.00125,4,64); ring.rotateX(PI/2); ring.translate(0,surface,0);s.add(ring,boundary,frame);
    }
    for (let i=0;i<48;i++) {
      const a=i*TURN/48, inner=i%4===0?.113:i%2===0?.188:.262;
      const radial=(r)=>dialPoint(r*Math.sin(a),surface,r*Math.cos(a));
      s.rod(radial(inner),radial(.278),i%4===0?.0016:.001,.001,boundary,'marble',4);
    }
    dialInscriptions(s,frame,sign,boundary);
    s.rod(dialPoint(0,surface,0),dialPoint(0,sign*.171,0),.013,.0016,0x443c30,'metal',10);
  }
  // The small cloud-carved cheek supports nest against the underside of the disc.
  for(const side of [-1,1]) {
    s.ellipsoid(side*.155,2.70,.015,.060,.095,.185,stone,'marble',[-.48,0,0]);
    for(let i=0;i<4;i++) s.ellipsoid(side*.195,2.715+i*.019,-.11+i*.049,.04,.032,.037,lightStone);
  }
  return s.finish();
}

const unpack = ([w,h,buffer]) => ({w,h,pixels:Uint8Array.from(atob(buffer),c=>c.charCodeAt(0))});
const maskData=unpack(maskImage), wearData=unpack(vatWear);
function photoLevel(img,u,v) {
  return img.pixels[Math.round(THREE.MathUtils.clamp(v,0,1)*(img.h-1))*img.w+Math.round(THREE.MathUtils.clamp(u,0,1)*(img.w-1))]/255;
}
function bronzeMask(s, x, side, west) {
  const pos=[],colors=[],idx=[], cols=31,rows=31, tone=new THREE.Color();
  const high=pigment(west?0xaaa08b:0xe6c780),low=pigment(west?0x453f33:0x5c4025);
  const contour=[.54,.72,.91,1,.98,.94,.92,.9,.80,.73,.65,.57];
  const azimuth=Math.asin(x/.96), ax=Math.cos(azimuth), az=Math.sin(azimuth);
  for(let j=0;j<=rows;j++) {
    const t=j/rows, at=t*(contour.length-1), ii=Math.min(contour.length-2,Math.floor(at)), halfWidth=.149*THREE.MathUtils.lerp(contour[ii],contour[ii+1],at-ii);
    for(let i=0;i<=cols;i++) {
      const u=i/cols, dx=(2*u-1)*halfWidth,y=1.742-.321*t, l=photoLevel(maskData,u,t);
      const relief=.037+.069*Math.sqrt(Math.max(0,1-(2*u-1)**2))+.027*l+.018*Math.cos((t-.26)*6);
      const r=.975 + relief;
      pos.push(az*r+dx*ax,y,side*(ax*r-dx*az));
      tone.copy(low).lerp(high,Math.pow(l,1.15));colors.push(tone.r,tone.g,tone.b);
      if(i&&j){const d=j*(cols+1)+i; idx.push(d-cols-2,d,d-cols-1,d-cols-2,d-1,d);}
    }
  }
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geom.setIndex(idx);geom.computeVertexNormals();
  let ci=0;s.add(geom,()=>({r:colors[ci++],g:colors[ci++],b:colors[ci++]}),identity,'metal');
  s.ring(az*1.071,1.385,side*ax*1.071,.091,.019,west?0x766b58:0xb29559,[0,side*azimuth,0],'metal',[1,1.08,1],28);
}
function giltWaterVat(west) {
  const s=new Sculpture(west?'太和殿西 · 水缸':'太和殿东 · 水缸');
  s.lathe([[0,0],[.86,0],[.875,.035],[.87,.10],[.85,.135],[0,.135]],48,shadowStone);
  // Open slots below the vat represent the historic provision for a charcoal brazier.
  for(const a of [0,PI/2,PI,PI*1.5]) {
    s.add(new THREE.BoxGeometry(.56,.19,.25),shadowStone,matrix([.65*Math.sin(a),.216,.65*Math.cos(a)],[0,a,0]));
  }
  s.lathe([[0,.28],[.83,.28],[.875,.32],[.86,.38],[.75,.395],[0,.395]],48,stone);
  const ochre=pigment(west?0x776b55:0xc8a45a), dark=pigment(west?0x37352e:0x534535), bright=pigment(west?0x9a8c70:0xdfc58a);
  const mixColor=new THREE.Color();
  function weather(x,y,z) {
    const theta=(Math.atan2(z,x)/TURN+.5)*5.0, u=Math.abs(2*(theta-Math.floor(theta)) - 1);
    const t=1-THREE.MathUtils.clamp((y-.42)/1.39,0,1), l=photoLevel(wearData,u,t);
    const scars=Math.pow(Math.max(0,Math.cos(theta*25+y*31+2*Math.sin(3*y+theta*16))),12);
    return mixColor.copy(dark).lerp(ochre,THREE.MathUtils.clamp((l-.12)*1.74*(1-.67*t*t)-.16*scars,0,1)).lerp(bright,Math.max(0,(l-.61)*1.15));
  }
  // Smooth belly, cinched mouth, rolled lip and dark hollow inner wall.
  const outside=[[.52,.387],[.58,.40],[.65,.44],[.70,.49],[.77,.55],[.84,.64],[.90,.74],[.95,.85],[.99,.98],[1.01,1.14],[1.015,1.29],[1.00,1.43],[.976,1.55],[.943,1.64],[.905,1.73],[.863,1.79],[.838,1.82],[.838,1.85],[.865,1.855],[.882,1.875],[.877,1.896],[.861,1.907],[.823,1.908]];
  const bands=[];
  for(let i=1;i<outside.length;i++){const a=outside[i-1],b=outside[i],n=Math.max(1,Math.ceil((b[1]-a[1])/.048));for(let j=0;j<n;j++)bands.push([THREE.MathUtils.lerp(a[0],b[0],j/n),THREE.MathUtils.lerp(a[1],b[1],j/n)]);}
  bands.push(outside.at(-1));s.lathe(bands,100,weather,'metal');
  s.lathe([[.823,1.908],[.808,1.894],[.802,1.865],[.809,1.83],[.83,1.79],[.87,1.70],[.92,1.52],[.96,1.27],[.91,.94],[.81,.68],[.62,.48],[0,.47]],64,0x484237,'metal');
  for (const side of [-1,1]) {
    for(const x of [-.235,.235]) bronzeMask(s,x,side,west);
    const points=[];
    for(let j=0;j<=14;j++) {
      const t=j*PI/14;
      points.push(V(.261*Math.cos(t),1.334-.211*Math.sin(t),side*(1.043+.037*Math.sin(t))));
    }
    const bail=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.022,7,false);
    s.add(bail,west?0x706654:0xb09050,identity,'metal');
  }
  return s.finish();
}

function carvedCourse(s, sample, levels, columns, rows) {
  const [w,h,packed]=sample, pixels=Uint8Array.from(atob(packed),ch=>ch.charCodeAt(0));
  const base=pigment(lightStone);
  for(let side=0;side<4;side++) {
    const pos=[],col=[],idx=[], a=side*PI/2;
    for(let j=0;j<=rows;j++) {
      const t=j/rows, at=t*(levels.length-1), i=Math.min(levels.length-2,Math.floor(at)), f=at-i;
      const radius=THREE.MathUtils.lerp(levels[i][0],levels[i+1][0],f), y=THREE.MathUtils.lerp(levels[i][1],levels[i+1][1],f);
      for(let k=0;k<=columns;k++) {
        const u=k/columns, l=pixels[Math.round(t*(h-1))*w+Math.round(u*(w-1))]/255;
        const carve=Math.sin(PI*u)*Math.sin(PI*t)*(l-.5)*.045;
        const across=(2*u-1)*radius, out=radius+carve;
        pos.push(across*Math.cos(a)+out*Math.sin(a),y,out*Math.cos(a)-across*Math.sin(a));
        const shade=.51+.47*l; col.push(base.r*shade,base.g*shade,base.b*shade);
        if(j>0 && k>0){const d=j*(columns+1)+k; idx.push(d-columns-2,d-columns-1,d,d-columns-2,d,d-1);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    let ci=0;s.add(g,()=>({r:col[ci++],g:col[ci++],b:col[ci++]}));
  }
}
function grainMeasure() {
  const s = new Sculpture('太和殿西 · 嘉量');
  s.plinth([[.86,0],[.86,.07],[.89,.09],[.89,.16],[.84,.18],[.835,.27],[.82,.30],[.818,.34],[.76,.34],[.74,.38],[.68,.43],[.66,.48],[.635,.50]],stone);
  carvedCourse(s,scroll,[[.84,.173],[.84,.275]],36,5);
  s.plinth([[.625,.50],[.625,.53],[.602,.55],[.59,.58],[.60,.60],[.63,.615],[.63,.68],[.575,.705],[.56,.725],[.56,.76],[.595,.79],[.622,.845],[.622,.88],[.615,.905]],stone);
  carvedCourse(s,scroll,[[.618,.81],[.618,.898]],36,5);
  const profile=[[.59,.907],[.54,.97],[.437,1.02],[.355,1.085],[.322,1.20],[.31,1.32],[.33,1.43],[.386,1.52],[.50,1.58],[.58,1.64],[.628,1.70]];
  carvedCourse(s,waist,profile,35,24);
  s.plinth([[.625,1.69],[.64,1.713],[.65,1.74],[.65,1.835],[.625,1.864]],lightStone);
  carvedCourse(s,scroll,[[.651,1.754],[.651,1.823]],33,4);
  // Four open windows. The original measure is square and has two smaller ears.
  for(const x of [-.465,.465]) for(const z of [-.465,.465]) {
    s.plinth([[.087,0],[.09,.029],[.084,.048],[.084,.565],[.10,.60]],stone,[x,1.852,z]);
  }
  for(const sign of [-1,1]) {
    s.box(0,2.325,sign*.465,1.08,.118,.153,shadowStone);
    s.box(sign*.465,2.325,0,.153,.118,.93,stone);
    for (const t of [-.4,.4]) {
      s.ellipsoid(t,2.314,sign*.465,.095,.064,.059,stone);
      s.ellipsoid(sign*.465,2.314,t,.059,.064,.095,stone);
    }
  }
  function cup(x,y,z,w,d,h) {
    const t=.023; s.box(x,y,z,w,.022,d,bronze,'metal');
    for(const sign of [-1,1]){
      s.box(x,y, z+sign*(d-t)/2,w,h,t,bronze,'metal');
      s.box(x+sign*(w-t)/2,y,z,t,h,d,bronze,'metal');
    }
  }
  cup(0,1.871,0,.412,.358,.235);cup(-.255,1.996,0,.114,.153,.09);cup(.255,1.996,0,.114,.153,.09);
  // Single-eaved hip-and-gable stone canopy. The centre folds continue to a
  // short raised ridge while the corners turn up at the four hip lines.
  s.plinth([[.541,2.425],[.56,2.463],[.59,2.49]],shadowStone);
  const roof=(x,z)=>{
    const sx=Math.abs(x)/.72,sz=Math.abs(z)/.64;
    const frontRise=1-sz, hipRise=1-((sx-.46)/.54);
    const t=THREE.MathUtils.clamp(Math.min(frontRise,hipRise),0,1);
    return 2.49+.28*Math.pow(t,1.3)+.045*Math.pow(sx*sz,4);
  };
  const pos=[],idx=[],cols=24,rows=16;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
    const x=(i/cols-.5)*1.44,z=(j/rows-.5)*1.28;pos.push(x,roof(x,z),z);
    if(i && j){const d=j*(cols+1)+i;idx.push(d-cols-2,d-1,d,d-cols-2,d,d-cols-1);}
  }
  const surface=new THREE.BufferGeometry();surface.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));surface.setIndex(idx);surface.computeVertexNormals();s.add(surface,shadowStone);
  for(const sign of [-1,1]){
    for(let i=0;i<=16;i++){
      const x=-.71+i*1.42/16, end=Math.max(.045,(Math.abs(x)-.335)/.385*.62);
      for(let j=0;j<3;j++){
        const from=sign*(.65-j/3*(.65-end)),to=sign*(.65-(j+1)/3*(.65-end));
        s.rod([x,roof(x,from)+.012,from],[x,roof(x,to)+.012,to],.021,.018,stone,'marble',6);
      }
    }
    for(let i=-5;i<=5;i++){
      const z=i*.092,xEnd=.34+Math.abs(z)/.64*.38;
      s.rod([sign*.724,roof(.72,z)+.018,z],[sign*xEnd,roof(xEnd,z)+.012,z],.022,.016,stone,'marble',6);
    }
    for(const sx of [-1,1]) {
      s.rod([sx*.718,roof(.718,.637)+.017,sign*.637],[sx*.336,2.783,sign*.008],.033,.025,stone,'marble',8);
    }
  }
  s.rod([-.395,2.798,0],[.395,2.798,0],.032,.032,lightStone,'marble',10);
  for(const sx of [-1,1]) s.ellipsoid(sx*.39,2.82,0,.039,.065,.035,stone);
  return s.finish();
}

function incenseBurner() {
  const s=new Sculpture('太和殿 · 鼎式铜香炉');
  s.plinth([[.51,0],[.51,.055],[.474,.087],[.474,.154],[.45,.173]],shadowStone);
  for(const a of [0,TURN/3,2*TURN/3]) {
    const p=(r,y)=>[Math.sin(a)*r,y,Math.cos(a)*r];
    s.rod(p(.319,.165),p(.288,.352),.073,.043,patina,'metal',8);
    s.rod(p(.288,.35),p(.275,.532),.043,.085,bronze,'metal',8);
  }
  s.lathe([[.05,.431],[.244,.444],[.33,.479],[.399,.565],[.445,.686],[.453,.805],[.425,.883],[.411,.919],[.438,.933],[.445,.961],[.426,.983],[.390,.987]],22,0x5f6557,'metal');
  s.lathe([[.405,.975],[.406,1.005],[.384,1.035],[.371,1.041],[.337,1.073],[.226,1.106],[.103,1.128],[.082,1.158],[.06,1.166],[.056,1.193],[.025,1.209],[0,1.212]],22,0x535b50,'metal');
  for(const sign of [-1,1]) {
    const hole=s=>[sign*(.399+s),1.017,s*.15];
    const bot=hole(0);s.rod([bot[0],.855,0],[sign*.491,1.045,0],.021,.027,bronze,'metal');
    s.rod([sign*.491,1.045,0],[sign*.505,1.100,0],.026,.022,bronze,'metal');
    s.rod([sign*.505,1.10,0],[sign*.438,1.10,0],.022,.022,bronze,'metal');
    s.rod([sign*.438,1.10,0],[sign*.416,.965,0],.022,.018,bronze,'metal');
  }
  return s.finish();
}

export function addTaiheFurniture(batch, options = {}) {
  const {floor=8.13, dialX=37.3, jialiangX=-37.3, instrumentZ=24.2, vatX=39.3, vatZ=9.0, siteYaw=.0356}=options;
  const at=(obj,x,y,z)=>{obj.position.set(x,y,z);batch.decals.push(obj);};
  at(sundial(siteYaw),dialX,floor,instrumentZ);at(grainMeasure(),jialiangX,floor,instrumentZ);
  at(giltWaterVat(false),vatX,floor,vatZ);at(giltWaterVat(true),-vatX,floor,vatZ);
  // Visible sequence in the frontal survey photograph: six at the top, four on
  // each of the next two landings and four at plaza level flanking the stairs.
  const burner=incenseBurner();
  for(const [y,z,xs] of [[floor,25.09,[8.1,22.4,32.5]],[5.49,29.62,[8.1,22.6]],[2.86,34.12,[8.1,22.9]],[.285,41.5,[8.1,23.1]]]){
    for (const x of xs) for(const sign of [-1,1]) at(burner.clone(),sign*x,y,z);
  }
}
