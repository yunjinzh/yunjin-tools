import {Game,selfTest,NAMES,legalMoves,inCheck} from './engine.mjs';
import {profile,evaluate} from './ai.mjs';
import {BattleScene} from './scene.mjs';
const $=id=>document.getElementById(id),check=selfTest();
$('warning').hidden=check.pass;$('engineStatus').innerHTML=`<i class="live-dot"></i> 规则自检 ${check.count} / 44`;
$('testSummary').textContent=check.pass?'规则自检通过 · 初始局面 44 个合法走法':'规则自检未通过，请停止使用';
let game=new Game(),seed='CH-7942',settings={temperature:.65,depth:2,book:true},initialSettings={...settings},paused=false,busy=false,worker=null,requestId=0,pending=null,selected=-1,mode='none',wait=1.3,single=false,moveLog=[],replayLog=null,audio=false,audioCtx=null,gameOver=false,scene;
function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('visible'),2600);}
function sound(capture=false){if(!audio)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const now=audioCtx.currentTime;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=capture?'triangle':'sine';osc.frequency.setValueAtTime(capture?125:390,now);osc.frequency.exponentialRampToValueAtTime(60,now+.13);gain.gain.setValueAtTime(.15,now);gain.gain.exponentialRampToValueAtTime(.001,now+.18);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+.2);}catch{}}
function isHuman(){return mode==='both'||(mode==='red'&&game.turn===1)||(mode==='black'&&game.turn===-1);}
function setPaused(value){paused=value;if(scene)scene.paused=value;$('pauseIcon').textContent=value?'▶':'Ⅱ';$('pauseBtn').setAttribute('aria-label',value?'继续对局':'暂停对局');renderStatus();}
function renderStatus(){const status=game.status();gameOver=status.over;const red=game.turn===1;$('redCard').classList.toggle('active',red);$('blackCard').classList.toggle('active',!red);$('round').textContent=`第 ${String(Math.floor(game.ply/2)+1).padStart(2,'0')} 回合`;
 const label=gameOver?'对局结束':paused?'已暂停':busy?(scene?.animation?'行军中':'推演中'):isHuman()?'等待落子':'对弈中';$('playState').innerHTML='<i></i>'+label;$('playState').style.color=gameOver||paused?'#9b8260':'';
 $('redController').textContent=mode==='red'||mode==='both'?'你':'AI';$('blackController').textContent=mode==='black'||mode==='both'?'你':'AI';$('turnHint').hidden=!isHuman()||busy||gameOver;$('turnHint').textContent=`${red?'红':'黑'}方执棋 · ${status.check?'正在被将军，请先解将':'点击棋子，选择发光落点'}`;
 $('controlHint').textContent=isHuman()?'点击己方棋子，再点击目标格。':mode==='none'?'两军自主落子，可随时暂停或接管。':'对手正在推演，请稍候。';$('undoBtn').disabled=game.history.length===0;$('stepBtn').disabled=gameOver;
}
function updateEval(score=0,win=null){const r=win??Math.max(1,Math.min(99,100/(1+Math.exp(-score/450))));$('redWin').textContent=Math.round(r);$('blackWin').textContent=100-Math.round(r);$('evalFill').style.width=r+'%';$('evalText').textContent=`${Math.abs(r-50)<8?'势均力敌':r>50?'红方占优':'黑方占优'} · 红方估计胜率 ${Math.round(r)}%`;}
function renderRecords(){const history=game.history;if(!history.length){$('records').innerHTML='<div class="empty-record"><span>棋局未定，落子成诗。</span><small>每一步，皆有迹可循。</small></div>';return;}$('records').innerHTML='';for(let i=0;i<history.length;i+=2){const row=document.createElement('div');row.className='record-row';const n=document.createElement('span');n.textContent=String(i/2+1).padStart(2,'0');row.append(n);for(let j=0;j<2;j++){const el=document.createElement('span');el.className=(j===0?'red-move':'black-move')+(i+j===history.length-1?' recent':'');el.textContent=history[i+j]?.label??'—';row.append(el);}$('records').append(row);}$('records').scrollTop=$('records').scrollHeight;}
function captured(){return game.history.filter(m=>m.captured).map(m=>m.captured);}
function finish(){const st=game.status();gameOver=st.over;if(!st.over)return;$('result').hidden=false;$('resultTitle').textContent=st.winner===0?'和棋 · 两军言和':st.winner===1?'红方获胜':'黑方获胜';$('resultSeal').textContent=st.winner===0?'和':'胜';$('resultReason').textContent=`${st.reason} · 共 ${game.ply} 步`;if(st.winner!==0)updateEval(st.winner*100000,st.winner===1?100:0);$('comment').textContent=`对局结束：${st.reason}。可以重放此局，或启用一个新种子。`;renderStatus();}
function commentary(m,info){const who=m.piece>0?'红':'黑',name=NAMES[m.piece],other=NAMES[m.captured];if(game.status().over)return game.status().reason;if(inCheck(game.board,game.turn))return `${who}${name}逼近九宫，将军！`;
 if(m.captured)return `${who}方出击！${name}吃${other}，战场再起波澜。`;
 if(info?.blunder)return `${who}方大胆冒进，或许暗藏机会，也留下了破绽。`;
 if(info?.opening)return `${who}方以${info.opening}布阵，争取先手。`;
 const t=Math.abs(m.piece),progress=m.piece>0?Math.floor(m.from/9)-Math.floor(m.to/9):Math.floor(m.to/9)-Math.floor(m.from/9);
 if(t===7)return progress>0?`${who}方步卒向前，稳步压缩对手空间。`:`${who}方过河兵横移，寻找新的突破口。`;
 if(t===6)return `${who}炮调转阵位，寻找可以借力的炮架。`;
 if(t===5)return `${who}车抢占通路，牵制对手子力。`;
 if(t===4)return `${who}马跃入新阵，窥伺侧翼。`;
 return `${who}方调整阵形，${progress>0?'进取之中仍留后手':'静待下一次交锋'}。`;
}
function perform(move,info={},manual=false,moveSettings={...settings}){
 if(busy&&scene.animation)return;let m;try{m=game.move(move);}catch(e){busy=false;toast(e.message);return;}
 busy=true;selected=-1;moveLog.push({from:m.from,to:m.to,settings:{...moveSettings},manual,info});$('lastMove').textContent=`${m.piece>0?'红':'黑'}方 · ${m.label}`;$('comment').textContent=commentary(m,info);$('moveBadge').textContent=NAMES[m.piece];updateEval(info.score??evaluate(game.board,profile(seed)),info.win);sound(false);renderRecords();
 scene.begin(m,()=>{busy=false;sound(false);wait=.7;finish();if(single){single=false;setPaused(true);}renderStatus();});renderStatus();
}
function cancelAI(){if(worker){worker.terminate();worker=null;}requestId++;pending=null;if(!scene?.animation)busy=false;}
function queueAI(){if(gameOver||busy||paused&&!single)return;
 if(replayLog&&game.ply<replayLog.length){const entry=replayLog[game.ply];settings={...entry.settings};syncSettings();if(entry.manual){perform(entry,entry.info,true,entry.settings);return;}}
 if(isHuman()&&!single){renderStatus();return;}
 busy=true;renderStatus();const id=++requestId,moveSettings={...settings};worker=new Worker(new URL('./ai-worker.mjs',import.meta.url),{type:'module'});
 worker.onmessage=({data})=>{if(data.id!==requestId)return;if(data.type==='progress')return;
 worker?.terminate();worker=null;if(data.type==='error'){busy=false;setPaused(true);toast('推演未完成：'+data.message);return;}const result=data.result;if(!result){busy=false;finish();return;}if(paused&&!single){pending={result,moveSettings};return;}perform(result.move,result,false,moveSettings);};
 worker.onerror=()=>{cancelAI();setPaused(true);toast('AI 工作线程未能启动，请刷新页面后重试。');};worker.postMessage({id,snapshot:game.snapshot(),settings:{seed,...moveSettings}});
}
function frame(dt){if(paused||gameOver)return;if(pending){const {result,moveSettings}=pending;pending=null;perform(result.move,result,false,moveSettings);return;}if(!busy){wait-=dt;if(wait<=0)queueAI();}}
function selectSquare(square){if(gameOver||busy||(!isHuman()&&mode!=='both'))return;const p=game.board[square];if(selected>=0){const m=game.legal(selected).find(m=>m.to===square);if(m){replayLog=null;single=paused;if(paused)setPaused(false);perform(m,{},true);return;}}
 if(Math.sign(p)!==game.turn){selected=-1;scene.highlight([]);return;}selected=square;const moves=game.legal(square);scene.highlight([square,...moves.map(m=>m.to)],square);if(!moves.length)toast('此棋子当前没有合法走法。');}
