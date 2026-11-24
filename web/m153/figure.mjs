import * as T from './assets/three.mjs';

const vec=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const mid=(a,b)=>a.clone().lerp(b,.5);
const up=vec(0,1,0);
const form=(hex,rough=.5)=>new T.MeshStandardMaterial({color:hex,roughness:rough,metalness:.035});
const porcelain=form(0xe8e4db), face=form(0xf2eee6), joint=form(0x9d9990,.63);
const sphere=new T.SphereGeometry(1,28,20);
function turning(profile){
  return new T.LatheGeometry(profile.map(([height,radius])=>new T.Vector2(radius,height)),32);
}
const shapes={
  head:turning([[-.5,.03],[-.47,.28],[-.34,.53],[-.13,.76],[.16,.95],[.33,.88],[.45,.64],[.5,.12]]),
  chest:turning([[-.5,.5],[-.45,.69],[-.27,.81],[.06,.98],[.26,1],[.38,.90],[.46,.65],[.5,.36]]),
  hip:turning([[-.5,.25],[-.44,.53],[-.22,.86],[.08,1],[.31,.96],[.49,.64]]),
  upper:turning([[-.5,.50],[-.44,.68],[-.22,.79],[.08,.99],[.3,.95],[.44,.73],[.5,.40]]),
  fore:turning([[-.5,.47],[-.38,.53],[-.05,.75],[.22,1],[.42,.9],[.5,.55]]),
  thigh:turning([[-.5,.58],[-.39,.66],[-.04,.90],[.25,1],[.43,.88],[.5,.58]]),
  shin:turning([[-.5,.43],[-.32,.47],[.04,.78],[.26,1],[.4,.89],[.5,.62]])
};
function body(){
  const group=new T.Group(), items={};
  function mesh(name,geo=sphere,material=porcelain){
    const m=new T.Mesh(geo,material);group.add(m);items[name]=m;return m;
  }
  mesh('head',shapes.head,face); mesh('neck',sphere,joint);mesh('chest',shapes.chest);mesh('waist',sphere,joint);mesh('hips',shapes.hip);
  for(let side of ['l','r']){
    for(const [name,shape] of [['arm',shapes.upper],['fore',shapes.fore],['thigh',shapes.thigh],['shin',shapes.shin]]) mesh(side+name,shape);
    for(const name of ['shoulder','elbow','knee','ankle'])mesh(side+name,sphere,joint);
    for(const name of ['hand','thumb','foot','ear'])mesh(side+name); 
  }
  function at(name,p,x,y,z,q){const m=items[name];m.position.copy(p);m.scale.set(Math.max(x,.0001),Math.max(y,.0001),Math.max(z,.0001));if(q)m.quaternion.copy(q);}
  function segment(name,top,base,r,d=r*.92){
    const axis=top.clone().sub(base);const len=axis.length();const q=new T.Quaternion().setFromUnitVectors(up,axis.normalize());at(name,mid(top,base),r,len,d,q);
  }
  function basis(x,y){y.normalize();x.addScaledVector(y,-x.dot(y));if(x.lengthSq()<1e-8)x.set(1,0,0);x.normalize();const z=x.clone().cross(y).normalize();return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));}
  function place(data,aspect){
    group.visible=!!data;if(!data)return;
    const p=data.map(([x,y,z])=>vec((x-.5)*aspect,.5-y,-z*aspect));
    const sh=mid(p[11],p[12]), hip=mid(p[23],p[24]), spine=sh.clone().sub(hip);
    const torso=Math.max(.03,spine.length()), width=T.MathUtils.clamp(p[11].distanceTo(p[12]),torso*.49,torso*1.1);
    const q=basis(p[11].clone().sub(p[12]),spine.clone()); const y=up.clone().applyQuaternion(q);
    const h=torso;
    at('chest',hip.clone().lerp(sh,.71),width*.55,h*.68,width*.34,q);
    at('waist',hip.clone().lerp(sh,.31),width*.35,h*.17,width*.27,q);
    at('hips',hip.clone().lerp(sh,.09),width*.46,h*.38,width*.32,q);
    const ears=mid(p[7],p[8]), headAxis=ears.clone().sub(sh);if(headAxis.length()<h*.10)headAxis.copy(y).multiplyScalar(h*.3);
    const hq=basis(p[7].clone().sub(p[8]),headAxis.clone());
    at('neck',sh.clone().lerp(ears,.39),width*.16,h*.145,width*.15,hq);
    const center=ears.clone().addScaledVector(headAxis.clone().normalize(),h*.016);
    at('head',center,width*.283,h*.49,width*.296,hq);
    for(const [side,a,b,c,d,e,f,g,i,j,k,ear] of [['l',11,13,15,23,25,27,31,19,17,21,7],['r',12,14,16,24,26,28,32,20,18,22,8]]){
      const size=width;
      at(side+'shoulder',p[a],size*.148,size*.145,size*.148,q);
      segment(side+'arm',p[a],p[b],size*.137);
      at(side+'elbow',p[b],size*.099,size*.099,size*.099,q);segment(side+'fore',p[b],p[c],size*.111);
      const handEnd=mid(p[i],p[j]), hv=handEnd.clone().sub(p[c]), hl=T.MathUtils.clamp(hv.length(),h*.09,h*.24);
      const handq=new T.Quaternion().setFromUnitVectors(up,hv.normalize());
      at(side+'hand',p[c].clone().addScaledVector(hv,hl*.57),size*.082,hl*.70,size*.054,handq);
      at(side+'thumb',p[c].clone().lerp(p[k],.62),size*.041,hl*.37,size*.039,handq);
      segment(side+'thigh',p[d],p[e],size*.199);at(side+'knee',p[e],size*.133,size*.135,size*.13,q);
      segment(side+'shin',p[e],p[f],size*.145);
      at(side+'ankle',p[f],size*.077,size*.077,size*.077,q);
      const heel=p[side==='l'?29:30], toe=p[g], fv=toe.clone().sub(heel);const fl=T.MathUtils.clamp(fv.length(),h*.22,h*.59);
      const fQ=new T.Quaternion().setFromUnitVectors(vec(0,0,1),fv.normalize());
      at(side+'foot',heel.clone().lerp(toe,.53),size*.112,size*.085,fl*.60,fQ);
      at(side+'ear',p[ear],width*.042,h*.063,width*.051,hq);
    }
  }
  return{group,place};
}
export const backgrounds={sage:'#78857e',slate:'#394851',sand:'#b8a99a'};
export function makeStage(canvas,w,h,{transparent=false,figures=1}={}){
  let renderer;try{renderer=new T.WebGLRenderer({canvas,alpha:transparent,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}catch{return softwareStage(canvas,w,h,transparent,figures);}
  renderer.setPixelRatio(1);renderer.setSize(w,h,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0x000000,0);
  const camera=new T.OrthographicCamera(-w/h/2,w/h/2,.5,-.5,.01,40);camera.position.set(0,0,8);camera.lookAt(0,0,0);
  const scene=new T.Scene();scene.add(new T.HemisphereLight(0xfff8ea,0x8a959d,1.58));
  for(const [x,y,z,color,intensity] of [[-3,5,4,0xfff4df,3.35],[2,2,-3,0xffffff,2.4],[3,1,3,0xc6d4e1,.40]]){
    const light=new T.DirectionalLight(color,intensity);light.position.set(x,y,z);scene.add(light);
  }
  const bodies=Array.from({length:figures},()=>{const b=body();scene.add(b.group);return b});
  return{draw(poses,bg='sage'){scene.background=transparent?null:new T.Color(backgrounds[bg]||backgrounds.sage);bodies.forEach((b,i)=>b.place(poses[i],w/h));renderer.render(scene,camera);},dispose(){renderer.dispose();renderer.forceContextLoss();}};
}
// Three modeling studies used only in the empty workspace, never in exported footage.
export function study(phase,x,aspect,scale=1){
  const raw=Array.from({length:33},()=>[0,1.68,0,1]);let set=(i,a,b,c)=>{raw[i]=[a,b,c,1];};
  const swing=Math.sin(phase),rot=.62;set(0,0,1.68,.13);set(7,.081,1.68,0);set(8,-.081,1.68,0);
  for(const [s,n] of [[1,0],[-1,1]]){
    const t=s*swing;set(11+n,s*.192,1.42,.01);set(13+n,s*.23,1.15,-.11-t*.20);set(15+n,s*.22,.96+t*.08,.075-t*.33);
    for(const [i,dx,dy,dz] of [[17,.025,-.095,-.005],[19,-.012,-.10,.04],[21,-.03,-.048,.05]])set(i+n,s*(.22+dx),.96+t*.08+dy,.075-t*.33+dz);
    set(23+n,s*.123,.9,-.03);set(25+n,s*.14,.46+Math.max(t,0)*.10,t*.25+.04);
    const ankleY=.085+Math.max(-t,0)*.145;set(27+n,s*.146,ankleY,t*.39-.025);
    set(29+n,s*.148,ankleY-.025,t*.39-.07);set(31+n,s*.15,.035+Math.max(-t,0)*.14,t*.39+.155);
  }
  return raw.map(([a,b,c])=>{const X=a*Math.cos(rot)+c*Math.sin(rot),Z=c*Math.cos(rot)-a*Math.sin(rot);return[x+X*.44*scale/aspect,.91-b*.44*scale,-Z*.44*scale/aspect,1]});
}

// Orthographic triangle rasterizer for devices without a hardware graphics context.
// It uses the exact same geometry, joint transforms and camera framing as the GPU path.
export function softwareStage(canvas,w,h,transparent,figures){
  canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:true});const pixels=ctx.createImageData(w,h),rgba=pixels.data,zbuf=new Float32Array(w*h);
  const bodies=Array.from({length:figures},body),normal=new T.Matrix3(),pos=vec(),norm=vec(),shadeCache=new Map();
  const work=new Map(),light=vec(-.48,.66,.64).normalize();
  function drawMesh(mesh){
    const geo=mesh.geometry,positions=geo.attributes.position,normals=geo.attributes.normal,tri=geo.index.array,n=positions.count;
    let tmp=work.get(geo);if(!tmp){tmp=new Float32Array(n*4);work.set(geo,tmp);}
    normal.getNormalMatrix(mesh.matrixWorld);let rgb=shadeCache.get(mesh.material);if(!rgb){const c=mesh.material.color.clone().convertLinearToSRGB();rgb=[c.r*255,c.g*255,c.b*255];shadeCache.set(mesh.material,rgb);}
    for(let i=0;i<n;i++){pos.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);norm.fromBufferAttribute(normals,i).applyNormalMatrix(normal);
      const d=norm.dot(light),shine=.12*Math.pow(Math.max(0,norm.z*.88+norm.y*.39-norm.x*.23),18);
      const a=i*4;tmp[a]=w*.5+pos.x*h;tmp[a+1]=h*.5-pos.y*h;tmp[a+2]=pos.z;tmp[a+3]=.57+.36*Math.max(0,d)+.10*norm.y+.06*Math.max(0,-norm.x-norm.z)+shine;}
    for(let i=0;i<tri.length;i+=3){
      const a=tri[i]*4,b=tri[i+1]*4,c=tri[i+2]*4,x=tmp[a],y=tmp[a+1],ux=tmp[b]-x,uy=tmp[b+1]-y,vx=tmp[c]-x,vy=tmp[c+1]-y;
      const det=ux*vy-uy*vx;if(det>=-.0001)continue;
      const minx=Math.max(0,Math.floor(x+Math.min(0,ux,vx))),maxx=Math.min(w-1,Math.ceil(x+Math.max(0,ux,vx)));
      const miny=Math.max(0,Math.floor(y+Math.min(0,uy,vy))),maxy=Math.min(h-1,Math.ceil(y+Math.max(0,uy,vy)));
      const z=tmp[a+2],dz1=tmp[b+2]-z,dz2=tmp[c+2]-z,s=tmp[a+3],ds1=tmp[b+3]-s,ds2=tmp[c+3]-s;
      for(let py=miny;py<=maxy;py++){let i1=((minx+.5-x)*vy-(py+.5-y)*vx)/det,i2=(ux*(py+.5-y)-uy*(minx+.5-x))/det;
        for(let px=minx;px<=maxx;px++,i1+=vy/det,i2-=uy/det){
          if(i1<0||i2<0||i1+i2>1)continue;const k=py*w+px,dep=z+i1*dz1+i2*dz2;if(dep<=zbuf[k])continue;zbuf[k]=dep;
          const shade=s+i1*ds1+i2*ds2,l=k*4;rgba[l]=rgb[0]*shade;rgba[l+1]=rgb[1]*shade;rgba[l+2]=rgb[2]*shade;rgba[l+3]=255;
        }
      }
    }
  }
  return{draw(poses,bg='sage'){const hex=parseInt((backgrounds[bg]||backgrounds.sage).slice(1),16);new Uint32Array(rgba.buffer).fill(transparent?0:((255<<24)|((hex&255)<<16)|(hex&65280)|(hex>>>16))>>>0);zbuf.fill(-Infinity);
    bodies.forEach((b,i)=>{b.place(poses[i],w/h);if(!b.group.visible)return;b.group.updateMatrixWorld(true);for(const mesh of b.group.children)drawMesh(mesh);});ctx.putImageData(pixels,0,0);
  },dispose(){}};
}
