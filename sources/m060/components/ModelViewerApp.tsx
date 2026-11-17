"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  Box,
  Camera,
  ChevronDown,
  CircleHelp,
  Eye,
  EyeOff,
  FileBox,
  Focus,
  FolderOpen,
  Grid3X3,
  Hand,
  ImageDown,
  Info,
  Layers3,
  Maximize2,
  MousePointer2,
  PanelLeft,
  PanelRight,
  Pause,
  Play,
  RotateCw,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import ModelViewport, { type ModelViewportHandle } from "./ModelViewport";
import ModelTree from "./ModelTree";
import { loadDemoStep, loadModelFiles } from "../lib/model-loaders";
import type {
  InteractionMode,
  LoadedModel,
  LoadProgress,
  Measurement,
  SelectionInfo,
  StandardView,
  ViewerSettings,
} from "../lib/model-types";
import {
  FORMAT_LABELS,
  MODEL_FILE_ACCEPT,
  formatCount,
  formatFileSize,
  formatLength,
} from "../lib/model-utils";

const DEFAULT_SETTINGS: ViewerSettings = {
  projection: "perspective",
  background: "#dfe3df",
  grid: true,
  axes: true,
  shadows: true,
  wireframe: false,
  opacity: 1,
  sectionEnabled: false,
  sectionPercent: 58,
  animationPlaying: false,
};

const FORMAT_BADGES = ["FBX", "GLB", "GLTF", "IFC", "STEP", "STL", "OBJ", "PLY", "3MF", "DAE", "IGES", "BREP"];

function objectDisplayName(object: THREE.Object3D) {
  return object.name?.trim() || object.type || "未命名对象";
}

function materialNames(object: THREE.Object3D) {
  const mesh = object as THREE.Mesh;
  if (!mesh.material) return "—";
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return materials.map((material) => material.name || material.type).join(", ");
}

function baseProperties(object: THREE.Object3D) {
  const mesh = object as THREE.Mesh;
  const geometry = mesh.geometry;
  const position = geometry?.getAttribute?.("position");
  const triangles = geometry ? (geometry.index ? geometry.index.count / 3 : (position?.count || 0) / 3) : null;
  const positionWorld = object.getWorldPosition(new THREE.Vector3());
  return {
    名称: objectDisplayName(object),
    类型: object.type,
    UUID: object.uuid,
    可见: object.visible ? "是" : "否",
    子对象: object.children.length,
    顶点数: position ? formatCount(position.count) : "—",
    三角面: triangles == null ? "—" : formatCount(Math.round(triangles)),
    材质: materialNames(object),
    世界坐标: `${positionWorld.x.toFixed(3)}, ${positionWorld.y.toFixed(3)}, ${positionWorld.z.toFixed(3)}`,
    ...Object.fromEntries(
      Object.entries(object.userData)
        .filter(([key, value]) => !key.startsWith("__") && ["string", "number", "boolean"].includes(typeof value))
        .slice(0, 20),
    ),
  } as Record<string, unknown>;
}

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/out of memory|allocation failed/i.test(message)) return "浏览器内存不足。请关闭其他大型页面，或先简化模型后重试。";
  if (/unexpected token|parse/i.test(message)) return `模型解析失败：${message}`;
  return message || "模型加载失败，请确认文件完整且格式正确。";
}

function formatProperty(value: unknown) {
  if (value == null || value === "") return "—";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString("zh-CN") : value.toFixed(4);
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value === "object") {
    try { return JSON.stringify(value); } catch { return String(value); }
  }
  return String(value);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ToolButton({
  label,
  title,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label?: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`tool-button ${active ? "is-active" : ""}`}
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      {label && <span>{label}</span>}
    </button>
  );
}

