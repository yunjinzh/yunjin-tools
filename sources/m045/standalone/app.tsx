import React, { useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import { allLessons, lessonUnit, textbookToPdfPage, units, type Lesson } from "../app/course-data"

declare const __PDF_BASE64__: string

type Mode = "student" | "teacher"

function stored<T>(key: string, initial: T) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : initial
  } catch {
    return initial
  }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* offline private mode */ }
}

function Textbook({ lesson, pdfUrl }: { lesson: Lesson; pdfUrl: string }) {
  const [page, setPage] = useState(lesson.pages[0])
  return (
    <div className="offline-reader">
      <aside>
        <span className="label">交互排版解读</span>
        <h2>{lesson.title}</h2>
        <p>教材第 {lesson.pages[0]}—{lesson.pages[1]} 页</p>
        {lesson.concepts.map((item, index) => (
          <article key={item.name}><b>{index + 1}</b><div><strong>{item.name}</strong><p>{item.detail}</p></div></article>
        ))}
        <div className="notice">公式、图形、题目与编排以右侧教材原页为准确依据。</div>
        <div className="page-nav">
          <button disabled={page <= lesson.pages[0]} onClick={() => setPage(page - 1)}>← 上一页</button>
          <b>P{page}</b>
          <button disabled={page >= lesson.pages[1]} onClick={() => setPage(page + 1)}>下一页 →</button>
        </div>
      </aside>
      <section className="offline-pdf">
        <header>教材原页 · PDF第{textbookToPdfPage(page)}页</header>
        {pdfUrl ? <iframe title="教材原页" src={`${pdfUrl}#page=${textbookToPdfPage(page)}&zoom=page-width&toolbar=1`} /> : <div className="loading">正在装载教材原页……</div>}
      </section>
    </div>
  )
}

function Example({ lesson }: { lesson: Lesson }) {
  const [count, setCount] = useState(0)
  return (
    <div className="two-col">
      <section className="card problem">
        <span className="label">今天的例题</span>
        <h2>{lesson.example.problem}</h2>
        <p>先独立想30秒，再逐步打开提示。先估结果、圈条件、找关系，不让答案抢走思考。</p>
        <div className="notice">动笔前先问：已知什么？求什么？单位是什么？结果大约是多少？</div>
      </section>
      <section className="card">
        <div className="step-title"><b>分步推理</b><span>{count}/{lesson.example.steps.length}</span></div>
        {lesson.example.steps.map((step, index) => (
          <div className={`step ${index < count ? "shown" : ""}`} key={step}><b>{index < count ? "✓" : index + 1}</b><p>{index < count ? step : index === count ? "下一条线索等待你主动开启" : "先完成前一步"}</p></div>
        ))}
        {count === lesson.example.steps.length && <div className="answer"><strong>{lesson.example.answer}</strong><p>验一验：{lesson.example.check}</p></div>}
        <div className="actions"><button className="secondary" disabled={!count} onClick={() => setCount(Math.max(0, count - 1))}>收回一步</button><button disabled={count === lesson.example.steps.length} onClick={() => setCount(Math.min(lesson.example.steps.length, count + 1))}>给我一步提示</button></div>
      </section>
    </div>
  )
}

function Practice({ lesson, markWrong }: { lesson: Lesson; markWrong: () => void }) {
  const [choice, setChoice] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = choice === lesson.quiz.answer
  function check() { if (choice !== null) { setChecked(true); if (!correct) markWrong() } }
  return (
    <div className="two-col practice">
      <section className="card">
        <span className="pill">即时诊断 · 先作答再看解析</span>
        <h2>{lesson.quiz.question}</h2>
        <div className="choices">
          {lesson.quiz.options.map((item, index) => <button key={item} onClick={() => { setChoice(index); setChecked(false) }} className={`${choice === index ? "selected" : ""} ${checked && index === lesson.quiz.answer ? "right" : ""} ${checked && choice === index && !correct ? "bad" : ""}`}><b>{String.fromCharCode(65 + index)}</b>{item}</button>)}
        </div>
        {choice === null && <p className="hint">提示：{lesson.quiz.hint}</p>}
        <button disabled={choice === null || checked} onClick={check}>检查答案</button>
        {checked && <div className={`feedback ${correct ? "ok" : "no"}`}><strong>{correct ? "回答正确！" : "先定位错因，再改答案。"}</strong><p>{lesson.quiz.explanation}</p></div>}
      </section>
      <section className="card transfer">
        <span className="label">迁移练习</span><h2>从会一道，到会一类</h2>
        {lesson.practice.map((item, index) => <p key={item}><b>{index + 1}</b>{item}</p>)}
        <div className="notice">建议：先口述思路 → 再独立书写 → 最后估算或逆运算自检。</div>
      </section>
    </div>
  )
}

