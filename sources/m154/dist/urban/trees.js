// Tree boughs have tapered forks. Each cutout contains photographed individual leaves.
import * as THREE from 'three';

const tau=Math.PI*2;
const materialCache=new Map();
const surfaces={
  willowWood:['trees-willow-bark',false],wood:['trees-hackberry-bark',false],
  willow:['trees-willow-spray',true],broad:['trees-broad-spray',true],
  tile:['../heritage/precinct-grey-tile',false],quay:['waterfront-quay',false],deck:['waterfront-deck',false],rail:['waterfront-stone',false],
  trees:['trees-canopy',true],shadow:['trees-shade',true]
};
export function natureMaterial(key){
  if(materialCache.has(key))return materialCache.get(key);
  const [file,cutout]=surfaces[key],src=new URL(file+'.webp',import.meta.url).href;
  const tex=typeof document==='undefined'?new THREE.Texture():new THREE.TextureLoader().load(src);
  tex.userData.src=src;tex.anisotropy=6;tex.colorSpace=THREE.SRGBColorSpace;
  if(!cutout)tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  const properties={map:tex,side:THREE.DoubleSide,roughness:cutout?.91:.89,alphaTest:cutout?.28:0,vertexColors:true};
  const mat=key==='shadow'?new THREE.MeshBasicMaterial({map:tex,color:0x3b452c,depthWrite:false,transparent:true,opacity:.28,polygonOffset:true,polygonOffsetFactor:-2}):new THREE.MeshStandardMaterial(properties);
  mat.name='Landscape '+key+(cutout?' cutout':'');materialCache.set(key,mat);return mat;
}

