import {addPrecinctContext} from './heritage/precinct-context.js';
import * as THREE from 'three';
import { buildTiananmenGate } from './heritage/gate.js';
import { palacePaint } from './ornaments/palace-swatch.js';
import { paintedPanels } from './ornaments/tiantan-swatches.js';
import { buildTaiheHall, finishPalaceCourtHall } from './heritage/palace.js';
import { palaceRoofs } from './data/palace-roofs.js';

// Geodetic anchors are WGS84 points. Distances and local XYZ are metres.
export const landmarks = [
  {id:'palace',name:'故宫 · 太和殿',short:'太和殿',en:'Hall of Supreme Harmony',area:'故宫博物院',category:'宫殿建筑',lon:116.3908139,lat:39.9158956,height:35.05,description:'从太和门望向北侧，三层汉白玉台基托起十一开间的太和殿。双层庑殿顶沿中轴依次衔接中和殿与保和殿。',source:'故宫博物院',url:'https://www.dpm.org.cn/explore/building/236465.html',coordUrl:'https://www.openstreetmap.org/way/638449347',view:{distance:174,azimuth:153,elevation:23,targetHeight:14},walkDistance:98},
  {id:'tiananmen',name:'天安门城楼',short:'天安门',en:'Tian’anmen Gate',area:'北京中轴线',category:'城门建筑',lon:116.3912643,lat:39.9073379,height:34.7,description:'城台中央并列五座拱门。重檐城楼位于金水桥以北，向南面对长安街与天安门广场。',source:'北京旅游网',url:'https://english.visitbeijing.com.cn/article/47OMXTgi9vO',coordUrl:'https://www.openstreetmap.org/relation/8847697',view:{distance:156,azimuth:161,elevation:15,targetHeight:12},walkDistance:96},
  {id:'tiantan',name:'天坛 · 祈年殿',short:'祈年殿',en:'Hall of Prayer for Good Harvests',area:'天坛公园',category:'坛庙建筑',lon:116.4066228,lat:39.8822511,height:36.8,description:'沿丹陛桥向北，三层蓝色琉璃檐收束于鎏金宝顶。三层圆形坛台的直径逐层收小，石栏环绕四周。',source:'北京市公园管理中心',url:'https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/201912/t20191211_1048233.html',coordUrl:'https://www.openstreetmap.org/way/43921139',view:{distance:121,azimuth:151,elevation:17,targetHeight:15},walkDistance:72},
  {id:'ncpa',name:'国家大剧院',short:'国家大剧院',en:'National Centre for the Performing Arts',area:'长安街',category:'文化建筑',lon:116.3835479,lat:39.9033429,height:46.68,description:'东西向展开的椭球形壳体坐落在人工湖中。钛金属板之间嵌有玻璃幕墙，沿曲面呈现舞台拉幕般的开口。',source:'北京旅游网',url:'https://english.visitbeijing.com.cn/article/47OLPrOYiDE',coordUrl:'https://www.openstreetmap.org/way/4974233',view:{distance:286,azimuth:153,elevation:20,targetHeight:18},walkDistance:146},
  {id:'stadium',name:'国家体育场 · 鸟巢',short:'鸟巢',en:'National Stadium',area:'奥林匹克公园',category:'体育建筑',lon:116.390285,lat:39.991415,height:69,description:'钢桁架沿椭圆形看台交织，外缘随马鞍形屋面起伏。主体育场南北长333米，东西宽296米。',source:'北京市人民政府',url:'https://www.beijing.gov.cn/renwen/rwzyd/qxdw/shaozhcqychy/gjtyc/202309/t20230921_3263702.html',coordUrl:'https://www.openstreetmap.org/relation/563404',view:{distance:490,azimuth:144,elevation:25,targetHeight:24},walkDistance:204},
  {id:'cube',name:'国家游泳中心 · 水立方',short:'水立方',en:'National Aquatics Center',area:'奥林匹克公园',category:'体育建筑',lon:116.3841726,lat:39.9915785,height:30,description:'与鸟巢隔轴相望的方形场馆以ETFE膜气枕构成外表皮。沿街观察，可见尺度各异的多边形气泡拼接成幕墙。',source:'奥雅纳 Arup',url:'https://www.arup.com/en-us/projects/national-aquatics-center-water-cube/',coordUrl:'https://www.openstreetmap.org/way/29201257',view:{distance:291,azimuth:143,elevation:19,targetHeight:12},walkDistance:151},
  {id:'cctv',name:'央视总部大楼',short:'央视总部',en:'CCTV Headquarters',area:'北京商务中心区',category:'当代建筑',lon:116.4579633,lat:39.9138111,height:234,description:'两座倾斜塔体在高空通过悬挑体连接，围合出通透的立体环形。外露斜交网格在转折部位形成鲜明的轮廓。',source:'OMA 建筑事务所',url:'https://www.oma.com/projects/cctv-headquarters',coordUrl:'https://www.openstreetmap.org/relation/7820447',view:{distance:427,azimuth:150,elevation:15,targetHeight:106},walkDistance:179},
  {id:'zun',name:'中信大厦 · 中国尊',short:'中国尊',en:'CITIC Tower',area:'北京商务中心区',category:'超高层建筑',lon:116.4602357,lat:39.911501,height:528,description:'建筑以古代礼器“尊”为原型。圆角方形平面从78米宽的基部收至54米的腰部，再向顶部舒展至69米。',source:'KPF 建筑事务所',url:'https://www.kpf.com/project/citic-tower-china-zun',coordUrl:'https://www.openstreetmap.org/way/599547918',view:{distance:771,azimuth:147,elevation:13,targetHeight:235},walkDistance:195}
];