function syncSettings(){$('temperature').value=settings.temperature;$('tempValue').value=settings.temperature.toFixed(2);$('depth').value=settings.depth;$('openingToggle').checked=settings.book;}
function newGame(newSeed,{replay=null,base=null}={}){cancelAI();seed=newSeed.trim()||'CH-2026';settings=base?{...base}:{...settings};initialSettings={...settings};game=new Game();moveLog=[];replayLog=replay;gameOver=false;single=false;selected=-1;mode='none';$('controlMode').value='none';busy=false;wait=1.2;scene.sync(game.board);scene.setCamera('director');document.querySelectorAll('[data-camera]').forEach(b=>b.classList.toggle('active',b.dataset.camera==='director'));$('seedText').textContent=seed;$('seedInput').value=seed;const p=profile(seed);for(const s of ['red','black']){$(s+'Name').textContent=p[s].name;$(s+'Style').textContent=p[s].style;}$('bookName').textContent=p.book.name;$('result').hidden=true;$('lastMove').textContent=replay?'同一方战场，再见两军交锋':'两军列阵，红方先行';$('comment').textContent=`${p.red.name}对阵${p.black.name} · ${p.book.name}开局`;$('moveBadge').textContent='序';renderRecords();updateEval();syncSettings();setPaused(false);}
function newSeed(){const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);newGame('CH-'+bytes[0].toString(36).toUpperCase());}
$('newBtn').onclick=newSeed;$('resultNew').onclick=newSeed;$('replayBtn').onclick=()=>{const replay=moveLog.map(x=>structuredClone(x));const base={...initialSettings};newGame(seed,{replay,base});toast('已重放本局种子与设置记录。');};
$('pauseBtn').onclick=()=>setPaused(!paused);
$('stepBtn').onclick=()=>{if(gameOver)return;single=true;setPaused(false);if(!busy){wait=0;queueAI();}};
$('undoBtn').onclick=()=>{if(!game.history.length)return;cancelAI();const m=game.undo();moveLog.pop();replayLog=null;scene.sync(game.board,captured());busy=false;single=false;selected=-1;gameOver=false;$('result').hidden=true;setPaused(true);renderRecords();updateEval(evaluate(game.board,profile(seed)));$('lastMove').textContent=`已撤销 · ${m.label}`;$('comment').textContent='对局已暂停，可继续观战或接管。';renderStatus();};
$('controlMode').onchange=()=>{mode=$('controlMode').value;replayLog=null;cancelAI();selected=-1;scene.highlight([]);wait=.6;renderStatus();};
$('settingsBtn').onclick=()=>{$('settings').showModal();};$('helpBtn').onclick=()=>{$('help').showModal();};
$('applySeed').onclick=()=>{newGame($('seedInput').value);$('settings').close();};
$('temperature').oninput=()=>{settings.temperature=Number($('temperature').value);$('tempValue').value=settings.temperature.toFixed(2);if(worker||pending){cancelAI();wait=.3;}};
$('depth').onchange=()=>{settings.depth=Number($('depth').value);if(worker||pending){cancelAI();wait=.3;}};
$('openingToggle').onchange=()=>{settings.book=$('openingToggle').checked;if(worker||pending){cancelAI();wait=.3;}};
$('effectsToggle').onchange=()=>{scene.effects=$('effectsToggle').checked;};
$('speed').onchange=()=>{scene.speed=Number($('speed').value);};
for(const b of document.querySelectorAll('[data-camera]'))b.onclick=()=>{scene.setCamera(b.dataset.camera);document.querySelectorAll('[data-camera]').forEach(x=>x.classList.toggle('active',x===b));};
$('audioBtn').onclick=()=>{audio=!audio;$('audioBtn').style.color=audio?'#a44734':'';$('audioBtn').setAttribute('aria-label',audio?'关闭声音':'启用声音');toast(audio?'落子声音已开启':'落子声音已关闭');sound();};
$('fullscreenBtn').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('当前浏览器不支持全屏。');}};
$('copySeed').onclick=async()=>{try{await navigator.clipboard.writeText(seed);toast('种子已复制');}catch{toast('当前种子：'+seed);}};
$('exportBtn').onclick=()=>{const p=profile(seed),lines=[];for(let i=0;i<game.history.length;i+=2)lines.push(`${i/2+1}. ${game.history[i].label}  ${game.history[i+1]?.label??''}`);const data={title:'楚河汉界 · 桌上兵事',version:1,seed,initialSettings,red:p.red.name,black:p.black.name,opening:p.book.name,rules:{threefold:true,noCapturePlies:120,maxPlies:600,stalemate:'loss'},result:game.status(),notation:lines,moves:moveLog};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`楚河汉界_${seed.replace(/[^\w-]/g,'_')}_棋谱.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('棋谱、种子与设置记录已导出。');};
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||document.querySelector('dialog[open]'))return;if(e.code==='Space'){e.preventDefault();$('pauseBtn').click();}if(e.code==='ArrowRight'){e.preventDefault();$('stepBtn').click();}});
try{scene=new BattleScene($('stage'),selectSquare,frame);scene.onImpact=()=>sound(true);newGame(seed);if(!check.pass)setPaused(true);$('loading').hidden=true;if(scene.compatibility){$('engineStatus').title='当前浏览器禁用 WebGL，已使用 Canvas 兼容渲染';$('playState').title='Canvas 兼容模式';}}catch(error){console.error(error);$('loading').innerHTML='<span class="loading-seal">!</span><p>三维场景未能启动，请使用支持 WebGL 2 的浏览器。</p>';setPaused(true);}
// Read-only diagnostics for reproducibility and UI acceptance checks.
window.chuhe=Object.freeze({snapshot:()=>game.snapshot(),history:()=>structuredClone(moveLog),status:()=>({seed,paused,busy,mode,settings:{...settings},animation:!!scene?.animation,selfTest:check,...game.status()}),camera:()=>scene?.cameraMode});
