import {cmab2023Features} from './urban/cmab-2023.js';
import {walkingGround} from './walk-surfaces.js';
import {hutongRefs} from './urban/hutong.js';
import {buildStreetScene,streetWidth,streetEnhanced,streetElevated} from './urban/streets.js';
import {addStreetMeshes} from './urban/streets-gpu.js';
import * as THREE from 'three';
import { fillCityTrees } from './urban/trees.js';
import { loadBeijing } from './data/beijing.js';
import { landmarkFootprints } from './landmarks.js';
import { ordinaryGeometry, gpuFacadeArray } from './urban/facades.js';
import { cbdReplacedRefs, cbdFootprints, createCbdMeshes } from './urban/cbd.js';
import { precinctRefs } from './heritage/precinct-data.js';

const TILE = 2200;
const CITY_DATA = new URL('./imagery/', import.meta.url);
const PI = Math.PI;
const nextFrame = () => new Promise(resolve => setTimeout(resolve, 0));
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function ringArea(points) {
  let a = 0;
  for (let i=0, j=points.length-1; i<points.length; j=i++) {
    a += points[j].x * points[i].z - points[i].x * points[j].z;
  }
  return a * 0.5;
}
function inRing(x,z,ring) {
  let inside = false;
  for (let i=0, j=ring.length-1; i<ring.length; j=i++) {
    const a=ring[i], b=ring[j];
    if ((a.z>z)!==(b.z>z) && x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x) inside=!inside;
  }
  return inside;
}
function inPolygon(x,z,item) {
  return inRing(x,z,item.ring) && !item.holes.some(hole=>inRing(x,z,hole));
}
function bounds(ring) {
  let x0=Infinity, z0=Infinity, x1=-Infinity, z1=-Infinity;
  for(const p of ring) {
    x0=Math.min(x0,p.x); z0=Math.min(z0,p.z); x1=Math.max(x1,p.x); z1=Math.max(z1,p.z);
  }
  return { x0,z0,x1,z1, x:(x0+x1)*.5, z:(z0+z1)*.5 };
}
function cleanRing(coords,project) {
  const points=[];
  for(const p of coords) {
    const v=project(p[0],p[1]), last=points[points.length-1];
    if(!last || Math.abs(v.x-last.x)+Math.abs(v.z-last.z)>.05) points.push(v);
  }
  if(points.length>1 && Math.abs(points[0].x-points.at(-1).x)+Math.abs(points[0].z-points.at(-1).z)<.05) points.pop();
  return points;
}
function projectArea(f, project) {
  const ring=cleanRing(f.ring,project);
  if(ring.length<3) return null;
  const holes=(f.holes||[]).map(h=>cleanRing(h,project)).filter(h=>h.length>=3);
  return {ring,holes,bb:bounds(ring)};
}
function edgeDistance(x,z,a,b) {
  const dx=b.x-a.x, dz=b.z-a.z;
  const t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz || 1),0,1);
  return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);
}
class SpatialIndex {
  constructor(span) {this.span=span;this.cells=new Map();}
  insert(item, bb) {
    for(let x=Math.floor(bb.x0/this.span);x<=Math.floor(bb.x1/this.span);x++) {
      for(let z=Math.floor(bb.z0/this.span);z<=Math.floor(bb.z1/this.span);z++) {
        const key=x+','+z;
        if(!this.cells.has(key)) this.cells.set(key,[]);
        this.cells.get(key).push(item);
      }
    }
  }
  at(x,z) {return this.cells.get(Math.floor(x/this.span)+','+Math.floor(z/this.span))||[];}
  hits(x,z,radius=0) {
    for (const item of this.at(x,z)) {
      if(inPolygon(x,z,item)) return true;
      if(radius>0) {
        // Keep the walker clear of wall faces while leaving courtyard holes traversable.
        for(const ring of [item.ring,...item.holes]) {
          for(let i=0,j=ring.length-1;i<ring.length;j=i++) if(edgeDistance(x,z,ring[j],ring[i])<radius) return true;
        }
      }
    }
    return false;
  }
}
class Batch {
  constructor() {this.pos=[];this.norm=[];this.uv=[];this.cols=[];this.shape=[];this.indices=[];}
  vertex(x,y,z,nx,ny,nz,u,v,color,shape) {
    const id=this.pos.length/3;
    this.pos.push(x,y,z);this.norm.push(nx,ny,nz);this.uv.push(u,v);
    this.cols.push(Math.round(255*clamp(color.r,0,1)),Math.round(255*clamp(color.g,0,1)),Math.round(255*clamp(color.b,0,1)));
    this.shape.push(shape); return id;
  }
  quad(a,b,c,d) {this.indices.push(a,b,d,b,c,d);}
  up(a,b,c) {
    const p=this.pos, ax=p[a*3],az=p[a*3+2];
    if((p[b*3]-ax)*(p[c*3+2]-az)-(p[b*3+2]-az)*(p[c*3]-ax)>0)this.indices.push(a,c,b);
    else this.indices.push(a,b,c);
  }
  mesh(material) {
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(this.pos,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(this.norm,3));
    g.setAttribute('color',new THREE.Uint8BufferAttribute(this.cols,3,true));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(this.uv,2));
    g.setAttribute('aShape',new THREE.Float32BufferAttribute(this.shape,1));
    g.setIndex(this.indices);
    g.computeBoundingSphere();
    const m=new THREE.Mesh(g,material);
    m.receiveShadow=true; return m;
  }
}
function batchAt(map,x,z) {
  const key=Math.floor(x/TILE)+','+Math.floor(z/TILE);
  if(!map.has(key)) map.set(key,new Batch());
  return map.get(key);
}
function surface(batch, area, y, color, shape) {
  const rings=[area.ring,...area.holes];
  const paths=rings.map(r=>r.map(p=>new THREE.Vector2(p.x,p.z)));
  const tris=THREE.ShapeUtils.triangulateShape(paths[0],paths.slice(1));
  const offset=batch.pos.length/3;
  for(const ring of rings) for(const p of ring) batch.vertex(p.x,y,p.z,0,1,0,p.x*.1,p.z*.1,color,shape);
  for(const face of tris) batch.up(offset+face[0],offset+face[1],offset+face[2]);
}
function seedAt(x,z) {
  const h=Math.sin(x*.127+z*.351)*49741.135;
  return h-Math.floor(h);
}
function rngGenerator(seed) {
  let state=Math.floor(seed*0xffffffff)>>>0;
  return () => (state=(Math.imul(1664525,state)+1013904223)>>>0) / 4294967296;
}
const sharedShader = `
varying vec2 vCityUv;
varying float vCityShape;
varying float vCityUp;
uniform float uCityNight;
uniform float uCityWet;
uniform float uCitySnow;
uniform float uCityClock;
float cityRand(vec2 p) { return fract(sin(dot(mod(p,vec2(451.7,317.1)),vec2(31.619,87.117)))*41337.19); }
`;
function injectMaterial(mat, uniforms, colorStage, finalStage='') {
  mat.onBeforeCompile = shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
      attribute float aShape;
      varying vec2 vCityUv;
      varying float vCityShape;
      varying float vCityUp;`)
      .replace('#include <begin_vertex>',`#include <begin_vertex>
      vCityUv=uv;
      vCityShape=aShape;
      vCityUp=normal.y;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+sharedShader+(colorStage.includes('uUrbanFacades')?'\nuniform highp sampler2DArray uUrbanFacades;\n':''))
      .replace('#include <color_fragment>','#include <color_fragment>\n'+colorStage)
      .replace('#include <opaque_fragment>',finalStage+'\n#include <opaque_fragment>');
    if(colorStage.includes('uUrbanFacades')){
      // Polished curtainwall, painted steel and masonry respond differently
      // to the same sky. Ordinary roofs also pick up a wet longitudinal sheen.
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        if(vCityShape>=0.) {
          float glassArea=(abs(vCityShape-5.)<.25?1.:abs(vCityShape-6.)<.25?.43:0.);
          float sheetMetal=abs(vCityShape-11.)<.25?1.:0.;
          roughnessFactor=mix(.84,.22,glassArea);
          roughnessFactor=mix(roughnessFactor,.43,sheetMetal);
          roughnessFactor=mix(roughnessFactor,max(.14,roughnessFactor*.52),uCityWet*(.44+.56*max(0.,vCityUp)));
          roughnessFactor=mix(roughnessFactor,.88,uCitySnow*.78*max(0.,vCityUp));
        }`)
       .replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
         if(vCityShape>=0.)metalnessFactor=(abs(vCityShape-5.)<.25?.38:abs(vCityShape-11.)<.25?.45:abs(vCityShape-6.)<.25?.11:.025);
       `);
    }
  };
  mat.customProgramCacheKey=()=>colorStage;
  return mat;
}
function materials(u) {
  const buildings=injectMaterial(new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.76,metalness:.07}),u,`
    float windowLit=0.;
    if(vCityShape < -1.){
      float closeDetail=1.-smoothstep(.09,.5,max(fwidth(vCityUv.x),fwidth(vCityUv.y)));
      if(vCityShape< -3.5){
        float ribs=pow(.5+.5*cos(vCityUv.x*18.7),3.);
        diffuseColor.rgb*=.88+.21*ribs*closeDetail;
      } else if(vCityShape< -2.5 && vCityUp<.4){
        float timber=1.-smoothstep(.035,.07,abs(fract(vCityUv.x*.39)-.5));
        diffuseColor.rgb*=.8+.24*timber*closeDetail;
      }
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.84,.87,.9),uCitySnow*.42*max(vCityUp,0.));
    } else if(vCityShape>=0.){
      vec4 texel=texture(uUrbanFacades,vec3(vCityUv.x,1.-vCityUv.y,floor(vCityShape+.1)));
      diffuseColor.rgb*=texel.rgb;
      windowLit=clamp((texel.a*255.-192.)/63.,0.,1.);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.83,.86,.88),uCitySnow*.66*max(vCityUp,0.));
    } else {
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.83,.86,.88),uCitySnow*.55*max(vCityUp,0.));
    }
    diffuseColor.rgb*=1.-.17*uCityWet;
  `,`outgoingLight+=vec3(1.,.63,.28)*windowLit*uCityNight*.82;`);
  const road=injectMaterial(new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.91,metalness:.02}),u,`
    float paved=step(0.,vCityShape);
    float halfWidth=abs(vCityShape);
    float sides=abs(vCityUv.x);
    float edge=smoothstep(halfWidth-.1,halfWidth+.17,sides);
    float lampPool=0.;
    if(paved>.5 && halfWidth>=5.25){
      float longitudinal=abs(fract((vCityUv.y+9.)/52.)-.5)*52.;
      float lateral=sides-halfWidth+1.8;
      lampPool=exp(-longitudinal*longitudinal*.008-lateral*lateral*.019);
    }
    if(paved>.5){
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.30,.285,.25),edge*.87);
    } else {
      float cuts=abs(fract(vCityUv.y/.93)-.5);
      float nearDetail=1.-smoothstep(.08,.52,fwidth(vCityUv.y));
      diffuseColor.rgb*=1.-smoothstep(.46,.50,cuts)*nearDetail*.13;
    }
    diffuseColor.rgb*=1.-.28*uCityWet;
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.69,.73,.78),uCitySnow*mix(.13,.5,edge));
  `,`outgoingLight+=vec3(.136,.094,.053)*lampPool*uCityNight;`);
  const water=injectMaterial(new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.22,metalness:.11}),u,`
    vec2 wp=vCityUv*10.;
    vec2 wind=vec2(.924,.382),crossWind=vec2(-.382,.924);
    float t=uCityClock,along=dot(wp,wind),across=dot(wp,crossWind);
    float pixels=max(length(dFdx(wp)),length(dFdy(wp)));
    float big=sin(along*1.28+across*.19+t*.91+.63*sin(across*.41));
    float shortWave=sin(along*4.8-across*1.73+t*1.94+1.07*big);
    float fine=sin(along*10.7+across*1.36+t*3.1+1.13*shortWave);
    float body=1.-smoothstep(1.,4.7,pixels);
    vec2 waterSlope=wind*(big*.052*body+shortWave*.032*(1.-smoothstep(.17,1.25,pixels)))
      +crossWind*(fine*.027*(1.-smoothstep(.085,.55,pixels))+sin(across*.69+t*.51)*.017*body);
    diffuseColor.rgb*=.88+.075*big*body;
  `,`
    float grazing=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),2.8);
    vec3 lakeSky=mix(vec3(.35,.45,.53),vec3(.064,.085,.107),uCityWet*.74);
    lakeSky=mix(lakeSky,vec3(.013,.024,.040),uCityNight);
    outgoingLight=mix(outgoingLight,lakeSky,.08+.32*grazing);
  `);
  const compiled=water.onBeforeCompile;
  const mirror={uCanalMap:{value:null},uCanalVP:{value:new THREE.Matrix4()},uCanalOn:{value:0}};
  water.onBeforeCompile=(shader,r)=>{
    compiled(shader,r);Object.assign(shader.uniforms,mirror);
    shader.fragmentShader='uniform sampler2D uCanalMap;uniform mat4 uCanalVP;uniform float uCanalOn;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      normal=normalize(normal+mat3(viewMatrix)*vec3(waterSlope.x,0.,waterSlope.y));`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      if(uCanalOn>.5){
        vec4 q=uCanalVP*vec4(wp.x,.018,wp.y,1.);
        vec2 pos=q.xy/q.w*.5+.5;
        pos+=clamp(waterSlope*vec2(.035,.062),vec2(-.006),vec2(.006));
        if(q.w>0.&&all(greaterThan(pos,vec2(0.)))&&all(lessThan(pos,vec2(1.)))){
          vec3 reflection=texture2D(uCanalMap,pos).rgb*vec3(.84,.91,.94);
          outgoingLight=mix(outgoingLight,reflection,.34+.39*grazing);
        }
      }
      #include <opaque_fragment>`);
  };
  water.userData.setReflection=ref=>{mirror.uCanalOn.value=ref?1:0;if(ref){mirror.uCanalMap.value=ref.texture;mirror.uCanalVP.value.copy(ref.matrix);}};
  return {buildings,road,water};
}

