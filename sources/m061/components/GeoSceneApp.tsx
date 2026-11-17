"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import {
  AlertTriangle,
  Box,
  Check,
  ChevronLeft,
  CircleHelp,
  Download,
  FileArchive,
  FileBox,
  FolderDown,
  GitBranch,
  Info,
  Layers3,
  Map as MapIcon,
  Mountain,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import type {
  AreaSelection,
  BuildBundle,
  DataSourceSettings,
  GeoFeatureCollection,
  ImageryTexture,
  SceneStyle,
  TerrainGrid,
} from "../lib/types";
import { DEFAULT_SOURCES, DEFAULT_STYLE } from "../lib/types";
import { calculateLayerStats, fetchOsmData } from "../lib/osm";
import { createFlatTerrain, fetchImagery, fetchTerrain } from "../lib/raster";
import { formatArea } from "../lib/geo";
import type { SceneViewerHandle } from "./SceneViewer";
import SettingsPanel from "./SettingsPanel";

const MapSelector = dynamic(() => import("./MapSelector"), { ssr: false, loading: () => <div className="map-loading">地图初始化中…</div> });
const SceneViewer = dynamic(() => import("./SceneViewer"), { ssr: false, loading: () => <div className="viewer-loading">Three.js 引擎初始化中…</div> });

type BuildStage = "idle" | "validating" | "osm" | "terrain" | "imagery" | "mesh" | "done" | "error";

