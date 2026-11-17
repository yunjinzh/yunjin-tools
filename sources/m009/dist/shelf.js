(function(){
 'use strict';
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const catalog=window.BOOK_CATALOG||[],data=window.STORYSPROUT_BOOKS||{},cores={},states={},stats={},bad=[];
 const key=n=>`storysprout:super-minds-${n}-v2`,bookHref=(n,route='map')=>`book.html?book=${n}#/${route}`;
 let range='all',query='',toastTimer,pending=null,storageUnavailable=false;
 function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3800);}
 function load(){bad.length=0;for(const m of catalog){const n=m.number;if(!data[n]){bad.push(n);continue;}cores[n]??=window.CourseCoreFactory(data[n]);states[n]=cores[n].initial();try{const raw=localStorage.getItem(key(n));if(raw)states[n]=cores[n].restore(JSON.parse(raw));}catch{bad.push(n);}stats[n]=cores[n].stats(states[n]);}}
 function hasWork(n){const s=states[n];return s&&!!(s.updated||Object.keys(s.answers).length||Object.keys(s.read).length||Object.keys(s.heard).length||Object.keys(s.drafts).length);}
 function recent(){const used=catalog.filter(m=>hasWork(m.number));if(!used.length)return null;let remembered;try{remembered=Number(localStorage.getItem('storysprout:last-book'));}catch{storageUnavailable=true;}used.sort((a,b)=>(Date.parse(states[b.number].updated)||0)-(Date.parse(states[a.number].updated)||0));const latest=used[0];return used.find(m=>m.number===remembered)||latest;}
 function resume(n){const s=states[n];return bookHref(n,`unit/${s?.last.unit||0}/${s?.last.module||'vocab'}`);}
 const inRange=n=>range==='all'||range.split('-').map(Number).includes(n);
 function progress(n,total){return `<div class="shelf-progress" role="progressbar" aria-label="完成任务" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${total}"><span style="width:${n/total*100}%"></span></div>`;}
 function renderBooks(){
  const newest=recent();$('books-grid').hidden=!!query;$('search-results').hidden=!query;
  if(query){const matches=[];for(const m of catalog.filter(m=>inRange(m.number)))for(const u of data[m.number]?.units||[]){const hay=[u.title,u.zh,u.goal,...u.vocab.flatMap(v=>[v.word,v.zh]),u.story.title,u.reading.title,u.world.title].join(' ').toLowerCase();if(hay.includes(query.toLowerCase()))matches.push({m,u});}
   $('result-count').textContent=`找到 ${matches.length} 个相关单元`;
   $('search-results').innerHTML=matches.map(({m,u})=>`<a class="unit-result" href="${bookHref(m.number,`unit/${u.id}/vocab`)}"><small>第 ${m.number} 册 · ${u.id?'UNIT '+u.id:'STARTER'} · p.${u.start}–${u.end}</small><h3>${u.icon} ${esc(u.zh)}</h3><p lang="en">${esc(u.title)}</p><p>${esc(u.goal)}</p><span>进入这个学习站 →</span></a>`).join('')||'<div class="shelf-empty"><h3>换个词，再找找？</h3><p>可以搜索英文标题、中文主题或单词，例如 museum、动物、school。</p></div>';return;
  }
  const filtered=catalog.filter(m=>inRange(m.number));$('result-count').textContent=`${filtered.length} 册课程 · 每册 10 站 · 每站 8 个任务`;
  $('books-grid').innerHTML=filtered.map(m=>{const n=m.number,st=stats[n];if(!st)return `<article class="shelf-book-card unavailable"><div class="book-main-link"><div><h3>第 ${n} 册暂未加载</h3><p>请刷新后重试。</p></div></div></article>`;const work=hasWork(n),complete=st.missions===m.missions;return `<article class="shelf-book-card" style="--book-color:${m.color}">${newest?.number===n?'<span class="current-ribbon" title="最近打开的一册" aria-label="最近打开的一册">✦</span>':''}<a class="book-main-link" href="${bookHref(n)}" aria-label="打开第${n}册：${esc(m.title)}"><div class="book-cover" aria-hidden="true"><small>SUPER MINDS</small><strong>${n}</strong><span>${m.icon}</span><b>STORY SPROUT</b></div><div class="book-card-copy"><div class="book-tag">BOOK ${String(n).padStart(2,'0')} <span>${esc(m.stage)}</span></div><h3>${esc(m.title)}</h3><p>${esc(m.subtitle)}</p><small>${m.units} 个学习站 · ${m.words} 个词语</small></div></a><div class="book-card-progress"><div class="book-progress-label"><span class="${work?'started':''}">${complete?'✦ 整本走完啦！':work?'已经出发，继续加油':'故事在等你'}</span><span>${st.missions} / ${m.missions} 任务</span></div>${progress(st.missions,m.missions)}</div><div class="book-card-bottom"><a class="open-book" href="${work?resume(n):bookHref(n)}">${complete?'再来读一读':work?'继续第 '+n+' 册':'打开第 '+n+' 册'} <span>→</span></a><a class="original-link" href="${bookHref(n,'library')}">课本原页 ↗</a></div></article>`;}).join('');
 }
 function renderProgress(){
  const newest=recent(),sum={missions:0,units:0,read:0};for(const st of Object.values(stats)){sum.missions+=st.missions;sum.units+=st.units;sum.read+=st.read;}
  $('shelf-stats').innerHTML=`<div><b>${sum.missions}<small>/ ${catalog.reduce((n,m)=>n+m.missions,0)}</small></b><span>已完成的小任务</span></div><div><b>${sum.read}</b><span>自己读过的句子</span></div><div><b>${sum.units}<small>/ ${catalog.reduce((n,m)=>n+m.units,0)}</small></b><span>走完的学习站</span></div>`;
  if(newest){const n=newest.number,u=data[n].units[states[n].last.unit];$('continue-area').innerHTML=`<a class="primary" href="${resume(n)}">继续第 ${n} 册 →</a><span>${esc(u.zh)}<br>从上次的小步继续</span>`;}
  else $('continue-area').innerHTML='<a class="primary" href="#books">选一本，出发 →</a><span>每次一小段，也是一大步</span>';
  const started=catalog.filter(m=>hasWork(m.number));
  $('learning-records').innerHTML=started.length?`<div class="record-list">${started.map(m=>{const n=m.number,s=states[n],st=stats[n],u=data[n].units[s.last.unit];return `<article class="record-item"><h3>${m.icon} 第 ${n} 册 · ${st.missions}/${m.missions} 任务</h3><p>最近学习：${esc(u.zh)}</p><p>听过 ${st.heard} 句 · 自读 ${st.read} 句 · 答对 ${st.words} 个词语</p><div class="record-actions"><a href="${resume(n)}">继续学习 →</a>${st.wrong.length?`<a class="review-link" href="${bookHref(n,'review')}">复习 ${st.wrong.length} 个错题 ↻</a>`:`<a href="${bookHref(n,'bag')}">看看我的作品 ↗</a>`}</div></article>`;}).join('')}</div>`:'<div class="shelf-empty"><h3>第一小步，从喜欢的故事开始</h3><p>打开一册，听一句、读一句。你的学习记录会出现在这里。</p></div>';
  $('download-list').innerHTML=catalog.map(m=>`<a href="storysprout-super-minds-${m.number}.zip" download>第 ${m.number} 册 ↓</a>`).join('');
  $('home-notice').textContent=bad.length?`第 ${bad.join('、')} 册的内容或旧进度没有成功读取。当前未覆盖原记录，请保留已有备份后重试。`:storageUnavailable?'此浏览器暂时无法读取部分记录。学习后请导出备份。':'';
 }
 function render(){renderBooks();renderProgress();}
 function download(name,text){const u=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
 function exportAll(){let cat=null;try{const raw=localStorage.getItem('storysprout:egyptian-cat-v1');if(raw)cat=JSON.parse(raw);}catch{}
  // Keep malformed local records in a separate recovery field rather than silently replacing them.
  const recovery={};for(const n of bad)try{const raw=localStorage.getItem(key(n));if(raw)recovery[n]=raw;}catch{}
  download('storysprout-six-books-progress.json',JSON.stringify({app:'storysprout-six-books',version:1,exported:new Date().toISOString(),books:Object.fromEntries(Object.entries(states).filter(([n])=>!bad.includes(Number(n)))),cat,recovery},null,2));toast('六册学习记录已导出，请保留下载的 JSON 文件。');
 }
 async function importAll(file){if(!file)return;if(file.size>5e6){toast('备份文件过大，请选择导出的 JSON 进度文件。');return;}
  try{const x=JSON.parse(await file.text());let incoming={};if(x.app==='storysprout-six-books'&&x.version===1&&x.books&&typeof x.books==='object')incoming=x.books;else {const m=String(x.app||'').match(/^storysprout-super-minds-([1-6])$/);if(!m)throw Error('format');incoming[m[1]]=x.course;}
   const clean={};for(const [n,raw]of Object.entries(incoming)){if(!/^[1-6]$/.test(n)||!cores[n])throw Error('book');clean[n]=cores[n].restore(raw);}if(!Object.keys(clean).length)throw Error('empty');
   pending={books:clean,cat:x.cat&&typeof x.cat==='object'&&!Array.isArray(x.cat)?x.cat:null};const modal=$('home-modal');modal.innerHTML=`<div class="modal-top"><h2 id="home-modal-title">导入这份学习记录？</h2><button class="close-button" data-home="close" aria-label="关闭窗口">×</button></div><p>将替换本浏览器中以下册数的记录${pending.cat?'及金猫精读记录':''}。其他册数保持原样。</p><div class="import-summary">${Object.entries(clean).map(([n,s])=>{const st=cores[n].stats(s);return `<div>第 ${n} 册<small>${st.missions} 个任务 · ${st.read} 句自读</small></div>`;}).join('')}</div><p>建议先导出当前进度，保留两份备份。录音不包含在进度文件中。</p><div class="button-row"><button class="secondary" data-home="export">先导出当前进度</button><button class="primary" data-home="confirm">用备份替换以上记录</button></div>`;modal.showModal();
  }catch{pending=null;toast('无法读取这份备份。请选择故事芽导出的六册或单册 JSON 进度文件。');}
 }
 function confirmImport(){if(!pending)return;const writes=Object.entries(pending.books).map(([n,s])=>[key(n),JSON.stringify(s)]);if(pending.cat)writes.push(['storysprout:egyptian-cat-v1',JSON.stringify(pending.cat)]);const before=new Map(),changed=[];
  try{for(const [k]of writes)before.set(k,localStorage.getItem(k));for(const [k,v]of writes){localStorage.setItem(k,v);changed.push(k);}pending=null;$('home-modal').close();load();render();toast('学习记录已导入，可以接着学了。');}
  catch{let rolledBack=true;for(const k of changed.reverse()){try{const raw=before.get(k);raw==null?localStorage.removeItem(k):localStorage.setItem(k,raw);}catch{rolledBack=false;}}toast(rolledBack?'导入未成功，原记录已保留。请保留备份后重试。':'保存失败，部分原记录未能恢复。请保留备份文件并重新导入。');}
 }
 document.addEventListener('click',e=>{const rangeButton=e.target.closest('[data-range]');if(rangeButton){range=rangeButton.dataset.range;for(const b of document.querySelectorAll('[data-range]')){b.classList.toggle('selected',b===rangeButton);b.setAttribute('aria-pressed',String(b===rangeButton));}renderBooks();return;}const b=e.target.closest('[data-home]');if(!b)return;if(b.dataset.home==='close'){$('home-modal').close();pending=null;}else if(b.dataset.home==='export')exportAll();else if(b.dataset.home==='confirm')confirmImport();});
 $('course-search').addEventListener('input',e=>{query=e.target.value.trim();renderBooks();});
 $('export-all').addEventListener('click',exportAll);$('import-all').addEventListener('change',e=>{importAll(e.target.files[0]);e.target.value='';});
 window.addEventListener('pageshow',()=>{load();render();});window.addEventListener('storage',()=>{load();render();});
 load();render();
})();
