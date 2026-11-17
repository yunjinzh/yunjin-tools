import * as T from 'three';

/** Small depth-buffer renderer for computers without WebGL.
 * Uses the same Three.js scene/cameras and attachment-derived LOD. Unlike SVG's
 * painter sorting, per-pixel depth keeps overlapping car panels correctly hidden.
 * Textures, PBR reflections and shadows are available in the WebGL renderer only.
 */
export class CompatibilityRenderer{
 domElement=document.createElement('canvas');
 shadowMap={enabled:false,type:T.PCFSoftShadowMap};
 private context=this.domElement.getContext('2d',{alpha:false})!;
 private width=1;private height=1;
 private pixels=this.context.createImageData(1,1);
 private depth=new Float32Array(1);
 setQuality(_quality:string){}
 setPixelRatio(_ratio:number){}
 setSize(width:number,height:number){
  const scale=Math.min(1,850/Math.max(width,height));
  this.width=Math.max(1,Math.round(width*scale));this.height=Math.max(1,Math.round(height*scale));
  this.domElement.width=this.width;this.domElement.height=this.height;
  this.pixels=this.context.createImageData(this.width,this.height);this.depth=new Float32Array(this.width*this.height);
 }
 dispose(){}
 render(scene:T.Scene,camera:T.Camera){
  scene.updateMatrixWorld();camera.updateMatrixWorld();
  const bg=scene.background instanceof T.Color?scene.background:new T.Color('#bfc9ca');
  const srgb=bg.clone().convertLinearToSRGB(),data=this.pixels.data,w=this.width,h=this.height;
  for(let i=0;i<data.length;i+=4){data[i]=srgb.r*255;data[i+1]=srgb.g*255;data[i+2]=srgb.b*255;data[i+3]=255;}
  this.depth.fill(Infinity);
  const projection=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  const opaque:T.Mesh[]=[],transparent:T.Mesh[]=[],lines:T.LineSegments[]=[];
  scene.traverseVisible(o=>{
   if(o instanceof T.Mesh){const m=Array.isArray(o.material)?o.material[0]:o.material;if(m.visible)(m.transparent?transparent:opaque).push(o);}
   else if(o instanceof T.LineSegments)lines.push(o);
  });
  transparent.sort((a,b)=>b.getWorldPosition(new T.Vector3()).distanceToSquared(camera.position)-a.getWorldPosition(new T.Vector3()).distanceToSquared(camera.position));
  for(const mesh of [...opaque,...transparent]){
   const material=(Array.isArray(mesh.material)?mesh.material[0]:mesh.material) as T.MeshStandardMaterial;
   if(material.opacity<=0)continue;
   const geometry=mesh.geometry,position=geometry.getAttribute('position'),normal=geometry.getAttribute('normal');
   if(!position)continue;
   const mvp=new T.Matrix4().multiplyMatrices(projection,mesh.matrixWorld),nm=new T.Matrix3().getNormalMatrix(mesh.matrixWorld);
   const projected=new Float32Array(position.count*3),light=new Float32Array(position.count),v=new T.Vector3(),n=new T.Vector3();
   const sun=new T.Vector3(-.4,.8,.5).normalize();
   for(let i=0;i<position.count;i++){
    v.fromBufferAttribute(position,i).applyMatrix4(mvp);projected[i*3]=(v.x*.5+.5)*w;projected[i*3+1]=(-v.y*.5+.5)*h;projected[i*3+2]=v.z;
    if(normal){n.fromBufferAttribute(normal,i).applyNormalMatrix(nm);light[i]=.38+.62*Math.max(0,n.dot(sun))+.12*Math.max(0,n.y);}else light[i]=.8;
   }
   const indices=geometry.index,count=indices?.count??position.count,color=material.color??new T.Color('#a0adae');
   for(let i=0;i<count;i+=3){
    const a=indices?indices.getX(i):i,b=indices?indices.getX(i+1):i+1,c=indices?indices.getX(i+2):i+2;
    const x0=projected[a*3],y0=projected[a*3+1],z0=projected[a*3+2],x1=projected[b*3],y1=projected[b*3+1],z1=projected[b*3+2],x2=projected[c*3],y2=projected[c*3+1],z2=projected[c*3+2];
    if(z0< -1||z1< -1||z2< -1||z0>1||z1>1||z2>1)continue;
    const area=(x1-x0)*(y2-y0)-(y1-y0)*(x2-x0);
    if(Math.abs(area)<.015)continue;
    const minX=Math.max(0,Math.floor(Math.min(x0,x1,x2))),maxX=Math.min(w-1,Math.ceil(Math.max(x0,x1,x2))),minY=Math.max(0,Math.floor(Math.min(y0,y1,y2))),maxY=Math.min(h-1,Math.ceil(Math.max(y0,y1,y2)));
    const alpha=material.opacity,shade=material.name.startsWith('glass')?.75:(light[a]+light[b]+light[c])/3;
    const r=Math.min(255,Math.pow(Math.max(0,color.r*shade),1/2.2)*255),g=Math.min(255,Math.pow(Math.max(0,color.g*shade),1/2.2)*255),bl=Math.min(255,Math.pow(Math.max(0,color.b*shade),1/2.2)*255);
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
     const u=((x1-x-.5)*(y2-y-.5)-(y1-y-.5)*(x2-x-.5))/area;
     if(u<0||u>1)continue;
     const v2=((x2-x-.5)*(y0-y-.5)-(y2-y-.5)*(x0-x-.5))/area,t=1-u-v2;
     if(v2<0||t<0)continue;
     const z=u*z0+v2*z1+t*z2,offset=y*w+x;if(z>=this.depth[offset])continue;
     if(material.depthWrite)this.depth[offset]=z;
     const p=offset*4;
     data[p]=r*alpha+data[p]*(1-alpha);data[p+1]=g*alpha+data[p+1]*(1-alpha);data[p+2]=bl*alpha+data[p+2]*(1-alpha);
    }
   }
  }
  for(const line of lines){
   const m=(Array.isArray(line.material)?line.material[0]:line.material) as T.LineBasicMaterial;
   if(!m.visible)continue;
   const p=line.geometry.getAttribute('position'),index=line.geometry.index,mvp=new T.Matrix4().multiplyMatrices(projection,line.matrixWorld),c=m.color.clone().convertLinearToSRGB();
   const count=index?.count??p.count;
   for(let i=0;i<count;i+=2){
    const a=new T.Vector3().fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(mvp),b=new T.Vector3().fromBufferAttribute(p,index?index.getX(i+1):i+1).applyMatrix4(mvp);
    if(Math.abs(a.z)>1||Math.abs(b.z)>1)continue;
    const ax=(a.x*.5+.5)*w,ay=(-a.y*.5+.5)*h,bx=(b.x*.5+.5)*w,by=(-b.y*.5+.5)*h,steps=Math.max(1,Math.ceil(Math.max(Math.abs(ax-bx),Math.abs(ay-by))));
    for(let j=0;j<=steps;j++){const t=j/steps,x=Math.round(ax+(bx-ax)*t),y=Math.round(ay+(by-ay)*t);if(x<0||x>=w||y<0||y>=h)continue;const k=y*w+x;if(a.z+(b.z-a.z)*t>this.depth[k]+.0001)continue;data[k*4]=c.r*255;data[k*4+1]=c.g*255;data[k*4+2]=c.b*255;}
   }
  }
  this.context.putImageData(this.pixels,0,0);
 }
}
