/* Presentation-only kinematics. These functions have no access to the rules engine. */
export const GRAVITY=11.8;
export const smooth=t=>t*t*(3-2*t);
export function ballistic(start,end,apex=3.1){const vy=Math.sqrt(2*GRAVITY*(Math.max(apex,start.y+.2)-start.y));const time=(vy+Math.sqrt(vy*vy+2*GRAVITY*(start.y-end.y)))/GRAVITY;return {time,velocity:{x:(end.x-start.x)/time,y:vy,z:(end.z-start.z)/time},at(t){t=Math.min(time,t);return {x:start.x+(end.x-start.x)*t/time,y:start.y+vy*t-.5*GRAVITY*t*t,z:start.z+(end.z-start.z)*t/time};}};}
export function stepBody(body,dt,floor){body.v.y-=GRAVITY*dt;for(const k of ['x','y','z'])body.p[k]+=body.v[k]*dt;body.rotation+=body.spin*dt;if(body.p.y<floor){body.p.y=floor;body.v.y=-body.v.y*.26;body.v.x*=.62;body.v.z*=.62;body.spin*=.6;if(Math.abs(body.v.y)<.1)body.v.y=0;}body.v.x*=Math.exp(-1.25*dt);body.v.z*=Math.exp(-1.25*dt);body.spin*=Math.exp(-.7*dt);}
// A* on quarter-cell lattice; circular clearances around every stationary unit.
export function avoidancePath(start,end,obstacles,radius=.61){
 const clear=(x,z)=>obstacles.every(p=>Math.hypot(x-p.x,z-p.z)>=radius);
 const segment=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.10);for(let i=0;i<=n;i++)if(!clear(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;return true;};
 if(segment(start,end))return [start,end];
 const scale=4,toCell=p=>({x:Math.round(p.x*scale),z:Math.round(p.z*scale)}),a=toCell(start),b=toCell(end),key=p=>p.x+','+p.z,open=[{...a,g:0,f:0}],best=new Map([[key(a),0]]),parent=new Map(),nodes=new Map();nodes.set(key(a),a);let found=false,loops=0;
 while(open.length&&loops++<7000){open.sort((a,b)=>a.f-b.f);const cur=open.shift(),ck=key(cur);if(cur.x===b.x&&cur.z===b.z){found=true;break;}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const next={x:cur.x+dx,z:cur.z+dz};if(Math.abs(next.x)>22||Math.abs(next.z)>24)continue;const np={x:next.x/scale,z:next.z/scale},cp={x:cur.x/scale,z:cur.z/scale};if(!clear(np.x,np.z)||!segment(cp,np))continue;const k=key(next),g=cur.g+Math.hypot(dx,dz);if(g>=(best.get(k)??Infinity))continue;best.set(k,g);parent.set(k,ck);nodes.set(k,next);open.push({...next,g,f:g+Math.hypot(next.x-b.x,next.z-b.z)});}}
 if(!found)return null;
 const result=[end];let k=key(b);while(parent.has(k)){k=parent.get(k);const p=nodes.get(k);result.push({x:p.x/scale,z:p.z/scale});}result.reverse();result[0]=start;
 const compact=[result[0]];let i=0;while(i<result.length-1){let j=result.length-1;while(j>i+1&&!segment(result[i],result[j]))j--;compact.push(result[j]);i=j;}return compact;
}
export function samplePath(path,t){const lengths=[];let total=0;for(let i=1;i<path.length;i++){const d=Math.hypot(path[i].x-path[i-1].x,path[i].z-path[i-1].z);lengths.push(d);total+=d;}let dist=Math.min(1,t)*total;for(let i=0;i<lengths.length;i++){if(dist<=lengths[i]||i===lengths.length-1){const q=lengths[i]?dist/lengths[i]:1,a=path[i],b=path[i+1];return {x:a.x+(b.x-a.x)*q,z:a.z+(b.z-a.z)*q,angle:Math.atan2(b.x-a.x,b.z-a.z)};}dist-=lengths[i];}return {...path[0],angle:0};}
