import * as T from 'three';
import {createLandmark} from '../dist/landmarks.js';
export function walkingTriangles(id){
 const g=createLandmark(id),values=[];g.updateMatrixWorld(true);
 const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
 g.traverse(mesh=>{if(!mesh.isMesh||!mesh.geometry.index)return;const at=mesh.geometry.attributes,p=at.position,col=at.color,ind=mesh.geometry.index.array;if(!col)return;
 const load=(v,i)=>v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);
 for(let n=0;n<ind.length;n+=3){const ia=ind[n],ib=ind[n+1],ic=ind[n+2];if(p.getY(ia)>.01+10||p.getY(ia)<.12)continue;
  const cr=col.getX(ia),cg=col.getY(ia),cb=col.getZ(ia);
  if(cr<.21||cg/cr<.66||cb/cg<.58)continue;
  load(a,ia);load(b,ib);load(c,ic);
  if(Math.max(a.y,b.y,c.y)-Math.min(a.y,b.y,c.y)>.12)continue;
  const abx=b.x-a.x,abz=b.z-a.z,acx=c.x-a.x,acz=c.z-a.z,area=abx*acz-abz*acx;
  if(Math.abs(area)<.65)continue;
  values.push(a.x,a.z,b.x,b.z,c.x,c.z,(a.y+b.y+c.y)/3);
 }});
 return new Float64Array(values);
}
