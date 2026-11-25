import * as T from './assets/three.mjs';
import {mannequin} from './mannequin.mjs';
import {backdrop,backgrounds} from './studio.mjs';
export {backgrounds};

export function makeStage(canvas,w,h,{transparent=false,figures=1}={}){
  let renderer;
  try{renderer=new T.WebGLRenderer({canvas,alpha:transparent,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}
  catch{return softwareStage(canvas,w,h,transparent,figures);}
  renderer.setPixelRatio(1);renderer.setSize(w,h,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0,0);
  const camera=new T.OrthographicCamera(-w/h/2,w/h/2,.5,-.5,.01,40);camera.position.z=8;
  const scene=new T.Scene(),bodies=Array.from({length:figures},mannequin);
  for(const b of bodies)scene.add(b.mesh);
  const ratio=Math.min(1,640/Math.max(w,h)),bw=Math.max(1,Math.round(w*ratio)),bh=Math.max(1,Math.round(h*ratio));
  const plate=backdrop(bw,bh,transparent);let texture;
  if(!transparent){texture=new T.DataTexture(plate.data,bw,bh);texture.colorSpace=T.SRGBColorSpace;texture.flipY=true;
    texture.minFilter=texture.magFilter=T.LinearFilter;scene.background=texture;}
  return {draw(poses,bg='studio'){const placed=bodies.map((b,i)=>b.place(poses[i],w/h));
    if(texture){plate.paint(placed,bg);texture.needsUpdate=true;}renderer.render(scene,camera);},
    dispose(){bodies.forEach(b=>b.dispose());texture?.dispose();renderer.dispose();renderer.forceContextLoss();}};
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


// CPU projection uses the same skinned vertices, normals, light and studio as the GPU.
export function softwareStage(canvas,w,h,transparent=false,figures=1){
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{alpha:true}),pixels=ctx.createImageData(w,h),rgba=pixels.data,zbuf=new Float32Array(w*h);
  const bodies=Array.from({length:figures},mannequin),plate=backdrop(w,h,transparent);
  const projected=new Float32Array(bodies[0].shades.length*4);
  function drawMesh(body){
    const geo=body.mesh.geometry,positions=geo.attributes.position.array,tri=geo.index.array,tmp=projected;
    const rgb=body.pigment.map(x=>x*255);
    for(let i=0;i<body.shades.length;i++){
      const a=i*4,j=i*3;tmp[a]=w*.5+positions[j]*h;tmp[a+1]=h*.5-positions[j+1]*h;tmp[a+2]=positions[j+2];tmp[a+3]=body.shades[i];
    }
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

  return {draw(poses,bg='studio'){
    const placed=bodies.map((b,i)=>b.place(poses[i],w/h));plate.paint(placed,bg);
    rgba.set(plate.data);zbuf.fill(-Infinity);for(const b of bodies)if(b.mesh.visible)drawMesh(b);
    ctx.putImageData(pixels,0,0);
  },dispose(){bodies.forEach(b=>b.dispose());}};
}
