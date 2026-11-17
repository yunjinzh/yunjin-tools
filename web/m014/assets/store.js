import { uid } from "./engine.js";
import { byTask, courses, rubric } from "./data.js";
export const STORE_KEY = "ev-campus-lab-v1";
export function emptyStore() {
  return {
    schemaVersion: 1,
    learning: {},
    quizzes: {},
    activeSeconds: 0,
    classes: [{ id: "default", name: "新能源教学体验班", students: 1 }],
    assignments: [],
    records: [],
    current: null,
    role: "student",
  };
}
export function validateStore(v) {
  if (
    !v ||
    v.schemaVersion !== 1 ||
    !v.learning ||
    typeof v.learning !== "object" ||
    Array.isArray(v.learning) ||
    !v.quizzes ||
    typeof v.quizzes !== "object" ||
    !["student", "teacher"].includes(v.role) ||
    !Number.isFinite(v.activeSeconds) ||
    v.activeSeconds < 0
  )
    throw Error("备份格式或版本不支持");
  if (
    !Array.isArray(v.records) ||
    v.records.length > 5000 ||
    !Array.isArray(v.classes) ||
    v.classes.length > 200 ||
    !Array.isArray(v.assignments) ||
    v.assignments.length > 1000
  )
    throw Error("数据数量或结构无效");
  const safeId = (id) =>
    typeof id === "string" && /^[a-zA-Z0-9_-]{1,150}$/.test(id);
  const text = (v) => typeof v === "string" && v.length <= 4000;
  const validSpatial = (s) => {
    if (
      s.probes &&
      (![null, ...s.task.points.map((p) => p.id)].includes(
        s.probes.point,
      ) ||
        ![null, "pos", "neg"].includes(s.probes.red) ||
        ![null, "pos", "neg"].includes(s.probes.black))
    )
      return false;
    const expected = s.task.rubric ?? rubric;
    if (
      JSON.stringify(s.rule.max) !== JSON.stringify(expected.max) ||
      (s.rule.labels &&
        JSON.stringify(s.rule.labels) !== JSON.stringify(expected.labels))
    )
      return false;
    if (s.task.type !== "assembly") return !s.mechanics;
    const m = s.mechanics;
    if (
      !m ||
      !["removing", "removed", "installing", "closed"].includes(m.phase) ||
      !["support", "lowered", "inspected"].every(
        (k) => typeof m[k] === "boolean",
      ) ||
      !m.links ||
      !["hv", "lv", "coolant"].every(
        (k) => typeof m.links[k] === "boolean",
      ) ||
      !Array.isArray(m.bolts) ||
      m.bolts.length !== 8 ||
      !m.bolts.every((x) => typeof x === "boolean")
    )
      return false;
    const removal = [
        "support",
        "hv-link",
        "lv-link",
        "coolant-link",
        "pack-lower",
        ...Array.from({ length: 8 }, (_, i) => "bolt-" + (i + 1)),
      ],
      installation = [
        "pack-raise",
        "support-off",
        "hv-link",
        "lv-link",
        "coolant-link",
        ...Array.from({ length: 8 }, (_, i) => "bolt-" + (i + 1)),
      ];
    return (
      Array.isArray(m.removed) &&
      m.removed.length <= 13 &&
      new Set(m.removed).size === m.removed.length &&
      m.removed.every((x) => removal.includes(x)) &&
      Array.isArray(m.installed) &&
      m.installed.length <= 13 &&
      new Set(m.installed).size === m.installed.length &&
      m.installed.every((x) => installation.includes(x))
    );
  };
  const validSession = (s) =>
    s &&
    safeId(s.id) &&
    s.task &&
    byTask(s.task.id) &&
    JSON.stringify(s.task) === JSON.stringify(byTask(s.task.id)) &&
    s.rule &&
    Array.isArray(s.rule.max) &&
    s.rule.max.length === 5 &&
    s.rule.max.every(Number.isFinite) &&
    text(s.rule.version) &&
    Number.isFinite(s.rule.pass) &&
    s.rule.pass >= 0 &&
    s.rule.pass <= 100 &&
    ["guided", "practice", "exam"].includes(s.mode) &&
    s.state &&
    [
      "gear",
      "barrier",
      "meter",
      "shutdown",
      "isolate",
      "zero",
      "repaired",
      "reassembled",
      "energized",
      "verified",
    ].every((k) => typeof s.state[k] === "boolean") &&
    text(s.diagnosis) &&
    text(s.basis) &&
    text(s.summary) &&
    Array.isArray(s.measurements) &&
    s.measurements.length <= 10000 &&
    s.measurements.every(
      (m) =>
        m &&
        safeId(m.id) &&
        text(m.point) &&
        text(m.label) &&
        text(m.tool) &&
        (Number.isFinite(m.value) || text(m.value)) &&
        text(m.unit) &&
        text(m.condition) &&
        Number.isFinite(m.time),
    ) &&
    Array.isArray(s.logs) &&
    s.logs.length <= 50000 &&
    s.logs.every(
      (l) =>
        l &&
        Number.isInteger(l.seq) &&
        Number.isFinite(l.time) &&
        text(l.reason) &&
        text(l.result),
    ) &&
    Array.isArray(s.risks) &&
    s.risks.every(text) &&
    Array.isArray(s.wrongRepairs) &&
    s.wrongRepairs.every(text) &&
    Number.isFinite(s.startAt) &&
    (!s.deadline || Number.isFinite(s.deadline)) &&
    (!s.review ||
      (Number.isFinite(s.review.score) &&
        s.review.score >= 0 &&
        s.review.score <= 100 &&
        text(s.review.reason) &&
        Number.isFinite(s.review.time)));
  for (const [id, val] of Object.entries(v.learning))
    if (
      !courses.some((c) => c.lessons.some((l) => l.id === id)) ||
      !val ||
      !Number.isFinite(val.completedAt)
    )
      throw Error("学习记录无效");
  for (const [id, q] of Object.entries(v.quizzes))
    if (
      !courses.some((c) => c.id === id) ||
      !q ||
      !Number.isFinite(q.best) ||
      q.best < 0 ||
      q.best > 100 ||
      !Number.isFinite(q.latest) ||
      !Array.isArray(q.answers) ||
      q.answers.length !== 3 ||
      !q.answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 2)
    )
      throw Error("自测记录无效");
  for (const s of v.records)
    if (
      !validSession(s) ||
      !validSpatial(s) ||
      s.status !== "submitted" ||
      !s.result ||
      !Array.isArray(s.result.parts) ||
      s.result.parts.length !== 5 ||
      !s.result.parts.every(Number.isFinite) ||
      !Number.isFinite(s.result.total)
    )
      throw Error("工单记录无效");
  if (
    v.current &&
    (!validSession(v.current) ||
      !validSpatial(v.current) ||
      v.current.status !== "running")
  )
    throw Error("当前会话无效");
  for (const c of v.classes)
    if (
      !c ||
      !safeId(c.id) ||
      typeof c.name !== "string" ||
      c.name.length > 100 ||
      !Number.isInteger(c.students) ||
      c.students < 1 ||
      c.students > 1000
    )
      throw Error("班级数据无效");
  for (const a of v.assignments)
    if (
      !a ||
      !safeId(a.id) ||
      typeof a.title !== "string" ||
      a.title.length > 100 ||
      !v.classes.some((c) => c.id === a.classId) ||
      !["all", ...courses.map((c) => c.id)].includes(a.course) ||
      (a.taskId &&
        (!byTask(a.taskId) ||
          (a.course !== "all" && byTask(a.taskId).course !== a.course))) ||
      !["guided", "practice", "exam"].includes(a.mode) ||
      !Number.isFinite(a.minutes) ||
      a.minutes < 1 ||
      a.minutes > 180 ||
      !Number.isFinite(a.pass) ||
      a.pass < 0 ||
      a.pass > 100 ||
      !Number.isFinite(a.createdAt) ||
      !Number.isFinite(a.deadline)
    )
      throw Error("布置数据无效");
  return v;
}
export function readStore(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(STORE_KEY);
    return raw ? validateStore(JSON.parse(raw)) : emptyStore();
  } catch {
    return emptyStore();
  }
}
export function persist(v, storage = globalThis.localStorage) {
  storage.setItem(STORE_KEY, JSON.stringify(v));
}
export function parseBackup(text) {
  if (text.length > 15000000) throw Error("文件超过15MB");
  return validateStore(JSON.parse(text));
}
export function createClass(v, name, students) {
  const n = Number(students);
  if (
    !String(name).trim() ||
    String(name).length > 100 ||
    !Number.isInteger(n) ||
    n < 1 ||
    n > 1000
  )
    throw Error("请输入班级名称和1至1000的整数人数");
  const c = { id: uid(), name: String(name).trim(), students: n };
  v.classes.push(c);
  return c;
}
export function createAssignment(v, input, now = Date.now()) {
  const minutes = Number(input.minutes),
    pass = Number(input.pass),
    deadline = Number(input.deadline);
  if (
    !String(input.title).trim() ||
    String(input.title).length > 100 ||
    !v.classes.some((c) => c.id === input.classId) ||
    !["guided", "practice", "exam"].includes(input.mode) ||
    !Number.isFinite(minutes) ||
    minutes < 1 ||
    minutes > 180 ||
    !Number.isFinite(pass) ||
    pass < 0 ||
    pass > 100 ||
    !Number.isFinite(deadline) ||
    deadline <= now
  )
    throw Error("请检查任务名称、班级、时长、通过线与截止时间");
  if (!["all", ...courses.map((c) => c.id)].includes(input.course))
    throw Error("请选择有效课程范围");
  const taskId = input.taskId || null;
  if (
    taskId &&
    (!byTask(taskId) ||
      (input.course !== "all" && byTask(taskId).course !== input.course))
  )
    throw Error("指定任务不在所选课程范围内");
  const a = {
    id: uid(),
    title: String(input.title).trim(),
    classId: input.classId,
    course: input.course,
    taskId,
    mode: input.mode,
    minutes,
    pass,
    deadline,
    createdAt: now,
  };
  v.assignments.push(a);
  return a;
}
export const csvCell = (v) => {
  let s = String(v ?? "");
  if (/^[\s]*[=+\-@]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
};
export function recordsCSV(records) {
  const rows = [
    [
      "记录编号",
      "任务",
      "模式",
      "开始时间",
      "提交时间",
      "原始成绩",
      "复核成绩",
      "通过线",
      "安全门槛",
      "风险数",
      "复核理由",
    ],
    ...records.map((s) => [
      s.id,
      s.task.title,
      s.mode,
      new Date(s.startAt).toISOString(),
      new Date(s.endAt).toISOString(),
      s.result.total,
      s.review?.score ?? "",
      s.rule.pass,
      s.result.safetyPass ? "通过" : "未通过",
      s.risks.length,
      s.review?.reason ?? "",
    ]),
  ];
  return "\ufeff" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}
