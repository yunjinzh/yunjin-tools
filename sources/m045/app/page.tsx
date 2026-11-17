"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Bot,
  BrainCircuit,
  Calculator,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleHelp,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Lightbulb,
  Map,
  Menu,
  MessageCircleQuestion,
  PenTool,
  Search,
  Send,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import {
  allLessons,
  lessonUnit,
  textbookToPdfPage,
  units,
  type Lesson,
} from "./course-data"

type Mode = "student" | "teacher"
type ChatMessage = { role: "tutor" | "student"; text: string }

const studentTabs = [
  ["learn", "自主研学", BrainCircuit],
  ["textbook", "教材原页", BookOpen],
  ["example", "例题工坊", PenTool],
  ["practice", "即时检测", Target],
  ["review", "学习复盘", BookMarked],
] as const

const teacherTabs = [
  ["design", "教学设计", GraduationCap],
  ["flow", "课堂流程", Clock3],
  ["diagnosis", "学情诊断", BarChart3],
  ["textbook", "教材原页", BookOpen],
] as const

const learningSteps = [
  ["看情境", "先看教材图、表和已知条件"],
  ["提问题", "用自己的话说清要求什么"],
  ["找关系", "圈数量、单位和不变量"],
  ["列算式", "先估范围，再选择方法"],
  ["说算理", "解释每一步为什么成立"],
  ["验结果", "逆运算、估算或回到情境"],
]

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved) as T
        queueMicrotask(() => setValue(parsed))
      }
    } catch {
      // The platform remains usable when storage is unavailable.
    }
  }, [key])

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore private-mode quota errors.
    }
  }, [key, value])

  return [value, setValue] as const
}

