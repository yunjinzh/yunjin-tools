import * as T from 'three';
import {drawStreet} from './streets.js';
function builder(){
  const input=[],pos=[],colors=[],emissive=[],cache=new Map();
  function vertex(x,y,z){const n=input.length/3;input.push(x,y,z);return n;}
  function tri(a,b,c,color,up=false,light=0){
    if(up&&(input[b*3]-input[a*3])*(input[c*3+2]-input[a*3+2])-(input[b*3+2]-input[a*3+2])*(input[c*3]-input[a*3])>0)[b,c]=[c,b];
    const key=color[0]*65536+color[1]*256+color[2];
    if(!cache.has(key)){const tone=new T.Color(key);cache.set(key,[tone.r,tone.g,tone.b].map(v=>Math.round(255*v)));}
    for(const i of [a,b,c]){pos.push(input[i*3],input[i*3+1],input[i*3+2]);colors.push(...cache.get(key));emissive.push(light);}
  }
  function finish(){
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    geo.setAttribute('color',new T.Uint8BufferAttribute(colors,3,true));geo.setAttribute('streetLight',new T.Uint8BufferAttribute(emissive,1,true));
    geo.computeVertexNormals();geo.computeBoundingSphere();return geo;
  }
  return {v:vertex,tri,quad(a,b,c,d,col,up,lit){tri(a,b,d,col,up,lit);tri(b,c,d,col,up,lit);},finish};
}
export function addStreetMeshes(group,streets,u){
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.77,metalness:.08,side:T.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.uniforms.streetNight=u.uCityNight;shader.uniforms.streetSnow=u.uCitySnow;shader.uniforms.streetWet=u.uCityWet;
    shader.vertexShader='attribute float streetLight;varying float vStreetLight;varying float vStreetUp;\n'+shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvStreetLight=streetLight;vStreetUp=max(0.,objectNormal.y);');
    shader.fragmentShader='uniform float streetNight;uniform float streetSnow;uniform float streetWet;varying float vStreetLight;varying float vStreetUp;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.63,.68,.73),vStreetUp*streetSnow*.45)*(1.-streetWet*.12);').replace('#include <opaque_fragment>','outgoingLight+=vec3(1.,.79,.49)*vStreetLight*streetNight*1.3;\n#include <opaque_fragment>');
  };
  const templates=new Map(),instances=new Map(),matrix=new T.Object3D();
  for(const items of streets.tiles.values()){
    const batch=builder();let count=0;
    for(const item of items){
      if(['segment','zebra','pier'].includes(item.type)){drawStreet(batch,item,0);count++;continue;}
      const {p}=item,key=item.type+'/'+(item.variant||0),groupKey=Math.floor(p.x/900)+','+Math.floor(p.z/900)+'/'+key;
      if(!templates.has(key)){
        const make=lod=>{const b=builder();drawStreet(b,{...item,p:{x:0,y:0,z:0,dx:1,dz:0}},lod);return b.finish();};
        templates.set(key,{high:make(0),low:make(1)});
      }
      if(!instances.has(groupKey))instances.set(groupKey,{template:templates.get(key),points:[]});
      instances.get(groupKey).points.push(p);
    }
    if(count){const geo=batch.finish();if(geo.attributes.position.count){const mesh=new T.Mesh(geo,material);mesh.receiveShadow=true;group.add(mesh);}}
  }
  for(const {template,points} of instances.values()){
    const mesh=new T.InstancedMesh(template.high,material,points.length);
    points.forEach((p,i)=>{matrix.position.set(p.x,p.y,p.z);matrix.rotation.y=-Math.atan2(p.dz,p.dx);matrix.updateMatrix();mesh.setMatrixAt(i,matrix.matrix);});
    mesh.computeBoundingSphere();mesh.userData.streetProp=true;mesh.userData.highGeometry=template.high;mesh.userData.lowGeometry=template.low;
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
}
