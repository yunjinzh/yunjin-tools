"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, Check, CheckCheck, ChevronLeft, ChevronRight, CircleHelp, Clock3, Copy, Download, Eye, EyeOff, FileText, Grid2X2, ImagePlus, KeyRound, Layers3, LayoutGrid, LoaderCircle, LockKeyhole, Pause, Play, Plus, RefreshCw, Settings2, ShieldCheck, Sparkles, Trash2, Upload, WandSparkles, X } from "lucide-react";
import { DEFAULT_SETTINGS, MODELS, RATIOS, generationBody, restoreJobs, splitPrompts, type Job, type Settings } from "@/lib/image-types";
import { api } from "@/lib/client-api";
import { ImageQueue } from "@/lib/queue";
import { makeZip } from "@/lib/zip";

const STORAGE = "huajian.jobs.v1";
const TEMPLATES = [
  { name: "儿童绘本", className: "storybook", subtitle: "柔软笔触 · 温暖故事", prompt: "儿童绘本插画，一只背着小书包的小狐狸走在春天的森林里，柔和的水彩质感，温暖的阳光，圆润可爱的造型，画面简洁，不含文字" },
  { name: "产品摄影", className: "product", subtitle: "自然光线 · 细腻质感", prompt: "专业产品摄影，一瓶琥珀色玻璃香水放置在米白色石台上，旁边有一支橄榄枝，窗外自然光投下柔和影子，极简构图，细腻真实的材质，无文字" },
  { name: "旅行海报", className: "travel", subtitle: "自由配色 · 远方灵感", prompt: "复古旅行海报，意大利海岸的小镇，暖橘色的建筑，碧蓝的海面，前景有柠檬树，丝网印刷质感，大色块，充满夏日气息，留白，无文字" },
  { name: "线稿涂色", className: "lineart", subtitle: "清晰线条 · 留白想象", prompt: "适合小朋友涂色的黑白线稿，一只小熊在花园里浇花，白色背景，粗细均匀的黑色轮廓，形状简单，宽大的涂色空间，无阴影，无灰色，无文字" },
];
const STATUS: Record<string, string> = { queued: "排队中", submitting: "正在提交", generating: "生成中", success: "已完成", failed: "生成失败", unknown: "待确认", paused: "已暂停" };
function saveBlob(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000); }
function dateLabel(value: number) { return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }); }
function imageHref(url: string) { try { const parsed = new URL(url); return parsed.protocol === "https:" ? parsed.href : ""; } catch { return ""; } }

