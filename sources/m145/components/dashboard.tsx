"use client";
import {
  Layers3,
  ListChecks,
  MessagesSquare,
  PackageCheck,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Columns3,
  CalendarDays,
  Flag,
  SlidersHorizontal,
  PanelTop,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { useState } from "react";
import { type Row, isTodo, confirmed, stages, day } from "../lib/model";
import { PanelTitle, pad, ProjectTable, Empty } from "./ui-work";
export const todayCN = () =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const sortDue = (a: Row, b: Row) =>
  (a.due || "9999").localeCompare(b.due || "9999") ||
  ["高", "中", "低"].indexOf(a.priority) -
    ["高", "中", "低"].indexOf(b.priority);
export function Dashboard({
  rows,
  open,
  go,
  create,
  filter,
  demo,
}: {
  rows: Row[];
  open: (r: Row) => void;
  go: (s: string) => void;
  create: () => void;
  filter: () => void;
  demo: boolean;
}) {
  const ps = rows.filter((r) => r.type === "项目"),
    records = rows.filter((r) => r.type === "记录"),
    todo = records.filter(isTodo).sort(sortDue),
    reviews = records.filter(
      (r) => r.kind === "评审意见" && !confirmed(r.status),
    ),
    deliver = records.filter((r) => r.kind === "交付物");
  const [tab, set] = useState("全部项目");
  const shown = ps.filter(
    (p) =>
      tab === "全部项目" ||
      (tab === "高优先级" ? p.priority === "高" : p.status === "待评审"),
  );
  const metrics = [
    {
      n: ps.length,
      label: "在册项目",
      desc: "覆盖 " + new Set(ps.map((p) => p.stage)).size + " 个项目阶段",
      Icon: Layers3,
      color: "green",
      page: "项目台账",
    },
    {
      n: todo.length,
      label: "待办事项",
      desc: todo.filter((r) => r.priority === "高").length + " 项高优先级待办",
      Icon: ListChecks,
      color: "amber",
      page: "任务清单",
    },
    {
      n: reviews.length,
      label: "待闭环评审",
      desc: "待处理的评审意见",
      Icon: MessagesSquare,
      color: "violet",
      page: "评审中心",
    },
    {
      n: deliver.length,
      label: "项目交付物",
      desc: deliver.filter((r) => r.status === "待验收").length + " 项等待验收",
      Icon: PackageCheck,
      color: "teal",
      page: "交付与验收",
    },
  ];
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <i /> DELIVERY OVERVIEW
          </div>
          <h1>项目交付总览</h1>
          <p>数字孪生与空间智能项目交付协同工作台</p>
          <div className="hero-actions">
            <button className="btn mint" onClick={create}>
              <Plus size={16} />
              新建项目
            </button>
            <button className="hero-link" onClick={() => go("阶段看板")}>
              查看阶段看板 <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="hero-caption">
          <span />
          空间地形模型
        </div>
      </section>
      <section className="metrics">
        {metrics.map(({ n, label, desc, Icon, color, page }) => (
          <button
            className={"metric " + color}
            onClick={() => go(page)}
            key={label}
          >
            <div className="metric-head">
              <span>{label}</span>
              <span className="metric-icon">
                <Icon size={19} strokeWidth={1.7} />
              </span>
            </div>
            <strong>{pad(n)}</strong>
            <small>{desc}</small>
          </button>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="panel register">
          <PanelTitle
            title="项目台账"
            count={ps.length}
            extra={
              <button className="text-button" onClick={() => go("项目台账")}>
                查看全部 <ArrowUpRight size={14} />
              </button>
            }
          />
          <div className="register-tools">
            <div className="seg">
              {["全部项目", "高优先级", "待评审"].map((s) => (
                <button
                  key={s}
                  className={tab === s ? "on" : ""}
                  onClick={() => set(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <button className="filter-small" onClick={filter}>
              <SlidersHorizontal size={14} />
              筛选
            </button>
          </div>
          <ProjectTable rows={shown.slice(0, 6)} open={open} compact />
        </section>
        <section className="panel reminders">
          <PanelTitle
            title="待办提醒"
            icon={CalendarDays}
            extra={
              <button
                className="icon"
                aria-label="查看全部待办"
                onClick={() => go("任务清单")}
              >
                <ArrowUpRight size={17} />
              </button>
            }
          />
          <div className="agenda">
            {todo.slice(0, 4).map((r, i) => (
              <button
                className="agenda-item"
                key={r.id}
                onClick={() => open(r)}
              >
                <span
                  className={
                    "agenda-dot " + (r.priority === "高" ? "urgent" : "")
                  }
                />
                <div>
                  <div className="agenda-meta">
                    <span>
                      {r.due
                        ? r.due.slice(5).replace("-", " / ")
                        : "未设截止日期"}
                    </span>
                    <span
                      className={
                        "tiny-prio " + (r.priority === "高" ? "urgent" : "")
                      }
                    >
                      {r.priority}优先级
                    </span>
                  </div>
                  <b>{r.name}</b>
                  <small>{ps.find((p) => p.id === r.parent)?.name}</small>
                </div>
              </button>
            ))}
            {!todo.length && <Empty>当前没有待办事项</Empty>}
          </div>
        </section>
      </div>
      <section className="panel phase-panel">
        <PanelTitle
          title="项目阶段分布"
          extra={
            <button className="text-button" onClick={() => go("阶段看板")}>
              进入看板 <ArrowRight size={14} />
            </button>
          }
        />
        <div className="stage-strip">
          {stages.map((s, i) => (
            <div key={s}>
              <small>{s}</small>
              <b>{pad(ps.filter((p) => p.stage === s).length)}</b>
              <span
                style={{
                  width:
                    (ps.length
                      ? Math.max(
                          3,
                          (ps.filter((p) => p.stage === s).length / ps.length) *
                            100,
                        )
                      : 0) + "%",
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
