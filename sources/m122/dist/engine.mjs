/* Pure Chinese chess rules. No DOM, renderer, RNG or animation dependencies. */
export const K=1,A=2,E=3,H=4,R=5,C=6,P=7;
export const NAMES={1:'帥',2:'仕',3:'相',4:'馬',5:'車',6:'炮',7:'兵','-1':'將','-2':'士','-3':'象','-4':'馬','-5':'車','-6':'砲','-7':'卒'};
const xy=i=>[i%9,Math.floor(i/9)];
const inside=(x,y)=>x>=0&&x<9&&y>=0&&y<10;
const palace=(x,y,s)=>x>=3&&x<=5&&(s===1?y>=7&&y<=9:y>=0&&y<=2);
export function initialBoard(){const b=new Int8Array(90),row=[R,H,E,A,K,A,E,H,R];for(let x=0;x<9;x++){b[x]=-row[x];b[81+x]=row[x];}for(const x of [1,7]){b[18+x]=-C;b[63+x]=C;}for(const x of [0,2,4,6,8]){b[27+x]=-P;b[54+x]=P;}return b;}
export function pseudoMoves(board,side,only=-1,attacks=false){
 const moves=[];
 for(let from=0;from<90;from++){
  const p=board[from];if(Math.sign(p)!==side||(only>=0&&only!==from))continue;
  const [x,y]=xy(from),kind=Math.abs(p);
  const add=(nx,ny)=>{if(!inside(nx,ny))return;const to=ny*9+nx,v=board[to];if(Math.sign(v)===side||(!attacks&&Math.abs(v)===K))return;moves.push({from,to,piece:p,captured:v});};
  if(kind===K){for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(palace(x+dx,y+dy,side))add(x+dx,y+dy);}
  if(kind===A){for(const dx of [-1,1])for(const dy of [-1,1])if(palace(x+dx,y+dy,side))add(x+dx,y+dy);}
  if(kind===E){for(const dx of [-2,2])for(const dy of [-2,2]){const nx=x+dx,ny=y+dy;if(inside(nx,ny)&&(side===1?ny>=5:ny<=4)&&!board[(y+dy/2)*9+x+dx/2])add(nx,ny);}}
  if(kind===H){for(const [dx,dy] of [[1,2],[-1,2],[1,-2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]){const lx=x+(Math.abs(dx)===2?Math.sign(dx):0),ly=y+(Math.abs(dy)===2?Math.sign(dy):0);if(!board[ly*9+lx])add(x+dx,y+dy);}}
  if(kind===R||kind===C){for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let screen=false;for(let nx=x+dx,ny=y+dy;inside(nx,ny);nx+=dx,ny+=dy){const v=board[ny*9+nx];if(kind===R){add(nx,ny);if(v)break;}else if(!screen){if(v)screen=true;else add(nx,ny);}else if(v){add(nx,ny);break;}}}}
  if(kind===P){add(x,y-side);if(side===1?y<=4:y>=5){add(x-1,y);add(x+1,y);}}
 }
 return moves;
}
export function inCheck(board,side){
 const king=board.indexOf(side*K);if(king<0)return true;const [kx,ky]=xy(king);
 // Rays: rook, single-screen cannon, and facing generals.
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let blockers=0;for(let x=kx+dx,y=ky+dy;inside(x,y);x+=dx,y+=dy){const p=board[y*9+x];if(!p)continue;if(Math.sign(p)===-side){const t=Math.abs(p);if(blockers===0&&(t===R||(t===K&&dx===0)))return true;if(blockers===1&&t===C)return true;}blockers++;if(blockers===2)break;}}
 for(const [dx,dy] of [[1,2],[-1,2],[1,-2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]){const x=kx+dx,y=ky+dy;if(!inside(x,y)||board[y*9+x]!==-side*H)continue;const lx=x-(Math.abs(dx)===2?Math.sign(dx):0),ly=y-(Math.abs(dy)===2?Math.sign(dy):0);if(!board[ly*9+lx])return true;}
 // Enemy pawns move towards this king.
 const py=ky-side;if(inside(kx,py)&&board[py*9+kx]===-side*P)return true;
 for(const x of [kx-1,kx+1])if(inside(x,ky)&&board[ky*9+x]===-side*P&&(-side===1?ky<=4:ky>=5))return true;
 // Adjacent king / advisor / elephant attacks (also supports constructed test positions).
 for(let i=0;i<90;i++){const p=board[i];if(Math.sign(p)!==-side)continue;const t=Math.abs(p);if(t!==K&&t!==A&&t!==E)continue;const [x,y]=xy(i),dx=kx-x,dy=ky-y;
 if(t===K&&Math.abs(dx)+Math.abs(dy)===1)return true;
 if(t===A&&Math.abs(dx)===1&&Math.abs(dy)===1&&palace(kx,ky,-side))return true;
 if(t===E&&Math.abs(dx)===2&&Math.abs(dy)===2&&(-side===1?ky>=5:ky<=4)&&!board[(y+dy/2)*9+x+dx/2])return true;
 }return false;
}
export function legalMoves(board,side,only=-1){const out=[];for(const m of pseudoMoves(board,side,only)){board[m.from]=0;board[m.to]=m.piece;const ok=!inCheck(board,side);board[m.from]=m.piece;board[m.to]=m.captured;if(ok)out.push(m);}return out;}
export const positionKey=(b,s)=>Array.from(b).join(',')+'/'+s;
const CN=['','一','二','三','四','五','六','七','八','九'];
export function notation(board,m){
 const s=Math.sign(m.piece),[fx,fy]=xy(m.from),[tx,ty]=xy(m.to),kind=Math.abs(m.piece),num=n=>s===1?CN[n]:String(n),file=x=>s===1?9-x:x+1;
 const same=[];for(let y=0;y<10;y++)if(board[y*9+fx]===m.piece)same.push(y*9+fx);same.sort((a,b)=>s===1?a-b:b-a);
 let prefix=NAMES[m.piece]+num(file(fx));
 if(same.length>1){const n=same.indexOf(m.from);prefix=(n===0?'前':n===same.length-1?'後':same.length===3?'中':num(n+1))+NAMES[m.piece];
 // Multiple doubled pawn files need the file in addition to the front/back qualifier.
 if(kind===P){let doubled=0;for(let x=0;x<9;x++){let c=0;for(let y=0;y<10;y++)if(board[y*9+x]===m.piece)c++;if(c>1)doubled++;}if(doubled>1)prefix+=num(file(fx));}}
 if(fy===ty)return prefix+'平'+num(file(tx));
 return prefix+((ty-fy)*s<0?'進':'退')+num([H,E,A].includes(kind)?file(tx):Math.abs(ty-fy));
}
export class Game {
 constructor(snapshot=null){this.board=snapshot?Int8Array.from(snapshot.board):initialBoard();this.turn=snapshot?.turn??1;this.quiet=snapshot?.quiet??0;this.ply=snapshot?.ply??0;this.maxPly=snapshot?.maxPly??600;this.history=[];this.repetitions=new Map(snapshot?.repetitions??[[positionKey(this.board,this.turn),1]]);}
 snapshot(){return {board:Array.from(this.board),turn:this.turn,quiet:this.quiet,ply:this.ply,maxPly:this.maxPly,repetitions:[...this.repetitions]};}
 legal(from=-1){return legalMoves(this.board,this.turn,from);}
 status(){const moves=this.legal(),check=inCheck(this.board,this.turn);if(!moves.length)return {over:true,winner:-this.turn,reason:check?'将死':'困毙',check};if((this.repetitions.get(positionKey(this.board,this.turn))??0)>=3)return {over:true,winner:0,reason:'三次重复局面',check};if(this.quiet>=120)return {over:true,winner:0,reason:'连续 120 个半回合无吃子',check};if(this.ply>=this.maxPly)return {over:true,winner:0,reason:'达到 600 个半回合上限',check};return {over:false,check};}
 move(input){if(this.status().over)throw Error('对局已经结束');const m=this.legal(input.from).find(m=>m.to===input.to);if(!m)throw Error('非法走法');const label=notation(this.board,m),oldQuiet=this.quiet;this.board[m.to]=m.piece;this.board[m.from]=0;this.turn=-this.turn;this.ply++;this.quiet=m.captured?0:this.quiet+1;const key=positionKey(this.board,this.turn);this.repetitions.set(key,(this.repetitions.get(key)??0)+1);const result={...m,label,oldQuiet};this.history.push(result);return result;}
 undo(){const m=this.history.pop();if(!m)return null;const key=positionKey(this.board,this.turn),count=this.repetitions.get(key);if(count<=1)this.repetitions.delete(key);else this.repetitions.set(key,count-1);this.board[m.from]=m.piece;this.board[m.to]=m.captured;this.quiet=m.oldQuiet;this.ply--;this.turn=-this.turn;return m;}
}
export function selfTest(){const count=legalMoves(initialBoard(),1).length;const pass=count===44;console[pass?'info':'error'](`[象棋规则自检] ${pass?'PASS':'FAIL'} · 红方初始合法走法 ${count}/44`);return {pass,count};}
