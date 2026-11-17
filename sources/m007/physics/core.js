import RAPIER from '@dimforge/rapier3d-compat/rapier.es.js';
import * as THREE from 'three';
import {findPath} from '../dist/planner.js';

// SI units. Rendering NEVER owns a dynamic object's pose.
export const DT=1/120;
export const LIMITS=Object.freeze({penetration:.003,continuitySlack:.003,objectSpeed:2,
  gripSlip:.005,gripAngle:5*Math.PI/180,position:.01,placeAngle:5*Math.PI/180,
  settleSpeed:.02,settleAngular:.1,settleSeconds:.6,contactSeconds:.18,
  jointSpeed:1.2,gripSafety:1.5,maxJawForce:80,baseSpeed:.32,armSpeed:.10});
export const STATES=['IDENTIFY','PLAN_PICK','NAVIGATE','PREGRASP','DOCK','APPROACH','CLOSE',
  'VERIFY_GRASP','LIFT','PLAN_CARRY','TRANSPORT','LOWER','RELEASE','RETREAT','SETTLE','SUCCESS'];
export const LABELS={IDLE:'等待任务',IDENTIFY:'识别与时效校验',PLAN_PICK:'可达性与路径规划',
  NAVIGATE:'自主接近工作台',PREGRASP:'安全区抬臂',DOCK:'精确停靠',APPROACH:'张爪接近物体',
  CLOSE:'夹爪闭合与接触',VERIFY_GRASP:'验证双侧夹持',LIFT:'试提与稳定检测',
  PLAN_CARRY:'规划负载路径',TRANSPORT:'带约束搬运',LOWER:'目标对齐与下放',
  RELEASE:'支撑确认后释放',RETREAT:'张爪退离',SETTLE:'独立落稳验证',
  SUCCESS:'任务验收通过',FAILED:'检测到失败',E_STOP:'执行停止'};
export const DIAG={NO_TARGET:'目标缺失或识别置信度不足',STALE_TARGET:'目标观测已过期',
  UNREACHABLE:'机械臂无法到达目标姿态',NO_PATH:'底盘路径不可达',
  SWEEP_BLOCKED:'机器人或负载的扫掠体被障碍阻挡',SELF_COLLISION:'非相邻机械臂与躯干碰撞',
  GRASP_FAILED:'双侧接触未成立',GRIP_CAPACITY:'实测接触力与摩擦预算不足',
  CONTACT_LOST:'夹持过程中丢失双侧接触',SLIP:'物体相对夹爪滑移超限',
  TELEPORT:'单步位移与速度不一致',PENETRATION:'物体穿透超过容差',
  WRONG_COLLISION:'发生未许可接触',UNREASONABLE_MOTION:'速度或姿态变化超限',
  NO_SUPPORT:'释放前目标台面支撑未成立',PLACE_FAILED:'物体未在目标区独立落稳',
  JOINT_LIMIT:'关节位置或速度超限',TIMEOUT:'状态执行超时',BAD_CONFIG:'实验参数无效'};
const V=THREE.Vector3,Q=THREE.Quaternion,I={x:0,y:0,z:0,w:1};
const v=p=>new V(p.x,p.y,p.z),q=p=>new Q(p.x,p.y,p.z,p.w);
const smoother=t=>t*t*t*(t*(t*6-15)+10);
const terminal=s=>['SUCCESS','FAILED','E_STOP'].includes(s);
let ready;
export function initPhysics(){return ready??=RAPIER.init();}
export function continuity(previous,current,dt=DT){
  const displacement=v(current.p).distanceTo(v(previous.p));
  const bound=Math.max(v(current.v).length(),v(previous.v).length())*dt+LIMITS.continuitySlack;
  return {displacement,bound,violation:displacement>bound};
}
export function graspCapacity(mass,mu,left,right,acceleration=0){
  const available=2*mu*Math.min(left,right);
  const required=LIMITS.gripSafety*mass*(9.81+Math.abs(acceleration));
  return {available,required,ok:available>=required&&Math.max(left,right)<=LIMITS.maxJawForce};
}
export function allowedContact(a,b,state){
  const pair=[a,b].sort().join('|');
  if(pair==='finger|payload')return ['CLOSE','VERIFY_GRASP','LIFT','PLAN_CARRY','TRANSPORT','LOWER','RELEASE','RETREAT','E_STOP'].includes(state);
  if(pair==='payload|source')return ['IDLE','IDENTIFY','PLAN_PICK','NAVIGATE','PREGRASP','DOCK','APPROACH','CLOSE','VERIFY_GRASP','LIFT'].includes(state);
  if(pair==='destination|payload')return ['LOWER','RELEASE','RETREAT','SETTLE','SUCCESS','E_STOP'].includes(state);
  return false;
}

