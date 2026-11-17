import * as T from './vendor/three.module.js';
import {CSS3DRenderer,CSS3DObject} from './vendor/CSS3DRenderer.js';

// Use the same spatial model and camera when WebGL is unavailable.
export class CompatibleRenderer {
  constructor(){
    this.engine=new CSS3DRenderer();this.world=new T.Scene();this.view=new T.PerspectiveCamera();this.entries=[];this.ready=false;
    this.engine.domElement.id='compatible-scene';document.body.prepend(this.engine.domElement);
    this.capabilities={getMaxAnisotropy:()=>1};
  }
  setPixelRatio(){}
  setSize(w,h){this.engine.setSize(w,h);}
  setAnimationLoop(fn){const frame=t=>{fn(t);requestAnimationFrame(frame);};requestAnimationFrame(frame);}
  face(mesh,w,h,offset,rotation,shade=1){
    const el=document.createElement('div');el.className='spatial-surface';el.style.width=`${w*100}px`;el.style.height=`${h*100}px`;
    const o=new CSS3DObject(el);o.position.copy(offset);o.rotation.set(...rotation);o.updateMatrix();
    const matrix=new T.Matrix4().multiplyMatrices(mesh.matrixWorld,o.matrix);matrix.decompose(o.position,o.quaternion,o.scale);o.position.multiplyScalar(100);
    this.world.add(o);this.entries.push({mesh,o,el,shade,map:null,color:''});
  }
  build(scene){
    scene.updateMatrixWorld(true);
    scene.traverse(m=>{
      if(!m.isMesh||!m.material)return;const p=m.geometry.parameters,zero=new T.Vector3();
      if(m.geometry.type==='PlaneGeometry')this.face(m,p.width,p.height,zero,[0,0,0]);
      else if(m.geometry.type==='BoxGeometry'){
        const {width:w,height:h,depth:d}=p;
        this.face(m,w,h,new T.Vector3(0,0,d/2),[0,0,0],1);
        this.face(m,w,h,new T.Vector3(0,0,-d/2),[0,Math.PI,0],.91);
        this.face(m,d,h,new T.Vector3(w/2,0,0),[0,Math.PI/2,0],.94);
        this.face(m,d,h,new T.Vector3(-w/2,0,0),[0,-Math.PI/2,0],.9);
        this.face(m,w,d,new T.Vector3(0,h/2,0),[-Math.PI/2,0,0],1);
        this.face(m,w,d,new T.Vector3(0,-h/2,0),[Math.PI/2,0,0],.89);
      }
    });this.ready=true;
  }
  render(scene,camera){
    if(!this.ready)this.build(scene);
    camera.updateMatrixWorld();this.view.copy(camera);this.view.position.multiplyScalar(100);this.view.near=camera.near*100;this.view.far=camera.far*100;this.view.updateProjectionMatrix();
    this.engine.domElement.style.background=scene.background.getStyle();
    for(const e of this.entries){
      let visible=true;for(let p=e.mesh;p;p=p.parent)if(!p.visible){visible=false;break;}e.o.visible=visible;
      if(!visible)continue;const mat=e.mesh.material,color=mat.color.clone().multiplyScalar(e.shade).getStyle();
      if(color!==e.color){e.el.style.backgroundColor=color;e.color=color;}
      if(mat.map!==e.map){e.map=mat.map;const im=mat.map?.image;e.el.style.backgroundImage=im?`url("${im.tagName==='CANVAS'?im.toDataURL():im.currentSrc||im.src}")`:'';e.el.style.backgroundSize=mat.map?.wrapS===T.RepeatWrapping?'33.333% 20%':'100% 100%';}
    }
    this.engine.render(this.world,this.view);
  }
}
