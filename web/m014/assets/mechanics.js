export const mechanicalTools = [
  { id: "hand", name: "绝缘操作工具", symbol: "↗" },
  { id: "socket", name: "拆装套筒", symbol: "⊙" },
  { id: "torque", name: "紧固工具", symbol: "↻" },
  { id: "lift", name: "举升托架", symbol: "↥" },
  { id: "coolant", name: "接液工具", symbol: "◉" },
  { id: "inspect", name: "检查灯", symbol: "⌕" },
];
export const mechanicalTargets = [
  { id: "support-on", name: "放置并确认支撑", tool: "lift" },
  { id: "hv-link", name: "高压连接器", tool: "hand" },
  { id: "lv-link", name: "低压采样连接器", tool: "hand" },
  { id: "coolant-link", name: "教学冷却接头", tool: "coolant" },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `bolt-${i + 1}`,
    name: `固定螺栓 B${String(i + 1).padStart(2, "0")}`,
    tool: "socket",
  })),
  { id: "pack-lower", name: "受控下放电池包", tool: "lift" },
  { id: "inspect-pack", name: "检查离车电池包", tool: "inspect" },
  { id: "pack-raise", name: "举升对位安装", tool: "lift" },
  { id: "support-off", name: "移除支撑并确认", tool: "lift" },
];
export function makeMechanics() {
  return {
    phase: "removing",
    support: false,
    links: { hv: true, lv: true, coolant: true },
    bolts: Array(8).fill(true),
    lowered: false,
    inspected: false,
    removed: [],
    installed: [],
  };
}
const add = (list, id) => {
  if (!list.includes(id)) list.push(id);
};
export function mechanicalStep(m, target, tool) {
  const deny = (message, risk = null) => ({ ok: false, message, risk });
  if (!mechanicalTargets.some((t) => t.id === target))
    return deny("请选择有效的三维操作对象。");
  if (m.phase === "closed")
    return deny("电池包回装已完成，请继续恢复确认与修复验证。");
  const link = target.endsWith("-link") ? target.split("-")[0] : null;
  const bolt = target.startsWith("bolt-")
    ? Number(target.slice(5)) - 1
    : null;
  const expected =
    bolt !== null
      ? m.phase === "installing"
        ? "torque"
        : "socket"
      : mechanicalTargets.find((t) => t.id === target).tool;
  if (tool !== expected)
    return deny(
      `当前工具不匹配，请选择${mechanicalTools.find((t) => t.id === expected).name}。`,
    );
  if (target === "support-on") {
    if (m.phase !== "removing") return deny("当前阶段无需重新放置支撑。");
    m.support = true;
    add(m.removed, "support");
    return { ok: true, message: "支撑工位已就位并确认。" };
  }
  if (link) {
    if (m.phase === "removing") {
      if (!m.links[link]) return deny("该连接已断开，状态保持。");
      m.links[link] = false;
      add(m.removed, target);
      return {
        ok: true,
        message:
          "教学连接已解除：" +
          mechanicalTargets.find((t) => t.id === target).name,
      };
    }
    if (m.phase === "installing") {
      if (!m.bolts.every(Boolean))
        return deny("先完成全部固定螺栓的教学紧固，再恢复连接。");
      if (m.links[link]) return deny("该连接已恢复，状态保持。");
      m.links[link] = true;
      add(m.installed, target);
      return {
        ok: true,
        message:
          "教学连接已恢复：" +
          mechanicalTargets.find((t) => t.id === target).name,
      };
    }
    return deny("电池包离车检查期间保持连接断开。");
  }
  if (bolt !== null) {
    if (m.phase === "removing") {
      if (!m.support)
        return deny(
          "禁止松脱固定螺栓：请先放置并确认支撑。",
          "未支撑松脱电池包",
        );
      if (Object.values(m.links).some(Boolean))
        return deny(
          "请先解除高压、低压与教学冷却连接，再操作固定螺栓。",
          "连接未解除即拆固定",
        );
      if (!m.bolts[bolt]) return deny("该螺栓已拆下，状态保持。");
      m.bolts[bolt] = false;
      add(m.removed, target);
      return {
        ok: true,
        message: `固定螺栓 B${String(bolt + 1).padStart(2, "0")} 已拆下并放入零件盘。`,
      };
    }
    if (m.phase === "installing") {
      if (m.bolts[bolt]) return deny("该螺栓已完成教学紧固，状态保持。");
      m.bolts[bolt] = true;
      add(m.installed, target);
      return {
        ok: true,
        message: `固定螺栓 B${String(bolt + 1).padStart(2, "0")} 已完成教学紧固。实际扭矩须绑定车型资料。`,
      };
    }
    return deny("先检查离车电池包并举升对位，再开始回装。");
  }
  if (target === "pack-lower") {
    if (m.phase !== "removing") return deny("当前不是电池包拆卸阶段。");
    if (!m.support)
      return deny("下放被阻止：需要已确认的支撑工位。", "未支撑下放电池包");
    if (m.bolts.some(Boolean) || Object.values(m.links).some(Boolean))
      return deny(
        "下放被阻止：需拆下八颗固定螺栓并解除全部教学连接。",
        "固定或连接未解除即下放",
      );
    m.lowered = true;
    m.phase = "removed";
    add(m.removed, target);
    return {
      ok: true,
      message: "电池包已受控下放至教学托架，进入离车检查。",
    };
  }
  if (target === "inspect-pack") {
    if (m.phase !== "removed" || !m.lowered)
      return deny("电池包受控下放后才能完成离车检查。");
    m.inspected = true;
    return {
      ok: true,
      message: "离车电池包外观、连接口与安装点的教学检查已完成。",
    };
  }
  if (target === "pack-raise") {
    if (m.phase !== "removed" || !m.inspected)
      return deny("先完成离车检查，再举升对位。");
    m.lowered = false;
    m.phase = "installing";
    add(m.installed, target);
    return { ok: true, message: "电池包已举升对位，请逐颗完成教学紧固。" };
  }
  if (target === "support-off") {
    if (
      m.phase !== "installing" ||
      !m.bolts.every(Boolean) ||
      !Object.values(m.links).every(Boolean)
    )
      return deny("全部固定螺栓与三类连接恢复后，才能移除支撑。");
    m.support = false;
    m.phase = "closed";
    add(m.installed, target);
    return {
      ok: true,
      message: "支撑已移除，电池包回装状态完整，可以恢复确认并验证。",
    };
  }
  return deny("当前操作无效。");
}
export function mechanicalScores(m) {
  const r = m.removed,
    i = m.installed;
  const removal =
    (r.includes("support") ? 5 : 0) +
    r.filter((x) => x.endsWith("-link")).length * 3 +
    r.filter((x) => x.startsWith("bolt-")).length +
    (r.includes("pack-lower") ? 3 : 0);
  const installation =
    (i.includes("pack-raise") ? 4 : 0) +
    i.filter((x) => x.startsWith("bolt-")).length +
    i.filter((x) => x.endsWith("-link")).length * 2 +
    (i.includes("support-off") ? 2 : 0);
  return [removal, installation];
}
export function mechanicalHint(m) {
  if (m.phase === "closed") return "恢复装配确认 → 模拟复电 → 修复验证";
  if (m.phase === "removed")
    return m.inspected
      ? "选择举升托架，完成对位安装。"
      : "选择检查灯，检查离车电池包。";
  if (m.phase === "installing") {
    if (!m.bolts.every(Boolean))
      return "选择紧固工具，逐颗完成八颗固定螺栓的教学紧固。";
    if (!Object.values(m.links).every(Boolean))
      return "恢复高压、低压与教学冷却连接。";
    return "选择举升托架，移除支撑并确认。";
  }
  if (!m.support) return "选择举升托架，放置并确认电池包支撑。";
  if (Object.values(m.links).some(Boolean))
    return "选择对应工具，解除三类教学连接。";
  if (m.bolts.some(Boolean)) return "选择拆装套筒，逐颗拆下八颗固定螺栓。";
  return "选择举升托架，受控下放电池包。";
}
