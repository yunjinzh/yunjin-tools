const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/dist/index.html','utf8');
const source=html.split('<script>')[1].split('</script>')[0];
const elements=new Map(),storage=new Map(),timers=new Map();
let timerId=0;
function element(id){
 if(elements.has(id))return elements.get(id);
 const classes=new Set();
 const el={id,innerHTML:'',textContent:'',value:'',dataset:{},children:[],open:false,style:{setProperty(){}},
 classList:{add(...xs){xs.forEach(x=>classes.add(x))},remove(...xs){xs.forEach(x=>classes.delete(x))},toggle(x,b){const v=b??!classes.has(x);v?classes.add(x):classes.delete(x);return v}},
 setAttribute(){},focus(){},select(){},setSelectionRange(){},showModal(){this.open=true},close(){this.open=false},click(){this.onclick?.()},remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)},appendChild(el){this.children.push(el);el.parent=this},getBoundingClientRect(){return {x:0,y:0,left:0,width:100,height:100}}};
 elements.set(id,el);return el;
}
const document={getElementById:element,querySelector:s=>s==='dialog[open]'?null:element(s),querySelectorAll:()=>[],addEventListener(){},activeElement:{dataset:{}},createElement:()=>element('created'+elements.size),body:element('body')};
const ctx=vm.createContext({document,window:{scrollTo(){},addEventListener(){},innerWidth:1280},requestAnimationFrame:()=>1,cancelAnimationFrame(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>({matches:true}),setTimeout:fn=>{const id=++timerId;timers.set(id,fn);return id},clearTimeout:id=>timers.delete(id),console,URL,Blob,AbortController});
vm.runInContext(source,ctx);
const run=s=>vm.runInContext(s,ctx);
function flush(){let limit=100;while(timers.size&&limit--){const [id,fn]=timers.entries().next().value;timers.delete(id);fn()}assert.ok(limit>0,'Timers settled')}
function reset(){timers.clear();run("state=fresh();state.motion=false;state.sound=false;state.autoVoice=false;startLevel(0,0,'pair')")}
function pair(id){run(`selectTile('${id}-en');selectTile('${id}-zh')`)}
function finish(){let limit=7;while(run('game.tiles.length')&&limit--){const id=run("game.tiles.find(t=>t.side==='zh').wid");pair(id);if(run("game.mode==='spell'"))run(`submitSpelling(W.get('${id}').en)`);flush()}assert.ok(run('game.completed'),'Board completed')}
let tests=0;
function test(name,fn){reset();fn();tests++;console.log('PASS',name)}

test('All 399 textbook entries occur exactly once in 69 ordered groups',()=>{
 const words=JSON.parse(run('JSON.stringify(WORDS)'));
 assert.equal(words.length,399);assert.equal(new Set(words.map(w=>w.en)).size,391);
 assert.deepEqual(Array.from({length:10},(_,u)=>run(`unitWords(${u}).length`)),[24,39,29,36,36,59,49,40,46,41]);
 const groups=run('JSON.stringify(UNITS.flatMap((_,u)=>Array.from({length:lessons(u)},(_,l)=>levelWords(u,l))))');
 const parsed=JSON.parse(groups);assert.equal(parsed.length,69);assert.deepEqual(parsed.flat(),words);
});
test('Masked clues are unambiguous for differing spellings in every level',()=>{
 assert.equal(run(`UNITS.every((_,u)=>Array.from({length:lessons(u)},(_,l)=>{const ws=levelWords(u,l),ms=maskWords(ws);return ws.every(a=>ws.every(b=>norm(a.en)===norm(b.en)||norm(ms[a.id])!==norm(ms[b.id])))}).every(Boolean))`),true);
});
test('Same-side selection and unmatching tiles cannot remove words',()=>{
 run("selectTile('w001-en');selectTile('w002-en')");assert.equal(run('game.errors'),0);
 run("selectTile('w001-zh')");assert.equal(run('game.errors'),1);assert.equal(run('game.tiles.length'),12);assert.equal(run('game.score'),0);flush();assert.equal(run('game.locked'),false);
});
test('Six clean pairs finish once, award 15 seeds and never imply spelling',()=>{
 finish();assert.equal(run('game.score'),900);assert.equal(run('game.result.stars'),3);assert.equal(run('state.seeds'),15);assert.equal(run('matched()'),6);assert.equal(run('spelled()'),0);
 run('finishLevel()');assert.equal(run('state.seeds'),15);
 run("startLevel(0,0,'pair')");finish();assert.equal(run('state.seeds'),15);
});
test('Hint keeps the board intact; a later three-star improvement awards only five more',()=>{
 run('hintPair()');assert.equal(run('game.tiles.length'),12);finish();assert.equal(run('game.result.stars'),2);assert.equal(run('state.seeds'),10);
 run("startLevel(0,0,'pair')");finish();assert.equal(run('state.seeds'),15);
});
test('Spelling mode requires full input and counts each clean spelling once',()=>{
 run("startLevel(0,0,'spell')");pair('w001');assert.equal(run('game.tiles.length'),12);assert.ok(run('game.pending'));
 run("submitSpelling(' AMAZING ') ; submitSpelling('amazing')");flush();assert.equal(run("rec('w001').spells"),1);
 finish();assert.equal(run('game.score'),1200);assert.equal(run('spelled()'),6);assert.equal(run('state.seeds'),15);
});
test('A spelling error remains a correction after closing and reopening',()=>{
 run("startLevel(0,0,'spell')");pair('w001');run("submitSpelling('amazng');cancelSpelling()");pair('w001');run("submitSpelling('amazing')");flush();assert.equal(run("rec('w001').spells"),0);assert.equal(run("rec('w001').matches"),1);assert.equal(run('game.errors'),1);
});
test('A visible answer cannot be submitted, and its help survives reopening',()=>{
 run("startLevel(0,0,'spell')");pair('w001');element('spellHint').click();run("submitSpelling('amazing')");flush();assert.equal(run('game.tiles.length'),12);
 run('cancelSpelling()');pair('w001');run("submitSpelling('amazing')");flush();assert.equal(run("rec('w001').spells"),0);assert.equal(run('game.tiles.length'),10);
});
test('Identical English spellings can cross-pair without leaving an orphan',()=>{
 const ids=JSON.parse(run(`JSON.stringify(WORDS.filter(w=>w.en==='set').map(w=>w.id))`));assert.equal(ids.length,2);
 run(`startLevel(0,0,'pair',WORDS.filter(w=>w.en==='set'));selectTile('${ids[0]}-en');selectTile('${ids[1]}-zh')`);flush();
 run(`selectTile('${ids[1]}-en');selectTile('${ids[0]}-zh')`);flush();assert.equal(run('game.completed'),true);assert.equal(run('matched()'),2);assert.equal(run('game.errors'),0);assert.equal(run('state.seeds'),0);
});
test('Stale animation and spelling callbacks cannot affect a newly selected level',()=>{
 pair('w001');const stale=[...timers.values()];run("startLevel(1,0,'spell')");stale.forEach(f=>f());assert.equal(run('game.cleared.size'),0);assert.equal(run('matched()'),0);
 const id=run('game.words[0].id');pair(id);run(`submitSpelling(W.get('${id}').en)`);const late=[...timers.values()];run("startLevel(2,0,'pair')");late.forEach(f=>f());assert.equal(run('game.cleared.size'),0);assert.equal(run('spelled()'),0);
});
test('Targeted practice updates word history without completing unrelated campaign levels',()=>{
 run("startLevel(0,0,'spell',[WORDS[398]])");finish();assert.equal(run('state.seeds'),0);assert.equal(run('Object.keys(state.levels).length'),0);assert.equal(run("rec('w399').spells"),1);
});
test('Every mode can complete all textbook levels, including short final groups',()=>{
 for(const mode of ['pair','spell'])for(let u=0;u<10;u++)for(let l=0;l<run(`lessons(${u})`);l++){run(`startLevel(${u},${l},'${mode}')`);finish()}
 assert.equal(run('Object.keys(state.levels).length'),138);assert.equal(run('matched()'),399);assert.equal(run('spelled()'),399);assert.equal(run('state.earned'),2070);run('validate(state)');
});
test('Storage round-trips and invalid imports are rejected',()=>{
 finish();const saved=storage.get('word-pop-garden-v1');assert.equal(JSON.parse(saved).seeds,15);run(`validate(JSON.parse(${JSON.stringify(saved)}))`);
 for(const expression of ["({...fresh(),seeds:-1})","({...fresh(),unit:10})","({...fresh(),levels:{'pair:0:99':{stars:3,best:100}}})","({...fresh(),words:{invented:{matches:1,spells:0,errors:0,last:0}}})"]){assert.throws(()=>run(`validate(${expression})`))}
 assert.equal(run("norm('look   after')==='look after' && norm('full—time')==='full-time' && norm('lookafter')!==norm('look after')"),true);
});
test('Navigation renders all views and preserves an unfinished board',()=>{
 pair('w001');flush();for(const v of ['garden','words','record','play'])run(`go('${v}')`);assert.equal(run('game.tiles.length'),10);assert.equal(run('game.score'),100);
});
test('New mode opens ready; navigation pauses it and retains the board',()=>{
 run("go('fall');makeFall(0,0);render();resumeFall();dropFall();go('garden')");assert.equal(run('fall.paused'),true);assert.equal(run('fall.fill()'),1);run("go('fall')");assert.equal(run('fall.paused'),true);assert.equal(run('fall.fill()'),1);
});
test('Changing falling units preserves the earlier matching game unit',()=>{
 run("startLevel(2,0,'pair');go('fall');switchFall(5,0);go('play')");assert.equal(run('state.unit'),2);assert.equal(run('game.unit'),2);assert.equal(run('fall.unit'),5);
});
test('Falling seed tiers pay only improvements and never count as spelling',()=>{
 run("makeFall(0,0);fall.start();fall.cleared=12;fall.score=500;fall.clearedWords={w001:12};fall.end('full');storeFallRound();storeFallRound()");assert.equal(run('state.seeds'),2);assert.equal(run('spelled()'),0);assert.equal(run('matched()'),0);
 run("makeFall(0,0);fall.start();fall.cleared=12;fall.end('full');storeFallRound()");assert.equal(run('state.seeds'),2);
 run("makeFall(0,0);fall.start();fall.cleared=18;fall.end('full');storeFallRound()");assert.equal(run('state.seeds'),3);run('validate(state)');
 run("makeFall(0,0);fall.start();fall.cleared=999;fall.end('full');storeFallRound()");assert.equal(run('state.seeds'),15);
});
test('Falling imports validate and final recall opens the real spelling exercise',()=>{
 run("go('fall');makeFall(0,0);fall.start();fall.end('full');storeFallRound();showFallResult()");element('fallPractice').click();assert.equal(run('view'),'play');assert.equal(run('game.mode'),'spell');assert.equal(run('game.practice'),true);assert.equal(run('game.words.length'),1);
 assert.throws(()=>run("validate({...fresh(),falling:{best:{'9:80':{score:0,cleared:0,chain:0,seconds:0,rounds:0,tier:0}},words:{}}})"));
});
test('Short final groups add earlier same-unit review words to keep falling play viable',()=>{
 run('makeFall(6,lessons(6)-1)');assert.equal(run('fall.pool.length'),3);assert.equal(run('fall.pool.every(w=>w.unit===6)'),true);assert.equal(run('fall.pool.some(w=>w.id===unitWords(6).at(-1).id)'),true);
});
console.log(`${tests} integration and legacy logic checks passed. DOM is simulated; layout, audio, and real browser interaction are not covered.`);
