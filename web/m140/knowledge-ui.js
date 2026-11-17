import { KNOWLEDGE_TOPICS, HISTORY_ERAS, activeDynasties, recordKnowledgeVisit, recordKnowledgeAnswer, recordKnowledgeOrder } from './knowledge-model.js';
import { createKnowledgeScene } from './knowledge-scene.js';

const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const itemNames={sun:'太阳',moon:'月亮',star:'远方恒星',spring:'春',summer:'夏',autumn:'秋',winter:'冬',xia:'夏',shang:'商',zhou:'周',song:'宋',liao:'辽',jin:'金'};

/** The same learning actions work through DOM controls and the optional 3D view. */
export function createKnowledgeUI({getProgress,setProgress,getReduced,getCursor,setCursor,show,onCourse,stop=()=>{}}={}) {
 const root=document.querySelector('#knowledgeDialog'), $=s=>root.querySelector(s);
 let topic=KNOWLEDGE_TOPICS[0], selected=topic.items[0].id, year=1120, scene=null, available=false, flat=false, opened=false, quizOpen=false, sessionSolved=false, sessionHelp=false, wrong=[], orderMessage='',invalidated=false;
 const sameYearText=list=>list.length>1?list.map(x=>x.label||x.title).join('、')+'：这一年同时存在。':list.length?'这一年，本组比较中有：'+(list[0].label||list[0].title)+'。':'这一年不在本组政权的范围内。';
 const progress=()=>getProgress()[topic.id]||{seen:[],solved:false,helped:false};
 const listen=(text,label='听一听')=>`<button class="outline-btn listen-btn" data-say="${safe(text)}" aria-pressed="false">▷ ${label}</button>`;
 function remember(){setCursor({topic:topic.id,item:selected,year});}
 function selectItem(id){stop();if(!topic.items.some(x=>x.id===id))return;selected=id;setProgress(recordKnowledgeVisit(getProgress(),topic.id,id));remember();scene?.select(id);renderItems();renderFact();renderDiagram();if(topic.id==='history')renderHistory();}
 function renderItems(){
  const seen=progress().seen;
  $('#knowledgeItems').innerHTML=topic.items.map(x=>`<button class="knowledge-item" data-knowledge-item="${safe(x.id)}" aria-pressed="${selected===x.id}"><span>${safe(x.title)}</span><small>${selected===x.id?'正在看':seen.includes(x.id)?'看过了':'点我看看'}</small></button>`).join('');
  $('#knowledgeItems').querySelectorAll('button').forEach(b=>b.onclick=()=>selectItem(b.dataset.knowledgeItem));
 }
 function renderFact(){const item=topic.items.find(x=>x.id===selected);$('#knowledgeFact').innerHTML=`<span class="knowledge-overline">看见，再想一想</span><h3>${safe(item.title)}${item.pinyin?` <small>${safe(item.pinyin)}</small>`:''}</h3><p class="knowledge-summary">${safe(item.summary)}</p>${listen(item.title+'。'+item.summary,'听这个发现')}<details class="knowledge-more"><summary>再多了解一点</summary><p>${safe(item.detail)}</p></details>`;}
 function renderDiagram(){
  const stars=Array.from({length:32},(_,i)=>`<circle cx="${24+(i*97)%650}" cy="${27+(i*43)%305}" r="${i%4===0?1.8:1}" fill="#dac99c" opacity="${.25+(i%5)*.12}"/>`).join('');
  let drawing='';
  if(topic.id==='astronomy'){
   const highlight=id=>selected===id?'#e9ce86':'#8ea29c';
   drawing=`<defs><radialGradient id="ksSun"><stop stop-color="#fff3bf"/><stop offset=".7" stop-color="#eab95f"/><stop offset="1" stop-color="#bd663b"/></radialGradient><radialGradient id="ksGlow"><stop stop-color="#edc274" stop-opacity=".45"/><stop offset="1" stop-color="#edc274" stop-opacity="0"/></radialGradient><linearGradient id="ksMoon"><stop stop-color="#e9dfc5"/><stop offset=".48" stop-color="#b5b9a6"/><stop offset=".5" stop-color="#596e68"/><stop offset="1" stop-color="#294440"/></linearGradient></defs>${stars}<circle cx="159" cy="170" r="120" fill="url(#ksGlow)"/><circle cx="159" cy="170" r="64" fill="url(#ksSun)" stroke="${highlight('sun')}" stroke-width="${selected==='sun'?4:1}"/><path d="M244 150H330m-14-9 14 9-14 9M244 190H330m-14-9 14 9-14 9" stroke="#dfc179" fill="none" stroke-width="2"/><text x="287" y="128" fill="#e4cc96" font-size="16" text-anchor="middle">阳光</text><circle cx="405" cy="170" r="43" fill="url(#ksMoon)" stroke="${highlight('moon')}" stroke-width="${selected==='moon'?4:1}"/><circle cx="390" cy="155" r="8" fill="#7f8c7a" opacity=".5"/><circle cx="393" cy="183" r="5" fill="#7f8c7a" opacity=".5"/><circle cx="576" cy="102" r="13" fill="#d6e8e1"/><path d="M576 75v-12m0 78v-12m-27-27h-12m78 0h-12" stroke="#d6e8e1"/><circle cx="576" cy="102" r="26" fill="none" stroke="${highlight('star')}" stroke-dasharray="3 5"/><text x="159" y="275" fill="${highlight('sun')}" text-anchor="middle" font-size="23">太阳</text><text x="405" y="275" fill="${highlight('moon')}" text-anchor="middle" font-size="23">月亮</text><text x="576" y="163" fill="${highlight('star')}" text-anchor="middle" font-size="19">远方恒星</text><text x="350" y="332" fill="#a8bbb1" font-size="14" text-anchor="middle">示意图 · 大小和距离不按真实比例</text>`;
  }else if(topic.id==='seasons'){
   const colors={spring:['#a9c990','#5d9e7e'],summer:['#5fa278','#255b4b'],autumn:['#efcf73','#b9923e'],winter:['#cbd5cc','#839b90']},[leaf,shadow]=colors[selected];
   const leaves=selected==='winter'?'':Array.from({length:selected==='spring'?35:65},(_,i)=>{const a=i*2.4,r=22+Math.sqrt(i)*11,x=350+Math.cos(a)*r,y=136+Math.sin(a)*r*.7;return `<path d="M${x} ${y+13}q-27-30 0-33q27 3 0 33" fill="${i%3?leaf:shadow}" opacity="${.7+(i%3)*.1}"/>`;}).join('');
   const fall=selected==='autumn'?Array.from({length:12},(_,i)=>`<ellipse cx="${265+i*15}" cy="${282+(i%3)*6}" rx="7" ry="3" fill="${leaf}" transform="rotate(${i*11} ${265+i*15} ${282+(i%3)*6})"/>`).join(''):'';
   drawing=`<defs><radialGradient id="ksTreeGlow"><stop stop-color="${leaf}" stop-opacity=".17"/><stop offset="1" stop-color="${leaf}" stop-opacity="0"/></radialGradient></defs><circle cx="350" cy="165" r="170" fill="url(#ksTreeGlow)"/><ellipse cx="350" cy="290" rx="160" ry="33" fill="#8ca594" opacity=".12"/><ellipse cx="350" cy="285" rx="117" ry="25" fill="#425e4c"/><path d="M348 279l4-133m0 65-45-45m44 21 51-51m-51 30-22-45m23 25 15-50" stroke="#b4a580" stroke-width="${selected==='winter'?7:10}" stroke-linecap="round" fill="none"/>${leaves}${fall}<text x="350" y="340" fill="#e5d6b2" font-size="19" text-anchor="middle">${itemNames[selected]} · 同一棵银杏</text><text x="80" y="50" fill="#9eb9a6" font-size="14">北半球温带示例</text>`;
  }else{
   const early=['xia','shang','zhou'].includes(selected),keys=early?['xia','shang','zhou']:['song','liao','jin'];
   drawing=`<path d="M90 280Q350 315 610 280" stroke="#7f9e8d" stroke-width="1" fill="none"/>${keys.map((id,i)=>`<g transform="translate(${140+i*210} 115)"><path d="M-53 140 0 161 53 140V-10L0-31-53-10Z" fill="${selected===id?'#527666':'#294d46'}" stroke="${selected===id?'#e1c785':'#769181'}" stroke-width="2"/><path d="M0-31V161m0-40 53-21" stroke="#c2bd9440"/><text x="-22" y="58" fill="#eddbad" font-size="34" text-anchor="middle">${itemNames[id]}</text><text x="0" y="193" fill="#a8bba9" font-size="16" text-anchor="middle">${early?['先','再','后来'][i]:'时间会重叠'}</text></g>`).join('')}${early?'<path d="M205 173h70m-12-8 12 8-12 8M415 173h70m-12-8 12 8-12 8" fill="none" stroke="#dcc589"/>':'<path d="M105 78h490" stroke="#dcc589" stroke-dasharray="6 6"/><text x="350" y="53" fill="#e2cca2" text-anchor="middle" font-size="18">同一段历史，可以有多个政权</text>'}`;
  }
  $('#knowledgeDiagram').innerHTML=`<svg viewBox="0 0 700 370" role="img" aria-label="${safe(topic.title+'：'+topic.items.find(x=>x.id===selected).summary)}">${drawing}</svg>`;
 }
 function renderHistory(){
  const host=$('#knowledgeHistory');host.hidden=topic.id!=='history';if(host.hidden)return;
  const order=progress().order||[],good=order.length===3&&order.join(',')==='xia,shang,zhou',active=activeDynasties(year);
  const barMin=900,barMax=1300,span=barMax-barMin;
  host.innerHTML=`<section class="knowledge-order"><h3>先接一接：夏、商、周</h3><p>点字牌放进去；点已放好的牌可以拿回来。</p><div class="knowledge-order-slots">${[0,1,2].map(i=>`<button data-lab-slot="${i}" ${!order[i]?'disabled':''} aria-label="${order[i]?'拿回'+itemNames[order[i]]:'第'+(i+1)+'个位置'}">${order[i]?itemNames[order[i]]:'·'}</button>`).join('')}</div><div class="knowledge-order-pieces">${['xia','shang','zhou'].map(id=>`<button data-lab-piece="${id}" ${order.includes(id)?'disabled':''}>${itemNames[id]}</button>`).join('')}<button id="knowledgeOrderCheck" class="outline-btn" ${order.length===3?'':'disabled'}>接好了吗？</button></div><p class="knowledge-order-result" role="status">${safe(orderMessage||(good?'顺序是夏、商、周。再看看同时存在是什么样。':''))}</p></section><section class="knowledge-timeline"><h3>再看同一年</h3><label for="knowledgeYear">公元 <strong id="knowledgeYearLabel">${year}</strong> 年</label><input id="knowledgeYear" type="range" min="1000" max="1250" step="1" value="${year}" aria-label="查看公元哪一年的政权" aria-valuetext="公元${year}年"><div class="knowledge-years">${[1100,1120,1150].map(y=>`<button class="outline-btn" data-lab-year="${y}">${y} 年</button>`).join('')}</div><p id="knowledgeSameYear" class="knowledge-same-year" role="status">${safe(sameYearText(active))}</p><div class="knowledge-era-bars">${HISTORY_ERAS.map(e=>`<div class="knowledge-era-row"><span>${safe(e.title)}</span><div><i style="left:${(e.start-barMin)/span*100}%;width:${(e.end-e.start)/span*100}%;background:${safe(e.color)}">${e.start}–${e.end}</i><b style="left:${(year-barMin)/span*100}%"></b></div></div>`).join('')}<div class="knowledge-era-scale"><span>900</span><span>1100</span><span>1300 年</span></div></div><p class="knowledge-caption">时间条按年份排列；宋包括北宋与南宋。开端与结束年份仅作概览，同一年内仍可能发生更替。</p></section>`;
  host.querySelectorAll('[data-lab-piece]').forEach(b=>b.onclick=()=>{setProgress(recordKnowledgeOrder(getProgress(),[...order,b.dataset.labPiece]));orderMessage='';selectItem(b.dataset.labPiece)});
  host.querySelectorAll('[data-lab-slot]').forEach(b=>b.onclick=()=>{setProgress(recordKnowledgeOrder(getProgress(),order.filter((_,i)=>i!==Number(b.dataset.labSlot))));orderMessage='';renderHistory()});
  $('#knowledgeOrderCheck').onclick=()=>{orderMessage=good?'✓ 接好了：夏，然后商，再到周。':'可以再看上面的顺序提示，再接一次。';renderHistory()};
  const updateYear=value=>{stop();year=Number(value);selected='song';setProgress(recordKnowledgeVisit(getProgress(),topic.id,'song'));remember();scene?.select('song');renderItems();renderFact();renderDiagram();const live=activeDynasties(year);$('#knowledgeYearLabel').textContent=String(year);$('#knowledgeYear').setAttribute('aria-valuetext',`公元${year}年`);$('#knowledgeSameYear').textContent=sameYearText(live);host.querySelectorAll('.knowledge-era-row b').forEach(b=>b.style.left=(year-barMin)/span*100+'%')};
  $('#knowledgeYear').oninput=e=>updateYear(e.target.value);host.querySelectorAll('[data-lab-year]').forEach(b=>b.onclick=()=>{updateYear(b.dataset.labYear);$('#knowledgeYear').value=String(year)});
 }
 function renderQuestion(){
  stop();
  const p=progress(),done=sessionSolved,helped=sessionHelp,q=topic.question,host=$('#knowledgeQuestion');
  if(!quizOpen){host.innerHTML=`<button class="primary" id="knowledgeTry">${p.solved?'再想一想':'我来试一试'} →</button><p class="knowledge-caption">也可以只观察，随时停下来。</p>`;$('#knowledgeTry').onclick=()=>{quizOpen=true;wrong=[];renderQuestion();$('#knowledgeQuestionHeading').focus()};return;}
  host.innerHTML=`<h3 id="knowledgeQuestionHeading" tabindex="-1">${safe(q.prompt)}</h3>${listen(q.prompt+'。选项是：'+q.options.map(x=>x.text).join('，或，'),'听题目与选项')}<div class="knowledge-answers">${q.options.map(x=>`<button class="answer-option ${done&&x.id===q.answer?'correct':''}" data-knowledge-answer="${safe(x.id)}" ${done||wrong.includes(x.id)?'disabled':''}>${done&&x.id===q.answer?'✓ ':''}${safe(x.text)}</button>`).join('')}</div><p class="knowledge-question-feedback" role="status">${done?'✓ 找对了。'+safe(q.explanation):wrong.length?'再看看上面的发现，不急着回答。':''}</p>${done?'<p class="knowledge-caption">这次试过了。找个机会，用自己的话讲给别人听。</p>':'<button class="text-link" id="knowledgeHint">看看提示</button>'}${!done&&helped?`<aside class="gentle-hint">${safe(q.explanation)}${listen(q.explanation,'听提示')}</aside>`:''}`;
  host.querySelectorAll('[data-knowledge-answer]').forEach(b=>b.onclick=()=>{const correct=b.dataset.knowledgeAnswer===q.answer;if(!correct){wrong.push(b.dataset.knowledgeAnswer);sessionHelp=true}else sessionSolved=true;setProgress(recordKnowledgeAnswer(getProgress(),topic.id,{correct,helped:sessionHelp||wrong.length>0}));renderQuestion()});
  if($('#knowledgeHint'))$('#knowledgeHint').onclick=()=>{sessionHelp=true;setProgress(recordKnowledgeAnswer(getProgress(),topic.id,{correct:false,helped:true}));renderQuestion()};
 }
 function renderTopic(){
  $('#knowledgeTabs').innerHTML=KNOWLEDGE_TOPICS.map((t,i)=>`<button data-lab-topic="${t.id}" aria-pressed="${topic.id===t.id}"><span>0${i+1}</span>${safe({astronomy:'日月星',seasons:'四季树',history:'时间卡'}[t.id])}</button>`).join('');
  $('#knowledgeTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>open(b.dataset.labTopic));
  $('#knowledgeGoal').textContent=topic.goal;$('#knowledgeSubtitle').textContent=topic.subtitle;
  $('#knowledgeNote').textContent=topic.note;
  $('#knowledgeRelated').innerHTML=`<span>回到书里读一读</span>${topic.chapterIds.map(id=>`<button class="text-link" data-lab-course="${id}">第 ${id+1} 课 →</button>`).join('')}<details><summary>给大人的内容依据</summary>${topic.sources.map(s=>`<a href="${safe(s.url)}" target="_blank" rel="noopener noreferrer">${safe(s.title)} ↗</a>`).join('')}</details>`;
  $('#knowledgeRelated').querySelectorAll('[data-lab-course]').forEach(b=>b.onclick=()=>onCourse(Number(b.dataset.labCourse)));
  renderItems();renderFact();renderDiagram();renderHistory();renderQuestion();
 }
 function viewStatus(){const diagram=flat||!available;$('#knowledgeDiagram').hidden=!diagram;$('#knowledgeScene').hidden=diagram;$('#knowledgeView').disabled=!available;$('#knowledgeView').textContent=available?(flat?'切回三维':'用图解学习'):'图解模式';$('#knowledgeReset').hidden=diagram;$('#knowledgeViewHint').textContent=diagram?'点下方卡片观察；键盘 Tab 选择，Enter 确认。':'拖动旋转 · 双指或滚轮缩放 · 也可点下方卡片。';scene?.setPaused(!opened||diagram||document.hidden);}
 function open(id){
  stop();invalidated=false;
  const cursor=getCursor?.()||{};topic=KNOWLEDGE_TOPICS.find(t=>t.id===(id||cursor.topic))||KNOWLEDGE_TOPICS[0];selected=topic.items.some(x=>x.id===cursor.item)&&cursor.topic===topic.id?cursor.item:topic.items[0].id;year=Number.isInteger(cursor.year)?Math.max(1000,Math.min(cursor.year,1250)):1120;quizOpen=false;sessionSolved=false;sessionHelp=false;wrong=[];orderMessage='';opened=true;setProgress(recordKnowledgeVisit(getProgress(),topic.id,selected));renderTopic();show();
  if(!scene){try{scene=createKnowledgeScene($('#knowledgeScene'),{reduced:getReduced(),onSelect:selectItem,onStatus:status=>{available=status.available;viewStatus();}});available=true;}catch{available=false;}}
  scene?.setTopic(topic.id);scene?.select(selected);scene?.setReduced(getReduced());viewStatus();remember();$('#knowledgeScroll').scrollTop=0;
 }
 $('#knowledgeView').onclick=()=>{flat=!flat;viewStatus()};$('#knowledgeReset').onclick=()=>scene?.reset();
 return {open,invalidate(){invalidated=true},syncVisibility(value){opened=value;if(value&&invalidated){open(getCursor()?.topic);return}viewStatus()},setReduced(value){scene?.setReduced(value)},dispose(){scene?.dispose();scene=null;}};
}
