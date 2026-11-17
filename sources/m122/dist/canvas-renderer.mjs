/* Compatibility rasterizer for browsers with WebGL disabled.
 * Uses the very same Three.js scene graph, transforms and animations.
 * Painter's algorithm; reduced lighting and no shadow map in this mode. */
import {Vector3,Matrix4,Color} from './vendor/three.module.js';
const v0=new Vector3(),v1=new Vector3(),v2=new Vector3(),normal=new Vector3(),edge=new Vector3(),sun=new Vector3(-.4,.85,.3).normalize();
const col=new Color();
export class CanvasRenderer{
 constructor(){this.domElement=document.createElement('canvas');this.context=this.domElement.getContext('2d');this.shadowMap={};this.ratio=1;this.time=0;this.w=800;this.h=600;this.materialCache=new Map();}
 setPixelRatio(r){this.ratio=Math.min(r,1.25);}
 setSize(w,h){this.w=w;this.h=h;this.domElement.width=w*this.ratio;this.domElement.height=h*this.ratio;this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';}
 setAnimationLoop(fn){const tick=t=>{if(t-this.time>38){this.time=t;fn(t);}requestAnimationFrame(tick);};requestAnimationFrame(tick);}
 render(scene,camera){const ctx=this.context,w=this.w,h=this.h;ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.fillStyle='#f1ede4';ctx.fillRect(0,0,w,h);scene.updateMatrixWorld();camera.updateMatrixWorld();const vp=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),commands=[];
 scene.traverse(obj=>{if(!obj.isMesh||!obj.visible)return;let p=obj;while(p){if(!p.visible)return;p=p.parent;}const geom=obj.geometry,pos=geom.attributes.position,idx=geom.index,material=Array.isArray(obj.material)?obj.material[0]:obj.material;if(!pos||!material)return;
 if(geom.type==='BoxGeometry'&&geom.parameters.width>100)return;
 let root=obj;while(root.parent&&root.parent!==scene)root=root.parent;const layer=root===scene.children.find(o=>o.type==='Group')?Math.min(20,obj.position.y*10):100;
 const model=obj.matrixWorld,mvp=new Matrix4().multiplyMatrices(vp,model),world=[],screen=[];
 for(let i=0;i<pos.count;i++){v0.fromBufferAttribute(pos,i).applyMatrix4(mvp);screen.push({x:(v0.x+1)*w/2,y:(1-v0.y)*h/2,z:v0.z});v0.fromBufferAttribute(pos,i).applyMatrix4(model);world.push(v0.clone());}
 const textured=material.map?.image,uv=geom.attributes.uv,len=idx?idx.count:pos.count;
 for(let i=0;i<len;i+=3){const a=idx?idx.getX(i):i,b=idx?idx.getX(i+1):i+1,c=idx?idx.getX(i+2):i+2,A=screen[a],B=screen[b],C=screen[c];if(A.z>1||B.z>1||C.z>1||A.z<-1||B.z<-1||C.z<-1)continue;
 if((A.x<0&&B.x<0&&C.x<0)||(A.x>w&&B.x>w&&C.x>w)||(A.y<0&&B.y<0&&C.y<0)||(A.y>h&&B.y>h&&C.y>h))continue;
 const cross=(B.x-A.x)*(C.y-A.y)-(B.y-A.y)*(C.x-A.x);if(material.side!==2&&cross>0)continue;
 const z=(A.z+B.z+C.z)/3;
 if(textured&&uv){commands.push({A,B,C,z,layer,image:textured,uv:[{x:uv.getX(a),y:1-uv.getY(a)},{x:uv.getX(b),y:1-uv.getY(b)},{x:uv.getX(c),y:1-uv.getY(c)}],alpha:material.opacity});continue;}
 normal.subVectors(world[b],world[a]);edge.subVectors(world[c],world[a]);normal.cross(edge).normalize();const bright=material.isMeshBasicMaterial?1:.72+Math.max(0,normal.dot(sun))*.30;col.copy(material.color??new Color('#fff')).convertLinearToSRGB();const r=Math.min(255,Math.round(col.r*255*bright)),g=Math.min(255,Math.round(col.g*255*bright)),bl=Math.min(255,Math.round(col.b*255*bright));commands.push({A,B,C,z,layer,color:`rgb(${r},${g},${bl})`,alpha:material.opacity});}
 });
 commands.sort((a,b)=>a.layer-b.layer||b.z-a.z);
 for(const c of commands){ctx.globalAlpha=c.alpha??1;ctx.beginPath();ctx.moveTo(c.A.x,c.A.y);ctx.lineTo(c.B.x,c.B.y);ctx.lineTo(c.C.x,c.C.y);ctx.closePath();if(c.image){ctx.save();ctx.clip();const [a,b,d]=c.uv.map(p=>({x:p.x*c.image.width,y:p.y*c.image.height})),u=b.x-a.x,v=b.y-a.y,s=d.x-a.x,t=d.y-a.y,det=u*t-v*s;if(Math.abs(det)>.0001){const bx=c.B.x-c.A.x,by=c.B.y-c.A.y,cx=c.C.x-c.A.x,cy=c.C.y-c.A.y,aa=(bx*t-cx*v)/det,bb=(by*t-cy*v)/det,cc=(cx*u-bx*s)/det,dd=(cy*u-by*s)/det;ctx.transform(aa,bb,cc,dd,c.A.x-aa*a.x-cc*a.y,c.A.y-bb*a.x-dd*a.y);ctx.drawImage(c.image,0,0);}ctx.restore();}else{ctx.fillStyle=c.color;ctx.fill();}}
 ctx.globalAlpha=1;
 }
}
