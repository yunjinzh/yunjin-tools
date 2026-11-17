const assert=require('node:assert/strict');
const Engine=require('./src/falling-engine.js');
const words=require('./words.json');
const pool=words.slice(0,6);
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS',name)}
function make(){return new Engine(pool,{motion:false,random:()=>.1})}
function tile(g,key,wid=pool[key].id){return {id:++g.serial,key:g.key(pool[key].en),wid}}
function settle(g){let n=30;while(g.phase==='clearing'&&n--)g.tick(100);assert.ok(n>0,'Clear chain terminates')}
test('No timer starts before play, and previews include duplicate words',()=>{
 const g=make();g.tick(100);assert.equal(g.elapsed,0);assert.equal(g.queue.length,4);assert.equal(new Set(g.queue.slice(0,3).map(w=>w.en)).size,1);
 g.start();assert.equal(g.phase,'falling');assert.ok(g.active);assert.equal(g.queue.length,4);
});
test('Continuous gravity lands automatically and replenishes the queue',()=>{
 const g=make();g.start();const id=g.active.id;for(let i=0;i<46;i++)g.tick(100);
 assert.equal(g.fill(),1);assert.ok(g.active.id>id);assert.equal(g.queue.length,4);
});
test('Three identical cards automatically clear, open space and score once',()=>{
 const g=make();g.start();g.drop();g.drop();assert.equal(g.fill(),2);g.drop();assert.equal(g.phase,'clearing');settle(g);
 assert.equal(g.fill(),0);assert.equal(g.cleared,3);assert.equal(g.score,240);assert.equal(g.clearedWords[pool[0].id],3);assert.ok(g.active);
});
test('L-shaped connections count; diagonal-only cards and pairs do not',()=>{
 const g=make();g.grid[7][0]=tile(g,0);g.grid[6][0]=tile(g,0);assert.equal(g.groups().length,0);g.grid[7][1]=tile(g,0);assert.equal(g.groups()[0].length,3);
 const diagonal=make();for(let i=0;i<3;i++)diagonal.grid[7-i][i]=tile(diagonal,0);assert.equal(diagonal.groups().length,0);
});
test('Gravity after one group clears triggers a second automatic chain',()=>{
 const g=make();for(const r of [5,6,7])g.grid[r][1]=tile(g,0);g.grid[4][1]=tile(g,1);g.grid[7][0]=tile(g,1);g.grid[7][2]=tile(g,1);
 g.phase='falling';g.resolve();settle(g);assert.equal(g.bestChain,2);assert.equal(g.cleared,6);assert.equal(g.fill(),0);assert.equal(g.score,420);
});
test('Movement cannot cross through occupied stacks',()=>{
 const g=make();for(let r=3;r<8;r++)g.grid[r][0]=tile(g,r%2);g.start();g.active.col=1;g.active.y=3;
 assert.equal(g.moveTo(0),false);assert.equal(g.active.col,1);assert.equal(g.moveTo(2),true);assert.equal(g.moveTo(4),false);
});
test('Pause freezes falling, time and the ceiling countdown',()=>{
 const g=make();g.start();g.danger=6000;g.paused=true;const y=g.active.y;for(let i=0;i<80;i++)g.tick(100);
 assert.equal(g.elapsed,0);assert.equal(g.danger,6000);assert.equal(g.active.y,y);g.drop();assert.equal(g.fill(),0);
});
test('A full container ends immediately after checking possible matches',()=>{
 const g=make();for(let r=0;r<8;r++)for(let c=0;c<4;c++)g.grid[r][c]=tile(g,(r+c)%2);
 g.phase='falling';g.resolve();assert.equal(g.phase,'over');assert.equal(g.reason,'full');const time=g.elapsed;g.tick(100);assert.equal(g.elapsed,time);
});
test('A full container with a match is cleared before defeat is considered',()=>{
 const g=make();for(let r=0;r<8;r++)for(let c=0;c<4;c++)g.grid[r][c]=tile(g,(r+c)%2);
 for(let c=0;c<3;c++)g.grid[0][c]=tile(g,2);g.phase='falling';g.resolve();assert.equal(g.phase,'clearing');settle(g);assert.notEqual(g.phase,'over');assert.ok(g.cleared>=3);
});
test('Ceiling overflow gives six seconds and ends once; clearing it cancels danger',()=>{
 const g=make();for(let r=0;r<8;r++)g.grid[r][0]=tile(g,r%2);g.phase='falling';g.checkOverflow();assert.equal(g.danger,6000);
 for(let i=0;i<59;i++)g.tick(100);assert.notEqual(g.phase,'over');g.tick(100);assert.equal(g.reason,'ceiling');g.end('full');assert.equal(g.takeEvents().filter(e=>e.type==='over').length,1);
 const rescue=make();for(let r=0;r<8;r++)rescue.grid[r][0]=tile(rescue,r%2);rescue.checkOverflow();rescue.grid[0][0]=null;rescue.compact();rescue.checkOverflow();assert.equal(rescue.danger,0);
});
test('Every textbook group supplies only its own vocabulary, including duplicate spellings',()=>{
 let groups=0;for(let u=0;u<10;u++){const unit=words.filter(w=>w.unit===u);for(let i=0;i<unit.length;i+=6){const group=unit.slice(i,i+6),g=new Engine(group);groups++;for(let n=0;n<75;n++){const drawn=g.draw();assert.ok(group.some(w=>w.id===drawn.id))}assert.equal(g.pool.length,new Set(group.map(w=>g.key(w.en))).size)}}assert.equal(groups,69);
});
test('Repeated varied moves keep every tile inside the board and compact after settling',()=>{
 let rand=7;const rng=()=>((rand=(rand*16807)%2147483647)/2147483647);
 for(let trial=0;trial<10;trial++){const g=new Engine(pool,{motion:false,random:rng});g.start();for(let n=0;n<120&&g.phase!=='over';n++){g.moveTo(Math.floor(rng()*4));g.drop();settle(g);const ids=g.grid.flat().filter(Boolean).map(t=>t.id);assert.equal(ids.length,new Set(ids).size);for(let c=0;c<4;c++){let occupied=false;for(let r=0;r<8;r++){if(g.grid[r][c])occupied=true;else assert.equal(occupied,false)}}for(let j=0;j<5;j++)g.tick(100)}}
});
console.log(`${checks} falling-engine checks passed.`);
