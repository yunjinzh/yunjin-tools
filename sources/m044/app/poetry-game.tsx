"use client";

import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  EyeOff,
  GraduationCap,
  Image as ImageIcon,
  Leaf,
  Lightbulb,
  ListChecks,
  Map,
  Mic,
  MicOff,
  Play,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { imageFor, poems, reviewIntervals, type Poem } from "./poems";

declare global {
  interface Window {
    __POETRY_IMAGES__?: Record<string, string>;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ [index: number]: { transcript: string } }>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult?: (event: SpeechRecognitionEventLike) => void;
  onend?: () => void;
  onerror?: () => void;
  start: () => void;
  stop: () => void;
};

type Screen = "home" | "learn" | "play" | "teacher";
type Mode = "student" | "teacher";
type SemesterFilter = "全部" | "上册" | "下册";

type PoemProgress = {
  levels: [number, number, number, number];
  stars: number;
  attempts: number;
  independentCorrect: number;
  wrongLines: number[];
  reviewStep: number;
  nextReview: string;
  lastPracticed: string;
};

type LearningStore = {
  poems: Record<string, PoemProgress>;
  xp: number;
  assigned: string[];
};

const EMPTY_STORE: LearningStore = { poems: {}, xp: 0, assigned: [] };
const STORAGE_KEY = "poetry-mountain-v1";

