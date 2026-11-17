/* Pure game rules: rows grow downward; a tile falls one cell at a time. */
class WordFallEngine {
  constructor(words, options={}) {
    this.cols=4; this.rows=8; this.random=options.random||Math.random;
    this.pool=[...new Map(words.map(w=>[this.key(w.en),w])).values()];
    if(!this.pool.length) throw Error('请选择有单词的关卡');
    this.speed=options.speed||4.5; this.clearDelay=options.motion===false?100:340;
    this.grid=Array.from({length:this.rows},()=>Array(this.cols).fill(null));
    this.phase='ready'; this.paused=false; this.active=null; this.queue=[]; this.bag=[];
    this.elapsed=0; this.score=0; this.cleared=0; this.bestChain=0; this.chain=0;
    this.danger=0; this.pending=[]; this.wait=0; this.serial=0; this.revision=0;
    this.events=[]; this.seen=new Set(); this.clearedWords={}; this.recorded=false;
    const first=this.pool[Math.floor(this.random()*this.pool.length)];
    this.bag=[first,first,first];
    this.refillQueue();
  }
  key(s){return String(s).trim().replace(/\s+/g,' ').toLowerCase()}
  shuffled(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  draw(){if(!this.bag.length)this.bag=this.shuffled(this.pool.flatMap(w=>[w,w,w]));return this.bag.shift()}
  refillQueue(){while(this.queue.length<4)this.queue.push(this.draw())}
  start(){if(this.phase!=='ready')return;this.phase='falling';this.spawn()}
  takeEvents(){return this.events.splice(0)}
  landing(col){for(let r=0;r<this.rows;r++)if(this.grid[r][col])return r-1;return this.rows-1}
  spawn(){
    if(this.phase==='over')return;
    const available=Array.from({length:this.cols},(_,c)=>c).filter(c=>this.landing(c)>=0);
    if(!available.length){this.end('full');return}
    const w=this.queue.shift();this.refillQueue();
    const col=available.reduce((a,b)=>Math.abs(a-1.5)<=Math.abs(b-1.5)?a:b);
    this.active={id:++this.serial,wid:w.id,key:this.key(w.en),col,y:-1};
    this.seen.add(w.id);this.revision++;this.events.push({type:'spawn',word:w});
  }
  moveTo(col){
    if(this.phase!=='falling'||this.paused||!this.active||!Number.isInteger(col)||col<0||col>=this.cols)return false;
    const from=this.active.col,step=col>=from?1:-1;
    for(let c=from;c!==col+step;c+=step)if(this.landing(c)<Math.max(0,Math.ceil(this.active.y)))return false;
    this.active.col=col;return true;
  }
  drop(){if(this.phase!=='falling'||this.paused||!this.active)return;this.active.y=this.landing(this.active.col);this.land()}
  tick(ms){
    if(this.paused||this.phase==='ready'||this.phase==='over')return;
    ms=Math.max(0,Math.min(ms,100));this.elapsed+=ms;
    if(this.phase==='clearing'){
      this.wait-=ms;if(this.wait<=0)this.commitClear();return;
    }
    if(this.danger>0){this.danger-=ms;if(this.danger<=0){this.end('ceiling');return}}
    if(this.active){
      this.active.y+=ms/1000*(this.rows/this.speed)*Math.min(1.5,1+Math.floor(this.elapsed/30000)*.08);
      if(this.active.y>=this.landing(this.active.col))this.land();
    }
  }
  land(){
    if(!this.active)return;
    const t=this.active,r=this.landing(t.col);
    if(r<0){this.end('full');return}
    this.grid[r][t.col]={id:t.id,wid:t.wid,key:t.key};this.active=null;this.revision++;
    this.events.push({type:'land'});this.chain=0;this.resolve();
  }
  groups(grid=this.grid){
    const visited=new Set(),out=[];
    for(let r=0;r<this.rows;r++)for(let c=0;c<this.cols;c++){
      const tile=grid[r][c],tag=r+':'+c;if(!tile||visited.has(tag))continue;
      const group=[],todo=[[r,c]];visited.add(tag);
      while(todo.length){const [y,x]=todo.pop();group.push([y,x]);for(const [yy,xx]of [[y-1,x],[y+1,x],[y,x-1],[y,x+1]]){
        const k=yy+':'+xx;if(yy>=0&&yy<this.rows&&xx>=0&&xx<this.cols&&!visited.has(k)&&grid[yy][xx]?.key===tile.key){visited.add(k);todo.push([yy,xx])}
      }}
      if(group.length>=3)out.push(group);
    }return out;
  }
  resolve(){
    const groups=this.groups();
    if(groups.length){this.chain++;this.bestChain=Math.max(this.bestChain,this.chain);this.pending=groups.flat();this.phase='clearing';this.wait=this.clearDelay;this.revision++;this.events.push({type:'match',chain:this.chain,count:this.pending.length});return}
    this.pending=[];this.phase='falling';this.checkOverflow();if(this.phase!=='over')this.spawn();
  }
  compact(){for(let c=0;c<this.cols;c++){const tiles=this.grid.map(row=>row[c]).filter(Boolean);for(let r=this.rows-1;r>=0;r--)this.grid[r][c]=tiles.pop()||null}}
  commitClear(){
    const removed=[];for(const [r,c]of this.pending){const t=this.grid[r][c];if(t){removed.push(t);this.grid[r][c]=null;this.clearedWords[t.wid]=(this.clearedWords[t.wid]||0)+1}}
    const gain=removed.length*30*this.chain;this.score+=gain;this.cleared+=removed.length;
    this.pending=[];this.compact();this.revision++;
    const empty=this.grid.every(row=>row.every(t=>!t));if(empty)this.score+=150;
    this.events.push({type:'clear',tiles:removed,chain:this.chain,gain:gain+(empty?150:0),empty});
    this.resolve();
  }
  checkOverflow(){
    if(this.grid.every(row=>row.every(Boolean))){this.end('full');return}
    if(this.grid[0].some(Boolean)){if(!this.danger){this.danger=6000;this.events.push({type:'danger'})}}
    else this.danger=0;
  }
  previewCount(){
    if(!this.active)return 0;const {col,key}=this.active,r=this.landing(col);if(r<0)return 0;
    const grid=this.grid.map(row=>row.slice());grid[r][col]={key};
    return this.groups(grid).find(g=>g.some(([y,x])=>y===r&&x===col))?.length||0;
  }
  fill(){return this.grid.reduce((n,row)=>n+row.filter(Boolean).length,0)}
  maxHeight(){return Math.max(...Array.from({length:this.cols},(_,c)=>this.rows-1-this.landing(c)))}
  end(reason){if(this.phase==='over')return;this.phase='over';this.active=null;this.reason=reason;this.events.push({type:'over',reason});this.revision++}
}
if(typeof module!=='undefined'&&module.exports)module.exports=WordFallEngine;
