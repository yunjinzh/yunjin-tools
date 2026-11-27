import * as T from 'three';

// PMREM samples the environment in all directions. Reproject the photographic
// upper hemisphere and supply a rough ground colour below the geographic horizon.
export function reflectionLighting(renderer,scene,initialTarget){
 const painter=new T.PMREMGenerator(renderer),canvas=document.createElement('canvas');
 canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d',{alpha:false}),map=new T.CanvasTexture(canvas);
 map.mapping=T.EquirectangularReflectionMapping;map.colorSpace=T.SRGBColorSpace;
 let target=initialTarget,timer=0,last='',next='';
 return function change(sky,sun,weather){
  const az=Math.atan2(sun.x,-sun.z);
  scene.environmentRotation.y=az;
  next=weather+'/'+Math.round(sun.y*19);
  if(next===last)return;
  clearTimeout(timer);timer=setTimeout(()=>{
   const day=T.MathUtils.smoothstep(sun.y,-.12,.15),ground=day>.5?(weather==='snow'?'#969b9d':'#595c52'):'#151b28';
   // Three's equirectangular zero angle faces east, the recorded atlas faces north.
   ctx.drawImage(sky.canvas,0,0,sky.canvas.width,sky.canvas.height,-128,0,512,128);
   ctx.drawImage(sky.canvas,0,0,sky.canvas.width,sky.canvas.height,384,0,512,128);
   ctx.save();ctx.translate(0,256);ctx.scale(1,-1);ctx.drawImage(canvas,0,0,512,128,0,0,512,128);ctx.restore();
   const a=ctx.createLinearGradient(0,127,0,206);a.addColorStop(0,'transparent');a.addColorStop(1,ground);ctx.fillStyle=a;ctx.fillRect(0,127,512,129);
   map.needsUpdate=true;
   const baked=painter.fromEquirectangular(map);
   scene.environment=baked.texture;target?.dispose();target=baked;last=next;
  },140);
 };
}