const levelInfo = [
  {
    n: 1,
    icon: ImageIcon,
    title: "诗句寻画",
    short: "读懂关键词",
    detail: "看到诗句，选出最匹配的画面",
  },
  {
    n: 2,
    icon: BookOpen,
    title: "看画寻句",
    short: "画面转诗句",
    detail: "观察画面，找出对应的诗句",
  },
  {
    n: 3,
    icon: EyeOff,
    title: "画中背诵",
    short: "让文字退场",
    detail: "只看画面，按顺序背出四句",
  },
  {
    n: 4,
    icon: Trophy,
    title: "无提示背诵",
    short: "真正脱稿",
    detail: "没有图片和文字，完整背诵并自检",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

function localDate(daysFromNow = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function friendlyDate(value: string) {
  if (!value) return "尚未安排";
  if (value === localDate()) return "今天";
  const [, month, day] = value.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

function emptyProgress(): PoemProgress {
  return {
    levels: [0, 0, 0, 0],
    stars: 0,
    attempts: 0,
    independentCorrect: 0,
    wrongLines: [],
    reviewStep: 0,
    nextReview: "",
    lastPracticed: "",
  };
}

function imageSrc(path: string) {
  if (typeof window !== "undefined" && window.__POETRY_IMAGES__?.[path]) {
    return window.__POETRY_IMAGES__[path];
  }
  return path;
}

function shuffledOptions(question: number, seed: number) {
  const values = [0, 1, 2, 3];
  let state = (seed + 1) * 9301 + (question + 3) * 49297;
  for (let i = values.length - 1; i > 0; i -= 1) {
    state = (state * 233 + 17) % 9973;
    const j = state % (i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function Stars({ count, compact = false }: { count: number; compact?: boolean }) {
  return (
    <span className={`stars ${compact ? "stars-compact" : ""}`} aria-label={`${count}颗星`}>
      {[0, 1, 2].map((star) => (
        <Star key={star} fill={star < count ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-track" aria-label={`完成度 ${value}%`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function PoemPictures({ poem, small = false }: { poem: Poem; small?: boolean }) {
  return (
    <div className={`poem-pictures ${small ? "poem-pictures-small" : ""}`}>
      {poem.lines.map((line, index) => (
        <img
          key={line}
          src={imageSrc(imageFor(poem, index))}
          alt={`${poem.title}第${index + 1}幅句意画`}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}
    </div>
  );
}

export default function PoetryGame() {
  const [store, setStore] = useState<LearningStore>(EMPTY_STORE);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("student");
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedId, setSelectedId] = useState(poems[0].id);
  const [filter, setFilter] = useState<SemesterFilter>("全部");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [offline, setOffline] = useState(false);

  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [questionMissed, setQuestionMissed] = useState(false);
  const [score, setScore] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [levelDone, setLevelDone] = useState(false);
  const [timer, setTimer] = useState(0);
  const [reciting, setReciting] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selfCheck, setSelfCheck] = useState(false);
  const [checks, setChecks] = useState<number[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const selected = poems.find((poem) => poem.id === selectedId) ?? poems[0];
  const progress = store.poems[selected.id] ?? emptyProgress();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStore(JSON.parse(saved));
    } catch {
      setNotice("学习记录读取失败，本次仍可正常使用。 ");
    }
    setOffline(window.location.protocol === "file:");
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [mounted, store]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!reciting) return;
    const interval = window.setInterval(() => setTimer((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [reciting]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop?.();
    };
  }, []);

  const filteredPoems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return poems.filter((poem) => {
      const inBook = filter === "全部" || poem.semester === filter;
      const inSearch = !query || `${poem.title}${poem.author}${poem.dynasty}`.toLowerCase().includes(query);
      return inBook && inSearch;
    });
  }, [filter, search]);

  const mastered = poems.filter((poem) => (store.poems[poem.id]?.stars ?? 0) === 3).length;
  const duePoems = poems.filter((poem) => {
    const item = store.poems[poem.id];
    return item?.nextReview && item.nextReview <= localDate();
  });
  const overall = Math.round((mastered / poems.length) * 100);

  function goHome() {
    setScreen(mode === "teacher" ? "teacher" : "home");
    setReciting(false);
    setListening(false);
    recognitionRef.current?.stop?.();
  }

  function selectPoem(poem: Poem, openLearn = false) {
    setSelectedId(poem.id);
    if (openLearn) {
      setScreen("learn");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function setUserMode(next: Mode) {
    setMode(next);
    setScreen(next === "teacher" ? "teacher" : "home");
  }

  function speakPoem(poem: Poem) {
    if (!("speechSynthesis" in window)) {
      setNotice("当前浏览器不支持朗读，请跟着页面自行诵读。 ");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${poem.title}，${poem.dynasty}，${poem.author}。${poem.lines.join("。")}`,
    );
    utterance.lang = "zh-CN";
    utterance.rate = 0.78;
    utterance.pitch = 1.03;
    window.speechSynthesis.speak(utterance);
    setNotice("正在示范朗读：请注意停顿和节奏。 ");
  }

  function startLevel(nextLevel: number) {
    setLevel(nextLevel);
    setQuestion(0);
    setPicked(null);
    setQuestionMissed(false);
    setScore(0);
    setHintLevel(0);
    setLevelDone(false);
    setTimer(0);
    setReciting(false);
    setListening(false);
    setTranscript("");
    setSelfCheck(false);
    setChecks([]);
    setScreen("play");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function recordWrong(lineIndex: number) {
    setStore((current) => {
      const item = current.poems[selected.id] ?? emptyProgress();
      const wrongLines = Array.from(new Set([...item.wrongLines, lineIndex]));
      return {
        ...current,
        poems: { ...current.poems, [selected.id]: { ...item, wrongLines } },
      };
    });
  }

  function choose(option: number) {
    if (picked === question) return;
    setPicked(option);
    if (option !== question) {
      setQuestionMissed(true);
      recordWrong(question);
      return;
    }
    if (!questionMissed && hintLevel === 0) setScore((value) => value + 1);
  }

  function finishLevel(finalScore: number) {
    const levelIndex = level - 1;
    setStore((current) => {
      const item = current.poems[selected.id] ?? emptyProgress();
      const levels = [...item.levels] as [number, number, number, number];
      levels[levelIndex] = Math.max(levels[levelIndex], finalScore);
      const stars =
        (levels[0] >= 3 && levels[1] >= 3 ? 1 : 0) +
        (levels[2] >= 1 ? 1 : 0) +
        (levels[3] >= 4 ? 1 : 0);
      const finalSuccess = level === 4 && finalScore >= 4;
      const reviewStep = finalSuccess
        ? Math.min(item.reviewStep + 1, reviewIntervals.length - 1)
        : item.reviewStep;
      const nextReview = finalSuccess ? localDate(reviewIntervals[reviewStep]) : item.nextReview;
      return {
        ...current,
        xp: current.xp + Math.max(4, finalScore * 8),
        poems: {
          ...current.poems,
          [selected.id]: {
            ...item,
            levels,
            stars,
            attempts: item.attempts + 1,
            independentCorrect: item.independentCorrect + finalScore,
            reviewStep,
            nextReview,
            lastPracticed: localDate(),
          },
        },
      };
    });
    setLevelDone(true);
    setReciting(false);
    setListening(false);
    recognitionRef.current?.stop?.();
  }

  function nextQuestion() {
    if (question < 3) {
      setQuestion((value) => value + 1);
      setPicked(null);
      setQuestionMissed(false);
      setHintLevel(0);
      return;
    }
    const finalScore = score + (!questionMissed && hintLevel === 0 && picked === question ? 0 : 0);
    finishLevel(finalScore);
  }

  function confirmPictureRecitation() {
    const independent = hintLevel === 0;
    const nextScore = score + (independent ? 1 : 0);
    setScore(nextScore);
    if (question < 3) {
      setQuestion((value) => value + 1);
      setHintLevel(0);
      return;
    }
    finishLevel(Math.max(1, nextScore));
  }

  function beginRecitation() {
    setTimer(0);
    setReciting(true);
    setNotice("计时开始。慢一点，先在心里看见四幅画。 ");
  }

  function toggleRecognition() {
    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      return;
    }
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice("当前浏览器没有语音识别，仍可计时背诵并完成自检。 ");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      setTranscript((current) => `${current}${text}`);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setNotice("没有听清，不影响过关；请继续背诵后自检。 ");
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function openSelfCheck() {
    setReciting(false);
    recognitionRef.current?.stop?.();
    setListening(false);
    setSelfCheck(true);
  }

  function submitSelfCheck() {
    if (checks.length < 4) {
      setNotice("先找出最需要再练的一项；达到4项就能过关。 ");
      return;
    }
    setSelfCheck(false);
    finishLevel(checks.length);
  }

  function toggleAssignment(poemId: string) {
    setStore((current) => {
      const assigned = current.assigned.includes(poemId)
        ? current.assigned.filter((id) => id !== poemId)
        : [...current.assigned, poemId];
      return { ...current, assigned };
    });
  }

  function clearProgress() {
    const confirmed = window.confirm("确定清空这台设备上的全部学习记录吗？此操作无法撤销。 ");
    if (!confirmed) return;
    setStore(EMPTY_STORE);
    setNotice("本机学习记录已清空。 ");
  }

  const currentOptions = shuffledOptions(question, poems.findIndex((poem) => poem.id === selected.id));
  const seconds = `${pad(Math.floor(timer / 60))}:${pad(timer % 60)}`;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="返回诗词山河首页">
          <span className="brand-seal">诗</span>
          <span>
            <strong>诗词山河</strong>
            <small>四年级 · 四阶背诵</small>
          </span>
        </button>

        <nav className="top-actions" aria-label="平台工具">
          <div className="mode-switch" aria-label="切换使用模式">
            <button className={mode === "student" ? "active" : ""} onClick={() => setUserMode("student")}>
              <UserRound /> 学生
            </button>
            <button className={mode === "teacher" ? "active" : ""} onClick={() => setUserMode("teacher")}>
              <GraduationCap /> 教师
            </button>
          </div>
          {!offline ? (
            <a className="icon-link" href="/四年级古诗四阶背诵游戏.html" download title="下载离线版">
              <Download />
              <span>离线版</span>
            </a>
          ) : (
            <span className="offline-badge"><ShieldCheck /> 离线可用</span>
          )}
        </nav>
      </header>

      {screen === "home" && (
        <main>
          <section className="hero section-wrap">
            <div className="hero-copy">
              <span className="eyebrow"><Sparkles /> AI诗境插画 · 本地学习记录</span>
              <h1>把每一句诗，<br /><em>变成脑海里的一幅画。</em></h1>
              <p>
                先读懂、再联画、后脱稿。四关逐步撤去提示，让孩子掌握一套可以迁移到新诗的自主背诵方法。
              </p>
              <div className="hero-stats">
                <div><strong>{mastered}</strong><span>已熟练 / 18首</span></div>
                <div><strong>{duePoems.length}</strong><span>今日待复习</span></div>
                <div><strong>{store.xp}</strong><span>诗意能量</span></div>
              </div>
              <ProgressBar value={overall} />
            </div>

            <div className="featured-scroll">
              <div className="scroll-heading">
                <span>{selected.semester} · {selected.source}</span>
                <Stars count={progress.stars} />
              </div>
              <PoemPictures poem={selected} />
              <div className="featured-info">
                <div>
                  <small>今日推荐</small>
                  <h2>{selected.title}</h2>
                  <p>{selected.dynasty} · {selected.author}</p>
                </div>
                <button className="round-play" onClick={() => setScreen("learn")} aria-label={`开始学习${selected.title}`}>
                  <Play fill="currentColor" />
                </button>
              </div>
            </div>
          </section>

          {(store.assigned.length > 0 || duePoems.length > 0) && (
            <section className="task-strip section-wrap" aria-label="今日任务">
              <div className="task-title">
                <CalendarDays />
                <div><small>今日小任务</small><strong>短时、多次，比一次背很久更牢</strong></div>
              </div>
              <div className="task-poems">
                {[...new Set([...store.assigned, ...duePoems.map((poem) => poem.id)])].slice(0, 4).map((id) => {
                  const poem = poems.find((item) => item.id === id);
                  if (!poem) return null;
                  return <button key={id} onClick={() => selectPoem(poem, true)}>{poem.title}<ChevronRight /></button>;
                })}
              </div>
            </section>
          )}

          <section className="route-section section-wrap">
            <div className="section-heading">
              <div><span className="eyebrow"><Map /> 四阶学习路线</span><h2>提示一点点退场，能力一步步长出来</h2></div>
              <p>每关4题。前两关独立答对3题过关；后两关完成图像背诵和无提示自检。</p>
            </div>
            <div className="level-route">
              {levelInfo.map((item, index) => {
                const Icon = item.icon;
                const scoreValue = progress.levels[index];
                return (
                  <article key={item.n} className={`route-card route-${item.n}`}>
                    <div className="route-number">{item.n}</div>
                    <Icon />
                    <small>{item.short}</small>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                    <span className={scoreValue > 0 ? "route-status done" : "route-status"}>
                      {scoreValue > 0 ? <><Check /> 本诗已完成</> : "等待挑战"}
                    </span>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="library-section section-wrap" id="poem-library">
            <div className="section-heading library-heading">
              <div><span className="eyebrow"><BookOpen /> 教材诗库</span><h2>四年级上下册 · 18首古典诗词</h2></div>
              <div className="search-box"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索诗名或作者" aria-label="搜索诗名或作者" /></div>
            </div>

            <div className="filter-row" role="tablist" aria-label="册别筛选">
              {(["全部", "上册", "下册"] as SemesterFilter[]).map((item) => (
                <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                  {item}{item !== "全部" && <span>{poems.filter((poem) => poem.semester === item).length}</span>}
                </button>
              ))}
            </div>

            <div className="poem-grid">
              {filteredPoems.map((poem, index) => {
                const item = store.poems[poem.id] ?? emptyProgress();
                return (
                  <article key={poem.id} className={`poem-card ${selected.id === poem.id ? "selected" : ""}`}>
                    <button className="poem-card-main" onClick={() => selectPoem(poem)}>
                      <img src={imageSrc(imageFor(poem, 0))} alt={`${poem.title}诗境画`} loading="lazy" />
                      <span className="poem-index">{pad(index + 1)}</span>
                      <span className="poem-source">{poem.source}</span>
                    </button>
                    <div className="poem-card-body">
                      <div><small>{poem.dynasty} · {poem.author}</small><h3>{poem.title}</h3></div>
                      <Stars count={item.stars} compact />
                    </div>
                    <div className="poem-card-footer">
                      <span>{item.stars === 3 ? "已熟练" : item.attempts ? "继续练习" : "尚未学习"}</span>
                      <button onClick={() => selectPoem(poem, true)}>去学习 <ChevronRight /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="method-section section-wrap">
            <div className="method-card"><span>看</span><div><h3>看见诗中景物</h3><p>圈出人物、景物、颜色和动作。</p></div></div>
            <div className="method-card"><span>连</span><div><h3>连接四幅画面</h3><p>按时间、地点或动作串成小电影。</p></div></div>
            <div className="method-card"><span>退</span><div><h3>主动撤去提示</h3><p>从文字到图片，再到完全无提示。</p></div></div>
            <div className="method-card"><span>复</span><div><h3>按节奏再相遇</h3><p>0、1、3、7、14、30天回顾。</p></div></div>
          </section>
        </main>
      )}

      {screen === "learn" && (
        <main className="learning-page section-wrap">
          <button className="back-button" onClick={goHome}><ArrowLeft /> 返回诗库</button>
          <section className="learn-hero">
            <div className="learn-copy">
              <span className="eyebrow"><Leaf /> 学前导览 · 先理解再记忆</span>
              <div className="learn-title"><div><small>{selected.semester} · {selected.source}</small><h1>{selected.title}</h1><p>{selected.dynasty} · {selected.author}</p></div><Stars count={progress.stars} /></div>
              <div className="original-poem" aria-label={`${selected.title}原文`}>
                {selected.lines.map((line) => <p key={line}>{line}</p>)}
              </div>
              <button className="secondary-button" onClick={() => speakPoem(selected)}><Volume2 /> 示范朗读</button>
            </div>
            <PoemPictures poem={selected} />
          </section>

          <section className="learn-tools">
            <article className="understand-card">
              <span className="card-kicker"><Lightbulb /> 读懂这首诗</span>
              <h2>诗境一句话</h2>
              <p>{selected.idea}</p>
              <h3>自主背诵路线</h3>
              <p>{selected.method}</p>
            </article>
            <article className="notes-card">
              <span className="card-kicker"><CircleHelp /> 重点词语</span>
              {selected.notes.map((note) => (
                <div className="note-row" key={note.word}><strong>{note.word}</strong><p>{note.meaning}</p></div>
              ))}
              <p className="tip-line">小老师提示：先用自己的话说出画面，再看原文有没有更准确的词。</p>
            </article>
          </section>

          <section className="anchor-section">
            <div className="section-heading"><div><span className="eyebrow"><Target /> 四个记忆锚点</span><h2>把诗句装进连续的画面</h2></div><p>读一句、看一幅、闭眼想一次。</p></div>
            <div className="anchor-grid">
              {selected.lines.map((line, index) => (
                <article key={line}>
                  <img src={imageSrc(imageFor(selected, index))} alt={selected.anchors[index]} />
                  <span>{index + 1}</span>
                  <h3>{line}</h3>
                  <p>{selected.anchors[index]}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="start-panel">
            <div><small>准备好了吗？</small><h2>从第一关开始，让文字慢慢退场</h2><p>每道题都可以请“AI记忆教练”给一小步提示。</p></div>
            <button className="primary-button" onClick={() => startLevel(1)}>进入第一关 <ChevronRight /></button>
          </div>
        </main>
      )}

      {screen === "play" && (
        <main className="game-page section-wrap">
          <div className="game-topline">
            <button className="back-button" onClick={() => setScreen("learn")}><ArrowLeft /> 学前导览</button>
            <div className="game-poem-name"><small>正在挑战</small><strong>{selected.title}</strong><span>{selected.dynasty} · {selected.author}</span></div>
            <Stars count={progress.stars} />
          </div>

          <div className="gate-nav" aria-label="四关进度">
            {levelInfo.map((item, index) => {
              const Icon = item.icon;
              const isCurrent = item.n === level;
              const unlocked = item.n <= level || progress.levels[index] > 0;
              return (
                <button key={item.n} className={`${isCurrent ? "current" : ""} ${unlocked ? "" : "locked"}`} disabled={!unlocked} onClick={() => unlocked && startLevel(item.n)}>
                  <span>{progress.levels[index] > 0 ? <Check /> : <Icon />}</span>
                  <div><small>第{item.n}关</small><strong>{item.title}</strong></div>
                </button>
              );
            })}
          </div>

          {!levelDone && level <= 2 && (
            <section className="question-shell">
              <div className="question-meta">
                <span>第 {question + 1} / 4 题</span>
                <ProgressBar value={(question / 4) * 100} />
                <span>独立答对 {score}</span>
              </div>
              <div className="question-title">
                <small>第{level}关 · {levelInfo[level - 1].short}</small>
                <h1>{level === 1 ? "哪幅画最像这句诗？" : "这幅画说的是哪句诗？"}</h1>
                <p>先找景物和动作，再作选择。</p>
              </div>

              {level === 1 ? (
                <div className="line-prompt">“{selected.lines[question]}”</div>
              ) : (
                <div className="image-prompt"><img src={imageSrc(imageFor(selected, question))} alt="待判断的诗境画面" /></div>
              )}

              <div className={level === 1 ? "image-options" : "line-options"}>
                {currentOptions.map((option, optionIndex) => {
                  const isChosen = picked === option;
                  const isCorrect = option === question && picked === question;
                  const isWrong = isChosen && option !== question;
                  return (
                    <button
                      key={option}
                      className={`${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                      onClick={() => choose(option)}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                      {level === 1 ? (
                        <img src={imageSrc(imageFor(selected, option))} alt={`候选画面${String.fromCharCode(65 + optionIndex)}`} />
                      ) : (
                        <span className="line-option-text">{selected.lines[option]}</span>
                      )}
                      {isCorrect && <span className="choice-mark"><Check /></span>}
                      {isWrong && <span className="choice-mark"><X /></span>}
                    </button>
                  );
                })}
              </div>

              <div className="coach-row">
                <button className="hint-button" onClick={() => setHintLevel((value) => Math.min(3, value + 1))}>
                  <Lightbulb /> AI记忆教练 {hintLevel ? `· ${hintLevel}/3` : ""}
                </button>
                {hintLevel > 0 && (
                  <div className="hint-message" role="status">
                    <strong>只给你一小步：</strong>
                    {hintLevel === 1 && <span>{level === 1 ? "圈出诗句里的景物、颜色或动作。" : `画面核心是：${selected.anchors[question]}。`}</span>}
                    {hintLevel === 2 && <span>这一句从“{selected.lines[question].slice(0, 1)}”开始。</span>}
                    {hintLevel === 3 && <span>把这句轻声读一遍：{selected.lines[question]}</span>}
                  </div>
                )}
              </div>

              {picked !== null && (
                <div className={`feedback ${picked === question ? "success" : "retry"}`} role="status">
                  <div>{picked === question ? <Check /> : <RotateCcw />}</div>
                  <p>
                    <strong>{picked === question ? (questionMissed ? "找到了！" : "一眼看懂，真棒！") : "再把诗句和画面连一连。"}</strong>
                    {picked === question
                      ? `记忆锚点：${selected.anchors[question]}。`
                      : level === 1
                        ? `刚才那幅图更像“${selected.lines[picked]}”。`
                        : `注意题图中的“${selected.anchors[question]}”。`}
                  </p>
                  {picked === question && <button onClick={nextQuestion}>{question === 3 ? "查看成绩" : "下一题"}<ChevronRight /></button>}
                </div>
              )}
            </section>
          )}

          {!levelDone && level === 3 && (
            <section className="question-shell picture-recite">
              <div className="question-meta"><span>第 {question + 1} / 4 幕</span><ProgressBar value={(question / 4) * 100} /><span>图片正在淡出</span></div>
              <div className="question-title"><small>第三关 · 画中背诵</small><h1>看画面，背出这一句</h1><p>页面不会主动显示文字。先在脑海里说完整，再点“我已背出”。</p></div>
              <div className={`recite-image fade-${question}`}>
                <img src={imageSrc(imageFor(selected, question))} alt="无文字诗境提示画" />
                <span>画面 {question + 1}</span>
              </div>
              {hintLevel > 0 && (
                <div className="hint-message center" role="status">
                  <strong>主动求助：</strong>
                  {hintLevel === 1 && <span>{selected.anchors[question]}</span>}
                  {hintLevel === 2 && <span>第一个字：{selected.lines[question].slice(0, 1)}</span>}
                  {hintLevel === 3 && <span>{selected.lines[question]}</span>}
                </div>
              )}
              <div className="recite-actions">
                <button className="hint-button" onClick={() => setHintLevel((value) => Math.min(3, value + 1))}><Lightbulb /> 想不起来，给一点提示</button>
                <button className="primary-button" onClick={confirmPictureRecitation}>我已完整背出 <Check /></button>
              </div>
            </section>
          )}

          {!levelDone && level === 4 && (
            <section className="question-shell final-recite">
              <div className="final-blank">
                <span className="blank-seal">背</span>
                <small>第四关 · 无提示背诵</small>
                <h1>{reciting ? "现在，完整背出这首诗" : "把页面提示全部关掉"}</h1>
                <p>{reciting ? "从题目、作者开始，按顺序背完。页面不会出现原文和图片。" : "闭上眼睛，让四幅画依次出现；准备好再开始计时。"}</p>
                <div className="timer"><Clock3 /> {seconds}</div>
                {transcript && <div className="transcript-note"><Mic /> 已收到语音，内容暂时隐藏，核对时再看。</div>}
                {!reciting ? (
                  <button className="primary-button large" onClick={beginRecitation}><Play fill="currentColor" /> 开始背诵</button>
                ) : (
                  <div className="final-actions">
                    <button className={`secondary-button ${listening ? "recording" : ""}`} onClick={toggleRecognition}>
                      {listening ? <MicOff /> : <Mic />} {listening ? "停止收音" : "语音辅助记录"}
                    </button>
                    <button className="primary-button" onClick={openSelfCheck}>背完了，开始核对 <ListChecks /></button>
                  </div>
                )}
                <p className="privacy-note"><ShieldCheck /> 语音只由当前浏览器临时处理，平台不保存录音。</p>
              </div>
            </section>
          )}

          {levelDone && (
            <section className="result-card">
              <div className="result-medal"><Award /></div>
              <span className="eyebrow">第{level}关完成</span>
              <h1>{level <= 2 && score < 3 ? "再练一次，就能稳稳过关" : level === 4 ? "这首诗已经装进心里了" : "你让提示又退后了一步"}</h1>
              <p>
                {level <= 2
                  ? `本关独立答对 ${score} / 4 题。使用提示能学会，独立完成才会记牢。`
                  : level === 3
                    ? `4幅画都完成了背诵，其中 ${score} 幅没有使用文字提示。`
                    : `无提示背诵用时 ${seconds}，已安排在 ${friendlyDate((store.poems[selected.id] ?? progress).nextReview)} 再见一次。`}
              </p>
              <div className="result-actions">
                <button className="secondary-button" onClick={() => startLevel(level)}><RotateCcw /> 再练一次</button>
                {level < 4 && (level > 2 || score >= 3) ? (
                  <button className="primary-button" onClick={() => startLevel(level + 1)}>进入第{level + 1}关 <ChevronRight /></button>
                ) : level === 4 ? (
                  <button className="primary-button" onClick={goHome}>回到诗词山河 <Map /></button>
                ) : null}
              </div>
            </section>
          )}
        </main>
      )}

      {screen === "teacher" && (
        <main className="teacher-page section-wrap">
          <section className="teacher-hero">
            <div><span className="eyebrow"><GraduationCap /> 教师 / 家长模式</span><h1>看见学习过程，<br />不只看最后背没背出。</h1><p>所有数据只保存在这台设备。可据“独立答对、易错句、复习到期”安排下一次练习。</p></div>
            <div className="teacher-actions"><button className="secondary-button" onClick={() => window.print()}><Printer /> 打印学习简报</button><button className="text-danger" onClick={clearProgress}>清空本机记录</button></div>
          </section>

          <section className="dashboard-stats">
            <article><Trophy /><small>熟练背诵</small><strong>{mastered}<span> / 18首</span></strong><p>已通过完整无提示自检</p></article>
            <article><CalendarDays /><small>今日复习</small><strong>{duePoems.length}<span> 首</span></strong><p>依据0/1/3/7/14/30天节奏</p></article>
            <article><Target /><small>累计能量</small><strong>{store.xp}<span> 点</span></strong><p>奖励坚持，不做同伴排名</p></article>
            <article><ListChecks /><small>今日布置</small><strong>{store.assigned.length}<span> 首</span></strong><p>学生首页会优先显示</p></article>
          </section>

          <section className="teacher-table-section">
            <div className="section-heading"><div><span className="eyebrow"><BookOpen /> 全册进度</span><h2>逐诗查看与布置</h2></div><p>“独立答对”不包含使用提示后答对的题目。</p></div>
            <div className="teacher-table" role="table" aria-label="全册古诗学习进度">
              <div className="teacher-row teacher-row-head" role="row"><span>篇目</span><span>四关进度</span><span>易错句</span><span>下次复习</span><span>今日任务</span></div>
              {poems.map((poem) => {
                const item = store.poems[poem.id] ?? emptyProgress();
                return (
                  <div className="teacher-row" role="row" key={poem.id}>
                    <span className="teacher-poem"><img src={imageSrc(imageFor(poem, 0))} alt="" /><span><strong>{poem.title}</strong><small>{poem.semester} · {poem.author}</small></span></span>
                    <span className="mini-levels">{item.levels.map((value, index) => <i key={index} className={value > 0 ? "done" : ""}>{value > 0 ? <Check /> : index + 1}</i>)}<Stars count={item.stars} compact /></span>
                    <span>{item.wrongLines.length ? `${item.wrongLines.length}句` : "—"}</span>
                    <span>{friendlyDate(item.nextReview)}</span>
                    <span><button className={`assign-button ${store.assigned.includes(poem.id) ? "active" : ""}`} onClick={() => toggleAssignment(poem.id)}>{store.assigned.includes(poem.id) ? <><Check /> 已布置</> : "布置复习"}</button></span>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {selfCheck && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelfCheck(false)}>
          <section className="check-dialog" role="dialog" aria-modal="true" aria-labelledby="self-check-title">
            <button className="dialog-close" onClick={() => setSelfCheck(false)} aria-label="关闭核对"><X /></button>
            <span className="eyebrow"><ListChecks /> 诚实自检，比自动打分更重要</span>
            <h2 id="self-check-title">对照原文，给自己当小老师</h2>
            <div className="check-original">
              <strong>{selected.title}</strong><small>{selected.dynasty} · {selected.author}</small>
              {selected.lines.map((line) => <p key={line}>{line}</p>)}
            </div>
            {transcript && <details className="transcript"><summary>查看浏览器听到的内容（仅辅助）</summary><p>{transcript}</p></details>}
            <div className="check-list">
              {["题目、朝代和作者说对了", "四句内容完整，没有漏句", "句子顺序正确", "关键字准确，没有换成近义词", "声音清楚，停顿自然"].map((item, index) => (
                <label key={item}><input type="checkbox" checked={checks.includes(index)} onChange={() => setChecks((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])} /><span><Check /></span>{item}</label>
              ))}
            </div>
            <p className="check-rule">勾选4项即可过关；少于4项说明还需要回到画面再练一次。</p>
            <button className="primary-button full" onClick={submitSelfCheck}>提交自检 · 已完成 {checks.length}/5</button>
          </section>
        </div>
      )}

      {notice && <div className="toast" role="status"><Leaf /> {notice}</div>}

      <footer className="site-footer">
        <div className="section-wrap">
          <div className="footer-brand"><span className="brand-seal">诗</span><div><strong>诗词山河</strong><p>让理解、记忆与复习成为孩子自己的能力。</p></div></div>
          <p className="source-note">篇目依据现行人教版四年级上下册公开目录，收录18首古典诗词。AI生成插画仅作句意理解与记忆提示。</p>
        </div>
      </footer>
    </div>
  );
}