function Sidebar({
  activeId,
  completed,
  onSelect,
}: {
  activeId: string
  completed: string[]
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const completedSet = useMemo(() => new Set(completed), [completed])
  const visibleUnits = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return units
    return units
      .map((unit) => ({
        ...unit,
        lessons: unit.lessons.filter((lesson) =>
          `${unit.title}${lesson.title}${lesson.tag}`.toLowerCase().includes(keyword),
        ),
      }))
      .filter((unit) => unit.lessons.length)
  }, [query])

  return (
    <div className="sidebar-inner">
      <div className="sidebar-progress">
        <div className="progress-copy">
          <span>全册学习进度</span>
          <strong>{completed.length}/{allLessons.length}</strong>
        </div>
        <Progress value={(completed.length / allLessons.length) * 100} />
        <p>每课完成“学—练—省”后点亮一颗星</p>
      </div>

      <div className="search-wrap">
        <Search size={16} />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索课时或知识点"
          aria-label="搜索课程"
        />
      </div>

      <nav className="course-tree" aria-label="全册课程目录">
        {visibleUnits.map((unit) => (
          <section className="unit-block" key={unit.id}>
            <div className="unit-heading">
              <span className="unit-dot" style={{ background: unit.color }} />
              <div>
                <strong>{unit.number === "活动" || unit.number === "文化" ? unit.number : `第${unit.number}单元`} · {unit.title}</strong>
                <small>教材第{unit.startPage}页起</small>
              </div>
            </div>
            <div className="lesson-list">
              {unit.lessons.map((lesson, index) => {
                const isActive = activeId === lesson.id
                const isDone = completedSet.has(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    className={`lesson-link ${isActive ? "active" : ""}`}
                    onClick={() => onSelect(lesson.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="lesson-state">
                      {isDone ? <CheckCircle2 size={17} /> : <span>{index + 1}</span>}
                    </span>
                    <span className="lesson-name">{lesson.title}</span>
                    <small>P{lesson.pages[0]}{lesson.pages[1] !== lesson.pages[0] ? `–${lesson.pages[1]}` : ""}</small>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </nav>
    </div>
  )
}

function TextbookReader({ lesson }: { lesson: Lesson }) {
  const [page, setPage] = useState(lesson.pages[0])

  const canPrev = page > lesson.pages[0]
  const canNext = page < lesson.pages[1]
  const pdfPage = textbookToPdfPage(page)

  return (
    <div className="reader-grid">
      <aside className="reader-notes">
        <div className="eyebrow"><BookMarked size={15} /> 交互排版解读</div>
        <h3>{lesson.title}</h3>
        <p className="reader-source">配套教材第 {lesson.pages[0]}{lesson.pages[1] !== lesson.pages[0] ? `—${lesson.pages[1]}` : ""} 页</p>
        <div className="concept-stack">
          {lesson.concepts.map((concept, index) => (
            <article key={concept.name}>
              <span>{index + 1}</span>
              <div>
                <strong>{concept.name}</strong>
                <p>{concept.detail}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="source-notice">
          <FileText size={17} />
          <p><strong>原页是准确依据</strong><br />公式、图形、题目和编排请对照右侧教材原页；左侧用于提炼学习方法与关键词。</p>
        </div>
        <div className="page-controls">
          <Button variant="outline" size="sm" onClick={() => setPage((value) => value - 1)} disabled={!canPrev}>
            <ChevronLeft /> 上一页
          </Button>
          <span>教材 P{page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((value) => value + 1)} disabled={!canNext}>
            下一页 <ChevronRight />
          </Button>
        </div>
      </aside>
      <div className="pdf-panel">
        <div className="pdf-toolbar">
          <span>教材原页 · PDF第 {pdfPage} 页</span>
          <a href={`/textbook.pdf#page=${pdfPage}`} target="_blank" rel="noreferrer">新窗口查看</a>
        </div>
        <iframe
          title={`${lesson.title}教材第${page}页`}
          src={`/textbook.pdf#page=${pdfPage}&zoom=page-width&toolbar=1&navpanes=0`}
        />
        <p className="pdf-fallback">如浏览器未显示，请点击“新窗口查看”或下载离线版。</p>
      </div>
    </div>
  )
}

function ExampleWorkshop({ lesson }: { lesson: Lesson }) {
  const [revealed, setRevealed] = useState(0)

  const done = revealed >= lesson.example.steps.length

  return (
    <div className="workshop-grid">
      <section className="problem-card">
        <div className="eyebrow"><Calculator size={16} /> 今天的例题</div>
        <h3>{lesson.example.problem}</h3>
        <p>先在草稿纸上想30秒，再点“给我一步提示”。平台会逐步放出线索，不直接抢走思考。</p>
        <div className="estimate-box">
          <Lightbulb size={20} />
          <div><strong>动笔前先问</strong><span>结果大约是多少？已知量、未知量和单位分别是什么？</span></div>
        </div>
      </section>

      <section className="step-card">
        <div className="step-header">
          <div>
            <span>分步推理</span>
            <strong>{revealed}/{lesson.example.steps.length} 步</strong>
          </div>
          <Progress value={(revealed / lesson.example.steps.length) * 100} />
        </div>
        <div className="steps-list">
          {lesson.example.steps.map((step, index) => (
            <div key={step} className={`reason-step ${index < revealed ? "revealed" : "locked"}`}>
              <span>{index < revealed ? <Check size={17} /> : index + 1}</span>
              <p>{index < revealed ? step : index === revealed ? "下一条线索等待你主动开启" : "先完成前一步"}</p>
            </div>
          ))}
        </div>
        {done && (
          <div className="answer-reveal">
            <strong>结论：{lesson.example.answer}</strong>
            <p>验一验：{lesson.example.check}</p>
          </div>
        )}
        <div className="step-actions">
          <Button variant="outline" onClick={() => setRevealed((value) => Math.max(0, value - 1))} disabled={revealed === 0}>
            <ChevronLeft /> 收回一步
          </Button>
          <Button onClick={() => setRevealed((value) => Math.min(lesson.example.steps.length, value + 1))} disabled={done}>
            <Lightbulb /> {revealed === 0 ? "给我一步提示" : "继续推理"}
          </Button>
        </div>
      </section>
    </div>
  )
}

function PracticeLab({
  lesson,
  wrongLessons,
  setWrongLessons,
}: {
  lesson: Lesson
  wrongLessons: string[]
  setWrongLessons: (value: string[]) => void
}) {
  const [choice, setChoice] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const isCorrect = choice === lesson.quiz.answer

  function checkAnswer() {
    if (choice === null) return
    setChecked(true)
    if (choice !== lesson.quiz.answer && !wrongLessons.includes(lesson.id)) {
      setWrongLessons([...wrongLessons, lesson.id])
    }
  }

  return (
    <div className="practice-grid">
      <section className="quiz-card">
        <div className="quiz-meta">
          <Badge variant="secondary">即时诊断 · 1题</Badge>
          <span>先独立作答，再看解析</span>
        </div>
        <h3>{lesson.quiz.question}</h3>
        <div className="options-list" role="radiogroup" aria-label="答案选项">
          {lesson.quiz.options.map((option, index) => {
            const chosen = choice === index
            const showCorrect = checked && index === lesson.quiz.answer
            const showWrong = checked && chosen && !isCorrect
            return (
              <button
                key={option}
                className={`quiz-option ${chosen ? "chosen" : ""} ${showCorrect ? "correct" : ""} ${showWrong ? "wrong" : ""}`}
                onClick={() => { setChoice(index); setChecked(false) }}
                role="radio"
                aria-checked={chosen}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                <p>{option}</p>
                {showCorrect && <CheckCircle2 size={20} />}
                {showWrong && <AlertTriangle size={20} />}
              </button>
            )
          })}
        </div>
        {choice === null && <p className="hint-line"><CircleHelp size={16} /> {lesson.quiz.hint}</p>}
        <Button className="check-button" onClick={checkAnswer} disabled={choice === null || checked}>
          <Target /> 检查答案
        </Button>
        {checked && (
          <div className={`feedback ${isCorrect ? "success" : "retry"}`}>
            <strong>{isCorrect ? "回答正确，算理也要会说！" : "先别急着改答案，定位错因更重要。"}</strong>
            <p>{lesson.quiz.explanation}</p>
            {!isCorrect && <p>这道题已收入“错题复盘”。稍后请用自己的话补充错因。</p>}
          </div>
        )}
      </section>

      <aside className="transfer-card">
        <div className="eyebrow"><ArrowRight size={16} /> 迁移练习</div>
        <h3>从会一道，到会一类</h3>
        {lesson.practice.map((item, index) => (
          <div className="practice-item" key={item}>
            <span>{index + 1}</span><p>{item}</p>
          </div>
        ))}
        <p className="transfer-tip">建议顺序：先口述思路 → 再独立书写 → 最后用估算或逆运算自检。</p>
      </aside>
    </div>
  )
}

function StudentReview({
  lesson,
  completed,
  setCompleted,
  wrongLessons,
  notes,
  setNotes,
}: {
  lesson: Lesson
  completed: string[]
  setCompleted: (value: string[]) => void
  wrongLessons: string[]
  notes: Record<string, string>
  setNotes: (value: Record<string, string>) => void
}) {
  const done = completed.includes(lesson.id)
  const isWrong = wrongLessons.includes(lesson.id)
  const [rating, setRating] = useState(0)

  return (
    <div className="review-grid">
      <section className="reflection-card">
        <div className="eyebrow"><BookMarked size={16} /> 我的学习证据</div>
        <h3>{lesson.product}</h3>
        <label htmlFor="lesson-note">把今天最关键的方法，写成未来自己看得懂的话</label>
        <Textarea
          id="lesson-note"
          value={notes[lesson.id] ?? ""}
          onChange={(event) => setNotes({ ...notes, [lesson.id]: event.target.value })}
          placeholder="我先……因为……我用……检验。下次遇到……我会……"
          rows={7}
        />
        <div className="rating-row">
          <span>我现在能做到：</span>
          {["需要提示", "可以独立", "能够讲解"].map((label, index) => (
            <button key={label} onClick={() => setRating(index + 1)} className={rating === index + 1 ? "active" : ""}>
              {index + 1 === 1 ? "△" : index + 1 === 2 ? "○" : "★"} {label}
            </button>
          ))}
        </div>
        <Button
          size="lg"
          className="complete-button"
          onClick={() => setCompleted(done ? completed.filter((id) => id !== lesson.id) : [...completed, lesson.id])}
        >
          {done ? <><CheckCircle2 /> 已完成本课 · 点击可撤销</> : <><Trophy /> 完成“学—练—省”，点亮本课</>}
        </Button>
      </section>

      <aside className={`wrongbook-card ${isWrong ? "has-wrong" : ""}`}>
        <div className="eyebrow"><AlertTriangle size={16} /> 错题复盘</div>
        {isWrong ? (
          <>
            <h3>这道题值得再学一次</h3>
            <p className="wrong-question">{lesson.quiz.question}</p>
            <ol>
              <li>我当时选择了什么？依据是什么？</li>
              <li>错在概念、审题、方法还是计算？</li>
              <li>正确方法：{lesson.quiz.explanation}</li>
              <li>明天遮住答案，再独立做一道变式。</li>
            </ol>
          </>
        ) : (
          <>
            <h3>本课暂无错题记录</h3>
            <p>“没有错题”不等于完全掌握。尝试给家人讲清例题；讲不清的地方，就是下一次复习的入口。</p>
          </>
        )}
        <div className="misconception-list">
          <strong>本课常见易错点</strong>
          {lesson.misconceptions.map((item) => <p key={item}><Circle size={8} fill="currentColor" /> {item}</p>)}
        </div>
      </aside>
    </div>
  )
}

function TeacherDesign({ lesson }: { lesson: Lesson }) {
  return (
    <div className="teacher-grid">
      <section className="teacher-main">
        <div className="teacher-banner">
          <div>
            <span>本课核心任务</span>
            <h3>{lesson.inquiry}</h3>
          </div>
          <Badge>{lesson.duration}分钟建议课时</Badge>
        </div>
        <div className="teacher-section">
          <h3><Target size={19} /> 可观察的学习目标</h3>
          {lesson.goals.map((goal, index) => (
            <div className="goal-row" key={goal}><span>{index + 1}</span><p>{goal}</p></div>
          ))}
        </div>
        <div className="teacher-section">
          <h3><BrainCircuit size={19} /> 教学重点与难点</h3>
          <div className="focus-grid">
            <article><span>重点</span><p>{lesson.concepts[0]?.detail}</p></article>
            <article><span>难点</span><p>让学生不只得到结果，还能用图、算式或数量关系解释“为什么”。</p></article>
          </div>
        </div>
      </section>
      <aside className="teacher-aside">
        <h3>课前准备清单</h3>
        <p><CheckCircle2 /> 预览教材第{lesson.pages[0]}{lesson.pages[1] !== lesson.pages[0] ? `—${lesson.pages[1]}` : ""}页图表与题目</p>
        <p><CheckCircle2 /> 准备可操作材料或草稿纸</p>
        <p><CheckCircle2 /> 预测两种典型错误并保留讨论空间</p>
        <p><CheckCircle2 /> 明确本课“会”的可观察证据</p>
        <div className="teacher-tip"><Lightbulb /> 先让学生暴露真实想法，再组织比较；不要用教师讲解替代学生的数学表达。</div>
      </aside>
    </div>
  )
}

function TeacherFlow({ lesson }: { lesson: Lesson }) {
  const flow = [
    ["情境唤醒", "5分钟", `呈现教材情境，不先讲方法。追问：“${lesson.inquiry}”`],
    ["独立探究", "8分钟", "学生圈条件、画图或列式；教师巡视记录不同思路，不急于纠正。"],
    ["交流建模", "12分钟", `选2—3种代表方案比较，聚焦“${lesson.concepts[0]?.name}”背后的依据。`],
    ["变式练习", "10分钟", "使用本平台即时题与迁移任务；让学生先估、再算、后验。"],
    ["证据复盘", "5分钟", `完成学习产品：“${lesson.product}”，按“需要提示/可以独立/能够讲解”自评。`],
  ]
  return (
    <div className="flow-layout">
      <div className="flow-timeline">
        {flow.map(([title, time, detail], index) => (
          <article key={title}>
            <div className="flow-number">{index + 1}</div>
            <div className="flow-copy">
              <div><h3>{title}</h3><Badge variant="outline">{time}</Badge></div>
              <p>{detail}</p>
            </div>
          </article>
        ))}
      </div>
      <aside className="board-plan">
        <span>建议板书结构</span>
        <h3>{lesson.title}</h3>
        <p>已知 → 问题</p>
        <div className="board-arrow">↓</div>
        <p>{lesson.concepts.map((item) => item.name).join(" · ")}</p>
        <div className="board-arrow">↓</div>
        <p>方法 → 算理 → 验证</p>
        <small>保留学生生成的方法，不把板书写成答案清单。</small>
      </aside>
    </div>
  )
}

function TeacherDiagnosis({ lesson }: { lesson: Lesson }) {
  return (
    <div className="diagnosis-grid">
      <section>
        <div className="eyebrow"><MessageCircleQuestion size={16} /> 问题阶梯</div>
        <h3>从“知道”走向“解释与迁移”</h3>
        {lesson.teacherQuestions.map((question, index) => (
          <article className="question-level" key={question}>
            <span>L{index + 1}</span>
            <div><strong>{index === 0 ? "理解与解释" : "迁移与反思"}</strong><p>{question}</p></div>
          </article>
        ))}
        <article className="question-level">
          <span>L3</span>
          <div><strong>创造</strong><p>请改编例题中的一个条件，使答案改变但核心数量关系不变，并说明你的设计。</p></div>
        </article>
      </section>
      <aside>
        <div className="diagnostic-card">
          <span>出口检测题</span>
          <h3>{lesson.quiz.question}</h3>
          <p><strong>正确答案：</strong>{lesson.quiz.options[lesson.quiz.answer]}</p>
          <p><strong>解析：</strong>{lesson.quiz.explanation}</p>
        </div>
        <div className="error-card">
          <span>典型错因与干预</span>
          {lesson.misconceptions.map((item, index) => (
            <p key={item}><strong>{index + 1}</strong><span>{item}<br /><small>先让学生指出证据，再用反例或操作材料纠偏。</small></span></p>
          ))}
        </div>
        <div className="rubric-card">
          <span>三级评价尺</span>
          <p><b>△ 需要提示</b>：能识别部分信息，方法依赖提示。</p>
          <p><b>○ 可以独立</b>：能独立完成并用一种方法检验。</p>
          <p><b>★ 能够讲解</b>：能解释算理、比较方法并完成变式。</p>
        </div>
      </aside>
    </div>
  )
}

function CourseMap({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="map-button"><Map /> 全册地图</Button>
      </DialogTrigger>
      <DialogContent className="course-map-dialog">
        <DialogHeader>
          <DialogTitle>四年级数学上册 · 全册自主学习地图</DialogTitle>
          <DialogDescription>9个单元、2个数学活动、37个可交互课时；点击任一课时立即进入。</DialogDescription>
        </DialogHeader>
        <div className="map-units">
          {units.map((unit) => (
            <section key={unit.id} style={{ "--unit-color": unit.color } as React.CSSProperties}>
              <div className="map-unit-title">
                <span>{unit.number}</span><div><strong>{unit.title}</strong><small>{unit.subtitle}</small></div>
              </div>
              <div className="map-lessons">
                {unit.lessons.map((lesson) => (
                  <button key={lesson.id} onClick={() => onSelect(lesson.id)}>
                    {lesson.title}<small>P{lesson.pages[0]}–{lesson.pages[1]}</small>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TutorSheet({ lesson }: { lesson: Lesson }) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "tutor", text: `我们正在学习“${lesson.title}”。先告诉我：你已经知道哪些条件，要求什么？` },
  ])

  function tutorReply(text: string) {
    const normalized = text.trim()
    if (!normalized) return
    let reply = `先别急着算。请把题目中的“已知量、未知量、单位”分别写出来，再想想它和“${lesson.concepts[0]?.name}”有什么关系。`
    if (/答案|直接|结果/.test(normalized)) {
      reply = `我先给你最小线索：${lesson.quiz.hint} 你试着列出第一步，我再帮你检查。`
    } else if (/不会|不懂|卡|难/.test(normalized)) {
      reply = `把任务缩小：只完成第一步——${lesson.example.steps[0]} 做完后告诉我你得到什么。`
    } else if (/验|检查|对吗|是否/.test(normalized)) {
      reply = `可以用这条检验路径：${lesson.example.check} 还要问一问结果的大小和单位是否符合情境。`
    } else if (/为什么|算理|依据/.test(normalized)) {
      reply = `${lesson.concepts[0]?.detail} 你能用一个更小的数、图或反例把这句话说明白吗？`
    }
    setMessages((items) => [...items, { role: "student", text: normalized }, { role: "tutor", text: reply }])
    setInput("")
  }

  const quick = ["我不会第一步", "给我一个小提示", "怎样检验结果", "为什么这样算"]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="tutor-fab" size="lg"><Bot /> <span>问“小数”</span></Button>
      </SheetTrigger>
      <SheetContent side="right" className="tutor-sheet">
        <SheetHeader>
          <SheetTitle><span className="tutor-avatar"><Sparkles /></span> “小数”启发式助教</SheetTitle>
          <SheetDescription>围绕当前课时分层提示 · 不替你完成思考</SheetDescription>
        </SheetHeader>
        <div className="tutor-context">
          <span>当前课时</span><strong>{lesson.title}</strong><small>教材 P{lesson.pages[0]}–{lesson.pages[1]}</small>
        </div>
        <div className="chat-list">
          {messages.map((message, index) => (
            <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
              {message.role === "tutor" && <Bot size={18} />}
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <div className="quick-prompts">
          {quick.map((item) => <button key={item} onClick={() => tutorReply(item)}>{item}</button>)}
        </div>
        <form className="tutor-input" onSubmit={(event) => { event.preventDefault(); tutorReply(input) }}>
          <Textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="写下你卡住的地方……" rows={3} />
          <Button type="submit" disabled={!input.trim()}><Send /> 发送</Button>
        </form>
        <p className="tutor-note">本地启发式助教不上传学习内容，离线版也可使用。涉及教材原题时请以原页为准。</p>
      </SheetContent>
    </Sheet>
  )
}

export default function Home() {
  const [activeId, setActiveId] = useStoredState("math-active-lesson", allLessons[0].id)
  const [mode, setMode] = useStoredState<Mode>("math-learning-mode", "student")
  const [completed, setCompleted] = useStoredState<string[]>("math-completed", [])
  const [wrongLessons, setWrongLessons] = useStoredState<string[]>("math-wrong-lessons", [])
  const [notes, setNotes] = useStoredState<Record<string, string>>("math-notes", {})
  const [tab, setTab] = useState("learn")

  const lesson = allLessons.find((item) => item.id === activeId) ?? allLessons[0]
  const unit = lessonUnit(lesson)
  const lessonIndex = allLessons.findIndex((item) => item.id === lesson.id)
  const nextLesson = allLessons[lessonIndex + 1]
  const previousLesson = allLessons[lessonIndex - 1]

  useEffect(() => {
    queueMicrotask(() => setTab(mode === "student" ? "learn" : "design"))
  }, [mode])

  function selectLesson(id: string) {
    setActiveId(id)
    setTab(mode === "student" ? "learn" : "design")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const activeTabs = mode === "student" ? studentTabs : teacherTabs

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Calculator /></div>
          <div>
            <span>四年级数学上册</span>
            <strong>AI 自主学习平台</strong>
          </div>
        </div>
        <div className="header-actions">
          <CourseMap onSelect={selectLesson} />
          <a className="offline-link" href="/四年级数学AI自主学习平台.html" download>
            <Download /> <span>离线版</span>
          </a>
          <div className="mode-switcher">
            <UserRound size={17} className={mode === "student" ? "active" : ""} />
            <Switch
              checked={mode === "teacher"}
              onCheckedChange={(checked) => {
                const nextMode: Mode = checked ? "teacher" : "student"
                setMode(nextMode)
                setTab(nextMode === "student" ? "learn" : "design")
              }}
              aria-label="切换学生与教师模式"
            />
            <GraduationCap size={18} className={mode === "teacher" ? "active" : ""} />
            <span>{mode === "student" ? "学生模式" : "教师模式"}</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mobile-menu" aria-label="打开课程目录"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="mobile-course-sheet">
              <SheetHeader>
                <SheetTitle>全册课程目录</SheetTitle>
                <SheetDescription>选择一个课时继续学习</SheetDescription>
              </SheetHeader>
              <Sidebar activeId={lesson.id} completed={completed} onSelect={selectLesson} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="workspace">
        <aside className="desktop-sidebar">
          <Sidebar activeId={lesson.id} completed={completed} onSelect={selectLesson} />
        </aside>

        <section className="lesson-workspace">
          <div className="lesson-hero" style={{ "--unit-color": unit.color } as React.CSSProperties}>
            <div className="lesson-breadcrumb">
              <span>{unit.number === "活动" || unit.number === "文化" ? unit.number : `第${unit.number}单元`}</span>
              <ChevronRight size={14} />
              <span>{unit.title}</span>
              <ChevronRight size={14} />
              <span>第{unit.lessons.findIndex((item) => item.id === lesson.id) + 1}课</span>
            </div>
            <div className="hero-main">
              <div>
                <div className="lesson-badges">
                  <Badge>{lesson.tag}</Badge>
                  <Badge variant="outline"><Clock3 /> {lesson.duration}分钟</Badge>
                  <Badge variant="outline"><BookOpen /> 教材P{lesson.pages[0]}{lesson.pages[1] !== lesson.pages[0] ? `–${lesson.pages[1]}` : ""}</Badge>
                </div>
                <h1>{lesson.title}</h1>
                <p>{lesson.inquiry}</p>
              </div>
              <div className="lesson-position">
                <span>全册第</span><strong>{lessonIndex + 1}</strong><small>/ {allLessons.length} 课</small>
              </div>
            </div>
            {mode === "student" && (
              <div className="learning-rail">
                {learningSteps.map(([title, detail], index) => (
                  <div key={title} title={detail}>
                    <span>{index + 1}</span><strong>{title}</strong>
                    {index < learningSteps.length - 1 && <i />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Tabs value={tab} onValueChange={setTab} className="lesson-tabs">
            <TabsList className="lesson-tab-list" variant="line">
              {activeTabs.map(([value, label, Icon]) => (
                <TabsTrigger value={value} key={value}><Icon /> {label}</TabsTrigger>
              ))}
            </TabsList>

            {mode === "student" ? (
              <>
                <TabsContent value="learn" className="tab-panel">
                  <div className="learn-grid">
                    <section className="mission-card">
                      <div className="mission-icon"><Target /></div>
                      <div><span>本课探究任务</span><h2>{lesson.inquiry}</h2><p>先写出自己的猜想；学习结束后再回来看，哪些想法被证实，哪些需要修改。</p></div>
                    </section>
                    <section className="goals-card">
                      <div className="eyebrow"><Trophy size={16} /> 学会的证据</div>
                      {lesson.goals.map((goal, index) => <p key={goal}><span>{index + 1}</span>{goal}</p>)}
                    </section>
                  </div>
                  <section className="concept-section">
                    <div className="section-heading"><div><span>先建概念，再练算法</span><h2>本课知识支点</h2></div><Badge variant="secondary">{lesson.concepts.length}个核心概念</Badge></div>
                    <div className="concept-grid">
                      {lesson.concepts.map((concept, index) => (
                        <article key={concept.name}>
                          <span>0{index + 1}</span><h3>{concept.name}</h3><p>{concept.detail}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                  <section className="self-study-callout">
                    <BrainCircuit />
                    <div><strong>不要马上点下一页</strong><p>合上提示，用自己的话回答本课探究问题；能说出“因为……所以……”才算真正理解。</p></div>
                    <Button onClick={() => setTab("textbook")}>对照教材原页 <ArrowRight /></Button>
                  </section>
                </TabsContent>
                <TabsContent value="textbook" className="tab-panel"><TextbookReader key={lesson.id} lesson={lesson} /></TabsContent>
                <TabsContent value="example" className="tab-panel"><ExampleWorkshop key={lesson.id} lesson={lesson} /></TabsContent>
                <TabsContent value="practice" className="tab-panel">
                  <PracticeLab key={lesson.id} lesson={lesson} wrongLessons={wrongLessons} setWrongLessons={setWrongLessons} />
                </TabsContent>
                <TabsContent value="review" className="tab-panel">
                  <StudentReview lesson={lesson} completed={completed} setCompleted={setCompleted} wrongLessons={wrongLessons} notes={notes} setNotes={setNotes} />
                </TabsContent>
              </>
            ) : (
              <>
                <TabsContent value="design" className="tab-panel"><TeacherDesign lesson={lesson} /></TabsContent>
                <TabsContent value="flow" className="tab-panel"><TeacherFlow lesson={lesson} /></TabsContent>
                <TabsContent value="diagnosis" className="tab-panel"><TeacherDiagnosis lesson={lesson} /></TabsContent>
                <TabsContent value="textbook" className="tab-panel"><TextbookReader key={lesson.id} lesson={lesson} /></TabsContent>
              </>
            )}
          </Tabs>

          <footer className="lesson-footer-nav">
            <Button variant="outline" onClick={() => previousLesson && selectLesson(previousLesson.id)} disabled={!previousLesson}>
              <ChevronLeft /> <span><small>上一课</small>{previousLesson?.title ?? "已经是第一课"}</span>
            </Button>
            <div><span>教材原页 · 自主探究 · 分步提示 · 即时诊断</span><small>学习记录仅保存在当前设备浏览器</small></div>
            <Button onClick={() => nextLesson && selectLesson(nextLesson.id)} disabled={!nextLesson}>
              <span><small>下一课</small>{nextLesson?.title ?? "全册已完成"}</span><ChevronRight />
            </Button>
          </footer>
        </section>
      </div>

      {mode === "student" && <TutorSheet key={lesson.id} lesson={lesson} />}
    </main>
  )
}
