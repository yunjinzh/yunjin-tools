import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  Download,
  Flame,
  Headphones,
  Home,
  Lightbulb,
  Menu,
  Mic,
  MicOff,
  NotebookPen,
  Play,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Star,
  Target,
  Trophy,
  Volume2,
  X,
} from "lucide-react";

import { allModules, courseUnits, type CourseModule, type CourseUnit } from "../app/course-data";
import textbookJson from "../app/textbook-content.json";
import "./styles.css";

type TextbookBlock = { type: "heading" | "label" | "text" | "vocabulary"; text: string };
type TextbookPage = { pdfPage: number; textbookPage: number; blocks: TextbookBlock[] };
type TextbookModule = { pages: TextbookPage[]; tasks: string[]; pdfStart: number; pdfEnd: number };
const textbookContent = textbookJson as Record<string, TextbookModule>;
declare global { interface Window { __TEXTBOOK_PDF_URL__?: string; __TEXTBOOK_PDF_BASE64__?: string } }

type Saved = {
  completed: string[];
  wrong: string[];
  drafts: Record<string, string>;
  highlights: Record<string, string[]>;
  blockNotes: Record<string, string>;
  questions: Record<string, string[]>;
  reflections: Record<string, string>;
  streak: number;
  lastStudy: string;
  lastModule: string;
};
type Chat = { role: "me" | "ai"; text: string };

const KEY = "g4-chinese-ai-offline-v1";
const initialSaved: Saved = { completed: [], wrong: [], drafts: {}, highlights: {}, blockNotes: {}, questions: {}, reflections: {}, streak: 0, lastStudy: "", lastModule: "" };

function dateKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function normalize(text: string) {
  return text.replace(/[\s，。！？、；：“”‘’（）《》,.!?;:'"()\-]/g, "").toLowerCase();
}

function scoreSpeech(spoken: string, target: string) {
  const a = normalize(spoken);
  const b = normalize(target);
  if (!a || !b) return 0;
  const targetChars = new Set(b.split(""));
  const matched = a.split("").filter((char) => targetChars.has(char)).length;
  const lengthPenalty = Math.abs(a.length - b.length) / Math.max(a.length, b.length);
  return Math.max(0, Math.min(100, Math.round((matched / Math.max(a.length, b.length) - lengthPenalty * .3) * 100)));
}

function offlineAnswer(question: string, lesson: CourseModule, unit: CourseUnit) {
  if (/作文|怎么写|修改|开头|结尾/.test(question) || lesson.kind === "习作") {
    return `先完成小提纲：${lesson.practice} 再补动作、语言或感受。写完检查是否做到“${unit.expressionSkill}”。`;
  }
  if (/朗读|背诵|记不住/.test(question)) {
    return `把内容切成2—3小段，按“听一遍—跟读两遍—遮住文字说关键词”练习。先记：${lesson.keywords.slice(0, 5).join("、")}。`;
  }
  if (/为什么|理解|意思/.test(question)) {
    return `用三步思考：发生了什么？这说明什么？依据在哪里？本课提示：${lesson.quiz.explanation}`;
  }
  if (/词|生字|不会读/.test(question)) {
    return `点击词语卡听读音，再选两个词说一句完整的话。本课重点词：${lesson.keywords.join("、")}。`;
  }
  return `先说出你的猜想，再找一个依据。可以这样回答：“我认为……因为……所以……”。本课重点是：${lesson.goals.join("；")}。`;
}

function App() {
  const [screen, setScreen] = useState<"home" | "unit" | "lesson">("home");
  const [unitId, setUnitId] = useState(1);
  const [lessonId, setLessonId] = useState("u1-1");
  const [tab, setTab] = useState<"know" | "quiz" | "write" | "done">("know");
  const [saved, setSaved] = useState<Saved>(initialSaved);
  const [ready, setReady] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [speechText, setSpeechText] = useState("");
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [menu, setMenu] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [model, setModel] = useState("gpt-5-mini");
  const [token, setToken] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [chat, setChat] = useState<Chat[]>([{ role: "ai", text: "你好，我是小语。遇到不明白的词句、朗读或习作问题，都可以问我。" }]);
  const recognition = useRef<any>(null);

  const unit = courseUnits.find((item) => item.id === unitId) ?? courseUnits[0];
  const lesson = allModules.find((item) => item.id === lessonId) ?? allModules[0];
  const progress = Math.round(saved.completed.length / allModules.length * 100);
  const next = useMemo(() => allModules.find((item) => !saved.completed.includes(item.id)) ?? allModules[0], [saved.completed]);
  const draft = saved.drafts[lesson.id] ?? "";

  useEffect(() => {
    try {
      const value = localStorage.getItem(KEY);
      if (value) setSaved({ ...initialSaved, ...JSON.parse(value) });
      setEndpoint(localStorage.getItem(`${KEY}-endpoint`) ?? "");
      setModel(localStorage.getItem(`${KEY}-model`) ?? "gpt-5-mini");
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(saved));
  }, [saved, ready]);

  useEffect(() => {
    setAnswer(null); setChecked(false); setFeedback([]); setSpeechText(""); setSpeechScore(null); setTab("know");
  }, [lessonId]);

  function openUnit(id: number) { setUnitId(id); setScreen("unit"); setMenu(false); }
  function openLesson(id: string) {
    const found = allModules.find((item) => item.id === id);
    if (!found) return;
    setUnitId(found.unitId); setLessonId(id); setScreen("lesson"); setMenu(false);
    setSaved((current) => ({ ...current, lastModule: id }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function speak(text: string, rate = .82) {
    if (!("speechSynthesis" in window)) return alert("当前浏览器暂不支持语音朗读。");
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN"; utterance.rate = rate;
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => /zh-CN|Chinese/i.test(`${voice.lang}${voice.name}`)) ?? null;
    speechSynthesis.speak(utterance);
  }
  function startListen() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("当前浏览器不支持语音识别。建议用最新版 Chrome 或 Edge；本地文件模式下，部分浏览器还需要允许麦克风权限。");
    const rec = new SR(); rec.lang = "zh-CN"; rec.interimResults = false; rec.continuous = false;
    rec.onstart = () => { setListening(true); setSpeechText(""); setSpeechScore(null); };
    rec.onresult = (event: any) => { const text = event.results?.[0]?.[0]?.transcript ?? ""; setSpeechText(text); setSpeechScore(scoreSpeech(text, lesson.speak)); };
    rec.onerror = () => alert("没有听清，请靠近麦克风再试一次。");
    rec.onend = () => setListening(false); recognition.current = rec; rec.start();
  }
  function checkAnswer() {
    if (answer === null) return alert("请先选择一个答案。");
    setChecked(true);
    const correct = answer === lesson.quiz.answer;
    setSaved((current) => ({ ...current, wrong: correct ? current.wrong.filter((id) => id !== lesson.id) : Array.from(new Set([...current.wrong, lesson.id])) }));
  }
  function evaluate() {
    if (!draft.trim()) return alert("先写下一段内容吧。");
    const tags = lesson.coachTags.filter((word) => draft.includes(word));
    setFeedback([
      draft.length >= 60 ? "内容已经比较完整。" : "再补一个具体动作、画面或理由，会更完整。",
      tags.length >= 2 ? `用到了“${tags.slice(0,3).join("、")}”，紧扣本课任务。` : `可以自然用上“${lesson.coachTags.slice(0,3).join("、")}”中的一两个词。`,
      /因为|所以|先|接着|然后|最后|但是|如果/.test(draft) ? "连接词让顺序更加清楚。" : "试着用“先、接着、最后”或“因为、所以”连接内容。",
    ]);
  }
  function complete() {
    const today = dateKey();
    setSaved((current) => ({ ...current, completed: Array.from(new Set([...current.completed, lesson.id])), lastStudy: today, streak: current.lastStudy === today ? current.streak : current.lastStudy === dateKey(-1) ? current.streak + 1 : 1 }));
    alert("本课完成，获得1颗成长星！");
  }
  async function ask(text = aiInput) {
    const question = text.trim(); if (!question || aiBusy) return;
    setAiInput(""); setChat((items) => [...items, { role: "me", text: question }]); setAiBusy(true);
    try {
      if (endpoint.trim()) {
        const response = await fetch(endpoint.trim(), { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ model, messages: [{ role: "system", content: `你是小学四年级语文学习伙伴。当前课程${lesson.title}，目标${lesson.goals.join("；")}。只给分步提示，不代写作业。` }, { role: "user", content: question }] }) });
        if (!response.ok) throw new Error();
        const data = await response.json();
        const result = data?.choices?.[0]?.message?.content ?? data?.output_text ?? data?.answer;
        if (!result) throw new Error();
        setChat((items) => [...items, { role: "ai", text: String(result) }]);
      } else {
        setChat((items) => [...items, { role: "ai", text: offlineAnswer(question, lesson, unit) }]);
      }
    } catch {
      setChat((items) => [...items, { role: "ai", text: `真实AI暂时无法连接，我先用本地方式帮助你：${offlineAnswer(question, lesson, unit)}` }]);
    } finally { setAiBusy(false); }
  }
  function saveSettings() {
    localStorage.setItem(`${KEY}-endpoint`, endpoint.trim()); localStorage.setItem(`${KEY}-model`, model || "gpt-5-mini"); setSettings(false);
  }

  const sidebar = <aside className={`side ${menu ? "show" : ""}`}><button className="logo" onClick={() => { setScreen("home"); setMenu(false); }}><span><BookOpen /></span><b>小语成长营<small>四年级上册</small></b></button><button className={screen === "home" ? "active" : ""} onClick={() => { setScreen("home"); setMenu(false); }}><Home />学习首页</button><p>全册八个单元</p>{courseUnits.map((item) => { const done = item.modules.filter((mod) => saved.completed.includes(mod.id)).length; return <button key={item.id} className={screen !== "home" && item.id === unitId ? "active" : ""} onClick={() => openUnit(item.id)}><i style={{ color: item.color, background: `${item.color}18` }}>{item.id}</i><span>{item.subtitle}<small>{done}/{item.modules.length} 已完成</small></span></button>; })}<div className="side-tip"><Lightbulb /><span>每天20分钟：先听读，再思考，最后表达。</span></div></aside>;

  return <div className="app">
    {sidebar}{menu && <button className="shade" aria-label="关闭菜单" onClick={() => setMenu(false)} />}
    <main><header className="bar"><button className="menu" onClick={() => setMenu(true)}><Menu /></button><div><b>{screen === "home" ? "欢迎回来，小小读书人" : screen === "unit" ? `${unit.title} · ${unit.subtitle}` : lesson.title}</b><small>今天也要让思考留下痕迹</small></div><div className="bar-progress"><span><Star />{saved.completed.length}颗星</span><i><b style={{ width: `${progress}%` }} /></i><strong>{progress}%</strong></div><button className="ai-btn" onClick={() => setAiOpen(true)}><Sparkles />问小语</button></header>
      <section className="work">
        {screen === "home" && <><article className="hero"><div><span><Sparkles />今日学习</span><small>每天进步一点点</small><h1>{next.title}</h1><p>{next.goals[0]}，预计用时{next.duration}分钟。</p><button onClick={() => openLesson(next.id)}>开始今日任务<ArrowRight /></button><em><Flame />连续学习 {saved.streak} 天</em></div><div className="ring" style={{ "--p": `${progress * 3.6}deg` } as React.CSSProperties}><b>{progress}%</b><small>全册进度</small></div></article><div className="stats"><div><CheckCircle2 /><b>{saved.completed.length}</b><small>完成任务</small></div><div><Star /><b>{saved.completed.length}</b><small>成长星</small></div><div><Target /><b>{saved.wrong.length}</b><small>待巩固</small></div><div><BookOpen /><b>8</b><small>主题单元</small></div></div><div className="title"><span><small>学习地图</small><h2>全册八个主题单元</h2></span><p>按教材顺序学习，也可直接进入正在学习的单元。</p></div><div className="units">{courseUnits.map((item) => { const done = item.modules.filter((mod) => saved.completed.includes(mod.id)).length; return <button key={item.id} style={{ "--c": item.color } as React.CSSProperties} onClick={() => openUnit(item.id)}><i>0{item.id}</i><h3>{item.subtitle}</h3><p>{item.theme}</p><span><b style={{ width: `${done / item.modules.length * 100}%` }} /></span><small>{done}/{item.modules.length} 已完成</small></button>; })}</div></>}
        {screen === "unit" && <><button className="back" onClick={() => setScreen("home")}><ArrowLeft />返回学习地图</button><article className="unit-hero" style={{ "--c": unit.color } as React.CSSProperties}><small>{unit.title}</small><h1>{unit.subtitle}</h1><p>{unit.theme}</p></article><div className="skills"><div><BrainCircuit /><span><small>阅读策略</small><p>{unit.readingSkill}</p></span></div><div><NotebookPen /><span><small>表达任务</small><p>{unit.expressionSkill}</p></span></div></div><div className="title"><span><small>任务清单</small><h2>从认识到表达，一步一步学</h2></span></div><div className="lessons">{unit.modules.map((item, index) => <button key={item.id} onClick={() => openLesson(item.id)}><i className={saved.completed.includes(item.id) ? "done" : ""}>{saved.completed.includes(item.id) ? <Check /> : index + 1}</i><span><small>{item.kind} · 约{item.duration}分钟</small><b>{item.title}</b><p>{item.goals[0]}</p></span><ArrowRight /></button>)}</div></>}
        {false && screen === "lesson" && <><button className="back" onClick={() => setScreen("unit")}><ArrowLeft />返回{unit.title}</button><article className="lesson-head" style={{ "--c": unit.color } as React.CSSProperties}><div><small>{lesson.kind} · 约{lesson.duration}分钟</small><h1>{lesson.title}</h1><p>{lesson.requirement}</p></div><button onClick={() => speak(lesson.speak)}><Headphones />听本课导读</button></article><nav className="tabs"><button className={tab === "know" ? "active" : ""} onClick={() => setTab("know")}>1 认识</button><button className={tab === "quiz" ? "active" : ""} onClick={() => setTab("quiz")}>2 练习</button><button className={tab === "write" ? "active" : ""} onClick={() => setTab("write")}>3 表达</button><button className={tab === "done" ? "active" : ""} onClick={() => setTab("done")}>4 达标</button></nav>
          {tab === "know" && <div className="cards"><article><h2><Target />本课目标</h2>{lesson.goals.map((goal, i) => <p className="goal" key={goal}><i>{i + 1}</i>{goal}</p>)}</article><article><h2><Volume2 />点击词语，先听再读</h2><div className="words">{lesson.keywords.map((word) => <button key={word} onClick={() => speak(word, .72)}><Volume2 />{word}</button>)}</div></article><article><h2><Mic />朗读跟练</h2><blockquote>{lesson.speak}</blockquote><div className="row"><button onClick={() => speak(lesson.speak)}><Play />播放范读</button><button className={listening ? "danger" : "primary"} onClick={listening ? () => recognition.current?.stop() : startListen}>{listening ? <MicOff /> : <Mic />}{listening ? "结束朗读" : "开始朗读"}</button></div>{speechText && <div className="speech"><span>我听到：{speechText}</span><b>{speechScore}分</b></div>}</article></div>}
          {tab === "quiz" && <div className="cards"><article><h2><BrainCircuit />{lesson.quiz.question}</h2><div className="options">{lesson.quiz.options.map((option, i) => <button disabled={checked} className={`${answer === i ? "selected" : ""} ${checked && i === lesson.quiz.answer ? "correct" : ""} ${checked && answer === i && i !== lesson.quiz.answer ? "wrong" : ""}`} onClick={() => setAnswer(i)} key={option}><i>{String.fromCharCode(65 + i)}</i>{option}{checked && i === lesson.quiz.answer && <CheckCircle2 />}{checked && answer === i && i !== lesson.quiz.answer && <X />}</button>)}</div>{checked && <div className="explain"><b>{answer === lesson.quiz.answer ? "回答正确" : "再想一想"}</b><p>{lesson.quiz.explanation}</p></div>}<div className="row">{checked ? <button onClick={() => { setAnswer(null); setChecked(false); }}><RotateCcw />再做一次</button> : <button className="primary" onClick={checkAnswer}>检查答案</button>}<button onClick={() => { setAiOpen(true); ask(`这道题我不太明白：${lesson.quiz.question}`); }}><Sparkles />请AI提示</button></div></article></div>}
          {tab === "write" && <div className="cards"><article><h2><NotebookPen />表达应用</h2><div className="prompt"><Lightbulb />{lesson.practice}</div><textarea value={draft} onChange={(event) => setSaved((current) => ({ ...current, drafts: { ...current.drafts, [lesson.id]: event.target.value } }))} placeholder="在这里写下你的想法。先说清楚，再慢慢写生动……" /><div className="row between"><span>{draft.length}字</span><button className="primary" onClick={evaluate}><Sparkles />本地AI检查</button></div>{feedback.length > 0 && <div className="feedback"><b>小语的修改建议</b>{feedback.map((item) => <p key={item}><Check />{item}</p>)}</div>}</article></div>}
          {tab === "done" && <div className="cards"><article className="master"><Trophy /><h2>{saved.completed.includes(lesson.id) ? "太棒了，本课已经点亮！" : "最后检查一次，领取成长星"}</h2><p>我知道学习目标；我完成了互动练习；我能用自己的话表达。</p><button className="primary" disabled={saved.completed.includes(lesson.id)} onClick={complete}><Star />{saved.completed.includes(lesson.id) ? "已获得成长星" : "完成本课"}</button></article></div>}
        </>}
        {screen === "lesson" && <OfflineLesson key={lesson.id} unit={unit} lesson={lesson} textbook={textbookContent[lesson.id]} saved={saved} setSaved={setSaved} draft={draft} answer={answer} checked={checked} feedback={feedback} speechText={speechText} speechScore={speechScore} listening={listening} onBack={() => setScreen("unit")} onSpeak={speak} onListen={startListen} onStopListen={() => recognition.current?.stop()} onAnswer={setAnswer} onCheck={checkAnswer} onReset={() => { setAnswer(null); setChecked(false); }} onEvaluate={evaluate} onComplete={complete} onAsk={(question) => { setAiOpen(true); ask(question); }} />}
      </section>
    </main>
    <aside className={`ai ${aiOpen ? "open" : ""}`}><header><div><Sparkles /></div><span><b>AI学习伙伴 · 小语</b><small>{endpoint ? "真实AI模式" : "本地免密模式"}</small></span><button onClick={() => setSettings(!settings)}><Settings2 /></button><button className="close" onClick={() => setAiOpen(false)}><X /></button></header>{settings && <div className="settings"><label>安全代理地址<input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="可选，留空使用本地助手" /></label><label>模型<input value={model} onChange={(e) => setModel(e.target.value)} /></label><label>临时令牌（不保存）<input type="password" value={token} onChange={(e) => setToken(e.target.value)} /></label><button onClick={saveSettings}>保存</button><p>不要在公开页面中填写云端服务商的长期密钥，请使用自己的安全代理。</p></div>}<div className="context"><BookOpen />正在学习：{lesson.title}</div><div className="messages">{chat.slice(-9).map((item, i) => <p key={i} className={item.role}>{item.text}</p>)}{aiBusy && <p className="ai">正在思考……</p>}</div><div className="quick"><button onClick={() => ask("这课最重要的方法是什么？")}>本课方法</button><button onClick={() => ask("我该怎样完成课后要求？")}>课后要求</button><button onClick={() => ask("朗读和背诵有什么方法？")}>朗读背诵</button></div><div className="ask"><textarea rows={3} value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="把不明白的地方告诉小语……" /><button onClick={() => ask()}><Send /></button></div><small className="notice">AI会提示思路，重要答案要回到课文中找依据。</small></aside>
  </div>;
}

type OfflineLessonProps = {
  unit: CourseUnit;
  lesson: CourseModule;
  textbook?: TextbookModule;
  saved: Saved;
  setSaved: React.Dispatch<React.SetStateAction<Saved>>;
  draft: string;
  answer: number | null;
  checked: boolean;
  feedback: string[];
  speechText: string;
  speechScore: number | null;
  listening: boolean;
  onBack: () => void;
  onSpeak: (text: string, rate?: number) => void;
  onListen: () => void;
  onStopListen: () => void;
  onAnswer: (index: number) => void;
  onCheck: () => void;
  onReset: () => void;
  onEvaluate: () => void;
  onComplete: () => void;
  onAsk: (question: string) => void;
};

function OfflineLesson(props: OfflineLessonProps) {
  const [mode, setMode] = useState<"student" | "teacher">("student");
  const [tab, setTab] = useState("map");
  const [pageIndex, setPageIndex] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [questionDraft, setQuestionDraft] = useState("");
  const [pdfUrl, setPdfUrl] = useState(() => typeof window === "undefined" ? "" : window.__TEXTBOOK_PDF_URL__ ?? "");
  const pages = props.textbook?.pages ?? [];
  const page = pages[Math.min(pageIndex, Math.max(0, pages.length - 1))];
  const highlights = props.saved.highlights[props.lesson.id] ?? [];
  const questions = props.saved.questions[props.lesson.id] ?? [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.__TEXTBOOK_PDF_URL__) { setPdfUrl(window.__TEXTBOOK_PDF_URL__); return; }
      const base64 = window.__TEXTBOOK_PDF_BASE64__;
      if (!base64) return;
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      window.__TEXTBOOK_PDF_URL__ = url;
      setPdfUrl(url);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function changeMode(next: "student" | "teacher") {
    setMode(next);
    setTab(next === "student" ? "map" : "design");
  }

  function toggleHighlight(key: string) {
    props.setSaved((current) => {
      const currentItems = current.highlights[props.lesson.id] ?? [];
      const nextItems = currentItems.includes(key) ? currentItems.filter((item) => item !== key) : [...currentItems, key];
      return { ...current, highlights: { ...current.highlights, [props.lesson.id]: nextItems } };
    });
  }

  function addQuestion() {
    const clean = questionDraft.trim();
    if (!clean) return;
    props.setSaved((current) => ({ ...current, questions: { ...current.questions, [props.lesson.id]: [...(current.questions[props.lesson.id] ?? []), clean] } }));
    setQuestionDraft("");
  }

  const reader = page ? <article className="offline-reader card">
    <header className="offline-reader-bar"><div><b>排版原文</b><span>教材第{page.textbookPage}页 · PDF第{page.pdfPage}页</span></div><div><button onClick={() => setFontSize((size) => Math.max(15, size - 1))}>字−</button><button onClick={() => setFontSize((size) => Math.min(24, size + 1))}>字＋</button><button onClick={() => props.onSpeak(page.blocks.map((block) => block.text).join("\n"))}><Headphones />朗读本页</button></div></header>
    <nav className="offline-page-nav"><button disabled={pageIndex === 0} onClick={() => setPageIndex((index) => index - 1)}><ArrowLeft />上一页</button><b>{pageIndex + 1}/{pages.length}</b><button disabled={pageIndex >= pages.length - 1} onClick={() => setPageIndex((index) => index + 1)}>下一页<ArrowRight /></button></nav>
    <div className="offline-reader-split">
      <section className="offline-text" style={{ "--reader-size": `${fontSize}px` } as React.CSSProperties}><p className="reader-tip"><Lightbulb />排版原文便于听读和批注；拼音、插图与原始版式请用右侧教材原页核对。</p>{page.blocks.map((block, index) => { const key = `${props.lesson.id}:${page.pdfPage}:${index}`; const active = highlights.includes(key); return <div className={`offline-block ${block.type} ${active ? "marked" : ""}`} key={key}><p>{block.text}</p><div><button onClick={() => props.onSpeak(block.text, .8)}><Volume2 />听读</button><button onClick={() => toggleHighlight(key)}><BookMarked />{active ? "已标重点" : "标重点"}</button></div><details><summary>助学注释与我的批注</summary><p>读后先概括“写了什么”，再圈出最能支持判断的词句；遇到生词先联系上下文猜，再查证。</p><textarea rows={3} value={props.saved.blockNotes[key] ?? ""} onChange={(event) => props.setSaved((current) => ({ ...current, blockNotes: { ...current.blockNotes, [key]: event.target.value } }))} placeholder={mode === "student" ? "写下词义、画面、感受、问题或依据……" : "写下教法提示、板书要点或课堂追问……"} /></details></div>; })}</section>
      <aside className="offline-pdf"><header><b>教材原页</b><span>准确校对依据</span></header>{pdfUrl ? <iframe src={`${pdfUrl}#page=${page.pdfPage}&view=FitH&toolbar=0`} title={`${props.lesson.title}教材原页`} /> : <div className="pdf-loading">正在准备内置教材原页……</div>}</aside>
    </div><footer>若排版文字出现个别识别差异，以同屏教材原页为准。</footer>
  </article> : <article className="card"><p>本课教材内容正在整理。</p></article>;

  const studentTabs = [["map", "1 自学导图"], ["text", "2 原文伴读"], ["task", "3 思考探究"], ["write", "4 表达应用"], ["reflect", "5 自评复盘"]];
  const teacherTabs = [["design", "1 教学设计"], ["text", "2 原文备课"], ["teacherq", "3 课堂提问"], ["assess", "4 评价建议"]];
  const currentTabs = mode === "student" ? studentTabs : teacherTabs;

  return <div className="offline-rich" style={{ "--c": props.unit.color } as React.CSSProperties}>
    <button className="back" onClick={props.onBack}><ArrowLeft />返回{props.unit.title}</button>
    <article className="lesson-head offline-head"><div><small>{props.lesson.kind} · 约{props.lesson.duration}分钟 · 教材第{pages[0]?.textbookPage ?? "—"}—{pages.at(-1)?.textbookPage ?? "—"}页</small><h1>{props.lesson.title}</h1><p>{mode === "student" ? `自学任务：${props.lesson.requirement}` : `导学重点：${props.lesson.requirement}`}</p></div><button onClick={() => props.onSpeak(props.lesson.speak)}><Headphones />听本课导读</button></article>
    <div className="offline-mode"><button className={mode === "student" ? "active" : ""} onClick={() => changeMode("student")}><BookOpen />学生自学</button><button className={mode === "teacher" ? "active" : ""} onClick={() => changeMode("teacher")}><Target />教师导学</button></div>
    <nav className="tabs offline-tabs">{currentTabs.map(([value, label]) => <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{label}</button>)}</nav>

    {mode === "student" && tab === "map" && <div className="cards"><article><h2><Target />六步自主学习路线</h2><div className="offline-map">{[["定目标", "说清要学什么"], ["读通文", "听读并圈出生词"], ["会提问", "写下自己的疑问"], ["找依据", "回原文定位词句"], ["会表达", "观点加依据"], ["能复盘", "总结方法与困难"]].map(([title, copy], index) => <div key={title}><i>{index + 1}</i><b>{title}</b><p>{copy}</p></div>)}</div></article><article><h2><CheckCircle2 />本课目标</h2>{props.lesson.goals.map((goal, index) => <p className="goal" key={goal}><i>{index + 1}</i>{goal}</p>)}<h2><Volume2 />词语听读</h2><div className="words">{props.lesson.keywords.map((word) => <button key={word} onClick={() => props.onSpeak(word, .72)}><Volume2 />{word}</button>)}</div></article></div>}
    {tab === "text" && reader}
    {mode === "student" && tab === "task" && <div className="cards"><article><h2><BookMarked />教材课后要求</h2><div className="offline-tasks">{(props.textbook?.tasks ?? [props.lesson.requirement]).map((task, index) => <div key={task}><i>{index + 1}</i><span><b>{task}</b><p>圈出任务动词 → 回到原文找依据 → 用自己的话组织答案。</p><button onClick={() => props.onAsk(`不要直接给答案，请用三个递进问题提示我完成：${task}`)}><Sparkles />给我分级提示</button></span></div>)}</div></article><article><h2><Lightbulb />我的问题篮</h2><div className="question-compose"><textarea rows={3} value={questionDraft} onChange={(event) => setQuestionDraft(event.target.value)} placeholder="我不明白…… / 作者为什么…… / 如果……" /><button className="primary" onClick={addQuestion}>保存问题</button></div>{questions.map((question, index) => <p className="saved-question" key={`${question}-${index}`}><b>Q{index + 1}</b><span>{question}</span><button onClick={() => props.onAsk(`只提示方法和原文位置，不要直接回答：${question}`)}>求提示</button></p>)}</article><article><h2><BrainCircuit />即时检测：{props.lesson.quiz.question}</h2><div className="options">{props.lesson.quiz.options.map((option, index) => <button disabled={props.checked} className={`${props.answer === index ? "selected" : ""} ${props.checked && index === props.lesson.quiz.answer ? "correct" : ""} ${props.checked && props.answer === index && index !== props.lesson.quiz.answer ? "wrong" : ""}`} onClick={() => props.onAnswer(index)} key={option}><i>{String.fromCharCode(65 + index)}</i>{option}{props.checked && index === props.lesson.quiz.answer && <CheckCircle2 />}{props.checked && props.answer === index && index !== props.lesson.quiz.answer && <X />}</button>)}</div>{props.checked && <div className="explain"><b>{props.answer === props.lesson.quiz.answer ? "回答正确" : "再想一想"}</b><p>{props.lesson.quiz.explanation}</p></div>}<div className="row">{props.checked ? <button onClick={props.onReset}><RotateCcw />再做一次</button> : <button className="primary" onClick={props.onCheck}>检查答案</button>}<button onClick={() => props.onAsk(`不要告诉我答案，请先问我应该去哪里找依据：${props.lesson.quiz.question}`)}><Sparkles />只要提示</button></div></article></div>}
    {mode === "student" && tab === "write" && <div className="cards"><article><h2><NotebookPen />表达应用</h2><div className="prompt"><Lightbulb />{props.lesson.practice}</div><div className="write-frame">观点：我认为……　依据：文中……让我看出……　联系：这使我想到……</div><textarea value={props.draft} onChange={(event) => props.setSaved((current) => ({ ...current, drafts: { ...current.drafts, [props.lesson.id]: event.target.value } }))} placeholder="先独立写，再对照标准修改……" /><div className="row between"><span>{props.draft.length}字</span><button className="primary" onClick={props.onEvaluate}><Sparkles />自查表达</button></div>{props.feedback.length > 0 && <div className="feedback"><b>修改清单</b>{props.feedback.map((item) => <p key={item}><Check />{item}</p>)}</div>}</article></div>}
    {mode === "student" && tab === "reflect" && <div className="cards"><article className="master"><Trophy /><h2>{props.saved.completed.includes(props.lesson.id) ? "本课已经点亮" : "说出方法，才算真正学会"}</h2><p>我标出了{highlights.length}处重点，提出了{questions.length}个问题，完成了{props.draft.length}字表达。</p><textarea rows={5} value={props.saved.reflections[props.lesson.id] ?? ""} onChange={(event) => props.setSaved((current) => ({ ...current, reflections: { ...current.reflections, [props.lesson.id]: event.target.value } }))} placeholder="我学会了……；我使用的方法是……；我还想弄明白……" /><button className="primary" disabled={props.saved.completed.includes(props.lesson.id)} onClick={props.onComplete}><Star />{props.saved.completed.includes(props.lesson.id) ? "已获得成长星" : "完成本课"}</button></article></div>}

    {mode === "teacher" && tab === "design" && <div className="cards"><article><h2><Target />一课一案：从示范走向独立</h2><div className="teacher-rule"><BrainCircuit />教师示范一次 → 同伴协作一次 → 学生独立完成一次。支架要在学生掌握方法后逐步撤掉。</div><div className="teacher-plan"><div><b>5分钟·目标导入</b><p>把教材要求转成学生听得懂的任务。</p></div><div><b>8分钟·初读梳理</b><p>先独立尝试，观察真实困难。</p></div><div><b>12分钟·方法示范</b><p>示范圈画、提问和寻找依据。</p></div><div><b>10分钟·自主探究</b><p>同伴交流后独立完成。</p></div><div><b>5分钟·表达复盘</b><p>用学习证据进行自评。</p></div></div><h2><CheckCircle2 />目标与策略</h2>{props.lesson.goals.map((goal, index) => <p className="goal" key={goal}><i>{index + 1}</i>{goal}</p>)}<p className="teacher-focus"><b>阅读策略：</b>{props.unit.readingSkill}</p><p className="teacher-focus"><b>表达任务：</b>{props.unit.expressionSkill}</p></article></div>}
    {mode === "teacher" && tab === "teacherq" && <div className="cards"><article><h2><Lightbulb />课堂问题链</h2><div className="offline-tasks">{(props.textbook?.tasks ?? [props.lesson.requirement]).map((task, index) => <div key={task}><i>{index + 1}</i><span><b>{task}</b><p><strong>一级·定位：</strong>题目要做什么？原文哪一段相关？</p><p><strong>二级·整理：</strong>两处关键词句有什么联系？</p><p><strong>三级·表达：</strong>怎样用“观点＋依据”完整说明？</p></span></div>)}</div></article></div>}
    {mode === "teacher" && tab === "assess" && <div className="cards"><article><h2><Trophy />过程性评价量规</h2><div className="offline-rubric"><div><b>维度</b><b>需要帮助</b><b>正在形成</b><b>能够独立</b><b>能够迁移</b></div>{[["朗读", "提醒后读", "大体正确", "正确流利", "能解释节奏"], ["理解", "凭印象", "找到段落", "用关键句作证", "比较概括写法"], ["提问", "等待问题", "事实性问题", "有价值问题", "分类并解决"], ["表达", "内容零散", "说清意思", "观点依据完整", "能修改迁移"], ["自我监控", "不知困难", "提醒后检查", "主动自评求助", "制定学习计划"]].map((row) => <div key={row[0]}>{row.map((cell, index) => index === 0 ? <b key={cell}>{cell}</b> : <span key={cell}>{cell}</span>)}</div>)}</div><p className="teacher-rule">建议留存三类证据：原文批注、问题篮记录、表达修改稿。它们比一次选择题分数更能反映自学能力。</p></article></div>}
  </div>;
}

createRoot(document.getElementById("root")!).render(<App />);
