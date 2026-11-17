import {
  courses,
  tasks,
  components,
  tools,
  safetySteps,
  byCourse,
  byTask,
  modeName,
  rubric,
} from "./data.js";
import {
  makeSession,
  operate,
  submit,
  score,
  nextStep,
  finalScore,
  finalPassed,
  reviewRecord,
} from "./engine.js";
import {
  readStore,
  persist,
  parseBackup,
  createClass,
  createAssignment,
  recordsCSV,
} from "./store.js";
import { mountScene } from "./scene.js";
import {
  workshopLobby,
  assemblyPanel,
  measurementPanel,
} from "./workshop-ui.js";
import { mechanicalHint } from "./mechanics.js";

const paths = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  book: "M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3V4Zm9 3a3 3 0 0 1 3-3h5v15h-5a4 4 0 0 0-3 2",
  cube: "m12 3 9 5v8l-9 5-9-5V8Zm0 0v10m9-5-9 5-9-5m9 5v8",
  exam: "M9 4H5v17h14V4h-4M9 2h6v4H9Zm-1 9 2 2 5-5m-7 9h7",
  chart: "M4 3v18h17M8 16v-4m5 4V7m5 9v-7",
  users:
    "M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3m18 0v-3a4 4 0 0 0-3-4M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-8a4 4 0 0 1 0 8",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  check: "m5 12 4 4 10-10",
  plus: "M12 4v16M4 12h16",
  close: "m6 6 12 12M6 18 18 6",
  clock: "M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  shield: "m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5Zm-4 9 3 3 5-6",
  battery: "M3 7h17v10H3Zm17 3h2v4h-2M8 10v4m-2-2h4m4 0h3",
  motor: "M3 8h14v10H3Zm14 3h4v4h-4M6 5h7M9 5v3M1 11v4m4-4h7v4H5Z",
  car: "m4 9 2-5h12l2 5m-17 8V9h18v8ZM5 17v3m14-3v3M5 12h2m10 0h2",
  scan: "M3 7V3h4m10 0h4v4M3 17v4h4m10 0h4v-4M7 9h10v7H7Zm3 3h4",
  meter: "M6 2h12v20H6Zm2 3h8v5H8Zm4 8v5m-2-3h4",
  temp: "M10 14V4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0Zm2-6v9",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  expand:
    "m8 3-5 5m0-5v5h5m8-5 5 5m0-5v5h-5M8 21l-5-5m0 5v-5h5m8 5 5-5m0 5v-5h-5",
  download: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",
  info: "M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  save: "m4 3 14 0 3 3v15H3V3Zm3 0v6h10V3M7 21v-8h10v8",
  wrench: "m14 6 4-4a6 6 0 0 1-7 8L3 18l3 3 8-8a6 6 0 0 0 8-7l-4 4Z",
  layers: "m12 3 10 5-10 5L2 8Zm-9 10 9 5 9-5m-18 5 9 5 9-5",
  flag: "M5 22V3m0 1c5-4 9 4 15 0v11c-6 4-10-4-15 0",
  refresh: "M20 8a8 8 0 1 0 0 8M20 3v5h-5",
  file: "M5 2h9l5 5v15H5Zm9 0v6h5M8 12h8m-8 4h8",
  play: "m8 4 12 8-12 8Z",
  logout: "M9 4H3v16h6m3-8h10m-4-4 4 4-4 4",
  chevron: "m9 5 7 7-7 7",
  menu: "M4 6h16M4 12h16M4 18h16",
};
const icon = (n, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n] ?? paths.cube}"/></svg>`;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
const fmtDate = (t) =>
  new Date(t).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
