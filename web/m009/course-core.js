/* Course state and scoring. Self-reported reading is kept separate from audio playback. */
(function(){
 function createCore(data){
 const modules=[['vocab','词汇小宝箱','打开故事前的关键词','▦'],['grammar','句子魔法屋','两个语法，一次弄懂','✦'],['story','探险故事',data.storyHint||'跟着故事人物一起探险','⚑'],['reading','阅读小剧场','读几句，懂一点，再往前','▤'],['phonics','声音实验室','听声音，找规律','♪'],['world','发现大世界','把英语用在新知识里','◎'],['create','开口与创作','用自己的话说清楚','✎'],['challenge','单元小挑战','带着收获再试一次','★']];
 const allQuestions=new Map();
 const hash=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0),0);
 function rotate(q){const r=hash(q.id)%q.options.length;return {...q,options:q.options.slice(r).concat(q.options.slice(0,r)),answer:(q.answer-r+q.options.length)%q.options.length};}
 for(const u of data.units){
  for(const q of u.questions)allQuestions.set(q.id,rotate({...q,unit:u.id}));
  u.vocab.forEach((v,i)=>{
   const distract=u.vocab.filter((x,j)=>j!==i).map(x=>x.zh).slice(i%3,i%3+3);
   const q={id:`u${u.id}-v${i}`,unit:u.id,prompt:`“${v.word}” 在本单元是什么意思？`,options:[v.zh,...distract],answer:0,why:`${v.word}：${v.zh}。例句：${v.example}`,kind:'vocab'};
   allQuestions.set(q.id,rotate(q));
  });
  const original=[u.grammar[0].questions[0].id,u.grammar[1].questions[1].id,u.story.questions[0].id,u.reading.questions[1].id,u.world.questions[0].id,u.phonics.questions[0].id,`u${u.id}-v0`,`u${u.id}-v${u.vocab.length-1}`];
  u.challenge=original.map((id,i)=>{const q={...allQuestions.get(id),id:`u${u.id}-challenge-${i}`,original:id};allQuestions.set(q.id,q);return q.id;});
 }
 function initial(){return {version:2,bookNumber:data.number||4,answers:{},read:{},heard:{},saved:{},flags:{},drafts:{},last:{unit:0,module:'vocab'},settings:{rate:0.8,voice:''},updated:null};}
 function restore(x){
  const s=initial();if(!x||x.version!==2||typeof x!=='object'||(x.bookNumber!==undefined&&x.bookNumber!==(data.number||4)))throw Error('这不是当前课程的进度备份。');
  const strings=new Set(data.units.flatMap(u=>['story','reading','world'].flatMap(a=>u[a].sentences.map(v=>v.id))));
  const wordids=new Set(data.units.flatMap(u=>u.vocab.map((_,i)=>`u${u.id}-v${i}`)));
  for(const [id,v] of Object.entries(x.answers||{})){
   const q=allQuestions.get(id);if(!q||!v||!Number.isInteger(v.choice)||v.choice<0||v.choice>=q.options.length)continue;
   s.answers[id]={choice:v.choice,correct:v.choice===q.answer,first:typeof v.first==='boolean'?v.first:v.choice===q.answer,tries:Math.min(999,Math.max(1,Number(v.tries)||1))};
  }
  for(const k of ['read','heard'])for(const [id,v]of Object.entries(x[k]||{}))if(strings.has(id)&&v===true)s[k][id]=true;
  for(const [id,v] of Object.entries(x.saved||{}))if(wordids.has(id)&&v===true)s.saved[id]=true;
  for(const u of data.units){
   for(const suffix of ['phonics','retell','task0','task1','task2']){const id=`u${u.id}-${suffix}`;if(x.flags?.[id]===true)s.flags[id]=true;}
   if(typeof x.drafts?.[u.id]==='string')s.drafts[u.id]=x.drafts[u.id].slice(0,20000);
  }
  if(Number.isInteger(x.last?.unit)&&x.last.unit>=0&&x.last.unit<data.units.length)s.last.unit=x.last.unit;
  if(modules.some(m=>m[0]===x.last?.module))s.last.module=x.last.module;
  if([0.65,0.8,1].includes(x.settings?.rate))s.settings.rate=x.settings.rate;
  if(typeof x.settings?.voice==='string')s.settings.voice=x.settings.voice.slice(0,200);
  if(typeof x.updated==='string')s.updated=x.updated.slice(0,50);
  return s;
 }
 function answer(s,id,choice){const q=allQuestions.get(id);if(!q||!Number.isInteger(choice)||choice<0||choice>=q.options.length)return false;const old=s.answers[id];s.answers[id]={choice,correct:choice===q.answer,first:old?old.first:choice===q.answer,tries:(old?.tries||0)+1};return choice===q.answer;}
 const right=(s,id)=>s.answers[id]?.correct===true;
 function complete(s,u,key){
  if(key==='vocab')return u.vocab.every((v,i)=>right(s,`u${u.id}-v${i}`));
  if(key==='grammar')return u.grammar.every(g=>g.questions.every(q=>right(s,q.id)));
  if(['story','reading','world'].includes(key))return u[key].sentences.every(v=>s.read[v.id])&&u[key].questions.every(q=>right(s,q.id));
  if(key==='phonics')return s.flags[`u${u.id}-phonics`]===true&&u.phonics.questions.every(q=>right(s,q.id));
  if(key==='create')return ['task0','task1','task2','retell'].every(v=>s.flags[`u${u.id}-${v}`])&&(s.drafts[u.id]||'').trim().length>=(data.draftMin||15);
  if(key==='challenge')return u.challenge.every(id=>right(s,id));return false;
 }
 const count=(s,u)=>modules.filter(m=>complete(s,u,m[0])).length;
 const stats=s=>({missions:data.units.reduce((n,u)=>n+count(s,u),0),read:Object.keys(s.read).filter(k=>s.read[k]).length,heard:Object.keys(s.heard).filter(k=>s.heard[k]).length,stars:Object.values(s.answers).filter(a=>a.correct).length,wrong:Object.entries(s.answers).filter(([id,a])=>!a.correct).map(([id])=>id),words:data.units.reduce((n,u)=>n+u.vocab.filter((v,i)=>right(s,`u${u.id}-v${i}`)).length,0),units:data.units.filter(u=>count(s,u)===8).length});
 return {modules,allQuestions,initial,restore,answer,complete,count,stats,right};
 }
 window.CourseCoreFactory=createCore;
 if(window.COURSE)window.CourseCore=createCore(window.COURSE);
})();
