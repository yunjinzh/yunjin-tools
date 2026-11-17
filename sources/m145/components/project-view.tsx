"use client";
import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Pencil,
  Download,
  Plus,
  Folder,
  GitPullRequest,
  History,
  FileBox,
  ClipboardCheck,
  Boxes,
} from "lucide-react";
import {
  type Row,
  stages,
  confirmed,
  materialKinds,
  acceptanceKinds,
} from "../lib/model";
import {
  Badge,
  RecordList,
  PanelTitle,
  ProjectIcon,
  Timeline,
  Empty,
} from "./ui-work";
import { fetchJson, HistoryView } from "./editor";
export function ProjectView({
  r,
  all,
  open,
  back,
  edit,
  add,
  exportView,
  reuse,
}: {
  r: Row;
  all: Row[];
  open: (r: Row) => void;
  back: () => void;
  edit: () => void;
  add: (k: string) => void;
  exportView: (items: Row[]) => void;
  reuse: () => void;
}) {
  const [tab, select] = useState("项目记录"),
    [kind, filter] = useState(""),
    [events, setEvents] = useState<Row[]>([]),
    [err, setErr] = useState("");
  const rec = all.filter((a) => a.parent === r.id);
  const versionsKey = [r, ...rec].map((x) => x.id + "-" + x.rev).join(",");
  useEffect(() => {
    if (tab !== "时间线") return;
    let active = true;
    setErr("");
    fetchJson("/api/records?timeline=" + r.id)
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((e) => active && setErr(e.message));
    return () => {
      active = false;
    };
  }, [tab, r.id, versionsKey]);
  const kinds = [...new Set(rec.map((a) => a.kind))];
  const list = rec.filter((a) =>
    tab === "评审闭环"
      ? a.kind === "评审意见"
      : tab === "材料归档"
        ? materialKinds.includes(a.kind) || !!a.attachment
        : tab === "交付验收"
          ? acceptanceKinds.includes(a.kind)
          : !kind || a.kind === kind,
  );
  return (
    <>
      <button className="back" onClick={back}>
        <ChevronLeft size={16} />
        项目台账
      </button>
      <section className="panel project-banner">
        <div className="project-name">
          <ProjectIcon r={r} />
          <div>
            <p>
              {r.demo ? "示例项目" : "正式项目"} · {r.scene || "应用场景待补录"}
            </p>
            <h1>{r.name}</h1>
          </div>
        </div>
        <div className="inline wrap">
          <Badge status={r.status} />
          <span className="mini">V{r.rev}</span>
          <button className="btn" onClick={edit}>
            <Pencil size={14} />
            编辑项目
          </button>
          <button className="btn" onClick={() => exportView([r, ...rec])}>
            <Download size={14} />
            导出项目
          </button>
        </div>
        <p className="prose">
          {r.body || "可在项目中补充需求背景与实施范围。"}
        </p>
        <div className="facts">
          {[
            ["拟合作学校 / 单位", r.org],
            ["技术方向", r.tech],
            ["负责人", r.owner],
            ["优先级", r.priority],
            ["截止日期", r.due],
          ].map(([k, v]) => (
            <div key={k}>
              <small>{k}</small>
              <b>{v || "待补录"}</b>
            </div>
          ))}
        </div>
        {confirmed(r.status) && (
          <div className="verify">
            <b>本项目记录核验依据</b>
            <p>
              {r.reviewer} · {r.evidence}
            </p>
          </div>
        )}
        <div className="stepper">
          {stages.map((s, i) => (
            <span className={s === r.stage ? "current" : ""} key={s}>
              <i>{i + 1}</i>
              {s}
            </span>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="tabs project-tabs">
          {[
            "项目记录",
            "评审闭环",
            "材料归档",
            "交付验收",
            "时间线",
            "项目版本",
          ].map((s) => (
            <button
              className={tab === s ? "on" : ""}
              key={s}
              onClick={() => select(s)}
            >
              {s}
            </button>
          ))}
        </div>
        {tab === "项目版本" ? (
          <div className="padding">
            <HistoryView row={r} all={all} />
          </div>
        ) : tab === "时间线" ? (
          <div className="padding">
            {err && <p role="alert">{err}</p>}
            <Timeline
              rows={events}
              open={(a) => open(all.find((x) => x.id === a.id) || r)}
            />
          </div>
        ) : (
          <>
            <div className="list-toolbar">
              <div className="inline wrap">
                {tab === "项目记录" ? (
                  <select
                    aria-label="筛选记录类型"
                    value={kind}
                    onChange={(e) => filter(e.target.value)}
                  >
                    <option value="">全部记录类型</option>
                    {kinds.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                ) : (
                  <b>{tab}</b>
                )}
                <span className="muted">{list.length} 条</span>
              </div>
              <div className="inline wrap">
                {tab === "项目记录" && (
                  <button className="btn" onClick={reuse}>
                    <Boxes size={15} />
                    复用模块
                  </button>
                )}
                <button
                  className="btn primary"
                  onClick={() =>
                    add(
                      tab === "评审闭环"
                        ? "评审意见"
                        : tab === "交付验收"
                          ? "交付物"
                          : tab === "材料归档"
                            ? "归档材料"
                            : kind || "客户需求",
                    )
                  }
                >
                  <Plus size={15} />
                  添加记录
                </button>
              </div>
            </div>
            <RecordList rows={list} all={all} open={open} />
          </>
        )}
      </section>
    </>
  );
}
