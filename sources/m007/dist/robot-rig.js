import * as THREE from 'three';
const V = THREE.Vector3;
const axisY = new V(0,1,0);
const gripPoint = new V(.105,.012,0);
const ARM_JOINTS=['shoulder_pitch','shoulder_roll','shoulder_yaw','elbow','wrist_roll','wrist_pitch','wrist_yaw'];

function solveLinear(a,b){
  const n=b.length,m=a.map((row,i)=>[...row,b[i]]);
  for(let i=0;i<n;i++){
    let pivot=i;for(let r=i+1;r<n;r++)if(Math.abs(m[r][i])>Math.abs(m[pivot][i]))pivot=r;
    [m[i],m[pivot]]=[m[pivot],m[i]];
    if(Math.abs(m[i][i])<1e-12)return Array(n).fill(0);
    const scale=m[i][i];for(let c=i;c<=n;c++)m[i][c]/=scale;
    for(let r=0;r<n;r++)if(r!==i){const f=m[r][i];for(let c=i;c<=n;c++)m[r][c]-=f*m[i][c];}
  }return m.map(row=>row[n]);
}

/** Unitree's real CAD meshes, assembled with the published URDF joint transforms. */
export class RobotRig {
  constructor(surfaces) {
    this.surfaces = surfaces; this.root = new THREE.Group(); this.root.name = 'Unitree G1';
    this.frame = new THREE.Group(); this.root.add(this.frame);
    // URDF X forward / Z up -> Three.js Z forward / Y up. Pure rotation, no reflection.
    this.frame.quaternion.setFromRotationMatrix(new THREE.Matrix4().set(0,1,0,0,0,0,1,0,1,0,0,0,0,0,0,1));
    this.joints = {}; this.links = {}; this.ready = false; this.baseHeight = .79;
  }
  async load() {
    const [meta, buffer] = await Promise.all([
      fetch('./assets/robot/g1.json').then(r => { if(!r.ok) throw new Error('G1 模型结构加载失败'); return r.json(); }),
      fetch('./assets/robot/g1.bin').then(r => { if(!r.ok) throw new Error('G1 模型网格加载失败'); return r.arrayBuffer(); })
    ]);
    this.build(meta, buffer); return this;
  }
  build(meta, buffer) {
    this.meta = meta;
    const geometries = {};
    for(const [name,g] of Object.entries(meta.geometries)) {
      const qp = new Uint16Array(buffer,g.p,g.vertices*3), positions = new Float32Array(g.vertices*3);
      for(let i=0;i<positions.length;i++){const a=i%3;positions[i]=g.min[a]+qp[i]/65535*(g.max[a]-g.min[a]);}
      const normals = new Int16Array(buffer,g.n,g.vertices*3);
      const indices = g.indexBytes===2?new Uint16Array(buffer,g.i,g.indices):new Uint32Array(buffer,g.i,g.indices);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
      geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3,true));
      geometry.setIndex(new THREE.BufferAttribute(indices,1));geometry.computeBoundingSphere();
      geometry.userData.shared = true; geometries[name]=geometry;
    }
    for(const l of meta.links) {
      const group = new THREE.Group(); group.name = l.name; this.links[l.name]=group;
      for(const v of l.visuals) {
        let name=v.material==='dark'?'robotDark':'robotShell';
        if(/rubber_hand/.test(l.name))name='rubber';
        if(/wrist|waist_roll|waist_yaw|ankle_pitch/.test(l.name))name='robotJoint';
        if(/logo/.test(l.name))name='robotDark';
        const mesh = new THREE.Mesh(geometries[v.mesh],this.surfaces.get(name));
        mesh.name=l.name+' / CAD';mesh.position.fromArray(v.xyz);mesh.rotation.set(...v.rpy,'ZYX');mesh.scale.fromArray(v.scale);
        mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.isRobot=true;group.add(mesh);
      }
    }
    this.frame.add(this.links[meta.root]);
    for(const j of meta.joints) {
      const node=this.links[j.child];node.position.fromArray(j.xyz);node.rotation.set(...j.rpy,'ZYX');
      this.links[j.parent].add(node);
      this.joints[j.name]={node,origin:node.quaternion.clone(),axis:new V().fromArray(j.axis),angle:0,min:j.min,max:j.max,type:j.type};
    }
    this.ready=true;this.neutral();this.frame.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(this.frame);
    this.baseHeight=-bounds.min.y+.025;this.root.position.y=this.baseHeight;
    this.height=bounds.max.y-bounds.min.y;
    this.root.traverse(o=>o.userData.isRobot=true);
    this.gripSocket=new THREE.Object3D();this.gripSocket.name='Right hand contact frame';this.gripSocket.position.copy(gripPoint);
    this.links.right_rubber_hand.add(this.gripSocket);
    this.restGripPosition=this.root.parent.worldToLocal(this.contactPosition());
    this.restGripOrientation=this.root.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(this.gripSocket.getWorldQuaternion(new THREE.Quaternion()));
  }
  set(name,angle) {
    const j=this.joints[name];if(!j||j.type==='fixed')return;
    j.angle=THREE.MathUtils.clamp(angle,j.min,j.max);
    j.node.quaternion.copy(j.origin).multiply(new THREE.Quaternion().setFromAxisAngle(j.axis,j.angle));
  }
  neutral() {
    for(const side of ['left','right']) {
      this.set(side+'_shoulder_pitch_joint',.08);
      this.set(side+'_shoulder_roll_joint',side==='left'?.14:-.14);
      this.set(side+'_shoulder_yaw_joint',0);
      this.set(side+'_elbow_joint',.95);
      this.set(side+'_wrist_roll_joint',0);this.set(side+'_wrist_pitch_joint',0);this.set(side+'_wrist_yaw_joint',0);
    }
  }
  solveArm(side,target,iterations=8) {
    const endpoint=this.links[side+'_rubber_hand'];if(!endpoint)return;
    const names=['shoulder_pitch','shoulder_roll','shoulder_yaw','elbow','wrist_pitch','wrist_yaw'].map(x=>side+'_'+x+'_joint');
    const worldTarget=this.root.parent.localToWorld(target.clone());
    for(let k=0;k<iterations;k++) {
      for(let i=names.length-1;i>=0;i--) {
        this.root.updateWorldMatrix(true,true);
        const j=this.joints[names[i]],jp=j.node.getWorldPosition(new V());
        const hand=endpoint.localToWorld(new V(.035,0,0));
        const axis=j.axis.clone().transformDirection(j.node.matrixWorld);
        const a=hand.sub(jp).projectOnPlane(axis).normalize(),b=worldTarget.clone().sub(jp).projectOnPlane(axis).normalize();
        if(a.lengthSq()<.1||b.lengthSq()<.1)continue;
        const delta=Math.atan2(axis.dot(a.clone().cross(b)),THREE.MathUtils.clamp(a.dot(b),-1,1));
        this.set(names[i],j.angle+THREE.MathUtils.clamp(delta,-.25,.25));
      }
    }
  }
  pose(gait=0,moving=false,reach=0,width=.65,height=.45,carryY=1.05,forward=.35,preserveRight=false) {
    if(!this.ready)return;
    const right=preserveRight?Object.fromEntries(ARM_JOINTS.map(name=>['right_'+name+'_joint',this.joints['right_'+name+'_joint'].angle])):null;
    this.neutral();
    for(const [i,side] of ['left','right'].entries()) {
      const swing=moving?Math.sin(gait+i*Math.PI):0;
      const lift=moving?Math.max(0,Math.sin(gait+i*Math.PI))*.42:0;
      this.set(side+'_hip_pitch_joint',-swing*.24-.025);
      this.set(side+'_knee_joint',lift+.05);
      this.set(side+'_ankle_pitch_joint',swing*.18-lift*.48-.025);
      this.set(side+'_hip_roll_joint',0);this.set(side+'_ankle_roll_joint',0);
      if(reach<.01){this.set(side+'_shoulder_pitch_joint',.08+swing*.15);continue;}
      const sideSign=side==='left'?1:-1;
      const lateral=THREE.MathUtils.clamp(width*.28,.085,.25);
      const rest=new V(sideSign*.24,.73,.12);
      const held=new V(sideSign*lateral,Math.max(.75,carryY-height*.5+.01),Math.min(forward,.35));
      const target=rest.lerp(held,reach);
      this.solveArm(side,target,reach>.8?10:6);
    }
    this.root.position.y=this.baseHeight+(moving?Math.sin(gait*2)*.008:0);
    if(right)this.restoreJoints(right);
  }
  headPosition() {
    const head=this.links.head_link;
    return head?head.localToWorld(new V(.08,0,.44)):new V(0,1.25,.1);
  }
  contactPosition(){return this.gripSocket?.getWorldPosition(new V());}
  /** Seven-joint damped least-squares IK: solve position AND wrist orientation. */
  solveGrip(target,orientation=this.frame.quaternion,iterations=24){
    if(!this.ready)return Infinity;
    this.root.updateWorldMatrix(true,true);
    const parent=this.root.parent,worldTarget=parent.localToWorld(target.clone());
    const worldQ=parent.getWorldQuaternion(new THREE.Quaternion()).multiply(orientation);
    const joints=ARM_JOINTS.map(name=>this.joints['right_'+name+'_joint']);
    for(let k=0;k<iterations;k++){
      this.root.updateWorldMatrix(true,true);
      const tip=this.gripSocket.getWorldPosition(new V()),q=this.gripSocket.getWorldQuaternion(new THREE.Quaternion());
      const deltaQ=worldQ.clone().multiply(q.invert()).normalize();if(deltaQ.w<0)deltaQ.set(-deltaQ.x,-deltaQ.y,-deltaQ.z,-deltaQ.w);
      const angle=2*Math.acos(THREE.MathUtils.clamp(deltaQ.w,-1,1)),sin=Math.sqrt(Math.max(1-deltaQ.w*deltaQ.w,1e-12));
      const error=worldTarget.clone().sub(tip),rotation=new V(deltaQ.x,deltaQ.y,deltaQ.z).multiplyScalar(angle/sin);
      if(error.length()<.0007&&rotation.length()<.006)break;
      const weight=.23,columns=joints.map(j=>{
        const axis=j.axis.clone().transformDirection(j.node.matrixWorld),origin=j.node.getWorldPosition(new V());
        const linear=axis.clone().cross(tip.clone().sub(origin));return [...linear.toArray(),...axis.multiplyScalar(weight).toArray()];
      });
      const matrix=Array.from({length:6},(_,r)=>Array.from({length:6},(_,c)=>columns.reduce((sum,v)=>sum+v[r]*v[c],0)+(r===c?.0003:0)));
      const solved=solveLinear(matrix,[...error.toArray(),...rotation.multiplyScalar(weight).toArray()]);
      joints.forEach((j,i)=>{const delta=columns[i].reduce((sum,v,r)=>sum+v*solved[r],0);this.set('right_'+ARM_JOINTS[i]+'_joint',j.angle+THREE.MathUtils.clamp(delta,-.14,.14));});
    }
    this.root.updateWorldMatrix(true,true);return this.contactPosition().distanceTo(worldTarget);
  }
  jointState(){return Object.fromEntries(Object.entries(this.joints).filter(([,j])=>j.type!=='fixed').map(([name,j])=>[name,j.angle]));}
  restoreJoints(state){for(const [name,value] of Object.entries(state||{}))if(Number.isFinite(value))this.set(name,value);this.root.updateWorldMatrix(true,true);}
}
