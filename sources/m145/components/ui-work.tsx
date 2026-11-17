"use client";
import React, { useEffect, useRef, useId } from "react";
import {
  Layers3,
  Landmark,
  Network,
  ScanLine,
  Box,
  ShieldCheck,
  Map,
  Folder,
  Check,
  ChevronRight,
  X,
  Inbox,
  SlidersHorizontal,
  CalendarDays,
  Flag,
  ClipboardList,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { type Row, day } from "../lib/model";
export const pad = (n: number) => String(n).padStart(2, "0");
export function Badge({ status }: { status: string }) {
  const group =
    (
      {
        需补充: "red",
        待确认: "amber",
        待评审: "violet",
        待验收: "amber",
        编制中: "blue",
        已确认: "green",
        已完成: "green",
        交付中: "teal",
      } as Record<string, string>
    )[status] || "gray";
  return (
    <span className={"badge " + group}>
      <i />
      {status}
    </span>
  );
}
export function Priority({ v }: { v: string }) {
  return (
    <span className={"priority p" + v}>
      <i />
      <i />
      <i />
      {v}
    </span>
  );
}
export function ProjectIcon({ r }: { r: Row }) {
  const names = [
    "数字孪生校园",
    "职业教育",
    "具身智能",
    "虚拟仿真",
    "网络安全与信息化",
    "地图可视化",
  ];
  const i = names.indexOf(r.scene),
    Icon = [Landmark, Layers3, Network, Box, ShieldCheck, Map][i] || ScanLine;
  return (
    <span className={"project-icon hue" + (i < 0 ? 0 : i)}>
      <Icon size={20} strokeWidth={1.6} />
    </span>
  );
}
export function Empty({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <Inbox size={30} strokeWidth={1.3} />
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      d?.close();
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          const b = ref.current.getBoundingClientRect();
          if (
            e.clientX < b.left ||
            e.clientX > b.right ||
            e.clientY < b.top ||
            e.clientY > b.bottom
          )
            close();
        }
      }}
    >
      <header className="modal-head">
        <h2 id={id}>{title}</h2>
        <button className="icon" aria-label="关闭" onClick={close}>
          <X size={19} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
  empty,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  options: string[];
  empty?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <span className="select-box">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {empty !== undefined && <option value="">{empty}</option>}
          {options.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <ChevronDown size={14} />
      </span>
    </label>
  );
}
export function ProjectTable({
  rows,
  open,
  compact = false,
}: {
  rows: Row[];
  open: (r: Row) => void;
  compact?: boolean;
}) {
  if (!rows.length) return <Empty>当前条件下没有项目</Empty>;
  return (
    <div className="table-scroll">
      <table className={"project-table " + (compact ? "compact" : "")}>
        <thead>
          <tr>
            <th>项目名称</th>
            <th>项目阶段</th>
            <th>状态</th>
            {!compact && (
              <>
                <th>负责人</th>
                <th>优先级</th>
              </>
            )}
            <th aria-label="详情"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} onClick={() => open(r)}>
              <td>
                <button
                  className="project-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    open(r);
                  }}
                >
                  <ProjectIcon r={r} />
                  <span>
                    <b>{r.name}</b>
                    <small>
                      {r.org || "单位待补录"}
                      <span className="sep">/</span>
                      {r.scene || "场景待补录"}
                    </small>
                  </span>
                </button>
              </td>
              <td className="stage-cell">{r.stage}</td>
              <td>
                <Badge status={r.status} />
              </td>
              {!compact && (
                <>
                  <td>{r.owner || "待分配"}</td>
                  <td>
                    <Priority v={r.priority} />
                  </td>
                </>
              )}
              <td>
                <ChevronRight size={15} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function RecordList({
  rows,
  all,
  open,
}: {
  rows: Row[];
  all: Row[];
  open: (r: Row) => void;
}) {
  if (!rows.length) return <Empty>此视图尚无匹配记录</Empty>;
  return (
    <div className="record-list">
      {rows.map((r) => (
        <button key={r.id} onClick={() => open(r)} className="record-row">
          <span className="record-symbol">
            <ClipboardList size={18} />
          </span>
          <span className="grow">
            <b>{r.name}</b>
            <small>
              {r.kind} ·{" "}
              {all.find((a) => a.id === r.parent)?.name || "项目记录"} ·{" "}
              {r.owner || "待分配"}
              {r.due ? " · " + r.due : ""}
            </small>
          </span>
          <Badge status={r.status} />
          <ChevronRight size={15} />
        </button>
      ))}
    </div>
  );
}
export function PanelTitle({
  title,
  count,
  extra,
  icon: Icon,
}: {
  title: string;
  count?: number;
  extra?: React.ReactNode;
  icon?: typeof Folder;
}) {
  return (
    <div className="panel-title">
      <div className="inline">
        {Icon && <Icon size={17} strokeWidth={1.7} />}
        <h2>{title}</h2>
        {count !== undefined && <span className="counter">{pad(count)}</span>}
      </div>
      {extra}
    </div>
  );
}
export function Timeline({
  rows,
  open,
}: {
  rows: Row[];
  open: (r: Row) => void;
}) {
  return rows.length ? (
    <div className="timeline">
      {[...rows]
        .sort((a, b) => b.updated.localeCompare(a.updated))
        .map((r, i) => (
          <button key={r.id + "-" + r.rev} onClick={() => open(r)}>
            <span className="timeline-dot" />
            <small>
              {day(r.updated)} · {r.actor}
            </small>
            <b>{r.name}</b>
            <span>
              V{r.rev}　{r.status}
            </span>
          </button>
        ))}
    </div>
  ) : (
    <Empty>暂无版本事件</Empty>
  );
}