export class NatureMeshes{
  constructor(){this.layers=new Map();}
  face(key,points,uv,shade=1){
    let data=this.layers.get(key);if(!data){data={pos:[],uv:[],idx:[],color:[]};this.layers.set(key,data);}
    const first=data.pos.length/3;
    points.forEach((p,i)=>{data.pos.push(...p);data.uv.push(...uv[i]);data.color.push(shade,shade,shade);});
    for(let i=1;i<points.length-1;i++)data.idx.push(first,first+i,first+i+1);
  }
  finish(){
    return [...this.layers].map(([key,d])=>{
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(d.pos,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(d.uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(d.color,3));
      g.setIndex(d.idx);g.computeVertexNormals();g.computeBoundingSphere();
      const m=new THREE.Mesh(g,natureMaterial(key));m.name='Landscape '+key;m.castShadow=key!=='shadow'&&key!=='trees';m.receiveShadow=true;return m;
    });
  }
}
function random(seed){
  let v=seed>>>0;return ()=>((v=(Math.imul(v,1664525)+1013904223)>>>0)/4294967296);
}
function limb(mesh,key,stations,radii,sides,shade){
  let total=0;
  const rings=stations.map((p,i)=>{
    const a=stations[Math.max(0,i-1)],b=stations[Math.min(stations.length-1,i+1)];
    const dir=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize();
    const tangent=new THREE.Vector3(0,0,1).cross(dir).normalize(),bitangent=new THREE.Vector3().crossVectors(dir,tangent);
    return Array.from({length:sides},(_,j)=>{
      const k=j*tau/sides,rr=radii[i]*(1+.065*Math.sin(3*k+.4));
      return [p[0]+rr*(tangent.x*Math.cos(k)+bitangent.x*Math.sin(k)),p[1]+rr*(tangent.y*Math.cos(k)+bitangent.y*Math.sin(k)),p[2]+rr*(tangent.z*Math.cos(k)+bitangent.z*Math.sin(k))];
    });
  });
  for(let i=1;i<rings.length;i++){
    const length=Math.hypot(...stations[i].map((v,k)=>v-stations[i-1][k])),next=total+length*.58;
    for(let j=0;j<sides;j++){
      const k=(j+1)%sides;
      mesh.face(key,[rings[i-1][j],rings[i-1][k],rings[i][k],rings[i][j]],[[j/sides,total],[(j+1)/sides,total],[(j+1)/sides,next],[j/sides,next]],shade);
    }
    total=next;
  }
}
function spray(mesh,key,p,axis,width,length,lean,shade){
  const ca=Math.cos(axis),sa=Math.sin(axis),bend=lean*.65,ring=(t,w,y,d)=>[
    [p[0]-ca*w+sa*d,p[1]+y,p[2]-sa*w-ca*d],[p[0]+ca*w+sa*d,p[1]+y,p[2]+sa*w-ca*d]
  ];
  const top=ring(0,width*.5,0,0),middle=ring(.48,width*.51,-length*.48,bend),bottom=ring(1,width*.48,-length,lean);
  mesh.face(key,[top[0],middle[0],middle[1],top[1]],[[0,1],[0,.52],[1,.52],[1,1]],shade);
  mesh.face(key,[middle[0],bottom[0],bottom[1],middle[1]],[[0,.52],[0,0],[1,0],[1,.52]],shade);
}
// Tree dimensions and locations are illustrative. Trunk axes and boughs are true 3-D at close range.
export function addTree(mesh,x,z,height,radius,seed,willow=true,detail=1,ground=.19){
  const rng=random(seed),wood=willow?'willowWood':'wood',leaves=willow?'willow':'broad',a0=rng()*tau,h=height,r=radius;
  const ca=Math.cos(a0),sa=Math.sin(a0),origin=[x,ground,z],lean=.065*h*(rng()-.22);
  const center=(t)=>[x+lean*t*ca+Math.sin(5*t)*.049*h,ground+h*t,z+lean*t*sa+Math.sin(3.6*t)*.055*h];
  const trunkR=h*(.023+rng()*.008);
  limb(mesh,wood,[origin,center(.09),center(.25),center(.40),center(.59),center(.71)],[trunkR*1.56,trunkR,trunkR*.92,trunkR*.79,trunkR*.54,trunkR*.17],detail?9:6,.92);
  for(let i=0;i<(detail?5:3);i++){
    const a=a0+i*2.25,root=[x+Math.cos(a)*trunkR*2.3,ground+.015,z+Math.sin(a)*trunkR*2.3];
    limb(mesh,wood,[root,center(.035),center(.14)],[.028,trunkR*.63,trunkR*.55],5,.81);
  }
  const n=detail?13:8;
  for(let i=0;i<n;i++){
    const axis=a0+i*2.39996+rng()*.53,top=i/n,reach=r*(.47+.56*Math.sin((top*.78+.14)*Math.PI))*(.84+.28*rng());
    const spread=t=>axis+.21*Math.sin(t*3+i);
    const p0=center(.18+top*.42+.05*rng()),apex=h*(.58+.40*top+.095*rng());
    const up=(t)=>[p0[0]+reach*t*Math.cos(spread(t)),p0[1]+(ground+apex-p0[1])*(.95*t+.08*Math.sin(t*3)),p0[2]+reach*t*Math.sin(spread(t))];
    const p1=up(.36),p2=up(.72),p3=up(1);
    limb(mesh,wood,[p0,p1,p2,p3],[trunkR*(.44-.19*top),trunkR*.34,trunkR*.18,.022*h],detail?6:4,.88+.2*rng());
    const forks=detail?5:3;
    for(let j=0;j<forks;j++){
      const t=.32+.65*(j+.4*rng())/forks,base=up(t),side=(j%2?1:-1),az=axis+side*(.56+rng()*.83);
      const ext=r*(.22+.32*rng())*(1-.42*top);
      const leafTop=[base[0]+ext*Math.cos(az),base[1]+h*(.074+.10*rng()),base[2]+ext*Math.sin(az)];
      const mid=[base[0]+ext*.47*Math.cos(az-.13),base[1]+h*.09,base[2]+ext*.47*Math.sin(az-.13)];
      limb(mesh,wood,[base,mid,leafTop],[trunkR*.16,.041,.013],4,.95);
      const bunches=detail?5:3;
      for(let k=0;k<bunches;k++){
        const f=rng(),sw=r*(.27+.23*rng()),length=h*(willow?.24+.22*rng():.14+.13*rng());
        const p=[leafTop[0]+r*(f-.48)*.35,leafTop[1]+h*(rng()-.51)*.11,leafTop[2]+r*(rng()-.5)*.33];
        if(willow){
          spray(mesh,leaves,p,az+.56*k+rng()*.95,sw,length,sw*(.13+.55*rng()),.61+.22*top+.31*rng());
        }else{
          p[1]-=.55*length;
          spray(mesh,leaves,p,az+.71*k+rng()*.95,sw*1.24,-length*rng()-.12*h,sw*(.49+.82*rng()),.64+.19*top+.32*rng());
        }
      }
    }
  }
}

export function addTreeCard(mesh,x,z,height,radius,variant,angle,base=.12){
  const u0=(variant*256+.7)/2048,u1=((variant+1)*256-.7)/2048;
  for(let i=0;i<3;i++){
    const a=angle+i*Math.PI/3,dx=radius*Math.cos(a),dz=radius*Math.sin(a);
    mesh.face('trees',[[x-dx,base,z-dz],[x+dx,base,z+dz],[x+dx,base+height,z+dz],[x-dx,base+height,z-dz]],[[u0,0],[u1,0],[u1,1],[u0,1]]);
  }
}

// Crossed crown photographs come from offscreen renders of the same branch geometry.
// Shared tile meshes avoid allocating a scene node for each tree.
export function fillCityTrees(group,byTile){
  function cards(count,variant){
    const g=new THREE.BufferGeometry(),p=[],uv=[],index=[],norm=[];
    for(let i=0;i<count;i++){
      const a=i*Math.PI/count,dx=Math.cos(a),dz=Math.sin(a),o=p.length/3;
      p.push(-dx,0,-dz,dx,0,dz,dx*.97,1,dz*.97,-dx*.97,1,-dz*.97);
      norm.push(0,.95,.31,0,.95,.31,0,.95,.31,0,.95,.31);
      const u0=(variant+.003)/8,u1=(variant+.997)/8;
      uv.push(u0,0,u1,0,u1,1,u0,1);index.push(o,o+1,o+2,o,o+2,o+3);
    }
    g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);return g;
  }
  const template=natureMaterial('trees'),leaves=new THREE.MeshLambertMaterial({map:template.map,color:0xffffff,alphaTest:.33,side:THREE.DoubleSide});
  leaves.name='Urban tree crown cutouts';
  leaves.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      // Give overhead views a canopy with occupied area in plan.
      vec2 toEye=cameraPosition.xz-instanceMatrix[3].xz;
      float slope=abs(cameraPosition.y-instanceMatrix[3].y)/(length(toEye)+1.);
      transformed.z+=smoothstep(.42,1.6,slope)*(.68-uv.y*1.36)*.79;`);
  };
  const full=Array.from({length:8},(_,i)=>cards(3,i)),low=Array.from({length:8},(_,i)=>cards(2,i)),shade=natureMaterial('shadow'),plane=new THREE.PlaneGeometry(2,2);plane.rotateX(-Math.PI/2);
  const obj=new THREE.Object3D();
  for(const tile of byTile.values()){
    const variants=Array.from({length:8},()=>[]),shadow=new THREE.InstancedMesh(plane,shade,tile.length);
    shadow.name='Dappled canopy shade';shadow.userData.groundShade=true;
    tile.forEach((t,i)=>{
      variants[Math.floor(t.t*8)].push(t);
      obj.rotation.y=t.t*tau;obj.position.set(t.x+.29*t.w,.154,t.z+.15*t.w);obj.scale.set(t.w*1.16,1,t.w*1.05);obj.updateMatrix();shadow.setMatrixAt(i,obj.matrix);
    });
    variants.forEach((list,k)=>{
      if(!list.length)return;
      const canopy=new THREE.InstancedMesh(full[k],leaves,list.length);
      canopy.userData.highGeometry=full[k];canopy.userData.lowGeometry=low[k];canopy.name='Urban crown '+(k+1);
      list.forEach((t,i)=>{
        obj.position.set(t.x,.10,t.z);obj.rotation.y=t.t*tau;obj.scale.set(t.w,t.h,t.w);obj.updateMatrix();canopy.setMatrixAt(i,obj.matrix);
      });
      canopy.computeBoundingSphere();canopy.receiveShadow=true;group.add(canopy);
    });
    shadow.computeBoundingSphere();group.add(shadow);
  }
  return leaves;
}