export default function Studio() {
  const [view, setView] = useState<"studio" | "history" | "help">("studio");
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"lines" | "blocks">("lines");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);
  const keyRef = useRef("");
  const [keyDraft, setKeyDraft] = useState("");
  const [keyOpen, setKeyOpen] = useState(false); const [showKey, setShowKey] = useState(false);
  const [connected, setConnected] = useState(false); const [connecting, setConnecting] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [notice, setNotice] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<{ credits: number; count: number; canGenerate: boolean; requiresSubscription: boolean; signature: string } | null>(null);
  const [filter, setFilter] = useState("all"); const [batch, setBatch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<{ job: Job; index: number } | null>(null);
  const [downloading, setDownloading] = useState("");
  const [cloud, setCloud] = useState<any[] | null>(null); const [cloudPage, setCloudPage] = useState(1); const [cloudLoading, setCloudLoading] = useState(false);
  const engine = useRef<ImageQueue | null>(null); const importRef = useRef<HTMLInputElement>(null); const dialogRef = useRef<HTMLDialogElement>(null); const previewRef = useRef<HTMLDialogElement>(null);
  const prompts = splitPrompts(prompt, mode), total = prompts.length * settings.copies;
  const signature = JSON.stringify({ prompts, settings });
  const signatureRef = useRef(signature); signatureRef.current = signature;
  const active = jobs.filter(j => ["queued", "submitting", "generating"].includes(j.status)).length;
  const inFlight = jobs.some(j => ["submitting", "generating"].includes(j.status));
  const paused = jobs.filter(j => j.status === "paused").length;
  const completed = jobs.filter(j => j.status === "success");
  const currentJobs = view === "history" ? jobs : batch ? jobs.filter(j => j.batchId === batch) : jobs;
  const visibleJobs = currentJobs.filter(j => filter === "all" || (filter === "running" ? ["queued", "submitting", "generating", "paused"].includes(j.status) : filter === "failed" ? ["failed", "unknown"].includes(j.status) : j.status === filter));
  const successful = currentJobs.filter(j => j.status === "success");

  useEffect(() => {
    let stored: Job[] = [];
    try { const value = JSON.parse(localStorage.getItem(STORAGE) || "[]"); if (Array.isArray(value)) stored = restoreJobs(value.filter(j => j && typeof j.id === "string" && typeof j.prompt === "string" && j.settings && STATUS[j.status]).slice(0, 500)); }
    catch { setNotice("浏览器无法读取本地记录，当前会话仍可正常使用。"); }
    const queue = new ImageQueue(stored, (action, data) => api(action, data, keyRef.current), (next) => {
      setJobs(next);
      try { localStorage.setItem(STORAGE, JSON.stringify(next)); } catch { setNotice("本地记录保存失败，请及时下载结果，刷新后可能无法恢复。"); }
    });
    engine.current = queue; setJobs(stored); setReady(true);
    return () => { queue.disposed = true; };
  }, []);
  useEffect(() => { if (keyOpen) dialogRef.current?.showModal(); else dialogRef.current?.close(); }, [keyOpen]);
  useEffect(() => { if (preview) previewRef.current?.showModal(); else previewRef.current?.close(); }, [preview]);
  useEffect(() => { if (estimate?.signature !== signature) setEstimate(null); }, [signature, estimate]);
  useEffect(() => {
    if (!inFlight && !active) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler);
  }, [inFlight, active]);

  function editSetting<K extends keyof Settings>(name: K, value: Settings[K]) { setSettings(s => ({ ...s, [name]: value })); }
  function needKey() { if (!keyRef.current) { setKeyOpen(true); return true; } return false; }
  function showError(error: unknown) { setNotice(error instanceof Error ? error.message : "操作失败，请重试。"); }
  function validPrompts() {
    if (!prompts.length) { setNotice("先写下一条提示词，再开始创作。"); return false; }
    if (total > 100) { setNotice("每批最多生成 100 张，请减少提示词或每条张数。"); return false; }
    if (prompts.some(p => p.length > 12000)) { setNotice("单条提示词不能超过 12000 字符。"); return false; }
    return true;
  }
  async function connect() {
    const value = keyDraft.trim(); if (!value) { setKeyError("请输入 ListenHub API Key。"); return; }
    setConnecting(true); setKeyError("");
    try {
      await api("verify", {}, value); keyRef.current = value; setConnected(true); setKeyDraft(""); setKeyOpen(false); setEstimate(null); setNotice("ListenHub 已连接，可以开始创作了。");
    } catch (error) { setKeyError((error as Error).message); } finally { setConnecting(false); }
  }
  async function estimateCost() {
    if (!validPrompts() || needKey()) return;
    setEstimating(true); setEstimate(null); const captured = signature;
    try {
      let credits = 0, allowed = true, subscription = false;
      const unique = settings.model === "gpt-image-2-official" ? [...new Set(prompts)] : [prompts[0]];
      const estimates = new Map<string, number>();
      for (const p of unique) { const result = await api("estimate", generationBody(p, settings), keyRef.current); estimates.set(p, result.credits); allowed = allowed && result.canGenerate !== false; subscription ||= Boolean(result.requiresSubscription); }
      for (const p of prompts) credits += (estimates.get(settings.model === "gpt-image-2-official" ? p : prompts[0]) || 0) * settings.copies;
      if (signatureRef.current === captured) setEstimate({ credits, count: total, canGenerate: allowed, requiresSubscription: subscription, signature: captured });
    } catch (error) { showError(error); } finally { setEstimating(false); }
  }
  function start() {
    if (!validPrompts() || needKey() || !engine.current) return;
    if (jobs.length + total > 500) { setNotice("本地最多保留 500 个任务，请先下载并清理已完成记录。"); return; }
    if (Date.now() < engine.current.cooldownUntil) { setNotice("接口正在限流，请稍后再提交。"); return; }
    const id = engine.current.add(prompts, settings); setBatch(id); setFilter("all"); setSelected([]); setNotice(""); setView("studio");
  }
  function resume() { if (needKey()) return; try { engine.current?.resume(); } catch (error) { showError(error); } }
  function retry(job: Job) { if (needKey()) return; if (job.batchId === "cloud") { setNotice("云端恢复记录可能不包含原始提示词和完整参数，请在工作台填写后重新生成。"); return; } if (!window.confirm("将重新创建这张图片，可能再次消耗额度。继续？")) return; try { engine.current?.retry(job.id); } catch (error) { showError(error); } }
  async function importText(file?: File) { if (!file) return; if (file.size > 1024 * 1024) { setNotice("请导入小于 1 MB 的 UTF-8 文本文件。"); return; } setPrompt((await file.text()).replace(/^\uFEFF/, "")); setNotice("提示词已导入。请确认拆分方式和图片数量。"); if (importRef.current) importRef.current.value = ""; }
  function chooseTemplate(p: string) { setPrompt(prev => prev.trim() ? `${prev.trim()}${mode === "lines" ? "\n" : "\n---\n"}${p}` : p); setView("studio"); setNotice(""); }
  async function downloadOne(job: Job, index = 0) {
    if (needKey()) return; setDownloading(job.id);
    try { const blob: Blob = await api("download", { taskId: job.taskId, index }, keyRef.current, true); saveBlob(blob, `画间-${job.sequence || 1}-${index + 1}.${blob.type.includes("jpeg") ? "jpg" : blob.type.split("/")[1] || "png"}`); }
    catch (error) { showError(error); } finally { setDownloading(""); }
  }
  async function downloadZip() {
    if (needKey()) return;
    const chosen = successful.filter(j => !selected.length || selected.includes(j.id)); if (!chosen.length) return;
    const files: { name: string; bytes: Uint8Array<ArrayBuffer> }[] = []; let size = 0;
    try {
      let number = 0;
      for (const job of chosen) for (let i = 0; i < (job.images?.length || 0); i++) {
        setDownloading(`打包中 ${++number} / ${chosen.reduce((sum, j) => sum + (j.images?.length || 0), 0)}`);
        const blob: Blob = await api("download", { taskId: job.taskId, index: i }, keyRef.current, true); size += blob.size;
        if (size > 250 * 1024 * 1024) throw new Error("本次打包超过 250 MB，请勾选更少的图片分批下载。");
        files.push({ name: `${String(number).padStart(3, "0")}-${job.taskId}-${i + 1}.${blob.type.includes("jpeg") ? "jpg" : blob.type.split("/")[1] || "png"}`, bytes: new Uint8Array(await blob.arrayBuffer()) });
      }
      files.push({ name: "提示词与参数.json", bytes: new TextEncoder().encode(JSON.stringify(chosen, null, 2)) });
      saveBlob(makeZip(files), `画间-${new Date().toISOString().slice(0, 10)}.zip`); setNotice(`已打包 ${number} 张图片，包含提示词和生成参数。`);
    } catch (error) { showError(error); } finally { setDownloading(""); }
  }
  async function loadCloud(page = 1) {
    if (needKey()) return; setCloudLoading(true);
    try { const result = await api("history", { page }, keyRef.current); const items = result.items ?? result.tasks ?? result.list; if (!Array.isArray(items)) throw new Error("云端任务列表格式无法识别，请稍后重试。"); setCloud(items); setCloudPage(page); setView("history"); }
    catch (error) { showError(error); } finally { setCloudLoading(false); }
  }
  function importCloud(item: any) {
    if (!item.taskId || !engine.current) return;
    if (jobs.some(j => j.taskId === item.taskId)) { setNotice("该任务已在本地记录中。"); return; }
    if (jobs.length >= 500) { setNotice("请先清理已完成记录。"); return; }
    const status = item.status === "success" && item.images?.length ? "success" : item.status === "fail" ? "failed" : "paused";
    engine.current.import({ id: crypto.randomUUID(), batchId: "cloud", taskId: item.taskId, prompt: item.prompt || "从 ListenHub 云端恢复的任务", settings: { ...DEFAULT_SETTINGS, ...(item.model ? { model: item.model } : {}) }, status, images: item.images || [], createdAt: item.createdAt || Date.now(), sequence: jobs.length + 1, error: item.failMsg });
    setNotice("任务已恢复到本地记录。进行中的任务可点击继续队列查询。");
  }

  return <div className="app-shell">
    <aside className="rail"><button className="brand-mark" aria-label="画间首页" onClick={() => setView("studio")}><Layers3 size={25} /></button><div className="rail-line" />
      <button title="创作工作台" aria-label="创作工作台" className={view === "studio" ? "rail-button active" : "rail-button"} onClick={() => { setView("studio"); setFilter("all"); }}><WandSparkles size={21} /></button>
      <button title="任务记录" aria-label="任务记录" className={view === "history" ? "rail-button active" : "rail-button"} onClick={() => { setView("history"); setFilter("all"); setSelected([]); }}><Clock3 size={21} /></button>
      <div className="rail-bottom"><button title="使用指南" aria-label="使用指南" className={view === "help" ? "rail-button active" : "rail-button"} onClick={() => setView("help")}><CircleHelp size={21} /></button><span className="avatar">我</span></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="wordmark">画间<span>IMAGE STUDIO</span><i /><small>ListenHub 创作空间</small></div><button className={`connection ${connected ? "connected" : ""}`} onClick={() => setKeyOpen(true)}><span className="status-dot" />{connected ? "ListenHub 已连接" : "连接 API Key"}<Settings2 size={14} /></button></header>
      <main>
        <div className="page-heading"><div><div className="eyebrow"><span />YOUR IDEAS, IN EVERY FRAME</div><h1>{view === "studio" ? <>把灵感，变成一组好图<span className="heading-dot">。</span></> : view === "history" ? "每一次灵感，都有迹可循。" : "从一句话，到一组作品。"}</h1><p>{view === "studio" ? "写下想象，交给画间。让每一个创意，都多几种可能。" : view === "history" ? "查看本机任务，或从 ListenHub 恢复云端生成结果。" : "连接你的 ListenHub 账户，开始批量创作。"}</p></div><div className="workspace-label"><LockKeyhole size={13} /> 私人工作空间</div></div>
        {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="关闭提示" onClick={() => setNotice("")}><X size={16} /></button></div>}
        {view === "help" ? <div className="help-layout"><section className="help-card"><span className="eyebrow">QUICK START</span><h2>你的第一组图片</h2>{[["01", "连接 ListenHub", "点击右上角连接按钮，填写你已有的开发者 API Key。密钥只在当前页面内存中使用；刷新后需重新输入。"], ["02", "写下提示词", "默认每行一条提示词。需要多行描述时，切换到分段模式，用独立一行的 --- 分隔。也可以导入 UTF-8 .txt 文件。"], ["03", "选择参数并生成", "设置模型、分辨率、比例和每条张数。可先预估积分，再开始生成。每批最多 100 张，并发可设置 1–4。"], ["04", "挑选并下载", "点击图片预览，单张下载或勾选后打包 ZIP。ZIP 中同时保存提示词、参数和任务编号。"]].map(([n, title, text]) => <article key={n}><b>{n}</b><div><h3>{title}</h3><p>{text}</p></div></article>)}<button className="primary" onClick={() => setView("studio")}>开始创作 <ArrowRight size={16} /></button></section><section className="help-card notes"><h2>创作小贴士</h2><h3>积分与免费额度</h3><p>预估读取 ListenHub 实时接口，展示标价，不扣除账户免费次数，也不保证余额覆盖整批。实际以 ListenHub 结算为准。Pro 的 4K 或高质量需要有效订阅。</p><h3>暂停与刷新</h3><p>暂停只停止新任务提交，已提交任务会继续在云端生成。页面关闭时不会提交后续任务。重新连接 Key 并继续队列，可以查询已有任务，不重复生成。</p><h3>提交状态不确定</h3><p>网络中断可能发生在任务创建之后。标记“待确认”的任务不会自动重发；请先查看云端任务并恢复对应结果。</p><h3>本地记录</h3><p>提示词、参数和图片链接保存在当前浏览器，最多 500 个任务。Key 不写入本地存储或源代码。重要图片请及时下载。</p><a href="https://listenhub.ai/docs/zh/openapi/api-reference/image-generation" target="_blank" rel="noreferrer">查看 ListenHub 官方文档 <ArrowUpRight size={15} /></a></section></div> : <div className={view === "studio" ? "studio-layout" : "history-layout"}>
          {view === "studio" && <section className="composer"><div className="section-title"><span className="title-icon"><WandSparkles size={18} /></span><h2>创作配方</h2><span className="step-pill">01 / 输入灵感</span></div>
            <div className="field-label"><label htmlFor="prompts">画面描述</label><div className="text-actions"><button onClick={() => importRef.current?.click()}><Upload size={13} /> 导入 TXT</button><input ref={importRef} type="file" accept=".txt,text/plain" hidden onChange={e => { void importText(e.target.files?.[0]); }} /></div></div>
            <div className="mode-switch"><button className={mode === "lines" ? "selected" : ""} onClick={() => setMode("lines")}>每行一条</button><button className={mode === "blocks" ? "selected" : ""} onClick={() => setMode("blocks")}>多行分段</button></div>
            <div className="prompt-box"><textarea id="prompts" value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={150000} placeholder={mode === "lines" ? "描述你想看见的画面…\n\n例如：\n一只在森林里读书的小狐狸，水彩绘本风格\n阳光下的橘色小猫，柔和胶片摄影" : "在这里写下完整的多行描述。\n用独立一行的 --- 分隔下一条提示词。"} /><div className="prompt-footer"><span>{mode === "lines" ? "换一行，就是一个新创意" : "用独立一行的 --- 分隔"}</span><b>{prompts.length} 条提示词</b></div></div>
            <div className="inspiration-label"><Sparkles size={12} /> 试试这些灵感</div><div className="template-chips">{TEMPLATES.map(t => <button key={t.name} onClick={() => chooseTemplate(t.prompt)}>{t.name}<Plus size={11} /></button>)}</div>
            <div className="divider" /><div className="field-label"><label htmlFor="model">生成模型</label><span className="tiny-label">POWERED BY LISTENHUB</span></div><select id="model" value={settings.model} onChange={e => editSetting("model", e.target.value)}>{MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select><p className="field-hint">{MODELS.find(m => m.id === settings.model)?.detail}</p>
            <div className="two-fields"><div><label htmlFor="size">分辨率</label><div className="segmented" id="size">{["1K", "2K", "4K"].map(s => <button key={s} aria-pressed={s === settings.size} className={s === settings.size ? "selected" : ""} onClick={() => editSetting("size", s)}>{s}</button>)}</div></div><div><label htmlFor="ratio">画面比例</label><select id="ratio" value={settings.ratio} onChange={e => editSetting("ratio", e.target.value)}>{RATIOS.map(r => <option key={r}>{r}</option>)}</select></div></div>
            {settings.model === "gpt-image-2-official" && <div className="quality-field"><label htmlFor="quality">图像质量</label><select id="quality" value={settings.quality} onChange={e => editSetting("quality", e.target.value)}><option value="low">低 · 更快</option><option value="medium">中 · 均衡</option><option value="high">高 · 更多细节</option></select>{(settings.size === "4K" || settings.quality === "high") && <p className="field-hint">此配置需要有效的 ListenHub 订阅。</p>}</div>}
            <div className="two-fields"><div><label htmlFor="copies">每条生成</label><div className="number-input"><button aria-label="减少张数" disabled={settings.copies <= 1} onClick={() => editSetting("copies", settings.copies - 1)}>−</button><span id="copies">{settings.copies}<small> 张</small></span><button aria-label="增加张数" disabled={settings.copies >= 10} onClick={() => editSetting("copies", settings.copies + 1)}>+</button></div></div><div><label htmlFor="concurrency">同时进行</label><select id="concurrency" value={settings.concurrency} onChange={e => editSetting("concurrency", Number(e.target.value))}>{[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} 个任务{n === 2 ? " · 推荐" : ""}</option>)}</select></div></div>
            <div className="batch-summary"><div><span>本次预计生成</span><strong>{total}<small> 张图片</small></strong></div><button onClick={() => void estimateCost()} disabled={estimating || !prompts.length}>{estimating ? <LoaderCircle className="spin" size={13} /> : <Sparkles size={13} />} 预估积分</button></div>
            {estimate && <div className="estimate-result">标价预估 <b>{Number(estimate.credits.toFixed(2))} 积分</b><p>未抵扣免费次数，实际以结算为准。{!estimate.canGenerate ? "账户暂不满足生成条件，请检查余额或订阅。" : "预估不保证余额足够整批使用。"}</p></div>}
            <button className="primary generate" disabled={!ready || estimating || !prompts.length || total > 100 || active > 0 || estimate?.canGenerate === false} onClick={start}><WandSparkles size={17} />{active ? `正在处理 ${active} 个任务` : `开始生成${total ? ` · ${total} 张` : ""}`}<ArrowRight size={17} /></button><p className="under-button"><ShieldCheck size={12} /> 使用你自己的 ListenHub 额度</p>
          </section>}
          <section className="results"><div className="results-top"><div><span className="eyebrow">{view === "history" ? "YOUR CREATIVE ARCHIVE" : "02 / 见证灵感成形"}</span><h2>{view === "history" ? "任务记录" : "作品画廊"}<span>{currentJobs.length.toString().padStart(2, "0")}</span></h2></div><div className="toolbar">{view === "history" && <button className="secondary" onClick={() => void loadCloud()} disabled={cloudLoading}>{cloudLoading ? <LoaderCircle size={14} className="spin" /> : <RefreshCw size={14} />} 云端任务</button>}<button className="secondary" disabled={!successful.length || Boolean(downloading)} onClick={() => void downloadZip()}><Download size={14} />{downloading.startsWith("打包") ? downloading : selected.length ? `下载所选 (${selected.length})` : "打包下载"}</button></div></div>
            <div className="gallery-tabs"><div>{[["all", "全部"], ["running", "进行中"], ["success", "已完成"], ["failed", "需关注"]].map(([id, name]) => <button key={id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{name}{id === "success" && successful.length > 0 && <span>{successful.length}</span>}</button>)}</div><div className="gallery-tools">{paused > 0 && <button onClick={resume}><Play size={13} /> 继续队列</button>}{active > 0 && <button onClick={() => { engine.current?.pause(); setNotice("已暂停后续提交；已提交的任务仍会继续生成。"); }}><Pause size={13} /> 暂停提交</button>}{successful.length > 0 && <button aria-label="选择全部已完成图片" title="选择全部已完成图片" onClick={() => setSelected(selected.length === successful.length ? [] : successful.map(j => j.id))}><CheckCheck size={16} /></button>}<Grid2X2 size={15} className="muted" /></div></div>
            {active > 0 && <div className="queue-progress"><div><LoaderCircle size={14} className="spin" /><span>{successful.length} 已完成 · {active} 个任务处理中</span></div><div className="progress-track"><i style={{ width: `${currentJobs.length ? successful.length / currentJobs.length * 100 : 0}%` }} /></div></div>}
            {view === "history" && cloud !== null && <section className="cloud-panel"><div className="field-label"><h3>ListenHub 云端任务</h3><button aria-label="关闭云端任务" onClick={() => setCloud(null)}><X size={16} /></button></div><p>提交状态不确定时，可根据时间和提示词核对。恢复任务不会重新生成。</p>{cloud.length === 0 ? <p>本页没有云端任务。</p> : cloud.map(item => <div className="cloud-row" key={item.taskId}><div><b>{item.prompt || item.taskId}</b><small>{dateLabel(item.createdAt)} · {item.status === "fail" ? "失败" : item.status === "success" ? "已完成" : "进行中"}</small></div><button className="secondary" onClick={() => importCloud(item)}>恢复到本地</button></div>)}<div className="cloud-pagination"><button disabled={cloudPage <= 1 || cloudLoading} onClick={() => void loadCloud(cloudPage - 1)}><ChevronLeft size={14} />上一页</button><span>第 {cloudPage} 页</span><button disabled={cloud.length < 20 || cloudLoading} onClick={() => void loadCloud(cloudPage + 1)}>下一页<ChevronRight size={14} /></button></div></section>}
            {visibleJobs.length ? <div className="image-grid">{visibleJobs.map(job => <article className={`image-card ${selected.includes(job.id) ? "is-selected" : ""}`} key={job.id}>
              <div className={`image-area state-${job.status}`}>
                {job.status === "success" && job.images?.length ? <><button className="preview-button" aria-label={`预览图片 ${job.sequence}`} onClick={() => setPreview({ job, index: 0 })}><img src={imageHref(job.images[0].url)} alt={job.prompt} loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.alt = "图片预览暂不可用，请下载或打开原图"; }} /></button><label className="select-check"><input type="checkbox" aria-label={`选择图片 ${job.sequence}`} checked={selected.includes(job.id)} onChange={e => setSelected(s => e.target.checked ? [...s, job.id] : s.filter(id => id !== job.id))} /></label><button className="image-download" aria-label={`下载图片 ${job.sequence}`} disabled={Boolean(downloading)} onClick={() => void downloadOne(job)}><ArrowDownToLine size={16} /></button>{job.images.length > 1 && <span className="image-count">{job.images.length} 张</span>}</> : <div className="task-placeholder">{["submitting", "generating"].includes(job.status) ? <LoaderCircle className="spin" size={30} /> : job.status === "failed" || job.status === "unknown" ? <CircleHelp size={30} /> : <ImagePlus size={30} />}<b>{STATUS[job.status]}</b><p>{job.error || (job.status === "queued" ? "好灵感，值得等一下" : job.status === "paused" ? "点击继续队列接着创作" : "正在把想象变成画面")}</p>{job.status === "failed" && <button className="secondary" onClick={() => retry(job)}><RefreshCw size={12} />重新生成</button>}{job.status === "unknown" && <button className="secondary" onClick={() => void loadCloud()}>查看云端任务</button>}</div>}
              </div><div className="image-meta"><div><span className={`job-status ${job.status}`}><i />{STATUS[job.status]}</span><small>#{String(job.sequence).padStart(2, "0")}</small></div><p title={job.prompt}>{job.prompt}</p><footer><span>{job.settings.size} · {job.settings.ratio}</span><span>{dateLabel(job.createdAt)}</span></footer></div>
            </article>)}</div> : currentJobs.length ? <div className="filter-empty"><LayoutGrid size={28} /><h3>这里还没有符合条件的任务</h3><p>切换筛选，看看其他作品。</p></div> : <div className="empty-gallery"><div className="empty-illustration" aria-hidden="true"><div className="paper paper-back"><span /></div><div className="paper paper-front"><div className="mini-sun" /><div className="mini-hill one" /><div className="mini-hill two" /></div><span className="sketch-star">✳</span></div><h3>{view === "history" ? "你的创作记录会保存在这里" : "留一片空白，给你的想象"}</h3><p>{view === "history" ? "开始一个新任务，或从云端找回已有作品。" : "在左侧写下提示词，你的第一组作品将在这里出现。"}</p><div className="empty-steps"><span><FileText size={13} />写下灵感</span><ChevronRight size={12} /><span><Sparkles size={13} />批量生成</span><ChevronRight size={12} /><span><Download size={13} />收藏好图</span></div></div>}
            {view === "studio" && currentJobs.length === 0 && <div className="inspiration"><div className="inspiration-heading"><h3>不知道从哪里开始？</h3><span>选一个方向，轻松开场 <ArrowDownToLine size={12} /></span></div><div className="inspiration-grid">{TEMPLATES.map(t => <button key={t.name} className={`inspiration-card ${t.className}`} onClick={() => chooseTemplate(t.prompt)}><div className="template-art" aria-hidden="true"><span /><i /><b /></div><div><h4>{t.name}<ArrowUpRight size={14} /></h4><p>{t.subtitle}</p></div></button>)}</div><p className="template-note">灵感卡片为图形示意，点击可填入提示词。</p></div>}
            {view === "history" && jobs.some(j => ["success", "failed"].includes(j.status)) && <button className="clear-history" onClick={() => { if (window.confirm("仅清理本机已完成和失败记录，云端任务不受影响。请先保存需要的图片。")) { engine.current?.clearCompleted(); setSelected([]); } }}><Trash2 size={13} /> 清理本机已完成记录</button>}
            <div className="gallery-foot"><span><span className="little-dot" /> 灵感不设限，创作有条理</span><span>LISTENHUB × 画间</span></div>
          </section>
        </div>}
      </main>
    </div>
    <dialog ref={dialogRef} className="key-dialog" onCancel={() => setKeyOpen(false)} onClick={e => { if (e.target === e.currentTarget) setKeyOpen(false); }}><div className="dialog-content"><button className="dialog-close" aria-label="关闭连接窗口" onClick={() => setKeyOpen(false)}><X size={19} /></button><div className="dialog-icon"><KeyRound size={25} /></div><h2>{connected ? "管理你的连接" : "连接你的创作引擎"}</h2><p>使用已有的 ListenHub 开发者 Key，<br />让灵感从这里开始。</p><form onSubmit={e => { e.preventDefault(); void connect(); }}><label htmlFor="api-key">ListenHub API Key</label><div className="key-input"><input id="api-key" type={showKey ? "text" : "password"} value={keyDraft} onChange={e => setKeyDraft(e.target.value)} placeholder={connected ? "填写新 Key 以更换连接" : "粘贴你的 API Key"} autoComplete="off" spellCheck={false} disabled={connecting || inFlight} /><button type="button" aria-label={showKey ? "隐藏 Key" : "显示 Key"} onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{keyError && <p className="error-text" role="alert">{keyError}</p>}<div className="key-safety"><ShieldCheck size={17} /><span>Key 仅保留在当前页面内存，通过本站服务端调用 ListenHub。不会写入浏览器存储、源代码或应用日志。</span></div><button className="primary" disabled={connecting || inFlight} type="submit">{connecting ? <LoaderCircle size={16} className="spin" /> : <KeyRound size={16} />}{connecting ? "正在验证连接…" : "验证并连接"}</button>{inFlight && <p className="field-hint">请等待已提交任务结束后更换或断开 Key。</p>}</form>{connected && <button className="disconnect" disabled={inFlight} onClick={() => { engine.current?.pause(); keyRef.current = ""; setConnected(false); setEstimate(null); setKeyOpen(false); }}>断开连接并清除内存中的 Key</button>}<a className="key-link" href="https://listenhub.ai/settings/api-keys" target="_blank" rel="noreferrer">前往 ListenHub 获取 Key <ArrowUpRight size={13} /></a></div></dialog>
    <dialog ref={previewRef} className="preview-dialog" onCancel={() => setPreview(null)} onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>{preview && <div className="preview-content"><button className="dialog-close" aria-label="关闭预览" onClick={() => setPreview(null)}><X size={20} /></button><img src={imageHref(preview.job.images?.[preview.index]?.url || "")} alt={preview.job.prompt} referrerPolicy="no-referrer" /><div className="preview-info"><div className="field-label"><h3>作品 #{String(preview.job.sequence).padStart(2, "0")}</h3><span>{preview.index + 1} / {preview.job.images?.length}</span></div><p>{preview.job.prompt}</p><small>{preview.job.settings.model} · {preview.job.settings.size} · {preview.job.settings.ratio}</small>{preview.job.images && preview.job.images.length > 1 && <div className="preview-pager"><button disabled={preview.index === 0} onClick={() => setPreview({ ...preview, index: preview.index - 1 })}>上一张</button><button disabled={preview.index === preview.job.images.length - 1} onClick={() => setPreview({ ...preview, index: preview.index + 1 })}>下一张</button></div>}<div className="preview-actions"><button className="primary" disabled={Boolean(downloading)} onClick={() => void downloadOne(preview.job, preview.index)}><Download size={15} /> 下载原图</button><button className="secondary" onClick={() => { setPrompt(preview.job.prompt); setView("studio"); setPreview(null); }}><Copy size={14} />复用提示词</button><a href={imageHref(preview.job.images?.[preview.index]?.url || "")} target="_blank" rel="noreferrer">打开原图 <ArrowUpRight size={14} /></a></div></div></div>}</dialog>
  </div>;
}

