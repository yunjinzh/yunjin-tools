import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
const dom = new JSDOM(
  readFileSync(new URL("../dist/index.html", import.meta.url), "utf8"),
  { url: "https://test.local/", pretendToBeVisual: true },
);
for (const key of [
  "window",
  "document",
  "localStorage",
  "FormData",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "HTMLElement",
])
  globalThis[key] = dom.window[key];
globalThis.__EV_NO_WEBGL__ = true;
const nativeInterval = globalThis.setInterval,
  nativeTimeout = globalThis.setTimeout;
globalThis.setInterval = (...args) => {
  const t = nativeInterval(...args);
  t.unref();
  return t;
};
globalThis.setTimeout = (...args) => {
  const t = nativeTimeout(...args);
  t.unref();
  return t;
};
const app = await import("../dist/assets/app.js");
const click = (selector) => {
  const el = document.querySelector(selector);
  assert.ok(el, "missing " + selector);
  el.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
};
const change = (selector, value) => {
  const el = document.querySelector(selector);
  assert.ok(el);
  el.value = value;
  el.dispatchEvent(new Event("change", { bubbles: true }));
};
const form = (selector) =>
  document
    .querySelector(selector)
    .dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
test("学习首页与六个导航页面均可渲染，无伪造成绩", () => {
  assert.match(document.querySelector("h1").textContent, /进入工位/);
  assert.equal(app.db.records.length, 0);
  for (const v of [
    "courses",
    "training",
    "exams",
    "archive",
    "overview",
    "workshop",
  ]) {
    click(`[data-action="nav"][data-view="${v}"]`);
    assert.ok(document.querySelector("main h1"));
  }
  click('[data-action="teacher"]');
  assert.equal(document.querySelectorAll("#assignment-form").length, 1);
  assert.match(document.body.textContent, /本浏览器/);
});
test("课程学习、自测反馈和进度保存", () => {
  click('[data-action="nav"][data-view="courses"]');
  click('[data-action="course"][data-course="safety"]');
  click('[data-action="lesson"][data-lesson="s1"]');
  click('[data-action="lesson-complete"]');
  assert.ok(app.db.learning.s1);
  click('[data-action="close-modal"]');
  click('[data-action="quiz"]');
  for (let i = 0; i < 3; i++)
    document.querySelector(`input[name="q${i}"][value="1"]`).checked = true;
  form("#quiz-form");
  assert.equal(app.db.quizzes.safety.best, 100);
  assert.equal(document.querySelectorAll(".quiz-explanation").length, 3);
  click('[data-action="close-modal"]');
  assert.match(localStorage.getItem("ev-campus-lab-v1"), /completedAt/);
});
test("降级结构图可以选择部件，完整工位流程生成100分工单", () => {
  app.start("HV01", "guided");
  assert.ok(document.querySelector(".fallback-car"));
  for (const a of ["gear", "barrier", "meter", "shutdown", "isolate"])
    click(`[data-action="operate"][data-operation="${a}"]`);
  click('[data-action="goto-zero"]');
  click('[data-action="terminal"][data-terminal="pos"]');
  click('[data-action="terminal"][data-terminal="neg"]');
  click('[data-action="measure"]');
  assert.equal(app.db.current.state.zero, true);
  click('[data-action="lab-panel"][data-panel="order"]');
  change('input[name="diagnosis"]', "作业准备与隔离需完成");
  document.querySelector('input[value="作业准备与隔离需完成"]').checked =
    true;
  for (const [id, val] of [
    ["basis", "已核对隔离和验电证据"],
    ["summary", "已恢复装配并完成验证"],
  ]) {
    const el = document.getElementById(id);
    el.value = val;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  click('[data-action="lab-panel"][data-panel="repair"]');
  click('[data-action="repair"][data-repair="confirm"]');
  for (const a of ["reassemble", "energize", "verify"])
    click(`[data-action="operate"][data-operation="${a}"]`);
  click('[data-action="submit-brief"]');
  click('[data-action="submit-now"]');
  assert.equal(app.db.records.length, 1);
  assert.equal(app.db.records[0].result.total, 100);
  assert.match(document.querySelector(".result-score").textContent, /100/);
  click('[data-action="close-modal"]');
});
test("教师建班、发布考核、学生进入与复核均产生实际记录", () => {
  click('[data-action="teacher"]');
  document.querySelector("#class-name").value = "新能源2401";
  document.querySelector("#class-students").value = "40";
  form("#class-form");
  assert.equal(app.db.classes.length, 2);
  const af = document.querySelector("#assignment-form");
  af.elements.title.value = "电池阶段考核";
  af.elements.mode.value = "exam";
  af.elements.course.value = "battery";
  af.elements.classId.value = app.db.classes[1].id;
  af.elements.minutes.value = "12";
  af.elements.pass.value = "85";
  form("#assignment-form");
  assert.equal(app.db.assignments.length, 1);
  click('[data-action="role"]');
  click('[data-action="assignment"]');
  click('[data-action="exam-start"]');
  assert.equal(app.db.current.mode, "exam");
  assert.equal(app.db.current.rule.pass, 85);
  assert.equal(app.db.current.task.course, "battery");
  assert.equal(app.db.current.assignmentId, app.db.assignments[0].id);
  assert.ok(!document.body.textContent.includes("当前建议"));
  click('[data-action="submit-brief"]');
  click('[data-action="submit-now"]');
  click('[data-action="close-modal"]');
  click('[data-action="teacher"]');
  click(`[data-action="record"][data-id="${app.db.records[1].id}"]`);
  const rf = document.querySelector("#review-form");
  rf.elements.score.value = "70";
  rf.elements.reason.value = "已检查测量缺项，需要补练";
  form("#review-form");
  assert.equal(app.db.records[1].review.score, 70);
  assert.equal(app.db.records[1].result.total, 0);
  assert.match(
    document.querySelector(".review-note").textContent,
    /原始成绩 0/,
  );
  click('[data-action="close-modal"]');
});
test("示例视图不污染实际统计，备份含所有实际教学证据", () => {
  const count = app.db.records.length;
  click('[data-action="sample-toggle"][data-value="sample"]');
  assert.ok(document.querySelector(".sample-notice"));
  assert.equal(
    document.querySelectorAll(".records-table tbody tr").length,
    4,
  );
  click('[data-action="record"][data-sample="true"]');
  assert.equal(
    document.querySelector(".result-score b").textContent,
    "100分",
  );
  assert.equal(document.querySelector("#review-form"), null);
  assert.equal(app.db.records.length, count);
  click('[data-action="close-modal"]');
  click('[data-action="sample-toggle"][data-value="actual"]');
  assert.equal(
    document.querySelectorAll(".records-table tbody tr").length,
    count,
  );
  const saved = JSON.parse(localStorage.getItem("ev-campus-lab-v1"));
  assert.equal(saved.records.length, 2);
  assert.equal(saved.classes.length, 2);
  assert.ok(saved.records[0].measurements.length > 0);
});
test("弹窗具备可关闭与对话框语义，帮助提供PRD入口", () => {
  click('[data-action="about"]');
  assert.equal(
    document.querySelector('[role="dialog"]').getAttribute("aria-modal"),
    "true",
  );
  assert.match(
    document.querySelector(".document-link").href,
    /ev-training-prd.pdf/,
  );
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  assert.equal(document.querySelector('[role="dialog"]'), null);
});
test("教师可按课程模式筛选并指定任务布置", () => {
  click('[data-action="teacher"]');
  change("#teacher-course", "safety");
  assert.equal(
    document.querySelectorAll(".records-table tbody tr").length,
    1,
  );
  change("#teacher-mode", "exam");
  assert.equal(
    document.querySelectorAll(".records-table tbody tr").length,
    0,
  );
  change("#teacher-course", "all");
  change("#teacher-mode", "all");
  const af = document.querySelector("#assignment-form");
  af.elements.title.value = "互锁指定任务";
  af.elements.course.value = "safety";
  af.elements.taskId.value = "HV02";
  af.elements.mode.value = "practice";
  form("#assignment-form");
  const a = app.db.assignments.at(-1);
  assert.equal(a.taskId, "HV02");
  click(`[data-action="assignment"][data-id="${a.id}"]`);
  assert.equal(app.db.current.task.id, "HV02");
  assert.equal(app.db.current.mode, "practice");
  click('[data-action="lab-panel"][data-panel="objects"]');
  click('[data-action="component"][data-component="motor"]');
  assert.equal(app.ui.selected, "motor");
  assert.match(
    document.querySelector("#component-info").textContent,
    /驱动电机/,
  );
});
test("三维对象操作回调与面板共同完成电池拆装并显示专项评分", () => {
  app.finish();
  click('[data-action="close-modal"]');
  app.start("PACK01", "guided");
  for (const a of ["gear", "barrier", "meter", "shutdown", "isolate"])
    click(`[data-action="operate"][data-operation="${a}"]`);
  click('[data-action="goto-zero"]');
  click('[data-action="terminal"][data-terminal="pos"]');
  click('[data-action="terminal"][data-terminal="neg"]');
  click('[data-action="measure"]');
  click('[data-action="lab-panel"][data-panel="assembly"]');
  click('[data-action="mechanic-tool"][data-tool="lift"]');
  click('[data-action="mechanical"][data-target="support-on"]');
  click('[data-action="mechanic-tool"][data-tool="hand"]');
  for (const id of ["hv", "lv"])
    click(`[data-action="mechanical"][data-target="${id}-link"]`);
  click('[data-action="mechanic-tool"][data-tool="coolant"]');
  click('[data-action="mechanical"][data-target="coolant-link"]');
  click('[data-action="mechanic-tool"][data-tool="socket"]');
  for (let i = 1; i <= 8; i++)
    app.spatialInteract({ kind: "mechanical", target: "bolt-" + i });
  assert.equal(
    document.querySelectorAll(".bolt-controls .removed").length,
    8,
  );
  click('[data-action="mechanic-tool"][data-tool="lift"]');
  click('[data-action="mechanical"][data-target="pack-lower"]');
  assert.equal(app.db.current.mechanics.lowered, true);
  click('[data-action="mechanic-tool"][data-tool="inspect"]');
  click('[data-action="mechanical"][data-target="inspect-pack"]');
  click('[data-action="mechanic-tool"][data-tool="lift"]');
  click('[data-action="mechanical"][data-target="pack-raise"]');
  click('[data-action="mechanic-tool"][data-tool="torque"]');
  for (let i = 1; i <= 8; i++)
    click(`[data-action="mechanical"][data-target="bolt-${i}"]`);
  click('[data-action="mechanic-tool"][data-tool="hand"]');
  for (const id of ["hv", "lv"])
    click(`[data-action="mechanical"][data-target="${id}-link"]`);
  click('[data-action="mechanic-tool"][data-tool="coolant"]');
  click('[data-action="mechanical"][data-target="coolant-link"]');
  click('[data-action="mechanic-tool"][data-tool="lift"]');
  click('[data-action="mechanical"][data-target="support-off"]');
  click('[data-action="lab-panel"][data-panel="repair"]');
  for (const a of ["reassemble", "energize", "verify"])
    click(`[data-action="operate"][data-operation="${a}"]`);
  click('[data-action="thermal"]');
  assert.equal(document.querySelector("#thermal-legend").hidden, false);
  click('[data-action="cutaway"]');
  assert.equal(document.querySelector("#clip-control").hidden, false);
  click('[data-action="immersive"]');
  assert.ok(
    document.getElementById("app").classList.contains("spatial-immersive"),
  );
  click('[data-action="submit-brief"]');
  click('[data-action="submit-now"]');
  assert.equal(app.db.records.at(-1).result.total, 100);
  assert.match(
    document.querySelector(".rubric-result").textContent,
    /拆卸过程/,
  );
  assert.match(
    document.querySelector(".rubric-result").textContent,
    /回装过程/,
  );
  click('[data-action="close-modal"]');
});
