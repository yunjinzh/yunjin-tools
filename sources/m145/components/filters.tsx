"use client";
import { useState } from "react";
import {
  type Row,
  fieldNames,
  stages,
  statuses,
  priorities,
  kinds,
} from "../lib/model";
import { Modal, Select } from "./ui-work";
export const filterKeys = [
  "project",
  "org",
  "scene",
  "tech",
  "stage",
  "owner",
  "kind",
  "priority",
  "status",
] as const;
export type Filters = Partial<Record<(typeof filterKeys)[number], string>>;
export function matchRow(r: Row, all: Row[], f: Filters, q: string) {
  const p = r.type === "项目" ? r : all.find((a) => a.id === r.parent);
  if (!p) return false;
  const text = q.trim().toLowerCase();
  if (
    text &&
    ![p.name, p.org, p.scene, p.tech, r.name, r.body, r.owner]
      .join(" ")
      .toLowerCase()
      .includes(text)
  )
    return false;
  for (const key of ["project", "org", "scene", "tech"] as const)
    if (f[key] && (key === "project" ? p.name : p[key]) !== f[key])
      return false;
  if (r.type === "项目" && f.kind) {
    return all.some(
      (a) =>
        a.parent === r.id &&
        a.kind === f.kind &&
        ["stage", "owner", "priority", "status"].every(
          (k) =>
            !f[k as keyof Filters] ||
            a[k as keyof Row] === f[k as keyof Filters],
        ),
    );
  }
  return (["stage", "owner", "kind", "priority", "status"] as const).every(
    (k) => !f[k] || r[k] === f[k],
  );
}
export function FilterPanel({
  all,
  filters,
  apply,
  close,
}: {
  all: Row[];
  filters: Filters;
  apply: (f: Filters) => void;
  close: () => void;
}) {
  const [f, set] = useState<Filters>({ ...filters }),
    ps = all.filter((r) => r.type === "项目");
  return (
    <Modal title="筛选工作视图" close={close}>
      <div className="modal-body form-grid">
        {filterKeys.map((k) => {
          const opts =
            k === "project"
              ? ps.map((p) => p.name)
              : k === "status"
                ? statuses
                : k === "stage"
                  ? stages
                  : k === "priority"
                    ? priorities
                    : k === "kind"
                      ? kinds
                      : all.map((r) => r[k]);
          return (
            <Select
              key={k}
              label={k === "project" ? "项目名称" : fieldNames[k]}
              options={[...new Set(opts.filter(Boolean))]}
              value={f[k] || ""}
              empty="全部"
              onChange={(v) => set((s) => ({ ...s, [k]: v }))}
            />
          );
        })}
      </div>
      <footer className="modal-foot">
        <button className="btn" onClick={() => set({})}>
          清除条件
        </button>
        <span />
        <button className="btn primary" onClick={() => apply(f)}>
          应用筛选
        </button>
      </footer>
    </Modal>
  );
}
