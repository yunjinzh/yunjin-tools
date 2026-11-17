(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WM=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MODES=['portrait','match','skill'];
 function shuffle(arr,rng=Math.random){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function clamp(n,a,b){return Math.max(a,Math.min(b,Number.isFinite(n)?n:a));}
 function validIds(a){return Array.isArray(a)?[...new Set(a.filter(n=>Number.isInteger(n)&&n>=1&&n<=108))]:[];}
 function fresh(){return {version:1,known:[],wrong:[],xp:0,bestStreak:0,runs:0,best:{},settings:{sound:false,autoNext:true}};}
 function sanitize(raw){if(!raw||typeof raw!=='object'||raw.version!==1)throw Error('这份文件不是可识别的梁山游戏存档。');const s=fresh();s.known=validIds(raw.known);s.wrong=validIds(raw.wrong);s.xp=Math.floor(clamp(raw.xp,0,1e9));s.bestStreak=Math.floor(clamp(raw.bestStreak,0,1e6));s.runs=Math.floor(clamp(raw.runs,0,1e6));if(raw.best&&typeof raw.best==='object'){for(let g=0;g<9;g++)for(const mode of MODES){const k=g+'-'+mode,b=raw.best[k];if(b&&typeof b==='object')s.best[k]={stars:Math.floor(clamp(b.stars,0,3)),correct:Math.floor(clamp(b.correct,0,12)),score:Math.floor(clamp(b.score,0,1e6))};}}if(raw.settings&&typeof raw.settings==='object'){s.settings.sound=raw.settings.sound===true;s.settings.autoNext=raw.settings.autoNext!==false;}return s;}
 function options(correct,pool,all,count=4,rng=Math.random){const ids=new Set(),choices=[];for(const h of shuffle([...pool,...all],rng)){if(h.id!==correct.id&&!ids.has(h.id)){ids.add(h.id);choices.push(h);if(choices.length===count-1)break;}}return shuffle([correct,...choices],rng);}
 function stars(correct,total){const r=total?correct/total:0;return r>=.83?3:r>=.58?2:r>0?1:0;}
 function points(streak){return 10+Math.min(Math.max(streak-1,0),4)*2;}
 function remember(state,id,correct){if(correct){state.known=validIds([...state.known,id]);state.wrong=state.wrong.filter(x=>x!==id);}else state.wrong=validIds([...state.wrong,id]);return state;}
 function record(state,key,correct,total,score){const n=stars(correct,total),old=state.best[key]||{stars:0,correct:0,score:0};state.best[key]={stars:Math.max(old.stars,n),correct:Math.max(old.correct,correct),score:Math.max(old.score,score)};state.runs++;return Math.max(0,n-old.stars);}
 function totals(state){return {stars:Object.values(state.best).reduce((a,b)=>a+b.stars,0),camps:Array.from({length:9},(_,g)=>MODES.some(m=>(state.best[g+'-'+m]?.stars||0)>0)).filter(Boolean).length};}
 function matchDeck(heroes,rng=Math.random){return shuffle(heroes.flatMap(h=>[{id:h.id,type:'name',key:h.id+'-name'},{id:h.id,type:'nick',key:h.id+'-nick'}]),rng);}
 function isPair(a,b){return !!a&&!!b&&a.id===b.id&&a.type!==b.type;}
 return {MODES,shuffle,clamp,validIds,fresh,sanitize,options,stars,points,remember,record,totals,matchDeck,isPair};
});
