import {riverX,terrainY,clamp,WORLD} from './world.js';

export class Flight {
  constructor(gates){this.gates=gates;this.reset();}
  reset(){
    this.pos={x:riverX(310),y:16.0,z:310};this.heading=Math.atan((riverX(311)-riverX(309))/2);
    this.pitch=0;this.bank=0;this.speed=14;this.throttle=.64;this.elapsed=0;this.distance=0;this.nextGate=0;this.mode='ready';this.exploring=false;this.reason='';this.grace=0;
    this.gates.forEach(g=>g.passed=false);this.checkpoint={...this.pos,heading:this.heading};
  }
  start(){if(this.mode==='ready'){this.mode='flying';return true;}return false;}
  resume(){if(this.mode==='paused'){this.mode='flying';return true;}return false;}
  pause(){if(this.mode==='flying'){this.mode='paused';return true;}return false;}
  retry(){
    const c=this.checkpoint;this.pos={x:c.x,y:c.y,z:c.z};this.heading=c.heading;this.pitch=0;this.bank=0;this.speed=14;this.throttle=.64;this.grace=1.8;this.mode='flying';this.reason='';
  }
  explore(){this.exploring=true;this.mode='flying';}
  step(dt,input,collision){
    if(this.mode!=='flying')return null;
    dt=clamp(dt,0,.05);this.elapsed+=dt;this.grace=Math.max(0,this.grace-dt);
    this.throttle=clamp(this.throttle+(input.throttle||0)*dt*.27,.15,1);
    const smooth=(a,b,s)=>a+(b-a)*(1-Math.exp(-s*dt));
    const turn=clamp(input.turn||0,-1,1),pitchInput=clamp(input.pitch||0,-1,1);
    this.bank=smooth(this.bank,turn*.57,3.2);this.pitch=smooth(this.pitch,pitchInput*.30,2.5);
    this.heading+=this.bank*dt*.57;
    this.speed=smooth(this.speed,9+this.throttle*12-this.pitch*5,.72);
    const previous={...this.pos},horizontal=this.speed*Math.cos(this.pitch);
    this.pos.x-=Math.sin(this.heading)*horizontal*dt;
    this.pos.z-=Math.cos(this.heading)*horizontal*dt;
    this.pos.y+=Math.sin(this.pitch)*this.speed*dt;
    this.distance+=this.speed*dt;
    if(Math.abs(this.pos.x)>WORLD.halfWidth-45||this.pos.z<WORLD.minZ+35||this.pos.z>WORLD.maxZ-35||this.pos.y>430){
      this.mode='crashed';this.reason='已飞出这片山林';return {type:'crash',reason:this.reason};
    }
    const hit=this.grace<=0?collision(this.pos,this.heading,this.bank,this.pitch):null;
    if(hit){this.mode='crashed';this.reason='碰到了'+hit;return {type:'crash',reason:this.reason};}
    const g=this.gates[this.nextGate];
    if(g&&!this.exploring){
      const cos=Math.cos(g.heading),sin=Math.sin(g.heading);
      const oldZ=(previous.x-g.x)*sin+(previous.z-g.z)*cos,newZ=(this.pos.x-g.x)*sin+(this.pos.z-g.z)*cos;
      if(oldZ>=0&&newZ<0){
        const t=oldZ/(oldZ-newZ),x=previous.x+(this.pos.x-previous.x)*t,z=previous.z+(this.pos.z-previous.z)*t,y=previous.y+(this.pos.y-previous.y)*t;
        const localX=(x-g.x)*cos-(z-g.z)*sin;
        const span=6.1*Math.abs(Math.cos(this.heading-g.heading)*Math.cos(this.bank));
        if(Math.abs(localX)+span<g.halfWidth-.6&&y-.7>g.base+.2&&y+1.7<g.base+g.top-.15){
          g.passed=true;this.nextGate++;
          const next=this.gates[this.nextGate];
          if(next){const zz=next.z+75;this.checkpoint={x:riverX(zz),y:16,z:zz,heading:Math.atan((riverX(zz+1)-riverX(zz-1))/2)};}
          else this.checkpoint={...this.pos,heading:this.heading};
          if(this.nextGate===this.gates.length){this.mode='complete';return {type:'complete'};}
          return {type:'gate',index:g.index,name:g.name};
        }
      }
      // Missing a gate cannot leave the player with an unreachable objective.
      if(this.pos.z<g.z-66){this.mode='crashed';this.reason='错过了「'+g.name+'」';return {type:'missed',reason:this.reason};}
    }
    return null;
  }
  get altitude(){return Math.max(0,this.pos.y-Math.max(terrainY(this.pos.x,this.pos.z),-.68));}
  snapshot(){return {status:this.mode,gate:this.nextGate,totalGates:this.gates.length,altitude:Math.round(this.altitude),speedKmh:Math.round(this.speed*3.6),elapsedSeconds:Math.round(this.elapsed),exploring:this.exploring};}
}
