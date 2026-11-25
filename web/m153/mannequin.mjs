import * as T from './assets/three.mjs';
import * as packed from './mannequin-data.mjs';
import {poseScale} from './motion-track.mjs';

const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const up=v(0,1,0),identity=new T.Quaternion();
const midpoint=(a,b)=>a.clone().lerp(b,.5);
const clamp=T.MathUtils.clamp;
function unpack(s,Type){return new Type(Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer);}
const bind=Float32Array.from(unpack(packed.vertices,Int16Array),x=>x/10000);
const index=unpack(packed.triangles,Uint16Array),ids=unpack(packed.bones,Uint8Array);
const weights=unpack(packed.weights,Uint8Array),tone=unpack(packed.tone,Uint8Array);
const template=new T.BufferGeometry();
template.setIndex(new T.BufferAttribute(index,1));
const bindNormals=Float32Array.from(unpack(packed.normal,Int8Array),x=>x/127);
const rest=Object.fromEntries(packed.skeleton.map(({name,pivot,end},i)=>{
  const start=v(...pivot),axis=v(...end).sub(start);
  return [name,{i,start,dir:axis.clone().normalize(),len:axis.length()}];
}));
const basis=(x,y)=>{
  y=y.clone().normalize();x=x.clone().addScaledVector(y,-x.dot(y));
  if(x.lengthSq()<1e-9)x.set(Math.abs(y.x)<.8?1:0,0,Math.abs(y.x)<.8?0:1).addScaledVector(y,-x.dot(y));
  x.normalize();return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,x.clone().cross(y)));
};
function aim(bindDir,direction,base){
  if(direction.lengthSq()<1e-10)return base.clone();
  const from=bindDir.clone().applyQuaternion(base),to=direction.clone().normalize();
  return new T.Quaternion().setFromUnitVectors(from,to).multiply(base);
}
function joint(start,bendTarget,endTarget,a,b,baseHint){
  const direction=endTarget.clone().sub(start);
  const reach=a+b-.00001,screen=direction.x**2+direction.y**2;
  // A foreshortened depth estimate must not pull a visible wrist or ankle sideways.
  const zLimit=Math.sqrt(Math.max(0,reach*reach-screen));
  direction.z=clamp(direction.z,-zLimit,zLimit);
  const d=clamp(direction.length(),Math.abs(a-b)+.0001,a+b-.00001);
  if(direction.lengthSq()<1e-10)direction.copy(baseHint);
  direction.normalize();
  const along=(a*a-b*b+d*d)/(2*d);
  let bend=bendTarget.clone().sub(start);bend.addScaledVector(direction,-bend.dot(direction));
  if(bend.lengthSq()<1e-8){bend=baseHint.clone();bend.addScaledVector(direction,-bend.dot(direction));}
  if(bend.lengthSq()<1e-8){bend=v(1,0,0);bend.addScaledVector(direction,-bend.dot(direction));}
  return [start.clone().addScaledVector(direction,along).addScaledVector(bend.normalize(),Math.sqrt(Math.max(0,a*a-along*along))),start.clone().addScaledVector(direction,d)];
}
const pigment=[.945,.929,.900];
const toLinear=Float32Array.from({length:1024},(_,i)=>T.ColorManagement.toWorkingColorSpace(new T.Color(i/1023,i/1023,i/1023),T.SRGBColorSpace).r);
export function mannequin(){
  const geometry=new T.BufferGeometry();geometry.setIndex(template.index);
  for(const key of ['position','color'])geometry.setAttribute(key,new T.BufferAttribute(new Float32Array(bind.length),3).setUsage(T.DynamicDrawUsage));
  const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({vertexColors:true,toneMapped:false}));mesh.frustumCulled=false;
  const poses=Array.from({length:packed.skeleton.length},()=>({q:identity.clone(),pos:v()}));
  const dual=new Float64Array(8*poses.length);
  const shades=new Float32Array(tone.length);
  function place(observation,aspect){
    mesh.visible=!!observation;if(!observation)return null;
    const data=observation.p||observation,scale=observation.scale||poseScale(data,aspect);
    const p=data.map(([x,y,z,,metric])=>v((x-.5)*aspect,.5-y,Number.isFinite(metric)?-metric*scale:-z*aspect*.47));
    const hips=midpoint(p[23],p[24]), shoulders=midpoint(p[11],p[12]);
    const spine=shoulders.clone().sub(hips);
    const qHip=basis(p[23].clone().sub(p[24]),spine);
    const qChest=basis(p[11].clone().sub(p[12]),spine);
    const yHip=up.clone().applyQuaternion(qHip),yChest=up.clone().applyQuaternion(qChest);
    const spineRoot=hips.clone().addScaledVector(yHip,.015*scale);
    const waist=spineRoot.clone().addScaledVector(yHip,.185*scale);
    function attach(name,point,q){
      const bone=rest[name],t=poses[bone.i];t.q.copy(q);t.pos.copy(point).addScaledVector(bone.start.clone().applyQuaternion(q),-scale);
    }
    function atBone(name,point){const t=poses[rest[name].i];return point.clone().applyQuaternion(t.q).multiplyScalar(scale).add(t.pos);}
    attach('pelvis',spineRoot,qHip);attach('chest',waist,qChest);
    const neck=atBone('chest',rest.neck.start),ears=midpoint(p[7],p[8]);
    const observedUp=ears.clone().sub(shoulders);
    const headUp=yChest.clone();
    if(observedUp.lengthSq()>1e-9)headUp.lerp(observedUp.normalize(),.58).normalize();
    const neckQ=aim(up,headUp,qChest);attach('neck',neck,neckQ);
    const faceAxis=p[7].clone().sub(p[8]);
    const headQ=faceAxis.lengthSq()>1e-8?basis(faceAxis,headUp):neckQ;
    attach('head',atBone('neck',rest.head.start),headQ);
    const feet=[];
    for(const [side,n,sign] of [['l',0,1],['r',1,-1]]){
      const upper=side+'Upper',fore=side+'Fore',hand=side+'Hand',thigh=side+'Thigh',shin=side+'Shin',foot=side+'Foot';
      const shoulder=atBone('chest',rest[upper].start),hip=atBone('pelvis',rest[thigh].start);
      // Use the tracked endpoints and the observed bend plane for a two-link solve.
      // Each anatomical segment keeps its rest length through bends and foreshortening.
      const limb=(name,lower,start,bend,tip,base,hint)=>{
        const [k,end]=joint(start,bend,tip,rest[name].len*scale,rest[lower].len*scale,hint.clone().applyQuaternion(base));
        const first=aim(rest[name].dir,k.clone().sub(start),base);
        const second=aim(rest[lower].dir,end.clone().sub(k),first);
        attach(name,start,first);attach(lower,k,second);return [end,second];
      };
      const [wrist,foreQ]=limb(upper,fore,shoulder,p[13+n],p[15+n],qChest,v(sign*.3,-.2,-1));
      const palmDir=midpoint(p[17+n],p[19+n]).sub(p[15+n]);
      let handQ=aim(rest[hand].dir,palmDir,foreQ);
      // Coarse palm roll from index/pinky; the capture has no independent finger joints.
      const measured=p[17+n].clone().sub(p[19+n]).multiplyScalar(sign);
      const axis=palmDir.clone().normalize(),sideways=v(1,0,0).applyQuaternion(handQ);
      measured.addScaledVector(axis,-measured.dot(axis));sideways.addScaledVector(axis,-sideways.dot(axis));
      if(measured.length()>.014*scale&&sideways.lengthSq()>.02){
        measured.normalize();sideways.normalize();
        const angle=Math.atan2(axis.dot(sideways.clone().cross(measured)),sideways.dot(measured));
        handQ=new T.Quaternion().setFromAxisAngle(axis,clamp(angle,-1.15,1.15)*.72).multiply(handQ);
      }
      attach(hand,wrist,handQ);
      const [ankle]=limb(thigh,shin,hip,p[25+n],p[27+n],qHip,v(0,0,1));
      const forward=p[31+n].clone().sub(p[29+n]);
      if(forward.lengthSq()<1e-10)forward.set(0,0,1).applyQuaternion(qHip);
      forward.normalize();
      // Heel-to-toe direction and a level sole define the foot independently of shin rotation.
      let sideAxis=up.clone().cross(forward);
      if(sideAxis.lengthSq()<.015)sideAxis=v(1,0,0).applyQuaternion(qHip);
      const footQ=basis(sideAxis,forward.clone().cross(sideAxis));attach(foot,ankle,footQ);
      const sole=atBone(foot,v(sign*.119,.015,.070));feet.push(sole);
    }
    const positions=geometry.attributes.position.array,colors=geometry.attributes.color.array;
    for(let i=0;i<poses.length;i++){
      const {q,pos}=poses[i],x=pos.x/scale*.5,y=pos.y/scale*.5,z=pos.z/scale*.5;
      dual.set([q.x,q.y,q.z,q.w,
        x*q.w+y*q.z-z*q.y,y*q.w+z*q.x-x*q.z,z*q.w+x*q.y-y*q.x,-x*q.x-y*q.y-z*q.z],i*8);
    }
    // Blend rigid transforms as dual quaternions to retain limb volume through twists.
    for(let i=0,j=0;i<tone.length;i++,j+=3){
      const x=bind[j],y=bind[j+1],z=bind[j+2],bx=bindNormals[j],by=bindNormals[j+1],bz=bindNormals[j+2];
      let qx=0,qy=0,qz=0,qw=0,dx=0,dy=0,dz=0,dw=0;
      const first=ids[j]*8;
      for(let k=j;k<j+3;k++){
        if(!weights[k])continue;
        const a=ids[k]*8,d=dual;
        const sign=d[a]*d[first]+d[a+1]*d[first+1]+d[a+2]*d[first+2]+d[a+3]*d[first+3]<0?-1:1;
        const weight=sign*weights[k];
        qx+=weight*d[a];qy+=weight*d[a+1];qz+=weight*d[a+2];qw+=weight*d[a+3];
        dx+=weight*d[a+4];dy+=weight*d[a+5];dz+=weight*d[a+6];dw+=weight*d[a+7];
      }
      const inv=1/(Math.sqrt(qx*qx+qy*qy+qz*qz+qw*qw)||1);
      qx*=inv;qy*=inv;qz*=inv;qw*=inv;dx*=inv;dy*=inv;dz*=inv;dw*=inv;
      const tx=2*(qy*z-qz*y),ty=2*(qz*x-qx*z),tz=2*(qx*y-qy*x);
      positions[j]=scale*(x+qw*tx+qy*tz-qz*ty+2*(qw*dx-dw*qx+qy*dz-qz*dy));
      positions[j+1]=scale*(y+qw*ty+qz*tx-qx*tz+2*(qw*dy-dw*qy+qz*dx-qx*dz));
      positions[j+2]=scale*(z+qw*tz+qx*ty-qy*tx+2*(qw*dz-dw*qz+qx*dy-qy*dx));
      const ux=2*(qy*bz-qz*by),uy=2*(qz*bx-qx*bz),uz=2*(qx*by-qy*bx);
      let nx=bx+qw*ux+qy*uz-qz*uy,ny=by+qw*uy+qz*ux-qx*uz,nz=bz+qw*uz+qx*uy-qy*ux;
      const inverse=1/(Math.sqrt(nx*nx+ny*ny+nz*nz)||1);nx*=inverse;ny*=inverse;nz*=inverse;
      const key=-.51*nx+.73*ny+.46*nz,wrap=clamp((key+.34)/1.34,0,1);
      const softSpec=Math.max(0,-.25*nx+.42*ny+.87*nz)**12;
      const rim=Math.max(0,.57*nx+.64*ny-.56*nz);
      const light=(.57+.415*wrap+.053*ny+.046*rim+.044*softSpec)*tone[i]/255;
      shades[i]=light;
      for(let c=0;c<3;c++)colors[j+c]=toLinear[clamp(Math.round(pigment[c]*light*1023),0,1023)];
    }
    geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;
    return {feet,scale,clearance:observation.clearance??0};
  }
  return {mesh,place,shades,pigment,dispose(){geometry.dispose();mesh.material.dispose();}};
}