function Teacher({ lesson, tab }: { lesson: Lesson; tab: string }) {
  if (tab === "textbook") return null
  if (tab === "flow") {
    const flow = [
      ["情境唤醒", "5分钟", `呈现教材情境，追问：“${lesson.inquiry}”`],
      ["独立探究", "8分钟", "学生圈条件、画图或列式；教师记录不同思路。"],
      ["交流建模", "12分钟", `比较代表方案，聚焦“${lesson.concepts[0]?.name}”背后的依据。`],
      ["变式练习", "10分钟", "使用即时题与迁移任务，落实先估、再算、后验。"],
      ["证据复盘", "5分钟", `完成学习产品：“${lesson.product}”。`],
    ]
    return <div className="card flow">{flow.map(([title, time, text], index) => <article key={title}><b>{index + 1}</b><div><header><strong>{title}</strong><span>{time}</span></header><p>{text}</p></div></article>)}</div>
  }
  if (tab === "diagnosis") return <div className="two-col"><section className="card"><span className="label">问题阶梯</span><h2>从知道走向解释与迁移</h2>{lesson.teacherQuestions.map((q, index) => <article className="teacher-q" key={q}><b>L{index + 1}</b><p>{q}</p></article>)}<article className="teacher-q"><b>L3</b><p>改编一个条件，使答案变化但核心数量关系不变。</p></article></section><aside className="card"><span className="label">出口检测</span><h3>{lesson.quiz.question}</h3><p><strong>答案：</strong>{lesson.quiz.options[lesson.quiz.answer]}</p><p>{lesson.quiz.explanation}</p><hr /><strong>常见错因</strong>{lesson.misconceptions.map(x => <p key={x}>• {x}</p>)}</aside></div>
  return <div className="two-col teacher"><section className="card"><span className="label">本课核心任务</span><h2>{lesson.inquiry}</h2><h3>可观察的学习目标</h3>{lesson.goals.map((goal, index) => <p className="goal" key={goal}><b>{index + 1}</b>{goal}</p>)}<h3>重点与难点</h3><p>{lesson.concepts[0]?.detail}</p><p>难点：让学生能用图、算式或数量关系解释“为什么”，而不只得到答案。</p></section><aside className="card"><h3>课前准备清单</h3><p>✓ 预览教材第{lesson.pages[0]}—{lesson.pages[1]}页</p><p>✓ 准备操作材料或草稿纸</p><p>✓ 预测典型错误并留出讨论空间</p><p>✓ 明确“会”的可观察证据</p><div className="notice">先让学生暴露真实想法，再组织比较。</div></aside></div>
}

