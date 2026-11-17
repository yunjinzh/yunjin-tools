import { displayDay, detailFields, readDetails } from "./detail-fields";
export const stages = [
  "需求沟通",
  "方案编制",
  "评审修改",
  "投标响应",
  "交付实施",
  "验收归档",
];
export const statuses = [
  "草案",
  "待确认",
  "编制中",
  "待评审",
  "已确认",
  "交付中",
  "待验收",
  "已完成",
  "需补充",
];
export const priorities = ["高", "中", "低"];
export const kinds = [
  "客户需求",
  "会议纪要",
  "待确认事项",
  "合作信息",
  "方案版本",
  "技术架构",
  "功能模块",
  "技术指标",
  "数据来源",
  "预算与采购",
  "演示脚本",
  "投标响应点",
  "交付物",
  "验收标准",
  "验收证据",
  "验收结论",
  "成果指标",
  "问题清单",
  "风险与跟进",
  "执行任务",
  "评审意见",
  "归档材料",
];
export const confirmed = (s: string) => s === "已确认" || s === "已完成";
export type Row = {
  id: string;
  rev: number;
  demo: boolean;
  type: "项目" | "记录" | "模板";
  parent: string;
  kind: string;
  name: string;
  org: string;
  scene: string;
  tech: string;
  stage: string;
  owner: string;
  priority: string;
  status: string;
  body: string;
  due: string;
  evidence: string;
  reviewer: string;
  verifiedAt: string;
  resolution: string;
  details: string;
  related: string;
  attachment: string;
  filename: string;
  origin: string;
  updated: string;
  actor: string;
};
export function blank(): Row {
  return {
    id: "",
    rev: 0,
    demo: false,
    type: "记录",
    parent: "",
    kind: "客户需求",
    name: "",
    org: "",
    scene: "",
    tech: "",
    stage: stages[0],
    owner: "",
    priority: "中",
    status: "草案",
    body: "",
    due: "",
    evidence: "",
    reviewer: "",
    verifiedAt: "",
    resolution: "",
    details: "",
    related: "",
    attachment: "",
    filename: "",
    origin: "",
    updated: "",
    actor: "",
  };
}
export const sourceSite =
  "https://spatial-intelligence-workbench.yunjinzh.chatgpt.site";
