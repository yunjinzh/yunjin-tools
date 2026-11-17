import * as THREE from 'three';
import {findPath,blocked} from './planner.js';
const V=THREE.Vector3,Q=THREE.Quaternion,UP=new V(0,1,0);
const smooth=t=>t*t*(3-2*t);
export const CUP_CONTACT_TOLERANCE=.006;

/** Contact-gated cup manipulation. Only the robot moves before contact.
 * After contact the cup is a child of the real G1 hand frame, not an independent
 * interpolated object. The same controller drives automatic and manual tasks.
 */
export class CupMotion {
  constructor(world,kind,target=null,duration=4,onPhase=()=>{}){
    this.world=world;this.rig=world.rig;this.cup=world.entities.cup;
    this.kind=kind;this.target=target;this.duration=Math.max(3,duration);this.onPhase=onPhase;
    this.done=false;this.error='';this.stage='dock';this.label='走近操作台';this.phaseIndex=-1;
    if(!this.rig.ready){this.error='机器人关节模型尚未就绪。';return;}
    if(!this.cup||(kind==='pick'&&world.held)||(kind==='place'&&(world.held!=='cup'||!world.cupGrip))){this.error='取放杯条件不满足。';return;}
    this.cup.mesh.updateWorldMatrix(true,false);
    const cupPos=kind==='pick'?this.cup.mesh.getWorldPosition(new V()):new V(target.x,target.y,target.z);
    let cupQ=kind==='pick'?this.cup.mesh.getWorldQuaternion(new Q()):new Q().setFromAxisAngle(UP,target.z>0?Math.PI:0);
    // Keep the feet outside furniture and place the right hand beside the handle.
    const yaw=new THREE.Euler().setFromQuaternion(cupQ,'YXZ').y;
    this.cupQ=new Q().setFromAxisAngle(UP,yaw);this.yaw=yaw+Math.PI;
    const offset=new V(-.11,0,.5).applyQuaternion(this.cupQ);
    this.dock=cupPos.clone().add(offset);this.dock.y=0;
    this.route=findPath(world.robot.position,this.dock,world.obstacles);this.routeIndex=1;
    if(!this.route){this.error='杯子旁没有安全且可达的站位，请清理操作台前的障碍。';return;}
    this.onPhase(this.label);
  }
  fail(message){this.error=message;return {error:message,done:false,distance:0};}
  tick(dt){
    if(this.error)return {error:this.error,done:false,distance:0};
    if(this.done)return {done:true,distance:0};
    const w=this.world,r=w.robot;
    if(this.stage==='dock'){
      while(this.routeIndex<this.route.length&&Math.hypot(r.position.x-this.route[this.routeIndex].x,r.position.z-this.route[this.routeIndex].z)<.002)this.routeIndex++;
      if(this.routeIndex<this.route.length){
        const next=this.route[this.routeIndex],d=Math.hypot(next.x-r.position.x,next.z-r.position.z),step=Math.min(d,dt*.65);
        const x=r.position.x+(next.x-r.position.x)/d*step,z=r.position.z+(next.z-r.position.z)/d*step;
        if(blocked(x,z,w.obstacles))return this.fail('操作站位路径受阻，杯子保持当前状态。');
        const yaw=Math.atan2(next.x-r.position.x,next.z-r.position.z),delta=Math.atan2(Math.sin(yaw-r.rotation.y),Math.cos(yaw-r.rotation.y));
        r.rotation.y+=THREE.MathUtils.clamp(delta,-dt*2.4,dt*2.4);r.position.set(x,0,z);w.pose(step*6,w.held?1:0);
        return {done:false,distance:step};
      }
      this.stage='align';this.label='调整朝向';this.onPhase(this.label);
    }
    if(this.stage==='align'){
      const delta=Math.atan2(Math.sin(this.yaw-r.rotation.y),Math.cos(this.yaw-r.rotation.y));
      r.rotation.y+=THREE.MathUtils.clamp(delta,-dt*1.8,dt*1.8);w.pose(0,w.held?1:0);
      if(Math.abs(delta)>.003)return {done:false,distance:0};
      r.rotation.y=this.yaw;r.updateWorldMatrix(true,true);this.prepare();this.stage='arm';
    }
    if(this.stage==='arm')return this.tickArm(dt);
    return {done:this.done,distance:0};
  }
  prepare(){
    const w=this.world,r=w.robot,rig=this.rig,relative=p=>r.worldToLocal(p.clone());
    const carry=new V(-.2023,1.17,.30),standardQ=rig.frame.quaternion.clone();
    const phase=(name,to,weight,event=null,orientation=standardQ)=>({name,to,weight,event,orientation});
    if(this.kind==='pick'){
      const contact=this.cup.mesh.localToWorld(new V().fromArray(this.cup.mesh.userData.graspOffset));
      this.contactWorld=contact.clone();this.goal=relative(contact);
      const pre=this.goal.clone().add(new V(0,0,-.09)),lift=this.goal.clone().add(new V(0,.065,0));
      this.phases=[phase('抬手并对准杯柄',carry,.8),phase('伸手接近杯柄',pre,.7),phase('手指接触杯柄',this.goal,.65),phase('确认夹持',this.goal,.35,'attach'),phase('垂直抬杯离开台面',lift,.55),phase('收臂稳持咖啡杯',carry,.8)];
    }else{
      // Invert the fixed hand-to-cup transform to find the hand pose that puts
      // the CUP BASE on the table. This avoids moving the cup independently.
      const localCupQ=this.cup.mesh.quaternion.clone(),localCupP=this.cup.mesh.position.clone();
      const worldHandQ=this.cupQ.clone().multiply(localCupQ.invert());
      const worldHandP=new V(this.target.x,this.target.y,this.target.z).sub(localCupP.applyQuaternion(worldHandQ));
      const handQ=r.getWorldQuaternion(new Q()).invert().multiply(worldHandQ),goal=relative(worldHandP);
      const above=goal.clone().add(new V(0,.065,0)),retreat=goal.clone().add(new V(0,.015,-.12));
      this.goal=goal;
      this.phases=[phase('稳持并伸手到桌面上方',above,1.1,null,handQ),phase('缓慢下放咖啡杯',goal,.8,null,handQ),phase('杯底落稳后松手',goal,.35,'release',handQ),phase('手离开杯柄',retreat,.6,null,handQ),phase('收回手臂',rig.restGripPosition.clone(),.95,null,rig.restGripOrientation.clone())];
    }
    const total=this.phases.reduce((sum,p)=>sum+p.weight,0);this.phases.forEach(p=>p.seconds=p.weight/total*this.duration);
    this.nextPhase();
  }
  nextPhase(){
    this.phaseIndex++;
    if(this.phaseIndex>=this.phases.length){this.done=true;return;}
    const p=this.phases[this.phaseIndex],r=this.world.robot;
    this.phase=p;this.time=0;this.eventFired=false;
    this.from=r.worldToLocal(this.rig.contactPosition());
    this.fromQ=r.getWorldQuaternion(new Q()).invert().multiply(this.rig.gripSocket.getWorldQuaternion(new Q()));
    this.label=p.name;this.onPhase(p.name);
  }
  tickArm(dt){
    const p=this.phase,w=this.world,rig=this.rig;
    this.time+=dt;const t=Math.min(1,this.time/p.seconds),amount=smooth(t);
    // Preserve the current right arm so every IK solve starts at the previous
    // frame. Resetting to a rest pose each frame creates visible arm jumps.
    rig.pose(w.gait,false,0,.65,.3,1.05,.35,true);
    const q=this.fromQ.clone().slerp(p.orientation,amount),target=this.from.clone().lerp(p.to,amount);
    const error=rig.solveGrip(target,q,24);
    if(p.event==='attach'&&!this.eventFired){
      const distance=rig.contactPosition().distanceTo(this.contactWorld);
      if(distance<=CUP_CONTACT_TOLERANCE){
        const before=this.cup.mesh.getWorldPosition(new V());
        rig.gripSocket.attach(this.cup.mesh); // preserve world pose: zero snap
        const orientation=w.robot.getWorldQuaternion(new Q()).invert().multiply(rig.gripSocket.getWorldQuaternion(new Q()));
        w.cupGrip={carry:[-.2023,1.17,.30],orientation:orientation.toArray()};w.held='cup';this.cup.status='已握住杯柄';
        this.contactEvent={distance,before:before.toArray(),after:this.cup.mesh.getWorldPosition(new V()).toArray()};
        for(let i=this.phaseIndex+1;i<this.phases.length;i++)this.phases[i].orientation=orientation.clone();
        this.eventFired=true;
      }else if(this.time>p.seconds+1.5)return this.fail('手尚未接触杯柄，已停止抓取；杯子仍留在台面。');
    }
    if(p.event==='release'&&!this.eventFired&&t===1){
      const position=this.cup.mesh.getWorldPosition(new V()),qCup=this.cup.mesh.getWorldQuaternion(new Q());
      const targetPos=new V(this.target.x,this.target.y,this.target.z);
      if(position.distanceTo(targetPos)<=CUP_CONTACT_TOLERANCE&&qCup.angleTo(this.cupQ)<.025){
        w.environment.attach(this.cup.mesh);this.cup.mesh.position.copy(targetPos);this.cup.mesh.quaternion.copy(this.cupQ);
        w.cupGrip=null;w.held=null;this.cup.status='已交付';this.eventFired=true;
        this.releaseEvent={distance:position.distanceTo(targetPos)};
      }else if(this.time>p.seconds+1.5)return this.fail('杯底尚未落稳，机器人继续持杯并停止放置。');
    }
    const orientationError=rig.gripSocket.getWorldQuaternion(new Q()).angleTo(w.robot.getWorldQuaternion(new Q()).multiply(p.orientation));
    if(t===1&&error<=.003&&orientationError<.02&&(!p.event||this.eventFired))this.nextPhase();
    else if(this.time>p.seconds+2)return this.fail('手臂未能到达有效取放姿态，已停止动作。');
    return {done:this.done,distance:0,error:this.error};
  }
}
