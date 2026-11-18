const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {compileUnits,readUnits,bundle}=require('../scripts/build-content.cjs');
const units=readUnits(),catalog=compileUnits(units);
const appCode=fs.readFileSync('dist/app.js','utf8');
function runner(saved=null,content=catalog){
 const elements=new Map(),events={};const element=id=>elements.get(id)||elements.set(id,{innerHTML:'',textContent:'',classList:{add(){},remove(){}},close(){},showModal(){},focus(){},click(){}}).get(id);
 const stored=saved?{'yuwen-adventure-v1':JSON.stringify(saved)}:{};let download;
 const sandbox={console,Intl,Date,Math,JSON,Set,Array,Object,Number,String,Boolean,setTimeout:()=>0,clearTimeout(){},matchMedia:()=>({matches:true}),localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},document:{getElementById:element,querySelector:()=>element('focused'),addEventListener:(name,fn)=>events[name]=fn,createElement:()=>element('download')},window:{scrollTo(){}},URL:{createObjectURL:b=>{download=b;return 'blob:test'},revokeObjectURL(){}},Blob};
 vm.createContext(sandbox);vm.runInContext(bundle(content)+'\n'+appCode,sandbox);
 return {run:js=>vm.runInContext(js,sandbox),html:()=>element('app').innerHTML,stored,download:()=>download,click:(action,extra={})=>events.click({target:{closest:()=>({dataset:{action,...extra},disabled:false})}}),change:(action,value)=>events.change({target:{dataset:{action},value:String(value)}})};
}
function completeLevel(r,id){r.run(`start(${JSON.stringify(id)}); for(let i=0;i<session.qs.length;i++){session.index=i;session.solved=false;session.attempts=0;session.hinted=false;const a=currentQ().answer;session.selected=Array.isArray(a)?[...a]:[a];submit();}finish();`);}
function validateCatalog(){
 assert.deepEqual(catalog.stats,{unitCount:4,levelCount:16,questionCount:115,maxStars:48,maxXP:1150});
 assert.deepEqual(units.map(u=>u.questions.length),[32,22,29,32]);
 assert.equal(new Set(catalog.questions.map(q=>q.id)).size,115);
 for(const u of units.slice(2))assert.ok(u.questions.every(q=>q.sourceRef));
 const answer=id=>{const q=catalog.questions.find(q=>q.id===id);return Array.isArray(q.answer)?q.answer.map(i=>q.options[i]).join(''):q.options[q.answer]};
 assert.equal(answer('u1-1-11'),'mèn');
 assert.equal(answer('u2-4-4'),'而疑人之所不疑');
 assert.equal(answer('u3-1-xiangfu'),'xiáng');
 assert.equal(answer('u3-3-niupeng'),'棚');
 assert.equal(answer('u3-4-autumn-months'),'十月还有小阳春');
 assert.equal(answer('u3-4-autumn-rain'),'一场秋雨一场寒，十场秋雨要穿棉');
 assert.equal(answer('u3-4-mujiangyin'),'一道残阳铺水中');
 assert.equal(answer('u3-4-tixilinbi'),'远近高低各不同');
 assert.equal(answer('u4-1-jingdi'),'jìng');assert.equal(answer('u4-1-ganjin'),'jìn');
 assert.equal(answer('u4-2-shaonv'),'小女儿');assert.equal(answer('u4-2-gu'),'因此');
 assert.equal(answer('u4-4-change'),'碧海青天夜夜心');
 assert.equal(answer('u4-4-jingwei-sea'),'女娃游于东海');
 assert.equal(answer('u4-4-jingwei-stone'),'衔西山之木石');
 for(const mutator of [u=>u.push(structuredClone(u[0])),u=>u[0].questions[0].answer=99,u=>u[0].questions[0].level='missing',u=>u[0].questions.push(structuredClone(u[0].questions[0]))]){const invalid=structuredClone(units);mutator(invalid);assert.throws(()=>compileUnits(invalid));}
}
async function main(){
 validateCatalog();
 const r=runner();assert.match(r.html(),/16 个关卡 · 115 个小任务/);
 r.click('unit',{unit:'3'});assert.equal(r.run('unit'),3);assert.match(r.html(),/观察秘境/);assert.match(r.html(),/曲径听音/);
 r.click('start',{level:'u3-1'});r.click('select',{index:'1'});r.click('submit');assert.equal(r.run('session.solved'),false);assert.equal(r.run('state.mistakes.length'),1);assert.equal(r.run('xp()'),0);
 r.click('select',{index:'0'});r.click('submit');assert.equal(r.run('session.solved'),true);assert.equal(r.run('xp()'),5);r.click('submit');assert.equal(r.run('xp()'),5);
 r.run('start(null,true,3);session.selected=[0];submit();finish()');assert.equal(r.run('state.mistakes.length'),0);assert.equal(r.run('state.reviewed'),1);assert.equal(r.run('xp()'),10);
 r.run('start("u3-1");session.selected=[0];submit()');assert.equal(r.run('session.gain'),0);
 r.run('state=fresh(); start("u4-2");hint();session.selected=[0];submit()');assert.equal(r.run('xp()'),5);assert.equal(r.run('state.mistakes.length'),1);
 r.run('state=fresh();start("u1-3");session.index=6;session.selected=[1,4];submit()');assert.equal(r.run('session.solved'),false);r.run('session.selected=[5,1,4];submit()');assert.equal(r.run('session.solved'),true);
 r.run('state=fresh();start("u4-4");session.selected=[0,1,2];submit()');assert.equal(r.run('session.solved'),false);r.run('session.selected=[1,2,0];submit()');assert.equal(r.run('session.solved'),true);
 r.run('state=fresh();state.mistakes=["u1-1-1","u3-1-quzhe","u4-1-suomen"];page="review";render()');r.change('review-filter',3);assert.match(r.html(),/1 个待巩固知识/);assert.doesNotMatch(r.html(),/“锁门”中的/);r.click('review-start',{scope:'3'});assert.equal(r.run('session.qs.length'),1);assert.equal(r.run('currentQ().id'),'u3-1-quzhe');
 r.run('state=fresh()');for(const l of catalog.levels)completeLevel(r,l.id);
 assert.equal(r.run('xp()'),1150);assert.equal(r.run('stars()'),48);assert.equal(r.run('completedCount()'),115);assert.equal(r.run('state.achievements.allIslands'),true);assert.equal(r.run('dailyCount()'),115);assert.equal(r.run('state.dailyClaimed[today()]'),true);
 r.run('page="teacher";render()');r.change('teacher-filter',4);assert.match(r.html(),/4 · 神话听音阁/);assert.doesNotMatch(r.html(),/<td>1 · 听风辨音/);
 r.click('export');const report=await r.download().text();assert.match(report,/星星：48 \/ 48/);assert.match(report,/已完成：115 \/ 115/);assert.match(report,/4 · 神话藏书阁/);
 const reload=runner(JSON.parse(r.stored['yuwen-adventure-v1']));assert.equal(reload.run('unit'),4);assert.equal(reload.run('xp()'),1150);
 const old={version:1,best:{'u1-1-1':10},mistakes:['u2-4-4'],completed:Object.fromEntries(catalog.levels.filter(l=>l.unit<=2).map(l=>[l.id,3])),daily:{},dailyClaimed:{},reviewed:2,retries:1,sound:false,unit:2};
 const migrated=runner(old);assert.equal(migrated.run('xp()'),10);assert.equal(migrated.run('stars()'),24);assert.equal(migrated.run('state.mistakes[0]'),'u2-4-4');assert.equal(migrated.run('badgeData().find(b=>b.name==="全岛探索家").earned'),true);
 const partial=runner({...old,completed:{'u1-1':2}});assert.equal(partial.run('state.achievements.allIslands'),undefined);
 // Simulate a future unit with three levels, without editing the application or adding production sample questions.
 const future=structuredClone(units);const extra=structuredClone(units[2]);Object.assign(extra,{id:5,label:'第五单元',title:'扩展测试岛'});extra.levels=extra.levels.slice(0,3).map((l,i)=>({...l,id:`u5-${i+1}`,unit:5}));extra.questions=extra.levels.map((l,i)=>({...structuredClone(units[2].questions[i]),id:`u5-q${i+1}`,level:l.id}));future.push(extra);
 const futureCatalog=compileUnits(future);assert.equal(futureCatalog.stats.maxStars,57);assert.equal(futureCatalog.stats.questionCount,118);
 const extended=runner(JSON.parse(r.stored['yuwen-adventure-v1']),futureCatalog);extended.click('unit',{unit:'5'});assert.match(extended.html(),/第五单元/);assert.match(extended.html(),/已探索 0 \/ 3/);assert.match(extended.html(),/19 个关卡 · 118 个小任务/);assert.equal(extended.run('stars()'),48);assert.equal(extended.run('state.achievements.allIslands'),true);
 for(const l of extra.levels)completeLevel(extended,l.id);extended.run('page="home";render()');assert.match(extended.html(),/已探索 3 \/ 3/);assert.equal(extended.run('stars()'),57);
 const offline=fs.readFileSync('dist/offline.html','utf8');assert.ok(!/<script src=|<link rel="stylesheet"|@import/.test(offline));const scripts=[...offline.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);assert.equal(scripts.length,2);for(const script of scripts)new vm.Script(script);
 console.log('PASS: content validation and corrected answers; 115 tasks; retries/hints/review; 16-level rewards; per-unit filters and export; old progress and earned-badge migration; reload; a future three-level fifth unit; offline bundle.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
