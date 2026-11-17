/* Deterministic search: position + seed + settings => identical move; independent of frame rate. */
import {Game,legalMoves,pseudoMoves,inCheck,positionKey,K,A,E,H,R,C,P,NAMES} from './engine.mjs';
export function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function rng(seed){let a=typeof seed==='number'?seed:hash(seed);return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export const personalities=[{name:'烈火先锋',style:'炮火压境 · 主动进攻',attack:1.35,defense:.72,rook:1.0,sacrifice:.22},{name:'磐石守将',style:'固守九宫 · 步步为营',attack:.65,defense:1.4,rook:.75,sacrifice:0},{name:'铁骑破阵',style:'纵车突进 · 抢占要道',attack:1.15,defense:.85,rook:1.6,sacrifice:.12},{name:'奇谋游侠',style:'弃子争先 · 出奇制胜',attack:1.45,defense:.72,rook:1.05,sacrifice:.36}];
const books=[{name:'当头炮',red:[[70,67],[88,69],[64,65]],black:[[1,20],[7,24],[8,7]]},{name:'飞相局',red:[[87,67],[88,69],[70,67]],black:[[1,20],[7,24],[19,22]]},{name:'过宫炮',red:[[64,68],[82,65],[88,69]],black:[[7,24],[1,20],[25,22]]},{name:'屏风马',red:[[88,69],[82,65],[70,67]],black:[[1,20],[7,24],[25,22]]}];
export function profile(seed){const rand=rng(seed);const red=personalities[Math.floor(rand()*4)],black=personalities[Math.floor(rand()*4)],book=books[Math.floor(rand()*books.length)];return {red,black,book};}
const V=[0,20000,120,125,305,610,330,75];
export function evaluate(b,profile){let score=0;for(let i=0;i<90;i++){const p=b[i];if(!p)continue;const s=Math.sign(p),k=Math.abs(p),x=i%9,y=Math.floor(i/9),advance=s===1?9-y:y,center=4-Math.abs(4-x),pers=s===1?profile.red:profile.black;let v=V[k];
 if(k===P)v+=advance*9+(advance>=5?45+center*9:0);
 if(k===H)v+=center*9+Math.min(advance,6)*4-(x===0||x===8?20:0);
 if(k===R)v+=center*3+advance*4*pers.rook;
 if(k===C)v+=center*5+Math.min(advance,5)*5*pers.attack;
 if(k===A||k===E)v+=12*pers.defense;
 if(k===K){let shelter=0;for(let j=0;j<90;j++)if(b[j]===s*A||b[j]===s*E)shelter++;v+=shelter*9*pers.defense;}
 score+=s*v;}
 score+=(pseudoMoves(b,1).length-pseudoMoves(b,-1).length)*1.8;
 if(inCheck(b,1))score-=42*profile.red.defense;if(inCheck(b,-1))score+=42*profile.black.defense;
 return score;}
const order=m=>(m.captured?V[Math.abs(m.captured)]*12-V[Math.abs(m.piece)]:0);
export async function chooseMove(snapshot,{seed='CH-2026',temperature=.65,depth=2,book=true}={},progress=()=>{}){
 const g=new Game(snapshot),b=g.board,s=g.turn,prof=profile(seed),rand=rng(hash(seed+':'+g.ply+':'+positionKey(b,s))),moves=legalMoves(b,s);if(!moves.length)return null;
 const options={nodes:0,slices:0};
 // Search order and node count are deterministic; no wall-time cutoff changes a decision.
 function* search(side,d,alpha,beta,ply){options.nodes++;if(options.nodes%160===0)yield null;const lm=legalMoves(b,side);if(!lm.length)return -100000+ply;
 if(d<=0)return side*evaluate(b,prof);
 lm.sort((a,b)=>order(b)-order(a));let best=-Infinity;
 for(const m of lm){b[m.from]=0;b[m.to]=m.piece;const val=-(yield* search(-side,d-1,-beta,-alpha,ply+1));b[m.from]=m.piece;b[m.to]=m.captured;if(val>best)best=val;if(val>alpha)alpha=val;if(alpha>=beta)break;}return best;
 }
 async function run(gen){while(true){const a=gen.next();if(a.done)return a.value;options.slices++;progress(options.nodes);await new Promise(resolve=>setTimeout(resolve,0));}}
 const ranked=[];moves.sort((a,b)=>order(b)-order(a));let alpha=-Infinity;
 const pers=s===1?prof.red:prof.black;
 for(const m of moves){b[m.from]=0;b[m.to]=m.piece;const key=positionKey(b,-s);let value=-(await run(search(-s,Math.max(1,Math.min(3,depth))-1,-Infinity,Infinity,1)));
 const danger=inCheck(b,-s);if(danger)value+=12*pers.attack;
 const nextCount=(g.repetitions.get(key)??0)+1;
 if(nextCount>=3||(!m.captured&&g.quiet+1>=120)||g.ply+1>=g.maxPly)value=0;
 else if(nextCount>1)value-=18;
 b[m.from]=m.piece;b[m.to]=m.captured;
 if(Math.abs(m.piece)===R)value+=(s===1?m.from-m.to:m.to-m.from)/9*pers.rook*2;
 // A small positional appetite for attacking opportunities, never an illegal action.
 if(danger&&m.captured)value+=20*pers.sacrifice;
 ranked.push({...m,score:value});alpha=Math.max(alpha,value);
 }
 ranked.sort((a,b)=>b.score-a.score||a.from-b.from||a.to-b.to);
 let chosen;const line=s===1?prof.book.red:prof.book.black,openingMove=line[Math.floor(g.ply/2)];
 if(book&&g.ply<6&&openingMove&&temperature<1.5)chosen=ranked.find(m=>m.from===openingMove[0]&&m.to===openingMove[1]);
 let blunder=false;
 if(!chosen){let pool=ranked.slice(0,Math.min(ranked.length,temperature>1.15?12:7));
 if(temperature>1.15&&rand()<.12*(temperature-1)){pool=ranked.slice(0,Math.min(ranked.length,20));blunder=true;}
 const temp=temperature<=.01?.001:(blunder?120:20+temperature*45);
 const weights=pool.map(m=>Math.exp(Math.max(-700,(m.score-pool[0].score)/temp))),sum=weights.reduce((a,b)=>a+b,0);let p=rand()*sum;chosen=pool.at(-1);for(let i=0;i<pool.length;i++){p-=weights[i];if(p<=0){chosen=pool[i];break;}}
 }
 const redScore=chosen.score*s,win=Math.max(1,Math.min(99,100/(1+Math.exp(-redScore/450))));
 return {move:{from:chosen.from,to:chosen.to},score:redScore,win,nodes:options.nodes,slices:options.slices,blunder,opening:book&&g.ply<6?prof.book.name:null};
}
