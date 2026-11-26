import * as T from 'three';
// Project a low-resolution reflection of the actual gate and sky onto the mapped
// water polygons. Only the monument and lights participate in this second pass.
export function canalReflection(scene,renderer){
 const camera=new T.PerspectiveCamera(),target=new T.WebGLRenderTarget(576,320,{type:T.HalfFloatType,depthBuffer:true});
 const plane=new T.Plane(new T.Vector3(0,1,0),-.45),look=new T.Vector3(),up=new T.Vector3();
 const matrix=new T.Matrix4(),ref={texture:target.texture,matrix},waterY=.018;
 camera.layers.set(1);
 let last=-Infinity,key='';
 return function paint(main,city,active,env,now){
  if(!city?.reflection)return;
  if(!active){city.reflection(null);key='';return;}
  const pose=main.matrixWorld.elements.map(v=>v.toFixed(4)).join(',')+main.aspect+env;
  if(pose===key||now-last<90)return;last=now;key=pose;
  main.getWorldDirection(look);up.setFromMatrixColumn(main.matrixWorld,1);look.y*=-1;up.y*=-1;
  camera.position.copy(main.position);camera.position.y=2*waterY-main.position.y;camera.up.copy(up);
  camera.lookAt(look.add(camera.position));camera.projectionMatrix.copy(main.projectionMatrix);camera.projectionMatrixInverse.copy(main.projectionMatrixInverse);camera.updateMatrixWorld();
  matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  const old=renderer.getRenderTarget(),clip=renderer.clippingPlanes,auto=renderer.shadowMap.autoUpdate;
  renderer.clippingPlanes=[plane];renderer.shadowMap.autoUpdate=false;
  try{renderer.setRenderTarget(target);renderer.render(scene,camera);}
  finally{renderer.setRenderTarget(old);renderer.clippingPlanes=clip;renderer.shadowMap.autoUpdate=auto;}
  city.reflection(ref);
 };
}