const STAGES: Array<{ key: BuildStage; label: string }> = [
  { key: "validating", label: "检查范围" },
  { key: "osm", label: "提取 OSM" },
  { key: "terrain", label: "采样地形" },
  { key: "imagery", label: "拼接影像" },
  { key: "mesh", label: "构建场景" },
  { key: "done", label: "完成" },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function safeBaseName(selection: AreaSelection) {
  return `GeoScene_${selection.center[1].toFixed(4)}_${selection.center[0].toFixed(4)}_${new Date().toISOString().slice(0, 10)}`.replaceAll("-", "");
}

export default function GeoSceneApp() {
  const [selection, setSelection] = useState<AreaSelection | null>(null);
  const [sources, setSources] = useState<DataSourceSettings>(DEFAULT_SOURCES);
  const [style, setStyle] = useState<SceneStyle>(DEFAULT_STYLE);
  const [bundle, setBundle] = useState<BuildBundle | null>(null);
  const [stage, setStage] = useState<BuildStage>("idle");
  const [message, setMessage] = useState("请选择一个区域开始");
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [exporting, setExporting] = useState<"" | "glb" | "fbx" | "package">("");
  const [runtimeStats, setRuntimeStats] = useState({ objects: 0, triangles: 0 });
  const [selectedFeature, setSelectedFeature] = useState<Record<string, unknown> | null>(null);
  const viewerRef = useRef<SceneViewerHandle | null>(null);
  const settingsOpenOnce = useRef(false);

  useEffect(() => {
    try {
      const savedSources = localStorage.getItem("geoscene.sources");
      const savedStyle = localStorage.getItem("geoscene.style");
      if (savedSources) setSources({ ...DEFAULT_SOURCES, ...JSON.parse(savedSources), imagery: { ...DEFAULT_SOURCES.imagery, ...JSON.parse(savedSources).imagery }, terrain: { ...DEFAULT_SOURCES.terrain, ...JSON.parse(savedSources).terrain } });
      if (savedStyle) setStyle({ ...DEFAULT_STYLE, ...JSON.parse(savedStyle) });
    } catch {
      // Invalid local preferences are ignored.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("geoscene.sources", JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem("geoscene.style", JSON.stringify(style));
  }, [style]);

  const stageIndex = STAGES.findIndex((entry) => entry.key === stage);
  const busy = stage !== "idle" && stage !== "done" && stage !== "error";
  const selectionValid = Boolean(selection && selection.areaM2 > 100 && selection.areaM2 <= 10_000_000);

  async function generateScene() {
    if (!selection) {
      setError("请先使用矩形或圆形工具选择区域。 ");
      return;
    }
    if (selection.areaM2 > 10_000_000) {
      setError(`选区 ${formatArea(selection.areaM2)} 超过 10 km² 限制。`);
      return;
    }
    if (selection.areaM2 < 100) {
      setError("选区过小，请选择至少 100 m² 的区域。 ");
      return;
    }
    setError("");
    setSelectedFeature(null);
    setStage("validating");
    setMessage("检查经纬度、面积和数据源配置");

    try {
      setStage("osm");
      setMessage("正在从 Overpass 提取建筑、道路、水系与用地…");
      const osm = await fetchOsmData(selection, sources.overpassEndpoint);

      setStage("terrain");
      setMessage("正在采样全球高程并生成规则网格…");
      let terrainFallback = false;
      const terrainPromise = fetchTerrain(selection, sources.terrain).catch((terrainError) => {
        console.warn(terrainError);
        terrainFallback = true;
        return createFlatTerrain(selection, sources.terrain);
      });

      setStage("imagery");
      setMessage("正在裁剪并拼接高精度影像…");
      const imageryPromise = style.showImagery
        ? fetchImagery(selection, sources.imagery).catch((imageryError) => {
            console.warn(imageryError);
            return null;
          })
        : Promise.resolve<ImageryTexture | null>(null);

      const [terrain, imagery] = await Promise.all([terrainPromise, imageryPromise]);
      setStage("mesh");
      setMessage("正在解析属性、推断高度并构建 Three.js 网格…");
      const stats = calculateLayerStats(osm.geojson, style);
      const nextBundle: BuildBundle = {
        selection,
        geojson: osm.geojson,
        terrain,
        imagery,
        sources: { ...sources, overpassEndpoint: osm.endpoint },
        style,
        stats,
        generatedAt: new Date().toISOString(),
      };
      setBundle(nextBundle);
      setStage("done");
      const fallbacks = [!imagery ? "影像未加载" : "", terrainFallback ? "地形已使用平面回退" : ""].filter(Boolean);
      setMessage(fallbacks.length ? `三维场景生成完成（${fallbacks.join("；")}）` : "三维场景生成完成");
    } catch (buildError) {
      setStage("error");
      const detail = buildError instanceof Error ? buildError.message : String(buildError);
      setError(detail);
      setMessage("生成失败，请检查数据服务或缩小选区");
    }
  }

  function resetAll() {
    setBundle(null);
    setSelection(null);
    setSelectedFeature(null);
    setRuntimeStats({ objects: 0, triangles: 0 });
    setStage("idle");
    setError("");
    setMessage("请选择一个区域开始");
  }

  async function exportGlbFile() {
    if (!bundle || !viewerRef.current) return;
    setExporting("glb");
    setError("");
    try {
      const blob = await viewerRef.current.exportGlb(sources.imagery.exportConfirmed);
      downloadBlob(blob, `${safeBaseName(bundle.selection)}.glb`);
    } catch (exportError) {
      setError(`GLB 导出失败：${exportError instanceof Error ? exportError.message : String(exportError)}`);
    } finally {
      setExporting("");
    }
  }

  async function exportFbxPackage() {
    if (!bundle || !viewerRef.current) return;
    setExporting("fbx");
    setError("");
    try {
      const zip = new JSZip();
      const base = safeBaseName(bundle.selection);
      const includeTexture = Boolean(bundle.imagery && sources.imagery.exportConfirmed);
      const textureFile = bundle.imagery?.mimeType.includes("png") ? "texture.png" : "texture.jpg";
      zip.file(`${base}.fbx`, viewerRef.current.exportFbx(includeTexture ? textureFile : undefined));
      if (includeTexture && bundle.imagery) zip.file(textureFile, bundle.imagery.blob);
      zip.file("README_导入说明.txt", createReadme(bundle, includeTexture, textureFile));
      zip.file("metadata.json", JSON.stringify(createMetadata(bundle, includeTexture), null, 2));
      const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      downloadBlob(zipBlob, `${base}_FBX.zip`);
    } catch (exportError) {
      setError(`FBX 导出失败：${exportError instanceof Error ? exportError.message : String(exportError)}`);
    } finally {
      setExporting("");
    }
  }

  async function exportFullPackage() {
    if (!bundle || !viewerRef.current) return;
    setExporting("package");
    setError("");
    try {
      const zip = new JSZip();
      const base = safeBaseName(bundle.selection);
      const includeTexture = Boolean(bundle.imagery && sources.imagery.exportConfirmed);
      const textureFile = bundle.imagery?.mimeType.includes("png") ? "texture.png" : "texture.jpg";
      const glb = await viewerRef.current.exportGlb(includeTexture);
      zip.file(`${base}.glb`, glb);
      zip.file(`${base}.fbx`, viewerRef.current.exportFbx(includeTexture ? textureFile : undefined));
      if (includeTexture && bundle.imagery) zip.file(textureFile, bundle.imagery.blob);
      zip.file("source/osm.geojson", JSON.stringify(bundle.geojson));
      zip.file("source/terrain.json", JSON.stringify(bundle.terrain));
      zip.file("metadata.json", JSON.stringify(createMetadata(bundle, includeTexture), null, 2));
      zip.file("README_导入说明.txt", createReadme(bundle, includeTexture, textureFile));
      const screenshot = viewerRef.current.screenshot();
      if (screenshot) zip.file("preview.png", screenshot);
      const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      downloadBlob(zipBlob, `${base}_完整包.zip`);
    } catch (exportError) {
      setError(`完整包导出失败：${exportError instanceof Error ? exportError.message : String(exportError)}`);
    } finally {
      setExporting("");
    }
  }

  function openSettings() {
    settingsOpenOnce.current = true;
    setShowSettings(true);
  }

  return (
    <main className="app-frame">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark"><Mountain size={23} /></div>
          <div><strong>GeoScene</strong><span>OSM 三维场景生成器</span></div>
        </div>
        <nav className="topnav" aria-label="主导航">
          <button className="active"><MapIcon size={16} />场景生成</button>
          <button onClick={() => setShowGuide(true)}><CircleHelp size={16} />使用说明</button>
        </nav>
        <div className="top-actions">
          <span className="status-dot"><i />数据服务在线</span>
          <button className="icon-button" onClick={openSettings} aria-label="数据源与样式设置"><Settings2 size={19} /></button>
        </div>
      </header>

      <section className="workflow-strip">
        <div className="workflow-title"><span>01</span><p><strong>选择区域</strong><small>矩形或圆形，最大 10 km²</small></p></div>
        <div className="workflow-line" />
        <div className={`workflow-title ${stageIndex >= 1 ? "active" : ""}`}><span>02</span><p><strong>提取与建模</strong><small>OSM · 影像 · 真实地形</small></p></div>
        <div className="workflow-line" />
        <div className={`workflow-title ${bundle ? "active" : ""}`}><span>03</span><p><strong>预览与导出</strong><small>Three.js · GLB · FBX</small></p></div>
      </section>

      <div className="workspace-grid">
        <section className="map-pane">
          <div className="pane-heading"><div><span>AREA SELECTION</span><h1>圈定生成范围</h1></div><button onClick={resetAll} title="重置"><RotateCcw size={17} /></button></div>
          <MapSelector selection={selection} sources={sources} onChange={setSelection} />
          <div className="selection-summary">
            <div><span>中心坐标</span><strong>{selection ? `${selection.center[1].toFixed(5)}, ${selection.center[0].toFixed(5)}` : "—"}</strong></div>
            <div><span>选区面积</span><strong>{selection ? formatArea(selection.areaM2) : "—"}</strong></div>
            <div><span>选择方式</span><strong>{selection ? (selection.kind === "circle" ? "圆形圈选" : "矩形框选") : "—"}</strong></div>
          </div>
          <button className="generate-button" onClick={generateScene} disabled={!selectionValid || busy}>
            {busy ? <span className="spinner light" /> : <Sparkles size={18} />}
            {busy ? "正在生成场景" : "生成三维场景"}
          </button>
          {!settingsOpenOnce.current && (
            <button className="source-shortcut" onClick={openSettings}><Settings2 size={16} />首次使用？检查影像与地形数据源</button>
          )}
        </section>

        <section className="viewer-pane">
          <div className="pane-heading viewer-heading">
            <div><span>THREE.JS PREVIEW</span><h2>三维场景预览</h2></div>
            <div className="engine-badge"><i />WebGL 2.0</div>
          </div>
          <SceneViewer ref={viewerRef} bundle={bundle} style={style} onStats={setRuntimeStats} onSelectFeature={setSelectedFeature} />
          {selectedFeature && (
            <div className="feature-inspector">
              <button onClick={() => setSelectedFeature(null)}><X size={15} /></button>
              <span>OSM FEATURE</span>
              <h3>{String(selectedFeature.name || selectedFeature.building || selectedFeature.highway || "未命名要素")}</h3>
              <dl>
                {Object.entries(selectedFeature).filter(([key, value]) => !key.startsWith("@") && value != null && typeof value !== "object").slice(0, 8).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}
              </dl>
            </div>
          )}
        </section>

        <aside className="control-pane">
          <div className="pane-heading"><div><span>MODEL CONTROL</span><h2>场景控制台</h2></div><button onClick={openSettings}><Settings2 size={17} /></button></div>
          <div className="task-card">
            <div className="task-top"><span className={`task-state ${stage}`}>{stage === "done" ? <Check size={14} /> : busy ? <span className="spinner" /> : <Play size={14} />}</span><div><strong>{message}</strong><small>{selection ? formatArea(selection.areaM2) : "等待选区"}</small></div></div>
            <div className="stage-list">
              {STAGES.map((entry, index) => {
                const complete = stage === "done" || (stageIndex >= 0 && index < stageIndex);
                const active = entry.key === stage;
                return <div key={entry.key} className={`${complete ? "complete" : ""} ${active ? "active" : ""}`}><span>{complete ? <Check size={12} /> : index + 1}</span><small>{entry.label}</small></div>;
              })}
            </div>
          </div>

          {error && <div className="error-banner"><AlertTriangle size={18} /><p>{error}</p></div>}

          <div className="metrics-grid">
            <div><Box size={17} /><span>建筑</span><strong>{bundle?.stats.buildings.toLocaleString("zh-CN") || "—"}</strong></div>
            <div><MapIcon size={17} /><span>道路</span><strong>{bundle?.stats.roads.toLocaleString("zh-CN") || "—"}</strong></div>
            <div><Mountain size={17} /><span>高差</span><strong>{bundle ? `${Math.round(bundle.terrain.max - bundle.terrain.min)} m` : "—"}</strong></div>
            <div><Layers3 size={17} /><span>三角面</span><strong>{runtimeStats.triangles ? runtimeStats.triangles.toLocaleString("zh-CN") : "—"}</strong></div>
          </div>

          <div className="quality-card">
            <div className="quality-title"><span>数据质量</span><strong>{bundle ? (bundle.stats.buildings ? Math.round((1 - bundle.stats.missingHeight / bundle.stats.buildings) * 100) : 100) : 0}%</strong></div>
            <div className="quality-bar"><i style={{ width: `${bundle ? (bundle.stats.buildings ? Math.round((1 - bundle.stats.missingHeight / bundle.stats.buildings) * 100) : 100) : 0}%` }} /></div>
            <p>{bundle ? `${bundle.stats.missingHeight} 栋建筑缺少高度，已按用途与默认楼层推断。` : "生成后显示建筑高度完整率。"}</p>
          </div>

          <div className="export-section">
            <div className="export-heading"><span>EXPORT</span><strong>导出模型</strong></div>
            <button disabled={!bundle || Boolean(exporting)} onClick={exportGlbFile}><FileBox size={19} /><span><strong>GLB 模型</strong><small>推荐 · 完整材质 · Web友好</small></span><Download size={16} /></button>
            <button disabled={!bundle || Boolean(exporting)} onClick={exportFbxPackage}><FileArchive size={19} /><span><strong>FBX 模型包</strong><small>ASCII FBX 7.4 · 米制 · 含许可纹理</small></span><Download size={16} /></button>
            <button className="primary-export" disabled={!bundle || Boolean(exporting)} onClick={exportFullPackage}><FolderDown size={19} /><span><strong>{exporting === "package" ? "正在打包…" : "完整项目包"}</strong><small>GLB + FBX + GeoJSON + 高程 + 元数据</small></span></button>
            {bundle?.imagery && !sources.imagery.exportConfirmed && <p className="texture-warning"><Info size={14} />影像仅用于预览。确认许可后才会写入 FBX/完整包。</p>}
          </div>
        </aside>
      </div>

      <footer className="footerbar">
        <span>地图数据 © OpenStreetMap contributors · ODbL</span>
        <span>地形：{sources.terrain.attribution}</span>
        <span>影像：{sources.imagery.attribution}</span>
        <a href="https://github.com/openstreetmap" target="_blank" rel="noreferrer"><GitBranch size={15} />开源生态</a>
      </footer>

      {showSettings && (
        <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowSettings(false)}>
          <aside className="settings-drawer">
            <div className="drawer-heading"><div><span>DATA & STYLE</span><h2>数据源与建模设置</h2></div><button onClick={() => setShowSettings(false)}><X size={19} /></button></div>
            <SettingsPanel sources={sources} style={style} onSourcesChange={setSources} onStyleChange={setStyle} />
            <div className="drawer-footer"><button onClick={() => { setSources(DEFAULT_SOURCES); setStyle(DEFAULT_STYLE); }}><RotateCcw size={16} />恢复默认</button><button className="save-settings" onClick={() => setShowSettings(false)}><Check size={16} />保存并返回</button></div>
          </aside>
        </div>
      )}

      {showGuide && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowGuide(false)}>
          <section className="guide-modal">
            <button className="modal-close" onClick={() => setShowGuide(false)}><X size={19} /></button>
            <span className="eyebrow">QUICK START</span>
            <h2>从地图到三维模型，只需三步</h2>
            <div className="guide-grid">
              <article><span>01</span><MapIcon /><h3>圈定区域</h3><p>搜索地点，使用矩形或圆形工具拖拽。单次生成范围不超过 10 km²。</p></article>
              <article><span>02</span><Sparkles /><h3>自动建模</h3><p>工具并行获取 OSM、影像和地形，根据属性生成建筑、道路、水系、绿地与轨道。</p></article>
              <article><span>03</span><FolderDown /><h3>检查并导出</h3><p>在 Three.js 中浏览、拾取属性，再导出 GLB、FBX 或带源数据的完整项目包。</p></article>
            </div>
            <div className="guide-note"><Info size={18} /><p><strong>关于影像</strong><span>公开可浏览不等于允许再分发。请在设置中配置具有模型贴图导出许可的 XYZ/WMS 服务，并勾选许可确认。</span></p></div>
            <button className="guide-action" onClick={() => setShowGuide(false)}>开始使用<ChevronLeft size={16} /></button>
          </section>
        </div>
      )}
    </main>
  );
}

