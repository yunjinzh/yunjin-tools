import * as T from 'three';

// A CPU compatibility renderer for browsers without WebGL. It shares the exact
// scene geometry, camera and raycasting used by the primary Three.js renderer.
type Point = {x:number;y:number;z:number};
type Face = {depth:number;points:Point[];color:string;alpha:number;wire?:boolean;image?:CanvasImageSource;uv?:{x:number;y:number}[]};
export class CanvasCompatibilityRenderer {
 domElement=document.createElement('canvas');shadowMap={enabled:false,type:0};outputColorSpace='';toneMapping=0;toneMappingExposure=1.2;
 private ctx:CanvasRenderingContext2D;private width=1;private height=1;private ratio=1;private last=0;private invalidated=true;private signature="";
 constructor(){const ctx=this.domElement.getContext('2d');if(!ctx)throw Error('Canvas unavailable');this.ctx=ctx;}
 setPixelRatio(n:number){this.ratio=Math.min(n,1.25);}
 setSize(w:number,h:number){this.width=w;this.height=h;this.domElement.width=Math.round(w*this.ratio);this.domElement.height=Math.round(h*this.ratio);this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';this.last=0;this.invalidated=true;}
 render(scene:T.Scene,camera:T.PerspectiveCamera){
  const now=performance.now();if(now-this.last<85)return;this.last=now;
  scene.updateMatrixWorld(true);camera.updateMatrixWorld();
  const signature=camera.matrixWorld.elements.map(n=>n.toFixed(5)).join(",")+this.toneMappingExposure;if(signature===this.signature&&!this.invalidated)return;this.signature=signature;this.invalidated=false;
  const ctx=this.ctx,w=this.width,h=this.height;ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.globalAlpha=1;
  ctx.fillStyle=scene.background instanceof T.Color?scene.background.getStyle():'#e6e8df';ctx.fillRect(0,0,w,h);
  const vp=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),faces:Face[]=[];
  const proj=(v:T.Vector3):Point=>{const p=v.clone().applyMatrix4(vp);return{x:(p.x+1)*w/2,y:(1-p.y)*h/2,z:p.z};};
  const sunlight=new T.Vector3(-.4,.8,.4).normalize();
  const mesh=(o:T.Mesh,world:T.Matrix4)=>{
   const g=o.geometry,p=g.attributes.position;if(!p)return;const m=(Array.isArray(o.material)?o.material[0]:o.material) as T.MeshStandardMaterial;if(!m.visible)return;
   const count=g.index?.count??p.count,uv=g.attributes.uv,col=g.attributes.color;
   const panel=o.parent?.userData.exhibitionPanel?o.parent:null;const panelDepth=panel?proj(new T.Vector3(0,2.7,0).applyMatrix4(panel.matrixWorld)).z:0;const objectDepth=proj(new T.Vector3().setFromMatrixPosition(world)).z;
   const vertices:T.Vector3[]=[],screen:Point[]=[];for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(world);vertices.push(v);screen.push(proj(v));}
   for(let k=0;k<count;k+=3){const ids=[0,1,2].map(i=>g.index?g.index.getX(k+i):k+i);const ps=ids.map(i=>screen[i]);if(ps.some(q=>q.z < -1 || q.z>1))continue;if(ps.every(q=>q.x<0)||ps.every(q=>q.x>w)||ps.every(q=>q.y<0)||ps.every(q=>q.y>h))continue;
    const [a,b,c]=ids.map(i=>vertices[i]),normal=new T.Vector3().subVectors(b,a).cross(new T.Vector3().subVectors(c,a)).normalize();
    if(m.side!==T.DoubleSide&&normal.dot(new T.Vector3().subVectors(camera.position,a))<0)continue;
    const color=m.color?.clone()??new T.Color('white');if(m.vertexColors&&col){const vc=new T.Color(0,0,0);for(const id of ids){vc.r+=col.getX(id)/3;vc.g+=col.getY(id)/3;vc.b+=col.getZ(id)/3;}color.multiply(vc);}
    if(!(m instanceof T.MeshBasicMaterial)){const light=.66+.5*Math.max(0,normal.dot(sunlight));color.multiplyScalar(light*(this.toneMappingExposure<1?.72:1));}
    const face:Face={depth:(ps[0].z+ps[1].z+ps[2].z)/3,points:ps,color:color.getStyle(),alpha:m.opacity,wire:m.wireframe};
    if(m.map?.image&&uv){face.image=m.map.image as CanvasImageSource;const im=m.map.image as {width:number;height:number};face.uv=ids.map(i=>({x:uv.getX(i)*im.width,y:(1-uv.getY(i))*im.height}));}
    if(o.renderOrder<0)face.depth=-o.renderOrder+face.depth;
    else if(panel)face.depth=panelDepth+objectDepth*.00001+face.depth*.00000001-(m.map?.000012:0);
    faces.push(face);
   }
  };
  scene.traverseVisible(o=>{
   if(o instanceof T.InstancedMesh){const temp=new T.Matrix4();for(let i=0;i<o.count;i++){o.getMatrixAt(i,temp);mesh(o,new T.Matrix4().multiplyMatrices(o.matrixWorld,temp));}}
   else if(o instanceof T.Mesh)mesh(o,o.matrixWorld);
   else if(o instanceof T.Line){const p=o.geometry.attributes.position,m=o.material as T.LineBasicMaterial,step=o instanceof T.LineSegments?2:1;for(let i=0;i<p.count-1;i+=step){const ps=[i,i+1].map(j=>proj(new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(o.matrixWorld)));if(ps.some(v=>v.z < -1||v.z>1))continue;faces.push({depth:(ps[0].z+ps[1].z)/2-.000012,points:ps,color:m.color.getStyle(),alpha:m.opacity});}}
   else if(o instanceof T.Points){const p=o.geometry.attributes.position,col=o.geometry.attributes.color,m=o.material as T.PointsMaterial;for(let i=0;i<p.count;i+=2){const q=proj(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));if(q.z< -1||q.z>1)continue;const color=col?new T.Color(col.getX(i),col.getY(i),col.getZ(i)):m.color;faces.push({depth:q.z,points:[q],color:color.getStyle(),alpha:1});}}
  });
  faces.sort((a,b)=>b.depth-a.depth);
  for(const f of faces){ctx.globalAlpha=f.alpha;const p=f.points;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let j=1;j<p.length;j++)ctx.lineTo(p[j].x,p[j].y);
   if(p.length===1){ctx.fillStyle=f.color;ctx.fillRect(p[0].x,p[0].y,1.7,1.7);continue;}
   if(p.length===2||f.wire){ctx.strokeStyle=f.color;ctx.lineWidth=f.wire?.55:1;ctx.stroke();continue;}
   ctx.closePath();if(f.image&&f.uv){const [a,b,c]=f.uv,[d,e,g]=p;const det=a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y);if(Math.abs(det)<.001)continue;
    const A=(d.x*(b.y-c.y)+e.x*(c.y-a.y)+g.x*(a.y-b.y))/det,B=(d.y*(b.y-c.y)+e.y*(c.y-a.y)+g.y*(a.y-b.y))/det;
    const C=(d.x*(c.x-b.x)+e.x*(a.x-c.x)+g.x*(b.x-a.x))/det,D=(d.y*(c.x-b.x)+e.y*(a.x-c.x)+g.y*(b.x-a.x))/det;
    const E=(d.x*(b.x*c.y-c.x*b.y)+e.x*(c.x*a.y-a.x*c.y)+g.x*(a.x*b.y-b.x*a.y))/det,F=(d.y*(b.x*c.y-c.x*b.y)+e.y*(c.x*a.y-a.x*c.y)+g.y*(a.x*b.y-b.x*a.y))/det;
    ctx.save();ctx.clip();ctx.transform(A,B,C,D,E,F);ctx.drawImage(f.image,0,0);ctx.restore();
   }else{ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle=f.color;ctx.lineWidth=.45;ctx.stroke();}
  }
  ctx.globalAlpha=1;
 }
 invalidate(){this.invalidated=true;}
 forceNextFrame(){this.last=0;this.invalidated=true;}
 dispose(){this.domElement.width=1;this.domElement.height=1;}
}
