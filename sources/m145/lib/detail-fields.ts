export const detailFields: Record<string, string[]> = {
  客户需求: ["业务场景与使用人", "预期结果", "需澄清边界"],
  会议纪要: ["会议日期", "参会单位 / 人员", "议定动作"],
  待确认事项: ["待确认问题", "确认对象"],
  合作信息: ["合作主体", "拟合作范围"],
  方案版本: ["方案编号 / 版本", "本版修改范围"],
  技术架构: ["系统层级", "关键接口与依赖"],
  功能模块: ["输入数据", "功能与交付输出"],
  技术指标: ["指标与单位", "核验方法"],
  数据来源: ["数据提供方", "数据格式 / 接口", "授权及更新约定"],
  预算与采购: [
    "采购品目",
    "数量",
    "计量单位",
    "估算单价（元）",
    "报价或测算来源",
  ],
  演示脚本: ["演示步骤", "预期画面 / 操作结果"],
  投标响应点: ["招标文件条款 / 页码", "响应说明", "偏离与证明位置"],
  交付物: ["交付格式 / 数量", "接收方", "对应验收标准"],
  验收标准: ["检查项", "通过条件", "检查方法"],
  验收证据: ["证据来源", "对应检查项", "观测结果"],
  验收结论: ["适用交付范围", "检查结果", "遗留事项"],
  成果指标: ["目标值与单位", "测量方式", "实测值与来源"],
  问题清单: ["影响范围", "处置动作"],
  风险与跟进: ["触发条件与影响", "应对措施", "下一次跟进"],
  执行任务: ["预期产出", "协作人"],
  评审意见: ["所审材料与版本", "条款 / 问题位置", "复核要求"],
  归档材料: ["来源 / 文号", "归档位置"],
};
export function readDetails(value: string | undefined): Record<string, string> {
  try {
    const o = JSON.parse(value || "{}");
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}
export function detailPairs(
  kind: string,
  raw: string | undefined,
): [string, string][] {
  const d = readDetails(raw);
  const out: [string, string][] = (detailFields[kind] || [])
    .filter((k) => typeof d[k] === "string" && d[k].trim())
    .map((k) => [k, d[k]]);
  if (
    kind === "预算与采购" &&
    Number(d["数量"]) > 0 &&
    d["估算单价（元）"]?.trim() &&
    Number(d["估算单价（元）"]) >= 0
  ) {
    const total = Number(d["数量"]) * Number(d["估算单价（元）"]);
    if (Number.isFinite(total))
      out.push([
        "测算小计（元）",
        total.toLocaleString("zh-CN", { maximumFractionDigits: 2 }),
      ]);
  }
  return out;
}
export const displayDay = (s: string) =>
  s
    ? new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(s))
    : "—";
export const displayTime = (s: string) =>
  s
    ? new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        dateStyle: "short",
        timeStyle: "short",
        hour12: false,
      }).format(new Date(s))
    : "—";
