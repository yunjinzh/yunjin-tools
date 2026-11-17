"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Layers3,
  LayoutDashboard,
  Folders,
  Columns3,
  Inbox,
  ListChecks,
  MessagesSquare,
  Archive,
  PackageCheck,
  Boxes,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  ChevronsUpDown,
  ChevronDown,
  Plus,
  Download,
  SlidersHorizontal,
  ArrowUpRight,
  CalendarDays,
  Folder,
  ClipboardList,
  ShieldCheck,
  FileText,
  LibraryBig,
  ArrowRight,
  Check,
  Clock3,
  PanelLeft,
  UserRound,
  LayoutGrid,
  GitBranch,
  BookOpen,
  Workflow,
  ExternalLink,
} from "lucide-react";
import {
  blank,
  seeds,
  stages,
  statuses,
  priorities,
  kinds,
  type Row,
  confirmed,
  isTodo,
  materialKinds,
  acceptanceKinds,
  modules,
  sourceSite,
  fieldNames,
} from "../lib/model";
import {
  Badge,
  pad,
  Modal,
  Empty,
  Priority,
  ProjectTable,
  ProjectIcon,
  RecordList,
  PanelTitle,
} from "../components/ui-work";
import { Editor, RecordDetail, fetchJson } from "../components/editor";
import { Dashboard, todayCN, sortDue } from "../components/dashboard";
import { ProjectView } from "../components/project-view";
import {
  FilterPanel,
  filterKeys,
  matchRow,
  type Filters,
} from "../components/filters";
import { downloadOffice } from "../lib/export";

