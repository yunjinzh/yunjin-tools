const FALL_COLORS=[['#f6df96','#d6b657'],['#cae5d4','#8cb59d'],['#f0c5ad','#cf9575'],['#d5e4f1','#93b2cc'],['#e6d8ed','#b59fc2'],['#eddfbd','#c3ae7e']];
let fall=null,fallUnit=state.unit,fallLesson=0,fallSpeed=4.5,fallRaf=null,fallTime=0,fallRevision=-1,fallLastPaint=0,fallLastWord=null;
const originalRender=render,originalGo=go,originalValidate=validate,originalRenderRecord=renderRecord;
function fallWords(u,l){const primary=levelWords(u,l),list=[...primary],unit=unitWords(u);for(let i=l*6-1;i>=0&&new Set(list.map(w=>norm(w.en))).size<3;i--)list.unshift(unit[i]);return list}
function fallGroupLabel(u,l){const n=levelWords(u,l).length,extra=fallWords(u,l).length-n;return '第 '+(l+1)+' 组 · '+n+' 个词'+(extra?' + '+extra+' 个复习':'')}
function checkFallData(f){
  if(!f||typeof f!=='object'||Array.isArray(f)||!f.best||typeof f.best!=='object'||Array.isArray(f.best)||!f.words||typeof f.words!=='object'||Array.isArray(f.words))throw Error('下落挑战记录格式不正确');
  for(const [k,r]of Object.entries(f.best)){const [u,l,...rest]=k.split(':').map(Number);if(rest.length||!Number.isInteger(u)||u<0||u>9||!Number.isInteger(l)||l<0||l>=lessons(u)||!r||!['score','cleared','chain','seconds','rounds','tier'].every(n=>Number.isFinite(r[n])&&r[n]>=0)||r.tier>15)throw Error('下落关卡记录格式不正确')}
  for(const [k,n]of Object.entries(f.words))if(!W.has(k)||!Number.isFinite(n)||n<0)throw Error('下落单词记录格式不正确');
  return f;
}
validate=function(s){originalValidate(s);if(s.falling)checkFallData(s.falling);return s};
function fallSave(){try{if(state.falling)return checkFallData(state.falling)}catch{}return state.falling={best:{},words:{}}}
function fallBest(u=fallUnit,l=fallLesson){return fallSave().best[u+':'+l]||{score:0,cleared:0,chain:0,seconds:0,rounds:0,tier:0}}
function fallColor(wid){const w=W.get(wid),pool=fall?.pool||levelWords(fallUnit,fallLesson),i=Math.max(0,pool.findIndex(x=>norm(x.en)===norm(w.en)));const [face,edge]=FALL_COLORS[i%6];return `--face:${face};--edge:${edge}`}
function fallWordTile(wid,cls='',style=''){const w=W.get(wid);return `<div class="${cls} ${w.en.length>13?'long':''}" style="${fallColor(wid)};${style}">${esc(w.en)}</div>`}
function fallLabel(s){if($('fallMessage'))$('fallMessage').innerHTML=s}
function makeFall(u=fallUnit,l=fallLesson){
  cancelFallLoop();fallUnit=u;fallLesson=l;
  fall=new WordFallEngine(fallWords(u,l),{speed:fallSpeed,motion:motionOK()});
  fall.unit=u;fall.lesson=l;fallLastWord=null;fallRevision=-1;fallTime=0;
}
function storeFallRound(){
  if(!fall||fall.recorded||fall.phase==='ready')return 0;
  const f=fallSave(),k=fall.unit+':'+fall.lesson,old=fallBest(fall.unit,fall.lesson);
  const tier=Math.min(15,Math.floor(fall.cleared/6)),gain=Math.max(0,tier-old.tier);
  f.best[k]={score:Math.max(old.score,fall.score),cleared:Math.max(old.cleared,fall.cleared),chain:Math.max(old.chain,fall.bestChain),seconds:Math.max(old.seconds,Math.floor(fall.elapsed/1000)),rounds:old.rounds+1,tier:Math.max(old.tier,tier)};
  for(const [id,n]of Object.entries(fall.clearedWords))f.words[id]=(f.words[id]||0)+n;
  state.seeds+=gain;state.earned+=gain;fall.recorded=true;fall.reward=gain;save();header();return gain;
}
function switchFall(u,l){storeFallRound();makeFall(u,l);fallSave().unit=u;fallSave().lesson=l;fallSave().speed=fallSpeed;save();render()}
function cancelFallLoop(){if(fallRaf!==null){cancelAnimationFrame(fallRaf);fallRaf=null}fallTime=0}
function pauseFall(){if(!fall||fall.phase==='ready'||fall.phase==='over')return;fall.paused=true;cancelFallLoop();if(view==='fall')paintFall(true)}
function resumeFall(){if(!fall||fall.phase==='over')return;if(fall.phase==='ready')fall.start();fall.paused=false;fallTime=0;fallLastPaint=0;consumeFallEvents();paintFall(true);runFallLoop()}
function runFallLoop(){
  if(fallRaf!==null||view!=='fall'||!fall||fall.paused||['ready','over'].includes(fall.phase))return;
  fallRaf=requestAnimationFrame(function loop(time){
    fallRaf=null;if(view!=='fall'||fall.paused||['ready','over'].includes(fall.phase))return;
    const dt=fallTime?Math.min(time-fallTime,100):0;fallTime=time;fall.tick(dt);consumeFallEvents();
    if(time-fallLastPaint>=30||fall.revision!==fallRevision){paintFall();fallLastPaint=time}
    runFallLoop();
  });
}
function consumeFallEvents(){for(const event of fall.takeEvents()){
  if(event.type==='match'){chime(event.chain>=2?'combo':'pop');fallLabel(event.chain>=2?`<b>${event.chain} 连消！</b> 上面的单词也找到朋友了。`:`找到了！<b>${event.count} 张相同单词</b>一起消除。`)}
  if(event.type==='clear'){
    const words=[...new Set(event.tiles.map(t=>t.wid))];fallLastWord=W.get(words[0]);
    fallLabel(event.empty?`<b>全清奖励 +150！</b> 容器又有大大的空间啦。`:`<b>${event.chain>=2?event.chain+' 连消 · ':''}+${event.gain} 分</b>，${event.tiles.length} 张单词卡片被你收好。`);
    if(state.autoVoice&&fallLastWord)speak(fallLastWord.en);
    if(event.empty||event.chain>=2)confetti();
    paintFallLatest();
  }
  if(event.type==='danger')fallLabel('<b>顶部亮起提醒啦。</b> 还有 6 秒，快把高处的同词连起来！');
  if(event.type==='over'){cancelFallLoop();storeFallRound();paintFall(true);showFallResult()}
}}
function moveFall(c){if(!fall)return;const moved=fall.moveTo(c);if(!moved&&!fall.paused&&fall.phase==='falling')fallLabel('这边的卡片挡住了，试试另一列，或先让当前单词落下。');paintFall()}
function dropFall(){if(!fall)return;fall.drop();consumeFallEvents();paintFall(true)}
function fallPoolMarkup(){return `<div class="fall-pool">${fall.pool.map(w=>`<div class="fall-pool-row"><i class="fall-pool-dot" style="${fallColor(w.id)}"></i><div><b>${esc(w.en)}</b><small>${esc(w.zh)}</small></div><button data-fall-speak="${w.id}" aria-label="朗读 ${esc(w.en)}">♫</button></div>`).join('')}</div>`}
function renderFall(){
  if(!fall)makeFall();
  const c=UNITS[fallUnit],best=fallBest();
  $('app').innerHTML=`<div class="fall-frame"><aside class="rail"><div class="rail-title"><h3>教材路线</h3><small>10 站</small></div><div class="unit-list">${UNITS.map((u,i)=>`<button class="unit-btn ${i===fallUnit?'active':''}" data-fall-unit="${i}"><span class="unit-icon">${u[2]}</span><div><strong>${u[0]}</strong><small>${u[1]}</small></div></button>`).join('')}</div><div class="rail-foot">单词依教材顺序分组。<br>每组最多 6 个词，反复相遇、慢慢记住。</div></aside><section class="fall-center"><div class="fall-head"><div><div class="fall-kicker">WORD POP · 下落挑战</div><h1>${c[1]}消消乐</h1></div><button id="fallPause" class="tiny-btn fall-pause">暂停</button></div><div class="fall-selectors"><select id="fallUnit" class="fall-unit-mobile" aria-label="选择教材单元">${UNITS.map((u,i)=>`<option value="${i}" ${i===fallUnit?'selected':''}>${u[0]} · ${u[1]}</option>`).join('')}</select><select id="fallGroup" aria-label="选择单词组">${Array.from({length:lessons(fallUnit)},(_,l)=>`<option value="${l}" ${l===fallLesson?'selected':''}>${fallGroupLabel(fallUnit,l)}</option>`).join('')}</select><select id="fallSpeed" aria-label="选择下落速度">${[[6,'慢慢来'],[4.5,'标准挑战'],[3,'高手挑战']].map(([v,t])=>`<option value="${v}" ${v===fallSpeed?'selected':''}>${t}</option>`).join('')}</select><button id="fallRestart" class="tiny-btn">重新开始</button></div><div class="fall-shell"><div class="fall-meters"><div class="fall-metric"><b id="fallScore">${fall.score}</b>本轮得分</div><span id="fallChain" class="fall-chain">3 张相连就消除</span><div class="fall-metric right"><b id="fallCleared">${fall.cleared}</b>已消除卡片</div></div><div class="fall-next"><span class="fall-next-label">接下来</span><div id="fallQueue" class="fall-next-cards"></div></div><div id="fallVessel" class="fall-vessel" tabindex="0" role="application" aria-label="下落单词容器。左右方向键移动，向下或空格快速落下，P 暂停。"><div id="fallGhostLayer" class="fall-board-layer"></div><div id="fallSettled" class="fall-board-layer"></div><div id="fallActiveLayer" class="fall-board-layer"></div><div id="fallShade" class="fall-shade"></div></div><div class="fall-status"><span id="fallCapacity">容器 0 / 32</span><strong id="fallDanger"></strong><span id="fallClock">00:00</span></div><div id="fallFill" class="fall-fill"><i id="fallFillBar"></i></div><div class="fall-controls"><div class="fall-column-buttons">${[0,1,2,3].map(c=>`<button data-fall-col="${c}" aria-label="移动到第 ${c+1} 列">第 ${c+1} 列</button>`).join('')}</div><button id="fallDrop" class="btn yellow fall-drop">快速落下</button></div><p class="fall-key-hint">点选一列移动 · 方向键左右移动 · 空格快速落下 · P 暂停</p></div><div id="fallMessage" class="fall-notice" role="status" aria-live="polite">让 <b>3 张相同英文</b>上下左右相连，就会自动消除。拐弯也算！</div><div id="fallLatest" class="fall-latest"><div><b>小芽陪你挑战</b><span>每次消除，都会带你再认识一次单词。</span></div><button id="fallVoice" class="tiny-btn">${state.autoVoice?'♫ 朗读开':'♫ 朗读关'}</button></div><details class="fall-mobile-pool"><summary>本组单词 · 点开听读</summary>${fallPoolMarkup()}</details></section><aside class="fall-aside"><div class="buddy-card"><img class="buddy-art" src="${ART}" alt="小龙小芽陪你收集单词"><div class="buddy-caption"><h3>把单词接在一起！</h3><p>看看上方预告，给下一个单词留个好位置。</p></div></div><div class="card"><h3>本组单词 · 听读卡</h3>${fallPoolMarkup()}</div><div class="card"><h3>这一组的小纪录</h3><div class="stat-line"><span>最高分</span><strong id="fallBestScore">${best.score}</strong></div><div class="stat-line"><span>最多连消</span><strong>${best.chain}</strong></div><p class="fall-legend">单轮最高消除纪录每增加 <strong>6 张</strong>提升一个种子奖励档位；每组最高 15 档，刷新纪录领取差额。</p><button id="fallGarden" class="btn secondary wide" style="margin-top:13px">🌱 我的花园</button></div></aside></div>`;
  $('fallPause').onclick=()=>fall.paused||fall.phase==='ready'?resumeFall():pauseFall();
  $('fallRestart').onclick=()=>{storeFallRound();makeFall();render();resumeFall()};
  $('fallGroup').onchange=e=>switchFall(fallUnit,+e.target.value);
  $('fallUnit').onchange=e=>switchFall(+e.target.value,0);
  $('fallSpeed').onchange=e=>{fallSpeed=+e.target.value;storeFallRound();fallSave().speed=fallSpeed;makeFall();save();render()};
  $('fallDrop').onclick=dropFall;$('fallGarden').onclick=()=>go('garden');
  $('fallVoice').onclick=()=>{state.autoVoice=!state.autoVoice;save();$('fallVoice').textContent=state.autoVoice?'♫ 朗读开':'♫ 朗读关'};
  document.querySelectorAll('[data-fall-unit]').forEach(b=>b.onclick=()=>switchFall(+b.dataset.fallUnit,0));
  document.querySelectorAll('[data-fall-col]').forEach(b=>b.onclick=()=>moveFall(+b.dataset.fallCol));
  document.querySelectorAll('[data-fall-speak]').forEach(b=>b.onclick=()=>speak(W.get(b.dataset.fallSpeak).en));
  const vessel=$('fallVessel');vessel.onclick=e=>{if(e.target.closest('button')||fall.paused||fall.phase==='ready')return;const r=vessel.getBoundingClientRect();moveFall(Math.min(3,Math.max(0,Math.floor((e.clientX-r.left)/r.width*4))));vessel.focus()};
  fallRevision=-1;paintFall(true);paintFallLatest();if(!fall.paused)runFallLoop();
}
function paintFallLatest(){
  if(view!=='fall'||!fallLastWord)return;
  const w=fallLastWord;
  $('fallLatest').innerHTML=`<div><b>${esc(w.en)}</b><span>${esc(w.zh)}</span></div><button id="fallListenLast" class="tiny-btn" aria-label="再次朗读 ${esc(w.en)}">♫ 再听</button><button id="fallVoice" class="tiny-btn">${state.autoVoice?'♫ 朗读开':'♫ 朗读关'}</button>`;
  $('fallListenLast').onclick=()=>speak(w.en);$('fallVoice').onclick=()=>{state.autoVoice=!state.autoVoice;save();paintFallLatest()};
}
function paintFall(force=false){
  if(view!=='fall'||!fall||!$('fallVessel'))return;
  const stable=force||fallRevision!==fall.revision;
  if(stable){
    const ids=new Set(fall.pending.map(([r,c])=>fall.grid[r][c]?.id));
    const layer=$('fallSettled'),present=new Map([...layer.children].map(el=>[+el.dataset.fallId,el])),keep=new Set();
    for(let r=0;r<fall.rows;r++)for(let c=0;c<fall.cols;c++){const t=fall.grid[r][c];if(!t)continue;keep.add(t.id);let el=present.get(t.id);if(!el){el=document.createElement('div');el.dataset.fallId=t.id;el.textContent=W.get(t.wid).en;layer.appendChild(el)}el.className='fall-tile'+(W.get(t.wid).en.length>13?' long':'')+(ids.has(t.id)?' clearing':'');el.style.cssText=fallColor(t.wid)+`;--c:${c};--r:${r}`;}
    for(const [id,el]of present)if(!keep.has(id))el.remove();
    $('fallQueue').innerHTML=fall.queue.slice(0,3).map(w=>fallWordTile(w.id,'fall-preview')).join('');
    fallRevision=fall.revision;
  }
  const a=fall.active,activeLayer=$('fallActiveLayer');
  if(a){
    if(activeLayer.dataset.id!==String(a.id)){activeLayer.innerHTML=fallWordTile(a.wid,'fall-tile moving',`--c:${a.col};--r:${a.y}`);activeLayer.dataset.id=String(a.id)}
    const el=activeLayer.firstElementChild;if(el){el.style.setProperty('--c',a.col);el.style.setProperty('--r',Math.min(a.y,fall.landing(a.col)))}
    const count=fall.previewCount();$('fallGhostLayer').innerHTML=fallWordTile(a.wid,'fall-ghost'+(count>=3?' can-clear':''),`--c:${a.col};--r:${fall.landing(a.col)}`);
    $('fallChain').textContent=count>=3?'落下可消 '+count+' 张':fall.bestChain>=2?'最佳 '+fall.bestChain+' 连消':'3 张相连就消除';
  }else{activeLayer.innerHTML='';activeLayer.dataset.id='';$('fallGhostLayer').innerHTML='';if(fall.phase==='clearing')$('fallChain').textContent=fall.chain>=2?fall.chain+' 连消！':'找到同词朋友！'}
  $('fallScore').textContent=fall.score;$('fallCleared').textContent=fall.cleared;
  $('fallCapacity').textContent='容器 '+fall.fill()+' / 32';const sec=Math.floor(fall.elapsed/1000);$('fallClock').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
  $('fallFillBar').style.width=fall.fill()/32*100+'%';const high=fall.maxHeight()>=6;$('fallVessel').classList.toggle('danger',high);$('fallFill').classList.toggle('danger',high);
  $('fallDanger').textContent=fall.danger>0&&fall.phase!=='over'?'触顶倒计时 '+Math.ceil(fall.danger/1000)+' 秒':high?'接近顶线啦':'';
  $('fallPause').textContent=fall.phase==='ready'?'开始挑战':fall.paused?'继续挑战':'暂停';$('fallPause').disabled=fall.phase==='over';
  const disabled=fall.paused||fall.phase!=='falling';$('fallDrop').disabled=disabled;
  document.querySelectorAll('[data-fall-col]').forEach(b=>{b.disabled=disabled;b.classList.toggle('chosen',!!a&&+b.dataset.fallCol===a.col)});
  const shade=$('fallShade'),mode=fall.phase==='ready'?'ready':fall.paused?'paused':fall.phase==='over'?'over':'live';
  shade.classList.toggle('hidden',mode==='live');
  if(shade.dataset.mode!==mode||force){shade.dataset.mode=mode;
    if(mode==='ready')shade.innerHTML=`<span class="shade-icon">🌱</span><h2>让单词朋友连起来</h2><div class="fall-directions">${Array.from({length:3},()=>`<span class="mini-word">${esc(fall.pool[0].en)}</span>`).join('')}</div><p>相同单词上下左右连成 3 张，就会消除。选好一列，接住不断落下的新单词！</p><button id="fallStart" class="btn yellow">开始挑战</button><span class="small muted">容器堆满，本轮结束。随时可以暂停。</span>`;
    if(mode==='paused')shade.innerHTML='<span class="shade-icon">☕</span><h2>歇一歇，单词也等你</h2><p>下落和触顶倒计时都已暂停。</p><button id="fallResume" class="btn yellow">继续挑战</button>';
    if(mode==='over')shade.innerHTML='<span class="shade-icon">🌼</span><h2>这一轮的进步收好啦</h2><p>换个落点，再试一次。</p><button id="fallShowResult" class="btn yellow">看看本轮收获</button>';
    if(mode==='ready')$('fallStart').onclick=()=>{resumeFall();$('fallVessel').focus()};if(mode==='paused')$('fallResume').onclick=()=>{resumeFall();$('fallVessel').focus()};if(mode==='over')$('fallShowResult').onclick=showFallResult;
  }
}
function showFallResult(){
  const d=$('fallResult'),words=[...fall.seen].map(id=>W.get(id)),u=fall.unit,l=fall.lesson,nextL=l+1<lessons(u)?l+1:0,nextU=l+1<lessons(u)?u:u+1;
  d.innerHTML=`<div class="trophy">${fall.cleared?'🌟':'🌱'}</div><div class="mode-label">${UNITS[u][0]} · 第 ${l+1} 组 · 下落挑战</div><h2 id="fallResultTitle">${fall.cleared?'你的单词收获，亮晶晶！':'每次尝试，都在熟悉单词'}</h2><p>${fall.reason==='full'?'容器已经堆满，本轮结束。':fall.reason==='ceiling'?'单词触顶超过 6 秒，本轮结束。':'这一轮已收好。'}${fall.cleared?'你消除了 '+fall.cleared+' 张单词卡片。':'再来一次，试着把相同单词放在相邻位置。'}</p><div class="result-grid"><div><b>${fall.score}</b><small>本轮得分</small></div><div><b>${fall.bestChain}</b><small>最多连消</small></div><div><b>+${fall.reward||0}</b><small>花园种子</small></div></div><div class="fall-summary-note">${fall.reward?'这组的消除纪录进步啦，新增种子已经收好。':'每组每提高 6 张消除纪录获得 1 颗种子，最多 15 颗。'}<br>接下来把遇到的单词再拼一次，让它们留得更牢。</div><div class="result-words">${words.map(w=>`<div class="result-word"><div><b>${esc(w.en)}</b><p>${esc(w.zh)}</p></div><button class="tiny-btn" data-result-speak="${w.id}" aria-label="朗读 ${esc(w.en)}">♫ 听读</button></div>`).join('')}</div><div class="actions"><button id="fallAgain" class="btn yellow">再挑战一次</button>${words.length?'<button id="fallPractice" class="btn">练习本轮拼写</button>':''}${nextU<10?'<button id="fallNextGroup" class="btn secondary">'+(nextU===u?'下一组单词':'进入 '+UNITS[nextU][0])+'</button>':''}<button id="fallResultGarden" class="btn secondary">去花园</button><button id="fallResultClose" class="btn secondary">休息一下</button></div>`;
  $('fallAgain').onclick=()=>{d.close();makeFall();render();resumeFall()};
  if(words.length)$('fallPractice').onclick=()=>{d.close();startLevel(u,0,'spell',words)};
  if(nextU<10)$('fallNextGroup').onclick=()=>{d.close();switchFall(nextU,nextL)};
  $('fallResultGarden').onclick=()=>{d.close();go('garden')};$('fallResultClose').onclick=()=>d.close();
  document.querySelectorAll('[data-result-speak]').forEach(b=>b.onclick=()=>speak(W.get(b.dataset.resultSpeak).en));if(!d.open)d.showModal();
}
render=function(){if(view==='fall'){header();renderFall()}else originalRender()};
go=function(v){if(view==='fall'&&v!=='fall')pauseFall();if(v==='fall'){if(!canNavigate())return;view='fall';render();window.scrollTo(0,0)}else originalGo(v)};
renderRecord=function(){originalRenderRecord();const f=fallSave(),records=Object.values(f.best),rounds=records.reduce((n,r)=>n+r.rounds,0),best=records.reduce((n,r)=>Math.max(n,r.score),0),el=document.createElement('section');el.className='card fall-mini-record';el.innerHTML=`<h3>下落挑战 · 已收好的纪录</h3><div class="stat-grid"><div><b>${rounds}</b><p>完成轮次</p></div><div><b>${best}</b><p>最高单轮得分</p></div><div><b>${Object.keys(f.words).length}</b><p>曾消除的词条</p></div></div><p>同词消除与独立拼写分别记录。下落挑战纪录随“导出存档”一并保存。</p>`;$('app').appendChild(el)};
document.addEventListener('keydown',e=>{
  if(view!=='fall'||!fall||document.querySelector('dialog[open]')||/INPUT|SELECT|TEXTAREA/.test(e.target?.tagName)||e.target?.isContentEditable)return;
  if((e.code==='Space'||e.key==='Enter')&&e.target?.tagName==='BUTTON')return;
  if(e.key.toLowerCase()==='p'||e.key==='Escape'){e.preventDefault();if(fall.phase==='ready'||fall.paused)resumeFall();else pauseFall();return}
  if(fall.paused||fall.phase==='over'||fall.phase==='ready')return;
  if(['ArrowLeft','ArrowRight','ArrowDown',' '].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')moveFall((fall.active?.col??0)-1);else if(e.key==='ArrowRight')moveFall((fall.active?.col??0)+1);else if(!e.repeat)dropFall()}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseFall()});
window.addEventListener('pagehide',()=>{pauseFall();storeFallRound()});
window.addEventListener('pageshow',e=>{if(e.persisted){makeFall();if(view==='fall')render()}});
$('helpBtn').onclick=()=>{if(view==='fall')pauseFall();$('helpDialog').showModal()};
const savedFall=fallSave();
if(Number.isInteger(savedFall.unit)&&savedFall.unit>=0&&savedFall.unit<=9){fallUnit=savedFall.unit;fallLesson=Number.isInteger(savedFall.lesson)&&savedFall.lesson>=0&&savedFall.lesson<lessons(fallUnit)?savedFall.lesson:0}
if([6,4.5,3].includes(savedFall.speed))fallSpeed=savedFall.speed;
view='fall';render();
