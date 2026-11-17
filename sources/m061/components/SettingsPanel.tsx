"use client";

import { ChevronDown, Database, Image as ImageIcon, Layers3, Mountain, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { DataSourceSettings, SceneStyle } from "../lib/types";

interface SettingsPanelProps {
  sources: DataSourceSettings;
  style: SceneStyle;
  onSourcesChange: (sources: DataSourceSettings) => void;
  onStyleChange: (style: SceneStyle) => void;
}

function Section({ icon, title, subtitle, children, open = false }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="settings-section" open={open}>
      <summary>
        <span className="settings-icon">{icon}</span>
        <span><strong>{title}</strong><small>{subtitle}</small></span>
        <ChevronDown className="chevron" size={17} />
      </summary>
      <div className="settings-content">{children}</div>
    </details>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <button type="button" role="switch" aria-checked={checked} className={`switch ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
        <span />
      </button>
    </label>
  );
}

export default function SettingsPanel({ sources, style, onSourcesChange, onStyleChange }: SettingsPanelProps) {
  const updateImagery = (patch: Partial<DataSourceSettings["imagery"]>) => onSourcesChange({ ...sources, imagery: { ...sources.imagery, ...patch } });
  const updateTerrain = (patch: Partial<DataSourceSettings["terrain"]>) => onSourcesChange({ ...sources, terrain: { ...sources.terrain, ...patch } });
  const updateStyle = (patch: Partial<SceneStyle>) => onStyleChange({ ...style, ...patch });

  return (
    <div className="settings-panel">
      <Section icon={<Database size={18} />} title="OSM 矢量数据" subtitle="建筑、道路、水系与用地" open>
        <label className="field-label">Overpass 服务</label>
        <select value={sources.overpassEndpoint} onChange={(event) => onSourcesChange({ ...sources, overpassEndpoint: event.target.value })}>
          <option value="auto">自动选择可用节点（推荐）</option>
          <option value="https://overpass-api.de/api/interpreter">overpass-api.de</option>
          <option value="https://overpass.kumi.systems/api/interpreter">overpass.kumi.systems</option>
          <option value="https://overpass.nchc.org.tw/api/interpreter">overpass.nchc.org.tw</option>
        </select>
        <p className="field-note">生成时只请求框选范围内的原始 OSM 要素，不抓取公共地图瓦片。</p>
      </Section>

      <Section icon={<ImageIcon size={18} />} title="高精度影像" subtitle="XYZ 或 WMS 服务，可替换">
        <div className="segmented-control">
          <button type="button" className={sources.imagery.kind === "xyz" ? "active" : ""} onClick={() => updateImagery({ kind: "xyz" })}>XYZ</button>
          <button type="button" className={sources.imagery.kind === "wms" ? "active" : ""} onClick={() => updateImagery({ kind: "wms" })}>WMS</button>
        </div>
        <label className="field-label">服务名称</label>
        <input value={sources.imagery.name} onChange={(event) => updateImagery({ name: event.target.value })} />
        <label className="field-label">服务地址</label>
        <textarea rows={3} value={sources.imagery.url} onChange={(event) => updateImagery({ url: event.target.value })} placeholder={sources.imagery.kind === "xyz" ? "https://.../{z}/{x}/{y}.jpg" : "https://.../wms"} />
        {sources.imagery.kind === "wms" && (
          <>
            <label className="field-label">图层名称（LAYERS）</label>
            <input value={sources.imagery.layers || ""} onChange={(event) => updateImagery({ layers: event.target.value })} />
          </>
        )}
        {sources.imagery.kind === "xyz" && (
          <div className="field-grid">
            <label><span>最大层级</span><input type="number" min="1" max="22" value={sources.imagery.maxZoom} onChange={(event) => updateImagery({ maxZoom: Number(event.target.value) })} /></label>
            <label><span>瓦片尺寸</span><select value={sources.imagery.tileSize || 256} onChange={(event) => updateImagery({ tileSize: Number(event.target.value) })}><option value="256">256 px</option><option value="512">512 px</option></select></label>
          </div>
        )}
        <label className="field-label">数据署名</label>
        <textarea rows={2} value={sources.imagery.attribution} onChange={(event) => updateImagery({ attribution: event.target.value })} />
        <label className="licence-check">
          <input type="checkbox" checked={sources.imagery.exportConfirmed} onChange={(event) => updateImagery({ exportConfirmed: event.target.checked })} />
          <span><strong>我确认该影像许可导出为模型贴图</strong><small>未确认时仍可预览，但导出包不会包含影像纹理。</small></span>
        </label>
      </Section>

      <Section icon={<Mountain size={18} />} title="真实地形" subtitle="Terrarium 全球高程">
        <label className="field-label">地形服务地址</label>
        <textarea rows={3} value={sources.terrain.url} onChange={(event) => updateTerrain({ url: event.target.value })} />
        <div className="field-grid">
          <label><span>采样层级</span><input type="number" min="0" max="15" value={sources.terrain.zoom} onChange={(event) => updateTerrain({ zoom: Number(event.target.value) })} /></label>
          <label><span>网格精度</span><select value={sources.terrain.gridSize} onChange={(event) => updateTerrain({ gridSize: Number(event.target.value) })}><option value="33">33 × 33</option><option value="65">65 × 65</option><option value="97">97 × 97</option><option value="129">129 × 129</option></select></label>
        </div>
        <label className="range-field"><span>垂直夸张<strong>{style.verticalExaggeration.toFixed(2)}×</strong></span><input type="range" min="0.2" max="4" step="0.05" value={style.verticalExaggeration} onChange={(event) => updateStyle({ verticalExaggeration: Number(event.target.value) })} /></label>
      </Section>

      <Section icon={<Layers3 size={18} />} title="语义图层" subtitle="可见性、颜色与透明度">
        <Toggle checked={style.showImagery} label="影像底图" onChange={(showImagery) => updateStyle({ showImagery })} />
        <Toggle checked={style.showBuildings} label="建筑" onChange={(showBuildings) => updateStyle({ showBuildings })} />
        <Toggle checked={style.showRoads} label="道路" onChange={(showRoads) => updateStyle({ showRoads })} />
        <Toggle checked={style.showWater} label="水系" onChange={(showWater) => updateStyle({ showWater })} />
        <Toggle checked={style.showGreen} label="绿地" onChange={(showGreen) => updateStyle({ showGreen })} />
        <Toggle checked={style.showRail} label="轨道" onChange={(showRail) => updateStyle({ showRail })} />
        <div className="color-grid">
          {([
            ["buildingColor", "建筑"], ["landmarkColor", "地标"], ["roadColor", "道路"],
            ["waterColor", "水系"], ["greenColor", "绿地"], ["railColor", "轨道"],
          ] as Array<[keyof SceneStyle, string]>).map(([key, label]) => (
            <label key={key}><span>{label}</span><input type="color" value={String(style[key])} onChange={(event) => updateStyle({ [key]: event.target.value })} /></label>
          ))}
        </div>
        <label className="range-field"><span>影像透明度<strong>{Math.round(style.imageryOpacity * 100)}%</strong></span><input type="range" min="0" max="1" step="0.01" value={style.imageryOpacity} onChange={(event) => updateStyle({ imageryOpacity: Number(event.target.value) })} /></label>
        <label className="range-field"><span>语义层透明度<strong>{Math.round(style.semanticOpacity * 100)}%</strong></span><input type="range" min="0.2" max="1" step="0.01" value={style.semanticOpacity} onChange={(event) => updateStyle({ semanticOpacity: Number(event.target.value) })} /></label>
      </Section>

      <Section icon={<SlidersHorizontal size={18} />} title="建模规则" subtitle="高度缺失时自动补全">
        <div className="field-grid">
          <label><span>默认楼层</span><input type="number" min="1" max="30" value={style.defaultBuildingLevels} onChange={(event) => updateStyle({ defaultBuildingLevels: Number(event.target.value) })} /></label>
          <label><span>默认层高（m）</span><input type="number" min="2" max="8" step="0.1" value={style.defaultFloorHeight} onChange={(event) => updateStyle({ defaultFloorHeight: Number(event.target.value) })} /></label>
        </div>
        <Toggle checked={style.highlightLandmarks} label="自动强调地标建筑" onChange={(highlightLandmarks) => updateStyle({ highlightLandmarks })} />
        <div className="rule-stack">
          <span><em>01</em>优先读取 OSM <code>height</code></span>
          <span><em>02</em>其次读取 <code>building:levels</code></span>
          <span><em>03</em>最后按建筑用途推断</span>
        </div>
      </Section>

      <div className="compliance-note">
        <ShieldCheck size={19} />
        <p><strong>数据许可随导出包一并记录</strong><span>OSM 采用 ODbL；影像许可由所配置的数据服务决定。</span></p>
      </div>
    </div>
  );
}
