import * as THREE from 'three';

export function makeTerrain(radius,color){
 const n=64,verts=[],colors=[],indices=[],palette=[new THREE.Color(color),new THREE.Color(0xe0cba0),new THREE.Color(0xb2a88c),new THREE.Color(0x728d81)];
 const rings=[[1,.12],[1.025,-.18],[.94,-1.05],[.64,-2.45]];
 for(let j=0;j<rings.length;j++)for(let i=0;i<n;i++){const a=i/n*Math.PI*2,edge=1+.035*Math.sin(a*5)+.025*Math.cos(a*9),r=radius*rings[j][0]*edge;verts.push(Math.cos(a)*r,rings[j][1]+(j>1?.1*Math.sin(a*6):0),Math.sin(a)*r);const c=palette[j].clone().multiplyScalar(.94+.06*Math.sin(i*2.1));colors.push(c.r,c.g,c.b)}
 verts.push(0,.12,0);colors.push(palette[0].r,palette[0].g,palette[0].b);const center=verts.length/3-1;
 for(let i=0;i<n;i++){const k=(i+1)%n;indices.push(center,k,i);for(let j=0;j<rings.length-1;j++){const a=j*n+i,b=j*n+k,c=(j+1)*n+i,d=(j+1)*n+k;indices.push(a,b,c,b,d,c)}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,flatShading:true}));mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
export function makeOcean(){
 const uniforms={uTime:{value:0},uDeep:{value:new THREE.Color(0x277e91)},uShallow:{value:new THREE.Color(0x7ecbc4)}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec3 vPos;uniform float uTime;void main(){vec3 p=position;p.z+=sin(p.x*.34+uTime*.65)*.10+cos(p.y*.28-uTime*.4)*.09;vPos=vec3(p.x,p.y,p.z);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec3 vPos;uniform float uTime;uniform vec3 uDeep;uniform vec3 uShallow;void main(){vec2 p=vPos.xy;float wave=sin(p.x*.4+uTime*.5)*cos(p.y*.31-uTime*.3);float shore=exp(-pow((length(p)-11.)/4.,2.));vec3 color=mix(uDeep,uShallow,.20+shore*.62+wave*.06);float caustic=pow(max(0.,sin(p.x*1.8+sin(p.y*1.2+uTime*.5))+cos(p.y*1.6+uTime*.5)-1.5),2.);color+=vec3(.25,.34,.28)*caustic;float foam=smoothstep(.90,1.,sin(length(p)*3.-uTime*1.2))*shore*.14;color+=foam;float sparkle=pow(max(0.,sin(p.x*7.3+uTime)*cos(p.y*5.8-uTime)),28.);color+=vec3(.7,.7,.43)*sparkle*.24;gl_FragColor=vec4(color,1.);
#include <tonemapping_fragment>\n#include <colorspace_fragment>}`});
 const water=new THREE.Mesh(new THREE.PlaneGeometry(360,360,120,120),material);water.rotation.x=-Math.PI/2;water.position.y=-2.2;return water;
}
export function makeSky(){
 const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color(0x79bcca)},bottom:{value:new THREE.Color(0xf7e7c5)}},vertexShader:'varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vWorld;uniform vec3 top;uniform vec3 bottom;void main(){float h=normalize(vWorld).y;gl_FragColor=vec4(mix(bottom,top,smoothstep(-.1,.65,h)),1.);
#include <tonemapping_fragment>\n#include <colorspace_fragment>}`});
 return new THREE.Mesh(new THREE.SphereGeometry(180,24,16),material);
}
export function addVegetation(parent,radius,seed=0){
 const count=220,g=new THREE.ConeGeometry(.065,.35,3),mat=new THREE.MeshStandardMaterial({color:0x608e53,roughness:1}),grass=new THREE.InstancedMesh(g,mat,count),dummy=new THREE.Object3D();let used=0;
 for(let i=0;i<700&&used<count;i++){const a=i*2.39996+seed,r=radius*(.57+.37*((i*73%101)/100)),x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<1.1||Math.abs(z)<1||Math.abs(Math.abs(x)-6)<1.8)continue;dummy.position.set(x,.27,z);dummy.rotation.set(.18*Math.sin(i),a,.2*Math.cos(i));dummy.scale.setScalar(.7+(i%5)*.12);dummy.updateMatrix();grass.setMatrixAt(used++,dummy.matrix)}grass.count=used;grass.receiveShadow=true;parent.add(grass);
}
export function makeClouds(){const group=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:0xfff3dc,roughness:1});for(let i=0;i<9;i++){const cloud=new THREE.Group();group.add(cloud);const a=i*2.4,r=25+(i%3)*8;cloud.position.set(Math.sin(a)*r,9+(i%4)*1.4,Math.cos(a)*r-16);for(let j=0;j<5;j++){const m=new THREE.Mesh(new THREE.SphereGeometry(1.5,12,8),material);m.position.set((j-2)*1.45,Math.sin(j*2)*.3,Math.cos(j)*.4);m.scale.set(1,.46+(j%2)*.17,.7);cloud.add(m)}cloud.scale.setScalar(.7+i%3*.2);cloud.userData.baseX=cloud.position.x}return group}
