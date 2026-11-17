import test from "node:test";
import assert from "node:assert/strict";
import { tasks } from "../dist/assets/data.js";
import {
  makeSession,
  operate,
  submit,
  score,
  reviewRecord,
  finalPassed,
} from "../dist/assets/engine.js";
import {
  emptyStore,
  parseBackup,
  createClass,
  createAssignment,
  recordsCSV,
  validateStore,
} from "../dist/assets/store.js";
const now = 1800000000000;
const act = (s, a, p = {}) => operate(s, a, p, now + 1000);
function safe(s) {
  for (const a of ["gear", "barrier", "meter", "shutdown", "isolate"])
    assert.ok(act(s, a).ok);
  assert.ok(act(s, "measure", { tool: "volt", point: "hvtest" }).ok);
}
function complete(s, order = null) {
  safe(s);
  const pts = s.task.points.filter((p) => p.relevant && p.id !== "hvtest");
  for (const p of order ?? pts)
    assert.ok(act(s, "measure", { tool: p.tool, point: p.id }).ok);
  act(s, "diagnosis", { value: s.task.diagnosis });
  act(s, "workorder", {
    basis: "已交叉比较测量与工况。",
    summary: "已修复并恢复验证。",
  });
  assert.ok(act(s, "repair", { repair: s.task.repairId }).ok);
  for (const a of ["reassemble", "energize", "verify"])
    assert.ok(act(s, a).ok);
  return s;
}
test("八个任务均可通过独立诊断、维修和验证获得满分", () => {
  for (const t of tasks.filter((t) => t.type !== "assembly")) {
    const s = complete(makeSession(t.id, "exam", {}, now));
    const r = submit(s, now + 600000);
    assert.equal(r.total, 100, t.id);
    assert.ok(r.passed);
    assert.ok(r.safetyPass);
    assert.equal(
      r.parts.reduce((a, b) => a + b),
      100,
    );
  }
});
test("不同合理测量路径得到同等证据分，重复采集不增加覆盖", () => {
  const t = tasks.find((t) => t.id === "BAT02"),
    a = complete(makeSession(t.id, "practice", {}, now), [
      t.points[2],
      t.points[3],
    ]),
    b = complete(makeSession(t.id, "practice", {}, now), [
      t.points[3],
      t.points[4],
    ]);
  assert.equal(score(a).total, score(b).total);
  const c = makeSession(t.id, "practice", {}, now);
  safe(c);
  for (let i = 0; i < 10; i++)
    act(c, "measure", { point: "bmsTemp", tool: "scanner" });
  assert.equal(score(c).evidenceCount, 1);
  assert.equal(score(c).parts[1], 13);
});
test("未隔离测电阻被拦截，风险去重且考试安全门槛独立失败", () => {
  const s = makeSession("HV02", "exam", {}, now);
  assert.equal(
    act(s, "measure", { point: "hvilOhm", tool: "ohm" }).ok,
    false,
  );
  act(s, "measure", { point: "hvilOhm", tool: "ohm" });
  assert.equal(s.risks.length, 1);
  assert.equal(s.measurements.length, 0);
  complete(s);
  const r = submit(s, now + 100000);
  assert.equal(r.total, 59);
  assert.equal(r.safetyPass, false);
  assert.equal(r.passed, false);
  reviewRecord(s, 100, "只复核分数，安全门槛仍保留", now);
  assert.equal(finalPassed(s), false);
});
test("工具不匹配不会产生读数，前置条件不完整不能验电或维修", () => {
  const s = makeSession("BAT01", "practice", {}, now);
  assert.equal(
    act(s, "measure", { point: "cellHigh", tool: "temp" }).ok,
    false,
  );
  assert.equal(s.measurements.length, 0);
  assert.equal(act(s, "repair", { repair: s.task.repairId }).ok, false);
  assert.equal(s.state.repaired, false);
  assert.equal(act(s, "shutdown").ok, false);
});
test("修复后相关读数改变，修复前证据保持原值", () => {
  const s = makeSession("BAT02", "practice", {}, now);
  safe(s);
  act(s, "measure", { point: "bmsTemp", tool: "scanner" });
  const before = s.measurements.at(-1);
  assert.equal(before.value, 67);
  act(s, "repair", { repair: s.task.repairId });
  for (const a of ["reassemble", "energize", "verify"]) act(s, a);
  act(s, "measure", { point: "bmsTemp", tool: "scanner" });
  assert.equal(s.measurements.at(-1).value, 26);
  assert.equal(before.value, 67);
  assert.notEqual(before.condition, s.measurements.at(-1).condition);
});
test("到时操作先提交，已提交结果与日志不能通过重复操作更改", () => {
  const s = makeSession("HV01", "exam", { minutes: 1 }, now);
  const r = operate(s, "gear", {}, now + 60001);
  assert.ok(r.expired);
  assert.equal(s.status, "submitted");
  assert.equal(s.state.gear, false);
  const old = JSON.stringify(s);
  assert.equal(submit(s, now + 90000), s.result);
  assert.equal(operate(s, "gear", {}, now + 90000).ok, false);
  assert.equal(JSON.stringify(s), old);
});
test("任务、规则快照在刷新恢复后保留，考试不会重置截止时间", () => {
  const v = emptyStore();
  v.current = makeSession("VCU01", "exam", { pass: 86, minutes: 7 }, now);
  act(v.current, "gear");
  const restored = parseBackup(JSON.stringify(v));
  assert.equal(restored.current.deadline, now + 7 * 60000);
  assert.equal(restored.current.rule.pass, 86);
  assert.equal(restored.current.state.gear, true);
  assert.notEqual(
    restored.current.task,
    tasks.find((t) => t.id === "VCU01"),
  );
});
test("完整备份可恢复，错误结构和可执行内容被拒绝", () => {
  const v = emptyStore(),
    s = complete(makeSession("HV01", "practice", {}, now));
  submit(s, now + 100000);
  v.records.push(s);
  v.learning.s1 = { completedAt: now };
  v.quizzes.safety = {
    best: 100,
    latest: 100,
    answers: [1, 1, 1],
    time: now,
  };
  assert.equal(parseBackup(JSON.stringify(v)).records.length, 1);
  const original = JSON.stringify(v);
  assert.throws(() => parseBackup('{"schemaVersion":1}'));
  const malicious = structuredClone(v);
  malicious.records[0].task.title = "<img src=x onerror=alert(1)>";
  assert.throws(() => parseBackup(JSON.stringify(malicious)));
  assert.equal(JSON.stringify(v), original);
  const q = structuredClone(v);
  q.quizzes.safety.best = "<script>";
  assert.throws(() => validateStore(q));
});
test("建班布置校验时间与人数，成绩CSV防止公式执行", () => {
  const v = emptyStore();
  assert.throws(() => createClass(v, "", 40));
  assert.throws(() => createClass(v, "班级", -1));
  const c = createClass(v, "新能源2401班", 40);
  const a = createAssignment(
    v,
    {
      title: "电池考核",
      classId: c.id,
      course: "battery",
      mode: "exam",
      minutes: 20,
      pass: 85,
      deadline: now + 86400000,
    },
    now,
  );
  assert.equal(a.pass, 85);
  assert.equal(v.assignments.length, 1);
  assert.throws(() =>
    createAssignment(v, { ...a, deadline: now - 1 }, now),
  );
  const s = complete(makeSession("HV01", "practice", {}, now));
  submit(s, now + 10000);
  reviewRecord(s, 88, "=SUM(A1:A2)", now);
  const csv = recordsCSV([s]);
  assert.ok(csv.startsWith("\ufeff"));
  assert.match(csv, /'=SUM/);
  assert.match(csv, /88/);
});
test("非引导模式禁用提示，错误维修扣分且不消除故障", () => {
  const s = makeSession("DRV01", "exam", {}, now);
  assert.equal(act(s, "hint").ok, false);
  safe(s);
  const wrong = s.task.repairs.find((r) => r[0] !== s.task.repairId)[0];
  assert.equal(act(s, "repair", { repair: wrong }).ok, false);
  assert.equal(s.state.repaired, false);
  act(s, "repair", { repair: wrong });
  assert.equal(s.wrongRepairs.length, 1);
  complete(s);
  assert.equal(score(s).total, 95);
});