async function loadImagery(project) {
  const manifest=await fetch(new URL('manifest.json',CITY_DATA)).then(r=>{if(!r.ok)throw Error('Cannot load imagery manifest');return r.json();});
  const group=new THREE.Group();
  const planes=await Promise.all(manifest.layers.map(async(layer,index)=>{
    const texture=await new THREE.TextureLoader().loadAsync(new URL(layer.file,CITY_DATA).href);
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=4;
    const [w,s,e,n]=layer.bounds, nw=project(w,n), se=project(e,s);
    const gy=index===0?-11:-.22;
    const geometry=new THREE.BufferGeometry();
    // Horizontal grid rows follow Web Mercator sampling rather than assuming
    // latitude varies linearly in the source image.
    const yNorth=Math.asinh(Math.tan(n*PI/180)), ySouth=Math.asinh(Math.tan(s*PI/180));
    const xyz=[],uv=[],indices=[];
    for(let j=0;j<=24;j++){
      const v=1-j/24,lat=Math.atan(Math.sinh(ySouth+(yNorth-ySouth)*v))*180/PI;
      const left=project(w,lat),right=project(e,lat);
      xyz.push(left.x,gy,left.z,right.x,gy,right.z);uv.push(0,v,1,v);
      if(j<24){const a=j*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
    }
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(xyz,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    geometry.setIndex(indices);geometry.computeVertexNormals();
    const material=new THREE.MeshLambertMaterial({map:texture,color:index===0?0xbdb6a8:0xe2dacf});
    const mesh=new THREE.Mesh(geometry,material);mesh.name='Sentinel-2 '+layer.file;mesh.receiveShadow=true;
    return {mesh,texture,layer,nw,se};
  }));
  planes.forEach(p=>group.add(p.mesh));
  const city=planes[planes.length-1], {image}=city.texture;
  // A low-resolution raster lookup retains observed ground colour and steers
  // illustrative canopy placements away from squares and impervious surfaces.
  const canvas=document.createElement('canvas');
  canvas.width=Math.min(image.width,1024);canvas.height=Math.round(canvas.width*image.height/image.width);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const pix=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const west=city.nw.x, north=city.nw.z, sx=canvas.width/(city.se.x-west),sz=canvas.height/(city.se.z-north);
  function sample(x,z) {
    const ix=clamp(Math.floor((x-west)*sx),0,canvas.width-1), iy=clamp(Math.floor((z-north)*sz),0,canvas.height-1);
    const off=4*(ix+iy*canvas.width);
    return [pix[off],pix[off+1],pix[off+2]];
  }
  return {group,planes,sample,manifest};
}

const roadWidths={motorway:20,trunk:17,primary:15,secondary:12,tertiary:9,unclassified:6,residential:6,service:4.4,
  pedestrian:7,footway:2.5,path:1.7,cycleway:3,steps:2.2,living_street:5.8,track:3.8,bridleway:2.2};
const pedestrian=new Set(['pedestrian','footway','path','steps','cycleway','bridleway','corridor','platform']);
function drawRoad(batch, line, half, kind, bridge) {
  const walk=pedestrian.has(kind), major=half>=4.35&&!walk;
  const full=half;
  const y=bridge?.36:(walk?.075:.11+(major?.02:0));
  const color=new THREE.Color(walk?kind==='cycleway'?0x9a9580:0xb2a58e:major?0x686864:0x787671);
  let dist=0,lastLeft,lastRight;
  for(let i=0;i<line.length;i++) {
    const p=line[i],a=line[i===0?0:i-1],b=line[i===line.length-1?i:i+1];
    const d1=Math.hypot(p.x-a.x,p.z-a.z),d2=Math.hypot(b.x-p.x,b.z-p.z);
    const n1x=d1?-(p.z-a.z)/d1:-(b.z-p.z)/(d2||1), n1z=d1?(p.x-a.x)/d1:(b.x-p.x)/(d2||1);
    const n2x=d2?-(b.z-p.z)/d2:n1x, n2z=d2?(b.x-p.x)/d2:n1z;
    const N=Math.hypot(n1x+n2x,n1z+n2z);
    const nx=N>.1?(n1x+n2x)/N:n1x,nz=N>.1?(n1z+n2z)/N:n1z;
    const miter=full/clamp(nx*n1x+nz*n1z,.48,1);
    dist+=d1;
    const left=batch.vertex(p.x+nx*miter,y,p.z+nz*miter,0,1,0,-full,dist,color,walk?-half:half);
    const right=batch.vertex(p.x-nx*miter,y,p.z-nz*miter,0,1,0,full,dist,color,walk?-half:half);
    if(i>0){batch.up(lastLeft,lastRight,right);batch.up(lastLeft,right,left);}
    lastLeft=left;lastRight=right;
  }
}

function buildVolume(batch,area,feature,height,roofColor,facadeColor,seed,manualShape) {
  const shape=manualShape ?? ((height>=32||/office|commercial|hotel|retail/.test(feature.kind||'')?1:0)+seed*.95);
  const minHeight=Math.max(0,Number(feature.minHeight)||0);
  const top=height+minHeight;
  surface(batch,area,top,roofColor,shape);
  const rings=[area.ring,...area.holes];
  for(let r=0;r<rings.length;r++){
    const ring=rings[r], side=(ringArea(ring)>0?1:-1)*(r===0?1:-1);
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const a=ring[j],b=ring[i],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
      if(length<.15)continue;
      const nx=side*dz/length, nz=-side*dx/length;
      const offset=(seed*180.36)%13.5;
      const v0=batch.vertex(a.x,minHeight,a.z,nx,0,nz,offset,minHeight,facadeColor,shape);
      const v1=batch.vertex(a.x,top,a.z,nx,0,nz,offset,top,facadeColor,shape);
      const v2=batch.vertex(b.x,top,b.z,nx,0,nz,offset+length,top,facadeColor,shape);
      const v3=batch.vertex(b.x,minHeight,b.z,nx,0,nz,offset+length,minHeight,facadeColor,shape);
      if(side>0)batch.quad(v0,v1,v2,v3);else batch.quad(v3,v2,v1,v0);
    }
  }
}

// The park catalogue identifies the glazed hip roofs of Huangqian Hall and
// Qinian Gate. Their neighbours are fitted to the mapped footprints in the
// same compound; roof pitch, timber bays and surface decoration are illustrative.
const templeCourtWays=new Set([43921111,43921133,43921137,43921140,43921141,43921110,43921126]);
function templeCourtHall(batch,area,feature,height) {
  const ring=area.ring;
  let axis={x:1,z:0},longest=0;
  for(let i=0;i<ring.length;i++){
    const a=ring[i],b=ring[(i+1)%ring.length],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
    if(d>longest){longest=d;axis={x:dx/d,z:dz/d};}
  }
  let normal={x:-axis.z,z:axis.x},minA=Infinity,maxA=-Infinity,minB=Infinity,maxB=-Infinity;
  for(const p of ring){
    const a=p.x*axis.x+p.z*axis.z,b=p.x*normal.x+p.z*normal.z;
    minA=Math.min(minA,a);maxA=Math.max(maxA,a);minB=Math.min(minB,b);maxB=Math.max(maxB,b);
  }
  const cx=(minA+maxA)/2*axis.x+(minB+maxB)/2*normal.x,cz=(minA+maxA)/2*axis.z+(minB+maxB)/2*normal.z;
  let A=(maxA-minA)/2,B=(maxB-minB)/2;
  if(B>A){[A,B]=[B,A];[axis,normal]=[normal,{x:-axis.x,z:-axis.z}];}
  const transform=(x,y,z)=>({x:cx+x*axis.x+z*normal.x,y,z:cz+x*axis.z+z*normal.z});
  const rect=(a,b)=>{const r=[transform(-a,0,-b),transform(a,0,-b),transform(a,0,b),transform(-a,0,b)];return {ring:r,holes:[],bb:bounds(r)}};
  const deck=new THREE.Color('#c2b9a4'),red=new THREE.Color('#904535'),bracket=new THREE.Color('#427371'),gold=new THREE.Color('#bb9251');
  const tile=new THREE.Color('#385a72'),ridge=new THREE.Color('#56788a');
  const h=feature.height?height:clamp(B*.59+4.2,5.5,13.8),eave=h*.66,lift=h-eave;
  buildVolume(batch,rect(A*.96,B*.96),{},.76,deck,deck,0,-2);
  buildVolume(batch,rect(A*.85,B*.80),{},eave-.65,red,red,0,-3);
  buildVolume(batch,rect(A*.97,B*.96),{minHeight:eave-.54},.48,bracket,bracket,0,-2);
  buildVolume(batch,rect(A*1.013,B*1.013),{minHeight:eave-.11},.14,gold,gold,0,-2);
  function face(p,q,r,t,c,seed) {
    const ux=q.x-p.x,uy=q.y-p.y,uz=q.z-p.z,vx=t.x-p.x,vy=t.y-p.y,vz=t.z-p.z;
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    const reverse=ny<0;
    const len=Math.hypot(nx,ny,nz)||1;
    nx=nx/len*(reverse?-1:1);ny=ny/len*(reverse?-1:1);nz=nz/len*(reverse?-1:1);
    const verts=[p,q,r,t].map(v=>batch.vertex(v.x,v.y,v.z,nx,ny,nz,(v.x-cx)*axis.x+(v.z-cz)*axis.z,v.y,c,seed));
    if(reverse)batch.quad(verts[3],verts[2],verts[1],verts[0]);else batch.quad(...verts);
  }
  function point(side,s,t) {
    const a=A*1.047-(Math.min(A*.75,B*.90))*t,b=B*1.052*(1-t)+.14*t;
    const corners=[[-a,-b],[a,-b],[a,b],[-a,b]],u=corners[side],v=corners[(side+1)%4];
    const y=eave+lift*Math.pow(t,1.52)+.47*Math.pow(Math.abs(s*2-1),5)*Math.pow(1-t,2);
    return transform(u[0]+(v[0]-u[0])*s,y,u[1]+(v[1]-u[1])*s);
  }
  for(let side=0;side<4;side++){
    const segments=side%2===0?14:8;
    for(let j=0;j<6;j++)for(let i=0;i<segments;i++){
      const l=i/segments,r=(i+1)/segments,t=j/6,n=(j+1)/6;
      face(point(side,l,t),point(side,r,t),point(side,r,n),point(side,l,n),j===5?ridge:tile,-4);
    }
  }
}

function propertyHeight(feature,area) {
  const explicit=Number(feature.height),levels=Number(feature.levels);
  if(explicit>0)return explicit;
  if(levels>0)return levels*3;
  if(Number(feature.neighborHeight)>0)return Number(feature.neighborHeight);
  const type=feature.kind||'';
  if(/garage|shed|hut|carport|kiosk|roof|toilets|service/.test(type))return 3.4;
  if(/temple|historic|house|detached|bungalow/.test(type))return 6.2;
  if(/school|hospital|industrial|warehouse|civic/.test(type))return 11;
  if(/residential|apartments|dormitory/.test(type))return 17;
  if(/commercial|office|hotel/.test(type))return 22;
  return area<145?5:area<470?8:12;
}
const urbanSwatches=new Map();
function urbanColor(rgb){
  const key=rgb[0]*65536+rgb[1]*256+rgb[2];
  let c=urbanSwatches.get(key);
  if(!c){c=new THREE.Color(key);urbanSwatches.set(key,c);}
  return c;
}
export function prepareCmabLayer(project){
  const tiles=new Map(),blocks=new SpatialIndex(100);
  for(const feature of cmab2023Features()){
    const poly=projectArea(feature,project),bb=poly.bb;
    const key=Math.floor(bb.x/450)+','+Math.floor(bb.z/450);
    if(!tiles.has(key))tiles.set(key,[]);
    tiles.get(key).push({poly,feature,height:feature.height,seed:seedAt(bb.x,bb.z),planArea:Math.abs(ringArea(poly.ring))});
    blocks.insert(poly,bb);
  }
  return {tiles,blocks};
}
function ordinaryBatch(batch){
  return {
    quad(points,uv,id,rgb,reverse,textured){
      const p=points[0],q=points[1],r=points[2],ux=q[0]-p[0],uy=q[1]-p[1],uz=q[2]-p[2],vx=r[0]-p[0],vy=r[1]-p[1],vz=r[2]-p[2];
      let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
      const len=Math.hypot(nx,ny,nz);if(len<.0001)return;
      const scale=(reverse?-1:1)/len;nx*=scale;ny*=scale;nz*=scale;
      const color=urbanColor(rgb),type=textured?id:-.5;
      const ix=points.map((v,i)=>batch.vertex(...v,nx,ny,nz,uv?.[i*2]||0,uv?.[i*2+1]||0,color,type));
      if(reverse)ix.reverse();batch.quad(...ix);
    },
    roof(poly,y,id,rgb,textured){surface(batch,poly,y,urbanColor(rgb),textured?id:-.5);}
  };
}
function landmarkIndex(landmarks,project) {
  const index=new SpatialIndex(160);
  for(const mark of landmarks||[]) {
    const origin=project(mark.lon,mark.lat);
    const shapes=[...(landmarkFootprints(mark.id)||[])];
    if(mark.id==='tiantan')shapes.push(Array.from({length:60},(_,i)=>[45.5*Math.cos(2*PI*i/60),45.5*Math.sin(2*PI*i/60)]));
    for(const polygon of shapes) {
      if(!Array.isArray(polygon)||polygon.length<3)continue;
      const ring=polygon.map(([x,z])=>({x:origin.x+x,z:origin.z+z})),bb=bounds(ring);
      index.insert({ring,holes:[],bb},bb);
    }
  }
  return index;
}
function geometries(group,map,material,casts) {
  for(const [key,bin] of map) {
    if(!bin.indices.length)continue;
    const mesh=bin.mesh(material);
    mesh.castShadow=casts;
    group.add(mesh);
    map.delete(key);
  }
}
function buildTrees(group,parks,imagery,buildingIndex,markIndex,waterIndex,pavingIndex,roadIndex) {
  const trees=[];
  const groundTrees=new SpatialIndex(16);
  let seed=31;
  const nearRoad=(x,z)=>{
    for(const segment of roadIndex.at(x,z)){
      const {a,b,width}=segment;
      if(edgeDistance(x,z,a,b)<width)return true;
    }return false;
  };
  for(const park of parks){
    const {bb}=park;
    // Draw only a vegetation suggestion over greener observed Sentinel pixels.
    // A stable jittered lattice avoids stacked crowns on overlapping park polygons.
    const step=18.5,random=rngGenerator(seedAt(bb.x,bb.z+seed++));
    for(let z=bb.z0;z<bb.z1;z+=step){
      for(let x=bb.x0;x<bb.x1;x+=step) {
        if(trees.length>=32000)break;
        const cx=x+random()*step,cz=z+random()*step;
        if(!inPolygon(cx,cz,park))continue;
        const [R,G,B]=imagery.sample(cx,cz);
        const green=(G-R*.93)-(B-G)*.33;
        if(green<8||random()>clamp((green-4)/23,.11,.88))continue;
        if(markIndex.hits(cx,cz)||buildingIndex.hits(cx,cz)||waterIndex.hits(cx,cz)||pavingIndex.hits(cx,cz)||nearRoad(cx,cz))continue;
        if(groundTrees.at(cx,cz).some(t=>Math.hypot(t.x-cx,t.z-cz)<9))continue;
        const t={x:cx,z:cz, h:6.5+random()*6.3, w:2.8+random()*2.1, t:random()};
        trees.push(t);groundTrees.insert(t,{x0:cx-9,x1:cx+9,z0:cz-9,z1:cz+9});
      }
    }
  }
  // Instance by large geographic cells for practical frustum culling at eye level.
  const byTile=new Map();
  for(const t of trees){
    const id=Math.floor(t.x/1900)+','+Math.floor(t.z/1900);
    if(!byTile.has(id))byTile.set(id,[]);
    byTile.get(id).push(t);
  }
  const leaves=fillCityTrees(group,byTile);
  return {count:trees.length,leaves};
}

function streetLighting(group, lamps) {
  const partitions=cluster(lamps,p=>p);
  const pole=new THREE.CylinderGeometry(.115,.177,7.6,6,1);
  pole.translate(0,3.8,0);
  const arm=new THREE.BoxGeometry(1.9,.11,.13);
  arm.translate(.85,7.56,0);
  const housing=new THREE.BoxGeometry(.86,.15,.39);
  housing.translate(1.75,7.48,0);
  const bulb=new THREE.PlaneGeometry(.74,.30);
  bulb.rotateX(PI/2);bulb.translate(1.75,7.39,0);
  const metal=new THREE.MeshStandardMaterial({color:0x7b817e,roughness:.55,metalness:.39});
  const light=new THREE.MeshStandardMaterial({color:0xffe3b2,emissive:0xffc784,emissiveIntensity:.02});
  const matrix=new THREE.Object3D();
  for(const list of partitions.values()){
    const meshes=[new THREE.InstancedMesh(pole,metal,list.length),new THREE.InstancedMesh(arm,metal,list.length), new THREE.InstancedMesh(housing,metal,list.length),new THREE.InstancedMesh(bulb,light,list.length)];
    list.forEach((l,i)=>{
      matrix.position.set(l.x,.10,l.z);matrix.rotation.y=-Math.atan2(l.dz,l.dx);matrix.updateMatrix();
      for(const mesh of meshes)mesh.setMatrixAt(i,matrix.matrix);
    });
    for(const mesh of meshes){mesh.computeBoundingSphere();group.add(mesh);}
  }
  return light;
}
function collectLamps(lamps,feature,line,half,blocks,marks,waters) {
  if(feature.bridge||half<5.25||!['primary','secondary','trunk'].includes(feature.kind))return;
  let cumulative=0,at=17;
  for(let i=1;i<line.length;i++){
    const a=line[i-1],b=line[i],vx=b.x-a.x,vz=b.z-a.z,d=Math.hypot(vx,vz);
    if(d<.1)continue;
    while(at<cumulative+d){
      const f=(at-cumulative)/d,nx=-vz/d,nz=vx/d;
      for(const side of [-1,1]){
        const x=a.x+vx*f+side*nx*(half+.65),z=a.z+vz*f+side*nz*(half+.65);
        if(!blocks.hits(x,z)&&!waters.hits(x,z)&&!marks.hits(x,z))lamps.push({x,z,dx:-side*nx,dz:-side*nz});
      }
      at+=52;
    }
    cumulative+=d;
  }
}

const replacedRefs=new Set([...hutongRefs,...precinctRefs,...cbdReplacedRefs,'relation/7820447','way/599547918','relation/8847697','way/4974233','way/29201257','way/43921139','way/638449347','relation/563404']);
function cluster(records,read) {
  const groups=new Map();
  for(const record of records) {
    const sample=read(record);
    if(!sample)continue;
    const key=Math.floor(sample.x/TILE)+','+Math.floor(sample.z/TILE);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(record);
  }
  return groups;
}
function lineVertices(coords,project) {
  const line=[];
  for(const [lon,lat] of coords) {
    const p=project(lon,lat), prev=line.at(-1);
    if(!prev||Math.hypot(prev.x-p.x,prev.z-p.z)>.08)line.push(p);
  }
  return line;
}
export const stoneBridgeWidths=new Map([[29241072,9.9],[29241084,8],[29241090,8],[29241106,7.8],[29241112,8],[29241129,6.7],[523763741,6.4]]);
function roadWidth(feature,kind) {
  if(stoneBridgeWidths.has(feature.osmId))return stoneBridgeWidths.get(feature.osmId);
  const surveyed=streetWidth(feature.osmId);if(surveyed)return surveyed;
  if(Number(feature.width)>0)return clamp(Number(feature.width),.7,60);
  if(Number(feature.lanes)>0)return clamp(Number(feature.lanes)*3.35,2,48);
  if((feature.kind||'').endsWith('_link'))return 4.6;
  return roadWidths[kind]||4.0;
}
function progress(call,frac,text) {
  if(call)call(frac,text);
}
export async function createCity({scene,project,landmarks,onProgress}) {
  progress(onProgress,.04,'读取北京建筑与地表');
  const [data,imagery,urbanFacades]=await Promise.all([loadBeijing(),loadImagery(project),gpuFacadeArray()]);
  const city=new THREE.Group();city.name='北京城区实景底图';
  const layer={imagery:imagery.group,buildings:new THREE.Group(),roads:new THREE.Group(),water:new THREE.Group(),streetlights:new THREE.Group(),vegetation:new THREE.Group(),plazas:new THREE.Group(),cbd2023:new THREE.Group()};
  layer.cbd2023.visible=false;let cmab=null;
  for(const [key,group] of Object.entries(layer)){group.name=key;city.add(group);}
  // An underlay outside the mapped urban core remains beneath the separate DEM.
  imagery.planes[0].mesh.position.y=-789;
  const u={uUrbanFacades:{value:urbanFacades},uCityNight:{value:0},uCityWet:{value:0},uCitySnow:{value:0},uCityClock:{value:0}};
  const m=materials(u);
  const blocks=new SpatialIndex(90),water=new SpatialIndex(140),roads=new SpatialIndex(105),paving=new SpatialIndex(140);
  const marks=landmarkIndex(landmarks,project);
  const stats={...data.meta.counts,buildingMeshes:0,treeInstances:0,taggedHeight:data.meta.heightCoverage.taggedHeight,levelsOnly:data.meta.heightCoverage.levelsOnly};
  const firstPoint=coords=>coords && coords.length?project(coords[0][0],coords[0][1]):null;
  const groups=cluster(data.buildings,f=>firstPoint(f.ring));
  for(const mesh of createCbdMeshes(project)){mesh.castShadow=true;layer.buildings.add(mesh);}
  for(const p of cbdFootprints(project))blocks.insert(p,p.bb);
  let n=0;
  for(const list of groups.values()){
    const bin=new Batch(),writer=ordinaryBatch(bin);
    for(const f of list){
      const area=projectArea(f,project);
      if(!area)continue;
      const {bb}=area;
      if(replacedRefs.has(f.osmType+'/'+f.osmId)||marks.hits(bb.x,bb.z))continue;
      const footprint=Math.abs(ringArea(area.ring));
      if(footprint<2.2)continue;
      const seed=seedAt(bb.x,bb.z),h=propertyHeight(f,footprint);
      if(f.osmType==='way'&&templeCourtWays.has(f.osmId))templeCourtHall(bin,area,f,h);
      else ordinaryGeometry(writer,area,f,h,seed,1,footprint);
      blocks.insert(area,{x0:bb.x0-2,x1:bb.x1+2,z0:bb.z0-2,z1:bb.z1+2});
      stats.buildingMeshes++;
    }
    if(bin.indices.length){const mesh=bin.mesh(m.buildings);mesh.castShadow=true;layer.buildings.add(mesh);}
    if(++n%4===0){progress(onProgress,.12+.47*n/groups.size,'生成建筑轮廓与立面');await nextFrame();}
  }
  const surfaceBins=new Map(),waterColor=new THREE.Color('#487170');
  for(const f of data.water){
    const area=projectArea(f,project);if(!area)continue;
    const {bb}=area;
    surface(batchAt(surfaceBins,bb.x,bb.z),area,.018,waterColor,0);
    water.insert(area,bb);
  }
  geometries(layer.water,surfaceBins,m.water,false);
  const stone=new THREE.Color('#b8ab92'),asphalt=new THREE.Color('#86847b');
  for(const f of data.plazas||[]){
    const area=projectArea(f,project);if(!area)continue;
    const {bb}=area;
    paving.insert(area,bb);
    const tone=(/asphalt|parking/.test(f.kind)?asphalt:stone);
    surface(batchAt(surfaceBins,bb.x,bb.z),area,.042,tone,-3);
  }
  geometries(layer.plazas,surfaceBins,m.road,false);
  const lamps=[];
  const roadGroups=cluster(data.roads,f=>firstPoint(f.line));
  n=0;
  for(const list of roadGroups.values()){
    const bin=new Batch();
    for(const f of list){
      const line=lineVertices(f.line,project);
      if(line.length<2)continue;
      const kind=(f.kind||'').replace('_link','');
      const half=roadWidth(f,kind)/2;
      if(!stoneBridgeWidths.has(f.osmId)&&!streetElevated(f.osmId))drawRoad(bin,line,half,kind,f.bridge);
      if(!streetEnhanced(f.osmId))collectLamps(lamps,f,line,half,blocks,marks,water);
      for(let i=1;i<line.length;i++){
        const a=line[i-1],b=line[i],padding=half+1;
        const bb={x0:Math.min(a.x,b.x)-padding,x1:Math.max(a.x,b.x)+padding,z0:Math.min(a.z,b.z)-padding,z1:Math.max(a.z,b.z)+padding};
        roads.insert({a,b,kind,width:stoneBridgeWidths.has(f.osmId)?half-.35:half+.75,bridge:f.bridge},bb);
      }
    }
    if(bin.indices.length)layer.roads.add(bin.mesh(m.road));
    if(++n%5===0){progress(onProgress,.61+.19*n/roadGroups.size,'铺设道路、步道与桥面');await nextFrame();}
  }
  const streetScene=buildStreetScene(data.roads,project,(x,z,r)=>blocks.hits(x,z,r)||marks.hits(x,z,r)||water.hits(x,z),
    (x,z,r)=>roads.at(x,z).some(s=>!s.bridge&&!pedestrian.has(s.kind)&&edgeDistance(x,z,s.a,s.b)<s.width-.75+r),walkingGround(project,landmarks||[]));
  addStreetMeshes(layer.roads,streetScene,u);stats.streets=streetScene.counts;
  const lampMaterial=streetLighting(layer.streetlights,lamps);stats.illustrativeStreetlights=lamps.length+streetScene.counts.lamps;
  progress(onProgress,.84,'生成绿地中的树冠');
  const parks=[];
  for(const f of data.parks){
    if(/pitch|golf|track|cemetery|recreation_ground/.test(f.kind))continue;
    const a=projectArea(f,project);if(a)parks.push(a);
  }
  const anchors=(landmarks||[]).map(l=>project(l.lon,l.lat));
  function closestAnchor(park) {
    const b=park.bb;
    return Math.min(...anchors.map(p=>Math.hypot(p.x-clamp(p.x,b.x0,b.x1),p.z-clamp(p.z,b.z0,b.z1))));
  }
  parks.sort((a,b)=>closestAnchor(a)-closestAnchor(b));
  const trees=buildTrees(layer.vegetation,parks,imagery,blocks,marks,water,paving,roads);
  stats.treeInstances=trees.count;
  scene.add(city);
  const snowTint=new THREE.Color(0xc3cbd0),leafBase=new THREE.Color(0xffffff);
  function isBlocked(x,z,radius=.55) {
    if(marks.hits(x,z,radius)||blocks.hits(x,z,radius)||(layer.cbd2023.visible&&cmab?.blocks.hits(x,z,radius)))return true;
    if(!water.hits(x,z))return false;
    return !roads.at(x,z).some(s=>s.bridge&&edgeDistance(x,z,s.a,s.b)<s.width);
  }
  function setLayer(name,visible) {
    const aliases={parks:'vegetation',trees:'vegetation',satellite:'imagery',building:'buildings'};
    if(name==='cbd2023'&&visible&&!cmab){
      cmab=prepareCmabLayer(project);
      for(const [key,list] of cmab.tiles){
        const batch=new Batch(),writer=ordinaryBatch(batch);
        for(const item of list)ordinaryGeometry(writer,item.poly,item.feature,item.height,item.seed,1,item.planArea);
        const mesh=batch.mesh(m.buildings);mesh.name='CMAB 2023 '+key;mesh.castShadow=true;layer.cbd2023.add(mesh);
      }
    }
    const group=layer[aliases[name]||name];
    if(group)group.visible=Boolean(visible);
    if(name==='roads')layer.streetlights.visible=Boolean(visible);
  }
  let lastWet=-1,lastSnow=-1,lastCameraX=Infinity,lastCameraZ=Infinity,lastCameraY=Infinity;
  function update({night=0,wet=0,snow=0,dt=.016,camera}={}) {
    u.uCityClock.value=(u.uCityClock.value+Math.min(.2,dt||0))%20000;
    u.uCityNight.value=clamp(Number(night)||0,0,1);
    lampMaterial.emissiveIntensity=.02+2.8*u.uCityNight.value;
    const w=clamp(Number(wet)||0,0,1), s=clamp(Number(snow)||0,0,1);
    u.uCityWet.value=w; u.uCitySnow.value=s;
    if(Math.abs(w-lastWet)>.025){m.road.roughness=.91-.56*w;m.buildings.roughness=.76-.19*w;lastWet=w;}
    if(Math.abs(s-lastSnow)>.03){trees.leaves.color.copy(leafBase).lerp(snowTint,s*.35);lastSnow=s;}
    if(camera){
      const pos=camera.position;
      if(Math.abs(pos.x-lastCameraX)+Math.abs(pos.z-lastCameraZ)+Math.abs(pos.y-lastCameraY)>150){
        // Urban blocks retain their true positions. Distant unresolvable meshes
        // yield to the geographic image to hold frame rate on the ground.
        for(const group of [layer.buildings,layer.roads,layer.plazas,layer.water,layer.vegetation,layer.streetlights]){
          const vegetation=group===layer.vegetation, buildings=group===layer.buildings;
          const far=group===layer.streetlights?1000:buildings?Math.max(7300,pos.y*5.5):vegetation?Math.max(2600,pos.y*3.8):Math.max(4200,pos.y*4.5);
          for(const mesh of group.children){
            const sphere=mesh.isInstancedMesh?mesh.boundingSphere:mesh.geometry.boundingSphere;
            if(sphere){
              const distance=Math.hypot(sphere.center.x-pos.x,sphere.center.z-pos.z);
              mesh.visible=distance<(mesh.userData.groundShade?950:mesh.userData.streetProp?1050:far)+sphere.radius;
              if(mesh.userData.lowGeometry)mesh.geometry=distance>(mesh.userData.streetProp?320+sphere.radius:1350)?mesh.userData.lowGeometry:mesh.userData.highGeometry;
            }
          }
        }
        lastCameraX=pos.x;lastCameraY=pos.y;lastCameraZ=pos.z;
      }
    }
  }
  progress(onProgress,1,'北京城区已就绪');
  return {reflection:m.water.userData.setReflection,group:city,stats,isBlocked,setLayer,update,meta:data.meta,imagery:imagery.manifest};
}

// Shared planar geographic tests also drive the software-rendered scene.
export { SpatialIndex, cleanRing, projectArea, bounds, inPolygon, ringArea, edgeDistance, lineVertices, roadWidth, propertyHeight, landmarkIndex, templeCourtWays, replacedRefs, seedAt, rngGenerator };
