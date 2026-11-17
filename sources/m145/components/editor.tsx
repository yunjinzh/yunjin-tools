"use client";
import React, { useEffect, useState } from "react";
import {
  FileUp,
  Paperclip,
  ShieldCheck,
  Save,
  History,
  FileStack,
  GitCompareArrows,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  type Row,
  statuses,
  stages,
  kinds,
  priorities,
  confirmed,
  validation,
  fieldNames,
  blank,
} from "../lib/model";
import {
  detailFields,
  detailPairs,
  readDetails,
  displayDay,
  displayTime,
} from "../lib/detail-fields";
import { Select, Modal, Badge, Empty } from "./ui-work";
export async function fetchJson<T = Row[]>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, init);
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("服务暂时无法响应，请稍后重试。");
  }
  if (!res.ok)
    throw new Error(
      (data as { error?: string })?.error || "请求未成功，请稍后重试。",
    );
  return data as T;
}
export function Editor({
  initial,
  all,
  close,
  saved,
  allowSwitch = false,
}: {
  initial: Row;
  all: Row[];
  close: () => void;
  saved: (r: Row) => void;
  allowSwitch?: boolean;
}) {
  const [row, set] = useState<Row>({ ...initial }),
    [message, err] = useState(""),
    [affirm, check] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [busy, work] = useState(false),
    [conflict, setConflict] = useState<Row | null>(null);
  const update = (k: keyof Row, v: string | boolean) => {
    set((r) => ({
      ...r,
      [k]: v,
      ...(k === "parent"
        ? { related: "" }
        : k === "kind"
          ? { details: "" }
          : {}),
    }));
    check(false);
    err("");
  };
  const input = (
    key: keyof Row,
    title: string,
    required = false,
    type = "text",
    placeholder = "",
  ) => (
    <label className="field">
      <span>
        {title}
        {required && <em> *</em>}
      </span>
      <input
        required={required}
        type={type}
        value={String(row[key])}
        maxLength={1000}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
  const area = (
    key: keyof Row,
    title: string,
    placeholder = "",
    required = false,
  ) => (
    <label className="field full">
      <span>
        {title}
        {required && <em> *</em>}
      </span>
      <textarea
        required={required}
        rows={key === "body" ? 5 : 3}
        value={String(row[key])}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        maxLength={40000}
      />
    </label>
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    let r = { ...row };
    const msg = validation(
      { ...r, attachment: file ? "pending" : r.attachment },
      all,
      affirm,
    );
    if (msg) {
      err(msg);
      return;
    }
    work(true);
    err("");
    try {
      if (file) {
        const fd = new FormData();
        fd.set("file", file);
        const up = await fetchJson<{ id: string; name: string }>("/api/files", {
          method: "POST",
          body: fd,
        });
        r.attachment = up.id;
        r.filename = up.name;
        set(r);
        setFile(null);
      }
      const result = await fetchJson<Row>("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: r, affirm }),
      });
      saved(result);
    } catch (e) {
      const msg = (e as Error).message;
      err(msg);
      if (/新版本|其他人/.test(msg)) {
        try {
          const versions = await fetchJson("/api/records?history=" + row.id);
          setConflict(versions[0]);
        } catch {}
      }
    } finally {
      work(false);
    }
  }
  const project = row.type === "项目";
  const projects = all.filter((r) => r.type === "项目" && r.demo === row.demo);
  return (
    <Modal
      title={(row.rev ? "编辑" : "新建") + (project ? "项目" : row.kind)}
      close={() => {
        if (!busy) close();
      }}
      wide
    >
      <form onSubmit={submit}>
        <div className="modal-body form-grid">
          {allowSwitch && (
            <Select
              label="保存至工作区"
              value={row.demo ? "示例工作区" : "正式工作区"}
              options={["正式工作区", "示例工作区"]}
              onChange={(s) => update("demo", s === "示例工作区")}
            />
          )}
          {!project && (
            <>
              <label className="field">
                <span>
                  所属项目 <em>*</em>
                </span>
                <select
                  value={row.parent}
                  disabled={!!row.rev}
                  required
                  onChange={(e) => update("parent", e.target.value)}
                >
                  <option value="">选择项目</option>
                  {projects.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <Select
                label="材料类型"
                value={row.kind}
                options={kinds}
                onChange={(v) => update("kind", v)}
              />
            </>
          )}
          <div className="full">
            {input(
              "name",
              project ? "项目名称" : "记录名称",
              true,
              "text",
              project ? "输入项目名称" : "概括本条记录",
            )}
          </div>
          {project && (
            <>
              {input(
                "org",
                "拟合作学校 / 单位",
                false,
                "text",
                "已核实的合作关系另附确认记录",
              )}
              {input("scene", "应用场景", false, "text", "如：数字孪生校园")}
              {input("tech", "技术方向", false, "text", "如：GIS / BIM")}
            </>
          )}
          {input("owner", "负责人", false, "text", "姓名或责任组")}
          <Select
            label="项目阶段"
            value={row.stage}
            options={stages}
            onChange={(v) => update("stage", v)}
          />
          <Select
            label="优先级"
            value={row.priority}
            options={priorities}
            onChange={(v) => update("priority", v)}
          />
          <Select
            label="记录状态"
            value={row.status}
            options={statuses}
            onChange={(v) => update("status", v)}
          />
          {input("due", "截止日期", false, "date")}
          {area(
            "body",
            project ? "需求背景与项目说明" : "内容与说明",
            project
              ? "填写项目背景、需求边界与下一步工作。"
              : "记录需求、约定、技术细节或待解决的问题。",
          )}
          {!project && detailFields[row.kind] && (
            <fieldset className="structured full">
              <legend>{row.kind}明细</legend>
              <div className="form-grid">
                {detailFields[row.kind].map((k) => (
                  <label className="field" key={k}>
                    <span>{k}</span>
                    <input
                      value={readDetails(row.details)[k] || ""}
                      maxLength={5000}
                      type={
                        ["数量", "估算单价（元）"].includes(k)
                          ? "number"
                          : "text"
                      }
                      min="0"
                      step="any"
                      onChange={(e) =>
                        update(
                          "details",
                          JSON.stringify({
                            ...readDetails(row.details),
                            [k]: e.target.value,
                          }),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
              {row.kind === "预算与采购" &&
                detailPairs(row.kind, row.details)
                  .filter(([k]) => k === "测算小计（元）")
                  .map(([k, v]) => (
                    <p key={k} className="soft-note">
                      {k}　{v}
                    </p>
                  ))}
            </fieldset>
          )}
          {row.kind === "评审意见" &&
            area(
              "resolution",
              "修改回应与处理结果",
              "记录修改位置、回应说明和复核结果。",
              confirmed(row.status),
            )}
          {!project && (
            <label className="field full">
              <span>关联记录</span>
              <select
                value={row.related}
                onChange={(e) => update("related", e.target.value)}
              >
                <option value="">选择同一项目的需求、意见、交付物或证据</option>
                {all
                  .filter(
                    (a) =>
                      a.type === "记录" &&
                      a.parent === row.parent &&
                      a.id !== row.id,
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.kind} · {a.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <div className="full">
            <label className="upload">
              <FileUp size={20} />
              <span>
                <b>{file?.name || row.filename || "添加归档附件"}</b>
                <small>上传原文、评审记录或验收证据，单个文件 ≤ 20 MB</small>
              </span>
              <input
                aria-label="选择归档附件"
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f && f.size > 20 * 1024 * 1024) {
                    err("单个文件上限为 20 MB。");
                    e.target.value = "";
                    return;
                  }
                  setFile(f);
                  check(false);
                }}
              />
            </label>
          </div>
          {confirmed(row.status) && (
            <div className="verify full">
              <h3>
                <ShieldCheck size={17} />
                本次确认依据
              </h3>
              <p>
                确认只适用于本条记录及本次版本。请核对原文、签署记录或验收附件。
              </p>
              {input("reviewer", "确认人", true)}
              {area(
                "evidence",
                "可追溯依据",
                "填写文件名、日期、条款或页码，也可填写来源链接。",
                true,
              )}
              <label>
                <input
                  type="checkbox"
                  checked={affirm}
                  required
                  onChange={(e) => check(e.target.checked)}
                />{" "}
                我已核对本次版本与上述依据
              </label>
            </div>
          )}
          {row.origin && <p className="full muted">复用来源　{row.origin}</p>}
          {message && (
            <div role="alert" className="error full">
              {message}
            </div>
          )}
          {conflict && (
            <div className="full conflict">
              <b>服务器版本 V{conflict.rev}</b>
              <p>
                {conflict.name} · {conflict.status}
              </p>
              <pre>{conflict.body}</pre>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  set(conflict);
                  setConflict(null);
                  check(false);
                  err("");
                }}
              >
                载入此版本继续编辑
              </button>
            </div>
          )}
        </div>
        <footer className="modal-foot">
          <span>
            {row.demo ? "示例工作区" : "正式工作区"} ·{" "}
            {row.rev ? "下一版本 V" + (row.rev + 1) : "新记录"}
          </span>
          <button type="button" className="btn" disabled={busy} onClick={close}>
            取消
          </button>
          <button className="btn primary" disabled={busy}>
            <Save size={15} />
            {busy ? "正在保存…" : "保存记录"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
export function HistoryView({ row, all }: { row: Row; all: Row[] }) {
  const [list, set] = useState<Row[]>([]),
    [ids, choose] = useState([0, 0]),
    [err, error] = useState("");
  useEffect(() => {
    let alive = true;
    fetchJson("/api/records?history=" + row.id)
      .then((a) => {
        if (alive) {
          set(a);
          choose([a.length > 1 ? 1 : 0, 0]);
        }
      })
      .catch((e) => alive && error(e.message));
    return () => {
      alive = false;
    };
  }, [row.id, row.rev]);
  const a = list[ids[0]],
    b = list[ids[1]];
  const fmt = (r: Row, key: string) => {
    if (key.startsWith("field:"))
      return readDetails(r.details)[key.slice(6)] || "";
    const v = String(r[key as keyof Row] || "");
    return key === "related" ? all.find((a) => a.id === v)?.name || v : v;
  };
  return (
    <div>
      {err && <p className="error">{err}</p>}
      {!list.length && !err && <p className="muted">正在读取历史版本…</p>}
      {list.length > 0 && (
        <>
          <div className="history-chips">
            {list.map((v) => (
              <span key={v.rev}>
                V{v.rev} · {displayDay(v.updated)} · {v.actor}
              </span>
            ))}
          </div>
          {list.length === 1 ? (
            <p className="soft-note">
              已保存首个版本。下一次保存后可逐项对比差异。
            </p>
          ) : (
            <>
              <div className="compare-controls">
                {["较早版本", "比较版本"].map((label, i) => (
                  <label key={label}>
                    {label}
                    <select
                      value={ids[i]}
                      onChange={(e) =>
                        choose((prev) =>
                          prev.map((v, j) =>
                            i === j ? Number(e.target.value) : v,
                          ),
                        )
                      }
                    >
                      {list.map((r, j) => (
                        <option key={r.rev} value={j}>
                          V{r.rev} · {displayDay(r.updated)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              {a && b && (
                <div className="diff-list">
                  {[
                    ...Object.keys(fieldNames),
                    ...new Set(
                      [
                        ...Object.keys(readDetails(a.details)),
                        ...Object.keys(readDetails(b.details)),
                      ].map((k) => "field:" + k),
                    ),
                  ].filter((k) => fmt(a, k) !== fmt(b, k)).length === 0 ? (
                    <p className="soft-note">所选版本的业务字段一致。</p>
                  ) : (
                    [
                      ...Object.keys(fieldNames),
                      ...new Set(
                        [
                          ...Object.keys(readDetails(a.details)),
                          ...Object.keys(readDetails(b.details)),
                        ].map((k) => "field:" + k),
                      ),
                    ]
                      .filter((k) => fmt(a, k) !== fmt(b, k))
                      .map((k) => (
                        <div key={k}>
                          <b>{fieldNames[k] || k.slice(6)}</b>
                          <div className="diff-pair">
                            <span>{fmt(a, k) || "空"}</span>
                            <span>{fmt(b, k) || "空"}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
export function RecordDetail({
  r,
  all,
  close,
  edit,
  promote,
  open,
}: {
  r: Row;
  all: Row[];
  close: () => void;
  edit: () => void;
  promote: () => void;
  open: (r: Row) => void;
}) {
  const [tab, setTab] = useState("记录内容");
  const linked = all.find((a) => a.id === r.related);
  const parent = all.find((a) => a.id === r.parent);
  return (
    <Modal
      title={r.type === "模板" ? "模板详情" : "记录详情"}
      close={close}
      wide
    >
      <div className="detail-intro">
        <div className="inline">
          <Badge status={r.status} />
          <small className="mono">V{r.rev}</small>
          <small>{r.demo ? "示例记录" : r.kind}</small>
        </div>
        <h2>{r.name}</h2>
        <p>
          {parent?.name || "模板库"}　/　{r.kind}
        </p>
      </div>
      <div className="tabs detail-tabs">
        {["记录内容", "历史与版本对比"].map((t) => (
          <button
            key={t}
            className={t === tab ? "on" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="modal-body">
        {tab === "记录内容" ? (
          <>
            <div className="facts">
              {[
                ["负责人", r.owner || "待分配"],
                ["阶段", r.stage],
                ["优先级", r.priority],
                ["截止日期", r.due || "未设置"],
              ].map(([k, v]) => (
                <div key={k}>
                  <small>{k}</small>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            {detailPairs(r.kind, r.details).length > 0 && (
              <dl className="detail-dl">
                {detailPairs(r.kind, r.details).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <h3>内容与说明</h3>
            <p className="prose">{r.body || "尚未填写。"}</p>
            {r.kind === "评审意见" && (
              <>
                <h3>修改回应与处理结果</h3>
                <p className="prose">{r.resolution || "等待责任人回应。"}</p>
              </>
            )}
            {r.origin && <p className="soft-note">复用来源　{r.origin}</p>}
            {linked && (
              <button className="btn" onClick={() => open(linked)}>
                关联 · {linked.name}
                <ArrowRight size={14} />
              </button>
            )}
            {all.some((a) => a.related === r.id) && (
              <div className="linked">
                <small>引用本记录</small>
                {all
                  .filter((a) => a.related === r.id)
                  .map((a) => (
                    <button className="btn" key={a.id} onClick={() => open(a)}>
                      {a.kind} · {a.name}
                    </button>
                  ))}
              </div>
            )}
            {r.attachment && (
              <p>
                <a className="btn" href={"/api/files?id=" + r.attachment}>
                  <Paperclip size={15} />
                  {r.filename}
                </a>
              </p>
            )}
            {confirmed(r.status) && (
              <div className="verify">
                <h3>
                  <ShieldCheck size={16} />
                  核验记录
                </h3>
                <p>
                  {r.reviewer} · {displayTime(r.verifiedAt)}
                </p>
                <p className="prose">{r.evidence}</p>
              </div>
            )}
          </>
        ) : (
          <HistoryView row={r} all={all} />
        )}
      </div>
      <footer className="modal-foot">
        <span>{displayDay(r.updated)} 更新</span>
        {confirmed(r.status) && r.type === "记录" && (
          <button className="btn" onClick={promote}>
            <FileStack size={15} />
            沉淀为模板
          </button>
        )}
        {r.type !== "模板" && (
          <button className="btn primary" onClick={edit}>
            编辑记录
          </button>
        )}
      </footer>
    </Modal>
  );
}
