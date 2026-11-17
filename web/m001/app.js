(() => {
  'use strict';
  const P = window.PORTAL, $ = (s, root=document) => root.querySelector(s), $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = 'dt-hub-learning-v1';
  const fresh = () => ({lessons:[],tasks:[],bookmarks:[],quiz:null,plan:null});
  let state = fresh(), storageOK = true;
  try { const s = JSON.parse(localStorage.getItem(key)||'null'); if(s && typeof s==='object') { state={...state,...s}; for(const a of ['lessons','tasks','bookmarks']) if(!Array.isArray(state[a])) state[a]=[]; } } catch { storageOK=false; }
  function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { storageOK=false; } updateProgressIndicator(); }
  let toastTimer;
  function toast(message) { $('#toast').textContent=message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000); }
  const levelById = id => P.levels.find(l=>l.id===Number(id));
  const domainById = id => P.domains.find(d=>d.id===id);
  const allTasks = P.levels.flatMap(l=>l.tasks);
  const sourceLine = (ref='第3章',page=4) => `<div class="dialog-source">依据：${esc(P.standard.publisher)}《${P.standard.title}》${esc(ref)}。工作内容和技能摘要用于学习导航，完整要求以原文为准。<br><a href="assets/standard-2024.pdf#page=${page}" target="_blank" rel="noopener">查看标准原文 ↗</a></div>`;
  function openDialog(title, html, eyebrow='DT HUB / EXPLORE') { $('#dialog-eyebrow').textContent=eyebrow; $('#dialog-content').innerHTML=`<h2 class="dialog-title" id="dialog-title">${title}</h2>${html}`; const d=$('#content-dialog'); if(!d.open) d.showModal(); d.scrollTop=0; }
  function closeDialog() { $('#content-dialog').close(); }
  function download(name, content, type='application/json;charset=utf-8') { const url=URL.createObjectURL(new Blob([content],{type})); const a=document.createElement('a'); a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function updateProgressIndicator() { $('.progress-dot').hidden=!(state.lessons.length||state.tasks.length||state.bookmarks.length||state.quiz); }

  let selectedLevel=3, weightType='skill', selectedDomain='development', atlasLevel='3', resourceFilter='全部', caseFilter='全部';
  function renderLevels() {
    $('#level-cards').innerHTML=P.levels.map((l,i)=>`<button class="level-card ${selectedLevel===l.id?'active':''}" data-level="${l.id}" aria-pressed="${selectedLevel===l.id}"><span class="level-idx">0${i+1}<span>${selectedLevel===l.id?'↗':''}</span></span><h3>${l.name}</h3><span class="level-full">${l.label} / LEVEL ${l.id}</span><span class="level-hours"><b>${l.hours}</b> 标准学时起</span></button>`).join('');
    renderLevelDetail();
  }
  function renderLevelDetail() {
    const l=levelById(selectedLevel), ds=P.domains.filter(d=>l.tasks.some(t=>t.domain===d.id));
    const labels=weightType==='skill'?P.domains.map(d=>d.title):P.weightLabels;
    const values=l[weightType];
    const max=Math.max(...values);
    $('#level-detail').innerHTML=`<div class="level-description"><div class="eyebrow">LEVEL ${l.id} / ${l.label} · ${l.name}</div><h3>${l.focus}</h3><p>${l.desc}</p><div class="level-tags">${ds.map(d=>`<span class="tag">${d.title}</span>`).join('')}</div><button class="link-button" data-action="eligibility" data-id="${l.id}">查看申报条件 ${icon('arrow')}</button></div><div class="weights"><div class="weights-head"><span>考核内容权重</span><div class="segmented" role="group" aria-label="切换考核权重类型"><button data-weight="skill" class="${weightType==='skill'?'active':''}" aria-pressed="${weightType==='skill'}">技能要求</button><button data-weight="theory" class="${weightType==='theory'?'active':''}" aria-pressed="${weightType==='theory'}">理论知识</button></div></div><div class="weight-bars">${labels.map((title,i)=>`<div class="weight-row ${values[i]===max?'emphasized':''}"><span>${title}</span><span class="weight-bar"><i style="width:${values[i]*2}%"></i></span><span>${values[i]||'—'}${values[i]?'%':''}</span></div>`).join('')}</div><p class="weights-note">${weightType==='skill'?'技能要求':'理论知识'}合计100% · “—”表示该等级权重表未单列，等级要求按标准依次递进。</p></div>`;
  }
  function standardInfo() {
    openDialog('职业标准，是学习与进阶的坐标。',`<p class="dialog-lead">职业编码 <span class="mono">4-04-05-10</span> · 2024年版 · ${P.standard.notice}</p><div class="dialog-section"><h4>职业定位</h4><p>使用仿真工具和数字孪生平台，构建、运行和维护数字孪生应用，以监控、预测并优化实体系统运行状态。普通受教育程度为高中毕业（或同等学力）。</p></div><div class="dialog-section"><h4>培训参考时长</h4><div class="plan-stats">${P.levels.map(l=>`<div><strong>${l.hours}</strong><span>${l.label} · 标准学时起</span></div>`).join('')}</div><p style="margin-top:12px">这些数值是各等级培训参考时长下限，不能直接理解为从零到该等级的全部学习时长。</p></div><div class="dialog-section"><h4>评价方式与时长</h4><ul><li>理论知识考试：以笔试、机考等方式为主，时间不少于90分钟。</li><li>操作技能考核：主要采用模拟操作或现场操作等方式，时间不少于120分钟。</li><li>综合评审：主要针对二级／技师、一级／高级技师，时间不少于20分钟。</li><li>理论知识考试、操作技能考核和综合评审均实行百分制，成绩皆达60分（含）以上为合格。</li></ul></div><div class="info-box">标准规定各等级的技能与相关知识要求依次递进，高级别涵盖低级别要求。本站的任务、自测与计划用于辅助学习。</div><div class="dialog-actions"><a class="button primary" href="assets/standard-2024.pdf" target="_blank" rel="noopener">阅读标准原文 ${icon('external')}</a><button class="button" data-action="eligibility" data-id="${selectedLevel}">申报条件自查</button></div>${sourceLine('第1.3–1.9节、第3章')}`,'NATIONAL OCCUPATIONAL STANDARD / 2024');
  }
  function eligibility(id) {
    const l=levelById(id);
    openDialog(`${l.label} / ${l.name} · 申报条件对照`,`<p class="dialog-lead">2024年标准第1.9.1节规定：具备对应等级所列条件之一，可按标准申报。勾选你需要核对的条件。</p><div class="dialog-chips">${P.levels.map(x=>`<button class="${x.id===l.id?'active':''}" data-eligibility-level="${x.id}">${x.label} / ${x.name}</button>`).join('')}</div><div>${l.conditions.map((c,i)=>`<label class="condition-check"><input type="checkbox" name="condition" value="${i}"><span>${c}</span></label>`).join('')}</div><div class="info-box" id="condition-result">对照条件后，继续准备相应工作经历、证书或学籍学历材料。具体职业与专业对应范围见原文脚注。</div><div class="dialog-section"><h4>相关职业与专业</h4><p>标准脚注列举了相关职业和技工、中职、高职、普通高等教育相关专业。涉及专业对应、评估论证等条件时，请向拟参加评价的机构核验。</p></div>${sourceLine('第1.9.1节（正文第2–5页）',5)}`,'APPLICATION CHECK / 2024');
  }

  function renderAtlas() {
    const coords=[[50,12.5],[71.9,26.7],[77.4,58],[62.2,83.7],[37.8,83.7],[22.6,58],[28.1,26.7]];
    $('#domain-nodes').innerHTML=P.domains.map((d,i)=>`<button class="domain-node ${selectedDomain===d.id?'active':''}" style="left:${coords[i][0]}%;top:${coords[i][1]}%;--domain-color:${d.color}" data-domain="${d.id}" aria-pressed="${selectedDomain===d.id}"><span class="node-icon">${icon(d.icon)}</span><strong>${d.title}</strong><small>${d.en}</small></button>`).join('');
    renderDomainDetail();
  }
  function renderDomainDetail() {
    const d=domainById(selectedDomain), tasks=allTasks.filter(t=>t.domain===d.id&&(atlasLevel==='all'||t.level===Number(atlasLevel)));
    $('#domain-detail').innerHTML=`<div class="domain-heading">${icon(d.icon)}<div><small>${d.en}</small><h3>${d.title}</h3></div></div><p class="domain-desc">${d.intro}</p><div class="tasks-caption"><span>工作内容 / 标准摘要</span><span>${tasks.length} 项</span></div><div class="tasks-list">${tasks.length?tasks.map(t=>`<button class="task-row" data-task="${t.id}"><span class="task-index">${t.level} / ${t.code}</span><span class="task-title">${t.title}<small>${levelById(t.level).label}／${levelById(t.level).name} · 标准 ${t.ref}</small></span>${icon(state.tasks.includes(t.id)?'check':'arrow')}</button>`).join(''):`<div class="empty-state">${icon(d.icon)}<p>该等级的工作要求表未单列此领域。</p><button class="button small" data-action="atlas-all">查看全部等级</button></div>`}</div><div class="domain-bottom"><span>点击任务，查看技能要求与练习建议</span><button class="link-button" data-action="domain-lesson" data-id="${d.id}">去学习 ${icon('arrow')}</button></div>`;
  }
  function taskDetail(id) {
    const t=allTasks.find(t=>t.id===id); if(!t)return;
    const l=levelById(t.level), d=domainById(t.domain), lesson=P.lessons.find(a=>a.domain===d.id)||P.lessons[6];
    const practice={planning:'选择一个校园或企业业务场景，写出服务对象、主要痛点、输入数据、预期成果和验证方法。',platform:'围绕所选任务，记录操作环境、执行步骤、运行结果与异常处理，形成一份可复查的运维记录。',development:'选择一个设备，整理数据来源、字段和单位，建立模型参数与数据字段的映射表，并设计验证步骤。',testing:'围绕所选工作内容，记录测试环境、输入、预期结果、实际结果及证据，形成测试记录。',operation:'在实验室中改变负载、阈值或运行状态，记录观察结果，整理异常现象、处置动作与改进建议。',management:'为一个孪生项目编制任务分工、里程碑、质量检查点及验收证据清单。',training:'以一个具体操作任务编写指导书，写清目标、前提、操作步骤、检查要点和常见问题。'}[d.id];
    openDialog(t.title,`<p class="dialog-lead">${l.label}／${l.name} · ${d.title} · 标准条目 ${t.ref}</p><div class="dialog-section"><h4>应具备的技能 · 条文摘要</h4><ul>${t.skills.map(s=>`<li>${s}。</li>`).join('')}</ul></div><div class="dialog-section"><h4>建议练习 · 本站教学设计</h4><p>${practice}</p></div><div class="info-box">建议记录：任务目标 → 操作过程 → 结果证据 → 问题与改进。完成练习后，可将本项标记为“已练习”，供个人学习回顾。</div><div class="dialog-actions"><button class="button primary" data-action="mark-task" data-id="${t.id}">${state.tasks.includes(t.id)?'已练习 · 取消标记':'标记为已练习'} ${icon('check')}</button><button class="button" data-lesson="${lesson.id}">阅读相关学习单元 ${icon('arrow')}</button></div>${sourceLine(`第${l.section}节 ${t.code}，正文第${l.pages}页`,parseInt(l.pages)+3)}`,'COMPETENCY DETAIL / STANDARD MAP');
  }

  function renderCases() {
    const cs=P.cases.filter(c=>caseFilter==='全部'||c.category===caseFilter);
    $('#case-grid').innerHTML=cs.map(c=>`<article class="case-card"><button class="case-image" data-case="${c.id}" aria-label="查看${c.title}案例"><img src="${c.img}" alt="北京飞渡科技股份有限公司官网提供的${c.title}场景截图" loading="lazy" width="880" height="460"><span class="image-arrow">${icon('external')}</span></button><div class="case-category"><span>${c.category}</span>${c.en}</div><h3><button style="padding:0;text-align:left;font:inherit" data-case="${c.id}">${c.title}</button></h3><p>${c.desc}</p><div class="case-skills">${c.skills.map(s=>`<span class="tag">${s}</span>`).join('')}</div><button class="link-button" data-case="${c.id}">案例与能力连接 ${icon('arrow')}</button></article>`).join('');
    $$('[data-case-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.caseFilter===caseFilter);b.setAttribute('aria-pressed',b.dataset.caseFilter===caseFilter);});
  }
  function caseDetail(id) {
    const c=P.cases.find(c=>c.id===id); if(!c)return;
    openDialog(c.title,`<p class="dialog-lead">${c.category} / ${c.en}</p><img class="dialog-image" src="${c.img}" alt="${c.title}官网项目截图"><div class="dialog-section"><h4>官方案例摘要</h4><p>${c.detail}</p></div><div class="dialog-section"><h4>从产业实践到学习任务</h4><p>${c.practice}</p></div><div class="dialog-chips" style="margin-top:20px">${c.skills.map(s=>`<span class="tag">${s}</span>`).join('')}</div><div class="dialog-actions"><a class="button primary" href="${c.url}" target="_blank" rel="noopener">查看官网完整案例 ${icon('external')}</a><button class="button" data-action="case-skills" data-id="${c.domain}">定位相关能力 ${icon('arrow')}</button></div><div class="dialog-source">案例与配图来源：北京飞渡科技股份有限公司，《${c.sourceTitle}》；页面未标注发布日期，核验时间2026-10-26。教学拓展由本站编写，案例摘要不构成对项目效果的独立验证。</div>`,'INDUSTRY CASE / FREEDO');
  }
  function renderResources() {
    const term=$('#resource-search').value.trim().toLowerCase();
    const rs=P.resources.filter(r=>(resourceFilter==='全部'||(resourceFilter==='收藏'?state.bookmarks.includes(r.id):r.type===resourceFilter))&&`${r.title}${r.desc}${r.tags.join('')}`.toLowerCase().includes(term));
    $('#resource-grid').innerHTML=rs.length?rs.map(r=>`<article class="resource-card" style="--resource-color:${r.color}"><div class="resource-card-top"><span class="resource-symbol">${r.mark} / ${r.type}</span><button class="bookmark-button ${state.bookmarks.includes(r.id)?'saved':''}" data-bookmark="${r.id}" aria-label="${state.bookmarks.includes(r.id)?'取消收藏':'收藏'}${r.title}" aria-pressed="${state.bookmarks.includes(r.id)}">${icon('bookmark')}</button></div><h3><a href="${r.url}" target="_blank" rel="noopener">${r.title}</a></h3><p>${r.desc}</p><div class="resource-card-bottom"><span>${r.tags.join(' / ')}</span><a href="${r.url}" target="_blank" rel="noopener">打开资源 ${icon('external')}</a></div></article>`).join(''):`<div class="empty-state">${icon('search')}<p>${resourceFilter==='收藏'?'还没有符合条件的收藏，点击资源右上角书签即可添加。':'没有匹配的资源，试试其他关键词或资源类型。'}</p><button class="button small" data-action="resource-reset">显示全部资源</button></div>`;
    $$('[data-resource-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.resourceFilter===resourceFilter);b.setAttribute('aria-pressed',b.dataset.resourceFilter===resourceFilter);});
  }
  function renderLessons() {
    $('#lesson-list').innerHTML=P.lessons.map((l,i)=>`<button class="lesson-row ${state.lessons.includes(l.id)?'done':''}" data-lesson="${l.id}"><span class="lesson-num">${state.lessons.includes(l.id)?'✓':String(i+1).padStart(2,'0')}</span><span><strong>${l.title}</strong><small>${domainById(l.domain).title} · 标准${l.source}</small></span><em>${state.lessons.includes(l.id)?'已阅读':l.time}</em>${icon('arrow')}</button>`).join('');
  }
  function lessonDetail(id) {
    const l=P.lessons.find(l=>l.id===id);if(!l)return;
    openDialog(l.title,`<p class="dialog-lead">${l.intro}</p><span class="tag">学习建议 · 本站编写</span><span class="tag" style="margin-left:7px">${domainById(l.domain).title}</span><div class="dialog-section"><h4>理解要点</h4><ul>${l.points.map(p=>`<li>${p}</li>`).join('')}</ul></div><div class="dialog-section"><h4>动手练习</h4><ol>${l.steps.map(p=>`<li>${p}</li>`).join('')}</ol></div><div class="info-box"><strong>建议提交成果：</strong>${l.output}</div><div class="dialog-actions"><button class="button primary" data-action="mark-lesson" data-id="${l.id}">${state.lessons.includes(l.id)?'已阅读 · 取消标记':'标记为已阅读'} ${icon('check')}</button>${l.id==='mapping'||l.id==='control'?`<button class="button" data-action="goto-lab">打开实验室 ${icon('arrow')}</button>`:`<button class="button" data-action="case-skills" data-id="${l.domain}">查看领域任务 ${icon('arrow')}</button>`}</div>${sourceLine(l.source)}`,'LEARNING UNIT / KNOW → DO');
  }
  function showProgress() {
    const quiz=state.quiz;
    openDialog('每一步探索，都有迹可循。',`<p class="dialog-lead">学习记录保存在当前浏览器。${storageOK?'你可以导出一份档案，留存阅读、练习、收藏与测评记录。':'当前浏览器限制了本机存储，记录在本次会话内有效，请及时导出。'}</p><div class="progress-summary"><div><strong>${state.lessons.length}<small style="font:12px Arial"> / ${P.lessons.length}</small></strong><span>学习单元已阅读</span></div><div><strong>${state.tasks.length}</strong><span>能力任务已练习</span></div><div><strong>${quiz?quiz.score:'—'}</strong><span>最近自测得分</span></div></div><div class="dialog-section"><h4>继续学习</h4><div class="progress-list">${P.lessons.map(l=>`<div><span>${state.lessons.includes(l.id)?'✓ ':'○ '}${l.title}</span><button class="link-button" data-lesson="${l.id}">${state.lessons.includes(l.id)?'回顾':'阅读'} ${icon('arrow')}</button></div>`).join('')}</div></div>${quiz?`<div class="dialog-section"><h4>最近一次知识自测</h4><p>${new Date(quiz.at).toLocaleString('zh-CN')} · ${quiz.correct}/${quiz.total}题 · ${quiz.score}分</p><button class="link-button" data-action="quiz-review">查看逐题解析 ${icon('arrow')}</button></div>`:''}${state.plan?`<div class="info-box">已保存计划：${state.plan.levelLabel} · 每周${state.plan.weekly}标准学时 · 预计${state.plan.weeks}周。<button class="link-button" style="margin-left:12px" data-action="plan">查看计划 ${icon('arrow')}</button></div>`:''}<div class="dialog-actions"><button class="button primary" data-action="export-progress">导出学习档案 ${icon('download')}</button><button class="button" data-action="saved-resources">查看收藏（${state.bookmarks.length}） ${icon('bookmark')}</button><button class="link-button" data-action="clear-data-info">管理学习记录</button></div>`,'MY LEARNING / LOCAL PROGRESS');
  }

  let quiz={index:0,answers:[],revealed:false};
  function quizIntro() {
    openDialog('找到你的学习起点。',`<p class="dialog-lead">10道单选练习，覆盖7类职业功能。每题作答后即时查看解析，完成后按知识点获得回顾建议。</p><div class="quiz-intro"><strong>10</strong><span>道自编练习<br>依据2024年职业标准</span></div><div class="info-box">自测衡量的是本次练习中的知识理解，分数不等同于职业技能等级，练习结果会保存在本机学习档案中。</div><div class="dialog-actions"><button class="button primary" data-action="quiz-start">开始作答 ${icon('arrow')}</button>${state.quiz?`<button class="button" data-action="quiz-review">回顾最近结果</button>`:''}</div>`,'COMPETENCY CHECK / SELF PRACTICE');
  }
  function renderQuestion() {
    const q=P.questions[quiz.index];
    openDialog('职业能力自测',`<div class="quiz-top"><span>${domainById(q.domain).title}</span><span>${String(quiz.index+1).padStart(2,'0')} / ${P.questions.length}</span></div><div class="quiz-progress"><span style="width:${(quiz.index+1)/P.questions.length*100}%"></span></div><h3 class="question-title">${q.text}</h3><fieldset style="border:0;padding:0;margin:0" aria-label="选择一个答案">${q.options.map((o,i)=>`<label class="quiz-option"><input type="radio" name="quiz-answer" value="${i}"><span>${String.fromCharCode(65+i)}. ${o}</span></label>`).join('')}</fieldset><div id="quiz-feedback" aria-live="polite"></div><div class="dialog-actions"><button class="button primary" data-action="quiz-submit" id="quiz-submit" disabled>确认答案 ${icon('check')}</button><button class="button" data-action="quiz-next" id="quiz-next" hidden>${quiz.index===P.questions.length-1?'查看结果':'下一题'} ${icon('arrow')}</button></div><div class="dialog-source">本站自编练习 · 依据《${P.standard.title}》${q.source}</div>`,'COMPETENCY CHECK / SELF PRACTICE');
  }
  function submitAnswer() {
    if(quiz.revealed)return;
    const input=$('input[name="quiz-answer"]:checked');if(!input)return;
    const q=P.questions[quiz.index], answer=Number(input.value); quiz.answers[quiz.index]=answer;quiz.revealed=true;
    $$('input[name="quiz-answer"]').forEach(i=>i.disabled=true);
    const correct=answer===q.answer;
    $('#quiz-feedback').innerHTML=`<div class="quiz-feedback ${correct?'':'wrong'}"><strong>${correct?'回答正确':'本题正确答案：'+String.fromCharCode(65+q.answer)}</strong>${q.explain}<br><small>依据：2024年职业标准 ${q.source}</small></div>`;
    $('#quiz-submit').hidden=true;$('#quiz-next').hidden=false;$('#quiz-next').focus();
  }
  function finishQuiz() {
    const correct=P.questions.reduce((n,q,i)=>n+(quiz.answers[i]===q.answer?1:0),0);
    state.quiz={answers:[...quiz.answers],correct,total:P.questions.length,score:correct*10,at:new Date().toISOString()}; save(); showQuizResult();
  }
  function showQuizResult() {
    const r=state.quiz;if(!r)return quizIntro();
    const stats=P.domains.map(d=>{const questions=P.questions.map((q,i)=>({q,i})).filter(x=>x.q.domain===d.id);return {...d,total:questions.length,correct:questions.filter(x=>r.answers[x.i]===x.q.answer).length};});
    const weak=stats.filter(d=>d.correct<d.total).map(d=>d.id), next=P.lessons.filter(l=>weak.includes(l.domain));
    openDialog('把自测反馈，变成下一步。',`<div class="score-circle"><div>${r.score}<small style="display:block">本次知识练习 / 100分</small></div></div><p class="score-description">答对${r.correct}题，共${r.total}题。按下方知识点回顾，再到任务练习中验证理解。</p><div class="dialog-section"><h4>各领域作答情况</h4>${stats.map(d=>`<div class="result-row"><span>${d.title}</span><span>${d.correct} / ${d.total}</span></div>`).join('')}</div><div class="dialog-section"><h4>${next.length?'建议优先回顾':'继续把知识转化为实践'}</h4><div class="progress-list">${(next.length?next:[P.lessons[3],P.lessons[6]]).slice(0,4).map(l=>`<div><span>${l.title}</span><button class="link-button" data-lesson="${l.id}">去阅读 ${icon('arrow')}</button></div>`).join('')}</div></div><div class="dialog-section"><h4>逐题解析</h4>${P.questions.map((q,i)=>`<div class="review-item"><span class="review-state ${r.answers[i]===q.answer?'':'wrong'}">${r.answers[i]===q.answer?'答对':'待回顾'} · 第${i+1}题</span><strong>${q.text}</strong><p>你的答案：${String.fromCharCode(65+r.answers[i])} · 正确答案：${String.fromCharCode(65+q.answer)}<br>${q.explain}<br>依据：2024年职业标准 ${q.source}</p></div>`).join('')}</div><div class="dialog-actions"><button class="button primary" data-action="export-progress">导出学习档案 ${icon('download')}</button><button class="button" data-action="quiz-start">重新自测</button></div><div class="dialog-source">结果仅反映本组自编题的答题情况，标准评价要求请查阅国家职业标准第1.9节。</div>`,'PRACTICE RESULT / LEARNING FEEDBACK');
  }

  let currentPlan=null;
  function calculatePlan(level,weekly) {
    const l=levelById(level), weeks=Math.ceil(l.hours/weekly);
    let assigned=0;const rows=P.domains.map((d,i)=>{let hours=Math.round(l.hours*l.skill[i]/100);assigned+=hours;return {...d,weight:l.skill[i],hours};}).filter(r=>r.weight>0);
    if(rows.length)rows[rows.length-1].hours+=l.hours-assigned;
    return {version:'1.0',level:l.id,levelLabel:`${l.label}／${l.name}`,weekly,hours:l.hours,weeks,rows:rows.map(r=>({title:r.title,hours:r.hours,weight:r.weight})),basis:'2024年职业标准第1.8.1节、第4.2节；学习模块学时为本站按技能权重分配的建议。'};
  }
  function planDialog() {
    const old=state.plan||{level:selectedLevel,weekly:10};
    openDialog('安排一条可执行的学习路径。',`<p class="dialog-lead">选择目标等级与每周可投入的标准学时。以标准培训参考时长下限为基数，生成按技能权重分配的学习建议。</p><div class="plan-fields"><label for="plan-level">目标等级<select id="plan-level">${P.levels.map(l=>`<option value="${l.id}" ${old.level===l.id?'selected':''}>${l.label}／${l.name}</option>`).join('')}</select></label><label for="plan-weekly">每周可投入的标准学时<input id="plan-weekly" type="number" min="1" max="80" step="1" value="${old.weekly}" inputmode="numeric"></label></div><div id="plan-output"></div><div class="dialog-actions"><button class="button primary" data-action="plan-save">保存学习计划 ${icon('check')}</button><button class="button" data-action="plan-export">导出计划 ${icon('download')}</button></div><div class="dialog-source">标准参考时长下限来自第1.8.1节。模块学时与周数为本站学习规划算法结果，假设每周均匀投入；高等级学习须具备低等级要求的知识与技能。</div>`,'PERSONAL LEARNING PLAN / STUDY DESIGN');
    updatePlan();
  }
  function updatePlan() {
    const input=$('#plan-weekly'), weekly=Number(input.value);
    if(!Number.isInteger(weekly)||weekly<1||weekly>80){$('#plan-output').innerHTML='<div class="info-box warm">请填写1–80之间的整数标准学时。</div>';currentPlan=null;return;}
    currentPlan=calculatePlan($('#plan-level').value,weekly);
    $('#plan-output').innerHTML=`<div class="plan-stats"><div><strong>${currentPlan.hours}</strong><span>参考时长下限 / 标准学时</span></div><div><strong>${currentPlan.weekly}</strong><span>每周标准学时</span></div><div><strong>${currentPlan.weeks}</strong><span>预计学习周数</span></div></div><div class="dialog-section"><h4>学习内容建议分配</h4>${currentPlan.rows.map((r,i)=>`<div class="plan-row"><span>模块 ${String(i+1).padStart(2,'0')}</span><span>${r.title} <small style="color:var(--muted)">/ 技能权重${r.weight}%</small></span><span>${r.hours} 学时</span></div>`).join('')}</div><div class="info-box">${currentPlan.hours}标准学时 ÷ 每周${currentPlan.weekly}标准学时，向上取整为${currentPlan.weeks}周。各模块学时按技能权重分配并修正取整差额，总和为${currentPlan.hours}标准学时。理论学习与项目实践请结合实际基础安排。</div>`;
  }

  let sim={scene:'factory',running:true,fault:false,speed:55,threshold:65,field:'temperature',temp:42,sample:0,history:Array(30).fill(42),records:[]};
  const sceneNames={factory:['MOTOR-01','电机运行映射'],campus:['HVAC-01','园区机电映射'],water:['PUMP-01','泵站运行映射']};
  function logSim(message,type='normal') {
    const now=new Date().toLocaleTimeString('zh-CN',{hour12:false});sim.records.push({at:new Date().toISOString(),scene:sim.scene,event:message,speed:sim.speed,temperature:+sim.temp.toFixed(1),threshold:sim.threshold,status:sim.fault?'断链':sim.running?'运行':'暂停'});if(sim.records.length>500)sim.records.shift();
    const log=$('#event-log');const line=document.createElement('span');line.textContent=`${now} · ${message}`;if(type==='alarm')line.className='alarm-event';log.append(line);while(log.children.length>8)log.firstChild.remove();log.scrollTop=log.scrollHeight;
  }
  let lastAlarm=false;
  function updateSim(tick=false) {
    if(tick&&sim.running&&!sim.fault){sim.sample++;const target=26+sim.speed*.62;sim.temp+=(target-sim.temp)*.13+Math.sin(sim.sample*.7)*.17;sim.history.push(sim.temp);sim.history.shift();if(sim.sample%5===0)sim.records.push({at:new Date().toISOString(),scene:sim.scene,event:'模拟采样',speed:sim.speed,temperature:+sim.temp.toFixed(1),threshold:sim.threshold,status:'运行'});if(sim.records.length>500)sim.records.shift();}
    const alarm=!sim.fault&&sim.temp>=sim.threshold;
    $('#temp-value').textContent=sim.fault?'—':sim.temp.toFixed(1);$('#speed-value').textContent=sim.speed;$('#threshold-value').textContent=sim.threshold;
    $('#alarm-pill').textContent=sim.fault?'数据断链':alarm?'温度告警':sim.running?'正常':'已暂停';$('#alarm-pill').classList.toggle('alarm',sim.fault||alarm);
    $('#lab-state-tag').textContent=sim.fault?'传感器断链':sim.running?'模拟运行中':'模拟已暂停';$('#run-button').textContent=sim.running?'暂停运行':'启动运行';
    const faultButton=$('[data-action="lab-fault"]');faultButton.textContent=sim.fault?'恢复数据连接':'注入断链故障';
    $('#trend-line').setAttribute('points',sim.history.map((v,i)=>`${(i/29*300).toFixed(1)},${(61-(v-20)/75*55).toFixed(1)}`).join(' '));$('#trend-line').style.stroke=alarm?'#e09b82':'#a7c497';
    if(!sim.fault&&alarm!==lastAlarm){logSim(alarm?'温度达到阈值，触发教学告警':'温度告警解除',alarm?'alarm':'normal');lastAlarm=alarm;}
    window.dispatchEvent(new CustomEvent('twin:state',{detail:{...sim,alarm,history:undefined,records:undefined}}));
  }
  function setLabScene(name) {
    sim.scene=name;sim.running=true;sim.fault=false;sim.temp=42;sim.history=Array(30).fill(42);lastAlarm=false;
    $$('[data-lab-scene]').forEach(b=>{const on=b.dataset.labScene===name;b.classList.toggle('active',on);b.setAttribute('aria-selected',on);});
    const [device,title]=sceneNames[name];$('#lab-object-title').textContent=`${device} / ${title}`;$('#lab-device').textContent=device;
    window.dispatchEvent(new CustomEvent('twin:scene',{detail:name}));logSim(`切换至${title}场景`);updateSim();
  }
  function labGuide() {
    openDialog('一次实验，理解虚实映射。',`<p class="dialog-lead">本实验以浏览器内生成的概念模型、简化温度规则和模拟数据，演示物理对象数据与模型驱动接口的连接过程。</p><div class="dialog-section"><h4>任务一 · 观察参数驱动</h4><ol><li>保持设备运行，切换不同场景。</li><li>调整运行负载，观察模拟温度趋势与转子速度变化。</li><li>切换映射字段，比较“温度→颜色”和“负载→运动速度”的重点表达。</li></ol></div><div class="dialog-section"><h4>任务二 · 验证边界与异常</h4><ol><li>将温度阈值调到当前温度以下，观察告警。</li><li>注入传感器断链故障，检查数据、模型与日志响应。</li><li>恢复连接，暂停并重新启动，导出记录。</li></ol></div><div class="info-box">简化规则：目标温度 = 26 + 运行负载 × 0.62；模拟温度逐步向目标值收敛，附加小幅周期波动。该规则仅用于教学演示，不代表真实设备热学模型。断链时暂停采样并将显示值标为缺失。</div><div class="dialog-actions"><button class="button primary" data-action="goto-lab">开始实验 ${icon('arrow')}</button><button class="button" data-task="L3-2.3">查看标准能力要求</button></div>${sourceLine('第3.3节2.3、4.1',16)}`,'INTERACTIVE LAB / EXPERIMENT BRIEF');
  }

  function sources() {
    openDialog('每条内容，都有来处。',`<p class="dialog-lead">内容分为国家职业标准、企业公开资料和本站教学设计。最近资料核验时间：2026年10月26日。</p><table class="source-table"><thead><tr><th>来源与主体</th><th>年份 / 使用范围</th></tr></thead><tbody><tr><td><a href="assets/standard-2024.pdf" target="_blank" rel="noopener">${P.standard.title}</a><small>${P.standard.publisher}</small></td><td>2024年 · 2024-01-31公布<small>职业定义、等级、培训时长、申报与评价要求、46项工作内容及权重表。</small></td></tr><tr><td><a href="https://www.freedo3d.com/" target="_blank" rel="noopener">DTS空间智能产品与学习网站</a><small>北京飞渡科技股份有限公司</small></td><td>网页未标注统一发布日期<small>2026-10-26核验；文档、视频、Engine和二次开发入口。</small></td></tr><tr><td><a href="https://www.freedoonline.com/" target="_blank" rel="noopener">飞渡科技官方网站</a><small>北京飞渡科技股份有限公司</small></td><td>网页未标注统一发布日期<small>2026-10-26核验；DTS、CIM、太极及四个案例说明与截图。</small></td></tr><tr><td>本站教学内容<small>云金 + OpenAI</small></td><td>2026年 · 本版制作<small>学习单元、练习题、概念三维场景、模拟规则与学习计划。</small></td></tr></tbody></table><div class="dialog-section"><h4>原始案例链接</h4><ul>${P.cases.map(c=>`<li><a href="${c.url}" target="_blank" rel="noopener">${c.sourceTitle} ↗</a></li>`).join('')}</ul></div><div class="info-box">网站按附件2024年版标准组织。企业产品与案例按公开页面做摘要，具体功能、软件许可与项目细节以原站说明为准。本站为教学门户，并非主管部门或认证机构官方网站。</div><div class="dialog-section"><h4>技术与素材说明</h4><p>案例图片版权归原权利人；图片与页面链接保留来源。交互三维场景由本站程序生成。Three.js r170 按MIT许可使用，字体采用设备可用的中文宋体与黑体系列。</p></div>`,'SOURCES / EVIDENCE & ATTRIBUTION');
  }
  function glossary() { openDialog('数字孪生 · 中英术语速查',`<p class="dialog-lead">按本门户学习任务编写的术语简释。可通过顶部搜索框检索术语。</p>${P.glossary.map(([zh,en,desc])=>`<div class="glossary-row"><strong>${zh}</strong><em>${en}</em><p>${desc}</p></div>`).join('')}<div class="dialog-source">2026年本站教学整理，围绕2024年职业标准第2.2节及飞渡官方产品、案例资料组织。</div>`,'GLOSSARY / CHINESE & ENGLISH'); }
  function openSearch() { $('#search-dialog').showModal();$('#global-search').value='';renderSearch();setTimeout(()=>$('#global-search').focus(),50); }
  let searchItems=[];
  function renderSearch() {
    const term=$('#global-search').value.trim().toLowerCase();
    const items=[...P.lessons.map(l=>({type:'学习',title:l.title,sub:domainById(l.domain).title,text:l.intro,id:l.id,action:'lesson'})),...allTasks.map(t=>({type:'能力',title:t.title,sub:`${levelById(t.level).label}／${levelById(t.level).name} · ${domainById(t.domain).title}`,text:t.skills.join(''),id:t.id,action:'task'})),...P.cases.map(c=>({type:'案例',title:c.title,sub:c.category,text:c.desc,id:c.id,action:'case'})),...P.resources.map(r=>({type:'资源',title:r.title,sub:r.type,text:r.desc+r.tags.join(''),url:r.url,action:'resource'})),...P.glossary.map(g=>({type:'术语',title:g[0],sub:g[1],text:g[2],action:'glossary'}))];
    searchItems=term?items.filter(i=>`${i.title}${i.sub}${i.text}`.toLowerCase().includes(term)).slice(0,24):items.filter(i=>i.type==='学习').slice(0,5);
    $('#search-results').innerHTML=searchItems.length?`${!term?'<p style="font-size:9px;color:var(--muted);padding:7px 10px">推荐学习 / 输入关键词检索全站内容</p>':''}${searchItems.map((r,i)=>r.action==='resource'?`<a class="search-result" href="${r.url}" target="_blank" rel="noopener"><span class="tag">${r.type}</span><span>${r.title}<small>${r.sub}</small></span>${icon('external')}</a>`:`<button class="search-result" data-search-index="${i}"><span class="tag">${r.type}</span><span>${r.title}<small>${r.sub}</small></span>${icon('arrow')}</button>`).join('')}`:'<div class="empty-state">没有找到对应内容，试试“映射”“测试”或“CIM”。</div>';
  }

  document.addEventListener('click', e=>{
    const b=e.target.closest('button, a');if(!b)return;
    if(b.dataset.level){selectedLevel=Number(b.dataset.level);renderLevels();return;}
    if(b.dataset.weight){weightType=b.dataset.weight;renderLevelDetail();return;}
    if(b.dataset.domain){selectedDomain=b.dataset.domain;renderAtlas();return;}
    if(b.dataset.task){taskDetail(b.dataset.task);return;}
    if(b.dataset.case){caseDetail(b.dataset.case);return;}
    if(b.dataset.caseFilter){caseFilter=b.dataset.caseFilter;renderCases();return;}
    if(b.dataset.resourceFilter){resourceFilter=b.dataset.resourceFilter;renderResources();return;}
    if(b.dataset.bookmark){const id=b.dataset.bookmark;state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];save();renderResources();toast(state.bookmarks.includes(id)?'已添加到我的收藏':'已取消收藏');return;}
    if(b.dataset.lesson){lessonDetail(b.dataset.lesson);return;}
    if(b.dataset.eligibilityLevel){eligibility(b.dataset.eligibilityLevel);return;}
    if(b.dataset.labScene){setLabScene(b.dataset.labScene);return;}
    if(b.dataset.heroView){$$('[data-hero-view]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b);});window.dispatchEvent(new CustomEvent('twin:hero-view',{detail:b.dataset.heroView}));return;}
    if(b.dataset.searchIndex!==undefined){const r=searchItems[Number(b.dataset.searchIndex)];$('#search-dialog').close();if(r.action==='lesson')lessonDetail(r.id);if(r.action==='task')taskDetail(r.id);if(r.action==='case')caseDetail(r.id);if(r.action==='glossary')glossary();return;}
    const action=b.dataset.action, id=b.dataset.id;
    switch(action){
      case 'search':openSearch();break;
      case 'close-search':$('#search-dialog').close();break;
      case 'close-dialog':closeDialog();break;
      case 'menu':{const nav=$('#mobile-nav');nav.hidden=!nav.hidden;b.setAttribute('aria-expanded',!nav.hidden);break;}
      case 'standard-info':standardInfo();break;
      case 'eligibility':eligibility(id||selectedLevel);break;
      case 'atlas-all':atlasLevel='all';$('#atlas-level').value='all';renderDomainDetail();break;
      case 'domain-lesson':lessonDetail((P.lessons.find(l=>l.domain===id)||P.lessons[6]).id);break;
      case 'mark-task':state.tasks=state.tasks.includes(id)?state.tasks.filter(x=>x!==id):[...state.tasks,id];save();taskDetail(id);renderDomainDetail();toast('练习记录已更新');break;
      case 'mark-lesson':state.lessons=state.lessons.includes(id)?state.lessons.filter(x=>x!==id):[...state.lessons,id];save();lessonDetail(id);renderLessons();toast('阅读记录已更新');break;
      case 'case-skills':closeDialog();selectedDomain=id;atlasLevel='all';$('#atlas-level').value='all';renderAtlas();$('#skills').scrollIntoView({behavior:'smooth'});break;
      case 'resource-reset':resourceFilter='全部';$('#resource-search').value='';renderResources();break;
      case 'saved-resources':closeDialog();resourceFilter='收藏';$('#resource-search').value='';renderResources();$('#resources').scrollIntoView({behavior:'smooth'});break;
      case 'progress':showProgress();break;
      case 'export-progress':download('数字孪生-学习档案.json',JSON.stringify({exportedAt:new Date().toISOString(),standard:P.standard.title,...state},null,2));toast('学习档案已导出');break;
      case 'privacy':openDialog('学习数据说明',`<p class="dialog-lead">本门户的学习内容与交互在浏览器中运行。</p><div class="dialog-section"><ul><li>阅读、任务练习、资源收藏、自测结果和计划保存在当前浏览器的本机存储中。</li><li>这些学习记录不会被本门户上传到服务器；更换浏览器或清除站点数据后，记录不会自动同步。</li><li>实验室使用本机生成的模拟数据；实验日志在本次打开页面期间有效，可导出CSV。</li><li>打开官网资源后，访问行为遵循对应网站的规则。</li></ul></div><div class="dialog-actions"><button class="button primary" data-action="export-progress">导出我的记录 ${icon('download')}</button><button class="button" data-action="clear-data-info">管理记录</button></div>`,'LOCAL DATA / LEARNING PRIVACY');break;
      case 'clear-data-info':openDialog('管理本机学习记录',`<p class="dialog-lead">清除将移除本浏览器保存的阅读、练习、收藏、自测和学习计划。你可以先导出档案。</p><div class="dialog-actions"><button class="button primary" data-action="export-progress">先导出学习档案 ${icon('download')}</button><button class="button" data-action="clear-data">清除本机学习记录</button></div>`,'LOCAL DATA / MANAGE');break;
      case 'clear-data':state=fresh();save();renderLessons();renderAtlas();renderResources();showProgress();toast('本机学习记录已清除');break;
      case 'quiz':quizIntro();break;
      case 'quiz-start':quiz={index:0,answers:[],revealed:false};renderQuestion();break;
      case 'quiz-submit':submitAnswer();break;
      case 'quiz-next':if(!quiz.revealed)break;if(quiz.index===P.questions.length-1)finishQuiz();else{quiz.index++;quiz.revealed=false;renderQuestion();}break;
      case 'quiz-review':showQuizResult();break;
      case 'plan':planDialog();break;
      case 'plan-save':if(!currentPlan){toast('请先填写有效的每周标准学时');break;}state.plan={...currentPlan,savedAt:new Date().toISOString()};save();toast('学习计划已保存');break;
      case 'plan-export':if(!currentPlan){toast('请先填写有效的每周标准学时');break;}download('数字孪生-学习计划.json',JSON.stringify(currentPlan,null,2));toast('学习计划已导出');break;
      case 'lab-run':sim.running=!sim.running;logSim(sim.running?'启动模拟运行':'暂停模拟运行');updateSim();break;
      case 'lab-fault':sim.fault=!sim.fault;logSim(sim.fault?'传感器数据断链，停止接收新采样':'数据连接已恢复',sim.fault?'alarm':'normal');updateSim();break;
      case 'reset-camera':window.dispatchEvent(new CustomEvent('twin:reset-camera'));toast('模型视角已重置');break;
      case 'lab-guide':labGuide();break;
      case 'goto-lab':closeDialog();$('#lab').scrollIntoView({behavior:'smooth'});break;
      case 'lab-export':{logSim('导出实验记录');const rows=[['记录时间','教学场景','事件','负载(%)','模拟温度(°C)','告警阈值(°C)','运行状态'],...sim.records.map(r=>[r.at,r.scene,r.event,r.speed,r.temperature,r.threshold,r.status])];download('数字孪生-教学实验记录.csv','\ufeff'+rows.map(row=>row.map(s=>'"'+String(s).replaceAll('"','""')+'"').join(',')).join('\r\n'),'text/csv;charset=utf-8');toast('教学实验记录已导出');break;}
      case 'sources':sources();break;
      case 'glossary':glossary();break;
    }
    if(b.closest('#mobile-nav')){$('#mobile-nav').hidden=true;$('[data-action="menu"]').setAttribute('aria-expanded','false');}
  });
  document.addEventListener('change',e=>{if(e.target.id==='atlas-level'){atlasLevel=e.target.value;renderDomainDetail();}if(e.target.name==='condition'){const n=$$('input[name="condition"]:checked').length;$('#condition-result').textContent=n?`已勾选${n}项对照条件。请为勾选项目准备对应证明材料，并由评价机构核验职业、专业及证书等对应要求。`:'对照条件后，继续准备相应工作经历、证书或学籍学历材料。具体职业与专业对应范围见原文脚注。';}if(e.target.name==='quiz-answer'){$$('.quiz-option').forEach(l=>l.classList.toggle('selected',!!$('input:checked',l)));$('#quiz-submit').disabled=false;}if(['plan-level','plan-weekly'].includes(e.target.id))updatePlan();if(e.target.id==='mapping-field'){sim.field=e.target.value;logSim(`映射字段切换为${e.target.options[e.target.selectedIndex].text}`);updateSim();}});
  $('#resource-search').addEventListener('input',renderResources);$('#global-search').addEventListener('input',renderSearch);
  document.addEventListener('input',e=>{if(e.target.id==='plan-weekly')updatePlan();if(e.target.id==='speed'){sim.speed=Number(e.target.value);updateSim();}if(e.target.id==='threshold'){sim.threshold=Number(e.target.value);updateSim();}});
  ['speed','threshold'].forEach(id=>$('#'+id).addEventListener('change',()=>logSim(id==='speed'?`运行负载调整为${sim.speed}%`:`告警阈值调整为${sim.threshold}°C`)));
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if($('#content-dialog').open)closeDialog();if(!$('#search-dialog').open)openSearch();}});
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const rect=d.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)d.close();}}));
  const navLinks=$$('.desktop-nav a');
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){const link=navLinks.find(a=>a.getAttribute('href')==='#'+entry.target.id);if(link){navLinks.forEach(a=>a.classList.toggle('active',a===link));}}});},{rootMargin:'-15% 0px -65% 0px'});
  ['home','standard','skills','lab','cases','resources'].forEach(id=>observer.observe($('#'+id)));
  $('#task-count').textContent=allTasks.length;
  if(location.protocol==='file:'){const link=$('a[href="portal-offline.zip"]');if(link){link.textContent='当前为本地版';link.removeAttribute('href');link.removeAttribute('download');}}
  renderLevels();renderAtlas();renderCases();renderResources();renderLessons();updateProgressIndicator();logSim('教学模拟已启动');updateSim();
  setInterval(()=>{if(!document.hidden)updateSim(true);},1000);
  window.addEventListener('twin:ready',()=>updateSim());
})();
