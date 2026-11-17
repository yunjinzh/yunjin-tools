import WORDS from './words.json' with {type:'json'};
export {WORDS};
export const UNITS=[['导入','欢乐启航','启航乐园',0x8dc68a],['Unit 1','博物馆奇遇','记忆博物馆',0xd7b889],['Unit 2','森林画室','彩虹森林',0x7abca1],['Unit 3','救援小队','勇气救援站',0xdc9875],['Unit 4','奇妙列车','单词小车站',0x8bbcc1],['Unit 5','故事侦探社','故事侦探社',0xa7a5cd],['Unit 6','神兽山谷','精灵山谷',0xa5bc7b],['Unit 7','音乐花园','星光音乐会',0xd0a77d],['Unit 8','星空航站','星际发射场',0x93aecb],['Unit 9','旷野营地','冒险家营地',0xb6c085]];
export const MODES={voyage:['星光远航','✧'],hunt:['听音寻宝','⌕'],assembly:['字母工坊','Aa'],fill:['记忆补全','a_'],spell:['独立拼写','✎'],pop:['单词消消乐','▦'],story:['故事任务','▣'],challenge:['星光试炼','★'],review:['复习邮局','✉']};
export const ITEMS=[{id:'flowers',name:'彩虹花圃',cost:8,icon:'🌷'},{id:'bench',name:'森林长椅',cost:12,icon:'🪑'},{id:'mushrooms',name:'蘑菇小屋',cost:18,icon:'🍄'},{id:'pond',name:'星光池塘',cost:24,icon:'💧'},{id:'windmill',name:'糖果风车',cost:32,icon:'🌬'},{id:'tower',name:'友谊灯塔',cost:45,icon:'🗼'}];
export const norm=s=>String(s).trim().replace(/[‐‑–—]/g,'-').replace(/\s+/g,' ').toLowerCase();
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const unitWords=u=>WORDS.filter(w=>w.unit===u);
export const groups=u=>Math.ceil(unitWords(u).length/6);
export const groupWords=(u,g)=>unitWords(u).slice(g*6,g*6+6);
export const byId=new Map(WORDS.map(w=>[w.id,w]));
export const shuffle=(a,rnd=Math.random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
export const fresh=()=>({version:1,unit:0,group:0,gems:0,xp:0,petName:'小芽',petColor:'mint',items:[],words:{},quests:{},pop:{},journeys:{},discoveries:[],settings:{atmosphere:'day',sound:true,voice:true,speed:6,motion:true},created:Date.now()});
export const emptyRecord=()=>({seen:0,recognize:0,assembly:0,fill:0,attempts:0,independent:0,errors:0,reviewed:0,last:0,lastIndependent:0,due:0});
export const record=(s,id)=>s.words[id]||emptyRecord();
export function track(s,id,type,correct=true,assisted=false,now=Date.now()){
  if(!byId.has(id))throw Error('未知词条');const r=s.words[id]||(s.words[id]=emptyRecord());r.last=now;
  if(type==='seen'){r.seen++;return r}
  r.attempts++;
  if(!correct){r.errors++;r.due=now+10*60*1000;return r}
  if(['recognize','assembly','fill'].includes(type))r[type]++;
  if(type==='spell'&&!assisted){
    if(r.lastIndependent&&now-r.lastIndependent>=24*60*60*1000)r.reviewed++;
    r.independent++;r.lastIndependent=now;r.due=now+[1,3,7,14][Math.min(r.reviewed,3)]*86400000;
  }else if(!r.due||type==='spell')r.due=now+10*60*1000;
  return r;
}
export function complete(s,key,stars=1){
  const prev=s.quests[key]||{stars:0,runs:0};const gain=prev.stars===0?5:0,bonus=stars===3&&prev.stars<3?2:0;
  s.quests[key]={stars:Math.max(prev.stars,stars),runs:prev.runs+1};s.gems+=gain+bonus;s.xp+=prev.stars===0?20:2;return gain+bonus;
}
export function popReward(s,key,cleared,score,chain){const old=s.pop[key]||{tier:0,best:0,chain:0,cleared:0};const tier=Math.min(12,Math.floor(cleared/6)),gain=Math.max(0,tier-old.tier);s.pop[key]={tier:Math.max(tier,old.tier),best:Math.max(score,old.best),chain:Math.max(chain,old.chain),cleared:Math.max(cleared,old.cleared)};s.gems+=gain;return gain}
export function purchase(s,id){const it=ITEMS.find(x=>x.id===id);if(!it||s.items.includes(id)||s.gems<it.cost)return false;s.gems-=it.cost;s.items.push(id);return true}
export function reviewWords(s,now=Date.now(),limit=6){return WORDS.filter(w=>{const r=record(s,w.id);return r.due>0&&r.due<=now}).sort((a,b)=>record(s,a.id).due-record(s,b.id).due||record(s,b.id).errors-record(s,a.id).errors).slice(0,limit)}
export function choices(w,pool,count=4){const other=[...new Map(pool.filter(x=>norm(x.en)!==norm(w.en)).map(x=>[norm(x.en),x])).values()];return shuffle([w,...shuffle(other).slice(0,count-1)])}
export function summary(s){const rs=Object.values(s.words);return {seen:rs.filter(r=>r.seen||r.attempts).length,recognized:rs.filter(r=>r.recognize>0).length,spelled:rs.filter(r=>r.independent>0).length,reviewed:rs.filter(r=>r.reviewed>0).length,errors:rs.reduce((n,r)=>n+r.errors,0),attempts:rs.reduce((n,r)=>n+r.attempts,0),quests:Object.keys(s.quests).length,level:1+Math.floor(s.xp/100)}}
export function validate(s){
  const num=n=>Number.isFinite(n)&&n>=0&&n<=1e15;
  if(!s||s.version!==1||!Number.isInteger(s.unit)||s.unit<0||s.unit>9||!Number.isInteger(s.group)||s.group<0||s.group>=groups(s.unit)||!num(s.gems)||!num(s.xp)||typeof s.petName!=='string'||s.petName.length>18||!['mint','blue','gold'].includes(s.petColor)||!Array.isArray(s.items)||s.items.some(id=>!ITEMS.some(i=>i.id===id))||new Set(s.items).size!==s.items.length)throw Error('存档基本信息不正确');
  for(const key of ['words','quests','pop'])if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key]))throw Error('存档记录缺失');
  for(const [id,r]of Object.entries(s.words))if(!byId.has(id)||!r||!Object.keys(emptyRecord()).every(k=>num(r[k])))throw Error('单词记录不正确');
  for(const [key,r]of Object.entries(s.quests)){if(!/^(voyage|hunt|assembly|fill|spell|story|challenge|review):[0-9]:[0-9]+$/.test(key)||!r||!Number.isInteger(r.stars)||r.stars<1||r.stars>3||!num(r.runs))throw Error('任务记录不正确');const a=key.split(':');if(+a[2]>=groups(+a[1]))throw Error('任务组不存在')}
  for(const [key,r]of Object.entries(s.pop)){if(!/^[0-9]:[0-9]+$/.test(key)||!r||!['tier','best','chain','cleared'].every(k=>num(r[k]))||r.tier>12)throw Error('消消乐记录不正确');const a=key.split(':');if(+a[1]>=groups(+a[0]))throw Error('消消乐词组不存在')}
  if(!s.settings||!['sound','voice','motion'].every(k=>typeof s.settings[k]==='boolean')||![6,4.5,3].includes(s.settings.speed))throw Error('设置不正确');validateAdventure(s);return s;
}
export function csv(s){const rows=[['单元','英文','中文','认识次数','字母拼装','记忆补全','独立拼写成功','错误次数','隔日复测成功','练习次数','下次复习时间']];for(const w of WORDS){const r=record(s,w.id);rows.push([UNITS[w.unit][0],w.en,w.zh,r.recognize,r.assembly,r.fill,r.independent,r.errors,r.reviewed,r.attempts,r.due?new Date(r.due).toISOString():''])}return '\ufeff'+rows.map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n')}

export const CHAPTERS=[
 ['摩天轮的第一束光','点亮每一个座舱，让欢乐转起来','摩天轮启动'],
 ['失落展厅的星光','用单词修复展柜，找回博物馆的光','展柜亮起'],
 ['会开花的单词树','把单词化作种子，让森林重新开花','森林开花'],
 ['救援小队，出发','为救援车补充能量，点亮安全灯','救援车出发'],
 ['开往想象的小火车','收集车票，让列车驶向下一站','列车出发'],
 ['星光信件的秘密','找到密码，让信封里的故事飞出来','信件展开'],
 ['通往山谷的彩虹桥','拼出单词，把彩虹桥一块块铺好','彩虹桥延伸'],
 ['花园里的小音乐会','唤醒每个音符，让舞台唱起来','音符跳动'],
 ['给火箭一封邀请信','为火箭注入单词能量，一起驶向星空','火箭升空'],
 ['今晚，营地有星光','点亮营地，让心愿灯缓缓升起','星灯升起']
];
export const DISCOVERIES=[['shell','潮汐贝壳','每一段旅程，都从一次好奇开始。','◈'],['seed','森林星种','把小小的坚持，种成大大的绿意。','✿'],['letter','漂流信件','远方的朋友，正等着你的问候。','✉']];
export const journeyWords=(u,g)=>{const ws=groupWords(u,g);return [...ws,...ws,...ws]};
export const journeyKind=(at,count)=>['hunt','assembly','spell'][Math.min(2,Math.floor(at/count))];
export function checkpoint(s,task,q){if(task?.kind!=='voyage')return;const key=s.unit+':'+s.group,at=task.correct;s.journeys[key]={at,errors:task.errors,assisted:task.assisted,correct:task.correct,streak:task.streak,results:task.results.map(r=>({...r})),question:{failed:q?.locked?false:!!q?.failed,assisted:q?.locked?false:!!q?.assisted}};}
export function claimDiscovery(s,u,index){if(!Number.isInteger(u)||u<0||u>9||!Number.isInteger(index)||index<0||index>2)throw Error('探索地点不存在');const key=u+':'+index;if(s.discoveries.includes(key))return false;s.discoveries.push(key);s.gems++;return true;}
export function islandGrowth(s,u){const ws=unitWords(u),n=ws.filter(w=>record(s,w.id).independent>0).length;return {spelled:n,total:ws.length,ratio:n/ws.length,level:Math.min(3,Math.floor(n/ws.length*3)),voyages:Object.keys(s.quests).filter(k=>k.startsWith('voyage:'+u+':')).length};}
export function validateAdventure(s){
 const integer=n=>Number.isInteger(n)&&n>=0&&n<=1e9;
 if(s.journeys===undefined)s.journeys={};if(s.discoveries===undefined)s.discoveries=[];if(s.settings.atmosphere===undefined)s.settings.atmosphere='day';
 if(!['day','sunset','night'].includes(s.settings.atmosphere))throw Error('天空设置不正确');
 if(!Array.isArray(s.discoveries)||s.discoveries.some(k=>typeof k!=='string'||!/^\d:[0-2]$/.test(k))||new Set(s.discoveries).size!==s.discoveries.length)throw Error('探索记录不正确');
 if(!s.journeys||typeof s.journeys!=='object'||Array.isArray(s.journeys))throw Error('远航记录不正确');
 for(const [key,j] of Object.entries(s.journeys)){if(!/^\d:\d+$/.test(key)||!j)throw Error('远航地点不正确');const [u,g]=key.split(':').map(Number);if(g>=groups(u))throw Error('远航组不存在');const schedule=journeyWords(u,g);if(!integer(j.at)||j.at>schedule.length||!['errors','assisted','correct','streak'].every(k=>integer(j[k]))||j.correct!==j.at||j.assisted>j.correct||j.streak>j.correct||!Array.isArray(j.results)||j.results.length!==j.at||j.results.some((r,i)=>!r||r.id!==schedule[i].id||typeof r.independent!=='boolean')||!j.question||typeof j.question.failed!=='boolean'||typeof j.question.assisted!=='boolean')throw Error('远航进度不正确');}
}