export default function ModelViewerApp() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const viewportRef = useRef<ModelViewportHandle | null>(null);
  const modelRef = useRef<LoadedModel | null>(null);
  const selectionRequestRef = useRef(0);
  const dragDepthRef = useRef(0);
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [progress, setProgress] = useState<LoadProgress | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<InteractionMode>("select");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [selected, setSelected] = useState<THREE.Object3D | null>(null);
  const [properties, setProperties] = useState<Record<string, unknown>>({});
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [rightTab, setRightTab] = useState<"properties" | "display">("properties");
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => () => {
    modelRef.current?.dispose();
  }, []);

  const updateSettings = <K extends keyof ViewerSettings>(key: K, value: ViewerSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const acceptModel = (loaded: LoadedModel) => {
    const previous = modelRef.current;
    modelRef.current = loaded;
    setModel(loaded);
    setSelected(null);
    setProperties({});
    setMeasurements([]);
    setProgress(null);
    setError("");
    setNotice(`${FORMAT_LABELS[loaded.format]} 模型已加载 · ${formatCount(loaded.stats.triangles)} 个三角面`);
    previous?.dispose();
  };

  const loadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    setError("");
    setNotice("");
    setProgress({ phase: "正在准备模型解析器…", percent: 3 });
    try {
      const loaded = await loadModelFiles(files, setProgress);
      acceptModel(loaded);
    } catch (loadError) {
      setProgress(null);
      setError(readableError(loadError));
    }
  };

  const loadSample = async () => {
    setError("");
    setNotice("");
    setProgress({ phase: "正在读取内置 STEP 示例…", percent: 3 });
    try {
      acceptModel(await loadDemoStep(setProgress));
    } catch (loadError) {
      setProgress(null);
      setError(readableError(loadError));
    }
  };

  const clearModel = () => {
    const previous = modelRef.current;
    modelRef.current = null;
    setModel(null);
    setSelected(null);
    setProperties({});
    setMeasurements([]);
    setNotice("");
    setError("");
    previous?.dispose();
  };

  const selectObject = async (selection: SelectionInfo | null) => {
    const object = selection?.object || null;
    setSelected(object);
    setRightTab("properties");
    if (!object) {
      setProperties({});
      return;
    }
    const request = ++selectionRequestRef.current;
    const base = baseProperties(object);
    setProperties(base);
    if (model?.getProperties) {
      try {
        const extra = await model.getProperties(object);
        if (selectionRequestRef.current === request) setProperties({ ...base, ...extra });
      } catch {
        if (selectionRequestRef.current === request) setProperties(base);
      }
    }
  };

  const selectFromTree = (object: THREE.Object3D) => {
    viewportRef.current?.selectObject(object);
    setLeftOpen(false);
  };

  const focusFromTree = (object: THREE.Object3D) => {
    viewportRef.current?.focusObject(object);
    setLeftOpen(false);
  };

  const setStandardView = (view: StandardView) => {
    viewportRef.current?.setView(view);
    setViewMenuOpen(false);
  };

  const takeScreenshot = async () => {
    try {
      const blob = await viewportRef.current?.screenshot();
      if (blob) downloadBlob(blob, `${model?.fileName.replace(/\.[^.]+$/, "") || "GeoModel"}_视图.png`);
    } catch (screenshotError) {
      setError(readableError(screenshotError));
    }
  };

  const dimensions = model?.stats.dimensions;
  const dimensionLabel = dimensions
    ? `${formatLength(dimensions.x, model.unit)} × ${formatLength(dimensions.y, model.unit)} × ${formatLength(dimensions.z, model.unit)}`
    : "—";
  const visiblePropertyEntries = useMemo(() => Object.entries(properties).slice(0, 80), [properties]);

  return (
    <main
      className="viewer-shell"
      onDragEnter={(event) => {
        event.preventDefault();
        dragDepthRef.current += 1;
        setDragActive(true);
      }}
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) setDragActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragDepthRef.current = 0;
        setDragActive(false);
        void loadFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        multiple
        accept={MODEL_FILE_ACCEPT}
        onChange={(event) => {
          if (event.target.files) void loadFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        className="visually-hidden"
        type="file"
        multiple
        {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(event) => {
          if (event.target.files) void loadFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark"><Box size={20} strokeWidth={1.7} /><span /></div>
          <div>
            <h1>GeoModel</h1>
            <p>通用三维模型浏览器</p>
          </div>
          <span className="version-chip">LOCAL · WEB</span>
        </div>
        <div className="header-actions">
          <button className="button secondary compact-only" type="button" onClick={() => setLeftOpen(true)}><PanelLeft size={16} />结构</button>
          <button className="button primary" type="button" onClick={() => fileInputRef.current?.click()}><Upload size={16} />打开模型</button>
          <button className="button secondary folder-button" type="button" onClick={() => folderInputRef.current?.click()}><FolderOpen size={16} />打开文件夹</button>
          <button className="button ghost sample-button" type="button" onClick={() => void loadSample()}><Sparkles size={16} />STEP 示例</button>
          <button className="icon-button compact-only" type="button" aria-label="显示设置" onClick={() => setRightOpen(true)}><PanelRight size={18} /></button>
          <button className="icon-button" type="button" aria-label="使用帮助" onClick={() => setHelpOpen(true)}><CircleHelp size={18} /></button>
        </div>
      </header>

      <div className="format-strip" aria-label="支持的文件格式">
        <span>本地解析</span>
        {FORMAT_BADGES.map((format) => <b key={format}>{format}</b>)}
        <i>文件不会上传服务器</i>
      </div>

      <section className="workspace">
        <aside className={`side-panel left-panel ${leftOpen ? "mobile-open" : ""}`}>
          <div className="panel-heading">
            <div><small>STRUCTURE</small><h2>模型结构</h2></div>
            <button className="panel-close" type="button" aria-label="关闭结构面板" onClick={() => setLeftOpen(false)}><X size={17} /></button>
          </div>
          <div className="file-summary">
            <span className="file-format-mark">{model ? FORMAT_LABELS[model.format].split(" ")[0] : "3D"}</span>
            <div>
              <strong title={model?.fileName}>{model?.fileName || "尚未打开模型"}</strong>
              <small>{model ? `${formatFileSize(model.sizeBytes)} · ${model.resourceCount} 个资源文件` : "支持拖放文件与完整资源文件夹"}</small>
            </div>
          </div>
          <ModelTree key={model?.root.uuid || "empty"} root={model?.root || null} selected={selected} onSelect={selectFromTree} onFocus={focusFromTree} />
        </aside>

        <section className="viewport-column">
          <div className="viewport-toolbar" aria-label="三维视图工具栏">
            <div className="tool-group">
              <ToolButton title="旋转与浏览" active={mode === "orbit"} onClick={() => setMode("orbit")}><Hand size={16} /></ToolButton>
              <ToolButton title="选择对象" active={mode === "select"} onClick={() => setMode("select")}><MousePointer2 size={16} /></ToolButton>
              <ToolButton title="两点距离测量" active={mode === "measure"} onClick={() => setMode("measure")}><Ruler size={16} /></ToolButton>
            </div>
            <div className="tool-separator" />
            <div className="tool-group">
              <ToolButton title="全图适配" disabled={!model} onClick={() => viewportRef.current?.fit()}><Maximize2 size={16} /></ToolButton>
              <div className="view-menu-wrap">
                <ToolButton title="标准视图" disabled={!model} active={viewMenuOpen} onClick={() => setViewMenuOpen((value) => !value)}><Camera size={16} /><ChevronDown size={11} /></ToolButton>
                {viewMenuOpen && (
                  <div className="view-menu">
                    {([ ["iso", "轴测"], ["top", "俯视"], ["front", "前视"], ["right", "右视"], ["left", "左视"], ["back", "后视"] ] as [StandardView, string][]).map(([view, label]) => (
                      <button key={view} type="button" onClick={() => setStandardView(view)}>{label}</button>
                    ))}
                  </div>
                )}
              </div>
              <ToolButton title={settings.projection === "perspective" ? "切换为正交投影" : "切换为透视投影"} active={settings.projection === "orthographic"} onClick={() => updateSettings("projection", settings.projection === "perspective" ? "orthographic" : "perspective")}><Square size={15} /></ToolButton>
            </div>
            <div className="tool-separator" />
            <div className="tool-group toolbar-wide-actions">
              <ToolButton title="显示全部对象" disabled={!model} onClick={() => viewportRef.current?.showAll()}><Eye size={16} /></ToolButton>
              <ToolButton title="隐藏已选对象" disabled={!selected} onClick={() => viewportRef.current?.hideSelected()}><EyeOff size={16} /></ToolButton>
              <ToolButton title="隔离已选对象" disabled={!selected} onClick={() => viewportRef.current?.isolateSelected()}><Focus size={16} /></ToolButton>
              <ToolButton title="绕 Z 轴旋转 90°" disabled={!model} onClick={() => viewportRef.current?.rotateModel("z")}><RotateCw size={16} /></ToolButton>
            </div>
            <div className="toolbar-spacer" />
            <ToolButton title="保存当前视图为 PNG" disabled={!model} onClick={() => void takeScreenshot()}><ImageDown size={16} /></ToolButton>
          </div>

          <div className="viewport-stage">
            <ModelViewport
              ref={viewportRef}
              model={model}
              settings={settings}
              interactionMode={mode}
              onSelect={(selection) => void selectObject(selection)}
              onMeasure={(measurement) => setMeasurements((current) => [...current, measurement])}
            />

            {!model && !progress && (
              <button className="drop-callout" type="button" onClick={() => fileInputRef.current?.click()}>
                <span><FileBox size={24} /></span>
                <strong>把三维模型拖到这里</strong>
                <small>或点击选择文件；glTF / OBJ 可同时选择纹理与材质文件</small>
              </button>
            )}

            {progress && (
              <div className="loading-overlay" role="status" aria-live="polite">
                <div className="loading-card">
                  <div className="loader-cube"><span /><span /><span /></div>
                  <small>MODEL PIPELINE</small>
                  <strong>{progress.phase}</strong>
                  <div className="progress-track"><i style={{ width: `${progress.percent ?? 18}%` }} /></div>
                  <p>{progress.percent != null ? `${Math.round(progress.percent)}%` : "请稍候"} · 大型 BIM / CAD 文件会在本机花费更长时间</p>
                </div>
              </div>
            )}

            {dragActive && (
              <div className="drag-overlay">
                <div><Upload size={30} /><strong>释放以打开模型</strong><span>相关纹理、BIN、MTL 文件可以一起拖入</span></div>
              </div>
            )}

            {error && (
              <div className="toast error-toast" role="alert">
                <Info size={17} />
                <div><strong>未能打开模型</strong><p>{error}</p></div>
                <button type="button" aria-label="关闭错误" onClick={() => setError("")}><X size={15} /></button>
              </div>
            )}
            {notice && !error && (
              <div className="toast success-toast" role="status">
                <span className="status-dot" />
                <p>{notice}</p>
                <button type="button" aria-label="关闭提示" onClick={() => setNotice("")}><X size={15} /></button>
              </div>
            )}
          </div>
        </section>

        <aside className={`side-panel right-panel ${rightOpen ? "mobile-open" : ""}`}>
          <div className="inspector-tabs">
            <button type="button" className={rightTab === "properties" ? "is-active" : ""} onClick={() => setRightTab("properties")}><Info size={14} />属性</button>
            <button type="button" className={rightTab === "display" ? "is-active" : ""} onClick={() => setRightTab("display")}><SlidersHorizontal size={14} />显示</button>
            <button className="panel-close" type="button" aria-label="关闭检查器" onClick={() => setRightOpen(false)}><X size={17} /></button>
          </div>

          {rightTab === "properties" && (
            <div className="inspector-scroll">
              <section className="inspector-section">
                <div className="section-kicker">SELECTION</div>
                <h2>{selected ? objectDisplayName(selected) : "未选择对象"}</h2>
                {selected ? (
                  <>
                    <div className="selection-actions">
                      <button type="button" onClick={() => viewportRef.current?.focusObject(selected)}><Focus size={13} />聚焦</button>
                      <button type="button" onClick={() => viewportRef.current?.isolateSelected()}><Eye size={13} />隔离</button>
                      <button type="button" onClick={() => viewportRef.current?.hideSelected()}><EyeOff size={13} />隐藏</button>
                    </div>
                    <dl className="property-list">
                      {visiblePropertyEntries.map(([key, value]) => (
                        <div key={key}><dt>{key}</dt><dd title={formatProperty(value)}>{formatProperty(value)}</dd></div>
                      ))}
                    </dl>
                  </>
                ) : (
                  <div className="panel-placeholder compact"><MousePointer2 size={22} /><span>单击画布或对象树以检查属性</span></div>
                )}
              </section>

              <section className="inspector-section model-stat-section">
                <div className="section-title-row"><div><div className="section-kicker">MODEL</div><h3>模型统计</h3></div>{model && <button type="button" title="关闭模型" onClick={clearModel}><Trash2 size={14} /></button>}</div>
                <dl className="stat-grid">
                  <div><dt>对象</dt><dd>{model ? formatCount(model.stats.objects) : "—"}</dd></div>
                  <div><dt>网格</dt><dd>{model ? formatCount(model.stats.meshes) : "—"}</dd></div>
                  <div><dt>顶点</dt><dd>{model ? formatCount(model.stats.vertices) : "—"}</dd></div>
                  <div><dt>三角面</dt><dd>{model ? formatCount(model.stats.triangles) : "—"}</dd></div>
                </dl>
                <div className="dimension-row"><span>包围盒尺寸</span><strong>{dimensionLabel}</strong></div>
                {model?.warnings.map((warning) => <p className="model-warning" key={warning}>{warning}</p>)}
              </section>

              {measurements.length > 0 && (
                <section className="inspector-section">
                  <div className="section-title-row"><div><div className="section-kicker">MEASURE</div><h3>距离测量</h3></div><button type="button" title="清除测量" onClick={() => { setMeasurements([]); viewportRef.current?.clearMeasurements(); }}><Trash2 size={14} /></button></div>
                  <ol className="measurement-list">
                    {measurements.map((measurement, index) => <li key={measurement.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{formatLength(measurement.distance, model?.unit || "unit")}</strong></li>)}
                  </ol>
                </section>
              )}
            </div>
          )}

          {rightTab === "display" && (
            <div className="inspector-scroll">
              <section className="inspector-section">
                <div className="section-kicker">RENDER</div>
                <h2>场景显示</h2>
                <label className="setting-toggle"><span><Grid3X3 size={15} />地面网格</span><input type="checkbox" checked={settings.grid} onChange={(event) => updateSettings("grid", event.target.checked)} /><i /></label>
                <label className="setting-toggle"><span><Layers3 size={15} />坐标轴</span><input type="checkbox" checked={settings.axes} onChange={(event) => updateSettings("axes", event.target.checked)} /><i /></label>
                <label className="setting-toggle"><span><Sparkles size={15} />实时阴影</span><input type="checkbox" checked={settings.shadows} onChange={(event) => updateSettings("shadows", event.target.checked)} /><i /></label>
                <label className="setting-toggle"><span><Square size={15} />线框模式</span><input type="checkbox" checked={settings.wireframe} onChange={(event) => updateSettings("wireframe", event.target.checked)} /><i /></label>
                <label className="range-setting">
                  <span><b>整体透明度</b><em>{Math.round(settings.opacity * 100)}%</em></span>
                  <input type="range" min="0.08" max="1" step="0.01" value={settings.opacity} onChange={(event) => updateSettings("opacity", Number(event.target.value))} />
                </label>
                <label className="color-setting"><span>背景颜色</span><input type="color" value={settings.background} onChange={(event) => updateSettings("background", event.target.value)} /></label>
              </section>

              <section className="inspector-section">
                <div className="section-kicker">SECTION</div>
                <h3>水平剖切</h3>
                <label className="setting-toggle"><span><SlidersHorizontal size={15} />启用剖切平面</span><input type="checkbox" checked={settings.sectionEnabled} onChange={(event) => updateSettings("sectionEnabled", event.target.checked)} /><i /></label>
                <label className={`range-setting ${settings.sectionEnabled ? "" : "is-disabled"}`}>
                  <span><b>剖切高度</b><em>{settings.sectionPercent}%</em></span>
                  <input disabled={!settings.sectionEnabled} type="range" min="0" max="100" value={settings.sectionPercent} onChange={(event) => updateSettings("sectionPercent", Number(event.target.value))} />
                </label>
              </section>

              <section className="inspector-section">
                <div className="section-kicker">ORIENTATION</div>
                <h3>模型方向</h3>
                <div className="rotation-grid">
                  {(["x", "y", "z"] as const).map((axis) => <button type="button" disabled={!model} key={axis} onClick={() => viewportRef.current?.rotateModel(axis)}><RotateCw size={14} />绕 {axis.toUpperCase()} +90°</button>)}
                </div>
              </section>

              {Boolean(model?.animations.length) && (
                <section className="inspector-section">
                  <div className="section-kicker">ANIMATION</div>
                  <h3>模型动画 · {model?.animations.length} 段</h3>
                  <button className="animation-button" type="button" onClick={() => updateSettings("animationPlaying", !settings.animationPlaying)}>{settings.animationPlaying ? <Pause size={15} /> : <Play size={15} />}{settings.animationPlaying ? "暂停动画" : "播放动画"}</button>
                </section>
              )}
            </div>
          )}
        </aside>
      </section>

      <footer className="status-bar">
        <div><span className="status-dot" />{model ? "模型就绪" : "浏览器就绪"}</div>
        <div className="status-center">{model ? `${FORMAT_LABELS[model.format]} · ${formatFileSize(model.sizeBytes)} · ${formatCount(model.stats.triangles)} tris` : "所有解析均在本机浏览器内完成"}</div>
        <div>Three.js <span>r185</span></div>
      </footer>

      {helpOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setHelpOpen(false)}>
          <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="关闭帮助" onClick={() => setHelpOpen(false)}><X size={18} /></button>
            <div className="section-kicker">QUICK START</div>
            <h2 id="help-title">三步查看你的模型</h2>
            <div className="help-steps">
              <article><span>01</span><strong>选择完整文件</strong><p>单文件格式直接打开；GLTF、OBJ 等请连同 BIN、纹理、MTL 一起选择，或使用“打开文件夹”。</p></article>
              <article><span>02</span><strong>检查模型</strong><p>左键旋转、右键平移、滚轮缩放。单击选择构件，双击对象树可聚焦。</p></article>
              <article><span>03</span><strong>分析与截图</strong><p>用测量工具点击两点，显示面板可调剖切、透明度和线框，工具栏可保存 PNG。</p></article>
            </div>
            <div className="privacy-note"><Info size={16} /><p><strong>隐私说明</strong> 模型通过 WebAssembly / JavaScript 在浏览器本地解析，本工具不会主动上传模型文件。</p></div>
          </section>
        </div>
      )}

      {(leftOpen || rightOpen) && <button className="mobile-panel-backdrop" type="button" aria-label="关闭侧栏" onClick={() => { setLeftOpen(false); setRightOpen(false); }} />}
    </main>
  );
}
