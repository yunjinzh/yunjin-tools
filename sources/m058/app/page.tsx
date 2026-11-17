"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  AlertTriangle, ArrowLeft, Building2, Check, ChevronRight, CircleDotDashed,
  Download, FileBox, FileDown, FolderOpen, Info, Layers3, LoaderCircle, Map,
  Mountain, Play, RefreshCw, ShieldCheck, Sparkles, UploadCloud, X, Zap,
} from "lucide-react";

import { MapSelector } from "../components/map-selector";
import { SceneViewer } from "../components/scene-viewer";
import { createDemoResult } from "../lib/demo";
import { exportFbx, exportGlb } from "../lib/exporters";
import { buildScene, type BuiltScene } from "../lib/scene-builder";
import type { LayerKey, ParseResult, PbfHeader, SceneSettings, SelectionShape, WorkerRequest, WorkerResponse } from "../lib/types";

type WorkspaceStep = "source" | "select" | "build" | "preview";
type BusyState = { progress: number; stage: string } | null;
type Toast = { kind: "success" | "error" | "info"; message: string } | null;
type ParsePurpose = "preview" | "generate";

const MAX_FILE_BYTES = 3 * 1024 * 1024 * 1024;
const AUTO_PREVIEW_AREA_KM2 = 100;
const DEFAULT_SCENE_SETTINGS: SceneSettings = { heightScale: 1, defaultLevels: 3, terrainEnabled: true, imageryEnabled: true };
const layerMeta: Record<LayerKey, { label: string; color: string }> = {
  buildings: { label: "建筑", color: "#B68B68" }, roads: { label: "道路", color: "#8E959B" },
  water: { label: "水系", color: "#72A8BD" }, green: { label: "绿地", color: "#6F986F" }, rail: { label: "铁路", color: "#596068" },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; value >= 1024 && index < units.length; index += 1) { value /= 1024; unit = units[index]; }
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${unit}`;
}

function disposeScene(root: THREE.Object3D | null) {
  root?.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => {
      (material as THREE.MeshStandardMaterial).map?.dispose();
      material.dispose();
    });
  });
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef<string | null>(null);
  const parsePurposeRef = useRef<ParsePurpose>("generate");
  const builtRef = useRef<BuiltScene | null>(null);
  const settingsRef = useRef<SceneSettings>(DEFAULT_SCENE_SETTINGS);
  const [file, setFile] = useState<File | null>(null);
  const [header, setHeader] = useState<PbfHeader | null>(null);
  const [selection, setSelection] = useState<SelectionShape | null>(null);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [built, setBuilt] = useState<BuiltScene | null>(null);
  const [step, setStep] = useState<WorkspaceStep>("source");
  const [busy, setBusy] = useState<BusyState>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [dragging, setDragging] = useState(false);
  const [exporting, setExporting] = useState<"glb" | "fbx" | null>(null);
  const [settings, setSettings] = useState<SceneSettings>(DEFAULT_SCENE_SETTINGS);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({ terrain: true, buildings: true, roads: true, water: true, green: true, rail: true });

  useEffect(() => { builtRef.current = built; }, [built]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const buildParsedScene = useCallback(async (result: ParseResult) => {
    setParsed(result);
    setStep("build");
    setBusy({ progress: 0.62, stage: "准备三维场景网格" });
    try {
      const scene = await buildScene(result, settingsRef.current, (progress, stage) => setBusy({ progress: 0.62 + progress * 0.38, stage }));
      disposeScene(builtRef.current?.root || null);
      setBuilt(scene);
      setStep("preview");
      setToast({ kind: "success", message: `场景生成完成，共 ${result.features.length.toLocaleString()} 个 OSM 要素。` });
    } catch (error) {
      setToast({ kind: "error", message: error instanceof Error ? error.message : "三维场景生成失败。" });
      setStep("select");
    } finally {
      setBusy(null);
    }
  }, []);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/pbf.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.requestId !== requestRef.current) return;
      if (message.type === "progress") {
        setBusy({ progress: parsePurposeRef.current === "preview" ? message.progress : message.progress * 0.62, stage: message.stage });
      }
      else if (message.type === "header") {
        setHeader(message.header); setBusy(null); setStep("select");
        setToast({ kind: "success", message: "PBF 文件校验通过，已读取数据覆盖范围。" });
      } else if (message.type === "result") {
        setParsed(message.result);
        if (parsePurposeRef.current === "preview") {
          setBusy(null);
          setToast({
            kind: message.result.stats.truncated ? "info" : "success",
            message: message.result.stats.truncated
              ? `已显示前 ${message.result.features.length.toLocaleString()} 个 PBF 要素；完整场景将受浏览器性能保护。`
              : `已在地图显示 ${message.result.features.length.toLocaleString()} 个 PBF 要素。`,
          });
        } else {
          void buildParsedScene(message.result);
        }
      } else if (message.type === "error") {
        setBusy(null);
        if (parsePurposeRef.current === "generate") setStep("select");
        setToast({ kind: "error", message: message.error });
      }
    };
    return () => { worker.terminate(); disposeScene(builtRef.current?.root || null); };
  }, [buildParsedScene]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.kind === "error" ? 7000 : 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const resetOutput = useCallback(() => { disposeScene(builtRef.current?.root || null); setParsed(null); setBuilt(null); }, []);

  const loadFile = useCallback((next: File) => {
    if (!next.name.toLowerCase().endsWith(".pbf")) { setToast({ kind: "error", message: "文件格式不正确，请选择 .osm.pbf 或 .pbf 文件。" }); return; }
    if (next.size > MAX_FILE_BYTES) { setToast({ kind: "error", message: "当前网页版本单文件上限为 3 GB，请先裁剪更小的 PBF。" }); return; }
    resetOutput(); setFile(next); setHeader(null); setSelection(null); setStep("source");
    const requestId = crypto.randomUUID(); requestRef.current = requestId;
    setBusy({ progress: 0.08, stage: "读取并校验 PBF 文件头" });
    workerRef.current?.postMessage({ action: "inspect", requestId, file: next } satisfies WorkerRequest);
  }, [resetOutput]);

  const updateSelection = useCallback((next: SelectionShape) => {
    setSelection(next); setParsed(null);
    if (builtRef.current) { disposeScene(builtRef.current.root); setBuilt(null); }
  }, []);

  const parseSelection = useCallback((next: SelectionShape, purpose: ParsePurpose) => {
    if (!file || next.areaKm2 <= 0.001) return;
    parsePurposeRef.current = purpose;
    const requestId = crypto.randomUUID();
    requestRef.current = requestId;
    if (purpose === "generate") setStep("build");
    setBusy({ progress: 0.01, stage: purpose === "preview" ? "读取选区内的 PBF 图层" : "准备解析 PBF 数据块" });
    workerRef.current?.postMessage({ action: "parse", requestId, file, selection: next } satisfies WorkerRequest);
  }, [file]);

  const previewSelection = useCallback((next: SelectionShape) => {
    if (next.areaKm2 <= AUTO_PREVIEW_AREA_KM2) {
      parseSelection(next, "preview");
    } else {
      setToast({ kind: "info", message: `已选择 ${next.areaKm2.toFixed(1)} km²。超大选区不会自动扫描；可点击“读取 PBF 图层”或直接生成。` });
    }
  }, [parseSelection]);

  const startGeneration = () => {
    if (!file || !selection || selection.areaKm2 <= 0.001) return;
    if (parsed) void buildParsedScene(parsed);
    else parseSelection(selection, "generate");
  };

  const loadDemo = async () => {
    const result = createDemoResult(); setBusy({ progress: 0.1, stage: "构建北京示例场景" }); setParsed(result); setSelection(result.selection);
    setHeader({ bounds: result.selection.bounds, requiredFeatures: ["OsmSchema-V0.6", "DenseNodes"], optionalFeatures: [], source: "内置演示数据" });
    setFile(new File([], "beijing-demo.osm.pbf"));
    try {
      const scene = await buildScene(result, { ...settingsRef.current, terrainEnabled: false, imageryEnabled: false }, (progress, stage) => setBusy({ progress, stage }));
      disposeScene(builtRef.current?.root || null); setBuilt(scene); setStep("preview");
      setToast({ kind: "info", message: "已打开轻量示例。上传真实 PBF 后会按相同流程解析。" });
    } catch (error) { setToast({ kind: "error", message: error instanceof Error ? error.message : "示例场景加载失败。" }); }
    finally { setBusy(null); }
  };

  const exportName = useMemo(() => (file?.name || "GeoPBF_Scene").replace(/\.osm\.pbf$|\.pbf$/i, "") + "_3D", [file]);
  const doExport = async (format: "glb" | "fbx") => {
    if (!built) return; setExporting(format);
    try {
      const bytes = format === "glb" ? await exportGlb(built.root, exportName) : exportFbx(built.root, exportName);
      setToast({ kind: "success", message: `${format.toUpperCase()} 已导出（${formatBytes(bytes)}），文件结构校验通过。` });
    } catch (error) { setToast({ kind: "error", message: error instanceof Error ? error.message : `${format.toUpperCase()} 导出失败。` }); }
    finally { setExporting(null); }
  };

  const startOver = () => { resetOutput(); setFile(null); setHeader(null); setSelection(null); setStep("source"); requestRef.current = null; };
  const canGenerate = Boolean(file && selection && selection.areaKm2 > 0.001 && !busy);
  const steps = [{ key: "source", label: "PBF 数据" }, { key: "select", label: "空间选区" }, { key: "build", label: "场景生成" }, { key: "preview", label: "预览导出" }] as const;
  const stepIndex = steps.findIndex((item) => item.key === step);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Layers3 size={23} strokeWidth={1.65} /></div><div><strong>GeoPBF</strong><span>三维场景生成器</span></div></div>
        <div className="topbar-center"><span className="status-dot" />本地解析 · 数据不上传</div>
        <div className="topbar-actions"><a href="https://wiki.openstreetmap.org/wiki/PBF_Format" target="_blank" rel="noreferrer"><Info size={16} />PBF 说明</a>{file && <button className="quiet-button" onClick={startOver}><RefreshCw size={15} />新建项目</button>}</div>
      </header>

      <div className="workspace">
        <aside className="workflow-sidebar">
          <div className="workflow-label">工作流程</div>
          <nav className="step-list">{steps.map((item, index) => { const done = index < stepIndex || (step === "preview" && index === stepIndex); const active = index === stepIndex; return <div className={`step-item ${active ? "active" : ""} ${done ? "done" : ""}`} key={item.key}><span className="step-index">{done ? <Check size={14} /> : String(index + 1).padStart(2, "0")}</span><span>{item.label}</span></div>; })}</nav>
          <div className="sidebar-note"><ShieldCheck size={18} /><div><strong>隐私优先</strong><span>PBF 仅在浏览器本地读取，不会上传到服务器。</span></div></div>
          <div className="license-note">OSM 数据 © OpenStreetMap contributors，使用须遵循 ODbL 1.0。</div>
        </aside>

        <section className="main-panel">
          {step === "source" && <div className="source-screen">
            <div className="intro-block"><div className="eyebrow">OSM PBF → 3D SCENE</div><h1>从城市数据，生成<br />可交付的三维场景</h1><p>上传 Geofabrik 或其他来源的 <code>.osm.pbf</code>，自由框选或圈选区域，自动识别建筑、道路、水系、绿地与铁路，并导出 GLB / FBX。</p></div>
            <div className={`upload-card ${dragging ? "dragging" : ""}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (event.dataTransfer.files[0]) loadFile(event.dataTransfer.files[0]); }} onClick={() => !busy && fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".pbf,.osm.pbf" hidden onChange={(event) => event.target.files?.[0] && loadFile(event.target.files[0])} />
              <div className="upload-icon"><UploadCloud size={31} strokeWidth={1.4} /></div><h2>{busy ? "正在读取文件…" : "拖放 PBF 文件到这里"}</h2><p>或点击选择本地文件 · 最大 3 GB</p>
              {busy ? <div className="mini-progress"><span style={{ width: `${busy.progress * 100}%` }} /></div> : <button className="primary-button"><FolderOpen size={17} />选择 PBF 文件</button>}
              <div className="upload-formats"><FileBox size={14} />支持 .osm.pbf / .pbf</div>
            </div>
            <div className="demo-row"><button onClick={(event) => { event.stopPropagation(); void loadDemo(); }} disabled={Boolean(busy)}><Play size={15} fill="currentColor" />先体验北京示例场景</button><span>示例仅用于查看流程，不替代真实 PBF 解析。</span></div>
            <div className="capability-strip"><div><Mountain size={21} /><span><strong>真实地形</strong>公开 DEM 在线增强</span></div><div><Building2 size={21} /><span><strong>语义建模</strong>按 OSM 属性分层</span></div><div><FileDown size={21} /><span><strong>标准输出</strong>GLB 与 FBX 模型</span></div></div>
          </div>}

          {step === "select" && header?.bounds && <div className="select-screen">
            <div className="section-heading"><div><span className="eyebrow">STEP 02 / SPATIAL CLIP</span><h1>选择生成区域</h1><p>在地图上按住并拖动，可自由绘制矩形或圆形区域；不再设置面积硬上限。</p></div><div className="file-chip"><FileBox size={17} /><div><strong>{file?.name}</strong><span>{formatBytes(file?.size || 0)}</span></div><Check size={16} className="valid-icon" /></div></div>
            <div className="select-grid"><div className="map-card"><MapSelector sourceBounds={header.bounds} selection={selection} features={parsed?.features || []} previewBusy={Boolean(busy)} onSelection={updateSelection} onSelectionComplete={previewSelection} /></div><aside className="settings-card">
              <div className="settings-section"><h3>选区信息</h3>{selection ? <><div className={`area-meter ${selection.areaKm2 > AUTO_PREVIEW_AREA_KM2 ? "large" : ""}`}><span>估算面积</span><strong>{selection.areaKm2.toFixed(selection.areaKm2 >= 1000 ? 0 : 2)} <small>km²</small></strong><div><i style={{ width: `${Math.min(100, Math.sqrt(selection.areaKm2 / AUTO_PREVIEW_AREA_KM2) * 100)}%` }} /></div><em>{selection.areaKm2 > AUTO_PREVIEW_AREA_KM2 ? "大范围可继续生成，耗时与内存占用会增加" : "已放开面积限制；100 km² 内自动预览 PBF 图层"}</em></div><dl className="bounds-list"><div><dt>西 / 东</dt><dd>{selection.bounds.west.toFixed(5)} / {selection.bounds.east.toFixed(5)}</dd></div><div><dt>南 / 北</dt><dd>{selection.bounds.south.toFixed(5)} / {selection.bounds.north.toFixed(5)}</dd></div><div><dt>形状</dt><dd>{selection.type === "circle" ? "圆形圈选" : "矩形框选"}</dd></div>{parsed && <div><dt>地图预览</dt><dd>{parsed.features.length.toLocaleString()} 个要素</dd></div>}</dl></> : <div className="empty-selection"><CircleDotDashed size={28} /><span>尚未绘制选区</span></div>}</div>
              <div className="settings-section"><h3>场景增强</h3><label className="switch-row"><span><Mountain size={17} /><span><strong>真实地形</strong><small>AWS Terrain Tiles</small></span></span><input type="checkbox" checked={settings.terrainEnabled} onChange={(event) => setSettings((value) => ({ ...value, terrainEnabled: event.target.checked }))} /><i /></label><label className="switch-row"><span><Map size={17} /><span><strong>影像底图</strong><small>Esri World Imagery</small></span></span><input type="checkbox" checked={settings.imageryEnabled} onChange={(event) => setSettings((value) => ({ ...value, imageryEnabled: event.target.checked }))} /><i /></label></div>
              <div className="selection-actions"><button className="secondary-button" disabled={!selection || Boolean(busy)} onClick={() => selection && parseSelection(selection, "preview")}><RefreshCw size={15} />{parsed ? "刷新 PBF 图层" : "读取 PBF 图层"}</button><button className="primary-button" disabled={!canGenerate} onClick={startGeneration}>生成三维场景<ChevronRight size={18} /></button></div>{!selection && <p className="button-note">请先在地图中绘制选区</p>}{selection && selection.areaKm2 > AUTO_PREVIEW_AREA_KM2 && <p className="button-note warning">已放开面积限制。大范围场景可能只保留性能上限内的要素，请耐心等待。</p>}
            </aside></div>
          </div>}

          {step === "build" && <div className="build-screen"><div className="build-visual"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="build-cube"><Layers3 size={42} strokeWidth={1.2} /></div></div><div className="eyebrow">PROCESSING LOCALLY</div><h1>{busy?.stage || "准备生成场景"}</h1><p>大文件会流式扫描，耗时取决于 PBF 大小和设备性能。请保持当前页面打开。</p><div className="build-progress"><span style={{ width: `${(busy?.progress || 0) * 100}%` }} /></div><div className="progress-label"><span>{Math.round((busy?.progress || 0) * 100)}%</span><span>浏览器本地处理</span></div><div className="build-stages"><span className={(busy?.progress || 0) > 0.02 ? "done" : ""}>PBF 扫描</span><span className={(busy?.progress || 0) > 0.62 ? "done" : ""}>图层建模</span><span className={(busy?.progress || 0) > 0.88 ? "done" : ""}>网格合并</span></div></div>}

          {step === "preview" && built && parsed && <div className="preview-screen">
            <div className="preview-topbar"><div><span className="eyebrow">SCENE READY</span><h1>{exportName}</h1></div><div className="export-actions"><button className="secondary-button" disabled={Boolean(exporting)} onClick={() => void doExport("fbx")}><Download size={16} />{exporting === "fbx" ? "导出中…" : "下载 FBX"}</button><button className="primary-button" disabled={Boolean(exporting)} onClick={() => void doExport("glb")}><Download size={16} />{exporting === "glb" ? "导出中…" : "下载 GLB"}</button></div></div>
            <div className="preview-layout"><aside className="layer-panel"><div className="panel-title"><Layers3 size={17} /><span>场景图层</span></div><div className="layer-list"><label className="layer-row"><input type="checkbox" checked={visibility.terrain} onChange={() => setVisibility((value) => ({ ...value, terrain: !value.terrain }))} /><span className="layer-swatch terrain" /><span><strong>地形 / 影像</strong><small>{built.terrain.terrainUsed ? `${Math.round(built.terrain.minElevation)}–${Math.round(built.terrain.maxElevation)} m` : "平面地形"}</small></span><em>1</em></label>{(Object.keys(layerMeta) as LayerKey[]).map((key) => { const meta = layerMeta[key]; return <label className="layer-row" key={key}><input type="checkbox" checked={visibility[key]} onChange={() => setVisibility((value) => ({ ...value, [key]: !value[key] }))} /><span className="layer-swatch" style={{ background: meta.color }} /><span><strong>{meta.label}</strong><small>{key === "buildings" ? "高度 / 类型着色" : "OSM 属性分类"}</small></span><em>{parsed.stats.layers[key].toLocaleString()}</em></label>; })}</div><div className="panel-divider" /><div className="scene-metrics"><h3>解析摘要</h3><dl><div><dt>选区面积</dt><dd>{parsed.selection.areaKm2.toFixed(2)} km²</dd></div><div><dt>OSM 要素</dt><dd>{parsed.features.length.toLocaleString()}</dd></div><div><dt>保留节点</dt><dd>{parsed.stats.nodesKept.toLocaleString()}</dd></div><div><dt>解析耗时</dt><dd>{parsed.stats.elapsedMs ? `${(parsed.stats.elapsedMs / 1000).toFixed(1)} s` : "演示"}</dd></div></dl></div>{built.terrain.warning && <div className="inline-warning"><AlertTriangle size={15} />{built.terrain.warning}</div>}</aside><div className="viewer-card"><SceneViewer root={built.root} visibility={visibility} /></div></div>
            <div className="preview-footer"><button className="back-button" onClick={() => { disposeScene(built.root); setBuilt(null); setStep("select"); }}><ArrowLeft size={16} />返回选区</button><span><Zap size={14} />GLB 保留材质与可用影像纹理；FBX 导出几何与材质颜色。</span></div>
          </div>}
        </section>
      </div>
      {busy && step !== "build" && <div className="busy-overlay"><LoaderCircle className="spin" size={19} /><span>{busy.stage}</span></div>}
      {toast && <div className={`toast ${toast.kind}`}>{toast.kind === "success" ? <Check size={17} /> : toast.kind === "error" ? <AlertTriangle size={17} /> : <Sparkles size={17} />}<span>{toast.message}</span><button onClick={() => setToast(null)}><X size={15} /></button></div>}
    </main>
  );
}