const nav = [
  {
    title: "工作空间",
    items: [
      ["工作台总览", LayoutDashboard],
      ["项目台账", Folders],
      ["阶段看板", Columns3],
    ],
  },
  {
    title: "执行协同",
    items: [
      ["需求池", Inbox],
      ["任务清单", ListChecks],
      ["评审中心", MessagesSquare],
    ],
  },
  {
    title: "交付资产",
    items: [
      ["材料归档", Archive],
      ["交付与验收", PackageCheck],
      ["模块与模板", Boxes],
    ],
  },
] as const;
const headlines: Record<string, string> = {
  项目台账: "按项目跟踪责任人、执行阶段与当前状态。",
  阶段看板: "沿六个交付阶段查看项目，打开卡片可调整阶段。",
  需求池: "汇集客户需求、沟通纪要和待确认事项。",
  任务清单: "跟踪责任分工、截止日期与下一步行动。",
  评审中心: "跟踪评审意见、修改回应与复核依据。",
  材料归档: "按项目归集方案、技术资料、投标响应和附件。",
  交付与验收: "关联交付清单、验收标准、证据与结论。",
  模块与模板: "从知识工作台复用模块，将已核验记录沉淀为模板。",
};
const english: Record<string, string> = {
  项目台账: "PROJECT REGISTER",
  阶段看板: "PROJECT BOARD",
  需求池: "REQUIREMENTS",
  任务清单: "TASKS",
  评审中心: "REVIEW LOG",
  材料归档: "ARCHIVE",
  交付与验收: "DELIVERY & ACCEPTANCE",
  模块与模板: "MODULE LIBRARY",
};
const categories: Record<string, string[]> = {
  需求池: ["客户需求", "会议纪要", "待确认事项", "合作信息"],
  评审中心: ["评审意见"],
  材料归档: materialKinds,
  交付与验收: acceptanceKinds,
};
type Overlay = {
  kind:
    | "edit"
    | "record"
    | "filter"
    | "export"
    | "search"
    | "switch"
    | "apply"
    | "promote";
  row?: Row;
  list?: Row[];
  title?: string;
  mod?: string[];
};
const start = "工作台总览";
function goHash(page: string, pid = "") {
  const url =
    "#" +
    new URLSearchParams({ view: page, ...(pid ? { id: pid } : {}) }).toString();
  if (location.hash !== url) location.hash = url;
}
function initialRecord(
  type: Row["type"],
  demo: boolean,
  kind = "客户需求",
  parent?: Row,
): Row {
  return {
    ...blank(),
    id: crypto.randomUUID(),
    type,
    demo,
    kind,
    parent: parent?.id || "",
    owner: parent?.owner || "",
    stage: parent?.stage || stages[0],
    priority: parent?.priority || "中",
  };
}
export default function Home() {
  const [all, setAll] = useState<Row[]>(seeds),
    [page, setPage] = useState(start),
    [pid, setPid] = useState(""),
    [demo, setDemo] = useState(true),
    [menu, setMenu] = useState(false),
    [modal, M] = useState<Overlay | null>(null),
    [filt, F] = useState<Filters>({}),
    [q, Q] = useState(""),
    [sub, S] = useState("全部"),
    [global, G] = useState(""),
    [msg, notify] = useState(""),
    [loadErr, setLoadErr] = useState(""),
    [ready, setReady] = useState(false),
    [reuseFrom, rememberProject] = useState(""),
    [target, T] = useState(""),
    [applyError, E] = useState(""),
    [busy, B] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const data = await fetchJson("/api/records", { cache: "no-store" });
      setAll(data);
      setLoadErr("");
      setReady(true);
      return data as Row[];
    } catch (e) {
      setLoadErr("云端记录读取失败，可重新载入。");
      return null;
    }
  }, []);
  const pickScope = (v: boolean) => {
    setDemo(v);
    localStorage.setItem("spatial-scope", v ? "demo" : "live");
  };
  useEffect(() => {
    const pref = localStorage.getItem("spatial-scope");
    if (pref) setDemo(pref === "demo");
    refresh().then((data) => {
      if (!pref && data?.some((r) => !r.demo && r.type === "项目"))
        setDemo(false);
    });
    const tick = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 45000);
    const focus = () => {
      void refresh();
    };
    window.addEventListener("focus", focus);
    const hash = () => {
      const p = new URLSearchParams(location.hash.slice(1)),
        v = p.get("view") || start;
      setPage(v === "项目详情" || v === start || v in headlines ? v : start);
      setPid(p.get("id") || "");
      setMenu(false);
      M(null);
      Q("");
      S("全部");
      F({});
      window.scrollTo(0, 0);
    };
    hash();
    window.addEventListener("hashchange", hash);
    const hot = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k" &&
        !document.querySelector("dialog[open]")
      ) {
        e.preventDefault();
        G("");
        M({ kind: "search" });
      }
    };
    document.addEventListener("keydown", hot);
    return () => {
      clearInterval(tick);
      window.removeEventListener("focus", focus);
      window.removeEventListener("hashchange", hash);
      document.removeEventListener("keydown", hot);
    };
  }, [refresh]);
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => notify(""), 3500);
      return () => clearTimeout(t);
    }
  }, [msg]);
  const go = (s: string, id = "") => {
    setMenu(false);
    M(null);
    if (s === page && id === pid) {
      F({});
      Q("");
      S("全部");
    }
    goHash(s, id);
  };
  const scope = all.filter((r) => r.demo === demo),
    projects = scope.filter((r) => r.type === "项目"),
    records = scope.filter((r) => r.type === "记录"),
    templates = scope.filter((r) => r.type === "模板"),
    project = all.find((r) => r.id === pid && r.type === "项目");
  const open = (r: Row) => {
    if (r.demo !== demo) pickScope(r.demo);
    if (r.type === "项目") go("项目详情", r.id);
    else M({ kind: "record", row: r });
  };
  const createProject = () =>
    M({ kind: "edit", row: initialRecord("项目", false, "项目") });
  const add = (kind: string, p?: Row) => {
    if (!projects.length && !p) {
      notify("先建立项目，再添加项目记录。");
      createProject();
      return;
    }
    M({
      kind: "edit",
      row: initialRecord("记录", p?.demo ?? demo, kind, p || projects[0]),
    });
  };
  const saved = (r: Row) => {
    setAll((prev) =>
      prev.some((a) => a.id === r.id)
        ? prev.map((a) => (a.id === r.id ? r : a))
        : [r, ...prev],
    );
    pickScope(r.demo);
    M(null);
    notify("已保存 · V" + r.rev);
    if (r.type === "项目") go("项目详情", r.id);
    else if (r.type === "记录") {
      M({ kind: "record", row: r });
    }
    void refresh();
  };
  const exportRows = (items: Row[], title = page) => {
    if (!items.length) {
      notify("当前视图没有可导出的记录。");
      return;
    }
    M({ kind: "export", list: items, title });
  };
  const fs = Object.entries(filt).filter(([, v]) => v);
  const filteredProjects = projects.filter((r) => matchRow(r, scope, filt, q));
  let pool = records.filter((r) =>
    page === "任务清单"
      ? isTodo(r) || r.kind === "执行任务"
      : (categories[page] || []).includes(r.kind) ||
        (page === "材料归档" && !!r.attachment),
  );
  if (page === "任务清单") pool = pool.sort(sortDue);
  const today = todayCN();
  const weekDate = new Date(today + "T00:00:00Z");
  weekDate.setUTCDate(weekDate.getUTCDate() + 7);
  const week = weekDate.toISOString().slice(0, 10);
  const tabs =
    page === "任务清单"
      ? ["全部", "逾期", "七日内到期", "已完成"]
      : page === "评审中心"
        ? ["全部", "待处理", "已闭环"]
        : page === "模块与模板"
          ? ["内置模块", "已确认模板"]
          : ["全部", ...(categories[page] || [])];
  const filteredRecords = pool.filter(
    (r) =>
      matchRow(r, scope, filt, q) &&
      (sub === "全部" ||
        (sub === "逾期"
          ? !!r.due && r.due < today && !confirmed(r.status)
          : sub === "七日内到期"
            ? r.due >= today && r.due <= week && !confirmed(r.status)
            : sub === "已完成"
              ? confirmed(r.status)
              : sub === "待处理"
                ? !confirmed(r.status)
                : sub === "已闭环"
                  ? confirmed(r.status)
                  : r.kind === sub)),
  );
  const countTasks = records.filter(isTodo).length;
  const isProjects = ["项目台账", "阶段看板"].includes(page);
  const newRecord = () =>
    isProjects
      ? createProject()
      : add(
          page === "评审中心"
            ? "评审意见"
            : page === "任务清单"
              ? "执行任务"
              : page === "材料归档"
                ? "归档材料"
                : page === "交付与验收"
                  ? acceptanceKinds.includes(sub)
                    ? sub
                    : "交付物"
                  : kinds.includes(sub)
                    ? sub
                    : "客户需求",
        );
  const applyModule = (mod?: string[], row?: Row, pre?: string) => {
    T(
      pre ||
        projects.find((p) => p.id === reuseFrom)?.id ||
        projects[0]?.id ||
        "",
    );
    E("");
    M({ kind: "apply", mod, row });
  };
  const applyDraft = () => {
    const p = projects.find((x) => x.id === target);
    if (!p) {
      E("请先在当前工作区新建目标项目。");
      return;
    }
    const source = modal!.row,
      m = modal!.mod;
    let r = initialRecord("记录", demo, source?.kind || "功能模块", p);
    if (source) {
      r = {
        ...r,
        name: source.name,
        body: source.body,
        details: source.details,
        origin: source.id + "@V" + source.rev + " · " + source.name,
      };
    } else if (m) {
      r = {
        ...r,
        name: m[1],
        body: "适用方向：" + m[2] + "\n输入：" + m[3] + "\n产出：" + m[4],
        origin:
          (m[5] ? "项目知识工作台 / " : "本站参考 / ") +
          m[0] +
          " · " +
          m[1] +
          "（" +
          m[6] +
          "）",
      };
    }
    M({ kind: "edit", row: r });
  };
  async function promote(r: Row) {
    B(true);
    E("");
    try {
      const t = { ...initialRecord("模板", r.demo, r.kind), name: r.name };
      const result = await fetchJson<Row>("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: t, sourceId: r.id, sourceRev: r.rev }),
      });
      setAll((a) => [result, ...a]);
      M(null);
      notify("已保存可复用模板 · " + r.name);
    } catch (e) {
      E((e as Error).message);
    } finally {
      B(false);
    }
  }
  const latest = modal?.row
    ? all.find((a) => a.id === modal.row!.id) || modal.row
    : null;
  const headAdd = page !== "模块与模板" && page !== start;
  const showFilter = () => M({ kind: "filter" });
  const scopedSwitch = (v: boolean) => {
    rememberProject("");
    pickScope(v);
    M(null);
    F({});
    Q("");
    S("全部");
    if (page === "项目详情") go(start);
  };
  const displayDate = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
  const toolbar = (
    <>
      <div className="list-toolbar">
        <span className="search-field">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => Q(e.target.value)}
            placeholder={isProjects ? "搜索项目或合作单位" : "搜索记录或项目"}
            aria-label="搜索当前视图"
          />
        </span>
        <div className="inline">
          <button className="btn" onClick={showFilter}>
            <SlidersHorizontal size={15} />
            筛选{fs.length > 0 && <b>{fs.length}</b>}
          </button>
          <button
            className="btn"
            onClick={() =>
              exportRows(isProjects ? filteredProjects : filteredRecords)
            }
          >
            <Download size={15} />
            导出
          </button>
        </div>
      </div>
      {fs.length > 0 && (
        <div className="filter-tags">
          {fs.map(([k, v]) => (
            <button key={k} onClick={() => F({ ...filt, [k]: "" })}>
              {v} <X size={12} />
            </button>
          ))}
          <button onClick={() => F({})}>清除全部</button>
        </div>
      )}
    </>
  );
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="scrim"
          onClick={() => setMenu(false)}
          aria-label="关闭侧栏"
        />
      )}
      <aside className={"sidebar " + (menu ? "visible" : "")}>
        <button className="brand" onClick={() => go(start)}>
          <img src="/favicon.svg" width="37" height="37" alt="" />
          <span>
            <b>交付协同台</b>
            <small>SPATIAL OPS</small>
          </span>
        </button>
        <nav>
          {nav.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-caption">{group.title}</div>
              {group.items.map(([title, Icon]) => (
                <button
                  key={title}
                  className={
                    "nav-item " +
                    (page === title ||
                    (page === "项目详情" && title === "项目台账")
                      ? "active"
                      : "")
                  }
                  onClick={() => go(title)}
                >
                  <Icon size={17} strokeWidth={1.75} />
                  <span>{title}</span>
                  {title === "任务清单" && countTasks > 0 && (
                    <em>{countTasks}</em>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="side-bottom">
          <a href={sourceSite} target="_blank" rel="noreferrer">
            <LibraryBig size={16} />
            项目知识工作台
            <ArrowUpRight size={14} />
          </a>
          <button
            className="workspace-switch"
            onClick={() => M({ kind: "switch" })}
          >
            <span className="workspace-icon">
              <Layers3 size={19} />
            </span>
            <span>
              <b>{demo ? "示例工作区" : "正式工作区"}</b>
              <small>{demo ? "演练数据" : "项目执行记录"}</small>
            </span>
            <ChevronsUpDown size={14} />
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="inline crumbs">
            <button
              className="mobile-menu icon"
              onClick={() => setMenu(true)}
              aria-label="打开导航"
            >
              <Menu size={20} />
            </button>
            <PanelLeft size={17} />
            <span>工作空间</span>
            <i>/</i>
            <b>{page}</b>
          </div>
          <div className="header-tools">
            <button
              className="global-search"
              onClick={() => {
                G("");
                M({ kind: "search" });
              }}
            >
              <Search size={15} />
              <span>搜索工作台</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="bell icon"
              onClick={() => go("任务清单")}
              aria-label={"查看 " + countTasks + " 项待办"}
            >
              <Bell size={18} />
              {countTasks > 0 && <i />}
            </button>
            <span className="head-divider" />
            <button
              className="avatar"
              aria-label="切换工作区"
              onClick={() => M({ kind: "switch" })}
            >
              <UserRound size={17} />
            </button>
          </div>
        </header>
        <main className="content">
          {loadErr && (
            <div className="error">
              {" "}
              {loadErr} <button onClick={() => void refresh()}>重新载入</button>
            </div>
          )}
          {page === start ? (
            <>
              <div className="overview-line">
                <div className="inline">
                  <span className="live-dot" />
                  <b>工作台概览</b>
                  <button
                    className="scope-mini"
                    onClick={() => M({ kind: "switch" })}
                  >
                    {demo ? "示例工作区" : "正式工作区"}
                    <ChevronDown size={11} />
                  </button>
                </div>
                <span suppressHydrationWarning>
                  <CalendarDays size={14} />
                  {displayDate}
                </span>
              </div>
              <Dashboard
                rows={scope}
                demo={demo}
                open={open}
                go={go}
                create={createProject}
                filter={() => {
                  go("项目台账");
                  setTimeout(showFilter, 100);
                }}
              />
            </>
          ) : page === "项目详情" ? (
            project ? (
              <ProjectView
                key={project.id}
                r={project}
                all={all}
                open={open}
                back={() => go("项目台账")}
                edit={() => M({ kind: "edit", row: project })}
                add={(k) => add(k, project)}
                exportView={(rs) => exportRows(rs, project.name)}
                reuse={() => {
                  rememberProject(project.id);
                  go("模块与模板");
                }}
              />
            ) : (
              <Empty>{ready ? "没有找到此项目" : "正在读取项目…"}</Empty>
            )
          ) : (
            <>
              <div className="page-intro">
                <div>
                  <div className="eyebrow">
                    <i />
                    {english[page]}
                  </div>
                  <h1>{page}</h1>
                  <p>{headlines[page]}</p>
                </div>
                <div className="intro-action">
                  <button
                    className="scope-mini"
                    onClick={() => M({ kind: "switch" })}
                  >
                    {demo ? "示例工作区" : "正式工作区"}{" "}
                    <ChevronDown size={12} />
                  </button>
                  {headAdd && (
                    <button className="btn primary" onClick={newRecord}>
                      <Plus size={15} />
                      {isProjects
                        ? "新建项目"
                        : page === "任务清单"
                          ? "新建任务"
                          : "新增记录"}
                    </button>
                  )}
                </div>
              </div>
              {page === "模块与模板" ? (
                <>
                  <div className="tabs standalone">
                    {tabs.map((t) => (
                      <button
                        className={
                          (sub === "全部" ? t === "内置模块" : sub === t)
                            ? "on"
                            : ""
                        }
                        key={t}
                        onClick={() => S(t)}
                      >
                        {t}
                        <small>
                          {t === "内置模块" ? modules.length : templates.length}
                        </small>
                      </button>
                    ))}
                  </div>
                  {sub !== "已确认模板" ? (
                    <div className="module-grid">
                      {modules.map((m, i) => (
                        <article className="panel module-card" key={m[0]}>
                          <div className="module-top">
                            <span className={"project-icon hue" + (i % 6)}>
                              <Boxes size={21} />
                            </span>
                            <span className="mini">{m[6]}</span>
                          </div>
                          <small>{m[2]}</small>
                          <h2>{m[1]}</h2>
                          <dl>
                            <dt>输入</dt>
                            <dd>{m[3]}</dd>
                            <dt>产出</dt>
                            <dd>{m[4]}</dd>
                          </dl>
                          <div className="module-foot">
                            {m[5] ? (
                              <a
                                href={sourceSite + "/#project=" + m[5]}
                                target="_blank"
                                rel="noreferrer"
                              >
                                原站案例 <ArrowUpRight size={12} />
                              </a>
                            ) : (
                              <small>本站参考草案</small>
                            )}
                            <button
                              className="text-button"
                              onClick={() => applyModule(m)}
                            >
                              套用到项目 <ArrowRight size={13} />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="panel">
                      {templates.length ? (
                        templates.map((t) => (
                          <div className="template-row" key={t.id}>
                            <button
                              className="text-button"
                              onClick={() => open(t)}
                            >
                              <FileText size={17} />
                              {t.name}
                            </button>
                            <Badge status={t.status} />
                            <button
                              className="btn"
                              onClick={() => applyModule(undefined, t)}
                            >
                              套用到项目
                            </button>
                          </div>
                        ))
                      ) : (
                        <Empty>
                          在已确认记录的详情中选择“沉淀为模板”，即可在此复用。
                        </Empty>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <section
                  className={
                    "panel " + (page === "阶段看板" ? "board-panel" : "")
                  }
                >
                  {toolbar}
                  {page === "项目台账" ? (
                    <ProjectTable rows={filteredProjects} open={open} />
                  ) : page === "阶段看板" ? (
                    <div className="board-grid">
                      {stages.map((s, i) => (
                        <div className={"board-col stage" + i} key={s}>
                          <h3>
                            <i />
                            {s}
                            <small>
                              {
                                filteredProjects.filter((p) => p.stage === s)
                                  .length
                              }
                            </small>
                          </h3>
                          {filteredProjects
                            .filter((p) => p.stage === s)
                            .map((p) => (
                              <button
                                className="board-card"
                                key={p.id}
                                onClick={() => open(p)}
                              >
                                <Priority v={p.priority} />
                                <b>{p.name}</b>
                                <small>{p.org || "单位待补录"}</small>
                                <div className="board-card-foot">
                                  <Badge status={p.status} />
                                  <span>{p.owner || "待分配"}</span>
                                </div>
                              </button>
                            ))}
                          {!filteredProjects.some((p) => p.stage === s) && (
                            <div className="board-empty">暂无项目</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="tabs list-tabs">
                        {tabs
                          .filter((s, i, a) => a.indexOf(s) === i)
                          .map((t) => (
                            <button
                              className={sub === t ? "on" : ""}
                              key={t}
                              onClick={() => S(t)}
                            >
                              {t}
                            </button>
                          ))}
                      </div>
                      <RecordList
                        rows={filteredRecords}
                        all={all}
                        open={open}
                      />
                    </>
                  )}
                  <div className="list-count">
                    {isProjects
                      ? filteredProjects.length + " 个项目"
                      : filteredRecords.length + " 条记录"}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
      {modal?.kind === "filter" && (
        <FilterPanel
          all={scope}
          filters={filt}
          close={() => M(null)}
          apply={(f) => {
            F(f);
            M(null);
          }}
        />
      )}
      {modal?.kind === "edit" && modal.row && (
        <Editor
          key={modal.row.id}
          initial={modal.row}
          all={all}
          saved={saved}
          close={() => M(null)}
          allowSwitch={modal.row.type === "项目" && !modal.row.rev}
        />
      )}
      {modal?.kind === "record" && latest && (
        <RecordDetail
          key={latest.id}
          r={latest}
          all={all}
          open={open}
          close={() => M(null)}
          edit={() => M({ kind: "edit", row: latest })}
          promote={() => {
            E("");
            M({ kind: "promote", row: latest });
          }}
        />
      )}
      {modal?.kind === "promote" && latest && (
        <Modal title="沉淀为可复用模板" close={() => M(null)}>
          <div className="modal-body">
            <p>
              保存「{latest.name}」的 V{latest.rev}{" "}
              内容、确认依据和来源版本。后续套用到项目时从草案开始。
            </p>
            {applyError && <p className="error">{applyError}</p>}
          </div>
          <footer className="modal-foot">
            <button
              className="btn primary"
              disabled={busy}
              onClick={() => promote(latest)}
            >
              {busy ? "正在保存…" : "保存模板"}
            </button>
          </footer>
        </Modal>
      )}
      {modal?.kind === "switch" && (
        <Modal title="切换工作区" close={() => M(null)}>
          <div className="modal-body options">
            {[false, true].map((v) => (
              <button key={String(v)} onClick={() => scopedSwitch(v)}>
                <span className="workspace-icon">
                  {v ? <Layers3 size={21} /> : <Folders size={21} />}
                </span>
                <span>
                  <b>{v ? "示例工作区" : "正式工作区"}</b>
                  <small>
                    {v
                      ? "使用演练项目体验完整交付流程。"
                      : "保存真实项目、执行记录与验收资料。"}
                  </small>
                </span>
                {demo === v && <Check size={18} />}
              </button>
            ))}
          </div>
        </Modal>
      )}
      {modal?.kind === "export" && (
        <Modal title="导出当前视图" close={() => M(null)}>
          <div className="modal-body">
            <p className="soft-note">
              {modal.title} · {modal.list?.length} 条 ·{" "}
              {demo ? "示例工作区" : "正式工作区"}
            </p>
            <div className="options">
              {(["docx", "xlsx"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    downloadOffice(
                      fmt,
                      modal.title || page,
                      modal.list || [],
                      all,
                    );
                    M(null);
                    notify("已生成 " + fmt.toUpperCase() + " 文件");
                  }}
                >
                  <span className="workspace-icon">
                    {fmt === "docx" ? (
                      <FileText size={20} />
                    ) : (
                      <LayoutGrid size={20} />
                    )}
                  </span>
                  <span>
                    <b>{fmt === "docx" ? "Word 文档" : "Excel 工作簿"}</b>
                    <small>
                      {fmt === "docx"
                        ? "按记录展开，可用于评审汇报。"
                        : "保留字段与状态，可继续筛选和整理。"}
                    </small>
                  </span>
                  <Download size={16} />
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
      {modal?.kind === "apply" && (
        <Modal title="套用到项目" close={() => M(null)}>
          <div className="modal-body">
            <h3>{modal.mod?.[1] || modal.row?.name}</h3>
            <p className="soft-note">
              将内容复制为目标项目的草案，可在保存前调整适用范围。
            </p>
            <label className="field">
              <span>目标项目</span>
              <select value={target} onChange={(e) => T(e.target.value)}>
                <option value="">选择目标项目</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            {applyError && <p className="error">{applyError}</p>}
          </div>
          <footer className="modal-foot">
            <button
              className="btn primary"
              onClick={projects.length ? applyDraft : createProject}
            >
              {projects.length ? "创建项目草案" : "先新建项目"}
            </button>
          </footer>
        </Modal>
      )}
      {modal?.kind === "search" && (
        <Modal title="搜索工作台" close={() => M(null)}>
          <div className="modal-body">
            <span className="search-field full-search">
              <Search size={17} />
              <input
                autoFocus
                value={global}
                onChange={(e) => G(e.target.value)}
                placeholder="搜索项目、单位、材料或负责人"
              />
            </span>
            <p className="search-caption">
              {demo ? "示例工作区" : "正式工作区"} ·{" "}
              {global ? "搜索结果" : "项目快捷入口"}
            </p>
            <div className="quick-results">
              {(global
                ? scope.filter((r) =>
                    [r.name, r.body, r.owner, r.org, r.kind]
                      .join(" ")
                      .toLowerCase()
                      .includes(global.toLowerCase()),
                  )
                : projects
              ).map((r) => (
                <button key={r.id} onClick={() => open(r)}>
                  <span>
                    <small>
                      {r.kind} · {r.status}
                    </small>
                    <b>{r.name}</b>
                  </span>
                  <ChevronRight size={15} />
                </button>
              ))}
              {global &&
                !scope.some((r) =>
                  [r.name, r.body, r.owner, r.org, r.kind]
                    .join(" ")
                    .toLowerCase()
                    .includes(global.toLowerCase()),
                ) && <Empty>没有匹配结果</Empty>}
            </div>
          </div>
        </Modal>
      )}
      {msg && (
        <div className="toast" role="status">
          <Check size={16} />
          {msg}
        </div>
      )}
    </div>
  );
}
