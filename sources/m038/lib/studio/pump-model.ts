import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {PartKnowledge} from './teaching';

// Original teaching geometry, in arbitrary model units. Not a manufacturer's CAD model.
export function createTeachingPump(){
 const root=new THREE.Group();root.name='模块化离心泵教具';
 const source='四维秀秀原创教学示意，2026-09；尺寸与装配顺序仅用于本教具练习。';
 function part(id:string,name:string,color:string,group:string,purpose:string,principle:string,geometries:THREE.BufferGeometry[]){
  const buffers=geometries.map(g=>g.index?g.toNonIndexed():g);const geo=mergeGeometries(buffers);new Set([...geometries,...buffers]).forEach(g=>g.dispose());
  if(!geo)throw Error('教具模型生成失败');geo.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({color,roughness:.38,metalness:.45,side:THREE.DoubleSide});
  const m=new THREE.Mesh(geo,mat);m.name=name;m.userData.partId=id;m.userData.knowledge={id,name,group,purpose,principle,source} satisfies PartKnowledge;root.add(m);return m;
 }
 const box=(w:number,h:number,d:number,x:number,y:number,z:number)=>new THREE.BoxGeometry(w,h,d).translate(x,y,z);
 const cyl=(r:number,h:number,x:number,y:number,z:number)=>new THREE.CylinderGeometry(r,r,h,40).rotateX(Math.PI/2).translate(x,y,z);
 const ring=(r:number,t:number,x:number,y:number,z:number)=>new THREE.TorusGeometry(r,t,12,56).translate(x,y,z);
 part('pump-base','安装底座','#35425c','支撑与紧固','支撑并定位教学模型。','观察底座与泵体的固定关系。',[box(3.8,.22,2.4,0,.11,0),box(.35,.46,1.8,-1,.42,0),box(.35,.46,1.8,1,.42,0)]);
 const shell=new THREE.CylinderGeometry(1.18,1.18,.75,64,1,true).rotateX(Math.PI/2).translate(0,1.52,0);
 part('pump-body','泵体','#247a98','泵内结构','容纳叶轮并形成液体经过的壳体空间。','本模型用简化环形外壳表现固定泵体，未模拟真实蜗壳流道。',[shell,ring(1.18,.10,0,1.52,.38),ring(1.18,.10,0,1.52,-.38),box(.72,.36,.72,0,2.62,0),new THREE.CylinderGeometry(.32,.32,.6,36).translate(0,2.95,0)]);
 const blades:THREE.BufferGeometry[]=[cyl(.80,.10,0,1.52,-.13),cyl(.23,.30,0,1.52,0)];
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7;blades.push(new THREE.BoxGeometry(.57,.105,.27).translate(.47,0,0).rotateZ(a).translate(0,1.52,.035));}
 part('pump-impeller','叶轮','#e8ad46','泵内结构','旋转时与液体交换能量。','叶轮与轴相连。本教具仅展示结构，不计算流量、扬程或效率。',blades);
 part('pump-cover','前端盖','#74b7c6','泵内结构','闭合泵体前端并提供入口示意。','拆开端盖后便于观察叶轮与泵体的空间关系。',[ring(.64,.39,0,1.52,.55),new THREE.CylinderGeometry(.35,.35,.62,40,1,true).rotateX(Math.PI/2).translate(0,1.52,1.0),ring(.39,.075,0,1.52,1.32)]);
 part('pump-shaft','传动轴','#a6b3c5','传动与密封','连接旋转部件并传递转动。','在教具中观察轴与叶轮的同轴关系。',[cyl(.12,2.3,0,1.52,-.72)]);
 part('pump-seal','密封环示意','#e97c68','传动与密封','示意轴穿过固定结构处的密封位置。','用环形部件标出密封区域，未还原机械密封的完整结构。',[ring(.20,.07,0,1.52,-.52)]);
 part('pump-bearing','轴承座示意','#8b9bad','传动与密封','支撑传动轴。','观察固定支撑和旋转轴之间的位置关系。',[ring(.33,.15,0,1.52,-1.25),box(.75,.72,.32,0,.86,-1.25)]);
 const screws:THREE.BufferGeometry[]=[];for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;screws.push(cyl(.10,.42,Math.cos(a)*.95,1.52+Math.sin(a)*.95,.61),new THREE.CylinderGeometry(.15,.15,.12,6).rotateX(Math.PI/2).translate(Math.cos(a)*.95,1.52+Math.sin(a)*.95,.86));}
 part('pump-fasteners','端盖紧固件组','#67758b','支撑与紧固','将端盖与泵体固定。','本教具将四个紧固件合并为一个教学部件。',screws);
 return root;
}
