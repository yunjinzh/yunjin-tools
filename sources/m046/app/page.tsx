"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Download,
  Flame,
  Headphones,
  Home,
  Lightbulb,
  Menu,
  MessageCircleMore,
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
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";

import { allModules, courseUnits, type CourseModule, type CourseUnit } from "./course-data";
import textbookJson from "./textbook-content.json";

type View = "home" | "unit" | "lesson";
type AudienceMode = "student" | "teacher";
type AiMessage = { role: "student" | "tutor"; content: string };
type TextbookBlock = { type: "heading" | "label" | "text" | "vocabulary"; text: string };
type TextbookPage = { pdfPage: number; textbookPage: number; blocks: TextbookBlock[] };
type TextbookModule = { pages: TextbookPage[]; tasks: string[]; pdfStart: number; pdfEnd: number };
type SavedState = {
  completed: string[];
  wrong: string[];
  drafts: Record<string, string>;
  notes: Record<string, string>;
  highlights: Record<string, string[]>;
  blockNotes: Record<string, string>;
  questions: Record<string, string[]>;
  reflections: Record<string, string>;
  streak: number;
  lastStudy: string;
  lastModuleId: string;
};

const textbookContent = textbookJson as Record<string, TextbookModule>;

const STORAGE_KEY = "grade4-chinese-learning-v1";
const emptySavedState: SavedState = {
  completed: [],
  wrong: [],
  drafts: {},
  notes: {},
  highlights: {},
  blockNotes: {},
  questions: {},
  reflections: {},
  streak: 0,
  lastStudy: "",
  lastModuleId: "",
};