/** A bounded verification mode in the existing G1 project.
 * Arm = real URDF kinematic tree + rate limits + swept capsule collision proxies.
 * Pads = dynamic bodies + force-based prismatic motors.
 * Payload = dynamic + CCD. A contact-gated fixed joint is a documented grasp
 * approximation, NOT a claim of calibrated dexterous-hand/force-closure physics.
 */
export class PhysicsTrial{
  constructor({rig,kind='cup',seed=1,friction=.65,mass,missing=false,stale=false,
    noContact=false,unreachable=false,blocked=false,record=true}={}){
    if(!rig?.ready||!['cup','box'].includes(kind)||!Number.isInteger(seed)||seed<1||!Number.isFinite(friction)||friction<=0||friction>2)throw Error(DIAG.BAD_CONFIG);
    this.rig=rig;this.robot=rig.root.parent;this.kind=kind;this.seed=seed;
    this.options={missing,stale,noContact,unreachable,blocked};this.record=record;
    this.mass=mass??(kind==='cup'?.35:.5);if(!Number.isFinite(this.mass)||this.mass<=0||this.mass>15)throw Error(DIAG.BAD_CONFIG);
    this.mu=friction;this.half=kind==='cup'?{x:.055,y:.065,z:.055}:{x:.13,y:.10,z:.09};
    this.world=new RAPIER.World({x:0,y:-9.81,z:0});this.world.timestep=DT;
    this.world.numSolverIterations=64;this.world.integrationParameters.contact_natural_frequency=120;this.world.integrationParameters.maxCcdSubsteps=4;
    this.world.integrationParameters.normalizedAllowedLinearError=.0002;
    this.queue=new RAPIER.EventQueue(true);this.parts=[];this.byCollider=new Map();
    this.obstacles=[];this.events=[];this.trace=[];this.contacts=[];this.t=0;this.steps=0;
    this.state='IDLE';this.stateTime=0;this.stable=0;this.contactTime=0;this.grip=null;
    this.failures=[];this.motion=null;this.lastAudit=null;this.releaseEvidence=null;
    this.metrics={maxStep:0,maxPenetration:0,maxSlip:0,maxGripAngle:0,maxSpeed:0,
      maxJointSpeed:0,forbiddenContacts:0,attachJump:0,graspForce:null,positionError:null,
      maxFreeAccelerationError:0,minCarryCapacityMargin:null};
    const jitter=seed===1?0:((seed*37%101)/100-.5)*.035;
    this.source={x:-1.25+jitter,y:unreachable?2.5:1.02+this.half.y,z:.72};
    this.destination={x:1.25-jitter,y:1.02+this.half.y,z:.72};
    this.target={id:kind,confidence:missing?0:1,stamp:stale?-10:0,position:{...this.source},provider:'simulation-ground-truth'};
    this.fixed('floor','floor',{x:0,y:-.055,z:0},{x:3.5,y:.05,z:2.5});
    this.sourceTable=this.fixed('source','source',{x:-1.25,y:this.source.y-this.half.y-.06,z:1.08},{x:.52,y:.06,z:.43});
    this.destTable=this.fixed('destination','destination',{x:1.25,y:.96,z:1.08},{x:.52,y:.06,z:.43});
    this.addObstacle({x:0,y:.42,z:-.45},{x:.22,y:.42,z:.24},'barrier');
    if(blocked)this.addObstacle({x:-1.05,y:.6,z:.15},{x:.4,y:.6,z:.28},'blocked-dock');
    this.robot.position.set(-1.0477,0,-1.35);this.robot.rotation.set(0,0,0);rig.pose(0,false,0);this.robot.updateMatrixWorld(true);
    const pos=rig.contactPosition();this.palm=this.body('palm','palm',RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x,pos.y,pos.z));
    this.fingers=[];this.fingerJoints=[];this.opening=this.half.x+.045;this.closeTarget=this.half.x+.008-.003;
    for(const side of [-1,1]){
      const pad=this.body('finger'+side,'finger',RAPIER.RigidBodyDesc.dynamic().setCanSleep(false).setTranslation(pos.x+side*this.opening,pos.y,pos.z).setCcdEnabled(true).setAdditionalSolverIterations(4),
        RAPIER.ColliderDesc.cuboid(.008,.035,.035).setMass(.08).setFriction(this.mu).setRestitution(0));
      pad.side=side;pad.half={x:.008,y:.035,z:.035};
      const j=this.world.createImpulseJoint(RAPIER.JointData.prismatic({x:0,y:0,z:0},{x:0,y:0,z:0},{x:1,y:0,z:0}),this.palm.body,pad.body,true);
      j.setLimits(side<0?-.30:0,side<0?0:.30);j.configureMotorModel(RAPIER.MotorModel.ForceBased);
      j.configureMotorPosition(side*this.opening,10000,70);j.setContactsEnabled(false);
      this.fingers.push(pad);this.fingerJoints.push(j);
    }
    const desc=RAPIER.RigidBodyDesc.dynamic().setCanSleep(false).setTranslation(this.source.x,this.source.y+.002,this.source.z).setCcdEnabled(true).setAdditionalSolverIterations(8).setLinearDamping(.05).setAngularDamping(.1);
    const shape=kind==='cup'?RAPIER.ColliderDesc.cylinder(this.half.y,this.half.x):RAPIER.ColliderDesc.cuboid(this.half.x,this.half.y,this.half.z);
    this.payload=this.body(kind,'payload',desc,shape.setMass(this.mass).setFriction(this.mu).setRestitution(.02));this.payload.half=this.half;
    this.armNames=['right_shoulder_yaw_link','right_elbow_link','right_wrist_yaw_link'];
    this.armProxies=[];
    for(let i=0;i<2;i++){
      const a=rig.links[this.armNames[i]].getWorldPosition(new V()),b=rig.links[this.armNames[i+1]].getWorldPosition(new V());
      const center=a.clone().add(b).multiplyScalar(.5),radius=.032;
      const rot=new Q().setFromUnitVectors(new V(0,1,0),b.clone().sub(a).normalize());
      const link=this.body('arm'+i,'robot',RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(center.x,center.y,center.z).setRotation(rot),RAPIER.ColliderDesc.capsule(Math.max(0,a.distanceTo(b)/2-radius),radius));
      this.armProxies.push(link);
    }
    this.world.step(this.queue); // initialise broad phase before queries
    for(let n=0;n<120;n++)this.world.step(this.queue); // physical settling, no pose reset
    this.queue.clear();this.initialPayload=this.snapshotPayload();
    this.lastAudit=this.snapshotPayload();this.event('INIT',{kind,mass:this.mass,friction:this.mu,seed,dt:DT});
  }
  body(id,role,desc,collider){
    const body=this.world.createRigidBody(desc);const part={id,role,body};
    if(collider){collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS|RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS);
      collider.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);part.collider=this.world.createCollider(collider,body);this.byCollider.set(part.collider.handle,part);}
    this.parts.push(part);return part;
  }
  fixed(id,role,p,half){const part=this.body(id,role,RAPIER.RigidBodyDesc.fixed().setTranslation(p.x,p.y,p.z),RAPIER.ColliderDesc.cuboid(half.x,half.y,half.z).setFriction(this.mu));part.half=half;
    if(role!=='floor')this.obstacles.push({x:p.x,z:p.z,w:half.x*2,d:half.z*2,part});return part;}
  addObstacle(p,half,id='injected-obstacle'){return this.fixed(id,'obstacle',p,half);}
  event(type,data={}){this.events.push({step:this.steps,t:Number(this.t.toFixed(5)),state:this.state,type,...data});}
  transition(state){this.state=state;this.stateTime=0;this.stable=0;this.motion=null;this.event('STATE',{to:state});}
  fail(code,evidence={}){if(terminal(this.state))return;this.failures.push({code,description:DIAG[code],t:this.t,evidence});this.event('FAIL',{code,evidence});this.transition('FAILED');}
  start(){if(this.state==='IDLE')this.transition('IDENTIFY');}
  emergencyStop(){if(!terminal(this.state)){this.event('ESTOP');this.transition('E_STOP');}}
  snapshotPayload(){return {p:{...this.payload.body.translation()},q:{...this.payload.body.rotation()},v:{...this.payload.body.linvel()},w:{...this.payload.body.angvel()}};}
  plan(to){
    // Reuse the platform's A*. Adjust its default 0.39 m inflation to 0.25 m.
    const obs=this.obstacles.map(o=>({...o,w:o.w-2*.14,d:o.d-2*.14}));
    this.route=findPath(this.robot.position,to,obs);this.routeIndex=1;
    if(!this.route){this.fail('NO_PATH',{to});return false;}this.event('PATH',{points:this.route});return true;
  }
  verifyReach(goal,dock){
    // Dry-run the SAME URDF IK, then restore all render/kinematic state.
    // No body transforms are changed by this feasibility check.
    const before=this.rig.jointState(),base=this.robot.position.clone();
    this.robot.position.set(dock.x,0,dock.z);this.robot.updateMatrixWorld(true);
    let from=this.rig.contactPosition(),fromQ=this.rig.gripSocket.getWorldQuaternion(new Q());
    const carry=new V(dock.x-.2023,1.17,dock.z+.30);
    for(let n=1;n<=100;n++)this.rig.solveGrip(this.robot.worldToLocal(from.clone().lerp(carry,n/100)),fromQ.clone().slerp(this.rig.frame.quaternion,n/100),24);
    from=this.rig.contactPosition();
    for(let n=1;n<=80;n++)this.rig.solveGrip(this.robot.worldToLocal(from.clone().lerp(v(goal),n/80)),this.rig.frame.quaternion,24);
    const error=this.rig.contactPosition().distanceTo(v(goal));
    const orientation=this.rig.gripSocket.getWorldQuaternion(new Q()).angleTo(this.rig.frame.quaternion);
    this.robot.position.copy(base);this.rig.restoreJoints(before);this.robot.updateMatrixWorld(true);
    this.event('REACH_CHECK',{goal,error,orientation});return error<.005&&orientation<.03;
  }
  armTransforms(){return this.armProxies.map((p,i)=>{
    const a=this.rig.links[this.armNames[i]].getWorldPosition(new V()),b=this.rig.links[this.armNames[i+1]].getWorldPosition(new V());
    return {part:p,p:a.clone().add(b).multiplyScalar(.5),q:new Q().setFromUnitVectors(new V(0,1,0),b.sub(a).normalize())};});}
  sweep(part,end,rot=q(part.body.rotation()),exclude=[]){
    const start=v(part.body.translation()),fromQ=q(part.body.rotation());
    const angular=fromQ.angleTo(rot),radius=part.half?Math.hypot(...Object.values(part.half)):.20;
    const samples=Math.max(1,Math.ceil(angular*radius/.003));
    for(let n=1;n<=samples;n++){
      const a=start.clone().lerp(end,(n-1)/samples),b=start.clone().lerp(end,n/samples),r=fromQ.clone().slerp(rot,n/samples);
      const hit=this.world.castShape(a,r,b.clone().sub(a),part.collider.shape,0,1,true,undefined,undefined,part.collider,part.body,c=>{
        const other=this.byCollider.get(c.handle);return other&&!exclude.includes(other.role)&&['source','destination','obstacle','floor'].includes(other.role);
      });
      if(hit&&hit.time_of_impact<.999)return this.byCollider.get(hit.collider.handle)?.id||'unknown';
    }return null;
  }
  syncKinematics(){
    const tip=this.rig.contactPosition(),links=this.armTransforms();
    // The shoulder is adjacent to the torso and intentionally excluded.
    // Forearm vs. torso is a non-adjacent pair; verify at the candidate pose.
    const torso=new RAPIER.Cuboid(.10,.15,.07),torsoP=this.robot.position.clone().add(new V(0,1.04,0));
    const forearm=links[1];
    if(forearm.part.collider.shape.intersectsShape(forearm.p,forearm.q,torso,torsoP,I)){
      this.fail('SELF_COLLISION',{a:'forearm-proxy',b:'torso-proxy'});return false;
    }
    for(const transform of links){const hit=this.sweep(transform.part,transform.p,transform.q);if(hit){this.fail('SWEEP_BLOCKED',{body:transform.part.id,obstacle:hit});return false;}}
    for(const finger of this.fingers){
      const newPos=v(finger.body.translation()).add(tip.clone().sub(v(this.palm.body.translation())));
      const hit=this.sweep(finger,newPos);if(hit){this.fail('SWEEP_BLOCKED',{body:finger.id,obstacle:hit});return false;}
    }
    if(this.grip){const newPos=tip.clone().add(this.gripOffset);const excluded=this.state==='LIFT'?['source']:this.state==='LOWER'?['destination']:[];
      const hit=this.sweep(this.payload,newPos,q(this.payload.body.rotation()),excluded);if(hit){this.fail('SWEEP_BLOCKED',{body:this.kind,obstacle:hit});return false;}}
    for(const transform of links){transform.part.body.setNextKinematicTranslation(transform.p);transform.part.body.setNextKinematicRotation(transform.q);}
    this.palm.body.setNextKinematicTranslation(tip);return true;
  }
  moveBase(){
    if(this.routeIndex>=this.route.length)return true;
    const to=this.route[this.routeIndex],p=this.robot.position.clone();const d=Math.hypot(to.x-p.x,to.z-p.z);
    if(d<.002){this.routeIndex++;return false;}
    const step=Math.min(d,LIMITS.baseSpeed*DT);this.robot.position.x+=(to.x-p.x)/d*step;this.robot.position.z+=(to.z-p.z)/d*step;
    this.robot.updateMatrixWorld(true);
    // Base capsule footprint and entire held-object/arm sweeps are independent.
    for(const o of this.obstacles)if(Math.abs(this.robot.position.x-o.x)<o.w/2+.24&&Math.abs(this.robot.position.z-o.z)<o.d/2+.24){this.robot.position.copy(p);this.robot.updateMatrixWorld(true);this.fail('SWEEP_BLOCKED',{body:'base',obstacle:o.part.id});return false;}
    if(!this.syncKinematics()){this.robot.position.copy(p);this.robot.updateMatrixWorld(true);return false;}
    return false;
  }
  moveHand(goal,seconds=null){
    const rig=this.rig;
    if(!this.motion){
      const from=rig.contactPosition(),orientation=rig.gripSocket.getWorldQuaternion(new Q());
      this.motion={from,to:v(goal),q:orientation,elapsed:0,duration:seconds??Math.max(.9,from.distanceTo(v(goal))/LIMITS.armSpeed*1.875,orientation.angleTo(rig.frame.quaternion)/.6*1.875)};
      this.event('ARM_TARGET',{position:goal,duration:this.motion.duration});
    }
    const m=this.motion;m.elapsed+=DT;const u=smoother(Math.min(1,m.elapsed/m.duration));
    const desired=m.from.clone().lerp(m.to,u),desiredQ=m.q.clone().slerp(rig.frame.quaternion,u);
    const before=rig.jointState();const local=this.robot.worldToLocal(desired.clone());
    rig.solveGrip(local,desiredQ,16);const solved=rig.jointState();
    for(const [name,angle]of Object.entries(solved)){
      const bounded=before[name]+THREE.MathUtils.clamp(angle-before[name],-LIMITS.jointSpeed*DT,LIMITS.jointSpeed*DT);rig.set(name,bounded);
      this.metrics.maxJointSpeed=Math.max(this.metrics.maxJointSpeed,Math.abs(bounded-before[name])/DT);
    }
    this.robot.updateMatrixWorld(true);
    if(!this.syncKinematics()){rig.restoreJoints(before);return false;}
    const error=rig.contactPosition().distanceTo(m.to),angle=rig.gripSocket.getWorldQuaternion(new Q()).angleTo(rig.frame.quaternion);
    if(m.elapsed>=m.duration&&error<.002&&angle<.02)return true;
    if(m.elapsed>m.duration+3)this.fail('UNREACHABLE',{positionError:error,orientationError:angle,target:goal});return false;
  }
  pair(a,b){
    const result={touch:false,force:0,penetration:0,n:{x:0,y:0,z:0}};
    this.world.contactPair(a.collider,b.collider,(m,flipped)=>{
      for(let i=0;i<m.numContacts();i++)if(m.contactDist(i)<.001){result.touch=true;result.force+=m.contactImpulse(i)/DT;result.penetration=Math.max(result.penetration,-m.contactDist(i));}
      const normal=m.normal();result.n={x:normal.x*(flipped?-1:1),y:normal.y*(flipped?-1:1),z:normal.z*(flipped?-1:1)};
    });return result;
  }
  contactEvidence(){
    const pair=this.fingers.map(f=>this.pair(f,this.payload));
    const opposed=pair[0].n.x*pair[1].n.x<-.65;
    return {pair,opposed,both:pair.every(p=>p.touch)&&opposed,capacity:graspCapacity(this.mass,this.mu,pair[0].force,pair[1].force)};
  }
  support(){const c=this.pair(this.destTable,this.payload);return {...c,valid:c.touch&&c.n.y>.85&&this.payload.body.translation().y>1.02};}
  gripAttach(){
    const evidence=this.contactEvidence();if(!evidence.both||!evidence.capacity.ok||this.contactTime<LIMITS.contactSeconds){this.fail('GRASP_FAILED',{evidence});return;}
    const before=this.snapshotPayload();this.gripOffset=v(before.p).sub(v(this.palm.body.translation()));
    this.gripOrientation=q(before.q);this.grip=this.world.createImpulseJoint(RAPIER.JointData.fixed(this.gripOffset,this.gripOrientation,{x:0,y:0,z:0},I),this.palm.body,this.payload.body,true);
    // Preserve actual frames: no setTranslation, no mesh parenting, no zeroing velocity.
    this.metrics.attachJump=v(before.p).distanceTo(v(this.payload.body.translation()));
    this.metrics.graspForce=evidence.pair.map(p=>p.force);this.event('GRASP_ATTACHED',{evidence,offset:this.gripOffset.toArray(),jump:this.metrics.attachJump});
  }
  release(){const evidence=this.support();if(!evidence.valid){this.fail('NO_SUPPORT',{evidence});return;}
    this.releaseEvidence={...evidence,pose:this.snapshotPayload()};if(this.grip)this.world.removeImpulseJoint(this.grip,true);this.grip=null;
    this.event('GRASP_RELEASED',{support:evidence});this.fingerJoints.forEach((j,i)=>j.configureMotorPosition(this.fingers[i].side*this.opening,10000,70));}
  control(){
    const p=this.payload.body.translation(),dock={x:this.source.x+.2023,z:this.source.z-.35},destDock={x:this.destination.x+.2023,z:this.destination.z-.35};
    if(['LIFT','PLAN_CARRY','TRANSPORT','LOWER'].includes(this.state)&&!this.grip){this.fail('CONTACT_LOST',{reason:'missing-grasp-constraint'});return;}
    switch(this.state){
      case 'IDENTIFY':
        if(this.target.confidence<.9)return this.fail('NO_TARGET',{confidence:this.target.confidence});
        if(this.t-this.target.stamp>.5)return this.fail('STALE_TARGET',{age:this.t-this.target.stamp});
        this.event('OBSERVATION',{...this.target});this.transition('PLAN_PICK');break;
      case 'PLAN_PICK':
        if(!this.verifyReach(this.source,dock))return this.fail('UNREACHABLE',{target:this.source});
        if(this.plan({x:dock.x,z:dock.z-.4}))this.transition('NAVIGATE');break;
      case 'NAVIGATE':if(this.moveBase())this.transition('PREGRASP');break;
      case 'PREGRASP':if(this.moveHand({x:this.source.x,y:1.17,z:this.robot.position.z+.30})){if(this.plan(dock))this.transition('DOCK');}break;
      case 'DOCK':if(this.moveBase())this.transition('APPROACH');break;
      case 'APPROACH':if(this.moveHand({x:this.source.x,y:this.source.y,z:this.source.z})){
        if(v(p).distanceTo(v(this.source))>.01)this.fail('GRASP_FAILED',{reason:'target-moved',observed:p,planned:this.source});
        else{this.target.stamp=this.t;this.target.position={...p};this.event('OBSERVATION',{...this.target});this.transition('CLOSE');}
      }break;
      case 'CLOSE':{
        const target=this.options.noContact?this.opening:this.closeTarget;
        // Ramp the motor target; force is generated by constraint solving.
        const aperture=this.opening+(target-this.opening)*Math.min(1,this.stateTime/1.2);
        this.fingerJoints.forEach((j,i)=>j.configureMotorPosition(this.fingers[i].side*aperture,10000,70));
        const c=this.contactEvidence();if(c.both&&this.stateTime>=1.2){this.contactTime=0;this.transition('VERIFY_GRASP');}
        else if(this.stateTime>3)this.fail('GRASP_FAILED',{contact:c});break;}
      case 'VERIFY_GRASP':{
        this.fingerJoints.forEach((j,i)=>j.configureMotorPosition(this.fingers[i].side*this.closeTarget,10000,70));
        const c=this.contactEvidence();this.contactTime=c.both&&c.capacity.ok?this.contactTime+DT:0;
        if(this.contactTime>=LIMITS.contactSeconds){this.gripAttach();if(this.grip)this.transition('LIFT');}
        else if(this.stateTime>2)this.fail(c.both?'GRIP_CAPACITY':'GRASP_FAILED',{contact:c});break;}
      case 'LIFT':if(this.moveHand({x:this.source.x,y:this.source.y+.16,z:this.source.z}))this.transition('PLAN_CARRY');break;
      case 'PLAN_CARRY':if(this.plan(destDock))this.transition('TRANSPORT');break;
      case 'TRANSPORT':if(this.moveBase())this.transition('LOWER');break;
      case 'LOWER':{
        // Surface and dynamic contact determine release, not the scheduled time.
        const goal={x:this.destination.x-this.gripOffset.x,y:this.destination.y-this.gripOffset.y-.0003,z:this.destination.z-this.gripOffset.z};
        const arrived=this.moveHand(goal);const c=this.support();
        if(arrived&&c.valid&&v(this.payload.body.linvel()).length()<.03){this.stable+=DT;if(this.stable>.15){this.transition('RELEASE');this.release();}}
        else this.stable=0;break;}
      case 'RELEASE':if(this.stateTime>.7)this.transition('RETREAT');break;
      case 'RETREAT':if(this.moveHand({x:this.destination.x,y:this.destination.y+.16,z:this.destination.z}))this.transition('SETTLE');break;
      case 'SETTLE':{
        const pos=v(p).distanceTo(v(this.destination)),angle=q(this.payload.body.rotation()).angleTo(new Q());
        const valid=!this.grip&&this.support().valid&&pos<=LIMITS.position&&angle<=LIMITS.placeAngle&&v(this.payload.body.linvel()).length()<LIMITS.settleSpeed&&v(this.payload.body.angvel()).length()<LIMITS.settleAngular;
        this.stable=valid?this.stable+DT:0;this.metrics.positionError=pos;
        if(this.stable>=LIMITS.settleSeconds){this.event('ACCEPT',{positionError:pos,angle,settleSeconds:this.stable});this.transition('SUCCESS');}
        else if(this.stateTime>4)this.fail('PLACE_FAILED',{positionError:pos,angle});break;}
    }
    if(!terminal(this.state)&&this.state!=='IDLE'&&this.stateTime>35)this.fail('TIMEOUT',{state:this.state});
  }
  audit(){
    const now=this.snapshotPayload(),speed=v(now.v).length(),c=continuity(this.lastAudit,now);
    this.metrics.maxStep=Math.max(this.metrics.maxStep,c.displacement);this.metrics.maxSpeed=Math.max(this.metrics.maxSpeed,speed);
    if(c.violation)this.fail('TELEPORT',{...c,before:this.lastAudit.p,after:now.p});
    if(speed>LIMITS.objectSpeed||v(now.w).length()>4)this.fail('UNREASONABLE_MOTION',{speed,angularSpeed:v(now.w).length()});
    for(const part of this.parts)if(part.collider&&part!==this.payload){
      const contact=this.payload.collider.contactCollider(part.collider,0);
      if(contact){const depth=Math.max(0,-contact.distance);this.metrics.maxPenetration=Math.max(this.metrics.maxPenetration,depth);
        if(depth>LIMITS.penetration)this.fail('PENETRATION',{other:part.id,depth,method:'shape-distance'});}
    }
    this.contacts=[];
    this.world.contactPairsWith(this.payload.collider,other=>{
      const part=this.byCollider.get(other.handle);if(!part)return;const contact=this.pair(this.payload,part);
      if(!contact.touch)return;this.contacts.push({other:part.id,role:part.role,...contact});
      this.metrics.maxPenetration=Math.max(this.metrics.maxPenetration,contact.penetration);
      if(contact.penetration>LIMITS.penetration)this.fail('PENETRATION',{other:part.id,depth:contact.penetration});
      if(!allowedContact('payload',part.role,this.state)&&!terminal(this.state)){
        this.metrics.forbiddenContacts++;this.fail('WRONG_COLLISION',{other:part.id,state:this.state});}
    });
    if(this.grip&&!terminal(this.state)){
      const slip=v(now.p).distanceTo(v(this.palm.body.translation()).add(this.gripOffset)),angle=q(now.q).angleTo(this.gripOrientation);
      this.metrics.maxSlip=Math.max(this.metrics.maxSlip,slip);this.metrics.maxGripAngle=Math.max(this.metrics.maxGripAngle,angle);
      if(slip>LIMITS.gripSlip||angle>LIMITS.gripAngle)this.fail('SLIP',{slip,angle});
      const e=this.contactEvidence();this.lostContact=e.both?0:(this.lostContact||0)+DT;
      this.velocityWindow??=[];this.velocityWindow.push(v(now.v));if(this.velocityWindow.length>13)this.velocityWindow.shift();
      const accel=this.velocityWindow.length>1?v(now.v).sub(this.velocityWindow[0]).length()/((this.velocityWindow.length-1)*DT):0,cap=graspCapacity(this.mass,this.mu,...e.pair.map(p=>p.force),accel);
      const margin=cap.available-cap.required;this.metrics.minCarryCapacityMargin=Math.min(this.metrics.minCarryCapacityMargin??Infinity,margin);
      this.weakGrip=cap.ok?0:(this.weakGrip||0)+DT;
      if(this.lostContact>.10||this.weakGrip>.18){this.world.removeImpulseJoint(this.grip,true);this.grip=null;this.fail(this.lostContact>.10?'CONTACT_LOST':'GRIP_CAPACITY',{contact:e,acceleration:accel,capacity:cap});}
    }
    if(!this.contacts.length&&!this.grip){const expected=new V(0,-9.81,0).addScaledVector(v(this.lastAudit.v),-.05);const error=v(now.v).sub(v(this.lastAudit.v)).multiplyScalar(1/DT).sub(expected).length();this.metrics.maxFreeAccelerationError=Math.max(this.metrics.maxFreeAccelerationError,error);}
    this.lastAudit=now;
  }
  step(){
    const before=this.snapshotPayload();
    if(v(before.p).distanceTo(v(this.lastAudit.p))>LIMITS.continuitySlack)this.fail('TELEPORT',{reason:'pose-written-between-physics-steps',before:this.lastAudit.p,after:before.p});
    this.t+=DT;this.steps++;this.stateTime+=DT;if(!terminal(this.state)&&this.state!=='IDLE')this.control();
    this.world.step(this.queue);this.audit();
    this.queue.drainCollisionEvents((a,b,started)=>{if(started)this.event('CONTACT_BEGIN',{a:this.byCollider.get(a)?.id,b:this.byCollider.get(b)?.id});});
    this.queue.drainContactForceEvents(()=>{});
    if(this.record){const snap=this.snapshotPayload();this.trace.push({step:this.steps,t:this.t,state:this.state,p:snap.p,q:snap.q,v:snap.v,w:snap.w,base:this.robot.position.toArray(),joints:this.rig.jointState(),grip:!!this.grip,contacts:this.contacts.map(c=>({id:c.other,depth:c.penetration,force:c.force})),fingers:this.fingers.map(f=>({...f.body.translation()}))});}
    return this.state;
  }
  run(maxSeconds=150){this.start();for(let n=0;n<maxSeconds/DT&&!terminal(this.state);n++)this.step();if(!terminal(this.state))this.fail('TIMEOUT',{maxSeconds});return this.report();}
  report(){return {format:'embodied-physics-evidence',version:1,date:'2026-10-26',kind:this.kind,seed:this.seed,dt:DT,engine:'Rapier 0.17.3',robot:'existing G1 URDF kinematic tree; educational parallel gripper',perception:this.target.provider,graspModel:'bilateral-contact-gated fixed constraint with measured force budget and break checks',mass:this.mass,friction:this.mu,state:this.state,seconds:this.t,metrics:this.metrics,limits:LIMITS,failures:this.failures,events:this.events,trace:this.trace};}
  dispose(){this.queue.free();this.world.free();}
}
