import * as THREE from './vendor/three.module.js';
import {batchStatic} from './batch.js';

// Structural reference: NASA Glenn, "Wright Brothers Aircraft".
// Local axes: x wingspan, y up, -z forward. One unit is one metre.
// Cambered cloth wings, front biplane elevator, twin aft rudders,
// counter-rotating pusher propellers, prone pilot and skid undercarriage.
export function createFlyer() {
  const plane = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({color:0x927043,roughness:0.82});
  const darkWood = new THREE.MeshStandardMaterial({color:0x594931,roughness:0.87});
  const cloth = new THREE.MeshStandardMaterial({color:0xf5e9c4,roughness:1,side:THREE.DoubleSide});
  const ribMat = new THREE.LineBasicMaterial({color:0xa7976f,transparent:true,opacity:0.65});
  const wireMat = new THREE.LineBasicMaterial({color:0x665d48,transparent:true,opacity:0.7});
  const metal = new THREE.MeshStandardMaterial({color:0x5c6561,metalness:0.62,roughness:0.44});
  const black = new THREE.MeshStandardMaterial({color:0x2d3532,roughness:0.8});
  const ribs=[], wires=[], wingMeshes=[];
  function box(parent, mat, size, pos) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...size),mat);
    m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function rod(parent,a,b,r=0.03,mat=wood) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),5),mat);
    mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
    mesh.castShadow=true;parent.add(mesh);return mesh;
  }
  function line(a,b,target=wires) {target.push(...a,...b);}
  function wing(parent,span,chord,y,z,ribCount=32,warp=false) {
    const positions=[],indices=[],nx=40,nz=10;
    for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++) {
      const x=(i/nx-.5)*span,t=j/nz;
      positions.push(x,y+Math.sin(t*Math.PI)*chord*.061-Math.pow(Math.abs(x)/(span*.5),2)*.075,z+(t-.5)*chord);
    }
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++) {const a=i*(nz+1)+j,b=a+nz+1;indices.push(a,a+1,b,b,a+1,b+1);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,cloth);m.castShadow=true;m.receiveShadow=true;parent.add(m);
    if(warp)wingMeshes.push({mesh:m,original:Float32Array.from(positions),span,chord,z});
    for(let i=0;i<=ribCount;i++)for(let j=0;j<10;j++) {
      const x=(i/ribCount-.5)*span,t=j/10,u=(j+1)/10;
      line([x,y+Math.sin(t*Math.PI)*chord*.061+.006-Math.pow(Math.abs(x)/(span*.5),2)*.075,z+(t-.5)*chord],
        [x,y+Math.sin(u*Math.PI)*chord*.061+.006-Math.pow(Math.abs(x)/(span*.5),2)*.075,z+(u-.5)*chord],ribs);
    }
    for(const zz of [-.36,.31]) rod(parent,[-span*.5,y,z+chord*zz],[span*.5,y,z+chord*zz],.035);
    return m;
  }
  wing(plane,12.2,1.98,0,0,34,true);
  wing(plane,12.2,1.98,1.56,0,34,true);
  const bays=[-6,-4.5,-3,-1.5,0,1.5,3,4.5,6];
  for(let i=0;i<bays.length;i++)for(const z of [-.72,.61]) {
    const x=bays[i];rod(plane,[x,0,z],[x,1.56,z],.028);
    if(i<bays.length-1){line([x,0,z],[bays[i+1],1.56,z]);line([x,1.56,z],[bays[i+1],0,z]);}
  }
  for(const x of [-.78,.78]) {
    rod(plane,[x,-.65,-2.68],[x,-.65,1.06],.055,darkWood);
    rod(plane,[x,-.65,-2.68],[x,-.38,-3.04],.055,darkWood);
    for(const z of [-.65,.62])rod(plane,[x,-.65,z],[x,0,z],.044);
    rod(plane,[x,0,-.7],[x,-.18,-3.23],.036);
    rod(plane,[x,1.56,-.7],[x,.47,-3.2],.027);
    rod(plane,[x,0,.67],[x*.7,.55,2.88],.032);
    rod(plane,[x,1.56,.67],[x*.7,1.72,2.88],.026);
    line([x,-.6,-2.6],[-x,0,.6]);
  }
  const elevator=new THREE.Group();elevator.position.set(0,.12,-3.18);plane.add(elevator);
  // Elevator ribs share a plane-wide line group, at their neutral position.
  const before=ribs.length;
  wing(elevator,3.25,.73,0,0,11);wing(elevator,3.25,.73,.57,0,11);
  for(let i=before;i<ribs.length;i+=3){ribs[i+1]+=.12;ribs[i+2]-=3.18;}
  for(const x of [-1.5,0,1.5])rod(elevator,[x,0,0],[x,.57,0],.024);
  const rudder=new THREE.Group();rudder.position.set(0,1.1,2.88);plane.add(rudder);
  for(const x of [-.53,.53]){
    box(rudder,cloth,[.028,1.18,.88],[x,0,0]);
    for(const y of [-.6,.6])rod(rudder,[x,y,-.46],[x,y,.46],.023);
    for(const z of [-.46,.46])rod(rudder,[x,-.6,z],[x,.6,z],.023);
  }
  rod(rudder,[-.53,.59,0],[.53,.59,0],.024);rod(rudder,[-.53,-.59,0],[.53,-.59,0],.024);
  const propellers=[];
  for(let i=0;i<2;i++){
    const x=i===0?-2.12:2.12;
    rod(plane,[x,.55,.54],[x,.75,1.63],.032,metal);
    rod(plane,[x,1.56,.58],[x,.75,1.55],.032);
    const prop=new THREE.Group();prop.position.set(x,.78,1.69);plane.add(prop);
    const shape=new THREE.Shape();
    shape.moveTo(-.06,-1.27);shape.bezierCurveTo(-.28,-.85,-.19,-.16,-.075,0);shape.bezierCurveTo(-.3,.62,-.19,1.2,.065,1.27);
    shape.bezierCurveTo(.27,.8,.18,.17,.075,0);shape.bezierCurveTo(.3,-.63,.2,-1.2,-.06,-1.27);
    const blade=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,curveSegments:9}),wood);
    blade.castShadow=true;prop.add(blade);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.105,.105,.18,10),metal);hub.rotation.x=Math.PI/2;prop.add(hub);
    propellers.push(prop);
    // One chain is crossed to reverse the left propeller.
    line([.61,.27,.63],[x,.86,1.48]);line([.68,.4,.63],[x,.7,1.48]);
    if(i===0){line([.61,.4,.63],[x,.7,1.48]);}
  }
  box(plane,metal,[.7,.3,.81],[.6,.24,.04]);
  for(let i=0;i<4;i++){const cyl=new THREE.Mesh(new THREE.CylinderGeometry(.105,.105,.38,9),metal);cyl.rotation.z=Math.PI/2;cyl.position.set(.99,.27,-.29+i*.21);plane.add(cyl);}
  box(plane,black,[.28,.58,.12],[1.4,.37,.14]);
  for(let i=0;i<7;i++)box(plane,metal,[.26,.024,.15],[1.4,.13+i*.076,.14]);
  const fuel=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.43,10),metal);fuel.rotation.z=Math.PI/2;fuel.position.set(.6,1.42,-.3);plane.add(fuel);
  box(plane,darkWood,[.56,.065,1.2],[-.64,.075,0]);
  const coat=new THREE.MeshStandardMaterial({color:0x777a66,roughness:1});
  const skin=new THREE.MeshStandardMaterial({color:0xc09b73,roughness:1});
  const pilot=new THREE.Group();pilot.position.set(-.66,.19,0);plane.add(pilot);
  box(pilot,coat,[.36,.23,.58],[0,.03,0]);
  for(const x of [-.13,.13]) {box(pilot,coat,[.145,.17,.67],[x,-.018,.54]);box(pilot,black,[.155,.13,.23],[x,-.01,.94]);rod(pilot,[x,.05,-.2],[x*.9,-.025,-.53],.055,coat);}
  const head=new THREE.Mesh(new THREE.SphereGeometry(.125,10,7),skin);head.position.set(0,.1,-.43);pilot.add(head);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.136,10,6,0,Math.PI*2,0,Math.PI*.53),coat);cap.position.set(0,.14,-.43);pilot.add(cap);
  box(pilot,coat,[.19,.027,.13],[0,.17,-.54]);
  plane.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(ribs,3)),ribMat));
  plane.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(wires,3)),wireMat));
  plane.name='1903 Wright Flyer';
  const animated=new Set([elevator,rudder,...propellers,...wingMeshes.map(w=>w.mesh)]);
  batchStatic(plane,o=>{let p=o;while(p&&p!==plane){if(animated.has(p))return false;p=p.parent;}return true;});
  return {group:plane,update(time,throttle,pitch,roll){
    propellers.forEach((p,i)=>p.rotation.z=time*(9+throttle*29)*(i===0?1:-1));
    elevator.rotation.x=pitch*.3;rudder.rotation.y=-roll*.24;
    // Small trailing-edge twist; no anachronistic ailerons.
    for(const w of wingMeshes){const p=w.mesh.geometry.attributes.position;for(let i=0;i<p.count;i++){
      const x=w.original[i*3],z=w.original[i*3+2];
      p.array[i*3+1]=w.original[i*3+1]+roll*.105*(x/(w.span*.5))**3*((z-w.z)/w.chord+.5);
    }p.needsUpdate=true;}
  }};
}
