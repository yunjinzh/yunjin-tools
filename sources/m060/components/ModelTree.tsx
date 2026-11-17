"use client";

import { useMemo, useState } from "react";
import * as THREE from "three";
import { Box, ChevronDown, ChevronRight, Eye, EyeOff, Layers3, Search } from "lucide-react";

interface Props {
  root: THREE.Object3D | null;
  selected: THREE.Object3D | null;
  onSelect: (object: THREE.Object3D) => void;
  onFocus: (object: THREE.Object3D) => void;
}

function objectLabel(object: THREE.Object3D) {
  if (object.name?.trim()) return object.name.trim();
  if ((object as THREE.Mesh).isMesh) return "未命名网格";
  if ((object as THREE.Group).isGroup) return "未命名组";
  return object.type || "对象";
}

function isRenderable(object: THREE.Object3D) {
  const candidate = object as THREE.Mesh;
  return Boolean(candidate.isMesh || (candidate as unknown as THREE.Line).isLine || (candidate as unknown as THREE.Points).isPoints);
}

function collectSearchMatches(root: THREE.Object3D, query: string) {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  if (!normalized) return [];
  const matches: THREE.Object3D[] = [];
  root.traverse((object) => {
    if (matches.length >= 300) return;
    const haystack = `${objectLabel(object)} ${object.type} ${object.userData.ifcExpressID || ""}`.toLocaleLowerCase("zh-CN");
    if (haystack.includes(normalized)) matches.push(object);
  });
  return matches;
}

function TreeRow({
  object,
  depth,
  selected,
  expanded,
  onToggle,
  onVisibility,
  onSelect,
  onFocus,
}: {
  object: THREE.Object3D;
  depth: number;
  selected: THREE.Object3D | null;
  expanded: Set<string>;
  onToggle: (uuid: string) => void;
  onVisibility: (object: THREE.Object3D) => void;
  onSelect: (object: THREE.Object3D) => void;
  onFocus: (object: THREE.Object3D) => void;
}) {
  const hasChildren = object.children.length > 0;
  const isExpanded = expanded.has(object.uuid);
  const toggleVisibility = (event: React.MouseEvent) => {
    event.stopPropagation();
    onVisibility(object);
  };

  return (
    <>
      <div
        className={`tree-row ${selected === object ? "is-selected" : ""}`}
        style={{ paddingLeft: `${10 + depth * 15}px` }}
        role="treeitem"
        aria-selected={selected === object}
        onClick={() => onSelect(object)}
        onDoubleClick={() => onFocus(object)}
      >
        <button
          className="tree-caret"
          type="button"
          tabIndex={-1}
          aria-label={isExpanded ? "折叠" : "展开"}
          disabled={!hasChildren}
          onClick={(event) => {
            event.stopPropagation();
            if (hasChildren) onToggle(object.uuid);
          }}
        >
          {hasChildren ? (isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span />}
        </button>
        <span className={`tree-object-icon ${isRenderable(object) ? "is-mesh" : ""}`}>
          {isRenderable(object) ? <Box size={13} /> : <Layers3 size={13} />}
        </span>
        <span className="tree-name" title={`${objectLabel(object)} · ${object.type}`}>{objectLabel(object)}</span>
        <button
          className="tree-visibility"
          type="button"
          tabIndex={-1}
          aria-label={object.visible ? "隐藏对象" : "显示对象"}
          onClick={toggleVisibility}
        >
          {object.visible ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
      </div>
      {hasChildren && isExpanded && object.children.slice(0, 500).map((child) => (
        <TreeRow
          key={child.uuid}
          object={child}
          depth={depth + 1}
          selected={selected}
          expanded={expanded}
          onToggle={onToggle}
          onVisibility={onVisibility}
          onSelect={onSelect}
          onFocus={onFocus}
        />
      ))}
      {hasChildren && isExpanded && object.children.length > 500 && (
        <div className="tree-overflow-note" style={{ paddingLeft: `${30 + depth * 15}px` }}>
          为保证流畅，仅展示前 500 项；可用搜索定位其余对象
        </div>
      )}
    </>
  );
}

export default function ModelTree({ root, selected, onSelect, onFocus }: Props) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => root ? new Set([root.uuid]) : new Set());
  const [, setVisibilityVersion] = useState(0);
  const matches = useMemo(() => root ? collectSearchMatches(root, query) : [], [root, query]);

  const effectiveExpanded = useMemo(() => {
    if (!root) return expanded;
    if (expanded.size) return expanded;
    return new Set([root.uuid]);
  }, [expanded, root]);

  const toggle = (uuid: string) => {
    setExpanded((current) => {
      const next = new Set(current.size ? current : effectiveExpanded);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  };

  const toggleVisibility = (object: THREE.Object3D) => {
    object.visible = !object.visible;
    setVisibilityVersion((value) => value + 1);
  };

  return (
    <div className="tree-panel-body">
      <label className="tree-search">
        <Search size={14} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索名称、类型或 IFC ID"
          aria-label="搜索模型对象"
        />
      </label>
      <div className="tree-scroll" role="tree" aria-label="模型对象树">
        {!root && (
          <div className="panel-placeholder">
            <Layers3 size={24} />
            <span>打开模型后显示对象层级</span>
          </div>
        )}
        {root && query.trim() && (
          <>
            <div className="tree-result-count">找到 {matches.length}{matches.length === 300 ? "+" : ""} 个对象</div>
            {matches.map((object) => (
              <div
                key={object.uuid}
                className={`tree-row search-result ${selected === object ? "is-selected" : ""}`}
                role="treeitem"
                aria-selected={selected === object}
                onClick={() => onSelect(object)}
                onDoubleClick={() => onFocus(object)}
              >
                <span className={`tree-object-icon ${isRenderable(object) ? "is-mesh" : ""}`}>
                  {isRenderable(object) ? <Box size={13} /> : <Layers3 size={13} />}
                </span>
                <span className="tree-name">{objectLabel(object)}</span>
                <small>{object.type}</small>
              </div>
            ))}
            {!matches.length && <div className="tree-empty-search">没有匹配对象</div>}
          </>
        )}
        {root && !query.trim() && (
          <TreeRow
            key={root.uuid}
            object={root}
            depth={0}
            selected={selected}
            expanded={effectiveExpanded}
            onToggle={toggle}
            onVisibility={toggleVisibility}
            onSelect={onSelect}
            onFocus={onFocus}
          />
        )}
      </div>
      <p className="tree-footnote">单击选择 · 双击聚焦 · 眼睛控制显隐</p>
    </div>
  );
}