const tau = Math.PI * 2;
const mix = (a,b,t) => a + (b-a)*t;
const lerp3 = (a,b,t) => [mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];
const rgb = new Map();
function color(h) {
  if (!rgb.has(h)) { const c = new THREE.Color(h); rgb.set(h,[c.r,c.g,c.b]); }
  return rgb.get(h);
}
const p = {stone:0xd7cbb0, lightStone:0xe9dfc9, ash:0x9b9588, red:0xa63e2c, brick:0xa85240, lacquer:0x9d3226, darkRed:0x662c23, door:0x793623, shadow:0x402e29, blue:0x21536a, turq:0x287673, jade:0x7b9979, tile:0xe3a33c, ridge:0xf1bd54, roofDark:0xa56a2d, crown:0xe9b557, glass:0x7195a8, glassDark:0x436176, steel:0xb0bbc2 };
class Batch {
  constructor() { this.groups=new Map();this.edges=[];this.edgeColors=[];this.decals=[];this.footprints=[]; }
  group(k) { if (!this.groups.has(k)) this.groups.set(k,{pos:[],col:[],idx:[]});return this.groups.get(k); }
  face(points,c,mat='solid') {
    const g=this.group(mat), i=g.pos.length/3, tint=color(c);
    for(const v of points){g.pos.push(...v);g.col.push(...tint);}
    for(let n=1;n+1<points.length;n++) g.idx.push(i,i+n,i+n+1);
  }
  line(a,b,c) {this.edges.push(...a,...b);const tint=color(c);this.edgeColors.push(...tint,...tint);}
  box(x,y,z,w,h,d,c,mat='solid') {
    const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,b=y,t=y+h;
    const v=[[x0,b,z0],[x1,b,z0],[x1,b,z1],[x0,b,z1],[x0,t,z0],[x1,t,z0],[x1,t,z1],[x0,t,z1]];
    for(const ids of [[4,7,6,5],[0,1,2,3],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]]) this.face(ids.map(i=>v[i]),c,mat);
  }
  beam(a,b,width,c,depth=width,mat='solid') {
    const dir=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]);if(dir.lengthSq()<1e-7)return;
    dir.normalize();
    const side=new THREE.Vector3().crossVectors(dir,Math.abs(dir.y)>.97?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize();
    const normal=new THREE.Vector3().crossVectors(side,dir).normalize();
    const s=side.multiplyScalar(width/2),n=normal.multiplyScalar(depth/2);
    const ring=v=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,j])=>[v[0]+s.x*i+n.x*j,v[1]+s.y*i+n.y*j,v[2]+s.z*i+n.z*j]);
    const l=ring(a),r=ring(b);for(let i=0;i<4;i++)this.face([l[i],r[i],r[(i+1)%4],l[(i+1)%4]],c,mat);
    this.face(l,c,mat);this.face([...r].reverse(),c,mat);
  }
  lathe(x,z,levels,segments,c,mat='solid') {
    for(let k=0;k<levels.length-1;k++){
      const [r0,y0]=levels[k],[r1,y1]=levels[k+1];
      for(let i=0;i<segments;i++){
        const a=i*tau/segments,b=(i+1)*tau/segments;
        this.face([[x+r0*Math.cos(a),y0,z+r0*Math.sin(a)],[x+r1*Math.cos(a),y1,z+r1*Math.sin(a)],[x+r1*Math.cos(b),y1,z+r1*Math.sin(b)],[x+r0*Math.cos(b),y0,z+r0*Math.sin(b)]],c,mat);
      }
    }
  }
  cylinder(x,z,y,r,h,c,seg=12,mat='solid'){this.lathe(x,z,[[r,y],[r,y+h],[0,y+h]],seg,c,mat);}
  rectFoot(x,z,w,d){this.footprints.push([[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]]);}
  build() {
    const result=new THREE.Group();
    for(const [key,g] of this.groups) {
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.Float32BufferAttribute(g.pos,3));
      geometry.setAttribute('color',new THREE.Float32BufferAttribute(g.col,3));
      geometry.setIndex(g.idx);geometry.computeVertexNormals();geometry.computeBoundingSphere();
      const opt={vertexColors:true,side:THREE.DoubleSide,roughness:.78,metalness:.035};
      if(key==='metal')Object.assign(opt,{roughness:.38,metalness:.36});
      if(key==='glaze')Object.assign(opt,{roughness:.32,metalness:.10});
      if(key==='glass')Object.assign(opt,{roughness:.2,metalness:.23});
      const mat=new THREE.MeshStandardMaterial(opt),mesh=new THREE.Mesh(geometry,mat);
      mat.name='Landmark '+key;mesh.receiveShadow=true;mesh.castShadow=key!=='ground';result.add(mesh);
    }
    if(this.edges.length){
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(this.edges,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(this.edgeColors,3));
      result.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.76})));
    }
    for(const decal of this.decals) result.add(decal);
    return result;
  }
}
function decal(b,x,y,z,w,h,text,bg,fg,vertical=false) {
  if(typeof document==='undefined')return;
  const cvs=document.createElement('canvas');cvs.width=vertical?96:Math.max(128,Math.min(1536,Math.ceil(w/h*96)));cvs.height=vertical?256:96;
  const ctx=cvs.getContext('2d');if(!ctx)return;
  ctx.fillStyle=bg;ctx.fillRect(0,0,cvs.width,cvs.height);ctx.strokeStyle=fg;ctx.lineWidth=3;ctx.strokeRect(4,4,cvs.width-8,cvs.height-8);
  ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold '+(vertical?57:55)+'px "Noto Serif CJK SC","Songti SC",serif';
  if(vertical){Array.from(text).forEach((ch,i)=>ctx.fillText(ch,cvs.width/2,(i+.5)*cvs.height/Array.from(text).length));}else ctx.fillText(text,cvs.width/2,cvs.height/2,cvs.width-12);
  const tex=new THREE.CanvasTexture(cvs);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,polygonOffset:true,polygonOffsetFactor:-2}));
  mesh.position.set(x,y,z);b.decals.push(mesh);
}
function steps(b,x,z,y,width,rise,depth,sign=1,n=12) {
  for(let i=0;i<n;i++){
    const t=(i+.5)/n;
    b.box(x,y,z+sign*depth*(1-t),width,rise*(i+1)/n,depth/n+.02,i%4===0?p.lightStone:p.stone);
  }
  for(const side of [-1,1]) b.beam([x+side*width*.51,y+.26,z+sign*depth],[x+side*width*.51,y+rise+.26,z],.34,p.lightStone,.5);
}
function rail(b,x1,z1,x2,z2,y,n) {
  const a=[x1,y,z1],c=[x2,y,z2];for(let i=0;i<=n;i++) {
    const [x,,z]=lerp3(a,c,i/n);b.box(x,y,z,.42,1.2,.42,p.lightStone);
    if(i%2===0) b.box(x,y+1.2,z,.55,.18,.55,p.stone);
  }
  for(const [h,w] of [[.32,.26],[.82,.20]])b.beam([x1,y+h,z1],[x2,y+h,z2],w,p.stone,.2);
}
function terrace(b,x,z,w,d,h,rich=true) {
  for(let i=0;i<3;i++) {
    const width=w-i*3.8, depth=d-i*3.8,y=h*i/3;
    b.box(x,y,z,width,h/3,depth,p.stone);
    b.box(x,y+h/3-.26,z,width+.55,.32,depth+.55,p.lightStone);
    if(rich){
      for(const s of [-1,1]){
        const edge=z+s*depth/2,cut=Math.min(10,width*.17);
        rail(b,x-width/2,edge,x-cut,edge,y+h/3,Math.ceil(width/7));
        rail(b,x+cut,edge,x+width/2,edge,y+h/3,Math.ceil(width/7));
        rail(b,x+s*width/2,z-depth/2,x+s*width/2,z+depth/2,y+h/3,Math.ceil(depth/4.3));
      }
    }
  }
  for(const s of [-1,1])steps(b,x,z+s*(d/2-4),0,Math.min(18,w*.23),h,Math.max(7,h*1.8),s);
}
function roof(b,x,y,z,w,d,rise,opts={}) {
  const low=opts.low??false,rich=opts.rich??true,roofColor=opts.color??p.tile,ridgeColor=opts.ridge??p.ridge;
  const ridgeLength=opts.pyramid?0.01:opts.gable?w*.80:Math.max(w*.13,w-d*.90);
  // Four sloping planes. Their eaves rise toward the corner, while the middle of each slope is concave.
  const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],tops=[[-ridgeLength/2,0],[ridgeLength/2,0],[ridgeLength/2,0],[-ridgeLength/2,0]];
  const peakAt=low?.64:1;
  function get(face,u,t) {
    const q=(face+1)%4,cu=mix(corners[face][0],corners[q][0],u),cv=mix(corners[face][1],corners[q][1],u);
    const innerScale=low?.67:0;
    const tu=low?cu*innerScale:mix(tops[face][0],tops[q][0],u),tv=low?cv*innerScale:0;
    const lift=(rich?.095:.07)*Math.min(d,w)*Math.pow(Math.abs(2*u-1),3.5);
    const sideT=opts.gable&&!low?Math.min(1,t/.395):t;
    return [x+mix(cu,tu,sideT),y+rise*Math.pow(t,1.42)*peakAt+lift*(1-t)**1.5,z+mix(cv,tv,t)];
  }
  const cols=rich?26:10,rows=rich?8:4;
  for(let side=0;side<4;side++) {
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++) {
      const a=get(side,i/cols,j/rows),c=get(side,(i+1)/cols,(j+1)/rows);
      const gableFace=opts.gable&&(side===1||side===3)&&j/rows>=.375;
      b.face([a,get(side,(i+1)/cols,j/rows),c,get(side,i/cols,(j+1)/rows)],gableFace?(j%2===0?p.darkRed:p.shadow):roofColor);
    }
    const width=side%2===0?w:d,ribs=rich?Math.min(108,Math.ceil(width/.75)):Math.ceil(width/2.6);
    for(let i=0;i<=ribs;i++)for(let j=0;j<rows;j++){
      const a=get(side,i/ribs,j/rows),c=get(side,i/ribs,(j+1)/rows);a[1]+=.046;c[1]+=.046;
      b.line(a,c,opts.gable&&(side===1||side===3)&&j/rows>=.375?p.stone:i%3===0?ridgeColor:p.roofDark);
    }
    for(let i=0;i<cols;i++){
      const a=get(side,i/cols,0),c=get(side,(i+1)/cols,0);
      b.beam(a,c,rich?.38:.32,ridgeColor,.32);
      const a2=[a[0],a[1]-.46,a[2]],c2=[c[0],c[1]-.46,c[2]];
      b.face([a,c,c2,a2],p.roofDark);
    }
    for(let j=0;j<rows;j++)b.beam(get(side,0,j/rows),get(side,0,(j+1)/rows),rich?.48:.35,ridgeColor);
    if(rich&&!low) for(let j=1;j<=6;j++) {
      const a=get(side,0,j/19),r=.20+j*.013;b.lathe(a[0],a[2],[[r*.8,a[1]],[r,a[1]+.23],[r*.5,a[1]+.54],[0,a[1]+.69]],6,ridgeColor);
    }
  }
  if(!low){
    b.box(x,y+rise-.08,z,Math.max(.35,ridgeLength),.42,.56,ridgeColor);
    for(const sign of [-1,1]) {
      const a=x+sign*ridgeLength/2;
      b.lathe(a,z,[[.43,y+rise],[.55,y+rise+.42],[.30,y+rise+1.05],[0,y+rise+1.38]],8,ridgeColor);
    }
  }
}
function paintedPalaceBeam(b,x,y,z,width,height,repeats) {
  const [sw,sh,raw]=palacePaint,bytes=Uint8Array.from(atob(raw),v=>v.charCodeAt(0)),n=sw*repeats;
  for(let j=0;j<sh;j++)for(let i=0;i<n;i++){
    const col=3*((sh-1-j)*sw+i%sw),c=(bytes[col]<<16)|(bytes[col+1]<<8)|bytes[col+2];
    const a=x+width*(i/n-.5),d=a+width/n,yy=y+j*height/sh;
    b.face([[a,yy,z],[d,yy,z],[d,yy+height/sh,z],[a,yy+height/sh,z]],c);
  }
  if(typeof document==='undefined')return;
  const img=new THREE.TextureLoader().load(new URL('./ornaments/palace-frieze.webp',import.meta.url).href);
  img.colorSpace=THREE.SRGBColorSpace;img.wrapS=THREE.RepeatWrapping;img.repeat.x=repeats;img.anisotropy=8;
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({map:img,roughness:.82,side:THREE.DoubleSide}));
  panel.userData.cpuBaked=true;panel.position.set(x,y+height/2,z+.032);b.decals.push(panel);
}

