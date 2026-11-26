import * as THREE from 'three';
import { ceramicProfiles, detailRegions } from './palace-profiles.js';
import { addTaiheFurniture } from './furniture.js';

// Metres. +Z is the courtyard south of the hall. The three marble platforms reach
// 8.13 m. The hall is 63.96 by 37.17 m across the column centres, with 11 by 5 bays.
const mix=(a,b,t)=>a+(b-a)*t;
const stone=0xd0c9bc, lightStone=0xe0d9c9, stoneShadow=0xb6ac9d;
const red=0x9b382e, gold=0xc78d45, ochre=0x9a713c;
const atlasSizes={front:[1040,368],details:[2048,2048],beasts:[1,1],pavers:[1,1]};
const palette={front:0xbe8646,details:0x8f7860,beasts:0xc8984c,pavers:0x898781,joinery:0x687760};
const materials=new Map();
function material(id) {
  if(materials.has(id))return materials.get(id);
  const url=new URL(`./palace-${id}.webp`,import.meta.url).href;
  const texture=typeof document==='undefined'?new THREE.Texture():new THREE.TextureLoader().load(url);
  texture.userData.src=url;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
  const result=new THREE.MeshStandardMaterial({map:texture,side:THREE.DoubleSide,roughness:id==='beasts'?.44:.88,metalness:.015});
  result.name=`太和殿 · ${id}`;materials.set(id,result);return result;
}
// Keep the texture registers together for five draw calls. All UVs stay inside
// the atlas, including on repeated surfaces, for software and GPU filtering.
class Registers {
  constructor(){this.batches=new Map();}
  face(id,positions,uvs,indices){
    if(!this.batches.has(id))this.batches.set(id,{p:[],uv:[],idx:[]});
    const data=this.batches.get(id),offset=data.p.length/3;
    for(const p of positions)data.p.push(...p);
    for(const [u,v] of uvs)data.uv.push(u,1-v);
    for(const index of indices??[0,1,2,0,2,3])data.idx.push(offset+index);
  }
  rectangle(id,point,rect=[0,0,1,1]){
    const [x0,y0,x1,y1]=rect;
    this.face(id,[point(0,0),point(1,0),point(1,1),point(0,1)],[[x0,y1],[x1,y1],[x1,y0],[x0,y0]]);
  }
  detail(name,point){const [w,h]=atlasSizes.details;const [a,b,c,d]=detailRegions[name];this.rectangle('details',point,[(a+.5)/w,(b+.5)/h,(c-.5)/w,(d-.5)/h]);}
  finish(b){
    for(const [id,s] of this.batches){
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(s.p,3));
      geo.setAttribute('uv',new THREE.Float32BufferAttribute(s.uv,2));geo.setIndex(s.idx);geo.computeVertexNormals();geo.computeBoundingSphere();
      const mat=material(id),mesh=new THREE.Mesh(geo,mat);mesh.name='太和殿 · '+id;
      mesh.userData.panelUrl=mat.map.userData.src;mesh.userData.fallbackColor=palette[id];
      mesh.receiveShadow=true;mesh.castShadow=id!=='pavers';b.decals.push(mesh);
    }
  }
}
const photo=(x,y)=>[(x-150)/1040,(y-164)/368];
const xyz=(side,q,y,r)=>[[q,y,r],[r,y,-q],[-q,y,-r],[-r,y,q]][side];
const at=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
function layerPoint(side,u,t,upper){
  const halfX=upper?31.65:36.6,halfZ=upper?19.45:22.45;
  const innerX=upper?14.57:28.1,innerZ=upper?0:13.35;
  const edge=side%2?halfZ:halfX,rad=side%2?halfX:halfZ;
  const innerEdge=side%2?innerZ:innerX,innerRad=side%2?innerX:innerZ;
  const lift=(upper?1.48:1.22)*Math.pow(Math.abs(2*u-1),4.3);
  const height=(upper?22.15:16.55)+(upper?9.15:2.77)*Math.pow(t,1.55)+lift*(1-t)**1.55;
  return xyz(side,(2*u-1)*mix(edge,innerEdge,t),height,mix(rad,innerRad,t));
}
function surfaceUV(u,t,upper){
  const f=Math.abs(2*u-1),d=Math.pow(t,1.50);
  // Sample just inside the silhouette, while keeping the photographic tile rows
  // running head-to-tail down the curved roof. The tile ends form a separate lip.
  const extent=mix(upper?448:505,upper?203:397,t);
  const y=mix((upper?339.6:416.7)-(upper?16.0:11.3)*Math.pow(f,5.7),upper?222.0:380.0,d);
  return photo(670+(u*2-1)*extent,y);
}
function ceramic(b,r,key,texture,pos,axis,width,height,thickness,flip=false){
  const uv=ceramicProfiles[key],U=uv.map(p=>p[0]),V=uv.map(p=>p[1]);
  const x0=Math.min(...U),x1=Math.max(...U),y0=Math.min(...V),y1=Math.max(...V);
  const poly=uv.map(([x,y])=>new THREE.Vector2(((x-x0)/(x1-x0)-.5)*width*(flip?-1:1),(1-(y-y0)/(y1-y0))*height));
  const idx=THREE.ShapeUtils.triangulateShape(poly,[]).flat(), normal=[axis[1],-axis[0]];
  const coords=(d)=>poly.map(p=>[pos[0]+axis[0]*p.x+normal[0]*d,pos[1]+p.y,pos[2]+axis[1]*p.x+normal[1]*d]);
  const front=coords(thickness*.5),back=coords(-thickness*.5);
  r.face(texture,front,uv,idx);r.face(texture,back,uv,idx);
  for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length;b.face([front[i],front[j],back[j],back[i]],i%3===0?ochre:gold,'glaze');}
}
function roofs(b,r,upper){
  const columns=30,rows=9;
  for(let side=0;side<4;side++){
    const get=(u,t)=>layerPoint(side,u,t,upper);
    for(let i=0;i<columns;i++)for(let j=0;j<rows;j++){
      const u0=i/columns,u1=(i+1)/columns,t0=j/rows,t1=(j+1)/rows;
      const knots=[[u0,t0],[u1,t0],[u1,t1],[u0,t1]];
      if(side%2===0)r.face('front',knots.map(([u,t])=>get(u,t)),knots.map(([u,t])=>surfaceUV(u,t,upper)));
      else {
        // On the hip ends, sample the same glazed roof material along the fall
        // line in narrow strips. The original frontal camera sees little end wall.
        const [x0,y0,x1,y1]=detailRegions.tile;
        const tex=knots.map(([u,t],k)=>[(mix(x0+.5,x1-.5,(i%8+(k===1||k===2?1:0))/8))/2048,mix(y1-.5,y0+.5,t)/2048]);
        r.face('details',knots.map(([u,t])=>get(u,t)),tex);
      }
    }
    for(let i=0;i<columns;i++){
      const a=get(i/columns,0),c=get((i+1)/columns,0);
      const inner=(p)=>[p[0]*(upper?.875:.892),p[1]-(upper?1.15:.91),p[2]*(upper?.78:.834)];
      const al=[a[0],a[1]-.24,a[2]],cl=[c[0],c[1]-.24,c[2]];
      r.detail('eave',(s,t)=>at(at(al,cl,s),at(a,c,s),t));
      const ai=inner(a),ci=inner(c);
      r.rectangle('joinery',(u,t)=>at(at(ai,ci,u),at(al,cl,u),t),[2/1024,2/512,761/1024,209/512]);
      b.beam(a,c,.126,0xe0a750,.118,'glaze');
    }
    // Curved hip roll with ten individually outlined beasts and the immortal
    // rider from the verified photograph of this very hall. Both eave levels
    // carry ten beasts, with a larger ridge guardian behind the series.
    for(let j=0;j<16;j++){
      const a=get(1,j/16),c=get(1,(j+1)/16);a[1]+=.10;c[1]+=.10;b.beam(a,c,upper?.43:.34,0xc88a40,upper?.43:.33,'glaze');
    }
    const start=get(1,.0),inner=get(1,.15),dx=start[0]-inner[0],dz=start[2]-inner[2],len=Math.hypot(dx,dz),axis=[dx/len,dz/len];
    const count=11;
    for(let n=0;n<count;n++){
      const t=.043+(count-1-n)*(upper?.0202:.036),p=get(1,t);p[1]+=.12;
      const key=n===count-1?'b10':'b'+n;
      ceramic(b,r,key,'beasts',p,axis,n===count-1?.48:.37,n===count-1?.59:.42,.155);
    }
    const guardian=get(1,upper?.285:.47);guardian[1]+=.11;
    ceramic(b,r,'b11','beasts',guardian,axis,.75,.92,.27);
  }
  if(upper){
    b.box(0,31.26,0,29.65,.58,.70,ochre,'glaze');
    b.box(0,31.83,0,29.30,.16,.79,0xc88c44,'glaze');
    for(const side of [0,2])for(let i=0;i<4;i++)r.detail('ridge',(u,t)=>xyz(side,mix(-14.64+i*7.32,-14.64+(i+1)*7.32,u),mix(31.32,31.95,t),.404));
    for(const sign of [-1,1])ceramic(b,r,'chiwen','front',[sign*14.62,31.65,0],[1,0],2.65,3.40,1.06,sign>0);
  }
}
const columns=[-31.98,-28.03,-22.16,-16.27,-10.38,-4.53,4.53,10.38,16.27,22.16,28.03,31.98];
const sideColumns=[-18.585,-12.65,-5.0,5.0,12.65,18.585];
function facade(b,r){
  b.box(0,8.13,0,63.6,.33,37.6,stone);
  b.box(0,8.46,0,61.3,5.70,31.35,red);
  b.box(0,13.85,0,64.23,1.59,37.24,0x564331);
  b.box(0,18.45,0,56.12,2.90,26.82,0x494132);
  const southSource=[222,275,357,440,522,606,733,815,898,981,1063,1117];
  for(let side=0;side<4;side++){
    const long=side%2===0,bays=long?columns:sideColumns,rad=long?18.585:31.98;
    for(let k=0;k<bays.length;k++){
      const q=bays[k],p=xyz(side,q,8.46,rad);
      if(long||k>0&&k<bays.length-1){
        b.lathe(p[0],p[2],[[.71,8.45],[.71,8.57],[.61,8.68],[.54,8.77],[.47,8.80]],12,stone);
        b.lathe(p[0],p[2],[[.50,8.77],[.52,9.00],[.50,12.83],[.45,14.24]],16,red);
        b.cylinder(p[0],p[2],13.65,.55,.22,0x95613c,12);
      }
      if(k===bays.length-1)continue;
      const q1=bays[k+1],a=q+.18,d=q1-.18;
      // Painted beams are projected through individual bays, including the
      // larger central bay and the two narrower terminal bays. Side galleries
      // use matching photographed registers with their own perspective.
      if(long){
        const left=photo(southSource[k],430.8),right=photo(southSource[k+1],459.9);
        r.rectangle('front',(u,t)=>xyz(side,mix(q,q1,u),mix(13.58,15.66,t),rad+.53),[left[0],left[1],right[0],right[1]]);
      }else r.detail('lowerband',(u,t)=>xyz(side,mix(q,q1,u),mix(13.58,15.66,t),rad+.53));
      const panels=k===5&&long?3:2;
      for(let j=0;j<panels;j++){
        const lo=mix(a,d,j/panels),hi=mix(a,d,(j+1)/panels);
        const name=(k+j)%3===0?'door2':'door';
        r.detail(name,(u,t)=>xyz(side,mix(lo,hi,u),mix(8.92,13.53,t),rad-(long?2.78:1.28)));
        const sill=xyz(side,(lo+hi)*.5,8.67,rad-(long?2.76:1.26));
        b.box(sill[0],8.67,sill[2],long?hi-lo:.16,.27,long?.16:hi-lo,0x743629);
      }
      const rail=xyz(side,(q+q1)/2,8.47,rad-(long?2.72:1.22));
      b.box(rail[0],8.46,rail[2],long?q1-q:.24,.22,long?.24:q1-q,0x976c4f);
      for(const u of [.0,.5]){
        const qs=mix(q,q1,u),root=xyz(side,qs,14.25,rad+.35);
        for(let n=0;n<3;n++){
          const w=.35+n*.26,deep=.56+n*.21,yy=14.24+n*.29;
          b.box(root[0],yy,root[2],long?w:deep,.25,long?deep:w,n===1?0x637668:0x46655e);
        }
        b.beam(xyz(side,qs-.47,14.17,rad+.32),xyz(side,qs-.16,14.52,rad+.53),.15,0xd1a952);
        b.beam(xyz(side,qs+.47,14.17,rad+.32),xyz(side,qs+.16,14.52,rad+.53),.15,0xd1a952);
        r.rectangle('joinery',(u,t)=>xyz(side,mix(qs-.37,qs+.37,u),mix(14.54,15.64,t),rad+.69),[767/1024,3/512,1020/1024,426/512]);
      }
    }
    const half=long?27.95:13.36,depth=long?13.44:28.04;
    const upperBays=long?18:8;
    for(let n=0;n<upperBays;n++){
      const q=(2*(n+.5)/upperBays-1)*half,center=xyz(side,q,20.48,depth+.12);
      b.box(center[0],20.48,center[2],long?.47:.78,.76,long?.78:.47,0x536d5e);
      r.rectangle('joinery',(u,t)=>xyz(side,mix(q-.24,q+.24,u),mix(20.47,21.38,t),depth+.53),[767/1024,3/512,1020/1024,426/512]);
    }
    if(long){const lo=photo(271,350),hi=photo(1068,376);r.rectangle('front',(u,t)=>xyz(side,mix(-half,half,u),mix(19.20,21.60,t),depth+.035),[lo[0],lo[1],hi[0],hi[1]]);}
    else for(let i=0;i<4;i++)r.detail('upperband',(u,t)=>xyz(side,mix(-half+2*half*i/4,-half+2*half*(i+1)/4,u),mix(19.20,21.60,t),depth+.035));
  }
  b.box(0,18.63,13.54,2.33,2.73,.24,0x594735);
  const plaque0=photo(652.5,348.8),plaque1=photo(687.2,387.5);
  r.rectangle('front',(u,t)=>[mix(-1.25,1.25,u),mix(18.64,21.55,t),13.72],[...plaque0,...plaque1]);
  b.rectFoot(0,0,62.0,36.4);
}
function post(b,p){
  const [x,y,z]=p;
  b.box(x,y,z,.37,.13,.37,stoneShadow);
  b.box(x,y+.12,z,.29,.84,.29,lightStone);
  b.lathe(x,z,[[.23,y+.95],[.27,y+1.04],[.155,y+1.13],[.24,y+1.21],[.055,y+1.34]],6,lightStone);
}
function balustrade(b,r,start,end){
  const length=Math.hypot(end[0]-start[0],end[2]-start[2]),n=Math.max(1,Math.round(length/2.52));
  const dx=(end[0]-start[0])/length,dz=(end[2]-start[2])/length;
  for(let i=0;i<=n;i++){
    const a=at(start,end,i/n);post(b,a);if(i===n)continue;
    const c=at(start,end,(i+1)/n);
    const vertex=(s,h,offset=0)=>{const p=at(a,c,s);return [p[0]-dz*offset,p[1]+h,p[2]+dx*offset];};
    b.beam(vertex(.01,.16),vertex(.99,.16),.26,stoneShadow,.17);
    // Carved stone panels closed at their bases, with a line of pierced openings
    // below the moulded upper rails. Photographic carving stays inside the panel.
    b.face([vertex(.04,.24,-.085),vertex(.96,.24,-.085),vertex(.96,.70,-.085),vertex(.04,.70,-.085)],stone);
    for(const sign of [-1,1])r.detail('rail',(u,t)=>vertex(mix(.05,.95,u),mix(.24,.72,t),sign*.092));
    for(const s of [.13,.5,.87])b.beam(vertex(s,.69),vertex(s,.89),.15,lightStone,.14);
    b.beam(vertex(0,.92),vertex(1,.92),.23,lightStone,.14);
  }
}
const stairCuts=[[-21.25,-14.75],[-5.1,5.1],[14.75,21.25]];
function terraceLevel(b,r,tier){
  const [half,sz,low,top]=[[51.6,36.3,.285,2.86],[48.55,31.8,2.86,5.49],[45.5,27.3,5.49,8.13]][tier];
  const h=top-low;
  b.box(0,low,0,2*half,h,2*sz,stone);
  for(const [off,th,spread,c] of [[0,.18,.35,stoneShadow],[.20,.13,.21,lightStone],[h-.62,.17,.20,stoneShadow],[h-.31,.17,.37,stone],[h-.15,.15,.43,lightStone]])b.box(0,low+off,0,2*half+spread,th,2*sz+spread,c);
  for(let side=0;side<4;side++){
    const extent=side%2?sz:half,rad=side%2?half:sz;
    // Carved apron panels between the continuous upper and lower marble courses.
    const n=Math.ceil(extent*2/7);
    for(let i=0;i<n;i++)r.detail('apron',(u,t)=>xyz(side,(2*(i+u)/n-1)*extent,mix(low+.40,top-.60,t),rad+.010));
    const keep=side===0?[[-extent,stairCuts[0][0]],[stairCuts[0][1],stairCuts[1][0]],[stairCuts[1][1],stairCuts[2][0]],[stairCuts[2][1],extent]]:side===2?[[-extent,-7.25],[7.25,extent]]:[[-extent,extent]];
    for(const [l,h] of keep)balustrade(b,r,xyz(side,l,top,rad-.18),xyz(side,h,top,rad-.18));
  }
  // Marble-dragon spouts emerge from the terrace cornices. From the courtyard
  // their projections interrupt the cornice shadow at regular intervals.
  for(let side=0;side<4;side++){
    const extent=side%2?sz:half,rad=side%2?half:sz;
    const count=Math.floor(extent*2/4.9);
    for(let i=0;i<count;i++){
      const q=(2*(i+.5)/count-1)*extent;
      if(side===0&&stairCuts.some(([a,b])=>q>a-.3&&q<b+.3))continue;
      const p=xyz(side,q,top-.36,rad+.28),tip=xyz(side,q,top-.42,rad+.67);
      b.beam(p,tip,.25,stoneShadow,.22);
      b.beam(xyz(side,q,top-.31,rad+.53),xyz(side,q,top-.42,rad+.78),.24,lightStone,.15);
    }
  }
  const floorRect=(x0,z0,x1,z1)=>{
    const nx=Math.max(1,Math.ceil((x1-x0)/6)),nz=Math.max(1,Math.ceil((z1-z0)/3.9));
    for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++)r.detail('marble',(u,t)=>[mix(x0,x1,(ix+u)/nx),top+.009,mix(z0,z1,(iz+1-t)/nz)]);
  };
  const cutX=tier===2?31.85:half-3.05,cutZ=tier===2?18.64:sz-4.5;
  floorRect(-half,-sz,half,-cutZ);floorRect(-half,cutZ,half,sz);
  floorRect(-half,-cutZ,-cutX,cutZ);floorRect(cutX,-cutZ,half,cutZ);
  const outer=sz+4.5;
  for(const [x,width] of [[-18,6.5],[0,10.2],[18,6.5]]){
    const ranges=x===0?[[-5.1,-2],[2,5.1]]:[[x-width/2,x+width/2]];
    for(const [l,rr] of ranges)for(let i=0;i<13;i++){
      const step=h*(i+1)/13,z=outer-(i+.5)*4.5/13;
      b.box((l+rr)/2,low,z,rr-l,step,4.5/13+.012,i%5===0?0xd3ccbf:stone);
      b.line([l,low+step+.014,z+.16],[rr,low+step+.014,z+.16],0xa9a191);
    }
    for(const sign of [-1,1]){
      const edge=x+width/2*sign,start=[edge,low,outer],end=[edge,top,sz];
      b.beam(start,end,.49,lightStone,.18);
      balustrade(b,r,start,end);
    }
  }
  // The imperial way is a sloping slab on each of the three flights, with the
  // original carved scene from this hall mapped onto its individual surface.
  const ramp=(u,t)=>[mix(-2,2,u),mix(low+.10,top+.10,t),mix(outer,sz,t)];
  b.face([ramp(0,0),ramp(1,0),ramp(1,1),ramp(0,1)],stone);
  r.detail('ramp'+(2-tier),(u,t)=>{const p=ramp(u,t);p[1]+=.018;return p;});
  for(const s of [-1,1])b.beam([s*2,low+.13,outer],[s*2,top+.13,sz],.25,lightStone,.20);
}
export function buildTaiheHall(b){
  const r=new Registers();
  // Courtyard paving reuses an unoccupied stone sample from the frontal photo.
  // Its joint spacing is a reconstruction. The central axial route is separate.
  b.box(0,.06,113,195,.213,179,0x898781,'ground');
  for(let i=0;i<25;i++)for(let j=0;j<41;j++){
    r.rectangle('pavers',(u,t)=>[mix(-97.5,97.5,(i+u)/25),.285,mix(23.5,202.5,(j+1-t)/41)]);
  }
  b.box(0,.287,121.65,4.5,.055,161.7,0xb7afa0,'ground');
  for(let j=0;j<75;j++){const z=40.9+j*2.16;b.line([-2.24,.346,z],[2.24,.346,z],0xa39d94);}
  for(const sign of [-1,1])b.box(sign*2.23,.344,121.65,.10,.018,161.7,0xc6beae,'ground');
  for(let i=0;i<3;i++)terraceLevel(b,r,i);
  facade(b,r);roofs(b,r,false);roofs(b,r,true);r.finish(b);addTaiheFurniture(b);
}
// Lower-detail axial halls use the same ceramic and timber materials on their
// own roof forms. Baohedian and Taihemen are hip-and-gable, while Zhonghedian
// has four pyramidal slopes and a gilded finial. No principal-hall insignia is reused.
export function finishPalaceCourtHall(b,z,w,d,floor,top,{double=true,pyramid=false,gable=false,bays=9,rich=false}={}){
  const r=new Registers(),wallH=(top-floor)*(double?.37:.46),bandY=floor+wallH,eave=bandY+.9,peak=top-1.35;
  const glaze=(y,width,depth,rise,low)=>{
    const ridge=pyramid?.01:gable?width*.80:Math.max(width*.13,width-depth*.9);
    const corners=[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]];
    const tops=[[-ridge/2,0],[ridge/2,0],[ridge/2,0],[-ridge/2,0]];
    const get=(side,u,t)=>{
      const n=(side+1)%4,a=mix(corners[side][0],corners[n][0],u),c=mix(corners[side][1],corners[n][1],u);
      const tx=low?a*.67:mix(tops[side][0],tops[n][0],u),tz=low?c*.67:0;
      const lift=(rich?.095:.07)*Math.min(depth,width)*Math.pow(Math.abs(2*u-1),3.5);
      return [mix(a,tx,gable&&!low?Math.min(1,t/.395):t),y+rise*Math.pow(t,1.42)*(low?.64:1)+lift*(1-t)**1.5+.055,z+mix(c,tz,t)];
    };
    const cols=rich?26:10,rows=rich?8:4;
    for(let k=0;k<4;k++)for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
      if(gable&&!low&&k%2&&j/rows>=.375)continue;
      const uv=[[i/cols,j/rows],[(i+1)/cols,j/rows],[(i+1)/cols,(j+1)/rows],[i/cols,(j+1)/rows]];
      const xyz=uv.map(([s,t])=>get(k,s,t));
      // Reuse the local tile swatch without front-specific emblems or signage.
      const span=(k%2?depth:width),n=Math.max(1,Math.round(span/10)),[x0,y0,x1,y1]=detailRegions.tile;
      const uA=(i*n/cols)%1,uB=Math.min(1,uA+n/cols);
      const tex=uv.map(([s,t],p)=>[mix(x0+.5,x1-.5,p===1||p===2?uB:uA)/2048,mix(y1-.5,y0+.5,t)/2048]);
      r.face('details',xyz,tex);
    }
  };
  if(double){const y=eave+(peak-eave)*.43;glaze(eave,w*1.13,d*1.16,(y-eave)*1.10,true);glaze(y,w*.99,d*.98,peak-y,false);}
  else glaze(eave,w*1.14,d*1.18,peak-eave,false);
  for(let side=0;side<4;side++){
    const long=side%2===0,extent=(long?w:d)*.49,rad=(long?d:w)*.501;
    const repeat=long?bays:Math.max(3,Math.round(bays*d/w));
    const point=(q,h,offset)=>{const p=xyz(side,q,h,offset);p[2]+=z;return p;};
    for(let j=0;j<repeat;j++){
      const lo=mix(-extent,extent,j/repeat),hi=mix(-extent,extent,(j+1)/repeat);
      r.detail('lowerband',(u,t)=>point(mix(lo,hi,u),mix(bandY-.12,bandY+.67,t),rad+.04));
      // On the front and rear the recessed geometric lattice doors of the base
      // model remain in place. Add the openwork material on their vertical plane.
      if(long){const q=((j+.5)/repeat-.5)*w*.87,span=w*.87/repeat*.81;
        r.detail(j%3?'door':'door2',(u,t)=>point(q+(u-.5)*span,mix(floor+.50,floor+wallH*.76,t),(d*.41)+.70));}
    }
  }
  if(pyramid){b.lathe(0,z,[[.64,peak-.18],[.73,peak+.02],[.50,peak+.21],[.32,peak+.34],[.48,peak+.52],[.53,peak+.76],[.41,peak+.98],[.15,peak+1.19],[.03,top]],16,0xcf9b53,'glaze');}
  r.finish(b);
}