function createMetadata(bundle: BuildBundle, imageryIncluded: boolean) {
  return {
    generator: "GeoScene OSM 三维场景生成器 1.0",
    generatedAt: bundle.generatedAt,
    coordinateReferenceSystem: "EPSG:4326",
    localModel: {
      origin: { longitude: bundle.selection.center[0], latitude: bundle.selection.center[1], elevationDatum: bundle.terrain.datum },
      axes: "Y-up; X=east; Z=south",
      unit: "meter",
      verticalExaggeration: bundle.style.verticalExaggeration,
    },
    selection: bundle.selection,
    statistics: bundle.stats,
    sources: {
      osm: { name: "OpenStreetMap", license: "ODbL 1.0", attribution: "© OpenStreetMap contributors", endpoint: bundle.sources.overpassEndpoint },
      imagery: { ...bundle.sources.imagery, includedInExport: imageryIncluded },
      terrain: bundle.sources.terrain,
    },
    buildingHeightRule: ["height", "building:levels × floor height", "building-use fallback"],
  };
}

function createReadme(bundle: BuildBundle, textureIncluded: boolean, textureFile: string) {
  return `GeoScene 三维场景导入说明
===========================

生成时间：${bundle.generatedAt}
中心坐标：${bundle.selection.center[1]}, ${bundle.selection.center[0]}
选区面积：${formatArea(bundle.selection.areaM2)}

坐标与单位
----------
模型采用局部平面坐标，X 轴向东、Y 轴向上、Z 轴向南，单位为米。
本地原点对应 WGS 84：经度 ${bundle.selection.center[0]}，纬度 ${bundle.selection.center[1]}。
地形基准高程：${bundle.terrain.datum.toFixed(2)} m；垂直夸张：${bundle.style.verticalExaggeration}×。

FBX
---
文件为 FBX 7.4 ASCII。Blender、3ds Max、Maya、Cinema 4D 等软件均可导入。
${textureIncluded ? `影像纹理已作为 ${textureFile} 放在同目录；如软件未自动关联，请将地形材质的 Base Color 指向该文件。` : "影像纹理未包含：当前影像服务尚未确认具有模型贴图导出许可。几何与语义材质仍完整保留。"}

建筑高度规则
------------
1. 优先采用 OSM height；
2. 其次采用 building:levels × 默认层高；
3. 缺失时根据 building 用途推断，否则使用默认楼层。

数据来源与许可
--------------
OSM 数据：© OpenStreetMap contributors，Open Database License (ODbL) 1.0。
地形：${bundle.sources.terrain.attribution}
影像：${bundle.sources.imagery.attribution}
影像的浏览、下载、再分发与模型贴图许可由影像服务提供者条款决定。

详细参数见 metadata.json。
`;
}