function hall(b,x,z,w,d,floor,top,opts={}) {
  const detailed=opts.rich??true, red=opts.red??p.red, bays=opts.bays??Math.max(3,Math.round(w/6)), double=opts.double??true;
  const wallH=(top-floor)*(double?.37:.46),colRadius= Math.max(.22,Math.min(.71,w/105));
  const fx=w*.87,fz=d*.82;
  b.box(x,floor,z,w*.90,wallH*.89,d*.87,red);
  for(const s of [-1,1]){
    const face=z+s*fz/2;
    for(let i=0;i<bays;i++){
      const bx=x+((i+.5)/bays-.5)*fx,span=fx/bays*.81;
      b.box(bx,floor+.30,face+s*.51,span,wallH*.76,.24,p.door);
      if(detailed){
        b.box(bx,floor+wallH*.36,face+s*.64,span*.88,wallH*.4,.08,p.shadow);
        for(let j=-2;j<=2;j++)b.box(bx+j*span*.162,floor+wallH*.36,face+s*.7,.069,wallH*.4,.09,p.brick);
        for(let j=0;j<4;j++)b.box(bx,floor+wallH*(.38+j*.11),face+s*.72,span*.9,.07,.09,p.brick);
        b.box(bx,floor+.42,face+s*.65,.1,wallH*.7,.09,p.brick);
      }
    }
    for(let i=0;i<=bays;i++){
      const cx=x+(i/bays-.5)*w*.94,cz=z+s*d*.49;
      b.cylinder(cx,cz,floor,colRadius,wallH,p.lacquer,8);
      if(detailed){
        b.cylinder(cx,cz,floor,colRadius*1.4,.32,p.ash,8);
        b.box(cx,floor+wallH-.8,cz,colRadius*2.8,.37,colRadius*2.8,p.turq);
        b.box(cx,floor+wallH-.43,cz,colRadius*4.4,.37,colRadius*3.4,p.jade);
      }
    }
  }
  const bandY=floor+wallH;
  b.box(x,bandY-.15,z,w*.99,.85,d*.99,p.turq);b.box(x,bandY+.63,z,w*1.015,.29,d*1.015,p.crown);
  if(detailed){
    for(const sign of [-1,1]) for(let i=0;i<bays*2;i++) {
      const cx=x+((i+.5)/(bays*2)-.5)*w*.98, cz=z+sign*d*.505;
      b.face([[cx-1,bandY+.10,cz],[cx,bandY+.48,cz],[cx+1,bandY+.10,cz],[cx,bandY-.05,cz]],p.jade);
    }
  }
  const eave=bandY+.9, upperTop=top-1.35;
  if(double){
    const upperEave=eave+(upperTop-eave)*.43;
    roof(b,x,eave,z,w*1.13,d*1.16,(upperEave-eave)*1.10,{low:true,rich:detailed});
    b.box(x,eave+1.0,z,w*.77,upperEave-eave-1,d*.70,p.darkRed);
    b.box(x,upperEave-.68,z,w*.82,.68,d*.75,p.blue);
    if(opts.plaque==='太和殿'){
      paintedPalaceBeam(b,x,bandY-.12,z+d*.508,w*.978,.91,3);
      paintedPalaceBeam(b,x,upperEave-.88,z+d*.387,w*.815,.99,3);
      if(typeof document!=='undefined'){
        const img=new THREE.TextureLoader().load(new URL('./ornaments/palace-plaque.webp',import.meta.url).href);
        img.colorSpace=THREE.SRGBColorSpace;img.anisotropy=6;
        const plate=new THREE.Mesh(new THREE.PlaneGeometry(2.54,2.60),new THREE.MeshBasicMaterial({map:img}));
        plate.position.set(x,upperEave-.64,z+d*.419);
        plate.userData.panelUrl='./ornaments/palace-plaque.webp';b.decals.push(plate);
      }
    }
    roof(b,x,upperEave,z,w*.99,d*.98,upperTop-upperEave,{rich:detailed,pyramid:opts.pyramid,gable:opts.gable});
  }else roof(b,x,eave,z,w*1.14,d*1.18,upperTop-eave,{rich:detailed,pyramid:opts.pyramid,gable:opts.gable});
  if(opts.plaque&&opts.plaque!=='太和殿')decal(b,x,bandY+.12,z+d*.508,Math.max(3,w*.077),1.7,opts.plaque,'#23415a','#dfb75c');
  b.rectFoot(x,z,w*1.12,d*1.13);
}
function archedGate(b,x,z,w,d,h,num=5) {
  const span=Math.min(w*.16,14),cz=i=>x+(i-(num-1)/2)*span;
  const lower=y=>y*(num===5?.37:.61);
  // Open vaults extend right through the brick platform, with continuous masonry over the haunches.
  let left=x-w/2;
  for(let i=0;i<num;i++) {
    const cx=cz(i),r=i===(num-1)/2?3.65:2.65,sy=lower(h*.7);
    const xleft=cx-r,xright=cx+r;
    b.box((left+xleft)/2,0,z,xleft-left,h,d,p.brick);
    b.box((left+xleft)/2,0,z,(xleft-left)+.05,.69,d+.28,p.ash);
    for(let j=0;j<12;j++){
      const t1=Math.PI-Math.PI*j/12,t2=Math.PI-Math.PI*(j+1)/12;
      const a=cx+r*Math.cos(t1),b1=cx+r*Math.cos(t2),ya=sy+r*Math.sin(t1),yb=sy+r*Math.sin(t2);
      for(const s of [-1,1]) {
        const zz=z+s*d*.5;
        b.face([[a,ya,zz],[b1,yb,zz],[b1,h,zz],[a,h,zz]],p.brick);
        b.beam([a,ya,zz+s*.09],[b1,yb,zz+s*.09],.28,p.ash,.4);
      }
      b.face([[a,ya,z-d/2],[b1,yb,z-d/2],[b1,yb,z+d/2],[a,ya,z+d/2]],p.darkRed);
    }
    for(const sw of [-1,1]){
      const xx=cx+sw*r;
      b.face([[xx,0,z+d/2],[xx,sy,z+d/2],[xx,sy,z-d/2],[xx,0,z-d/2]],p.darkRed);
    }
    left=xright;
  }
  b.box((x+w/2+left)/2,0,z,x+w/2-left,h,d,p.brick);
  b.box(x,h-.1,z,w,.6,d+.65,p.lightStone);
  b.rectFoot(x,z,w,d);
}
function mappedPalaceRoofs(b) {
  const handmade = b.footprints.slice();
  function inside(x,z,poly) {
    let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const [ax,az]=poly[i],[bx,bz]=poly[j];
      if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)hit=!hit;
    }return hit;
  }
  function clip(poly,fn) {
    const out=[];for(let i=0;i<poly.length;i++){
      const a=poly[i],v=poly[(i+1)%poly.length],sa=fn(a),sv=fn(v);
      if(sa>=-1e-6)out.push(a);
      if((sa>0)!==(sv>0)){const t=sa/(sa-sv);out.push([mix(a[0],v[0],t),mix(a[1],v[1],t)]);}
    }return out;
  }
  for(const [,ring,axis,tagH,tagRoof,shape,colour] of palaceRoofs) {
    const center=ring.reduce(([x,z],[u,v])=>[x+u/ring.length,z+v/ring.length],[0,0]);
    if(handmade.some(poly=>inside(...center,poly)))continue;
    const c=Math.cos(axis),s=Math.sin(axis),uv=ring.map(([x,z])=>[x*c+z*s,-x*s+z*c]);
    const us=uv.map(p=>p[0]),vs=uv.map(p=>p[1]),u0=Math.min(...us),u1=Math.max(...us),v0=Math.min(...vs),v1=Math.max(...vs);
    const w=u1-u0,d=v1-v0;
    const h=tagH??Math.max(5.2,Math.min(13,3.8+Math.min(w,d)*.32));
    const cap=Math.min(h-.8,tagRoof??Math.max(1.8,Math.min(5,Math.min(w,d)*.22)));
    const rise=h-cap;
    const pitchW=shape==='pyramidal'?w/2:Math.min(w/2,d/2);
    const distances=[q=>(q[1]-v0)/(d/2),q=>(v1-q[1])/(d/2)];
    if(shape!=='gabled')distances.push(q=>(q[0]-u0)/pitchW,q=>(u1-q[0])/pitchW);
    const pos=(q,y)=>[q[0]*c-q[1]*s,y,q[0]*s+q[1]*c];
    const roofH=t=>rise+cap*Math.max(0,t)**1.25;
    const tint=colour==='#FB994D'?0xca8b3b:colour==='LightGrey'?0x9a938a:colour==='DarkGrey'?0x77766c:0xa38a65;
    const ext=colour==='#FB994D'?0xa95a43:0x9a7764;
    for(let edge=0;edge<uv.length;edge++){
      const a=uv[edge],v=uv[(edge+1)%uv.length],middle=(v0+v1)/2;
      let splits=[a,v];
      if((a[1]<middle)!==(v[1]<middle)){
        const t=(middle-a[1])/(v[1]-a[1]);splits=[a,[mix(a[0],v[0],t),middle],v];
      }
      for(let i=0;i<splits.length-1;i++){
        const left=splits[i],right=splits[i+1];
        const ha=roofH(Math.min(...distances.map(f=>f(left)))),hb=roofH(Math.min(...distances.map(f=>f(right))));
        b.face([pos(left,.22),pos(right,.22),pos(right,hb),pos(left,ha)],ext);
        b.line(pos(left,ha),pos(right,hb),p.roofDark);
      }
    }
    for(let side=0;side<distances.length;side++){
      let facet=uv;
      for(let other=0;other<distances.length;other++){
        if(side!==other)facet=clip(facet,q=>distances[other](q)-distances[side](q));
      }
      if(facet.length<3)continue;
      for(const [t0,t1] of [[0,.45],[.45,1.01]]){
        const piece=clip(clip(facet,q=>distances[side](q)-t0),q=>t1-distances[side](q));
        if(piece.length>=3)b.face(piece.map(q=>pos(q,roofH(distances[side](q)))),tint);
      }
      for(let i=0;i<facet.length;i++){
        const a=facet[i],v=facet[(i+1)%facet.length];
        b.line(pos(a,roofH(distances[side](a))+.035),pos(v,roofH(distances[side](v))+.035),p.roofDark);
      }
    }
    b.footprints.push(ring);
  }
}

