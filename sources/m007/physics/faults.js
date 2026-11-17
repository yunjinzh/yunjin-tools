// Deliberate mutations are isolated from the production controller.
// Every injected action is recorded. Use ONLY in this simulated workbench.
export function injectFault(trial,type){
  const p=trial.payload.body.translation();trial.event('FAULT_INJECTED',{fault:type});
  if(type==='teleport')trial.payload.body.setTranslation({x:p.x+.30,y:p.y,z:p.z},true);
  else if(type==='penetration')trial.addObstacle({...p},{x:.025,y:.035,z:.025},'penetration-probe');
  else if(type==='impulse')trial.payload.body.applyImpulse({x:trial.mass*8,y:0,z:0},true);
  else if(type==='slip'){
    trial.mu=.005;trial.payload.collider.setFriction(.005);trial.fingers.forEach(f=>f.collider.setFriction(.005));
  }else if(type==='drop'){
    if(trial.grip)trial.world.removeImpulseJoint(trial.grip,true);trial.grip=null;
    trial.fingerJoints.forEach((j,i)=>j.configureMotorPosition(trial.fingers[i].side*trial.opening,10000,70));
  }else if(type==='barrier'){
    trial.addObstacle({x:p.x+.22,y:p.y,z:p.z},{x:.035,y:.28,z:.25},'carry-obstacle');
  }else throw Error('Unknown fault: '+type);
}
