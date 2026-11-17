(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.XY=api;})(typeof globalThis==='undefined'?this:globalThis,function(){
'use strict';
const APP='journey-108-play',VERSION=1;
const shuffle=(arr,rng=Math.random)=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const number=(v,max=1e8)=>Math.floor(Math.max(0,Math.min(max,Number.isFinite(v)?v:0)));
const ids=a=>Array.isArray(a)?[...new Set(a.filter(x=>Number.isInteger(x)&&x>=1&&x<=108))]:[];
function fresh(){return {app:APP,version:VERSION,seen:[],wrong:[],mastery:{},xp:0,bestStreak:0,runs:0,stages:{},matchBest:null,settings:{sound:false,autoNext:false}};}
function sanitize(raw){if(!raw||raw.app!==APP||raw.version!==VERSION)throw Error('请选择《西游小游记》导出的 JSON 存档。');const s=fresh();s.seen=ids(raw.seen);s.wrong=ids(raw.wrong);s.xp=number(raw.xp);s.bestStreak=number(raw.bestStreak,10000);s.runs=number(raw.runs,100000);if(raw.mastery&&typeof raw.mastery==='object')for(let i=1;i<=108;i++)if(Number.isInteger(raw.mastery[i])&&raw.mastery[i]>0)s.mastery[i]=number(raw.mastery[i],999);if(raw.stages&&typeof raw.stages==='object')for(let i=0;i<12;i++){const v=raw.stages[i];if(v&&typeof v==='object')s.stages[i]={stars:number(v.stars,3),correct:number(v.correct,6),plays:number(v.plays,100000)};}if(raw.matchBest&&Number.isFinite(raw.matchBest.moves)&&raw.matchBest.moves>=6)s.matchBest={moves:number(raw.matchBest.moves,100000),seconds:number(raw.matchBest.seconds,86400)};if(raw.settings&&typeof raw.settings==='object')s.settings={sound:raw.settings.sound===true,autoNext:raw.settings.autoNext===true};return s;}
function totals(s){return {seen:s.seen.length,mastered:Object.values(s.mastery).filter(n=>n>=2).length,stars:Object.values(s.stages).reduce((n,b)=>n+b.stars,0),passed:Object.values(s.stages).filter(b=>b.stars>=2).length,wrong:s.wrong.length};}
function visit(s,id){if(!s.seen.includes(id))s.seen.push(id);}
function remember(s,id,correct){visit(s,id);if(correct){s.mastery[id]=Math.min(999,(s.mastery[id]||0)+1);s.wrong=s.wrong.filter(n=>n!==id);}else if(!s.wrong.includes(id))s.wrong.push(id);}
function options(id,pool,all,rng=Math.random){const candidates=shuffle([...new Set([...pool,...all].filter(x=>x!==id))],rng).slice(0,3);return shuffle([id,...candidates],rng);}
function makeQuiz(pool,all,count=10,mode='mixed',rng=Math.random){const targets=shuffle([...new Set(pool)],rng).slice(0,count);return {index:0,correct:0,streak:0,bestStreak:0,xp:0,answers:[],ended:false,questions:targets.map((id,i)=>({id,kind:mode==='mixed'?(i%2===0?'portrait':'clue'):mode,options:options(id,pool,all,rng)}))};}
function answer(run,state,choice){if(run.ended||run.answers[run.index])return null;const q=run.questions[run.index];if(!q||!q.options.includes(choice))return null;const correct=choice===q.id;run.streak=correct?run.streak+1:0;run.bestStreak=Math.max(run.bestStreak,run.streak);const gain=correct?10+Math.min(run.streak-1,4)*2:0;run.correct+=Number(correct);run.xp+=gain;state.xp+=gain;state.bestStreak=Math.max(state.bestStreak,run.bestStreak);remember(state,q.id,correct);const result={id:q.id,choice,correct,gain};run.answers[run.index]=result;return result;}
function advance(run){if(!run.answers[run.index]||run.ended)return false;run.index++;if(run.index>=run.questions.length)run.ended=true;return true;}
function stars(correct,total){return total===0?0:correct/total>=5/6?3:correct/total>=.5?2:correct>0?1:0;}
function finish(run,state,stage){if(run.recorded)return;run.recorded=true;state.runs++;if(Number.isInteger(stage)){const prev=state.stages[stage]||{stars:0,correct:0,plays:0};state.stages[stage]={stars:Math.max(prev.stars,stars(run.correct,run.questions.length)),correct:Math.max(prev.correct,run.correct),plays:prev.plays+1};}}
function nextStage(state){for(let i=0;i<12;i++)if((state.stages[i]?.stars||0)<2)return i;return 0;}
function makeMatch(pool,rng=Math.random){return shuffle(shuffle(pool,rng).slice(0,6).flatMap(id=>[{id,type:'image',key:id+'-image'},{id,type:'name',key:id+'-name'}]),rng);}
function pair(a,b){return !!a&&!!b&&a.id===b.id&&a.type!==b.type;}
return {APP,VERSION,shuffle,ids,fresh,sanitize,totals,visit,remember,options,makeQuiz,answer,advance,stars,finish,nextStage,makeMatch,pair};
});