function App() {
  const [activeId, setActiveId] = useState(() => stored("math-offline-active", allLessons[0].id))
  const [mode, setMode] = useState<Mode>(() => stored("math-offline-mode", "student"))
  const [tab, setTab] = useState("learn")
  const [completed, setCompleted] = useState<string[]>(() => stored("math-offline-done", []))
  const [wrong, setWrong] = useState<string[]>(() => stored("math-offline-wrong", []))
  const [notes, setNotes] = useState<Record<string, string>>(() => stored("math-offline-notes", {}))
  const [query, setQuery] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")
  const [tutorOpen, setTutorOpen] = useState(false)
  const [tutorText, setTutorText] = useState("")

  const lesson = allLessons.find(x => x.id === activeId) ?? allLessons[0]
  const unit = lessonUnit(lesson)
  const index = allLessons.findIndex(x => x.id === lesson.id)
  const visibleUnits = useMemo(() => units.map(u => ({ ...u, lessons: u.lessons.filter(l => `${u.title}${l.title}`.includes(query.trim())) })).filter(u => u.lessons.length), [query])

  useEffect(() => {
    const binary = atob(__PDF_BASE64__)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }))
    queueMicrotask(() => setPdfUrl(url))
    return () => URL.revokeObjectURL(url)
  }, [])

  function select(id: string) { setActiveId(id); save("math-offline-active", id); setTab(mode === "student" ? "learn" : "design"); window.scrollTo(0, 0) }
  function changeMode(next: Mode) { setMode(next); save("math-offline-mode", next); setTab(next === "student" ? "learn" : "design") }
  function toggleDone() { const next = completed.includes(lesson.id) ? completed.filter(x => x !== lesson.id) : [...completed, lesson.id]; setCompleted(next); save("math-offline-done", next) }
  function markWrong() { if (!wrong.includes(lesson.id)) { const next = [...wrong, lesson.id]; setWrong(next); save("math-offline-wrong", next) } }
  function setNote(text: string) { const next = { ...notes, [lesson.id]: text }; setNotes(next); save("math-offline-notes", next) }

  const studentTabs = [["learn", "自主研学"], ["textbook", "教材原页"], ["example", "例题工坊"], ["practice", "即时检测"], ["review", "学习复盘"]]
  const teacherTabs = [["design", "教学设计"], ["flow", "课堂流程"], ["diagnosis", "学情诊断"], ["textbook", "教材原页"]]
  const tabs = mode === "student" ? studentTabs : teacherTabs

  return <main>
    <header className="top"><div className="logo">÷</div><div className="brand"><small>四年级数学上册</small><strong>AI 自主学习平台 · 离线版</strong></div><div className="mode"><button className={mode === "student" ? "on" : ""} onClick={() => changeMode("student")}>学生模式</button><button className={mode === "teacher" ? "on" : ""} onClick={() => changeMode("teacher")}>教师模式</button></div></header>
    <div className="layout">
      <aside className="sidebar"><section className="progress"><div><span>全册进度</span><b>{completed.length}/{allLessons.length}</b></div><i><em style={{ width: `${completed.length / allLessons.length * 100}%` }} /></i><small>学习记录保存在本设备</small></section><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索课时或知识点" />
        <nav>{visibleUnits.map(u => <section key={u.id}><header><i style={{ background: u.color }} /><div><b>{u.number} · {u.title}</b><small>教材第{u.startPage}页起</small></div></header>{u.lessons.map((l, n) => <button key={l.id} className={l.id === lesson.id ? "active" : ""} onClick={() => select(l.id)}><b>{completed.includes(l.id) ? "✓" : n + 1}</b><span>{l.title}</span><small>P{l.pages[0]}</small></button>)}</section>)}</nav>
      </aside>
      <section className="workspace">
        <header className="hero" style={{ background: unit.color }}><small>{unit.number} · {unit.title} / 第{unit.lessons.findIndex(x => x.id === lesson.id) + 1}课</small><div><span><i>{lesson.tag}</i><i>教材P{lesson.pages[0]}—{lesson.pages[1]}</i><h1>{lesson.title}</h1><p>{lesson.inquiry}</p></span><b>{index + 1}<small> / {allLessons.length}课</small></b></div>{mode === "student" && <footer>{["看情境", "提问题", "找关系", "列算式", "说算理", "验结果"].map((x, i) => <span key={x}><b>{i + 1}</b>{x}</span>)}</footer>}</header>
        <nav className="tabs">{tabs.map(([id, label]) => <button className={tab === id ? "active" : ""} key={id} onClick={() => setTab(id)}>{label}</button>)}</nav>
        <section className="content">
          {mode === "student" && tab === "learn" && <><div className="two-col learn"><section className="card mission"><span className="label">本课探究任务</span><h2>{lesson.inquiry}</h2><p>先写下猜想，学完后再修正。</p></section><section className="card"><span className="label">学会的证据</span>{lesson.goals.map((x, i) => <p className="goal" key={x}><b>{i + 1}</b>{x}</p>)}</section></div><section className="card concepts"><header><span className="label">本课知识支点</span><b>{lesson.concepts.length}个核心概念</b></header><div>{lesson.concepts.map((x, i) => <article key={x.name}><b>0{i + 1}</b><h3>{x.name}</h3><p>{x.detail}</p></article>)}</div></section><div className="callout"><b>不要马上点下一页</b><p>用自己的话回答探究问题，能说出“因为……所以……”才算真正理解。</p><button onClick={() => setTab("textbook")}>对照教材原页 →</button></div></>}
          {tab === "textbook" && <Textbook key={lesson.id} lesson={lesson} pdfUrl={pdfUrl} />}
          {mode === "student" && tab === "example" && <Example key={lesson.id} lesson={lesson} />}
          {mode === "student" && tab === "practice" && <Practice key={lesson.id} lesson={lesson} markWrong={markWrong} />}
          {mode === "student" && tab === "review" && <div className="two-col"><section className="card"><span className="label">我的学习证据</span><h2>{lesson.product}</h2><textarea value={notes[lesson.id] ?? ""} onChange={e => setNote(e.target.value)} placeholder="我先……因为……我用……检验。下次遇到……我会……" /><button onClick={toggleDone}>{completed.includes(lesson.id) ? "✓ 已完成本课 · 点击可撤销" : "★ 完成学—练—省，点亮本课"}</button></section><aside className={`card wrongbook ${wrong.includes(lesson.id) ? "has" : ""}`}><span className="label">错题复盘</span><h2>{wrong.includes(lesson.id) ? "这道题值得再学一次" : "本课暂无错题记录"}</h2>{wrong.includes(lesson.id) ? <><p>{lesson.quiz.question}</p><ol><li>错在概念、审题、方法还是计算？</li><li>{lesson.quiz.explanation}</li><li>明天再做一道变式。</li></ol></> : <p>尝试给家人讲清例题；讲不清的地方就是复习入口。</p>}<hr /><strong>常见易错点</strong>{lesson.misconceptions.map(x => <p key={x}>• {x}</p>)}</aside></div>}
          {mode === "teacher" && tab !== "textbook" && <Teacher lesson={lesson} tab={tab} />}
        </section>
        <footer className="lesson-nav"><button disabled={!allLessons[index - 1]} onClick={() => allLessons[index - 1] && select(allLessons[index - 1].id)}>← 上一课</button><span>教材原页 · 自主探究 · 分步提示 · 即时诊断</span><button disabled={!allLessons[index + 1]} onClick={() => allLessons[index + 1] && select(allLessons[index + 1].id)}>下一课 →</button></footer>
      </section>
    </div>
    {mode === "student" && <><button className="tutor-button" onClick={() => setTutorOpen(true)}>✦ 问“小数”</button>{tutorOpen && <div className="drawer"><header><b>“小数”启发式助教</b><button onClick={() => setTutorOpen(false)}>×</button></header><p>当前课时：{lesson.title}</p><div className="bubble">先告诉我：你已经知道哪些条件，要求什么？我会先给线索，不直接报答案。</div>{tutorText && <><div className="bubble me">{tutorText}</div><div className="bubble">把任务缩小：只做第一步——{lesson.example.steps[0]}。完成后，用“{lesson.example.check}”检验。</div></>}<div className="tutor-input"><textarea value={tutorText} onChange={e => setTutorText(e.target.value)} placeholder="写下你卡住的地方……" /><button onClick={() => setTutorText(tutorText.trim())}>获得提示</button></div><small>本地启发式助教不上传学习内容，离线也可使用。</small></div>}</>}
  </main>
}

createRoot(document.getElementById("root")!).render(<App />)
