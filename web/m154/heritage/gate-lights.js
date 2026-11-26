import * as T from 'three';
// Warm strings follow the modeled eaves, hips and ridge seen in Morio's night
// photograph. Spacing and intensity are illustrative architectural lighting.
export const nightLighting={value:0};
export function lightsAlong(batch,curve,length,spacing=.62){
 const data=batch.roofLighting??=[];
 const n=Math.max(2,Math.round(length/spacing));
 for(let i=0;i<n;i++){const [x,y,z]=curve(i/n);data.push(x,y+.10,z);}
}
export function finishGateLights(batch){
 if(!batch.roofLighting?.length)return;
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(batch.roofLighting,3));
 const material=new T.ShaderMaterial({uniforms:{night:nightLighting},depthTest:true,depthWrite:false,transparent:true,blending:T.AdditiveBlending,
 vertexShader:`#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vec4 eye=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*eye;
 
#include <logdepthbuf_vertex>
 gl_Position.z-=.00001*gl_Position.w;gl_PointSize=clamp(320./max(1.,-eye.z),2.,14.);}`,
 fragmentShader:`#include <logdepthbuf_pars_fragment>
uniform float night;void main(){
#include <logdepthbuf_fragment>
if(night<.01)discard;float d=length(gl_PointCoord*2.-1.);if(d>1.)discard;
 float halo=exp(-4.*d*d);gl_FragColor=vec4(mix(vec3(1.,.59,.26),vec3(1.,.97,.82),exp(-10.*d*d)),halo*night);}`});
 const mesh=new T.Points(geometry,material);mesh.name='天安门夜间檐线灯';mesh.userData.roofLights=true;mesh.renderOrder=5;batch.decals.push(mesh);
}
