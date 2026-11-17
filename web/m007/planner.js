export const BOUNDS={minX:-6.5,maxX:6.5,minZ:-4.4,maxZ:4.4};
export function blocked(x,z,obstacles,pad=.39){
  if(x<BOUNDS.minX||x>BOUNDS.maxX||z<BOUNDS.minZ||z>BOUNDS.maxZ)return true;
  return obstacles.some(o=>Math.abs(x-o.x)<o.w/2+pad && Math.abs(z-o.z)<o.d/2+pad);
}
export function findPath(start,end,obstacles){
  const cell=.25, minX=-6.5,minZ=-4.25,nx=53,nz=35;
  if(blocked(end.x,end.z,obstacles))return null;
  const grid=p=>[Math.max(0,Math.min(nx-1,Math.round((p.x-minX)/cell))),Math.max(0,Math.min(nz-1,Math.round((p.z-minZ)/cell)))];
  const world=(x,z)=>({x:minX+x*cell,z:minZ+z*cell});
  // Use a free grid cell with a clear segment to each precise endpoint. A
  // reachable counter-edge approach must not round into the counter itself.
  const endpoint=p=>{
    const [gx,gz]=grid(p),choices=[];
    for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){
      const x=gx+dx,z=gz+dz;if(x<0||x>=nx||z<0||z>=nz)continue;
      const w=world(x,z);if(blocked(w.x,w.z,obstacles))continue;
      const distance=Math.hypot(w.x-p.x,w.z-p.z),steps=Math.max(1,Math.ceil(distance/.025));let clear=true;
      for(let i=0;i<=steps;i++)if(blocked(p.x+(w.x-p.x)*i/steps,p.z+(w.z-p.z)*i/steps,obstacles)){clear=false;break;}
      if(clear)choices.push({x,z,distance});
    }choices.sort((a,b)=>a.distance-b.distance);return choices[0];
  };
  const a=endpoint(start),b=endpoint(end);if(!a||!b)return null;
  const [sx,sz]=[a.x,a.z],[ex,ez]=[b.x,b.z],key=(x,z)=>z*nx+x;
  const begin=key(sx,sz),goal=key(ex,ez),open=new Set([begin]),g=new Map([[begin,0]]),f=new Map([[begin,0]]),prev=new Map();
  const free=(x,z)=>x>=0&&x<nx&&z>=0&&z<nz&&!blocked(minX+x*cell,minZ+z*cell,obstacles);
  let iterations=0;
  while(open.size&&iterations++<6000){let current=-1,best=Infinity;for(const k of open){const v=f.get(k);if(v<best){best=v;current=k;}}
    if(current===goal){const pts=[{...end}];let c=current;while(c!==begin){pts.push(world(c%nx,Math.floor(c/nx)));c=prev.get(c);if(c===undefined)return null;}pts.push({...start});return pts.reverse();}
    open.delete(current);const x=current%nx,z=Math.floor(current/nx);
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const xx=x+dx,zz=z+dz;if(!free(xx,zz))continue;if(dx&&dz&&(!free(x+dx,z)||!free(x,z+dz)))continue;const k=key(xx,zz),cost=g.get(current)+Math.hypot(dx,dz);if(cost<(g.get(k)??Infinity)){prev.set(k,current);g.set(k,cost);f.set(k,cost+Math.hypot(ex-xx,ez-zz));open.add(k);}}
  }return null;
}
export function scoreRun({completed,total,collisions,blockedCount,elapsed,budget}){const completion=total?Math.round(completed/total*100):0;const safety=Math.min(40,collisions*10+blockedCount*3);const timePenalty=Math.min(20,Math.max(0,Math.floor((elapsed-budget)/5)));const score=Math.max(0,completion-safety-timePenalty);return {completion,safety,timePenalty,score,passed:completion===100&&score>=80};}