function palace(b) {
  const south=391,north=-562,half=376.5;
  // Rectangular wall with openings at the principal gates. The moat and the unmodelled courts come from the map layer.
  for(const sign of [-1,1]){
    b.box(sign*half,0,(south+north)/2,8.5,9.6,south-north,p.brick);
    b.box(sign*half,9.6,(south+north)/2,8.8,.55,south-north,p.ash);
    for(const z of [south,north]) {
      const len=half-46;
      b.box(sign*(46+len/2),0,z,len,9.6,8.5,p.brick);
      b.box(sign*(46+len/2),9.6,z,len,.55,9,p.ash);
      b.rectFoot(sign*(46+len/2),z,len,9);
    }
    b.rectFoot(sign*half,(south+north)/2,9,south-north);
  }
  // Meridian Gate, the embracing wings, four corner towers and Gate of Divine Prowess.
  archedGate(b,0,south,96,25,12.4,3); hall(b,0,south,64,22,12.9,35,{bays:9,rich:false});
  for(const s of [-1,1]){
    b.box(s*50,0,south+22,15,12,65,p.brick); b.rectFoot(s*50,south+22,18,66);
    hall(b,s*50,south+41,21,19,12,26,{bays:3,rich:false,pyramid:true});
    hall(b,s*50,south-4,23,17,12,24,{bays:3,rich:false});
    for(const z of [south,north]){
      b.box(s*half,8.6,z,24,2.7,23,p.stone);
      hall(b,s*half,z,24,18,11.3,23,{bays:3,rich:false});
      hall(b,s*half,z,14,15,18.2,27,{bays:3,pyramid:true,rich:false});
    }
  }
  archedGate(b,0,north,53,24,10.6,3);
  hall(b,0,north,42,19,11.2,28,{bays:5,rich:false});
  // The gate, three great halls and inner court use north–south spacings from the published coordinates.
  terrace(b,0,212,72,34,3.8,false);
  hall(b,0,212,54,26,3.8,24,{bays:9,rich:false,gable:true});
  finishPalaceCourtHall(b,212,54,26,3.8,24,{bays:9,gable:true});
  for(const s of [-1,1]) {
    hall(b,s*66,212,72,10,.46,10,{rich:false,double:false});
    b.box(s*99,0,104,4.6,5.5,198,p.brick);
    b.box(s*99,5.5,104,5.8,.60,198,p.roofDark);
  }
  b.box(0,.25,-86,82,2.0,129,p.stone);
  buildTaiheHall(b);
  terrace(b,0,-65,49,44,7.8,false);
  hall(b,0,-65,24.15,24.15,7.8,27,{double:false,pyramid:true,bays:3});
  finishPalaceCourtHall(b,-65,24.15,24.15,7.8,27,{double:false,pyramid:true,bays:3,rich:true});
  terrace(b,0,-126,84,48,7.8,false);
  hall(b,0,-126,49.68,24.97,7.8,29.5,{bays:9,rich:false,gable:true});
  finishPalaceCourtHall(b,-126,49.68,24.97,7.8,29.5,{bays:9,gable:true});
  for(const [z,w,d,h] of [[-217,32,13,16],[-317,47,24,25],[-354,19,19,19],[-386,41,22,23]]){
    terrace(b,0,z,w+12,d+10,3.7,false);
    hall(b,0,z,w,d,3.7,h,{double:w>31,pyramid:w===19,rich:false});
  }
  mappedPalaceRoofs(b);
}
function tiananmen(b){buildTiananmenGate(b);}
function paintedBand(b,{r0,r1,y0,y1,motif,repeats}){
  const [sw,sh,raw]=paintedPanels[motif],bytes=Uint8Array.from(atob(raw),s=>s.charCodeAt(0));
  const n=sw*repeats,at=(a,t)=>[Math.cos(a)*mix(r0,r1,t),mix(y0,y1,t),Math.sin(a)*mix(r0,r1,t)];
  for(let j=0;j<sh;j++){
    const low=j/sh,hi=(j+1)/sh;
    for(let i=0;i<n;i++){
      const a=tau*i/n,d=tau*(i+1)/n,px=3*((sh-1-j)*sw+i%sw);
      const color=(bytes[px]<<16)|(bytes[px+1]<<8)|bytes[px+2];
      b.face([at(a,low),at(a,hi),at(d,hi),at(d,low)],color);
    }
  }
  if(typeof document==='undefined')return;
  const geo=new THREE.CylinderGeometry(r1+.026,r0+.026,y1-y0,144,1,true);
  const img=new THREE.TextureLoader().load(new URL('./ornaments/'+motif+'.webp',import.meta.url).href);
  img.colorSpace=THREE.SRGBColorSpace;img.wrapS=THREE.RepeatWrapping;img.repeat.x=repeats;img.anisotropy=8;
  const mat=new THREE.MeshStandardMaterial({map:img,roughness:.8,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});
  const mesh=new THREE.Mesh(geo,mat);mesh.position.y=(y0+y1)/2;mesh.userData.cpuBaked=true;mesh.receiveShadow=true;b.decals.push(mesh);
}
function glazedBlueRoof(b,outer,inner,y0,y1,flutes) {
  const segments=flutes*3,rows=8,tonal=[0x36405a,0x4b5269,0x303950];
  function tip(a,y,r){return [r*Math.cos(a),y,r*Math.sin(a)];}
  function roofPos(i,j) {
    const a=tau*i/segments,t=j/rows,wave=i%3===1?.075:0;
    return tip(a,mix(y0,y1,t**1.65)+wave*(1-.63*t),mix(outer,inner,t));
  }
  for(let i=0;i<segments;i++){
    for(let j=0;j<rows;j++) {
      const c=tonal[i%3];
      b.face([roofPos(i,j),roofPos(i,j+1),roofPos(i+1,j+1),roofPos(i+1,j)],c,'glaze');
    }
    if(i%3!==0)continue;
    const a=tau*(i+1)/segments,half=tau/segments*.90,rad=outer+.07,cy=y0-.035,size=Math.min(.129,Math.PI*outer/flutes*.71);
    const point=(u,v)=>[rad*Math.cos(a)-Math.sin(a)*u,cy+v,rad*Math.sin(a)+Math.cos(a)*u];
    b.face(Array.from({length:7},(_,k)=>point(size*Math.cos(tau*k/7),size*Math.sin(tau*k/7))),i%12===0?0x52647c:0x485971,'glaze');
    b.line(tip(a+half,y0+.02,outer-.25),tip(a+half,y0+.035,outer-.72),0x796445);
  }
  // Layered ceramic lips, red eave plank, and the tiny warm ceramic / timber tail ends visible below.
  for(const [dy,rad,h,tint] of [[-.44,outer-.27,.12,0x4e352f],[-.32,outer-.18,.15,0x936041],[-.17,outer-.06,.12,0x32394a]]){
    b.lathe(0,0,[[rad,y0+dy],[rad,y0+dy+h]],flutes,tint);
  }
  for(let i=0;i<flutes;i+=2){
    const a=i*tau/flutes,span=tau/flutes*.43;
    b.face([tip(a,y0-.51,outer-.34),tip(a+span,y0-.51,outer-.34),tip(a+span,y0-.35,outer-.37),tip(a,y0-.35,outer-.37)],i%4===0?0xc7a46b:0xb6a685);
  }
}
function tiantan(b) {
  for(const [n,[r,y,h]] of [[45.15,0,1.75],[39.65,1.75,1.75],[34.1,3.50,1.70]].entries()){
    b.lathe(0,0,[[r-.7,y],[r,y+.26],[r-.55,y+.54],[r-.55,y+h-.28],[r+.12,y+h-.10],[r+.12,y+h],[0,y+h]],96,p.lightStone);
    for(let i=0;i<76;i++){
      const a=i*tau/76,a2=(i+1)*tau/76;
      if(Math.abs(Math.sin(2*a))<.10||Math.abs(Math.sin(2*a2))<.10)continue;
      const c=[r*Math.cos(a),y+h,r*Math.sin(a)],d=[r*Math.cos(a2),y+h,r*Math.sin(a2)];
      b.box(c[0],y+h,c[2],.47,1.22,.46,p.lightStone);b.cylinder(c[0],c[2],y+h+1.20,.27,.26,p.stone,8);
      for(const hh of [.32,.89])b.beam([c[0],c[1]+hh,c[2]],[d[0],d[1]+hh,d[2]],.22,p.stone,.24);
    }
    if(n===2)for(const s of [-1,1])steps(b,0,s*33.5,0,7.7,5.20,16,s);
  }
  const loc=(a,r,y)=>[r*Math.cos(a),y,r*Math.sin(a)];
  const rect=(a,r,half,y0,y1,color)=>b.face([loc(a-half,r,y0),loc(a+half,r,y0),loc(a+half,r,y1),loc(a-half,r,y1)],color);
  // The outer colonnade is divided into twelve bays. Carved door leaves alternate with recessed lattice panels.
  const foot=5.2,wall=13.65;
  b.lathe(0,0,[[wall,foot],[wall,10.67]],120,0x7a3c32);
  for(let i=0;i<12;i++){
    const a=Math.PI/2+i*tau/12,span=tau/12;
    for(let j=0;j<4;j++){
      const dir=a+((j+.5)/4-.5)*span*.91;
      rect(dir,wall+.035,span*.112,foot+.2,9.68,0x4f302d);
      rect(dir,wall+.067,span*.093,foot+.32,7.10,0x824230);
      rect(dir,wall+.075,span*.096,7.25,9.52,0x5c4337);
      for(let k=-3;k<=3;k++){
        const dd=k*.015,lo=Math.max(-.047,dd-.037),hi=Math.min(.047,dd+.037);
        if(lo>=hi)continue;
        for(const sign of [-1,1]){
          const yy=t=>8.39+sign*(t-dd)*23;
          b.line(loc(dir+lo,wall+.09,yy(lo)),loc(dir+hi,wall+.09,yy(hi)),0xb08450);
        }
      }
      rect(dir,wall+.08,.052,9.78,10.42,0xcb965b);rect(dir,wall+.09,.045,9.85,10.34,0x664033);
    }
    const column=loc(a-span*.5,13.94,0);
    b.cylinder(column[0],column[2],foot,.46,5.68,p.lacquer,12);
    b.cylinder(column[0],column[2],foot,.55,.32,p.ash,12);
  }
  const layers=[
    {r:16.45,drum:13.93,d0:10.50,d1:12.68,eave:14.54,inner:10.74,cap:17.10,motif:'tiantan-frieze',bays:12,ribs:204},
    {r:13.55,drum:10.83,d0:17.13,d1:19.18,eave:21.53,inner:7.45,cap:24.18,motif:'tiantan-mid',bays:10,ribs:168},
    {r:10.12,drum:7.47,d0:24.18,d1:26.19,eave:28.66,inner:1.14,cap:34.02,motif:'tiantan-upper',bays:8,ribs:144}
  ];
  for(const layer of layers){
    const {r,drum,d0,d1,eave,inner,cap,motif,bays,ribs}=layer;
    b.lathe(0,0,[[drum+.04,d0-.28],[drum+.19,d0-.15],[drum+.16,d0+.02]],128,0x37465b);
    paintedBand(b,{r0:drum+.12,r1:drum+.12,y0:d0,y1:d1,motif,repeats:Math.ceil(bays/3)});
    for(const [yy,rr,h,c] of [[d0,drum+.15,.08,0xb49a65],[d1-.05,drum+.15,.105,0x46635e],[d1+.08,drum+.21,.07,0xb19d6d]]){
      b.lathe(0,0,[[rr,yy],[rr,yy+h]],128,c);
    }
    paintedBand(b,{r0:drum+.15,r1:r-.45,y0:d1+.16,y1:eave-.49,motif:'tiantan-brackets',repeats:Math.ceil(bays/2)});
    // Purlin ends and cantilever consoles interrupt the painted soffit at the structural bays.
    const brackets=bays*4;
    for(let i=0;i<brackets;i++){
      const a=i*tau/brackets,base=loc(a,drum+.21,d1+.16),arm=loc(a,r-.51,eave-.48);
      b.beam(base,arm,.105,i%4===0?0x50756e:0x344d50,.11);
      if(i%2===0){const front=loc(a,r-.50,eave-.51);b.box(front[0],front[1],front[2],.22,.19,.22,0x75895d);}
    }
    glazedBlueRoof(b,r,inner,eave,cap,ribs);
  }
  b.lathe(0,0,[[1.12,33.91],[1.3,34.12],[1.2,34.33],[.86,34.49],[.91,34.63],[.6,34.83]],48,0x354151,'glaze');
  b.lathe(0,0,[[.65,34.75],[.78,34.87],[.48,35.04],[.54,35.18],[.88,35.34],[.99,35.77],[.89,36.33],[.55,36.66],[0,36.8]],48,0xd8ad58,'metal');
  if(typeof document!=='undefined'){
    const img=new THREE.TextureLoader().load(new URL('./ornaments/tiantan-plaque.webp',import.meta.url).href);
    img.colorSpace=THREE.SRGBColorSpace;img.anisotropy=6;
    const plate=new THREE.Mesh(new THREE.PlaneGeometry(3.32,4.58),new THREE.MeshBasicMaterial({map:img}));
    plate.position.set(0,25.84,9.23);
    plate.userData.panelUrl='./ornaments/tiantan-plaque.webp';b.decals.push(plate);
  }
  b.rectFoot(0,0,37,37);
}
function ncpa(b) {
  const ax=106.1,az=71.82,top=46.68,ns=112,nt=28;
  const loc=(a,t)=>[ax*Math.cos(a)*Math.cos(t),top*Math.sin(t),az*Math.sin(a)*Math.cos(t)];
  // Segmented titanium shell interrupted by the curved meridional glass curtain.
  for(let j=0;j<nt;j++){
    const t=j/nt*Math.PI/2,t2=(j+1)/nt*Math.PI/2;
    for(let i=0;i<ns;i++){
      const a=i*tau/ns,a2=(i+1)*tau/ns,skew=.18*Math.sin(t*2.1);
      const gl=Math.abs(Math.cos(a-skew)) < .23+.18*Math.cos(t);
      const m=gl?'glass':'metal',colors=gl?[0x558495,0x638d9b,0x7599a2]:[0xb5bdba,0xaeb8b6,0xc4c6be,0xb4bdbd];
      const c=colors[(i*37+j*13)%colors.length],p0=loc(a,t),p1=loc(a,t2),p2=loc(a2,t2),p3=loc(a2,t);
      b.face([p0,p1,p2,p3],c,m);if(j%2===0)b.line(p0,p3,gl?0x4d6974:0x919e9e);
      if(i%(gl?2:3)===0)b.line(p0,p1,gl?0x3c5764:0x9da8a6);
    }
  }
  b.footprints.push(Array.from({length:40},(_,i)=>[ax*Math.cos(i*tau/40),az*Math.sin(i*tau/40)]));
}
function stadium(b) {
  const rad=(a,ax,az,h)=>[ax*Math.cos(a),h,az*Math.sin(a)];
  const top=a=>55+14*Math.cos(2*a);
  const outer=(a,t)=>{const sx=mix(125,145,t)+5*Math.sin(Math.PI*t),sz=mix(146,162,t)+4*Math.sin(Math.PI*t);return rad(a,sx,sz,1+top(a)*t*.975);};
  const roof=(a,t)=>rad(a,mix(145,90,t),mix(162,115,t),top(a)*.975+1-7*t+2*Math.sin(Math.PI*t));
  const seg=100;
  // Multiple raked tiers, separated by pale walkways and red seating banks.
  for(let k=0;k<24;k++)for(let i=0;i<seg;i++){
    const a=i*tau/seg,a2=(i+1)*tau/seg,t=k/24,t2=(k+1)/24;
    const row=(ang,v,yoff=0)=>rad(ang,mix(47,129,v),mix(72,146,v),mix(0,43,v)+yoff);
    const stair=(i%9===0),c=stair||k%8===7?0xb8b5ae:k%4===0?0xb75a47:0x9e4637;
    b.face([row(a,t),row(a2,t),row(a2,t2,-1.1),row(a,t2,-1.1)],c);
    b.face([row(a,t2,-1.1),row(a2,t2,-1.1),row(a2,t2),row(a,t2)],0x773729);
  }
  b.box(0,.1,0,68,.2,104,0x55754c,'ground');
  for(const s of [-1,1]) b.box(s*33.9,.31,0,.21,.03,103,0xd5d5b1);
  for(const s of [-1,0,1]) b.box(0,.31,s*51.5,67.8,.03,.21,0xd5d5b1);
  for(let i=0;i<seg;i++){
    const a=i*tau/seg,a2=(i+1)*tau/seg;
    b.face([outer(a,0),outer(a2,0),outer(a2,.68),outer(a,.68)],0x6a514d,'metal');
    for(let j=0;j<4;j++){
      const t=j/4,u=(j+1)/4;
      b.face([roof(a,t),roof(a2,t),roof(a2,u),roof(a,u)],(i+j)%5===0?0xbebfba:0xb2b5b2,'metal');
    }
    b.beam(roof(a,1),roof(a2,1),1.03,p.steel,1.05,'metal');
  }
  // Angular steel straps around the bowl continue over the roof toward the oculus.
  for(let i=0;i<62;i++) {
    const seed=i*2.39996, start=i*tau/62, skew=(i%2===0?1:-1)*(.39+.39*(.5+.5*Math.sin(seed*3.1)));
    const col=[0xc4c8c5,0xd1d0c5,0x9ba7ad,0xb8bfbe][i%4],w=(i%7===0?2.35:1.35)+.18*(.5+.5*Math.cos(seed));
    let before=outer(start,0);
    for(let j=1;j<=8;j++){
      const t=j/8,angle=start+skew*t+.035*Math.sin(t*Math.PI+seed)*Math.sin(t*Math.PI);
      const next=outer(angle,t);b.beam(before,next,w,col,w*.76,'metal');before=next;
    }
    for(let j=1;j<=5;j++){
      const t=j/5,next=roof(start+skew+skew*.34*t,t);next[1]+=.65;
      b.beam(before,next,w,col,w*.72,'metal');before=next;
    }
  }
  b.footprints.push(Array.from({length:40},(_,i)=>[148*Math.cos(i*tau/40),166.5*Math.sin(i*tau/40)]));
}
function cube(b) {
  const dim=177,h=30,half=dim/2;
  const shapes=[[dim,h,(u,v,q)=>[u-half,v,half+q]],[dim,h,(u,v,q)=>[half+q,v,half-u]],[dim,h,(u,v,q)=>[half-u,v,-half-q]],[dim,h,(u,v,q)=>[-half-q,v,u-half]],[dim,dim,(u,v,q)=>[u-half,h+q,half-v]]];
  const seed=(n)=>{const x=Math.sin(n*154.47+77.03)*41839.6307;return x-Math.floor(x);};
  for(const [side,[w,d,map]] of shapes.entries()) {
    const pts=[],nx=13,ny=d===h?3:13;
    for(let j=0;j<ny;j++) for(let i=0;i<nx;i++)pts.push([(i+.16+.68*seed(i*73+j*317+side*31))*w/nx,(j+.16+.68*seed(i*191+j*23+side*71))*d/ny]);
    // Voronoi facets are clipped against the true face boundary before shallow cushion domes are raised.
    for(const [i,center] of pts.entries()){
      let poly=[[0,0],[w,0],[w,d],[0,d]];
      for(let j=0;j<pts.length&&poly.length;j++){
        if(i===j)continue;
        const other=pts[j],dx=other[0]-center[0],dy=other[1]-center[1];
        if(dx*dx+dy*dy>2200)continue;
        const cx=(center[0]+other[0])/2,cy=(center[1]+other[1])/2;
        const cut=v=>(v[0]-cx)*dx+(v[1]-cy)*dy,next=[];
        for(let k=0;k<poly.length;k++){
          const a=poly[k],c=poly[(k+1)%poly.length],sa=cut(a),sc=cut(c);
          if(sa<=0)next.push(a);
          if((sa<0)!==(sc<0)){const t=sa/(sa-sc);next.push([mix(a[0],c[0],t),mix(a[1],c[1],t)]);}
        }poly=next;
      }
      const tint=[0x92c3d0,0x79adbd,0xa1c4cf,0x66a5be,0x8cb9cc][i%5],point=map(center[0],center[1],.48);
      for(let k=0;k<poly.length;k++) {
        const a=poly[k],v=poly[(k+1)%poly.length],mid=map(mix(center[0],a[0],.83),mix(center[1],a[1],.83),.26),mid2=map(mix(center[0],v[0],.83),mix(center[1],v[1],.83),.26);
        b.face([point,mid,mid2],tint,'glass');b.face([mid,map(...a,0),map(...v,0),mid2],tint,'glass');b.line(map(...a,.04),map(...v,.04),0xd5e2e0);
      }
    }
  }
  b.box(0,0,0,177.5,.69,177.5,0x768e96);b.rectFoot(0,0,177,177);
}
function zun(b) {
  function r(t){return t<.54?27+12*((.54-t)/.54)**1.85:27+7.5*((t-.54)/.46)**1.9;}
  function pos(a,t,extra=0){const rad=r(t)+extra,c=Math.cos(a),s=Math.sin(a);
    return [rad*Math.sign(c)*Math.abs(c)**.36,t*528,rad*Math.sign(s)*Math.abs(s)**.36];}
  const n=72,floors=108;
  for(let j=0;j<floors;j++){
    const t=j/floors,v=(j+1)/floors;
    for(let i=0;i<n;i++) {
      const a=tau*i/n,a2=tau*(i+1)/n,p0=pos(a,t),p1=pos(a,v),p2=pos(a2,v),p3=pos(a2,t);
      const c=new THREE.Color().setRGB(.18+.12*t+.043*Math.cos(a*3),.28+.15*t+.05*Math.cos(a*3),.31+.17*t+.057*Math.cos(a*3));
      if(j%17===13||j%17===14)c.multiplyScalar(.72);
      b.face([p0,p1,p2,p3],c.getHex(),'glass');
      b.line(pos(a,t,.08),pos(a2,t,.08),j%4===0?0x879eaa:0x6e899a);
      if(j%3===0)b.beam(pos(a,t,.1),pos(a,Math.min(1,(j+3)/floors),.1),i%9===0?.68:.30,i%9===0?0xbdc9c9:0x97adb5,.35,'metal');
    }
  }
  for(let i=0;i<n;i++) {
    const a=tau*i/n,c=tau*(i+1)/n;b.face([pos(a,1),pos(c,1),[0,528,0]],0xafbabc,'metal');
    b.beam(pos(a,1),pos(c,1),.74,0xc9d0ca,.49,'metal');
  }
  b.rectFoot(0,0,78,78);
}
function cctv(b) {
  const corners=(cx,cz,w,d,y,tilt=0)=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>[cx+x*w/2,y+tilt*x,cz+z*d/2]);
  const tint=[0x8298a6,0x6a818f,0x78919f,0x708b9a];
  function surface(p0,p1,p2,p3,columns,rows,c,diag=true){
    const v=(u,t)=>lerp3(lerp3(p0,p1,u),lerp3(p3,p2,u),t);
    b.face([p0,p1,p2,p3],c,'glass');
    for(let i=0;i<=columns;i++)b.line(v(i/columns,0),v(i/columns,1),0x99acb3);
    for(let j=0;j<=rows;j++)b.line(v(0,j/rows),v(1,j/rows),0x475d69);
    if(diag){
      const nx=Math.max(1,Math.round(columns/5)),ny=Math.max(1,Math.round(rows/3.5));
      for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
        const a=v(i/nx,j/ny),d=v((i+1)/nx,(j+1)/ny),g=v((i+1)/nx,j/ny),c2=v(i/nx,(j+1)/ny);
        b.beam(a,d,.54,0x485967,.45,'metal');
        if((i+j)%3!==0||j>ny*.65) b.beam(g,c2,.60,0x4a5b65,.45,'metal');
      }
    }
  }
  function prism(bot,top,nrows) {
    for(let i=0;i<4;i++){
      const j=(i+1)%4,w=Math.hypot(bot[i][0]-bot[j][0],bot[i][2]-bot[j][2]);
      surface(bot[i],bot[j],top[j],top[i],Math.max(3,Math.round(w/3.7)),nrows,tint[i],true);
    }
    b.face(top,0xa6b2b4,'metal');b.face([...bot].reverse(),0x596d78,'metal');
  }
  // The podium and the overhead bridge take different turns around the two leaning towers.
  const legA0=corners(-50,49,55,64,0),legA1=corners(-31,33,55,62,224,10);
  const legB0=corners(47,-49,58,65,0),legB1=corners(34,-29,58,61,204,7);
  prism(legA0,legA1,52);prism(legB0,legB1,48);
  prism(corners(-48,-10,58,95,0),corners(-48,-10,58,95,32),8);
  prism(corners(-8,-52,132,61,0),corners(-8,-52,132,61,32),8);
  prism(corners(4,33,88,61,184,-7),corners(4,33,88,61,217,-8),8);
  prism(corners(35,2,57,89,175,4),corners(35,2,57,89,206,5),8);
  b.rectFoot(0,0,160,169);
}
const builders={palace,tiananmen,tiantan,ncpa,stadium,cube,cctv,zun};
const yaw={palace:.0356,tiananmen:.031,tiantan:.027,ncpa:0,stadium:.013,cube:.017,cctv:0,zun:0};
const shapeCache=new Map(),maskCache=new Map();
function make(id){
  if(!builders[id])throw new Error('未知地标 '+id);
  if(!shapeCache.has(id)){
    const b=new Batch();builders[id](b);addPrecinctContext(b,id);
    const shape=b.build(),ang=yaw[id],sa=Math.sin(ang),ca=Math.cos(ang);
    shape.rotation.y=ang;shape.name=id;
    shape.userData.landmarkId=id;
    shapeCache.set(id,shape);
    maskCache.set(id,b.footprints.map(poly=>poly.map(([x,z])=>[x*ca+z*sa,z*ca-x*sa])));
  }
}
export function createLandmark(id) {make(id);return shapeCache.get(id).clone();}
export function landmarkFootprints(id){make(id);return maskCache.get(id);}
