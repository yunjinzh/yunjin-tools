'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Map, ArrowUpRight, ArrowRight, Search, Bookmark, BookOpen, Check, Play, ThumbsUp, Eye, X, SlidersHorizontal, Download, CheckCircle2, Compass, PenLine, Info, RotateCcw, LoaderCircle } from 'lucide-react';
import { emptyRecord, LearningRecord, Lesson } from './lib/types';
import { useLearning } from './lib/use-learning';
import { isDirty } from './lib/learning-machine';
import { useCatalog } from './lib/use-catalog';
import {lessons as builtInLessons} from './lib/catalog';
import {useContentUpdates} from './lib/use-content-updates';
import {OfflineControls} from './components/offline-controls';
import type { View } from './lib/catalog-state';
const short = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(n >= 1000000 ? 0 : 1).replace(/\.0$/, '')}万` : n.toLocaleString('zh-CN');
const exact = (n: number) => n.toLocaleString('zh-CN');
const builtInIds=new Set(builtInLessons.map(l=>l.id));
const views = { explore: '热门精选', saved: '我的收藏', notes: '学习笔记' } as const;
function Cover({ lesson, hero = false }: {
    lesson: Lesson;
    hero?: boolean;
}) {
    const [failedId, setFailedId] = useState<string | null>(null);
    const failed = failedId === lesson.id;
    return <div className={`cover ${hero ? 'hero-cover' : ''}`}>
 {failed ? <div className="cover-fallback"><Map size={52}/><span>{lesson.category}</span></div> : <img src={builtInIds.has(lesson.id)?`/covers/${lesson.id}.jpg`:`https://i.ytimg.com/vi/${lesson.id}/hqdefault.jpg`} alt={`${lesson.title} 原视频封面`} loading={hero ? 'eager' : 'lazy'} onError={() => setFailedId(lesson.id)}/>}
 <span className="cover-label">{lesson.category}</span>{lesson.duration && <span className="duration">{lesson.duration}</span>}
 <span className="play-bubble" aria-hidden="true"><Play size={18} fill="currentColor"/></span>
 </div>;
}
export default function Home() {
    const { state, dispatch, load, save, notify, device, resolveConflict } = useLearning();
    const updates=useContentUpdates(state.panel.kind!=='closed'||state.mutation.kind==='saving');
    const {lessons,coreContent}=updates.data;
    const categories=useMemo(()=>['全部',...new Set(lessons.map(l=>l.category))],[lessons]);
    const { state: catalog, transition } = useCatalog(categories);
    const { view, query, category, minViews, minLikes, sort, status } = catalog;
    const setQuery = (query: string) => transition({ type: 'PATCH', patch: { query } });
    const setCategory = (category: string) => transition({ type: 'PATCH', patch: { category } });
    const setMinViews = (minViews: number) => transition({ type: 'PATCH', patch: { minViews } });
    const setMinLikes = (minLikes: number) => transition({ type: 'PATCH', patch: { minLikes } });
    const setSort = (sort: string) => transition({ type: 'PATCH', patch: { sort } });
    const setStatus = (status: string) => transition({ type: 'PATCH', patch: { status } });
    const { records, panel, mutation, notice: toast } = state;
    const loaded = state.read.kind === 'ready';
    const authenticated = state.read.kind === 'ready' && state.read.authenticated;
    const loadError = state.read.kind === 'error' ? state.read.message : '';
    const saving = mutation.kind === 'saving';
    const active = panel.kind === 'lesson' ? lessons.find(l => l.id === panel.draft.id) || null : null;
    const draft = panel.kind === 'lesson' ? panel.draft : null;
    const method = panel.kind === 'method', discard = panel.kind === 'lesson' && panel.mode === 'confirm-discard';
    const playing = panel.kind === 'lesson' && panel.media !== 'poster', dirty = isDirty(panel);
    const conflict = mutation.kind === 'conflict' && mutation.id === active?.id ? mutation : null;
    const saveError = mutation.kind === 'error' && mutation.id === active?.id ? mutation.message : '';
    const modal = useRef<HTMLDialogElement>(null), continueButton = useRef<HTMLButtonElement>(null);
    const opener = useRef<HTMLElement | null>(null), editorFocus = useRef<HTMLElement | null>(null);
    function getRecord(id: string) { return records[id] || emptyRecord(id); }
    function setDraft(next: LearningRecord) { dispatch({ type: 'EDIT', patch: { favorite: next.favorite, status: next.status, notes: next.notes } }); }
    function setMethod() { opener.current = document.activeElement as HTMLElement; dispatch({ type: 'OPEN_METHOD' }); }
    useEffect(() => {
        const before = (e: BeforeUnloadEvent) => { if (dirty || saving) {
            e.preventDefault();
            e.returnValue = '';
        } };
        window.addEventListener('beforeunload', before);
        return () => window.removeEventListener('beforeunload', before);
    }, [dirty, saving]);
    const panelOpen = panel.kind !== 'closed';
    useEffect(() => {
        if (panelOpen) {
            modal.current?.showModal();
            modal.current?.scrollTo({ top: 0 });
            document.body.style.overflow = 'hidden';
        }
        else {
            modal.current?.close();
            document.body.style.overflow = '';
            if (opener.current?.isConnected)
                opener.current.focus();
            opener.current = null;
        }
        return () => { document.body.style.overflow = ''; };
    }, [panelOpen]);
    useEffect(() => {
        if (discard) {
            editorFocus.current = document.activeElement as HTMLElement;
            continueButton.current?.focus();
        }
        else if (panelOpen && editorFocus.current?.isConnected) {
            editorFocus.current.focus();
            editorFocus.current = null;
        }
    }, [discard]);
    const favorites = lessons.filter(l => getRecord(l.id).favorite), noted = lessons.filter(l => getRecord(l.id).notes.trim()), completed = lessons.filter(l => getRecord(l.id).status === '已学完').length;
    const filtered = useMemo(() => lessons.filter(l => {
        const r = records[l.id] || emptyRecord(l.id), text = `${l.zhTitle} ${l.title} ${l.channel} ${l.description} ${l.category} ${l.tools.join(' ')} ${coreContent[l.id]?.gist || ''} ${coreContent[l.id]?.core.map(p => p.heading + ' ' + p.body).join(' ') || ''} ${view === 'notes' ? r.notes : ''}`.toLowerCase();
        return (view !== 'saved' || r.favorite) && (view !== 'notes' || r.notes.trim()) && (category === '全部' || l.category === category) && l.views >= minViews && l.likes >= minLikes && (status === '全部进度' || r.status === status) && text.includes(query.trim().toLowerCase());
    }).sort((a, b) => sort === 'views' ? b.views - a.views : sort === 'likes' ? b.likes - a.likes : sort === 'newest' ? b.published.localeCompare(a.published) : 0), [view, records, query, category, minViews, minLikes, sort, status,lessons,coreContent]);
    const featured = lessons.find(l => l.id === 'kIID5FDi2JQ') || lessons[0];
    function navigate(v: View) { transition({ type: 'NAVIGATE', view: v }); }
    function open(l: Lesson) { opener.current = document.activeElement as HTMLElement; dispatch({ type: 'OPEN_LESSON', id: l.id }); }
    function close() { dispatch({ type: 'REQUEST_CLOSE' }); }
    function finishClose() { dispatch({ type: 'DISCARD' }); }
    function reset() { transition({ type: 'RESET' }); }
    function downloadDraft() { if (!draft || !active)
        return; const url = URL.createObjectURL(new Blob([`# ${active.title}\n\n原视频：${active.url}\n进度：${draft.status}\n收藏：${draft.favorite ? '是' : '否'}\n\n${draft.notes}\n`], { type: 'text/markdown;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `地图研习社-草稿-${active.id}.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); notify({ text: '已生成草稿下载文件，云端记录未改变。' }); }
    function exportNotes() { const content = '# 地图研习社 · 我的学习笔记\n\n' + noted.map(l => `## ${l.title}\n\n作者：${l.channel}\n原视频：${l.url}\n进度：${getRecord(l.id).status}\n\n${getRecord(l.id).notes}\n`).join('\n---\n\n'); const u = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' })), a = document.createElement('a'); a.href = u; a.download = '地图研习社-学习笔记.md'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); notify({ text: '已生成笔记下载文件' }); }
    const notice = toast && <div inert={discard||undefined} className={`toast ${toast.error ? 'error' : ''}`} role={toast.error ? 'alert' : 'status'}>{toast.error ? <Info size={19}/> : <CheckCircle2 size={19}/>}<span>{toast.text}{toast.login && <a href="/signin-with-chatgpt?return_to=%2F" target="_top">去登录 <ArrowUpRight size={12}/></a>}</span><button aria-label="关闭提示" onClick={() => dispatch({ type: 'DISMISS_NOTICE', id: toast.id })}><X size={16}/></button></div>;
return <><header className="site-header"><a className="brand" href="/?view=explore" aria-label="地图研习社首页"><span className="brand-icon"><Map size={26}/></span><span><strong>地图研习社</strong><small>MAP ATELIER</small></span></a><nav aria-label="主导航">{Object.entries(views).map(([key, label]) => <button key={key} className={view === key ? 'active' : ''} aria-current={view === key ? 'page' : undefined} onClick={() => navigate(key as View)}>{label}{key === 'saved' && favorites.length > 0 && <span>{favorites.length}</span>}</button>)}</nav><button aria-label="收录与更新" className="method-button" onClick={setMethod}><Info size={16}/><span>收录与更新</span></button></header>
 <main data-view={view} data-read-state={state.read.kind} data-auth-state={loaded ? (authenticated ? 'authenticated' : 'anonymous') : 'unknown'} data-save-state={mutation.kind}><div className="topline"><span>THE ART & SCIENCE OF MAPS</span><span>一间安静的地图设计学习馆 <i /></span></div>
 {view === 'explore' && query === '' && category === '全部' && featured && <section className="intro"><div className="intro-copy"><div className="eyebrow"><span /> 看见地图背后的设计</div><h1>好地图，<br />值得慢慢学<span>。</span></h1><p>从被广泛观看与认可的作品出发，<br className="desktop"/>学习制图原理、视觉表达与制作方法。</p><a className="intro-link" href="#library">浏览学习馆 <ArrowRight size={19}/></a><div className="intro-stats"><span><strong>{lessons.length.toString().padStart(2, '0')}</strong> 精选内容</span><span><strong>10万+</strong> 播放门槛</span><span><strong>1,000+</strong> 点赞门槛</span></div></div><button className="feature" onClick={() => open(featured)}><Cover lesson={featured} hero/><div className="feature-caption"><div><span className="eyebrow">从制图原理开始 · EDITOR'S PICK</span><h2>{featured.title}</h2><p>{featured.channel} <span>·</span> {short(featured.views)} 次播放</p></div><span className="circle-arrow"><ArrowUpRight size={25}/></span></div></button></section>}
 {view !== 'explore' && <section className="personal-intro"><span className="eyebrow">YOUR LEARNING SPACE</span><h1>{views[view]}<span>。</span></h1><p>{view === 'saved' ? '把值得反复看的内容，留在这里。' : '记下看懂的原理，也留下还想弄明白的问题。'}</p><div className="personal-count"><span>{authenticated?`${favorites.length} 条收藏`:loaded?'登录后显示学习统计':loadError?'学习统计暂不可用':'正在读取学习统计…'}</span>{authenticated&&<><span>{noted.length} 篇笔记</span><span>{completed} 条已学完</span></>}{view === 'notes' && <button className="outline" onClick={exportNotes} disabled={!loaded || !authenticated || !noted.length}><Download size={16}/>导出全部笔记</button>}</div></section>}
 {loadError && <div className="alert error" role="alert"><span>{loadError} 收藏和笔记暂时无法展示。</span><button onClick={load}><RotateCcw size={15}/>重新读取</button></div>}
 {mutation.kind === 'conflict' && <div className="alert error" role="alert"><span>有一条学习记录需要处理版本冲突，你的修改仍保留。</span><button onClick={() => { const lesson = lessons.find(l => l.id === mutation.id); if (lesson)
    open(lesson); }}>查看并处理</button></div>}
 <OfflineControls message={updates.message} checking={updates.checking} refresh={updates.refresh} pending={device.pending} offline={device.offline} sync={load}/>
 <section className="library" id="library"><div className="section-title"><div><span className="section-number">{view === 'explore' ? '01' : view === 'saved' ? '02' : '03'}</span><h2>{view === 'explore' ? '值得一看的地图设计' : view === 'saved' ? '我的学习书架' : '我的学习手记'}</h2><span className="result-count" role="status" aria-live="polite">{view!=='explore'&&!authenticated?'—':filtered.length+' 条'}</span></div><span className="section-aside">{view === 'explore' ? '播放与点赞双门槛 · 原始来源可追溯' : '收藏、进度与笔记随账号保存'}</span></div>
 <div className="search-line"><div className="search-box"><Search size={19}/><input maxLength={500} aria-label="搜索学习内容" value={query} onChange={e => setQuery(e.target.value)} placeholder={view === 'notes' ? '搜索笔记、主题、作者…' : '搜索主题、作者或工具，如 QGIS、地形…'}/>{query && <button aria-label="清空搜索" onClick={() => setQuery('')}><X size={16}/></button>}</div><label className="sort-label">排序<select aria-label="内容排序" value={sort} onChange={e => setSort(e.target.value)}><option value="curated">精选顺序</option><option value="views">播放量最高</option><option value="likes">点赞数最高</option><option value="newest">发布时间最近</option></select></label></div>
 <div className="categories" aria-label="学习主题">{categories.map(c => <button key={c} className={category === c ? 'selected' : ''} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div>
 <div className="filters"><span><SlidersHorizontal size={15}/>进一步筛选</span><label>播放量<select aria-label="最低播放量" value={minViews} onChange={e => setMinViews(+e.target.value)}><option value={100000}>10 万以上</option><option value={500000}>50 万以上</option><option value={1000000}>100 万以上</option><option value={10000000}>1,000 万以上</option></select></label><label>点赞数<select aria-label="最低点赞数" value={minLikes} onChange={e => setMinLikes(+e.target.value)}><option value={1000}>1,000 以上</option><option value={10000}>1 万以上</option><option value={50000}>5 万以上</option></select></label><label>学习进度<select aria-label="学习进度筛选" value={status} onChange={e => setStatus(e.target.value)}>{['全部进度', '未开始', '学习中', '已学完'].map(s => <option key={s}>{s}</option>)}</select></label><button className="reset" onClick={reset}><RotateCcw size={14}/>重置</button></div>
 <div className="snapshot-note"><span className="dot"/> 热度为经核验的公开快照，非实时数据。各条检索日期见详情。<button onClick={setMethod}>了解口径 <ArrowUpRight size={12}/></button></div>
 {view !== 'explore' && state.read.kind === 'error' ? <div className="empty" data-state="unavailable"><Info size={38}/><h3>学习记录暂时无法展示</h3><p>请点击上方“重新读取”。已有记录不会因读取失败而删除。</p></div> : view !== 'explore' && loaded && !authenticated ? <div className="empty" data-state="signed-out"><BookOpen size={38}/><h3>登录后查看你的学习记录</h3><p>收藏、进度和笔记随账号保存。</p><a className="primary" href="/signin-with-chatgpt?return_to=%2F" target="_top">登录并继续学习 <ArrowUpRight size={16}/></a></div> : view !== 'explore' && !loaded ? <div className="empty"><LoaderCircle className="spin"/><h3>正在读取你的学习记录</h3></div> : filtered.length === 0 ? <div className="empty"><Compass size={38}/><h3>{view === 'saved' && favorites.length === 0 ? '先收藏一份你想学习的内容' : view === 'notes' && noted.length === 0 ? '你的第一篇学习笔记，从这里开始' : '暂时没有符合条件的内容'}</h3><p>{view === 'explore' ? '换一个关键词，或减少筛选条件。' : '打开一条内容，即可收藏、记录进度和写笔记。'}</p><button className="primary" onClick={() => { reset(); if (view !== 'explore')
    navigate('explore'); }}>{view === 'explore' ? '重置筛选' : '去浏览热门精选'}<ArrowRight size={16}/></button></div> : <div className={view === 'notes' ? 'notes-grid' : 'card-grid'}>{filtered.map((l, i) => { const r = getRecord(l.id); return view === 'notes' ? <article className="note-card" key={l.id} data-lesson-id={l.id}><div className="note-meta"><PenLine size={17}/><span>{l.category}</span><span>{r.updated.slice(0, 10)}</span></div><button className="note-title" onClick={() => open(l)}>{l.title}<ArrowUpRight size={17}/></button><p className="note-content">{r.notes}</p><div className="note-footer"><span>{r.status}</span><button onClick={() => open(l)}>继续记录 <ArrowRight size={15}/></button></div></article> : <article className="lesson-card" key={l.id} data-lesson-id={l.id}><button className="cover-button" aria-label={`查看 ${l.title}`} onClick={() => open(l)}><Cover lesson={l}/></button><div className="card-body"><div className="card-author"><span>{l.channel}</span><button title={r.favorite ? '取消收藏' : '收藏学习内容'} aria-label={`${r.favorite ? '取消收藏' : '收藏'} ${l.title}`} aria-pressed={r.favorite} className={r.favorite ? 'bookmarked' : ''} disabled={saving || mutation.kind === 'conflict'} onClick={() => save({ ...r, favorite: !r.favorite })}><Bookmark size={19} fill={r.favorite ? 'currentColor' : 'none'}/></button></div><button className="card-title" onClick={() => open(l)}>{l.zhTitle}</button><p className="english-title">{l.title}</p><p className="card-description">{l.description}</p><div className="tools">{l.tools.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div><div className="card-bottom"><span title={`${exact(l.views)} 次播放`}><Eye size={15}/>{short(l.views)}</span><span title={`${exact(l.likes)} 次点赞`}><ThumbsUp size={14}/>{short(l.likes)}</span><span className={`progress ${r.status === '已学完' ? 'done' : ''}`}>{r.status === '已学完' ? <Check size={13}/> : null}{!loaded?'进度未读取':r.status === '未开始' ? '待学习' : r.status}</span></div></div></article>; })}</div>}
 </section><footer><span className="footer-brand"><Map size={20}/> 地图研习社 <small>MAP ATELIER</small></span><p>看一张好地图，理解一种表达世界的方式。</p><button onClick={setMethod}>关于收录与数据 <ArrowUpRight size={14}/></button></footer></main>
 <dialog ref={modal} data-state={panel.kind === 'lesson' ? panel.mode : panel.kind} data-lesson-id={active?.id} data-dirty={dirty} data-save-state={mutation.kind} className={method ? 'method-dialog' : 'lesson-dialog'} onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget)
    close(); }} aria-label={method ? '收录标准与数据说明' : active?.title || '学习内容'}>
 <div inert={discard || undefined} className="reader-body"><button className="close-modal" aria-label="关闭详情" onClick={close} disabled={saving}><X size={21}/></button>
 {method ? <div className="method-content"><span className="eyebrow">CURATION, WITH EVIDENCE</span><h2>先看内容，<br />也看得见依据。</h2><p>这是一份面向个人学习的地图设计精选集。高热度是入门筛选条件，学习价值仍需结合自己的目标判断。</p><div className="criteria"><div><strong>100,000+</strong><span>单条视频播放量</span></div><div><strong>1,000+</strong><span>单条视频点赞数</span></div></div><h3>如何收录</h3><p>主题须直接涉及地图原理、视觉设计或制作方法，并同时达到以上两项门槛。没有可核查热度数据的内容不进入精选；不使用频道总量替代单条指标。</p><h3>数据是什么时间的？</h3><p>本批次于 2026 年 11 月 9 日检索 YouTube 原视频页面的搜索索引。索引的实际采集时间未知，数值可能滞后；这是公开热度快照，不是实时排行榜。每条详情均保留原始链接和精确数值。</p><h3>学习说明与原文</h3><p>每条详情新增核心内容，分别标明提炼依据、核对范围和资料来源。能获取字幕时按转录提炼，只有作者简介时仅概括简介明确表达的内容；完整语境请以原视频为准。技术教程的界面与功能可能随软件版本变化。</p><h3>后续如何更新</h3><p>按北京时间每周一、三、五 08:00 核验更新。每轮寻找地图设计相关内容，核对单条播放量与点赞数，提炼有来源的核心内容后入库。没有合格新内容时不会为凑数量添加。旧视频 ID 保留，收藏和笔记继续使用。</p><p>你可以在创建本站的对话中提出“更新地图研习社”，也可以附上希望补充的视频链接。仍按 10 万播放、1,000 点赞双门槛筛选；未达到门槛或无法核查的内容不直接加入。网页打开、回到前台或恢复联网时自动检查最新资料，打开期间每 30 分钟补查。更新下载后不会刷新或打断正在编辑的笔记。</p><h3>你的学习记录</h3><p>收藏、进度和笔记保存到登录账号，支持跨设备查看。观看和进度独立，只有你手动标记后才算学完。首次联网登录并等待“离线资料已就绪”后，可安装到桌面离线使用。收藏和笔记先保存到本机，联网后同步云端；版本冲突时需要对照确认。视频本身不缓存，播放需联网。清除浏览器数据会清除未同步记录，建议定期导出笔记。</p><button className="primary" onClick={close}>开始浏览 <ArrowRight size={16}/></button></div> : active && draft && <><div className="detail-media">{playing ? <iframe key={`${active.id}-${panel.kind === 'lesson' ? panel.attempt : 0}`} data-state={panel.kind === 'lesson' ? panel.media : undefined} onLoad={() => { if (panel.kind === 'lesson')
    dispatch({ type: 'MEDIA_RESULT', id: active.id, attempt: panel.attempt, result: 'embedded' }); }} onError={() => { if (panel.kind === 'lesson')
    dispatch({ type: 'MEDIA_RESULT', id: active.id, attempt: panel.attempt, result: 'unavailable' }); }} src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1`} title={active.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/> : <button onClick={() => dispatch({ type: 'MEDIA_START' })} aria-label="在站内播放视频"><Cover lesson={active} hero/><span className="watch-overlay"><Play size={18} fill="currentColor"/>播放原视频</span></button>}</div><div className="detail-content"><div className="eyebrow">{active.category} <span> / </span> {active.channel}</div><h2>{active.zhTitle}</h2><p className="detail-english">{active.title}</p><p className="detail-description">{active.description}</p><div className="detail-actions"><a href={active.url} target="_blank" rel="noreferrer" className="primary">在 YouTube 学习 <ArrowUpRight size={16}/></a><button aria-pressed={draft.favorite} className={`outline ${draft.favorite ? 'bookmarked' : ''}`} onClick={() => setDraft({ ...draft, favorite: !draft.favorite })}><Bookmark size={17} fill={draft.favorite ? 'currentColor' : 'none'}/>{draft.favorite ? '已选收藏' : '加入收藏'}</button><button className="outline" onClick={() => document.getElementById('core-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><BookOpen size={17}/>读核心内容</button><button className="outline" onClick={() => document.getElementById('learning-note')?.focus()}><PenLine size={17}/>写笔记</button></div><div className="embed-tip" role="status" data-state={panel.kind === 'lesson' ? panel.media : 'poster'}>{panel.kind === 'lesson' && panel.media === 'loading' ? '正在加载播放器…' : panel.kind === 'lesson' && panel.media === 'unavailable' ? '播放器未能及时加载，可重试或使用上方原始链接。' : playing ? '播放器已打开；若无法播放，可通过上方原始链接观看。' : '站内播放与学习进度独立，可随时前往 YouTube 观看。'}{panel.kind === 'lesson' && panel.media === 'unavailable' && <button className="reset" onClick={() => dispatch({ type: 'MEDIA_START' })}>重新加载播放器</button>}</div>{coreContent[active.id] && <section className="core-section" id="core-content" aria-label="视频核心内容"><div className="core-heading"><h3><BookOpen size={18}/>核心内容</h3><span>{coreContent[active.id].evidenceLevel}</span></div><div className="core-gist"><span>一句话理解</span><p>{coreContent[active.id].gist}</p></div><ol className="core-points">{coreContent[active.id].core.map((point, index) => <li key={point.heading}><span className="core-index">{String(index + 1).padStart(2, '0')}</span><div><h4>{point.heading}</h4><p>{point.body}</p></div></li>)}</ol>{coreContent[active.id].supplement && <aside className="core-supplement"><strong>{coreContent[active.id].supplement!.heading}</strong><p>{coreContent[active.id].supplement!.body}</p><a href={coreContent[active.id].supplement!.url} target="_blank" rel="noreferrer">查看官方补充资料 <ArrowUpRight size={13}/></a></aside>}<details className="core-sources"><summary>提炼依据与来源 <span>核查日期 {coreContent[active.id].checked}</span></summary><p>{coreContent[active.id].basis}</p><ul>{coreContent[active.id].sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={13}/></a></li>)}</ul></details></section>}<div className="detail-columns"><section><h3><BookOpen size={18}/>这条内容适合学什么</h3><ul className="takeaways">{active.takeaways.map(t => <li key={t}>{t}</li>)}</ul>{active.chapters && <div className="chapters"><span>作者提供的学习章节</span>{active.chapters.map(c => <a key={c.time} href={`${active.url}&t=${c.time.split(':').reduce((n, v) => n * 60 + Number(v), 0)}s`} target="_blank" rel="noreferrer"><time>{c.time}</time>{c.label}<ArrowUpRight size={12}/></a>)}</div>}<p className="muted small">导读依据作者公开说明整理，具体步骤以原视频为准。</p><p className="context-note">{active.context}</p><div className="evidence"><h3>热度与原始来源</h3><div className="evidence-numbers"><div><strong>{exact(active.views)}</strong><span>播放量</span></div><div><strong>{exact(active.likes)}</strong><span>点赞数</span></div></div><dl><div><dt>发布时间</dt><dd>{active.published || '未核实'}</dd></div><div><dt>检索日期</dt><dd>{active.checked}</dd></div><div><dt>数据口径</dt><dd>{active.metricsNote}</dd></div></dl><a href={active.source} target="_blank" rel="noreferrer">核对原视频页面 <ArrowUpRight size={14}/></a></div></section><section className="notebook"><h3><PenLine size={18}/>我的学习笔记</h3><label className="progress-label">学习进度<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as LearningRecord['status'] })}>{['未开始', '学习中', '已学完'].map(s => <option key={s}>{s}</option>)}</select></label><label htmlFor="learning-note">记下值得记住的内容</label><textarea id="learning-note" maxLength={10000} value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} placeholder={"例如：投影保留了什么，又牺牲了什么？\n\n可以记下关键时间点、设计方法和自己的理解。"}/><div className="draft-tools"><button className="reset" onClick={downloadDraft}><Download size={14}/>下载当前草稿</button></div>{saveError && <p className="inline-error" role="alert">{saveError}</p>}{conflict && <section className="conflict-panel" aria-label="处理版本冲突" data-state="conflict"><h4>已有较新的记录</h4><p>当前输入仍在编辑框中。对照现有记录，再选择如何继续。</p><div className="remote-record"><strong>现有版本 · {conflict.remote.status} · {conflict.remote.favorite ? '已收藏' : '未收藏'}</strong><p>{conflict.remote.notes || '（云端暂无笔记）'}</p></div><p className="small">保留草稿后，再次保存会用当前收藏、进度和笔记替换上方云端记录；采用云端会替换编辑框内容，建议先下载草稿。</p><button className="outline" onClick={() => resolveConflict('local')}>保留草稿，继续编辑</button><button className="outline" onClick={() => resolveConflict('remote')}>采用云端记录</button></section>}<div className="note-counter">{draft.notes.length.toLocaleString()} / 10,000</div>{!authenticated && loaded && <p className="login-tip"><a href="/signin-with-chatgpt?return_to=%2F" target="_top">登录后保存学习记录 <ArrowUpRight size={13}/></a></p>}</section></div></div><div className="detail-save" data-state={conflict ? 'conflict' : saving ? 'saving' : dirty ? 'dirty' : 'clean'}><span role="status" aria-live="polite">{conflict ? '请先处理版本冲突' : saving ? '正在保存，仍可继续编辑…' : dirty ? '有尚未保存的修改' : draft.updated ? (device.pending>0?'已保存本机 · 有待同步记录':'记录已保存') : '选择进度、收藏或写下笔记后保存'}</span><button className="primary" disabled={!dirty || saving || !!conflict} onClick={() => save(draft)}>{saving ? <LoaderCircle size={17} className="spin"/> : <Check size={17}/>}保存学习记录</button></div></>}
 </div>{discard && <div className="discard-layer"><section role="alertdialog" aria-modal="true" aria-label="尚未保存修改"><PenLine size={28}/><h3>先留下这次学习的收获？</h3><p>关闭后，本次尚未保存的修改会丢失。</p><button className="primary" ref={continueButton} onClick={() => dispatch({ type: 'CONTINUE_EDITING' })}>继续编辑</button><button className="outline" onClick={finishClose}>放弃本次修改</button></section></div>}
 {panelOpen && notice}</dialog>
 {!panelOpen && notice}

 </>;

}