function normalizeText(value: string) {
  return value.replace(/[\s，。！？、；：“”‘’（）《》,.!?;:'"()\-]/g, "").toLowerCase();
}

function similarityScore(spoken: string, target: string) {
  const a = normalizeText(spoken);
  const b = normalizeText(target);
  if (!a || !b) return 0;
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return Math.max(0, Math.round((1 - dp[a.length][b.length] / Math.max(a.length, b.length)) * 100));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function moduleIcon(kind: CourseModule["kind"]) {
  if (kind === "习作") return NotebookPen;
  if (kind === "口语交际") return MessageCircleMore;
  if (kind === "古诗") return BookMarked;
  if (kind === "语文园地") return Sparkles;
  if (kind === "阅读拓展") return BookOpen;
  if (kind === "初试身手") return WandSparkles;
  return BrainCircuit;
}

function localTutorReply(question: string, lesson: CourseModule, unit: CourseUnit) {
  const compact = question.trim();
  if (!compact) return "把你卡住的词句、问题或作文片段发给我，我会一步一步陪你想。";
  if (/意思|理解|为什么/.test(compact)) {
    return `先回到《${lesson.title}》的学习目标：${lesson.goals[0]}。你可以用“文中发生了什么—这说明什么—我从哪里看出来”三步回答。提示：${lesson.quiz.explanation}`;
  }
  if (/作文|怎么写|开头|结尾|修改/.test(compact) || lesson.kind === "习作") {
    return `先别急着写长文。请按“${lesson.practice}”搭好骨架，再补一个动作、一句人物语言和一处真实感受。写完朗读一遍，删掉重复句，检查是否紧扣“${unit.expressionSkill}”。`;
  }
  if (/朗读|背诵|记不住/.test(compact)) {
    return `把内容分成2—3个意群：先听一遍，再跟读两遍，最后遮住文字复述关键词。今天先记住这些词：${lesson.keywords.slice(0, 5).join("、")}。`;
  }
  if (/生字|词语|不会读/.test(compact)) {
    return `点击“认识”页里的词语卡可以听标准读音。先听、再读、最后用其中两个词说一句完整的话：${lesson.keywords.slice(0, 4).join("、")}。`;
  }
  if (/答案|选哪个/.test(compact)) {
    return `我先不给你直接报答案。回看题目中的关键词，再对照本课要求“${lesson.requirement}”。排除与课文核心无关的选项后，你会更容易找到依据。`;
  }
  return `你问得很好。试着先用一句话说出自己的猜想，再找一个依据。围绕本课“${lesson.goals.join("；")}”思考。可用句式：“我认为……因为……所以……”。`;
}

export default function HomePage() {
  const [view, setView] = useState<View>("home");
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("student");
  const [activeUnitId, setActiveUnitId] = useState(1);
  const [activeModuleId, setActiveModuleId] = useState("u1-1");
  const [saved, setSaved] = useState<SavedState>(emptySavedState);
  const [hydrated, setHydrated] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [draftFeedback, setDraftFeedback] = useState<string[]>([]);
  const [wrongOpen, setWrongOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [remoteEnabled, setRemoteEnabled] = useState(false);
  const [remoteEndpoint, setRemoteEndpoint] = useState("");
  const [remoteModel, setRemoteModel] = useState("gpt-5-mini");
  const [remoteToken, setRemoteToken] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    { role: "tutor", content: "你好！我是“小语”。你可以问我词语、课文理解、朗读方法或习作思路。" },
  ]);
  const recognitionRef = useRef<any>(null);

  const activeUnit = courseUnits.find((unit) => unit.id === activeUnitId) ?? courseUnits[0];
  const activeModule = allModules.find((item) => item.id === activeModuleId) ?? allModules[0];
  const completedCount = saved.completed.length;
  const progressValue = Math.round((completedCount / allModules.length) * 100);
  const currentDraft = saved.drafts[activeModule.id] ?? "";
  const wrongModules = allModules.filter((item) => saved.wrong.includes(item.id));
  const continueModule = useMemo(
    () => allModules.find((item) => !saved.completed.includes(item.id)) ?? allModules[0],
    [saved.completed],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedState>;
        setSaved({
          ...emptySavedState,
          ...parsed,
          drafts: parsed.drafts ?? {},
          notes: parsed.notes ?? {},
          highlights: parsed.highlights ?? {},
          blockNotes: parsed.blockNotes ?? {},
          questions: parsed.questions ?? {},
          reflections: parsed.reflections ?? {},
        });
        if (parsed.lastModuleId) {
          setActiveModuleId(parsed.lastModuleId);
          const found = allModules.find((item) => item.id === parsed.lastModuleId);
          if (found) setActiveUnitId(found.unitId);
        }
      }
      const endpoint = localStorage.getItem("grade4-ai-proxy") ?? "";
      const model = localStorage.getItem("grade4-ai-model") ?? "gpt-5-mini";
      if (endpoint) {
        setRemoteEndpoint(endpoint);
        setRemoteEnabled(true);
      }
      setRemoteModel(model);
    } catch {
      setSaved(emptySavedState);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved, hydrated]);

  useEffect(() => {
    setSelectedAnswer(null);
    setAnswerChecked(false);
    setTranscript("");
    setSpeechScore(null);
    setDraftFeedback([]);
  }, [activeModuleId]);

  function goHome() {
    setView("home");
    setMobileMenuOpen(false);
  }

  function openUnit(unitId: number) {
    setActiveUnitId(unitId);
    setView("unit");
    setMobileMenuOpen(false);
  }

  function openLesson(id: string) {
    const found = allModules.find((item) => item.id === id);
    if (!found) return;
    setActiveUnitId(found.unitId);
    setActiveModuleId(id);
    setSaved((current) => ({ ...current, lastModuleId: id }));
    setView("lesson");
    setWrongOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function speak(text: string, rate = 0.82) {
    if (!("speechSynthesis" in window)) {
      toast.error("当前浏览器暂不支持语音朗读");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => /zh-CN|Chinese/i.test(`${voice.lang} ${voice.name}`)) ?? null;
    window.speechSynthesis.speak(utterance);
  }

  function startRecognition() {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      toast.error("当前浏览器不支持语音识别，建议使用最新版 Chrome 或 Edge");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
      setSpeechScore(null);
    };
    recognition.onresult = (event: any) => {
      const result = event.results?.[0]?.[0]?.transcript ?? "";
      setTranscript(result);
      setSpeechScore(similarityScore(result, activeModule.speak));
    };
    recognition.onerror = () => toast.error("没有听清，请靠近麦克风再试一次");
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopRecognition() {
    recognitionRef.current?.stop?.();
    setListening(false);
  }

  function checkAnswer() {
    if (selectedAnswer === null) {
      toast("先选择一个答案吧");
      return;
    }
    setAnswerChecked(true);
    const correct = selectedAnswer === activeModule.quiz.answer;
    setSaved((current) => ({
      ...current,
      wrong: correct
        ? current.wrong.filter((id) => id !== activeModule.id)
        : Array.from(new Set([...current.wrong, activeModule.id])),
    }));
    correct ? toast.success("答对了！你找到了关键依据") : toast.error("先看解析，再回到学习目标想一想");
  }

  function updateDraft(value: string) {
    setSaved((current) => ({ ...current, drafts: { ...current.drafts, [activeModule.id]: value } }));
  }

  function toggleHighlight(blockKey: string) {
    setSaved((current) => {
      const lessonHighlights = current.highlights[activeModule.id] ?? [];
      const next = lessonHighlights.includes(blockKey)
        ? lessonHighlights.filter((key) => key !== blockKey)
        : [...lessonHighlights, blockKey];
      return { ...current, highlights: { ...current.highlights, [activeModule.id]: next } };
    });
  }

  function updateBlockNote(blockKey: string, value: string) {
    setSaved((current) => ({ ...current, blockNotes: { ...current.blockNotes, [blockKey]: value } }));
  }

  function addQuestion(question: string) {
    const clean = question.trim();
    if (!clean) return;
    setSaved((current) => ({
      ...current,
      questions: {
        ...current.questions,
        [activeModule.id]: [...(current.questions[activeModule.id] ?? []), clean],
      },
    }));
  }

  function removeQuestion(index: number) {
    setSaved((current) => ({
      ...current,
      questions: {
        ...current.questions,
        [activeModule.id]: (current.questions[activeModule.id] ?? []).filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  }

  function updateReflection(value: string) {
    setSaved((current) => ({
      ...current,
      reflections: { ...current.reflections, [activeModule.id]: value },
    }));
  }

  function evaluateDraft() {
    const draft = currentDraft.trim();
    if (!draft) {
      toast("先写下你的想法，再请学习助手检查");
      return;
    }
    const feedback: string[] = [];
    const usefulTags = activeModule.coachTags.filter((tag) => draft.includes(tag));
    feedback.push(draft.length >= 60 ? "篇幅已经能表达一个较完整的意思。" : "可以再补充一个具体动作、画面或理由，让内容更完整。" );
    feedback.push(usefulTags.length >= 2 ? `你用到了“${usefulTags.slice(0, 3).join("、")}”，表达与本课任务联系紧密。` : `试着自然用上“${activeModule.coachTags.slice(0, 3).join("、")}”中的一两个提示词。`);
    feedback.push(/[。！？]/.test(draft) ? "句子已经有停顿，朗读起来比较清楚。" : "别忘了在完整意思后加上句号、问号或感叹号。" );
    feedback.push(/因为|所以|先|接着|然后|最后|但是|虽然|如果/.test(draft) ? "你使用了连接词，内容顺序更清晰。" : "可以用“先、接着、最后”或“因为、所以”把句子连接起来。" );
    setDraftFeedback(feedback);
  }

  function completeLesson() {
    const today = todayKey();
    setSaved((current) => {
      let streak = current.streak;
      if (current.lastStudy !== today) {
        streak = current.lastStudy === yesterdayKey() ? current.streak + 1 : 1;
      }
      return {
        ...current,
        completed: Array.from(new Set([...current.completed, activeModule.id])),
        lastStudy: today,
        streak,
      };
    });
    toast.success("本课学习完成，获得1颗成长星！");
  }

  function saveAiSettings() {
    if (remoteEnabled && !remoteEndpoint.trim()) {
      toast.error("请填写安全代理地址，或关闭真实AI模式");
      return;
    }
    localStorage.setItem("grade4-ai-proxy", remoteEnabled ? remoteEndpoint.trim() : "");
    localStorage.setItem("grade4-ai-model", remoteModel.trim() || "gpt-5-mini");
    setSettingsOpen(false);
    toast.success(remoteEnabled ? "真实AI模式已配置" : "已切换到本地学习助手");
  }

  async function askTutor(prefill?: string) {
    const question = (prefill ?? aiInput).trim();
    if (!question || aiLoading) return;
    setAiInput("");
    setMessages((current) => [...current, { role: "student", content: question }]);
    setAiLoading(true);
    try {
      if (remoteEnabled && remoteEndpoint.trim()) {
        const response = await fetch(remoteEndpoint.trim(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(remoteToken ? { Authorization: `Bearer ${remoteToken}` } : {}),
          },
          body: JSON.stringify({
            model: remoteModel || "gpt-5-mini",
            messages: [
              {
                role: "system",
                content: `你是耐心的小学四年级语文学习伙伴。当前单元：${activeUnit.theme}。当前课程：${activeModule.title}。目标：${activeModule.goals.join("；")}。不要代写完整作业，优先用提问、提示和分步方法帮助学生。语言简短、友好、准确。`,
              },
              { role: "user", content: question },
            ],
          }),
        });
        if (!response.ok) throw new Error("remote-ai-failed");
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content ?? data?.output_text ?? data?.answer ?? data?.content;
        if (!content) throw new Error("empty-ai-response");
        setMessages((current) => [...current, { role: "tutor", content: String(content) }]);
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 320));
        setMessages((current) => [...current, { role: "tutor", content: localTutorReply(question, activeModule, activeUnit) }]);
      }
    } catch {
      setMessages((current) => [...current, { role: "tutor", content: `真实AI暂时没有连接成功，我先用本地方法帮助你：${localTutorReply(question, activeModule, activeUnit)}` }]);
      toast.error("真实AI连接失败，已自动切换为本地帮助");
    } finally {
      setAiLoading(false);
    }
  }

  const sidebar = (
    <div className="sidebar-inner">
      <button className="brand" onClick={goHome} aria-label="返回学习首页">
        <span className="brand-mark"><BookOpen size={23} /></span>
        <span><strong>小语成长营</strong><small>四年级上册</small></span>
      </button>
      <nav className="unit-nav" aria-label="教材单元导航">
        <button className={`nav-home ${view === "home" ? "active" : ""}`} onClick={goHome}><Home size={18} /> 学习首页</button>
        <p className="nav-label">全册 8 个单元</p>
        {courseUnits.map((unit) => {
          const unitDone = unit.modules.filter((item) => saved.completed.includes(item.id)).length;
          return (
            <button className={`unit-nav-item ${activeUnitId === unit.id && view !== "home" ? "active" : ""}`} key={unit.id} onClick={() => openUnit(unit.id)}>
              <span className="unit-number" style={{ background: `${unit.color}18`, color: unit.color }}>{unit.id}</span>
              <span className="unit-nav-copy"><strong>{unit.subtitle}</strong><small>{unitDone}/{unit.modules.length} 已完成</small></span>
              <ChevronRight size={16} />
            </button>
          );
        })}
      </nav>
      <div className="sidebar-quote"><Lightbulb size={18} /><p>每天20分钟：先听读，再思考，最后用自己的话表达。</p></div>
    </div>
  );

  return (
    <div className="learning-shell">
      <Toaster position="top-center" richColors />
      <aside className="desktop-sidebar">{sidebar}</aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="mobile-menu-sheet">{sidebar}</SheetContent>
      </Sheet>

      <main className="main-stage">
        <header className="topbar">
          <div className="topbar-left">
            <Button className="mobile-menu-button" variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} aria-label="打开单元菜单"><Menu /></Button>
            <div><p>{view === "home" ? "欢迎回来，小小读书人" : view === "unit" ? `${activeUnit.title} · ${activeUnit.subtitle}` : activeModule.title}</p><span>今天也要让思考留下痕迹</span></div>
          </div>
          <div className="top-progress"><span><Star size={15} fill="currentColor" /> {completedCount} 颗成长星</span><Progress value={progressValue} aria-label={`全册进度${progressValue}%`} /><b>{progressValue}%</b></div>
          <div className="top-actions">
            <div className="mode-switch" role="group" aria-label="切换学习模式">
              <button aria-label="切换到学生自学模式" title="学生自学" className={audienceMode === "student" ? "active" : ""} onClick={() => setAudienceMode("student")}><BookOpen /> 学生自学</button>
              <button aria-label="切换到教师导学模式" title="教师导学" className={audienceMode === "teacher" ? "active" : ""} onClick={() => setAudienceMode("teacher")}><Target /> 教师导学</button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setWrongOpen(true)}><BookMarked /> <span className="desktop-only">错题本</span>{saved.wrong.length > 0 && <em>{saved.wrong.length}</em>}</Button>
            <Button variant="outline" size="sm" asChild><a href="/四年级语文AI自主学习平台.html" download><Download /> <span className="desktop-only">下载HTML</span></a></Button>
            <Button className="mobile-ai-button" size="sm" onClick={() => setAiOpen(true)}><Sparkles /> 问小语</Button>
          </div>
        </header>

        <div className="content-grid">
          <section className="content-column">
            {view === "home" && <Dashboard saved={saved} progressValue={progressValue} continueModule={continueModule} onContinue={() => openLesson(continueModule.id)} onOpenUnit={openUnit} />}
            {view === "unit" && <UnitView unit={activeUnit} saved={saved} onOpenLesson={openLesson} onHome={goHome} />}
            {view === "lesson" && (
              <RichLessonView key={activeModule.id} mode={audienceMode} unit={activeUnit} lesson={activeModule} textbook={textbookContent[activeModule.id]} completed={saved.completed.includes(activeModule.id)} selectedAnswer={selectedAnswer} answerChecked={answerChecked} transcript={transcript} speechScore={speechScore} listening={listening} draft={currentDraft} draftFeedback={draftFeedback} highlights={saved.highlights[activeModule.id] ?? []} blockNotes={saved.blockNotes} questions={saved.questions[activeModule.id] ?? []} reflection={saved.reflections[activeModule.id] ?? ""} onBack={() => setView("unit")} onSelectAnswer={setSelectedAnswer} onCheckAnswer={checkAnswer} onResetAnswer={() => { setSelectedAnswer(null); setAnswerChecked(false); }} onSpeak={speak} onStartRecognition={startRecognition} onStopRecognition={stopRecognition} onDraftChange={updateDraft} onEvaluateDraft={evaluateDraft} onAskTutor={(text) => { setAiOpen(true); askTutor(text); }} onToggleHighlight={toggleHighlight} onBlockNoteChange={updateBlockNote} onAddQuestion={addQuestion} onRemoveQuestion={removeQuestion} onReflectionChange={updateReflection} onComplete={completeLesson} />
            )}
          </section>
          <aside className="ai-column"><TutorPanel activeModule={activeModule} messages={messages} input={aiInput} loading={aiLoading} remoteEnabled={remoteEnabled} onInput={setAiInput} onAsk={() => askTutor()} onQuickAsk={askTutor} onSettings={() => setSettingsOpen(true)} /></aside>
        </div>
      </main>

      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent side="right" className="ai-sheet"><SheetHeader className="sr-only"><SheetTitle>AI学习伙伴</SheetTitle><SheetDescription>询问词语、理解和习作方法</SheetDescription></SheetHeader><TutorPanel activeModule={activeModule} messages={messages} input={aiInput} loading={aiLoading} remoteEnabled={remoteEnabled} onInput={setAiInput} onAsk={() => askTutor()} onQuickAsk={askTutor} onSettings={() => setSettingsOpen(true)} /></SheetContent>
      </Sheet>

      <Sheet open={wrongOpen} onOpenChange={setWrongOpen}>
        <SheetContent side="right" className="wrong-sheet"><SheetHeader><SheetTitle>我的错题本</SheetTitle><SheetDescription>错题不会被扣分，它们会告诉你下一步该学什么。</SheetDescription></SheetHeader><div className="wrong-list">{wrongModules.length === 0 ? <div className="empty-state"><Trophy /><strong>暂时没有错题</strong><p>完成互动练习后，答错的题会自动来到这里。</p></div> : wrongModules.map((item) => <button key={item.id} onClick={() => openLesson(item.id)}><span><Badge variant="secondary">{item.kind}</Badge><strong>{item.title}</strong></span><p>{item.quiz.question}</p><small>{item.quiz.explanation}</small><ChevronRight /></button>)}</div></SheetContent>
      </Sheet>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="ai-settings-dialog"><DialogHeader><DialogTitle>AI学习伙伴设置</DialogTitle><DialogDescription>默认的本地助手无需密钥。接入真实AI时，请使用您自己的安全代理地址，不要把云端服务商密钥直接写进公开网页。</DialogDescription></DialogHeader><div className="settings-grid"><label className="switch-row"><span><strong>启用真实AI</strong><small>连接失败会自动回到本地助手</small></span><Switch checked={remoteEnabled} onCheckedChange={setRemoteEnabled} /></label><label><span>OpenAI兼容代理地址</span><Input placeholder="https://your-domain.example/v1/chat/completions" value={remoteEndpoint} onChange={(event) => setRemoteEndpoint(event.target.value)} disabled={!remoteEnabled} /></label><label><span>模型名称</span><Input value={remoteModel} onChange={(event) => setRemoteModel(event.target.value)} disabled={!remoteEnabled} /></label><label><span>临时访问令牌（可选，不会保存）</span><Input type="password" value={remoteToken} onChange={(event) => setRemoteToken(event.target.value)} disabled={!remoteEnabled} /></label></div><DialogFooter><Button variant="outline" onClick={() => setSettingsOpen(false)}>取消</Button><Button onClick={saveAiSettings}>保存设置</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}

function Dashboard({ saved, progressValue, continueModule, onContinue, onOpenUnit }: { saved: SavedState; progressValue: number; continueModule: (typeof allModules)[number]; onContinue: () => void; onOpenUnit: (id: number) => void }) {
  return (
    <div className="dashboard-page">
      <section className="today-card">
        <div className="today-copy"><Badge><Sparkles /> 今日学习</Badge><p className="eyebrow">每天进步一点点</p><h1>{continueModule.title}</h1><p>{continueModule.goals[0]}。预计用时 {continueModule.duration} 分钟。</p><div className="today-buttons"><Button size="lg" onClick={onContinue}>开始今日任务 <ArrowRight /></Button><span><Flame /> 已连续学习 <strong>{saved.streak}</strong> 天</span></div></div>
        <div className="progress-orbit" aria-label={`全册学习进度${progressValue}%`}><svg viewBox="0 0 140 140" role="img"><circle cx="70" cy="70" r="57" className="orbit-base" /><circle cx="70" cy="70" r="57" className="orbit-value" style={{ strokeDashoffset: 358 - (358 * progressValue) / 100 }} /></svg><div><b>{progressValue}%</b><span>全册进度</span></div></div>
        <span className="paper-dot dot-one" /><span className="paper-dot dot-two" /><span className="paper-line" />
      </section>
      <section className="metric-row" aria-label="学习数据"><article><span className="metric-icon coral"><CheckCircle2 /></span><div><b>{saved.completed.length}</b><p>已完成任务</p></div></article><article><span className="metric-icon amber"><Star /></span><div><b>{saved.completed.length}</b><p>成长星</p></div></article><article><span className="metric-icon green"><Target /></span><div><b>{saved.wrong.length}</b><p>待巩固问题</p></div></article><article><span className="metric-icon blue"><BookOpen /></span><div><b>8</b><p>主题单元</p></div></article></section>
      <section className="unit-map-section"><div className="section-heading"><div><p className="eyebrow">学习地图</p><h2>全册八个主题单元</h2></div><span>按照教材顺序学习，也可以选择正在课堂上学习的单元</span></div><div className="unit-grid">{courseUnits.map((unit) => { const done = unit.modules.filter((item) => saved.completed.includes(item.id)).length; const percent = Math.round((done / unit.modules.length) * 100); return <button className="unit-card" key={unit.id} onClick={() => onOpenUnit(unit.id)} style={{ "--unit-color": unit.color } as React.CSSProperties}><div className="unit-card-top"><span>0{unit.id}</span><Badge variant="outline">{done}/{unit.modules.length}</Badge></div><h3>{unit.subtitle}</h3><p>{unit.theme}</p><div className="unit-card-progress"><i style={{ width: `${percent}%` }} /></div><footer><small>{unit.modules.length} 个学习任务</small><span>进入单元 <ArrowRight /></span></footer></button>; })}</div></section>
    </div>
  );
}

function UnitView({ unit, saved, onOpenLesson, onHome }: { unit: CourseUnit; saved: SavedState; onOpenLesson: (id: string) => void; onHome: () => void }) {
  const done = unit.modules.filter((item) => saved.completed.includes(item.id)).length;
  const percent = Math.round((done / unit.modules.length) * 100);
  return (
    <div className="unit-page" style={{ "--unit-color": unit.color } as React.CSSProperties}>
      <button className="back-link" onClick={onHome}><ArrowLeft /> 返回学习地图</button>
      <section className="unit-banner"><div><p className="eyebrow">{unit.title}</p><h1>{unit.subtitle}</h1><p>{unit.theme}</p></div><div className="unit-banner-progress"><strong>{done}/{unit.modules.length}</strong><span>已完成</span><Progress value={percent} /></div></section>
      <section className="skill-pair"><article><span><BrainCircuit /></span><div><small>阅读策略</small><p>{unit.readingSkill}</p></div></article><article><span><NotebookPen /></span><div><small>表达任务</small><p>{unit.expressionSkill}</p></div></article></section>
      <div className="section-heading compact"><div><p className="eyebrow">任务清单</p><h2>从认识到表达，一步一步学</h2></div></div>
      <section className="lesson-list">{unit.modules.map((lesson, index) => { const Icon = moduleIcon(lesson.kind); const completed = saved.completed.includes(lesson.id); return <button key={lesson.id} onClick={() => onOpenLesson(lesson.id)} className="lesson-row"><span className={`lesson-index ${completed ? "done" : ""}`}>{completed ? <Check /> : index + 1}</span><span className="lesson-kind-icon"><Icon /></span><span className="lesson-row-copy"><span><Badge variant="secondary">{lesson.kind}</Badge><small>约 {lesson.duration} 分钟</small></span><strong>{lesson.title}</strong><p>{lesson.goals[0]}</p></span><span className="lesson-status">{completed ? "已完成" : "开始学习"}<ChevronRight /></span></button>; })}</section>
    </div>
  );
}

type RichLessonProps = {
  mode: AudienceMode;
  unit: CourseUnit;
  lesson: CourseModule;
  textbook?: TextbookModule;
  completed: boolean;
  selectedAnswer: number | null;
  answerChecked: boolean;
  transcript: string;
  speechScore: number | null;
  listening: boolean;
  draft: string;
  draftFeedback: string[];
  highlights: string[];
  blockNotes: Record<string, string>;
  questions: string[];
  reflection: string;
  onBack: () => void;
  onSelectAnswer: (index: number) => void;
  onCheckAnswer: () => void;
  onResetAnswer: () => void;
  onSpeak: (text: string, rate?: number) => void;
  onStartRecognition: () => void;
  onStopRecognition: () => void;
  onDraftChange: (value: string) => void;
  onEvaluateDraft: () => void;
  onAskTutor: (text: string) => void;
  onToggleHighlight: (key: string) => void;
  onBlockNoteChange: (key: string, value: string) => void;
  onAddQuestion: (value: string) => void;
  onRemoveQuestion: (index: number) => void;
  onReflectionChange: (value: string) => void;
  onComplete: () => void;
};

function RichLessonView(props: RichLessonProps) {
  const { mode, unit, lesson, completed, onBack, onSpeak } = props;
  return (
    <div className="lesson-page rich-lesson-page" style={{ "--unit-color": unit.color } as React.CSSProperties}>
      <button className="back-link" onClick={onBack}><ArrowLeft /> 返回{unit.title}</button>
      <section className="lesson-heading rich-heading">
        <div>
          <span><Badge>{lesson.kind}</Badge><small>约 {lesson.duration} 分钟</small><small className="page-range"><BookOpen /> 教材第 {props.textbook?.pages[0]?.textbookPage ?? "—"}—{props.textbook?.pages.at(-1)?.textbookPage ?? "—"} 页</small>{completed && <small className="completed-label"><CheckCircle2 /> 已完成</small>}</span>
          <h1>{lesson.title}</h1>
          <p>{mode === "student" ? `自学任务：${lesson.requirement}` : `导学重点：${lesson.requirement}`}</p>
        </div>
        <Button variant="outline" onClick={() => onSpeak(lesson.speak)}><Headphones /> 听本课导读</Button>
      </section>
      <div className="mode-notice"><Sparkles /><span><strong>{mode === "student" ? "学生自学模式" : "教师导学模式"}</strong>{mode === "student" ? "先自己读、自己问、自己找依据，遇到困难再看提示。" : "提供可直接用于备课的流程、提问梯度和评价证据。"}</span></div>
      {mode === "student" ? <StudentLessonView {...props} /> : <TeacherLessonView {...props} />}
    </div>
  );
}

function StudentLessonView(props: RichLessonProps) {
  const [tab, setTab] = useState("map");
  const [questionDraft, setQuestionDraft] = useState("");
  const quizCorrect = props.answerChecked && props.selectedAnswer === props.lesson.quiz.answer;

  function submitQuestion() {
    if (!questionDraft.trim()) return;
    props.onAddQuestion(questionDraft);
    setQuestionDraft("");
    toast.success("问题已放进我的问题篮");
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="lesson-tabs rich-tabs">
      <TabsList>
        <TabsTrigger value="map">1 自学导图</TabsTrigger>
        <TabsTrigger value="text">2 原文伴读</TabsTrigger>
        <TabsTrigger value="inquiry">3 思考探究</TabsTrigger>
        <TabsTrigger value="express">4 表达应用</TabsTrigger>
        <TabsTrigger value="reflect">5 自评复盘</TabsTrigger>
      </TabsList>

      <TabsContent value="map">
        <section className="learning-card study-map-card">
          <div className="card-title"><span><Target /></span><div><small>自主学习路线</small><h2>六步学会，而不只是做完</h2></div></div>
          <div className="study-map">
            {[
              ["定目标", "先读目标，用自己的话说清今天要学什么。", "目标", "map"],
              ["读通文", "看原文、听范读，圈出生字词和不懂的句子。", "去读原文", "text"],
              ["会提问", "从内容、写法、联系生活三个角度提出问题。", "去提问题", "inquiry"],
              ["找依据", "回到原文定位关键词句，不凭印象猜答案。", "看课后题", "inquiry"],
              ["会表达", "用“观点＋依据＋感受”说或写完整。", "去表达", "express"],
              ["能复盘", "说出学会了什么、用了什么方法、还困惑什么。", "去复盘", "reflect"],
            ].map(([title, copy, action, target], index) => <article className="study-step" key={title}><i>{index + 1}</i><div><strong>{title}</strong><p>{copy}</p><button onClick={() => setTab(target)}>{action}<ChevronRight /></button></div></article>)}
          </div>
        </section>
        <section className="learning-card goals-card"><div className="card-title"><span><CheckCircle2 /></span><div><small>先定目标</small><h2>学完后，我能够……</h2></div></div><div className="goal-list">{props.lesson.goals.map((goal, index) => <p key={goal}><i>{index + 1}</i>{goal}</p>)}</div><div className="method-banner"><Lightbulb /><p><strong>自学提醒：</strong>不要急着看答案。先尝试，标出依据；仍不明白时，再向同伴、老师或AI求助。</p></div></section>
        <section className="learning-card word-card"><div className="card-title"><span><Volume2 /></span><div><small>读准词语</small><h2>点击词语，听一遍、跟读两遍</h2></div></div><div className="word-cloud">{props.lesson.keywords.map((word) => <button key={word} onClick={() => props.onSpeak(word, 0.72)}><Volume2 />{word}</button>)}</div></section>
      </TabsContent>

      <TabsContent value="text">
        <TextbookReader {...props} teacher={false} />
        <section className="learning-card read-card"><div className="card-title"><span><Mic /></span><div><small>朗读检测</small><h2>先听范读，再读给学习助手听</h2></div></div><blockquote>{props.lesson.speak}</blockquote><div className="read-actions"><Button variant="outline" onClick={() => props.onSpeak(props.lesson.speak)}><Play /> 播放范读</Button><Button className={props.listening ? "recording" : ""} onClick={props.listening ? props.onStopRecognition : props.onStartRecognition}>{props.listening ? <MicOff /> : <Mic />}{props.listening ? "结束朗读" : "开始朗读"}</Button></div>{(props.transcript || props.listening) && <div className="speech-result"><span>{props.listening ? "正在认真听……" : `我听到：${props.transcript}`}</span>{props.speechScore !== null && <b className={props.speechScore >= 75 ? "good" : "keep"}>{props.speechScore}分 · {props.speechScore >= 85 ? "准确流畅" : "再慢一点练一遍"}</b>}</div>}</section>
      </TabsContent>

      <TabsContent value="inquiry">
        <section className="learning-card textbook-tasks"><div className="card-title"><span><BookMarked /></span><div><small>教材课后要求</small><h2>每一道题都按“审题—找依据—组织表达”完成</h2></div></div><div className="task-stack">{(props.textbook?.tasks ?? [props.lesson.requirement]).map((task, index) => <article className="textbook-task" key={task}><i>{index + 1}</i><div><strong>{task}</strong><p><b>先自己想：</b>圈出任务中的动词；回到原文标出依据；最后用自己的话回答。</p><button onClick={() => props.onAskTutor(`请不要直接给答案。围绕《${props.lesson.title}》这道教材题，用三个递进问题提示我：${task}`)}><Sparkles /> 卡住了，给我分级提示</button></div></article>)}</div></section>
        <section className="learning-card question-lab"><div className="card-title"><span><CircleHelp /></span><div><small>我的问题篮</small><h2>会提出问题，才会真正读进去</h2></div></div><div className="question-stems"><button onClick={() => setQuestionDraft("我不明白……是什么意思？")}>内容：我不明白……</button><button onClick={() => setQuestionDraft("作者为什么要写……？")}>写法：为什么这样写？</button><button onClick={() => setQuestionDraft("如果……会发生什么？")}>假设：如果……</button><button onClick={() => setQuestionDraft("这让我想到了生活中的……")}>联系：我想到了……</button></div><div className="question-entry"><Textarea value={questionDraft} onChange={(event) => setQuestionDraft(event.target.value)} placeholder="写下一个值得研究的问题……" rows={3} /><Button onClick={submitQuestion}><CircleHelp /> 保存问题</Button></div>{props.questions.length > 0 && <div className="student-questions">{props.questions.map((question, index) => <article key={`${question}-${index}`}><span><i>Q{index + 1}</i>{question}</span><div><button onClick={() => props.onAskTutor(`不要直接回答，请帮助我找到解决这个问题的原文位置和思考步骤：${question}`)}>求提示</button><button onClick={() => props.onRemoveQuestion(index)}>删除</button></div></article>)}</div>}</section>
        <section className="learning-card quiz-card"><div className="card-title"><span><BrainCircuit /></span><div><small>即时检测</small><h2>{props.lesson.quiz.question}</h2></div></div><div className="option-list">{props.lesson.quiz.options.map((option, index) => { const correct = props.answerChecked && index === props.lesson.quiz.answer; const wrong = props.answerChecked && index === props.selectedAnswer && index !== props.lesson.quiz.answer; return <button key={option} disabled={props.answerChecked} className={`${props.selectedAnswer === index ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`} onClick={() => props.onSelectAnswer(index)}><i>{String.fromCharCode(65 + index)}</i><span>{option}</span>{correct && <CheckCircle2 />}{wrong && <X />}</button>; })}</div>{props.answerChecked && <div className={`answer-explain ${quizCorrect ? "correct" : "wrong"}`}><strong>{quizCorrect ? "回答正确" : "再想一想"}</strong><p>{props.lesson.quiz.explanation}</p></div>}<div className="quiz-actions">{props.answerChecked ? <Button variant="outline" onClick={props.onResetAnswer}><RotateCcw /> 再做一次</Button> : <Button onClick={props.onCheckAnswer}>检查答案</Button>}<Button variant="ghost" onClick={() => props.onAskTutor(`不要告诉我答案，请先问我应该回到课文哪里找依据：${props.lesson.quiz.question}`)}><Sparkles /> 只要提示</Button></div></section>
      </TabsContent>

      <TabsContent value="express"><section className="learning-card expression-card"><div className="card-title"><span><NotebookPen /></span><div><small>表达应用</small><h2>把阅读所得变成自己的表达</h2></div></div><div className="practice-prompt"><Lightbulb /><p>{props.lesson.practice}</p></div><div className="expression-frame"><span>表达小支架</span><p><b>先说观点：</b>我认为……</p><p><b>再摆依据：</b>文中……让我看出……</p><p><b>最后联系：</b>这使我想到／感受到……</p></div><Textarea value={props.draft} onChange={(event) => props.onDraftChange(event.target.value)} placeholder="先独立写，再根据评价标准修改……" rows={10} /><div className="draft-meta"><span>{props.draft.length} 字</span><div><Button variant="outline" onClick={props.onEvaluateDraft}><WandSparkles /> 自查表达</Button><Button variant="ghost" onClick={() => props.onAskTutor(`只给两条修改建议，不要代写。我的练习是：${props.draft.slice(0, 500)}`)}><Sparkles /> 请求修改建议</Button></div></div>{props.draftFeedback.length > 0 && <div className="feedback-box"><strong><Sparkles /> 修改清单</strong>{props.draftFeedback.map((item) => <p key={item}><Check />{item}</p>)}</div>}</section></TabsContent>

      <TabsContent value="reflect"><section className="learning-card mastery-card"><div className="mastery-top"><span className="mastery-seal"><Trophy /></span><div><small>学习复盘</small><h2>{props.completed ? "本课已经点亮，还可以继续完善批注" : "能说出学习方法，才算真正学会"}</h2><p>请用“我学会了—我这样学—我还想问”完成一次自我总结。</p></div></div><div className="mastery-checks"><p className="ready"><CheckCircle2 /><span><strong>读过原文</strong>我能用教材原页核对排版原文</span></p><p className={props.highlights.length > 0 ? "ready" : ""}>{props.highlights.length > 0 ? <CheckCircle2 /> : <BookMarked />}<span><strong>留下痕迹</strong>{props.highlights.length > 0 ? `我标出了 ${props.highlights.length} 处重点` : "我还可以标重点、写批注"}</span></p><p className={props.questions.length > 0 ? "ready" : ""}>{props.questions.length > 0 ? <CheckCircle2 /> : <CircleHelp />}<span><strong>主动提问</strong>{props.questions.length > 0 ? `我提出了 ${props.questions.length} 个问题` : "我还可以提出一个自己的问题"}</span></p><p className={props.draft.trim().length >= 20 ? "ready" : ""}>{props.draft.trim().length >= 20 ? <CheckCircle2 /> : <NotebookPen />}<span><strong>独立表达</strong>{props.draft.trim().length >= 20 ? "我已经用自己的话表达" : "建议完成20字以上的表达"}</span></p></div><label className="reflection-box"><strong>我的学习小结</strong><Textarea value={props.reflection} onChange={(event) => props.onReflectionChange(event.target.value)} placeholder="我学会了……；我使用的方法是……；我还想弄明白……" rows={5} /></label><Button size="lg" disabled={props.completed} onClick={props.onComplete}>{props.completed ? <><Check /> 已获得成长星</> : <><Star /> 完成本课，领取成长星</>}</Button></section></TabsContent>
    </Tabs>
  );
}

function TextbookReader(props: RichLessonProps & { teacher: boolean }) {
  const pages = props.textbook?.pages ?? [];
  const [pageIndex, setPageIndex] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const page = pages[Math.min(pageIndex, Math.max(0, pages.length - 1))];

  if (!page) return <section className="learning-card"><p>本课教材内容正在整理，请先查看教材原页。</p></section>;

  const pageText = page.blocks.map((block) => block.text).join("\n");
  return (
    <section className="learning-card reader-card">
      <div className="reader-toolbar"><div><Badge variant="secondary">排版原文</Badge><strong>教材第 {page.textbookPage} 页</strong><small>PDF 第 {page.pdfPage} 页</small></div><div><Button size="sm" variant="outline" onClick={() => setFontSize((value) => Math.max(15, value - 1))}>字−</Button><Button size="sm" variant="outline" onClick={() => setFontSize((value) => Math.min(24, value + 1))}>字＋</Button><Button size="sm" variant="outline" onClick={() => props.onSpeak(pageText)}><Headphones /> 朗读本页</Button></div></div>
      <div className="reader-page-nav"><Button size="sm" variant="ghost" disabled={pageIndex === 0} onClick={() => setPageIndex((value) => value - 1)}><ArrowLeft /> 上一页</Button><span>{pageIndex + 1} / {pages.length}</span><Button size="sm" variant="ghost" disabled={pageIndex >= pages.length - 1} onClick={() => setPageIndex((value) => value + 1)}>下一页 <ArrowRight /></Button></div>
      <div className="reader-split">
        <article className="reader-text" style={{ "--reader-font-size": `${fontSize}px` } as React.CSSProperties}>
          <div className="reader-guide"><Lightbulb /><p>{props.teacher ? "备课时可用右侧原页校对文字、插图、注音和版式；排版文本便于检索与课堂投屏。" : "先读排版原文，遇到疑问随手标记；插图、注音、书写格式请以右侧教材原页为准。"}</p></div>
          {page.blocks.map((block, index) => {
            const blockKey = `${props.lesson.id}:${page.pdfPage}:${index}`;
            const highlighted = props.highlights.includes(blockKey);
            const matchedWords = props.lesson.keywords.filter((word) => word.length > 1 && block.text.includes(word)).slice(0, 4);
            return <div className={`reader-block ${block.type} ${highlighted ? "highlighted" : ""}`} key={blockKey}><p>{block.text}</p><div className="block-tools"><button onClick={() => props.onSpeak(block.text, 0.8)}><Volume2 /> 听读</button><button className={highlighted ? "active" : ""} onClick={() => props.onToggleHighlight(blockKey)}><BookMarked /> {highlighted ? "已标重点" : "标重点"}</button></div><details className="block-note"><summary>助学注释与我的批注</summary><div className="auto-note"><Sparkles /><p>{block.type === "vocabulary" ? "这是本页的识字、写字或词语学习区。先读准，再放回语句理解。" : block.type === "label" ? "这是教材栏目提示，读一读它要求你采用哪一种学习方式。" : matchedWords.length > 0 ? `本段可关注：${matchedWords.join("、")}。读后用一句话概括“写了什么”，再圈画最能支持判断的词句。` : "读完这一段，尝试概括主要内容，并标出让你产生画面、疑问或感受的词句。"}</p></div><Textarea value={props.blockNotes[blockKey] ?? ""} onChange={(event) => props.onBlockNoteChange(blockKey, event.target.value)} placeholder={props.teacher ? "写下教法提示、板书要点或课堂追问……" : "写下词义、画面、感受、问题或依据……"} rows={3} /></details></div>;
          })}
        </article>
        <aside className="pdf-reader"><div><Badge>教材原页</Badge><span>用于核对插图、注音、原始版式与文字</span></div><iframe className="pdf-frame" src={`/textbook.pdf#page=${page.pdfPage}&view=FitH&toolbar=0`} title={`${props.lesson.title}教材第${page.textbookPage}页`} /></aside>
      </div>
      <p className="reader-disclaimer">说明：排版文本由教材内容转换，便于朗读、检索和批注；若个别字词、拼音或图文位置有差异，以同屏教材原页为准。</p>
    </section>
  );
}

function teachingTimeline(kind: CourseModule["kind"]) {
  if (kind === "略读") return [["3分钟", "明确任务"], ["12分钟", "独立阅读"], ["10分钟", "批注提问"], ["10分钟", "交流依据"], ["5分钟", "迁移复盘"]];
  if (kind === "古诗") return [["6分钟", "读准节奏"], ["10分钟", "借注释释义"], ["8分钟", "想象画面"], ["8分钟", "熟读背诵"], ["8分钟", "比较迁移"]];
  if (kind === "习作") return [["5分钟", "创设情境"], ["8分钟", "分析范例"], ["8分钟", "口述提纲"], ["14分钟", "独立起草"], ["5分钟", "互评修改"]];
  if (kind === "口语交际") return [["5分钟", "明确情境"], ["5分钟", "教师示范"], ["12分钟", "小组练习"], ["12分钟", "展示交流"], ["6分钟", "依据标准评价"]];
  return [["5分钟", "目标导入"], ["8分钟", "初读梳理"], ["12分钟", "精读示范"], ["10分钟", "自主探究"], ["5分钟", "表达复盘"]];
}

function TeacherLessonView(props: RichLessonProps) {
  const timeline = teachingTimeline(props.lesson.kind);
  return (
    <Tabs defaultValue="design" className="lesson-tabs rich-tabs teacher-tabs">
      <TabsList><TabsTrigger value="design">1 教学设计</TabsTrigger><TabsTrigger value="source">2 原文备课</TabsTrigger><TabsTrigger value="questions">3 课堂提问</TabsTrigger><TabsTrigger value="assessment">4 评价建议</TabsTrigger></TabsList>
      <TabsContent value="design"><section className="learning-card lesson-plan"><div className="card-title"><span><Target /></span><div><small>一课一案</small><h2>从教师示范走向学生独立</h2></div></div><div className="teacher-principle"><BrainCircuit /><p><strong>能力培养主线：</strong>教师示范一次 → 同伴协作一次 → 学生独立完成一次。教师只在关键处搭支架，并逐步撤掉。</p></div><div className="plan-grid"><article><small>阅读策略</small><h3>{props.unit.readingSkill}</h3><p>用一段原文示范圈画、提问、找依据，再让学生把方法迁移到下一段。</p></article><article><small>表达任务</small><h3>{props.unit.expressionSkill}</h3><p>先口头组织“观点＋依据”，再独立落笔，最后对照标准自改。</p></article></div><h3 className="subheading">本课学习目标</h3><div className="goal-list">{props.lesson.goals.map((goal, index) => <p key={goal}><i>{index + 1}</i>{goal}</p>)}</div><h3 className="subheading">建议40分钟流程</h3><div className="timeline">{timeline.map(([time, action], index) => <article key={time}><i>{index + 1}</i><div><strong>{action}</strong><span>{time}</span><p>{index === 0 ? "把教材要求转成学生听得懂的学习任务。" : index === 1 ? "学生先独立尝试，教师观察真实困难。" : index === 2 ? "示范思考过程，追问依据来自哪里。" : index === 3 ? "同伴交流后独立完成，教师提供分级提示。" : "用证据自评：我学会什么、怎样学会、还需什么帮助。"}</p></div></article>)}</div></section></TabsContent>
      <TabsContent value="source"><TextbookReader {...props} teacher /></TabsContent>
      <TabsContent value="questions"><section className="learning-card"><div className="card-title"><span><CircleHelp /></span><div><small>教材任务转化</small><h2>用问题链引导学生自己发现</h2></div></div><div className="task-stack">{(props.textbook?.tasks ?? [props.lesson.requirement]).map((task, index) => <article className="textbook-task teacher-task" key={task}><i>{index + 1}</i><div><strong>{task}</strong><div className="hint-ladder"><p><b>一级·定位：</b>题目要我们做什么？原文哪一段与它最相关？</p><p><b>二级·整理：</b>圈出两处关键词句，它们有什么相同或不同？</p><p><b>三级·表达：</b>不照抄原句，怎样用“观点＋依据”完整说明？</p></div></div></article>)}</div></section><section className="learning-card"><div className="card-title"><span><Lightbulb /></span><div><small>课堂追问</small><h2>从答案转向思维过程</h2></div></div><div className="teacher-prompts"><p>你从哪个词、哪句话看出来？</p><p>如果删去或换掉这个词，表达效果有什么变化？</p><p>还有不同的依据或解释吗？</p><p>这个方法可以迁移到哪一段、哪一篇文章？</p></div></section></TabsContent>
      <TabsContent value="assessment"><section className="learning-card rubric-card"><div className="card-title"><span><Trophy /></span><div><small>过程性评价</small><h2>评价看证据，不只看最后答案</h2></div></div><div className="rubric-grid"><div className="rubric-head"><b>维度</b><b>需要帮助</b><b>正在形成</b><b>能够独立</b><b>能够迁移</b></div>{[
        ["朗读", "需提醒才能读准", "大体正确，有停顿", "正确流利有感情", "能说明怎样处理重音节奏"],
        ["理解", "凭印象回答", "能找到相关段落", "能用关键句作依据", "能比较、概括并解释写法"],
        ["提问", "等待教师提问", "能提出事实性问题", "能提出有价值的问题", "能分类问题并选择方法解决"],
        ["表达", "内容零散", "能说清基本意思", "观点与依据完整", "能修改并迁移表达方法"],
        ["自我监控", "不知困难在哪里", "提醒后能检查", "能自评并主动求助", "能制定下一步学习计划"],
      ].map((row) => <div className="rubric-row" key={row[0]}>{row.map((cell, index) => index === 0 ? <b key={cell}>{cell}</b> : <span key={cell}>{cell}</span>)}</div>)}</div><div className="assessment-tip"><CheckCircle2 /><p><strong>建议留存三类证据：</strong>学生原文批注、问题篮记录、修改前后表达。它们比一次选择题分数更能反映自学能力。</p></div></section></TabsContent>
    </Tabs>
  );
}

function LessonView({ unit, lesson, completed, selectedAnswer, answerChecked, transcript, speechScore, listening, draft, draftFeedback, onBack, onSelectAnswer, onCheckAnswer, onResetAnswer, onSpeak, onStartRecognition, onStopRecognition, onDraftChange, onEvaluateDraft, onAskTutor, onComplete }: { unit: CourseUnit; lesson: CourseModule; completed: boolean; selectedAnswer: number | null; answerChecked: boolean; transcript: string; speechScore: number | null; listening: boolean; draft: string; draftFeedback: string[]; onBack: () => void; onSelectAnswer: (index: number) => void; onCheckAnswer: () => void; onResetAnswer: () => void; onSpeak: (text: string, rate?: number) => void; onStartRecognition: () => void; onStopRecognition: () => void; onDraftChange: (value: string) => void; onEvaluateDraft: () => void; onAskTutor: (text: string) => void; onComplete: () => void }) {
  const quizCorrect = answerChecked && selectedAnswer === lesson.quiz.answer;
  return (
    <div className="lesson-page" style={{ "--unit-color": unit.color } as React.CSSProperties}>
      <button className="back-link" onClick={onBack}><ArrowLeft /> 返回{unit.title}</button>
      <section className="lesson-heading"><div><span><Badge>{lesson.kind}</Badge><small>约 {lesson.duration} 分钟</small>{completed && <small className="completed-label"><CheckCircle2 /> 已完成</small>}</span><h1>{lesson.title}</h1><p>{lesson.requirement}</p></div><Button variant="outline" onClick={() => onSpeak(lesson.speak)}><Headphones /> 听本课导读</Button></section>
      <Tabs defaultValue="know" className="lesson-tabs"><TabsList><TabsTrigger value="know">1 认识</TabsTrigger><TabsTrigger value="practice">2 练习</TabsTrigger><TabsTrigger value="express">3 表达</TabsTrigger><TabsTrigger value="check">4 达标</TabsTrigger></TabsList>
        <TabsContent value="know"><section className="learning-card goals-card"><div className="card-title"><span><Target /></span><div><small>本课目标</small><h2>学完后，我能够……</h2></div></div><div className="goal-list">{lesson.goals.map((goal, index) => <p key={goal}><i>{index + 1}</i>{goal}</p>)}</div></section><section className="learning-card word-card"><div className="card-title"><span><Volume2 /></span><div><small>听音识词</small><h2>点击词语，先听再读</h2></div></div><div className="word-cloud">{lesson.keywords.map((word) => <button key={word} onClick={() => onSpeak(word, 0.72)}><Volume2 />{word}</button>)}</div><p className="tip-line"><Lightbulb /> 听一遍、跟读两遍，再选择两个词说一句话。</p></section><section className="learning-card read-card"><div className="card-title"><span><Mic /></span><div><small>朗读跟练</small><h2>听范读，再读给AI听</h2></div></div><blockquote>{lesson.speak}</blockquote><div className="read-actions"><Button variant="outline" onClick={() => onSpeak(lesson.speak)}><Play /> 播放范读</Button><Button className={listening ? "recording" : ""} onClick={listening ? onStopRecognition : onStartRecognition}>{listening ? <MicOff /> : <Mic />}{listening ? "结束朗读" : "开始朗读"}</Button></div>{(transcript || listening) && <div className="speech-result"><span>{listening ? "正在认真听……" : `我听到：${transcript}`}</span>{speechScore !== null && <b className={speechScore >= 75 ? "good" : "keep"}>{speechScore}分 · {speechScore >= 85 ? "节奏清楚" : speechScore >= 65 ? "继续练一遍" : "放慢速度再试试"}</b>}</div>}</section></TabsContent>
        <TabsContent value="practice"><section className="learning-card quiz-card"><div className="card-title"><span><CircleHelp /></span><div><small>课后达标题</small><h2>{lesson.quiz.question}</h2></div></div><div className="option-list">{lesson.quiz.options.map((option, index) => { const correct = answerChecked && index === lesson.quiz.answer; const wrong = answerChecked && index === selectedAnswer && index !== lesson.quiz.answer; return <button key={option} disabled={answerChecked} className={`${selectedAnswer === index ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`} onClick={() => onSelectAnswer(index)}><i>{String.fromCharCode(65 + index)}</i><span>{option}</span>{correct && <CheckCircle2 />}{wrong && <X />}</button>; })}</div>{answerChecked && <div className={`answer-explain ${quizCorrect ? "correct" : "wrong"}`}><strong>{quizCorrect ? "回答正确" : "再想一想"}</strong><p>{lesson.quiz.explanation}</p></div>}<div className="quiz-actions">{answerChecked ? <Button variant="outline" onClick={onResetAnswer}><RotateCcw /> 再做一次</Button> : <Button onClick={onCheckAnswer}>检查答案</Button>}<Button variant="ghost" onClick={() => onAskTutor(`这道题我不太明白：${lesson.quiz.question}`)}><Sparkles /> 请AI提示</Button></div></section><section className="learning-card method-card"><div className="card-title"><span><BrainCircuit /></span><div><small>学习方法</small><h2>把课后要求变成三步行动</h2></div></div><div className="method-steps"><p><i>1</i><span><strong>找关键词</strong>圈出题目要求你“说、想、找、写”的内容。</span></p><p><i>2</i><span><strong>回到依据</strong>从课文情节、人物言行或关键语句中找证据。</span></p><p><i>3</i><span><strong>用自己的话</strong>用“观点＋依据＋感受”完整回答。</span></p></div></section></TabsContent>
        <TabsContent value="express"><section className="learning-card expression-card"><div className="card-title"><span><NotebookPen /></span><div><small>表达应用</small><h2>把阅读所得变成自己的表达</h2></div></div><div className="practice-prompt"><Lightbulb /><p>{lesson.practice}</p></div><Textarea value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="在这里写下你的想法。先说清楚，再慢慢写生动……" rows={9} /><div className="draft-meta"><span>{draft.length} 字</span><div><Button variant="outline" onClick={onEvaluateDraft}><WandSparkles /> 本地AI检查</Button><Button variant="ghost" onClick={() => onAskTutor(`请根据本课目标，给我的这段练习提出两条修改建议，不要代写：${draft.slice(0, 500)}`)}><Sparkles /> 深度建议</Button></div></div>{draftFeedback.length > 0 && <div className="feedback-box"><strong><Sparkles /> 小语的修改建议</strong>{draftFeedback.map((item) => <p key={item}><Check />{item}</p>)}</div>}</section></TabsContent>
        <TabsContent value="check"><section className="learning-card mastery-card"><div className="mastery-top"><span className="mastery-seal"><Trophy /></span><div><small>本课自评</small><h2>{completed ? "太棒了，本课已经点亮！" : "最后检查一次，就可以获得成长星"}</h2><p>真正的学会，不只是记住答案，而是能说出方法、依据和自己的想法。</p></div></div><div className="mastery-checks"><p className="ready"><CheckCircle2 /><span><strong>认识目标</strong>我知道本课要学什么</span></p><p className={answerChecked ? "ready" : ""}>{answerChecked ? <CheckCircle2 /> : <CircleHelp />}<span><strong>互动练习</strong>{answerChecked ? "我已完成达标题并阅读解析" : "请先完成一题互动练习"}</span></p><p className={draft.trim().length >= 20 ? "ready" : ""}>{draft.trim().length >= 20 ? <CheckCircle2 /> : <NotebookPen />}<span><strong>表达应用</strong>{draft.trim().length >= 20 ? "我已经写下自己的理解" : "建议写下20字以上的学习成果"}</span></p></div><Button size="lg" disabled={completed} onClick={onComplete}>{completed ? <><Check /> 已获得成长星</> : <><Star /> 完成本课，领取成长星</>}</Button></section></TabsContent>
      </Tabs>
    </div>
  );
}

function TutorPanel({ activeModule, messages, input, loading, remoteEnabled, onInput, onAsk, onQuickAsk, onSettings }: { activeModule: CourseModule; messages: AiMessage[]; input: string; loading: boolean; remoteEnabled: boolean; onInput: (value: string) => void; onAsk: () => void; onQuickAsk: (text: string) => void; onSettings: () => void }) {
  return (
    <div className="tutor-panel"><header><div className="tutor-avatar"><Sparkles /></div><div><strong>AI学习伙伴 · 小语</strong><span><i /> {remoteEnabled ? "真实AI模式" : "本地免密模式"}</span></div><Button variant="ghost" size="icon" onClick={onSettings} aria-label="AI设置"><Settings2 /></Button></header><div className="tutor-context"><BookOpen /><span>正在陪你学习<strong>{activeModule.title}</strong></span></div><div className="chat-list">{messages.slice(-8).map((message, index) => <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}><p>{message.content}</p></div>)}{loading && <div className="chat-bubble tutor loading"><span /><span /><span /></div>}</div><div className="quick-asks"><button onClick={() => onQuickAsk("这课最重要的方法是什么？")}>本课方法</button><button onClick={() => onQuickAsk("我该怎样完成课后要求？")}>课后要求</button><button onClick={() => onQuickAsk("朗读和背诵有什么好方法？")}>朗读背诵</button></div><div className="chat-input"><Textarea value={input} onChange={(event) => onInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onAsk(); } }} placeholder="把不明白的地方告诉小语……" rows={3} /><Button size="icon" onClick={onAsk} disabled={!input.trim() || loading} aria-label="发送问题"><Send /></Button></div><p className="ai-note">AI会提示思路，但重要答案要回到课文中找依据。</p></div>
  );
}
