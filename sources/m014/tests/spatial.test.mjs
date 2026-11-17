import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/assets/three.module.js";
import { createEVModel } from "../dist/assets/model.js";
import {
  makeSession,
  operate,
  submit,
  score,
  finalPassed,
  reviewRecord,
} from "../dist/assets/engine.js";
import { mechanicalScores } from "../dist/assets/mechanics.js";
import { emptyStore, parseBackup } from "../dist/assets/store.js";
const now = 1800000000000;
const act = (s, action, data = {}) => operate(s, action, data, now + 1000);
const mech = (s, target, tool) => {
  const r = act(s, "mechanical", { target, tool });
  assert.ok(r.ok, r.message);
  return r;
};
function safe(s) {
  for (const a of ["gear", "barrier", "meter", "shutdown", "isolate"])
    assert.ok(act(s, a).ok);
  act(s, "connect-probe", {
    point: "hvtest",
    lead: "red",
    terminal: "pos",
  });
  act(s, "connect-probe", {
    point: "hvtest",
    lead: "black",
    terminal: "neg",
  });
  assert.ok(
    act(s, "measure", { point: "hvtest", tool: "volt", spatial: true }).ok,
  );
}
function remove(s) {
  mech(s, "support-on", "lift");
  for (const id of ["hv", "lv", "coolant"])
    mech(s, id + "-link", id === "coolant" ? "coolant" : "hand");
  for (const i of [1, 8, 4, 5, 2, 7, 3, 6]) mech(s, "bolt-" + i, "socket");
  mech(s, "pack-lower", "lift");
  return s;
}
function install(s) {
  mech(s, "inspect-pack", "inspect");
  mech(s, "pack-raise", "lift");
  for (const i of [8, 1, 5, 4, 7, 2, 6, 3]) mech(s, "bolt-" + i, "torque");
  for (const id of ["coolant", "lv", "hv"])
    mech(s, id + "-link", id === "coolant" ? "coolant" : "hand");
  mech(s, "support-off", "lift");
  for (const a of ["reassemble", "energize", "verify"])
    assert.ok(act(s, a).ok);
  return s;
}
test("三维拆装完整闭环100分，逐个对象产生证据", () => {
  const s = makeSession("PACK01", "exam", {}, now);
  safe(s);
  remove(s);
  assert.equal(s.mechanics.phase, "removed");
  assert.deepEqual(mechanicalScores(s.mechanics), [25, 0]);
  install(s);
  assert.deepEqual(mechanicalScores(s.mechanics), [25, 20]);
  const r = submit(s, now + 600000);
  assert.equal(r.total, 100);
  assert.equal(r.taskPass, true);
  assert.ok(finalPassed(s));
  assert.equal(
    s.logs.filter((l) => l.action === "mechanical" && l.result === "ok")
      .length,
    27,
  );
  assert.equal(s.measurements[0].interaction, "3d-probe");
});
test("未隔离拆装、未支撑拆固定和未拆完下放均被拦截", () => {
  const s = makeSession("PACK01", "exam", {}, now);
  assert.equal(
    act(s, "mechanical", { target: "support-on", tool: "lift" }).ok,
    false,
  );
  safe(s);
  assert.equal(
    act(s, "mechanical", { target: "bolt-1", tool: "socket" }).ok,
    false,
  );
  assert.equal(s.mechanics.bolts[0], true);
  mech(s, "support-on", "lift");
  assert.equal(
    act(s, "mechanical", { target: "pack-lower", tool: "lift" }).ok,
    false,
  );
  assert.equal(s.mechanics.lowered, false);
  assert.equal(s.risks.length, 3);
  remove(s);
  install(s);
  const r = submit(s, now + 400000);
  assert.equal(r.total, 59);
  assert.equal(r.safetyPass, false);
});
test("错误工具不改状态、重复操作不增加得分、回装顺序受约束", () => {
  const s = makeSession("PACK01", "practice", {}, now);
  safe(s);
  const state = JSON.stringify(s.mechanics);
  assert.equal(
    act(s, "mechanical", { target: "support-on", tool: "socket" }).ok,
    false,
  );
  assert.equal(JSON.stringify(s.mechanics), state);
  remove(s);
  const scoreBefore = mechanicalScores(s.mechanics);
  assert.equal(
    act(s, "mechanical", { target: "bolt-1", tool: "socket" }).ok,
    false,
  );
  assert.deepEqual(mechanicalScores(s.mechanics), scoreBefore);
  assert.equal(
    act(s, "mechanical", { target: "pack-raise", tool: "lift" }).ok,
    false,
  );
  mech(s, "inspect-pack", "inspect");
  mech(s, "pack-raise", "lift");
  assert.equal(
    act(s, "mechanical", { target: "hv-link", tool: "hand" }).ok,
    false,
  );
  assert.equal(act(s, "reassemble").ok, false);
  assert.equal(act(s, "energize").ok, false);
});
test("拆装专项未完整回装时不能仅靠复核分数获得通过", () => {
  const s = makeSession("PACK01", "practice", {}, now);
  safe(s);
  remove(s);
  submit(s, now + 40000);
  reviewRecord(s, 100, "复核分数不替代拆装完成条件", now);
  assert.equal(s.result.taskPass, false);
  assert.equal(finalPassed(s), false);
});
test("三维表笔缺失或同端不产生读数，反接直流读数为负", () => {
  const s = makeSession("DRV02", "practice", {}, now);
  assert.equal(
    act(s, "measure", { point: "aux", tool: "volt", spatial: true }).ok,
    false,
  );
  act(s, "connect-probe", { point: "aux", lead: "red", terminal: "pos" });
  act(s, "connect-probe", { point: "aux", lead: "black", terminal: "pos" });
  assert.equal(
    act(s, "measure", { point: "aux", tool: "volt", spatial: true }).ok,
    false,
  );
  assert.equal(s.measurements.length, 0);
  act(s, "connect-probe", { point: "aux", lead: "red", terminal: "neg" });
  act(s, "connect-probe", { point: "aux", lead: "black", terminal: "pos" });
  assert.ok(
    act(s, "measure", { point: "aux", tool: "volt", spatial: true }).ok,
  );
  assert.equal(s.measurements[0].value, -12.4);
  assert.match(s.measurements[0].condition, /反接/);
  assert.equal(
    act(s, "measure", { point: "invSupply", tool: "volt", spatial: true })
      .ok,
    false,
  );
});
test("拆卸阶段与表笔接线能备份恢复，损坏结构被拒绝", () => {
  const db = emptyStore(),
    s = makeSession("PACK01", "exam", {}, now);
  safe(s);
  remove(s);
  db.current = s;
  const restored = parseBackup(JSON.stringify(db));
  assert.equal(restored.current.mechanics.phase, "removed");
  assert.equal(restored.current.mechanics.bolts.filter(Boolean).length, 0);
  assert.deepEqual(restored.current.probes, s.probes);
  assert.equal(restored.current.deadline, s.deadline);
  const invalid = structuredClone(db);
  invalid.current.mechanics.bolts = ["false"];
  assert.throws(() => parseBackup(JSON.stringify(invalid)));
  const xss = structuredClone(db);
  xss.current.rule.labels[0] = "<img onerror=1>";
  assert.throws(() => parseBackup(JSON.stringify(xss)));
});
test("旧版记录缺少新版表笔与任务门槛字段时仍可恢复", () => {
  const db = emptyStore(),
    s = makeSession("HV01", "guided", {}, now);
  safe(s);
  act(s, "diagnosis", { value: s.task.diagnosis });
  act(s, "repair", { repair: s.task.repairId });
  for (const a of ["reassemble", "energize", "verify"]) act(s, a);
  submit(s, now + 10000);
  delete s.probes;
  delete s.result.taskPass;
  db.records.push(s);
  const restored = parseBackup(JSON.stringify(db));
  assert.equal(restored.records.length, 1);
  assert.equal(restored.records[0].result.total, 100);
  assert.ok(finalPassed(restored.records[0]));
});
test("Three.js模型包含7个总成、8颗独立螺栓与可拾取端子", () => {
  const m = createEVModel({ workshop: true });
  assert.equal(Object.keys(m.groups).length, 7);
  assert.equal(m.bolts.length, 8);
  assert.equal(m.modules.length, 12);
  for (let i = 1; i <= 8; i++)
    assert.ok(m.pickables.some((o) => o.userData.target === "bolt-" + i));
  for (const id of ["hv-link", "lv-link", "coolant-link", "support-on"])
    assert.ok(m.pickables.some((o) => o.userData.target === id));
  assert.equal(Object.keys(m.terminalNodes).length, 2);
  const bounds = new THREE.Box3().setFromObject(m.root);
  assert.ok(Number.isFinite(bounds.max.x));
  assert.ok(bounds.max.y > 3);
  assert.ok(bounds.max.x - bounds.min.x >= 20);
  m.dispose();
});
test("真实Three.js射线可击中固定螺栓，拆卸后的电池与螺栓位置改变", () => {
  const m = createEVModel({ workshop: true }),
    s = makeSession("PACK01", "practice", {}, now);
  m.setState(s, { selected: "battery", point: "hvtest", measure: true });
  m.tick(0, true);
  const target = m.targetAnchor("bolt-1");
  const ray = new THREE.Raycaster(
    new THREE.Vector3(target.x, 5, target.z),
    new THREE.Vector3(0, -1, 0),
  );
  const hits = ray.intersectObjects(m.pickables, false);
  assert.ok(hits.some((h) => h.object.userData.target === "bolt-1"));
  const before = m.anchor("battery").y,
    boltBefore = m.bolts[0].getWorldPosition(new THREE.Vector3()).clone();
  safe(s);
  remove(s);
  m.setState(s, { selected: "battery", measure: false });
  m.tick(0, true);
  assert.ok(Math.abs(before - m.anchor("battery").y - 0.85) < 0.001);
  assert.ok(
    m.bolts[0]
      .getWorldPosition(new THREE.Vector3())
      .distanceTo(boltBefore) > 1,
  );
  assert.equal(
    m.pickables.find((o) => o.name === "support-on").userData.target,
    "support-off",
  );
  m.dispose();
});
test("回装恢复模型位置，热图与供能动画由任务状态驱动", () => {
  const m = createEVModel({ workshop: true }),
    s = makeSession("PACK01", "practice", {}, now);
  safe(s);
  remove(s);
  m.setState(s, { selected: "battery" });
  m.tick(0, true);
  const lowered = m.anchor("battery").y;
  install(s);
  m.setState(s, { selected: "battery" });
  m.tick(1, true);
  assert.ok(m.anchor("battery").y > lowered + 0.8);
  assert.ok(m.flow.every((f) => f.o.visible));
  const t = makeSession("BAT02", "practice", {}, now);
  m.setState(t, { selected: "bms", thermal: true });
  m.tick(0, true);
  assert.equal(m.modules[2].material.color.getHex(), 0xd88165);
  assert.notEqual(m.modules[0].material.color.getHex(), 0xd88165);
  m.dispose();
});
test("表笔线缆端点随三维对象移动，连续更新复用几何缓冲", () => {
  const m = createEVModel({ workshop: true }),
    s = makeSession("BAT02", "practice", {}, now);
  act(s, "connect-probe", {
    point: "tempOhm",
    lead: "red",
    terminal: "pos",
  });
  act(s, "connect-probe", {
    point: "tempOhm",
    lead: "black",
    terminal: "neg",
  });
  m.setState(s, {
    selected: "bms",
    point: "tempOhm",
    measure: true,
    expanded: false,
  });
  m.tick(0, true);
  const geometry = m.leads[0].line.geometry,
    first = m.terminalNodes.pos.getWorldPosition(new THREE.Vector3()).y;
  m.setState(s, {
    selected: "bms",
    point: "tempOhm",
    measure: true,
    expanded: true,
  });
  m.tick(1, true);
  assert.ok(
    m.terminalNodes.pos.getWorldPosition(new THREE.Vector3()).y >
      first + 0.5,
  );
  for (const lead of m.leads) {
    const p = lead.line.geometry.attributes.position,
      end = new THREE.Vector3(p.getX(32), p.getY(32), p.getZ(32)),
      terminal = m.terminalNodes[s.probes[lead.lead]].getWorldPosition(
        new THREE.Vector3(),
      );
    assert.ok(end.distanceTo(terminal) < 0.00001);
  }
  assert.equal(m.leads[0].line.geometry, geometry);
  m.dispose();
});