export const modules = [
  [
    "m1",
    "时空数据底座",
    "空间智能",
    "GIS、BIM、倾斜摄影、IoT 接口",
    "场景数据服务、对象编码、更新机制",
    "p1",
    "草案",
  ],
  [
    "m2",
    "校园安防与应急联动",
    "数字孪生校园",
    "点位、设备台账、告警",
    "告警定位、应急预案、处置记录",
    "p1",
    "草案",
  ],
  [
    "m3",
    "虚实融合任务训练",
    "具身智能",
    "机器人模型、物理参数、任务约束",
    "任务脚本、训练场景、验证记录",
    "p2",
    "待验证",
  ],
  [
    "m4",
    "教学—实训—考核",
    "虚拟仿真 / 教学实训",
    "课程标准、岗位流程、评分规则",
    "课程任务、实训案例、评价量表",
    "p4",
    "草案",
  ],
  [
    "m5",
    "城市体检与更新诊断",
    "城市更新 / 地图可视化",
    "社区边界、调查数据、设施清单",
    "问题地图、更新建议、跟踪台账",
    "p3",
    "草案",
  ],
  [
    "m6",
    "三维交互与演示",
    "数字孪生 / 地图可视化",
    "三维模型、业务图层、导览脚本",
    "交互场景、演示流程、案例素材",
    "p6",
    "草案",
  ],
  [
    "ref7",
    "网络边界与安全监测",
    "网络安全与信息化",
    "网络分区清单、日志来源、管理流程",
    "边界策略清单、监测视图、事件处置记录",
    "",
    "参考草案",
  ],
];
export const seedDate = "2026-11-18";
const briefs = [
  [
    "数字孪生校园综合管理平台",
    "示例高校 A",
    "数字孪生校园",
    "GIS / BIM",
    "方案编制",
    "方案组",
    "高",
    "编制中",
    "梳理校园安防、资产和应急联动的交付边界。",
    "核对校园模型交付范围",
    "客户需求",
    "待确认",
    "补齐校区边界、模型精度与数据授权说明。",
    "2026-11-20",
  ],
  [
    "测绘与数字孪生实训基地",
    "示例职业院校 B",
    "职业教育",
    "实景三维",
    "评审修改",
    "教学组",
    "高",
    "待评审",
    "围绕采集、建模、场景搭建与专业实训设计交付任务。",
    "复核实训任务评分表",
    "评审意见",
    "待评审",
    "逐项对照评分规则，补充学生操作记录示例。",
    "2026-11-19",
  ],
  [
    "具身智能虚实融合训练场",
    "示例实验室 C",
    "具身智能",
    "虚实融合",
    "需求沟通",
    "研发组",
    "中",
    "待确认",
    "梳理机器人训练任务、场景约束与验证流程。",
    "明确虚实场景验证边界",
    "待确认事项",
    "待确认",
    "确认测试空间、模型参数来源及实物验证责任。",
    "2026-11-21",
  ],
  [
    "新能源汽车虚拟仿真实训",
    "示例职业院校 D",
    "虚拟仿真",
    "三维仿真",
    "交付实施",
    "实施组",
    "中",
    "交付中",
    "整理电池检测虚拟实训的任务脚本与评价材料。",
    "整理实训演示交付包",
    "交付物",
    "交付中",
    "归集演示脚本、操作样例及教师指导材料。",
    "2026-11-23",
  ],
  [
    "网络安全监测与信息化平台",
    "示例单位 E",
    "网络安全与信息化",
    "日志审计",
    "投标响应",
    "投标组",
    "高",
    "编制中",
    "按需求条款整理边界防护、监测与日志审计响应材料。",
    "补充监测能力响应依据",
    "投标响应点",
    "需补充",
    "为监测能力条款关联原文、响应说明与材料页码。",
    "2026-11-20",
  ],
  [
    "城市更新空间分析与制图",
    "示例研究院 F",
    "地图可视化",
    "空间分析",
    "验收归档",
    "数据组",
    "低",
    "待验收",
    "组织空间数据、专题图层与城市更新成果的验收资料。",
    "归集专题图验收证据",
    "验收证据",
    "待验收",
    "归集图层目录、输出样图与核查记录，等待复核。",
    "2026-11-25",
  ],
];
export const seeds: Row[] = briefs.flatMap((b, i) => {
  const [
    name,
    org,
    scene,
    tech,
    stage,
    owner,
    priority,
    status,
    body,
    task,
    kind,
    taskStatus,
    detail,
    due,
  ] = b;
  const id = "sample-p" + (i + 1),
    updated = "2026-11-18T0" + (6 - i) + ":00:00.000Z";
  const p: Row = {
    ...blank(),
    id,
    rev: 1,
    demo: true,
    type: "项目",
    kind: "项目",
    name,
    org,
    scene,
    tech,
    stage,
    owner,
    priority,
    status,
    body,
    updated,
    actor: "示例记录",
  };
  const make = (
    j: number,
    k: string,
    n: string,
    s: string,
    desc: string,
    d = "",
  ) => ({
    ...blank(),
    id: id + "-r" + j,
    rev: 1,
    demo: true,
    parent: id,
    kind: k,
    name: n,
    stage,
    owner,
    priority,
    status: s,
    body: desc,
    due: d,
    updated,
    actor: "示例记录",
  });
  return [
    p,
    make(1, kind, task, taskStatus, detail, due),
    make(
      2,
      "会议纪要",
      scene + "需求沟通纪要",
      "草案",
      "讨论范围：" + body + "\n待办：" + task + "。",
    ),
    make(
      3,
      "方案版本",
      scene + "实施方案初稿",
      "草案",
      body + "\n拟定工作包包括需求核对、阶段评审和交付检查。",
    ),
    make(
      4,
      "验收标准",
      scene + "交付核查要求",
      "待确认",
      "拟逐项检查交付清单、运行记录与双方确认依据，具体验收口径待协商。",
    ),
  ];
});
export const fieldNames: Record<string, string> = {
  name: "名称",
  org: "拟合作学校 / 单位",
  scene: "应用场景",
  tech: "技术方向",
  stage: "项目阶段",
  owner: "负责人",
  priority: "优先级",
  status: "状态",
  kind: "材料类型",
  body: "内容与说明",
  due: "截止日期",
  evidence: "确认依据",
  reviewer: "确认人",
  verifiedAt: "核验时间",
  resolution: "修改回应与处理结果",
  related: "关联记录",
  attachment: "附件编号",
  filename: "归档附件",
  origin: "复用来源",
  parent: "所属项目",
};
export const day = displayDay;
export function validation(r: Row, all: Row[], affirm = false): string {
  if (r.details) {
    let d;
    try {
      d = JSON.parse(r.details);
    } catch {
      return "专项字段格式无效。";
    }
    if (
      !d ||
      Array.isArray(d) ||
      typeof d !== "object" ||
      Object.entries(d).some(
        ([k, v]) =>
          !(detailFields[r.kind] || []).includes(k) ||
          typeof v !== "string" ||
          v.length > 5000,
      )
    )
      return "专项字段或长度无效。";
    if (
      r.kind === "预算与采购" &&
      ["数量", "估算单价（元）"].some(
        (k) => d[k] && (!Number.isFinite(Number(d[k])) || Number(d[k]) < 0),
      )
    )
      return "数量与估算单价应为非负数。";
  }
  if (!r.name.trim()) return "请填写名称。";
  if (
    !statuses.includes(r.status) ||
    !priorities.includes(r.priority) ||
    !stages.includes(r.stage)
  )
    return "请选择有效的阶段、状态和优先级。";
  if (r.type === "记录" && !kinds.includes(r.kind))
    return "请选择有效的材料类型。";
  if (
    r.type === "记录" &&
    !all.some(
      (p) => p.id === r.parent && p.type === "项目" && p.demo === r.demo,
    )
  )
    return "请选择同一工作区中的所属项目。";
  if (
    r.related &&
    !all.some(
      (a) =>
        a.id === r.related &&
        a.id !== r.id &&
        a.parent === r.parent &&
        a.type === "记录" &&
        a.demo === r.demo,
    )
  )
    return "关联记录需来自同一项目。";
  if (r.due && !/^\d{4}-\d{2}-\d{2}$/.test(r.due)) return "截止日期格式有误。";
  if (confirmed(r.status)) {
    if (!r.reviewer.trim() || !r.evidence.trim() || !affirm)
      return "请填写确认人和可追溯的核验依据，并勾选已核对本次内容。";
    if (r.kind === "评审意见" && !r.resolution.trim())
      return "评审闭环需要填写修改回应与处理结果。";
    if (
      r.type === "记录" &&
      (r.kind === "验收结论" ||
        (r.kind === "交付物" && r.status === "已完成")) &&
      !(
        r.attachment ||
        all.some(
          (a) =>
            a.id === r.related &&
            a.kind === "验收证据" &&
            (confirmed(a.status) || !!a.attachment),
        )
      )
    )
      return "请关联已核实或已附原件的验收证据，也可直接上传本次核验附件。";
  }
  return "";
}
export const isTodo = (r: Row) =>
  r.type === "记录" &&
  !confirmed(r.status) &&
  (["执行任务", "待确认事项", "评审意见", "风险与跟进", "问题清单"].includes(
    r.kind,
  ) ||
    !!r.due);
export const materialKinds = [
  "归档材料",
  "方案版本",
  "会议纪要",
  "技术架构",
  "数据来源",
  "预算与采购",
  "投标响应点",
  "演示脚本",
];
export const acceptanceKinds = [
  "交付物",
  "验收标准",
  "验收证据",
  "验收结论",
  "成果指标",
];
