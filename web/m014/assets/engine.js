import { byTask, rubric, safetySteps } from "./data.js";
import {
  makeMechanics,
  mechanicalStep,
  mechanicalScores,
  mechanicalHint,
} from "./mechanics.js";
const clone = (x) => JSON.parse(JSON.stringify(x));
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `ev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function makeSession(
  taskId,
  mode = "guided",
  options = {},
  now = Date.now(),
) {
  const task = byTask(taskId);
  if (!task || !["guided", "practice", "exam"].includes(mode))
    throw Error("任务或模式无效");
  const limit = Number(options.minutes ?? task.minutes);
  const pass = Number(options.pass ?? 80);
  if (
    !Number.isFinite(limit) ||
    limit < 1 ||
    limit > 180 ||
    !Number.isFinite(pass) ||
    pass < 0 ||
    pass > 100
  )
    throw Error("考核配置无效");
  return {
    id: uid(),
    task: clone(task),
    mode,
    status: "running",
    startAt: now,
    endAt: null,
    deadline: mode === "exam" ? now + limit * 60000 : null,
    assignmentId: options.assignmentId ?? null,
    classId: options.classId ?? null,
    rule: { ...clone(task.rubric ?? rubric), pass },
    state: {
      gear: false,
      barrier: false,
      meter: false,
      shutdown: false,
      isolate: false,
      zero: false,
      repaired: false,
      reassembled: false,
      energized: false,
      verified: false,
    },
    ...(task.type === "assembly" ? { mechanics: makeMechanics() } : {}),
    probes: { point: null, red: null, black: null },
    measurements: [],
    logs: [],
    risks: [],
    wrongRepairs: [],
    diagnosis: "",
    basis: "",
    summary: "",
    activeSeconds: 0,
    review: null,
  };
}
function log(s, action, target, result, reason, now) {
  s.logs.push({
    seq: s.logs.length + 1,
    time: now,
    action,
    target,
    result,
    reason,
  });
}
function block(s, action, target, reason, critical, now) {
  if (critical && !s.risks.includes(critical)) s.risks.push(critical);
  log(s, action, target, "blocked", reason, now);
  return { ok: false, message: reason };
}
export function operate(s, action, payload = {}, now = Date.now()) {
  if (s.status !== "running")
    return { ok: false, message: "该会话已提交，只能查看记录。" };
  if (s.deadline && now >= s.deadline) {
    submit(s, now, true);
    return {
      ok: false,
      expired: true,
      message: "考核时间已到，已按当前证据自动提交。",
    };
  }
  const a = s.state;
  let message = "操作已记录";
  if (["gear", "barrier", "meter"].includes(action)) {
    a[action] = true;
    message = safetySteps.find((x) => x.id === action).name + "已完成";
  } else if (action === "shutdown") {
    if (!a.gear || !a.barrier || !a.meter)
      return block(
        s,
        action,
        "vehicle",
        "请先完成防护、区域与仪表检查。",
        null,
        now,
      );
    a.shutdown = true;
    message = "教学车辆已模拟关闭";
  } else if (action === "isolate") {
    if (!a.shutdown)
      return block(
        s,
        action,
        "interlock",
        "应先完成准备并模拟关闭车辆。",
        "未关闭即隔离",
        now,
      );
    if (a.energized)
      return block(
        s,
        action,
        "interlock",
        "本会话已恢复复电，请开始新的训练会话。",
        null,
        now,
      );
    a.isolate = true;
    message = "隔离点已模拟断开，请继续有效验电";
  } else if (action === "mechanical") {
    if (!s.mechanics)
      return block(
        s,
        action,
        "mechanical",
        "当前任务不是电池包三维拆装任务。",
        null,
        now,
      );
    if (!a.zero || !a.isolate || a.energized)
      return block(
        s,
        action,
        payload.target,
        "拆装被阻止：请完成安全准备、隔离与有效验电。",
        "未安全隔离进行机械拆装",
        now,
      );
    const result = mechanicalStep(
      s.mechanics,
      payload.target,
      payload.tool,
    );
    if (!result.ok)
      return block(
        s,
        action,
        payload.target,
        result.message,
        result.risk,
        now,
      );
    a.repaired = s.mechanics.phase === "closed";
    message = result.message;
  } else if (action === "connect-probe") {
    const point = s.task.points.find((x) => x.id === payload.point);
    if (
      !point ||
      !["volt", "ohm"].includes(point.tool) ||
      !["red", "black"].includes(payload.lead) ||
      !["pos", "neg"].includes(payload.terminal)
    )
      return block(
        s,
        action,
        "probe",
        "请选择当前测点的有效表笔与端子。",
        null,
        now,
      );
    if (!s.probes || s.probes.point !== point.id)
      s.probes = { point: point.id, red: null, black: null };
    s.probes[payload.lead] = payload.terminal;
    message = `${payload.lead === "red" ? "红" : "黑"}表笔已连接${payload.terminal === "pos" ? "正" : "负"}端子：${point.label}`;
  } else if (action === "disconnect-probes") {
    s.probes = { point: null, red: null, black: null };
    message = "表笔连接已解除";
  } else if (action === "measure") {
    const point = s.task.points.find((x) => x.id === payload.point);
    if (!point)
      return block(
        s,
        action,
        String(payload.point),
        "请选择有效测点。",
        null,
        now,
      );
    if (payload.tool !== point.tool)
      return block(
        s,
        action,
        point.id,
        "当前工具或档位与测点不匹配。",
        null,
        now,
      );
    if (
      payload.spatial &&
      ["volt", "ohm"].includes(point.tool) &&
      (!s.probes ||
        s.probes.point !== point.id ||
        !s.probes.red ||
        !s.probes.black ||
        s.probes.red === s.probes.black)
    )
      return block(
        s,
        action,
        point.id,
        "三维测量需要两支表笔连接当前测点的两个不同端子。",
        null,
        now,
      );
    if (payload.tool === "ohm" && (!a.zero || !a.isolate || a.energized))
      return block(
        s,
        action,
        point.id,
        "电阻测量被阻止：须先完成安全隔离与有效验电。",
        "未安全隔离测电阻",
        now,
      );
    if (
      point.id === "hvtest" &&
      (!a.gear || !a.meter || !a.isolate || a.energized)
    )
      return block(
        s,
        action,
        point.id,
        "验电被阻止：请完成准备、模拟关闭和隔离。",
        "验电条件不完整",
        now,
      );
    if (
      payload.tool === "volt" &&
      point.component === "battery" &&
      (!a.zero || a.energized)
    )
      return block(
        s,
        action,
        point.id,
        "模组教学测量须先完成安全隔离和验电。",
        "未安全隔离检查模组",
        now,
      );
    const normal = a.repaired && a.energized;
    let value =
      point.id === "hvtest"
        ? a.isolate && !a.energized
          ? 0
          : 360
        : normal
          ? point.normal
          : point.abnormal;
    const reversed =
      payload.spatial && point.tool === "volt" && s.probes.red === "neg";
    if (reversed && typeof value === "number") value = -value;
    const condition =
      payload.tool === "scanner"
        ? normal
          ? "修复复电后数据"
          : "故障存储快照"
        : a.energized
          ? "教学复电状态"
          : a.isolate
            ? "隔离教学测量"
            : "初始教学状态";
    const m = {
      id: uid(),
      point: point.id,
      label: point.label,
      tool: payload.tool,
      value,
      unit: point.unit,
      condition: condition + (reversed ? " · 表笔反接" : ""),
      time: now,
      source: "教学仿真",
      relevant: point.relevant,
      ...(payload.spatial
        ? { wiring: clone(s.probes ?? {}), interaction: "3d-probe" }
        : {}),
    };
    s.measurements.push(m);
    if (point.id === "hvtest" && value === 0) a.zero = true;
    message = `${point.label}：${value} ${point.unit}`;
    log(s, action, point.id, "ok", message, now);
    return { ok: true, message, measurement: m };
  } else if (action === "repair") {
    if (s.mechanics)
      return block(
        s,
        action,
        "assembly",
        "请在拆装面板逐个操作真实教学对象，完成拆卸和回装。",
        null,
        now,
      );
    if (!a.zero || !a.isolate || a.energized)
      return block(
        s,
        action,
        payload.repair,
        "拆检与维修被阻止：请先完成安全隔离和有效验电。",
        "带电或未验电拆检",
        now,
      );
    if (!s.task.repairs.some((r) => r[0] === payload.repair))
      return block(
        s,
        action,
        "repair",
        "请选择任务中的有效维修方案。",
        null,
        now,
      );
    if (payload.repair !== s.task.repairId) {
      if (!s.wrongRepairs.includes(payload.repair))
        s.wrongRepairs.push(payload.repair);
      return block(
        s,
        action,
        payload.repair,
        "该处理未消除教学故障，请结合测量证据重新判断。",
        null,
        now,
      );
    }
    a.repaired = true;
    a.reassembled = false;
    a.verified = false;
    message = "教学维修已完成，请恢复装配并验证";
  } else if (action === "reassemble") {
    if (s.mechanics && s.mechanics.phase !== "closed")
      return block(
        s,
        action,
        "assembly",
        "请完成电池包对位、八颗螺栓、三类连接与支撑移除。",
        null,
        now,
      );
    if (!a.repaired)
      return block(
        s,
        action,
        "vehicle",
        "请先完成与故障对应的教学维修。",
        null,
        now,
      );
    a.reassembled = true;
    message = "盖板与连接已模拟恢复";
  } else if (action === "energize") {
    if (!a.reassembled)
      return block(
        s,
        action,
        "vehicle",
        "恢复装配后才能进行模拟复电。",
        null,
        now,
      );
    a.energized = true;
    message = "已模拟复电，请执行修复验证";
  } else if (action === "verify") {
    if (!a.repaired || !a.reassembled || !a.energized)
      return block(
        s,
        action,
        "vehicle",
        "请依次完成正确维修、装配恢复和模拟复电。",
        null,
        now,
      );
    a.verified = true;
    message = "修复验证通过：教学故障清除，相关信号恢复";
  } else if (action === "diagnosis") {
    if (!s.task.options.includes(payload.value))
      return block(
        s,
        action,
        "diagnosis",
        "请选择有效的诊断结论。",
        null,
        now,
      );
    s.diagnosis = payload.value;
    message = "诊断结论已记录";
  } else if (action === "workorder") {
    s.basis = String(payload.basis ?? "").slice(0, 3000);
    s.summary = String(payload.summary ?? "").slice(0, 3000);
    message = "工单已自动保存";
  } else if (action === "hint") {
    if (s.mode !== "guided")
      return block(
        s,
        action,
        "hint",
        "当前模式不提供操作提示。",
        null,
        now,
      );
    message = s.task.hint;
  } else if (action === "inspect") {
    message = String(payload.component ?? "结构观察").slice(0, 100);
  } else return { ok: false, message: "未知操作" };
  log(
    s,
    action,
    payload.target ?? payload.repair ?? payload.component ?? "vehicle",
    "ok",
    message,
    now,
  );
  return { ok: true, message };
}
export function score(s) {
  const count = new Set(
    s.measurements.filter((m) => m.relevant).map((m) => m.point),
  ).size;
  const parts = [
    safetySteps.filter((x) => s.state[x.id]).length * 5,
    Math.round(25 * Math.min(1, count / s.task.requiredEvidence)),
    s.diagnosis === s.task.diagnosis ? 20 : 0,
    s.state.repaired ? 15 : 0,
    s.state.verified ? 10 : 0,
  ];
  if (s.mechanics) {
    const [removed, installed] = mechanicalScores(s.mechanics);
    parts[1] = Math.round(15 * Math.min(1, count));
    parts[2] = removed;
    parts[3] = installed;
  }
  const deductions = s.risks.length * 8 + s.wrongRepairs.length * 5;
  const safetyPass =
    s.state.zero && (s.mode !== "exam" || s.risks.length === 0);
  let total = Math.max(0, parts.reduce((a, b) => a + b, 0) - deductions);
  if (s.mode === "exam" && !safetyPass) total = Math.min(total, 59);
  const taskPass =
    !s.mechanics || (s.mechanics.phase === "closed" && s.state.verified);
  return {
    parts,
    deductions,
    total,
    safetyPass,
    taskPass,
    passed: safetyPass && taskPass && total >= s.rule.pass,
    evidenceCount: count,
    version: s.rule.version,
    pass: s.rule.pass,
  };
}
export function submit(s, now = Date.now(), expired = false) {
  if (s.status === "submitted") return s.result;
  s.status = "submitted";
  s.endAt = now;
  s.expired = expired;
  s.result = score(s);
  log(
    s,
    "submit",
    s.task.id,
    "ok",
    expired ? "超时自动提交" : "主动提交",
    now,
  );
  return s.result;
}
export function finalScore(s) {
  return s.review?.score ?? s.result?.total ?? 0;
}
export function finalPassed(s) {
  return (
    !!s.result?.safetyPass &&
    s.result?.taskPass !== false &&
    finalScore(s) >= s.rule.pass
  );
}
export function reviewRecord(s, value, reason, now = Date.now()) {
  const n = Number(value);
  if (
    s.status !== "submitted" ||
    !Number.isFinite(n) ||
    n < 0 ||
    n > 100 ||
    !String(reason).trim()
  )
    throw Error("请填写0至100的复核分数和复核理由。");
  s.review = {
    score: Math.round(n),
    reason: String(reason).trim().slice(0, 2000),
    time: now,
  };
  return s.review;
}
export function nextStep(s) {
  if (!s.state.zero) return "安全准备与验电";
  if (s.mechanics)
    return s.state.verified
      ? "完善拆装工单并提交"
      : mechanicalHint(s.mechanics);
  if (
    new Set(s.measurements.filter((x) => x.relevant).map((x) => x.point))
      .size < s.task.requiredEvidence
  )
    return "采集与对照测量证据";
  if (!s.diagnosis) return "记录诊断判断";
  if (!s.state.repaired) return "按证据选择维修方案";
  if (!s.state.reassembled) return "恢复装配";
  if (!s.state.energized) return "模拟复电";
  if (!s.state.verified) return "执行修复验证";
  return "完善工单并提交";
}