const timeLeft = (t) => {
  let s = Math.max(0, Math.ceil(t / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
let db = readStore();
const ui = {
  view: db.current ? "lab" : "workshop",
  mechanicTool: "lift",
  sceneMode: "observe",
  probeLead: "red",
  thermal: false,
  clip: false,
  immersive: false,
  course: "all",
  panel: "safety",
  tool: "scanner",
  point: "",
  selected: "battery",
  exploded: false,
  shell: true,
  samples: false,
  filter: "all",
  recordMode: "all",
  teacherCourse: "all",
  teacherMode: "all",
  modal: null,
};
let scenes = [],
  toastTimer,
  lastActivity = Date.now(),
  lastTick = Date.now(),
  modalReturn = null;
const app = document.getElementById("app"),
  modalRoot = document.getElementById("modal-root");
function save() {
  try {
    persist(db);
    return true;
  } catch {
    toast("浏览器存储空间不足，请导出备份后再继续。", "error");
    return false;
  }
}
function toast(message, type = "ok") {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = ""), 4200);
}
const button = (label, action, extra = "", kind = "primary") =>
  `<button class="btn ${kind}" data-action="${action}" ${extra}>${label}</button>`;
const coursePill = (id) => {
  const c = byCourse(id);
  return `<span class="pill" style="--accent:${c.color}"><i></i>${c.name}</span>`;
};
const lessonCount = (c) =>
  c.lessons.filter((x) => db.learning[x.id]).length;
const progress = (c) =>
  Math.round((lessonCount(c) / c.lessons.length) * 100);
function disposeScenes() {
  scenes.forEach((s) => s.dispose());
  scenes = [];
}
function scene(host, hero = false) {
  if (host) {
    const controller = mountScene(host, {
      hero,
      selected: ui.selected,
      onSelect: (id) => {
        ui.selected = id;
        scenes.forEach((c) => c.select(id));
        const c = components.find((x) => x.id === id),
          el = document.getElementById("component-info");
        if (c && el) el.innerHTML = componentInfo(c);
        if (ui.view === "lab")
          operateAndSave("inspect", { component: id }, false);
      },
      onInteract: spatialInteract,
    });
    scenes.push(controller);
    if (ui.view === "lab") {
      controller.sync?.(db.current, ui);
      if (ui.clip) controller.cut?.(2.2);
    }
  }
}
function spatialInteract(data) {
  if (!db.current || ui.view !== "lab") return;
  if (data.kind === "terminal") {
    const lead = ui.probeLead ?? "red";
    const r = operateAndSave("connect-probe", {
      point: ui.point,
      lead,
      terminal: data.terminal,
    });
    if (r?.ok) ui.probeLead = lead === "red" ? "black" : null;
    updateLab();
  } else if (data.kind === "mechanical") {
    operateAndSave("mechanical", {
      target: data.target,
      tool: ui.mechanicTool,
    });
    updateLab();
  }
}
function syncStage() {
  scenes.forEach((c) =>
    c.sync?.(ui.view === "lab" ? db.current : null, ui),
  );
  const s = db.current,
    el = document.getElementById("spatial-status");
  if (s && el)
    el.innerHTML = `<span>${s.state.energized ? "已模拟复电" : s.state.isolate ? "已模拟隔离" : "初始教学状态"}</span><b>${s.mechanics ? { removing: "拆卸阶段", removed: "离车检查", installing: "回装阶段", closed: "回装完成" }[s.mechanics.phase] : s.state.verified ? "修复验证通过" : "任务进行中"}</b>`;
  const feedback = document.getElementById("spatial-feedback");
  if (s && feedback)
    feedback.textContent =
      s.logs.at(-1)?.reason ?? "选择工具后，点击三维对象实施操作。";
}
function studioView() {
  return workshopLobby({ icon, button });
}

const nav = [
  ["workshop", "cube", "三维实训工坊"],
  ["overview", "home", "学习总览"],
  ["courses", "book", "技能课程"],
  ["training", "cube", "虚拟实训"],
  ["exams", "exam", "考核中心"],
  ["archive", "chart", "学习档案"],
];
function render() {
  disposeScenes();
  app.classList.toggle(
    "spatial-immersive",
    ui.immersive && ui.view === "lab",
  );
  const title = {
    workshop: "三维实训工坊",
    overview: "学习总览",
    courses: "技能课程",
    training: "虚拟实训",
    lab: "三维实训工位",
    exams: "考核中心",
    archive: "学习档案",
    teacher: "教师工作台",
  }[ui.view];
  app.innerHTML = `<aside class="sidebar"><a class="brand" aria-label="新能源汽车虚拟仿真维修平台学习总览" href="#" data-action="nav" data-view="overview"><span class="brand-symbol">${icon("play")}</span><span class="brand-name">新能源汽车<br>虚拟仿真维修平台<small>EV VIRTUAL SERVICE LAB</small></span></a><div class="sidebar-caption">学习与实践</div><nav aria-label="主导航">${nav.map(([id, ic, label]) => `<button class="nav-item ${ui.view === id || (id === "training" && ui.view === "lab") ? "active" : ""}" data-action="nav" data-view="${id}" aria-label="${label}" ${ui.view === id ? 'aria-current="page"' : ""}>${icon(ic)}<span>${label}</span>${id === "training" ? '<span class="nav-count">09</span>' : ""}</button>`).join("")}</nav><div class="sidebar-caption second">教学工作</div><button class="nav-item ${ui.view === "teacher" ? "active" : ""}" data-action="teacher" aria-label="教师工作台">${icon("users")}<span>教师工作台</span></button><div class="sidebar-bottom"><div class="local-card"><span class="status-dot"></span><span>教学验证版<small>记录自动保存在本浏览器</small></span><button class="icon-btn" data-action="about" aria-label="了解版本范围">${icon("info")}</button></div><button class="profile" data-action="role"><span class="avatar">${db.role === "teacher" ? "教" : "学"}</span><span>${db.role === "teacher" ? "教师体验身份" : "学生体验身份"}<small>本地角色切换</small></span>${icon("refresh")}</button></div></aside><div class="main-shell"><header class="topbar"><button class="icon-btn mobile-menu" data-action="menu" aria-label="展开导航">${icon("menu")}</button><span class="breadcrumb">新能源教学空间 <span>/</span> <strong>${title}</strong></span><div class="top-actions"><span class="local-badge">${db.role === "teacher" ? "教师视角" : "学生视角"}</span><button class="icon-btn" data-action="backup" aria-label="下载完整数据备份">${icon("save")}</button><button class="icon-btn" data-action="about" aria-label="帮助与平台说明">${icon("info")}</button></div></header><main id="main" class="page ${ui.view === "lab" ? "lab-page" : ""}" tabindex="-1">${db.current && ui.view !== "lab" ? `<div class="resume-banner">${icon("clock")}<span>有一项${modeName[db.current.mode]}尚未提交：${esc(db.current.task.title)}${db.current.mode === "exam" ? " · 考核持续计时" : ""}</span><button data-action="resume">继续任务 ${icon("arrow")}</button></div>` : ""}${{ workshop: studioView, overview: overview, courses: courseView, training: trainingView, lab: labView, exams: examView, archive: archiveView, teacher: teacherView }[ui.view]()}</main><footer class="site-footer"><span>新能源汽车虚拟仿真维修平台</span><button data-action="about">教学仿真数据 <span>·</span> EDU-2026.1</button></footer></div>`;
  if (ui.view === "workshop")
    scene(document.getElementById("workshop-scene"));
  if (ui.view === "overview")
    scene(document.getElementById("hero-scene"), true);
  if (ui.view === "lab" && db.current) {
    scene(document.getElementById("lab-scene"));
    scenes.forEach((s) => {
      s.select(ui.selected);
      s.explode(ui.exploded);
      s.shell(ui.shell);
    });
    syncStage();
    updateClock();
  }
}
function heading(kicker, title, desc, action = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
}
function overview() {
  const done = Object.keys(db.learning).filter((k) =>
    courses.some((c) => c.lessons.some((l) => l.id === k)),
  ).length;
  const exam = db.records.filter((r) => r.mode === "exam");
  return `${heading("LEARN. PRACTICE. PROVE.", "学习从这里发生", "理解每一个系统，练好每一次诊断。", `<span class="date-label">${new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>`)}<section class="hero"><div id="hero-scene" class="hero-scene"></div><div class="hero-copy"><span class="eyebrow"><span class="status-dot"></span> 新能源虚拟维修实训</span><h2>从理解原理，<br/>到独立维修<span>。</span></h2><p>在可重复的虚拟工位中，<br/>建立有依据的诊断与维修能力。</p><div class="hero-actions">${button("进入实训工位 " + icon("arrow"), "brief", 'data-task="HV01"')}${button("探索课程", "nav", 'data-view="courses"', "text")}</div><div class="hero-footnote">EDU EV 教学结构 <span>01 / 04</span></div></div><span class="scene-stamp">ELECTRIC VEHICLE<br/><b>SYSTEM EXPLORER</b><small>可拖拽旋转 · 点击部件</small></span></section><section class="stats-row" aria-label="我的学习统计">${stat("知识单元", done, "/ 12", "book", "已完成学习")}${stat("实训任务", db.records.length, "次", "cube", "已提交记录")}${stat("有效活动", Math.floor(db.activeSeconds / 60), "分钟", "clock", "前台操作口径")}${stat("考核最佳", exam.length ? Math.max(...exam.map(finalScore)) : "—", "分", "exam", exam.length ? "已完成 " + exam.length + " 次考核" : "完成考核后生成")}</section><div class="section-heading"><div><span class="eyebrow">YOUR LEARNING PATH</span><h2>四个领域，一条成长路径</h2></div><button class="link-btn" data-action="nav" data-view="courses">全部课程 ${icon("arrow")}</button></div><div class="course-grid">${courses.map((c, i) => courseCard(c, i)).join("")}</div><div class="bottom-grid"><section class="surface"><div class="section-heading small"><h2>下一项实践</h2><span class="muted">以任务检验理解</span></div>${tasks
    .slice(0, 3)
    .map((t) => taskRow(t))
    .join(
      "",
    )}</section><section class="surface capability"><div class="section-heading small"><h2>能力成长</h2><span class="muted">按实际任务计算</span></div>${abilityBars(db.records)}${!db.records.length ? '<p class="empty-note">完成首项训练后，生成你的能力分布。</p>' : ""}</section></div>${assignmentSection()}`;
}
const stat = (label, value, unit, ic, desc) =>
  `<div class="stat"><div class="stat-top"><span>${label}</span>${icon(ic)}</div><div class="stat-value">${value}<small>${unit}</small></div><span class="stat-desc">${desc}</span></div>`;
function courseCard(c, i) {
  return `<button class="course-card" data-action="course" data-course="${c.id}" style="--accent:${c.color}"><div class="course-card-top"><span class="course-number">0${i + 1}</span><span class="course-mark">${icon(c.icon)}</span></div><span class="course-code">${c.en}</span><h3>${c.name}</h3><p>${c.desc}</p><div class="course-meta"><span>3 个知识单元 · ${tasks.filter((t) => t.course === c.id).length} 项实训</span>${icon("arrow")}</div><div class="progress-track"><i style="width:${progress(c)}%"></i></div><div class="course-progress"><span>学习进度</span><b>${progress(c)}%</b></div></button>`;
}
function taskRow(t) {
  return `<button class="task-row" data-action="brief" data-task="${t.id}"><span class="task-index">${t.id}</span><span><strong>${t.title}</strong><small>${byCourse(t.course).name} · 约 ${t.minutes} 分钟</small></span><span class="task-arrow">${icon("arrow")}</span></button>`;
}
function abilityBars(records) {
  records = records.filter((r) => !r.mechanics);
  const means = rubric.max.map((n, i) =>
    records.length
      ? Math.round(
          records.reduce((a, r) => a + (r.result.parts[i] / n) * 100, 0) /
            records.length,
        )
      : 0,
  );
  return `<small class="ability-caption">诊断类任务统计 · 拆装专项见独立工单</small><div class="ability-bars">${rubric.labels.map((label, i) => `<div class="ability-line"><span>${label}</span><div><i style="width:${means[i]}%"></i></div><b>${records.length ? means[i] + "%" : "—"}</b></div>`).join("")}</div>`;
}
function courseView() {
  const c = byCourse(ui.course);
  return `${heading("SKILLS & KNOWLEDGE", "技能课程", "先建立系统认知，再把知识用在真实的任务逻辑中。")}<div class="filter-row"><button class="filter ${!c ? "active" : ""}" data-action="course" data-course="all">全部课程</button>${courses.map((x) => `<button class="filter ${x.id === c?.id ? "active" : ""}" data-action="course" data-course="${x.id}">${x.name}</button>`).join("")}</div>${
    !c
      ? `<div class="course-grid">${courses.map(courseCard).join("")}</div><section class="surface learning-note"><span class="large-outline">${icon("book")}</span><div><h2>从结构、原理到诊断证据</h2><p>每个领域包含三个知识单元、一次自测和配套实践。课程进度与实训成绩分别记录。</p></div></section>`
      : `<section class="course-detail" style="--accent:${c.color}"><div class="course-detail-summary"><span class="course-mark">${icon(c.icon)}</span><span class="eyebrow">${c.en}</span><h2>${c.name}</h2><p>${c.desc}</p><div class="tags">${c.skills.map((s) => `<span>${s}</span>`).join("")}</div><div class="progress-track"><i style="width:${progress(c)}%"></i></div><small>${lessonCount(c)} / 3 单元已完成 · 自测最佳 ${db.quizzes[c.id]?.best ?? "—"} 分</small>${button("开始课程自测 " + icon("arrow"), "quiz", `data-course="${c.id}"`, "secondary")}</div><div class="lesson-list">${c.lessons.map((l, i) => `<button class="lesson-row" data-action="lesson" data-course="${c.id}" data-lesson="${l.id}"><span class="lesson-num ${db.learning[l.id] ? "done" : ""}">${db.learning[l.id] ? icon("check") : "0" + (i + 1)}</span><span><small>${l.tag} · 知识单元</small><h3>${l.title}</h3><p>${l.key}</p></span>${icon("chevron")}</button>`).join("")}</div></section><div class="section-heading"><h2>配套实践</h2><span class="muted">在工位里验证你的理解</span></div><div class="task-grid">${tasks
          .filter((t) => t.course === c.id)
          .map(taskCard)
          .join("")}</div>`
  }`;
}
function taskCard(t) {
  const n = db.records.filter((r) => r.task.id === t.id).length;
  return `<article class="task-card"><div class="task-card-top">${coursePill(t.course)}<span class="mono">${t.id}</span></div><h3>${t.title}</h3><p>${t.symptom}</p><div class="task-skills">${icon("clock")} ${t.minutes} 分钟 <span>·</span> ${t.difficulty} <span>·</span> ${n ? n + " 次记录" : "待开始"}</div><div class="task-card-actions">${button("开始训练 " + icon("arrow"), "brief", `data-task="${t.id}"`, "secondary")}<button class="link-btn" data-action="brief" data-task="${t.id}" data-mode="practice">独立实训</button></div></article>`;
}
function trainingView() {
  return `${heading("VIRTUAL WORKSHOP", "在工位里，练出判断力", "选择任务，采集证据，再用修复验证你的诊断。", button(icon("eye") + " 平台说明", "about", "", "secondary"))}<div class="training-banner"><span class="large-outline">${icon("cube")}</span><div><h2>观察结构，也训练完整维修过程</h2><p>九项任务 · 三维拆装与表笔测量 · 四类仪表 · 自主选择诊断路径 · 全过程证据记录</p></div><span class="pill neutral">教学仿真数据</span></div><div class="filter-row"><button class="filter ${ui.course === "all" ? "active" : ""}" data-action="filter" data-course="all">全部任务 <small>09</small></button>${courses.map((c) => `<button class="filter ${ui.course === c.id ? "active" : ""}" data-action="filter" data-course="${c.id}">${c.name}</button>`).join("")}</div><div class="task-grid">${tasks
    .filter((t) => ui.course === "all" || t.course === ui.course)
    .map(taskCard)
    .join("")}</div>`;
}
function examView() {
  return `${heading("ASSESSMENT CENTER", "让能力，有据可评", "独立完成任务，用安全规范、测量证据和修复结果检验能力。")}<section class="exam-intro"><div><span class="eyebrow">PROCESS-BASED ASSESSMENT</span><h2>考结果，也看过程。</h2><p>范围内随机抽取一个任务，评分版本与截止时间在开考时锁定。<br/>考核隐藏操作提示，安全门槛独立判定。</p></div><div class="score-ring"><b>100<small>总分</small></b><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="51"/></svg></div></section><div class="rubric-strip">${rubric.labels.map((l, i) => `<div><b>${rubric.max[i]}<small>分</small></b><span>${l}</span></div>`).join("")}</div><div class="exam-grid">${courses.map((c, i) => `<article class="exam-card" style="--accent:${c.color}"><div class="exam-code">0${i + 1}<span>专项考核</span></div><h3>${c.name}</h3><p>诊断专项 2 选 1 随机任务<br/>限时 20 分钟 · 80 分通过</p><div class="tags"><span>独立操作</span><span>关键安全门槛</span></div>${button("查看规则并开考 " + icon("arrow"), "exam-brief", `data-course="${c.id}"`, "secondary")}</article>`).join("")}</div>${assignmentSection()}<div class="section-heading"><h2>最近考核</h2><button class="link-btn" data-action="nav" data-view="archive">全部记录 ${icon("arrow")}</button></div>${recordsTable(
    db.records
      .filter((r) => r.mode === "exam")
      .slice(-5)
      .reverse(),
  )}`;
}
function assignmentSection() {
  if (!db.assignments.length) return "";
  return `<section class="assignment-section"><div class="section-heading"><h2>教师布置</h2><span class="muted">本浏览器教学班任务</span></div><div class="assignment-grid">${db.assignments
    .slice()
    .reverse()
    .map((a) => {
      const cls = db.classes.find((c) => c.id === a.classId),
        expired = a.deadline < Date.now();
      return `<article class="assignment-card"><div><span class="pill ${expired ? "neutral" : ""}">${expired ? "已截止" : modeName[a.mode]}</span><small>${esc(cls?.name ?? "教学班")}</small></div><h3>${esc(a.title)}</h3><p>${a.course === "all" ? "四课程综合范围" : (byCourse(a.course)?.name ?? "课程")} · ${a.minutes} 分钟 · ${a.pass} 分通过</p><div><small>截止 ${fmtDate(a.deadline)}</small>${button("进入任务", "assignment", `data-id="${a.id}" ${expired ? "disabled" : ""}`, "text")}</div></article>`;
    })
    .join("")}</div></section>`;
}
function recordsTable(records, { teacher = false, sample = false } = {}) {
  return records.length
    ? `<div class="table-wrap"><table class="records-table"><thead><tr><th>任务与模式</th><th>提交时间</th><th>成绩</th><th>状态</th><th>过程记录</th></tr></thead><tbody>${records.map((r) => `<tr><td><strong>${esc(r.task.title)}</strong><small>${modeName[r.mode]} ${sample ? "· 示例记录" : ""}</small></td><td>${fmtDate(r.endAt)}</td><td><strong class="score-number">${finalScore(r)}</strong><small>${r.review ? "原始 " + r.result.total + " 分 · 已复核" : "原始评分"}</small></td><td><span class="result-pill ${finalPassed(r) ? "pass" : "pending"}">${finalPassed(r) ? "通过" : r.result.safetyPass ? "待补练" : "安全未通过"}</span></td><td><button class="link-btn" data-action="record" data-id="${r.id}" ${sample ? 'data-sample="true"' : ""}>查看证据 ${icon("arrow")}</button></td></tr>`).join("")}</tbody></table></div>`
    : `<div class="empty-state">${icon("file")}<h3>还没有提交记录</h3><p>完成一项任务后，工单、评分与操作证据会保存在这里。</p>${button("去做一次实训", "nav", 'data-view="training"', "secondary")}</div>`;
}
function archiveView() {
  const records = db.records
    .filter(
      (r) =>
        (ui.filter === "all" || r.task.course === ui.filter) &&
        (ui.recordMode === "all" || r.mode === ui.recordMode),
    )
    .slice()
    .reverse();
  return `${heading("LEARNING PORTFOLIO", "每次进步，都有记录", "查看任务评分、测量证据和教师复核，找到下一次训练的重点。", button(icon("download") + " 导出成绩", "export-csv", "", "secondary"))}<div class="archive-top"><section class="surface"><div class="section-heading small"><h2>过程能力</h2><span class="muted">${db.records.length} 次实际提交</span></div>${abilityBars(db.records)}</section><section class="archive-summary"><span class="eyebrow">KEEP MOVING FORWARD</span><h2>${db.records.length ? "从证据中找到进步。" : "你的第一份工单，\n从一次练习开始。"}</h2><p>原始成绩、复核成绩与安全门槛分别保留。<br/>补练会建立新记录。</p>${button("开始下一次实训 " + icon("arrow"), "nav", 'data-view="training"', "secondary")}</section></div><div class="filter-row"><button class="filter ${ui.filter === "all" ? "active" : ""}" data-action="record-filter" data-course="all">全部记录</button>${courses.map((c) => `<button class="filter ${ui.filter === c.id ? "active" : ""}" data-action="record-filter" data-course="${c.id}">${c.name}</button>`).join("")}</div>${recordFilterBar(false)}${recordsTable(records)}`;
}
let demoRecords = null;
function samples() {
  if (demoRecords) return demoRecords;
  demoRecords = tasks.slice(0, 4).map((t, i) => {
    const s = makeSession(
        t.id,
        "exam",
        {},
        Date.now() - (4 - i) * 86400000,
      ),
      at = s.startAt + 10000;
    ["gear", "barrier", "meter", "shutdown", "isolate"].forEach((a) =>
      operate(s, a, {}, at),
    );
    operate(s, "measure", { point: "hvtest", tool: "volt" }, at);
    t.points
      .filter((p) => p.relevant && p.id !== "hvtest")
      .slice(0, 2)
      .forEach((p) =>
        operate(s, "measure", { point: p.id, tool: p.tool }, at),
      );
    operate(
      s,
      "diagnosis",
      {
        value:
          i === 2 ? t.options.find((x) => x !== t.diagnosis) : t.diagnosis,
      },
      at,
    );
    operate(s, "repair", { repair: t.repairId }, at);
    ["reassemble", "energize", "verify"].forEach((a) =>
      operate(s, a, {}, at),
    );
    s.basis = "示例工单：已对比关联测量并完成修复验证。";
    s.summary = "示例数据，仅用于了解复核界面。";
    submit(s, s.startAt + 720000);
    s.id = "sample-" + i;
    return s;
  });
  return demoRecords;
}
function teacherView() {
  const rs = (ui.samples ? samples() : db.records).filter(
    (r) =>
      (ui.teacherCourse === "all" || r.task.course === ui.teacherCourse) &&
      (ui.teacherMode === "all" || r.mode === ui.teacherMode),
  );
  const mean = rs.length
    ? Math.round(rs.reduce((a, r) => a + finalScore(r), 0) / rs.length)
    : "—";
  return `${heading("TEACHING WORKSPACE", "把教学组织起来", "布置任务、检查诊断证据，并让评价回到每一次操作。", `<span class="pill neutral">本地教学流程体验</span>`)}<div class="teacher-notice">${icon("info")} 当前班级与记录保存在本浏览器。校园部署版本需接入账号、服务端与真实班级成员。</div><div class="stats-row teacher-stats">${stat("教学班级", db.classes.length, "个", "users", "本地已创建")}${stat("已布置任务", db.assignments.length, "项", "flag", "可在学生视角进入")}${stat(ui.samples ? "示例平均分" : "实际平均分", mean, "分", "chart", rs.length + " 次提交")}${stat("安全未通过", rs.filter((r) => !r.result.safetyPass).length, "次", "shield", ui.samples ? "示例数据" : "实际记录")}</div><div class="teacher-grid"><section class="surface"><div class="section-heading small"><h2>班级管理</h2>${icon("users")}</div><div class="class-list">${db.classes.map((c) => `<div><span class="class-avatar">${icon("users")}</span><span><strong>${esc(c.name)}</strong><small>教学人数 ${c.students} 人 · 本地体验</small></span></div>`).join("")}</div><form id="class-form" class="inline-form"><label class="sr-only" for="class-name">班级名称</label><input id="class-name" name="name" maxlength="100" placeholder="新班级名称" required/><label class="sr-only" for="class-students">教学人数</label><input id="class-students" name="students" type="number" min="1" max="1000" value="40" required aria-label="教学人数"/><button class="btn secondary" type="submit">${icon("plus")} 建班</button></form></section><section class="surface"><div class="section-heading small"><h2>发布教学任务</h2><span class="muted">发布即锁定本次配置</span></div><form id="assignment-form" class="assignment-form"><label class="span-2">任务名称<input name="title" placeholder="例如：电池诊断课后独立训练" maxlength="100" required/></label><label>教学班级<select name="classId">${db.classes.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</select></label><label>课程范围<select name="course"><option value="all">四课程综合</option>${courses.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label><label>任务模式<select name="mode"><option value="practice">独立实训</option><option value="guided">引导练习</option><option value="exam">任务考核</option></select></label><label>截止时间<input name="deadline" type="datetime-local" value="${localDateInput(Date.now() + 7 * 86400000)}" required/></label><label>时长 分钟<input name="minutes" type="number" min="1" max="180" value="20" required/></label><label>通过线 分<input name="pass" type="number" min="0" max="100" value="80" required/></label><label class="span-2">指定任务 可选<select name="taskId"><option value="">按课程范围随机抽取</option>${tasks.map((t) => `<option value="${t.id}">${t.id} · ${t.title}</option>`).join("")}</select></label><button class="btn primary span-2" type="submit">发布任务 ${icon("arrow")}</button></form></section></div>${assignmentSection()}<div class="section-heading"><div><h2>成绩与证据复核</h2><p class="muted">${ui.samples ? "示例成绩不计入实际学习档案" : "实际提交记录，可查看原始评分并填写复核理由"}</p></div><div class="segmented"><button class="${!ui.samples ? "active" : ""}" data-action="sample-toggle" data-value="actual">实际记录</button><button class="${ui.samples ? "active" : ""}" data-action="sample-toggle" data-value="sample">示例数据</button></div></div>${ui.samples ? '<div class="sample-notice">示例视图 · 以下记录为界面演示数据，不能保存复核或混入实际统计。</div>' : ""}${recordFilterBar(true)}${recordsTable(rs.slice().reverse(), { teacher: true, sample: ui.samples })}<section class="data-actions surface"><div><h2>教学数据</h2><p>导出完整备份后，可在同版本平台恢复。导入将替换当前浏览器数据。</p></div><div>${button(icon("download") + " 完整备份", "backup", "", "secondary")}${button("导出成绩 CSV", "export-csv", "", "secondary")}<label class="btn text" for="backup-input">恢复备份<input type="file" id="backup-input" accept=".json,application/json" hidden/></label></div></section>`;
}
function recordFilterBar(teacher = false) {
  return `<div class="record-filter-bar">${teacher ? `<label>课程范围<select id="teacher-course"><option value="all">全部课程</option>${courses.map((c) => `<option value="${c.id}" ${ui.teacherCourse === c.id ? "selected" : ""}>${c.name}</option>`).join("")}</select></label>` : ""}<label>任务模式<select id="${teacher ? "teacher-mode" : "archive-mode"}"><option value="all">全部模式</option>${Object.entries(
    modeName,
  )
    .map(
      ([id, label]) =>
        `<option value="${id}" ${(teacher ? ui.teacherMode : ui.recordMode) === id ? "selected" : ""}>${label}</option>`,
    )
    .join(
      "",
    )}</select></label><span>原始分数与安全门槛分别保留</span></div>`;
}
function localDateInput(time) {
  const d = new Date(time);
  return new Date(time - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
function componentInfo(c) {
  return `<div><span class="eyebrow">${c.en}</span><h3>${c.name}</h3><p>${c.desc}</p></div>`;
}
function labView() {
  const s = db.current;
  if (!s) {
    ui.view = "training";
    return trainingView();
  }
  ui.point =
    ui.point && s.task.points.some((p) => p.id === ui.point)
      ? ui.point
      : (s.probes?.point ?? s.task.points[0].id);
  return `<div class="lab-heading"><div><button class="link-btn" data-action="nav" data-view="training">${icon("back")} 任务目录</button><h1>${s.task.title}</h1><div>${coursePill(s.task.course)}<span class="pill neutral">${modeName[s.mode]}</span><span class="mono">${s.task.id} / ${s.task.version}</span></div></div><div class="lab-heading-actions"><div class="lab-clock"><span>${s.mode === "exam" ? "剩余时间" : "任务用时"}</span><strong id="lab-clock">00:00</strong></div>${button(icon("expand"), "immersive", 'aria-label="切换专注工位"', "secondary")}${button("提交工单 " + icon("arrow"), "submit-brief")}</div></div><section class="workbench"><div class="workbench-viewport spatial-viewport"><div id="lab-scene" class="lab-scene"></div><div class="scene-topline"><span><i class="status-dot"></i> EDU EV <small>教学仿真数据</small></span><span class="mono">THREE.JS / 教学模型</span></div><div class="spatial-state" id="spatial-status"></div><div class="mission-card"><span class="eyebrow">WORK ORDER BRIEF</span><h3>故障现象</h3><p>${s.task.symptom}</p><span class="dtc">${esc(s.task.dtc)}</span><div id="next-step" class="next-step">${s.mode === "guided" ? icon("flag") + " 当前建议：" + nextStep(s) : "独立选择诊断路径 · 全过程记录"}</div></div><div class="scene-view-buttons"><button class="icon-btn" data-action="thermal" aria-label="切换ECU温度示例映射" aria-pressed="${ui.thermal}">${icon("temp")}</button><button class="icon-btn" data-action="cutaway" aria-label="切换水平剖切观察" aria-pressed="${ui.clip}">${icon("layers")}</button><button class="icon-btn" data-action="scene-reset" aria-label="重置视角">${icon("refresh")}</button><button class="icon-btn ${ui.exploded ? "active" : ""}" data-action="explode" aria-label="切换结构展开" aria-pressed="${ui.exploded}">${icon("expand")}</button><button class="icon-btn ${ui.shell ? "active" : ""}" data-action="shell" aria-label="切换透明车身" aria-pressed="${ui.shell}">${icon("car")}</button></div><div class="spatial-feedback" id="spatial-feedback" role="status"></div><div class="component-info" id="component-info">${componentInfo(components.find((c) => c.id === ui.selected) ?? components[0])}</div><div class="clip-control" id="clip-control" ${ui.clip ? "" : "hidden"}><label>水平剖切<input id="clip-height" type="range" min="1.25" max="3.5" step="0.05" value="2.2"/></label></div><div class="thermal-legend" id="thermal-legend" ${ui.thermal ? "" : "hidden"}><b>ECU 温度示例映射</b><span>26°C <i></i> ${s.task.id === "DRV01" ? 145 : 67}°C</span><small>表示采样信号，不替代独立测温</small></div><div class="focus-pills"><button data-action="focus" data-value="all">整车</button><button data-action="focus" data-value="battery">电池</button><button data-action="focus" data-value="drive">电驱</button><button data-action="focus" data-value="underbody">底盘</button><button data-action="focus" data-value="top">俯视</button><button data-action="focus" data-value="charge">充配电</button></div><div class="workbench-dock">${[["safety", "shield", "安全准备"], ["measure", "meter", "工具测量"], ...(s.mechanics ? [["assembly", "wrench", "三维拆装"]] : []), ["repair", "wrench", "维修验证"], ["order", "file", "诊断工单"], ["evidence", "layers", "过程证据"], ["objects", "cube", "结构部件"]].map(([id, ic, label]) => `<button class="${ui.panel === id ? "active" : ""}" data-action="lab-panel" data-panel="${id}">${icon(ic)}<span>${label}</span></button>`).join("")}</div></div><div id="lab-progress" class="lab-progress">${labProgress()}</div><div id="lab-panel" class="lab-console">${labPanel()}</div></section><p class="lab-footnote">${icon("info")} 本场景采用教学结构与示例参数。实际维修应使用适用车型资料并由具备资质的人员指导。观察展开不等于安全拆检。</p>`;
}
function labProgress() {
  const s = db.current,
    a = s.state;
  if (s.mechanics)
    return [
      ["安全准备", a.zero],
      ["有效验电", s.measurements.some((m) => m.point === "hvtest")],
      ["电池拆卸", s.mechanics.removed.includes("pack-lower")],
      ["完整回装", s.mechanics.phase === "closed"],
      ["恢复验证", a.verified],
    ]
      .map(
        ([l, ok], i) =>
          `<div class="${ok ? "complete" : ""}"><span>${ok ? icon("check") : i + 1}</span>${l}</div>`,
      )
      .join("");
  const n = new Set(
    s.measurements.filter((m) => m.relevant).map((m) => m.point),
  ).size;
  return [
    ["安全准备", a.zero],
    ["测量证据", n >= s.task.requiredEvidence],
    ["诊断判断", !!s.diagnosis],
    ["正确维修", a.repaired],
    ["修复验证", a.verified],
  ]
    .map(
      ([l, ok], i) =>
        `<div class="${ok ? "complete" : ""}"><span>${ok ? icon("check") : i + 1}</span>${l}</div>`,
    )
    .join("");
}
function labPanel() {
  const s = db.current,
    a = s.state;
  if (ui.panel === "safety")
    return `<div class="console-header"><div><h2>安全作业准备</h2><p>每一步都有记录，验电需要真实选择工具和测点。</p></div><span class="pill ${a.zero ? "" : "neutral"}">${safetySteps.filter((x) => a[x.id]).length} / 6 完成</span></div><div class="safety-grid">${safetySteps.map((x, i) => `<button class="safety-card ${a[x.id] ? "done" : ""}" data-action="${x.id === "zero" ? "goto-zero" : "operate"}" data-operation="${x.id}" ${a[x.id] ? "disabled" : ""}><span>${a[x.id] ? icon("check") : "0" + (i + 1)}</span><strong>${x.name}</strong><small>${x.desc}</small></button>`).join("")}</div>`;
  if (ui.panel === "assembly")
    return assemblyPanel(s, ui, { icon, button });
  if (ui.panel === "measure")
    return measurementPanel(s, ui, { icon, button, esc });
  if (ui.panel === "repair")
    return `<div class="console-header"><div><h2>维修与修复验证</h2><p>依据测量证据选择方案。维修前须完成隔离和验电，复电前须恢复装配。</p></div><span class="pill ${a.verified ? "" : "neutral"}">${a.verified ? "验证通过" : a.repaired ? "已维修，待验证" : "待诊断维修"}</span></div><div class="repair-options">${s.mechanics ? button("返回三维拆装", "lab-panel", 'data-panel="assembly"', "secondary") : s.task.repairs.map(([id, label]) => button(icon("wrench") + " " + label, "repair", `data-repair="${id}"`, "secondary")).join("")}</div><div class="recovery-line">${[
      ["reassemble", "恢复装配", "layers"],
      ["energize", "模拟复电", "play"],
      ["verify", "修复验证", "check"],
    ]
      .map(
        ([id, label, ic], i) =>
          `<button data-action="operate" data-operation="${id}" class="recovery-step ${a[id === "reassemble" ? "reassembled" : id === "energize" ? "energized" : "verified"] ? "done" : ""}"><span>0${i + 1}</span>${icon(ic)}<b>${label}</b></button>`,
      )
      .join('<span class="recovery-arrow">→</span>')}</div>`;
  if (ui.panel === "order")
    return `<div class="console-header"><div><h2>诊断与维修工单</h2><p>判断与文字说明自动保存；教师可对照测量证据复核。</p></div><span class="save-indicator">${icon("check")} 自动保存</span></div><div class="order-grid"><fieldset><legend>${s.mechanics ? "拆装过程" : "诊断结论"}</legend>${s.mechanics ? `<div class="assembly-order-note">拆卸证据 ${s.mechanics.removed.length} 项<br/>回装证据 ${s.mechanics.installed.length} 项<br/>${s.state.verified ? "恢复验证已完成" : "待完成恢复验证"}<p>专项按对象操作证据评分，文字说明供教师复核。</p></div>` : s.task.options.map((o) => `<label class="radio-option"><input type="radio" name="diagnosis" value="${esc(o)}" ${s.diagnosis === o ? "checked" : ""}/><span>${o}</span></label>`).join("")}</fieldset><label>判断依据<textarea id="basis" maxlength="3000" placeholder="引用测量与工况，说明你为什么这样判断。">${esc(s.basis)}</textarea></label><label>维修与验证总结<textarea id="summary" maxlength="3000" placeholder="记录处理方案、修复后数据及验证结论。">${esc(s.summary)}</textarea></label></div>`;
  if (ui.panel === "objects")
    return `<div class="console-header"><div><h2>结构与部件</h2><p>选择部件聚焦观察。展开与透明显示只改变观察方式。</p></div>${s.mode === "guided" ? button("查看任务提示", "hint", "", "text") : ""}</div><div class="object-grid">${components.map((c) => `<button class="object-card ${ui.selected === c.id ? "selected" : ""}" data-action="component" data-component="${c.id}">${icon(c.id === "battery" ? "battery" : c.id === "motor" ? "motor" : "cube")}<strong>${c.name}</strong><small>${c.en}</small></button>`).join("")}</div>`;
  return `<div class="console-header"><div><h2>过程证据</h2><p>${s.measurements.length} 次有效采集 · ${s.logs.length} 条操作 · ${s.risks.length} 类安全风险</p></div>${s.mode === "guided" ? button("任务提示", "hint", "", "text") : ""}</div>${s.risks.length ? `<div class="risk-notice">已记录风险：${s.risks.map(esc).join("；")}${s.mode === "exam" ? "。考试安全门槛未通过。" : ""}</div>` : ""}<div class="evidence-grid"><div>${measurementTable(s.measurements)}</div><div class="log-list">${
    s.logs
      .slice(-15)
      .reverse()
      .map(
        (l) =>
          `<div class="${l.result === "blocked" ? "blocked" : ""}"><time>${new Date(l.time).toLocaleTimeString("zh-CN", { hour12: false })}</time><span>${esc(l.reason)}</span></div>`,
      )
      .join("") || '<p class="muted">操作开始后会在此记录。</p>'
  }</div></div>`;
}
function measurementTable(ms) {
  return ms.length
    ? `<div class="table-wrap compact"><table><thead><tr><th>测点</th><th>读数</th><th>工况</th></tr></thead><tbody>${ms
        .slice(-30)
        .reverse()
        .map(
          (m) =>
            `<tr><td>${esc(m.label)}</td><td class="mono">${esc(m.value)} ${esc(m.unit)}</td><td>${esc(m.condition)}</td></tr>`,
        )
        .join("")}</tbody></table></div>`
    : '<div class="inline-empty">还没有测量证据。选择工具与测点，开始采集。</div>';
}
function updateLab() {
  if (ui.view !== "lab" || !db.current) return;
  syncStage();
  document.getElementById("lab-panel").innerHTML = labPanel();
  document.getElementById("lab-progress").innerHTML = labProgress();
  const el = document.getElementById("next-step");
  el.innerHTML =
    db.current.mode === "guided"
      ? icon("flag") + " 当前建议：" + nextStep(db.current)
      : "独立选择诊断路径 · 全过程记录";
  document.querySelectorAll('[data-action="lab-panel"]').forEach((b) => {
    if (b.closest(".workbench-dock"))
      b.classList.toggle("active", b.dataset.panel === ui.panel);
  });
}
function updateClock() {
  const s = db.current,
    el = document.getElementById("lab-clock");
  if (s && el) {
    el.textContent = timeLeft(
      s.deadline ? s.deadline - Date.now() : Date.now() - s.startAt,
    );
    el.classList.toggle(
      "urgent",
      !!s.deadline && s.deadline - Date.now() < 120000,
    );
  }
}
function operateAndSave(action, payload = {}, showToast = true) {
  if (!db.current) return;
  const s = db.current;
  const r = operate(s, action, payload);
  if (r.expired) {
    finish(true);
    return r;
  }
  save();
  syncStage();
  if (showToast) toast(r.message, r.ok ? "ok" : "error");
  return r;
}
function finish(expired = false) {
  const s = db.current;
  if (!s) return;
  submit(s, Date.now(), expired);
  if (!db.records.some((r) => r.id === s.id)) db.records.push(s);
  db.current = null;
  save();
  ui.view = "archive";
  render();
  showRecord(s);
}
function start(taskId, mode, options = {}) {
  if (db.current) {
    closeModal();
    ui.view = "lab";
    ui.selected = db.current.task.component;
    ui.point = "";
    render();
    toast("已继续当前任务。请先提交当前工单，再开启新任务。");
    return;
  }
  db.current = makeSession(taskId, mode, options);
  ui.view = "lab";
  ui.panel = "safety";
  ui.selected = db.current.task.component;
  ui.tool = "scanner";
  ui.point = "";
  ui.exploded = false;
  ui.thermal = false;
  ui.clip = false;
  ui.probeLead = "red";
  ui.mechanicTool = "lift";
  ui.sceneMode = "observe";
  save();
  closeModal();
  render();
}
function showModal(title, body, footer = "", wide = false) {
  modalReturn = document.activeElement;
  modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><div><span class="eyebrow">EV LEARNING LAB</span><h2 id="modal-title">${esc(title)}</h2></div><button class="icon-btn" data-action="close-modal" aria-label="关闭弹窗">${icon("close")}</button></header><div class="modal-body">${body}</div>${footer ? `<footer>${footer}</footer>` : ""}</section></div>`;
  document.body.classList.add("modal-open");
  modalRoot.querySelector("button,input,select,textarea,a")?.focus();
}
function closeModal() {
  modalRoot.innerHTML = "";
  document.body.classList.remove("modal-open");
  if (modalReturn?.isConnected) modalReturn.focus();
  ui.modal = null;
}
function showBrief(taskId, mode = "guided") {
  const t = byTask(taskId);
  showModal(
    t.title,
    `<div class="brief-tags">${coursePill(t.course)}<span class="pill neutral">${t.difficulty} · 约${t.minutes}分钟</span></div><p class="brief-symptom">${t.symptom}</p><div class="brief-info"><h3>本次需要完成</h3><ol><li>按教学流程完成作业准备、隔离与验电。</li><li>自主选择仪表与测点，采集有用的诊断证据。</li><li>记录判断，完成维修、恢复与验证并提交工单。</li></ol></div><div class="mode-options"><button class="${mode === "guided" ? "selected" : ""}" data-action="brief-mode" data-task="${t.id}" data-mode="guided">${icon("flag")}<strong>引导练习</strong><small>显示下一步建议与任务提示</small></button><button class="${mode === "practice" ? "selected" : ""}" data-action="brief-mode" data-task="${t.id}" data-mode="practice">${icon("wrench")}<strong>独立实训</strong><small>自主判断，不提供操作提示</small></button></div><p class="subtle-note">车辆结构和参数均为教学示例；不替代实车培训或车型维修资料。</p>`,
    `${button("取消", "close-modal", "", "text")}${button("进入工位 " + icon("arrow"), "start", `data-task="${t.id}" data-mode="${mode}"`)}`,
  );
}
function examBrief(course, assignment = null) {
  if (assignment?.taskId === "PACK01") {
    showModal(
      assignment.title,
      `<p class="brief-symptom">三维电池包拆装专项，限时${assignment.minutes}分钟，${assignment.pass}分通过。</p><div class="rule-box"><h3>过程评分</h3><ul><li>安全规范30分、有效验电15分、拆卸过程25分、回装过程20分、恢复验证10分。</li><li>关键安全错误触发考试门槛；必须完成完整回装与恢复验证。</li><li>开考后锁定任务、规则与截止时间。</li></ul></div>`,
      button("返回", "close-modal", "", "text") +
        button(
          "开始考核",
          "exam-start",
          `data-course="battery" data-id="${assignment.id}"`,
        ),
    );
    return;
  }
  const c = byCourse(course);
  const title =
    assignment?.title ?? (c ? c.name + "专项考核" : "综合任务考核");
  showModal(
    title,
    `<p class="brief-symptom">系统将在${c ? c.name : "四个课程域"}范围内随机抽取一个任务。开考后隐藏操作提示，并锁定任务、评分规则和截止时间。</p><div class="exam-rules"><div><strong>${assignment?.minutes ?? 20}</strong><span>分钟限时</span></div><div><strong>${assignment?.pass ?? 80}</strong><span>分通过线</span></div><div><strong>100</strong><span>分总分</span></div></div><div class="rule-box"><h3>${icon("shield")} 考前规则</h3><ul><li>六项安全准备共30分，测量25分，诊断20分，维修15分，验证10分。</li><li>每种错误维修扣5分；每类关键安全错误扣8分。</li><li>发生关键安全错误或未完成有效验电，考试不通过，成绩最高59分。</li><li>切换页面与刷新均继续计时，到时按当前证据提交。</li><li>这是教学考核体验，尚未接入服务端监考与防篡改。</li></ul></div>`,
    `${button("返回", "close-modal", "", "text")}${button("开始计时 " + icon("arrow"), "exam-start", `data-course="${course}" ${assignment ? `data-id="${assignment.id}"` : ""}`)}`,
  );
}
function showLesson(courseId, lessonId) {
  const c = byCourse(courseId),
    l = c.lessons.find((x) => x.id === lessonId),
    index = c.lessons.indexOf(l);
  showModal(
    l.title,
    `<div class="brief-tags">${coursePill(c.id)}<span class="muted">知识单元 ${index + 1} / 3</span></div><article class="lesson-article">${l.body.map((x, i) => `<p>${x}</p>${i === 0 ? `<div class="lesson-diagram">${icon(c.icon)}<span>部件与结构</span>${icon("arrow")}${icon("scan")}<span>信号与测量</span>${icon("arrow")}${icon("check")}<span>判断与验证</span></div>` : ""}`).join("")}<blockquote><small>记住这一点</small>${l.key}</blockquote><p class="source-note">课程来源：EDU EV 教学说明 ${c.code} · 资源版本 EDU-2026.1。正式教学需由学校按适用车型资料审核。</p></article>`,
    `${button("关闭", "close-modal", "", "text")}${button((db.learning[l.id] ? "已完成，继续" : "标记学完") + " " + icon("check"), "lesson-complete", `data-course="${c.id}" data-lesson="${l.id}"`)}`,
  );
}
function showQuiz(courseId, result = null) {
  const c = byCourse(courseId);
  showModal(
    c.name + " · 课程自测",
    `${result ? `<div class="quiz-result"><b>${result.score}<small>分</small></b><span>本次自测 · 最佳 ${db.quizzes[c.id]?.best} 分</span></div>` : '<p class="muted">共3题，自测用于检查理解，可重复练习。</p>'}<form id="quiz-form" data-course="${c.id}">${c.quiz.map(([question, options, answer, explain], i) => `<fieldset class="quiz-question"><legend><span>0${i + 1}</span>${question}</legend>${options.map((o, j) => `<label class="radio-option ${result ? (j === answer ? "correct" : result.answers[i] === j ? "incorrect" : "") : ""}"><input type="radio" name="q${i}" value="${j}" ${result?.answers[i] === j ? "checked" : ""} required/><span>${o}</span>${result && j === answer ? icon("check") : ""}</label>`).join("")}${result ? `<p class="quiz-explanation">${result.answers[i] === answer ? "回答正确" : "需要复习"} · ${explain}</p>` : ""}</fieldset>`).join("")}<button class="btn primary" type="submit">${result ? "重新提交自测" : "提交自测"} ${icon("arrow")}</button></form>`,
    button("关闭", "close-modal", "", "text"),
    true,
  );
}
function showRecord(s, sample = false) {
  const r = s.result;
  const notes = [];
  if (s.mechanics && s.mechanics.phase !== "closed")
    notes.push("完成电池包全部回装，逐项核查固定螺栓、连接和支撑状态。");
  if (!r.safetyPass)
    notes.push("复习安全准备与验电，考试关键错误会触发独立门槛。");
  if (r.parts[1] < s.rule.max[1])
    notes.push("增加不同类型的有效测量，比较上下游或独立测点。");
  if (!s.mechanics && r.parts[2] < 20)
    notes.push("重新比较证据与故障假设，补强诊断判断。");
  if (!s.state.verified) notes.push("完成装配、模拟复电与修复验证。");
  showModal(
    sample ? "示例工单与评分" : "工单与过程评价",
    `<div class="record-heading"><div>${coursePill(s.task.course)}<h3>${esc(s.task.title)}</h3><span class="muted">${modeName[s.mode]} · ${fmtDate(s.endAt)} · ${s.expired ? "超时提交" : "主动提交"}</span></div><div class="result-score ${finalPassed(s) ? "passed" : ""}"><b>${finalScore(s)}<small>分</small></b><span>${finalPassed(s) ? "达到通过条件" : r.safetyPass ? "建议补练" : "安全门槛未通过"}</span></div></div>${sample ? '<div class="sample-notice">示例数据，仅用于了解工单结构，不计入实际成绩。</div>' : ""}<div class="rubric-result">${(s.rule.labels ?? rubric.labels).map((l, i) => `<div><span>${l}</span><b>${r.parts[i]}<small> / ${s.rule.max[i]}</small></b><div><i style="width:${(r.parts[i] / s.rule.max[i]) * 100}%"></i></div></div>`).join("")}</div><div class="scoring-note">原始成绩 ${r.total} 分 · 扣分 ${r.deductions} 分 · 通过线 ${s.rule.pass} 分 · 规则 ${esc(s.rule.version)}<br/>有效证据覆盖 ${r.evidenceCount} 类；${s.risks.length ? `安全风险：${s.risks.map(esc).join("；")}` : "没有记录关键安全错误"}${s.wrongRepairs.length ? "；错误维修 " + s.wrongRepairs.length + " 类" : ""}</div><section class="record-section"><h3>诊断与维修说明</h3><dl class="workorder-dl"><div><dt>${s.mechanics ? "任务结论" : "诊断结论"}</dt><dd>${s.mechanics ? (s.state.verified && s.mechanics.phase === "closed" ? "拆卸、回装与恢复验证已完成" : "拆装任务尚未完成全部闭环") : esc(s.diagnosis) || "未填写"}</dd></div><div><dt>判断依据</dt><dd>${esc(s.basis) || "未填写文字依据，教师可结合测量复核。"}</dd></div><div><dt>维修总结</dt><dd>${esc(s.summary) || "未填写文字总结。"}</dd></div></dl></section><section class="record-section"><h3>测量证据</h3>${measurementTable(s.measurements)}</section><details class="record-section"><summary>全部操作记录 · ${s.logs.length} 条</summary><div class="log-list full">${s.logs.map((l) => `<div class="${l.result === "blocked" ? "blocked" : ""}"><time>#${l.seq} · ${new Date(l.time).toLocaleTimeString("zh-CN", { hour12: false })}</time><span>${esc(l.reason)}</span></div>`).join("")}</div></details><section class="record-section"><h3>下一步建议</h3><ul>${(notes.length ? notes : ["继续在独立任务中检验诊断路径，保持证据与工单完整。"]).map((n) => `<li>${n}</li>`).join("")}</ul></section>${s.review ? `<div class="review-note"><strong>教师复核 ${s.review.score} 分</strong><p>${esc(s.review.reason)}</p><small>${fmtDate(s.review.time)} · 原始成绩 ${r.total} 分仍保留；安全门槛独立判定。</small></div>` : ""}${db.role === "teacher" && !sample ? `<form id="review-form" data-id="${s.id}" class="review-form"><h3>教师复核</h3><label>复核成绩<input name="score" type="number" min="0" max="100" value="${s.review?.score ?? r.total}" required/></label><label>复核理由<textarea name="reason" required placeholder="对照证据填写理由，保留原始评分。">${esc(s.review?.reason ?? "")}</textarea></label><button class="btn secondary" type="submit">保存复核</button></form>` : ""}`,
    `${button("关闭", "close-modal", "", "text")}${!sample ? button(icon("download") + " 导出工单", "export-record", `data-id="${s.id}"`, "secondary") + button("针对性补练 " + icon("arrow"), "retrain", `data-task="${s.task.id}"`) : ""}`,
    true,
  );
}
function download(name, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const href = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
  toast("文件已生成，正在下载。");
}
function about() {
  showModal(
    "新能源汽车虚拟仿真维修平台",
    `<p class="brief-symptom">面向高校新能源汽车相关专业，以技能学习、三维实训、诊断工单和过程评价组织教学。</p><div class="scope-grid"><div><b>本版已开发</b><p>四课程、12知识单元、九任务、三维对象拆装与表笔测量、规则仿真、任务考核、工单、教师布置复核、备份与导出。</p></div><div><b>后续校园集成</b><p>真实账号与权限、跨设备班级同步、服务端审计、实际车型资源、实车或台架数据接入。</p></div></div><div class="rule-box"><h3>使用说明</h3><ul><li>当前记录仅位于本浏览器，请按需导出备份。</li><li>角色切换用于流程体验，不能作为生产权限控制。</li><li>全部初始车辆参数为教学示例，三维模型为教学结构。</li><li>三维需要支持WebGL的浏览器；不支持时可用结构图完成任务。</li><li>实车与台架尚未连接，界面中的读数明确标识为仿真。</li></ul></div><a class="document-link" href="./assets/ev-training-prd.pdf" target="_blank" rel="noopener">${icon("file")} 阅读初版 PRD 文档 ${icon("arrow")}</a>`,
    button("开始使用", "close-modal"),
  );
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) {
    if (e.target.classList.contains("modal-backdrop")) closeModal();
    return;
  }
  e.preventDefault();
  lastActivity = Date.now();
  const d = b.dataset;
  try {
    switch (d.action) {
      case "nav":
        closeModal();
        ui.view = d.view;
        if (d.view === "training" || d.view === "courses")
          ui.course = "all";
        render();
        break;
      case "menu":
        document.querySelector(".sidebar").classList.toggle("mobile-open");
        break;
      case "role":
        db.role = db.role === "student" ? "teacher" : "student";
        if (ui.view === "teacher" && db.role === "student")
          ui.view = "overview";
        save();
        render();
        break;
      case "teacher":
        db.role = "teacher";
        ui.view = "teacher";
        save();
        render();
        break;
      case "about":
        about();
        break;
      case "backup":
        download(
          "新能源汽车虚拟仿真维修平台_完整备份_" +
            new Date().toISOString().slice(0, 10) +
            ".json",
          JSON.stringify(db, null, 2),
        );
        break;
      case "export-csv":
        download(
          "新能源汽车虚拟仿真维修平台_实际成绩.csv",
          recordsCSV(db.records),
          "text/csv;charset=utf-8",
        );
        break;
      case "course":
        ui.course = d.course;
        ui.view = "courses";
        render();
        break;
      case "filter":
        ui.course = d.course;
        render();
        break;
      case "record-filter":
        ui.filter = d.course;
        render();
        break;
      case "brief":
        showBrief(d.task, d.mode ?? "guided");
        break;
      case "brief-mode":
        showBrief(d.task, d.mode);
        break;
      case "start":
        start(d.task, d.mode);
        break;
      case "resume":
        ui.view = "lab";
        ui.selected = db.current.task.component;
        render();
        break;
      case "lesson":
        showLesson(d.course, d.lesson);
        break;
      case "lesson-complete": {
        db.learning[d.lesson] = { completedAt: Date.now() };
        save();
        closeModal();
        render();
        const c = byCourse(d.course),
          idx = c.lessons.findIndex((l) => l.id === d.lesson);
        if (idx < c.lessons.length - 1)
          showLesson(c.id, c.lessons[idx + 1].id);
        else toast("本课程知识单元已学完，可以开始自测或实践。");
        break;
      }
      case "quiz":
        showQuiz(d.course);
        break;
      case "exam-brief":
        examBrief(d.course);
        break;
      case "assignment": {
        const a = db.assignments.find((x) => x.id === d.id);
        if (!a || a.deadline < Date.now())
          throw Error("该布置已截止，不能新开任务。");
        if (a.mode === "exam") examBrief(a.course, a);
        else {
          const pool = tasks.filter(
            (t) =>
              (a.taskId ? t.id === a.taskId : t.type !== "assembly") &&
              (a.course === "all" || t.course === a.course),
          );
          start(pool[Math.floor(Math.random() * pool.length)].id, a.mode, {
            ...a,
            assignmentId: a.id,
          });
        }
        break;
      }
      case "exam-start": {
        const a = d.id ? db.assignments.find((x) => x.id === d.id) : null;
        if (a && a.deadline < Date.now())
          throw Error("该布置已截止，不能新开考核。");
        const pool = tasks.filter(
          (t) =>
            (a?.taskId ? t.id === a.taskId : t.type !== "assembly") &&
            (d.course === "all" || t.course === d.course),
        );
        start(
          pool[Math.floor(Math.random() * pool.length)].id,
          "exam",
          a ? { ...a, assignmentId: a.id } : { minutes: 20, pass: 80 },
        );
        break;
      }
      case "lab-panel":
        ui.panel = d.panel;
        ui.sceneMode = d.panel === "assembly" ? "operate" : "observe";
        updateLab();
        if (d.panel === "assembly")
          scenes.forEach((c) => c.focus("battery"));
        break;
      case "goto-zero":
        ui.panel = "measure";
        ui.tool = "volt";
        ui.point = "hvtest";
        ui.probeLead = "red";
        ui.sceneMode = "observe";
        updateLab();
        break;
      case "tool":
        ui.tool = d.tool;
        updateLab();
        break;
      case "measure":
        operateAndSave("measure", {
          tool: ui.tool,
          point: ui.point,
          spatial: true,
        });
        updateLab();
        break;
      case "operate":
        operateAndSave(d.operation);
        updateLab();
        break;
      case "repair":
        operateAndSave("repair", { repair: d.repair });
        updateLab();
        break;
      case "mechanic-tool":
        ui.mechanicTool = d.tool;
        ui.sceneMode = "operate";
        updateLab();
        toast(
          "已选择" +
            document.querySelector(
              `[data-action="mechanic-tool"][data-tool="${d.tool}"] strong`,
            ).textContent +
            "，点击三维对象或同名按钮操作。",
        );
        break;
      case "mechanical":
        operateAndSave("mechanical", {
          target: d.target,
          tool: ui.mechanicTool,
        });
        updateLab();
        break;
      case "arm-probe":
        ui.probeLead = d.lead;
        syncStage();
        updateLab();
        break;
      case "terminal":
        spatialInteract({ kind: "terminal", terminal: d.terminal });
        break;
      case "clear-probes":
        operateAndSave("disconnect-probes");
        ui.probeLead = "red";
        updateLab();
        break;
      case "thermal":
        ui.thermal = !ui.thermal;
        scenes.forEach((c) => c.thermal?.(ui.thermal));
        document.getElementById("thermal-legend").hidden = !ui.thermal;
        b.classList.toggle("active", ui.thermal);
        b.setAttribute("aria-pressed", String(ui.thermal));
        break;
      case "cutaway":
        ui.clip = !ui.clip;
        scenes.forEach((c) => c.cut?.(ui.clip ? 2.2 : null));
        document.getElementById("clip-control").hidden = !ui.clip;
        b.classList.toggle("active", ui.clip);
        b.setAttribute("aria-pressed", String(ui.clip));
        break;
      case "immersive":
        ui.immersive = !ui.immersive;
        app.classList.toggle("spatial-immersive", ui.immersive);
        break;
      case "assembly-exam":
        showModal(
          "动力电池包三维拆装考核",
          `<p class="brief-symptom">限时30分钟，80分通过。任务锁定为PACK01，隐藏操作建议。</p><div class="rule-box"><h3>过程评分</h3><ul><li>安全规范30分、有效验电15分、拆卸过程25分、回装过程20分、恢复验证10分。</li><li>按唯一安全风险扣分，关键安全错误触发考试门槛。</li><li>必须完成完整回装与恢复验证，才能达到本任务通过条件。</li></ul></div>`,
          button("返回", "close-modal", "", "text") +
            button(
              "开始考核",
              "start",
              'data-task="PACK01" data-mode="exam"',
            ),
        );
        break;
      case "hint": {
        const r = operateAndSave("hint", {}, false);
        if (r)
          showModal(
            "任务提示",
            `<p class="brief-symptom">${esc(r.message)}</p>`,
            button("返回工位", "close-modal"),
          );
        break;
      }
      case "component":
        ui.selected = d.component;
        scenes.forEach((s) => s.select(ui.selected));
        document.getElementById("component-info").innerHTML = componentInfo(
          components.find((c) => c.id === ui.selected),
        );
        operateAndSave("inspect", { component: ui.selected }, false);
        updateLab();
        break;
      case "focus":
        scenes.forEach((s) => s.focus(d.value));
        break;
      case "scene-reset":
        scenes.forEach((s) => s.focus("all"));
        break;
      case "explode":
        ui.exploded = !ui.exploded;
        scenes.forEach((s) => s.explode(ui.exploded));
        b.classList.toggle("active", ui.exploded);
        b.setAttribute("aria-pressed", ui.exploded);
        break;
      case "shell":
        ui.shell = !ui.shell;
        scenes.forEach((s) => s.shell(ui.shell));
        b.classList.toggle("active", ui.shell);
        b.setAttribute("aria-pressed", ui.shell);
        break;
      case "submit-brief": {
        const s = db.current,
          r = score(s);
        showModal(
          "提交本次工单",
          `<p class="brief-symptom">提交后将锁定此次任务的操作和评分。你仍可查看全部证据，或开始新的补练。</p><div class="submission-checks"><p>${s.state.zero ? "✓" : "○"} 安全隔离与有效验电</p><p>${r.evidenceCount >= s.task.requiredEvidence ? "✓" : "○"} 有效测量证据 ${r.evidenceCount} / ${s.task.requiredEvidence} 类</p><p>${s.diagnosis ? "✓" : "○"} 诊断判断${s.diagnosis ? "：" + esc(s.diagnosis) : "尚未填写"}</p><p>${s.state.verified ? "✓" : "○"} 修复验证${s.state.verified ? "已完成" : "尚未完成"}</p><p>${s.basis.trim() && s.summary.trim() ? "✓" : "○"} 工单文字依据与总结</p></div><p class="subtle-note">未完成项目会据实计分。文字说明供教师复核，不进行自动语义判分。</p>`,
          button("继续完善", "close-modal", "", "secondary") +
            button("确认提交 " + icon("check"), "submit-now"),
        );
        break;
      }
      case "submit-now":
        closeModal();
        finish();
        break;
      case "record": {
        const r = d.sample
          ? samples().find((x) => x.id === d.id)
          : db.records.find((x) => x.id === d.id);
        if (r) showRecord(r, !!d.sample);
        break;
      }
      case "retrain":
        closeModal();
        start(d.task, "guided");
        break;
      case "export-record": {
        const r = db.records.find((x) => x.id === d.id);
        download(
          `工单_${r.task.id}_${r.id.slice(0, 8)}.json`,
          JSON.stringify({ schemaVersion: 1, record: r }, null, 2),
        );
        break;
      }
      case "sample-toggle":
        ui.samples = d.value === "sample";
        render();
        break;
      case "close-modal":
        closeModal();
        break;
    }
  } catch (err) {
    toast(err.message, "error");
  }
});
document.addEventListener("change", async (e) => {
  lastActivity = Date.now();
  if (e.target.id === "measurement-point") {
    ui.point = e.target.value;
    ui.probeLead = "red";
    const p = db.current?.task.points.find((p) => p.id === ui.point);
    if (p) {
      ui.selected = p.component;
      scenes.forEach((s) => s.select(ui.selected));
      document.getElementById("component-info").innerHTML = componentInfo(
        components.find((c) => c.id === ui.selected),
      );
      syncStage();
      scenes.forEach((c) =>
        c.focus(p.component === "bms" ? "battery" : p.component),
      );
    }
    updateLab();
  }
  if (e.target.name === "diagnosis") {
    operateAndSave("diagnosis", { value: e.target.value }, false);
    document.getElementById("lab-progress").innerHTML = labProgress();
  }
  if (e.target.id === "teacher-course") {
    ui.teacherCourse = e.target.value;
    render();
  }
  if (e.target.id === "teacher-mode") {
    ui.teacherMode = e.target.value;
    render();
  }
  if (e.target.id === "archive-mode") {
    ui.recordMode = e.target.value;
    render();
  }
  if (e.target.id === "backup-input" && e.target.files?.[0]) {
    try {
      const next = parseBackup(await e.target.files[0].text());
      persist(next);
      db = next;
      closeModal();
      ui.view = "teacher";
      render();
      toast("备份已恢复。");
    } catch (err) {
      toast("恢复失败，原数据保留：" + err.message, "error");
    }
  }
});
document.addEventListener("input", (e) => {
  lastActivity = Date.now();
  if (e.target.id === "clip-height")
    scenes.forEach((c) => c.cut?.(Number(e.target.value)));
  if (["basis", "summary"].includes(e.target.id) && db.current)
    operateAndSave(
      "workorder",
      {
        basis: document.getElementById("basis")?.value ?? db.current.basis,
        summary:
          document.getElementById("summary")?.value ?? db.current.summary,
      },
      false,
    );
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  lastActivity = Date.now();
  const form = e.target,
    data = new FormData(form);
  try {
    if (form.id === "class-form") {
      createClass(db, data.get("name"), data.get("students"));
      save();
      render();
      toast("教学班已创建。");
    }
    if (form.id === "assignment-form") {
      createAssignment(db, {
        ...Object.fromEntries(data),
        deadline: new Date(data.get("deadline")).getTime(),
      });
      save();
      render();
      toast("任务已发布，可切换学生视角进入。");
    }
    if (form.id === "quiz-form") {
      const c = byCourse(form.dataset.course),
        answers = c.quiz.map((q, i) => Number(data.get("q" + i)));
      if (c.quiz.some((q, i) => data.get("q" + i) === null))
        throw Error("请完成所有题目");
      const points = Math.round(
        (100 * c.quiz.filter((q, i) => q[2] === answers[i]).length) /
          c.quiz.length,
      );
      db.quizzes[c.id] = {
        best: Math.max(db.quizzes[c.id]?.best ?? 0, points),
        latest: points,
        answers,
        time: Date.now(),
      };
      save();
      showQuiz(c.id, { answers, score: points });
    }
    if (form.id === "review-form") {
      const r = db.records.find((r) => r.id === form.dataset.id);
      reviewRecord(r, data.get("score"), data.get("reason"));
      save();
      render();
      showRecord(r);
      toast("复核已保存，原始成绩仍保留。");
    }
  } catch (err) {
    toast(err.message, "error");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  const modal = modalRoot.querySelector(".modal");
  if (e.key === "Tab" && modal) {
    const els = [
        ...modal.querySelectorAll(
          "button:not([disabled]),a[href],input,select,textarea,summary",
        ),
      ],
      first = els[0],
      last = els.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
setInterval(() => {
  const now = Date.now(),
    delta = Math.max(0, Math.min(2, (now - lastTick) / 1000));
  lastTick = now;
  if (
    document.visibilityState !== "hidden" &&
    now - lastActivity < 60000 &&
    db.role === "student"
  ) {
    db.activeSeconds += delta;
    if (db.current) db.current.activeSeconds += delta;
  }
  if (db.current?.deadline && now >= db.current.deadline) {
    closeModal();
    finish(true);
    toast("考核时间已到，已自动提交当前证据。");
  }
  updateClock();
  if (Math.floor(now / 1000) % 10 === 0) save();
}, 1000);
if (db.current?.deadline && Date.now() >= db.current.deadline) {
  const s = db.current;
  submit(s, Date.now(), true);
  if (!db.records.some((r) => r.id === s.id)) db.records.push(s);
  db.current = null;
  ui.view = "workshop";
  save();
}
render();
export {
  db,
  ui,
  render,
  start,
  finish,
  operateAndSave,
  showRecord,
  spatialInteract,
};
