import { components, tools, byCourse } from "./data.js";
import {
  mechanicalTools,
  mechanicalHint,
  mechanicalScores,
} from "./mechanics.js";
export function workshopLobby({ icon, button }) {
  return `<div class="spatial-heading"><div><span class="eyebrow">新能源汽车 · 三维交互实训</span><h1>进入工位，亲手完成。</h1><p>从一颗螺栓、一对表笔，到一份可复核的实训工单。</p></div><span class="version-label">THREE.JS / EDU EV 1.1</span></div><section class="workshop-stage"><div id="workshop-scene" class="workshop-scene"></div><div class="studio-title"><span class="studio-number">01</span><div><span>三维教学工位</span><strong>EDU EV · 三电平台</strong></div></div><div class="studio-manual"><span>交互方式</span><p>拖拽旋转 · 滚轮缩放<br/>点击部件查看结构<br/>选择工具后操作对象</p></div><div class="studio-views"><button data-action="focus" data-value="all">整车视角</button><button data-action="focus" data-value="battery">动力电池</button><button data-action="focus" data-value="drive">电驱总成</button><button data-action="focus" data-value="underbody">底盘工位</button></div><div class="studio-component" id="component-info"><span class="eyebrow">TRACTION BATTERY</span><h3>动力电池包</h3><p>选择模型部件，观察构造与功能关系。</p></div><div class="studio-launch"><div><span class="launch-label">推荐实训 · PACK01</span><h2>动力电池包三维拆装</h2><p>8 颗固定螺栓 · 3 类连接器 · 完整拆装闭环</p></div><div>${button("开始三维拆装 " + icon("arrow"), "start", 'data-task="PACK01" data-mode="guided"')}${button("专项考核", "assembly-exam", "", "text")}</div></div><span class="simulation-source"><i></i> 中性教学模型 / 仿真数据</span></section><div class="spatial-paths"><button data-action="brief" data-task="HV02"><span>02</span><div><strong>高压互锁诊断</strong><small>连接表笔，对照测量与状态</small></div>${icon("arrow")}</button><button data-action="brief" data-task="BAT02"><span>03</span><div><strong>电池温度采样</strong><small>独立测温与ECU数据交叉验证</small></div>${icon("arrow")}</button><button data-action="brief" data-task="DRV01"><span>04</span><div><strong>电机信号诊断</strong><small>观察电驱结构，定位信号异常</small></div>${icon("arrow")}</button></div>`;
}
export function assemblyPanel(s, ui, { icon, button }) {
  const m = s.mechanics;
  if (!m)
    return `<div class="inline-empty">当前是故障诊断任务。选择“维修验证”完成处理。</div>`;
  const [removed, installed] = mechanicalScores(m),
    phase = {
      removing: "拆卸阶段",
      removed: "离车检查",
      installing: "回装阶段",
      closed: "回装完成",
    }[m.phase];
  const connected = Object.values(m.links).filter(Boolean).length;
  return `<div class="console-header"><div><span class="eyebrow">OBJECT-BASED OPERATIONS</span><h2>三维电池包拆装 <small>${phase}</small></h2><p>${s.mode === "guided" ? mechanicalHint(m) : "选择工具，直接点击三维对象。所有动作均保留证据。"}</p></div><span class="pill neutral">拆卸 ${removed}/25 · 回装 ${installed}/20</span></div>${!s.state.zero ? `<div class="mechanical-warning">${icon("shield")} 完成安全准备与有效验电后，开始对象操作。${button("进入安全准备", "lab-panel", 'data-panel="safety"', "text")}</div>` : ""}<div class="mechanic-tools">${mechanicalTools.map((t) => `<button class="${ui.mechanicTool === t.id ? "selected" : ""}" data-action="mechanic-tool" data-tool="${t.id}"><span>${t.symbol}</span><strong>${t.name}</strong></button>`).join("")}</div><div class="assembly-controls"><section><h3>连接器 <small>${connected}/3 已连接</small></h3><div class="connector-controls">${[
    ["hv", "高压连接"],
    ["lv", "低压采样"],
    ["coolant", "冷却接头"],
  ]
    .map(
      ([id, l]) =>
        `<button class="${m.links[id] ? "connected" : "disconnected"}" data-action="mechanical" data-target="${id}-link"><i></i>${l}<small>${m.links[id] ? "已连接" : "已解除"}</small></button>`,
    )
    .join(
      "",
    )}</div></section><section class="bolt-section"><h3>固定螺栓 <small>${m.bolts.filter(Boolean).length}/8 在位</small></h3><div class="bolt-controls">${m.bolts.map((mounted, i) => `<button class="${mounted ? "mounted" : "removed"} ${m.installed.includes("bolt-" + (i + 1)) ? "tightened" : ""}" data-action="mechanical" data-target="bolt-${i + 1}" aria-label="固定螺栓 B${String(i + 1).padStart(2, "0")} ${mounted ? "在位" : "已拆下"}"><span>⬡</span>B${String(i + 1).padStart(2, "0")}</button>`).join("")}</div></section></div><div class="assembly-actions">${[
    ["support-on", "确认支撑", m.support],
    ["pack-lower", "受控下放", m.lowered],
    ["inspect-pack", "离车检查", m.inspected],
    [
      "pack-raise",
      "举升对位",
      m.phase === "installing" || m.phase === "closed",
    ],
    ["support-off", "移除支撑", m.phase === "closed"],
  ]
    .map(
      ([target, label, done]) =>
        `<button class="${done ? "done" : ""}" data-action="mechanical" data-target="${target}">${done ? icon("check") : icon("wrench")}${label}</button>`,
    )
    .join(
      "",
    )}</div><p class="mechanical-note">结构、动作与工具均为教学示意；车型等待时间、紧固顺序、扭矩和冷却液处理要求须由教研按维修资料配置。</p>`;
}
export function measurementPanel(s, ui, { icon, button, esc }) {
  const p =
      s.task.points.find((x) => x.id === ui.point) ?? s.task.points[0],
    m = s.measurements.at(-1),
    pair = s.probes?.point === p.id ? s.probes : { red: null, black: null },
    needsProbes = ["volt", "ohm"].includes(p.tool);
  return `<div class="console-header"><div><h2>三维仪表与测点</h2><p>选择测点与工具，连接红黑表笔后采集。端子按钮与三维端子执行相同动作。</p></div><button class="link-btn" data-action="lab-panel" data-panel="evidence">查看测量记录 ${icon("arrow")}</button></div><div class="measurement-grid"><div><div class="tool-options">${tools.map((t) => `<button class="tool-option ${ui.tool === t.id ? "selected" : ""}" data-action="tool" data-tool="${t.id}">${icon(t.icon)}<strong>${t.short}</strong><small>${t.name}</small></button>`).join("")}</div><div class="measure-control"><label for="measurement-point">测点</label><select id="measurement-point">${s.task.points.map((p) => `<option value="${p.id}" ${ui.point === p.id ? "selected" : ""}>${p.label} · ${tools.find((t) => t.id === p.tool).short}</option>`).join("")}</select>${button(icon("scan") + " 采集读数", "measure")}</div>${needsProbes ? `<div class="probe-controls"><div class="probe-leads"><button class="red ${ui.probeLead === "red" ? "armed" : ""}" data-action="arm-probe" data-lead="red"><i></i>红表笔 <small>${pair.red ? (pair.red === "pos" ? "→ 正端" : "→ 负端") : "未连接"}</small></button><button class="black ${ui.probeLead === "black" ? "armed" : ""}" data-action="arm-probe" data-lead="black"><i></i>黑表笔 <small>${pair.black ? (pair.black === "neg" ? "→ 负端" : "→ 正端") : "未连接"}</small></button></div><span>连接至</span><button data-action="terminal" data-terminal="pos" class="terminal-btn pos" aria-label="连接正端子">＋ 正端</button><button data-action="terminal" data-terminal="neg" class="terminal-btn neg" aria-label="连接负端子">− 负端</button><button data-action="clear-probes" class="link-btn">断开</button></div><p class="probe-hint">${ui.probeLead ? `当前：${ui.probeLead === "red" ? "红" : "黑"}表笔待连接，请点击三维端子或对应端子按钮。` : "两支表笔已选择连接，可采集；反接直流测点时显示负值。"}</p>` : `<p class="probe-hint">${p.tool === "scanner" ? "诊断仪读取教学ECU快照，无需表笔接线。" : "测温仪读取当前教学对象的独立测温示例，无需表笔。"}</p>`}</div><div class="instrument"><span>${m ? esc(m.label) : "等待采集"}</span><div class="instrument-value">${m ? esc(m.value) : "— —"}<small>${m ? esc(m.unit) : tools.find((t) => t.id === ui.tool).short}</small></div><div><i class="status-dot"></i>${m ? esc(m.condition) : "选择工具与测点，连接后采集"}</div><small>教学仿真数据 · ${components.find((c) => c.id === p.component)?.name ?? "测点"}</small></div></div>`;
}
