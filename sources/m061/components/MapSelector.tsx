"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, MousePointer2, Search, Square, Trash2 } from "lucide-react";
import type { AreaSelection, DataSourceSettings, LngLat } from "../lib/types";
import { createCirclePolygon, createSelection, formatArea } from "../lib/geo";

interface MapSelectorProps {
  selection: AreaSelection | null;
  sources: DataSourceSettings;
  onChange: (selection: AreaSelection | null) => void;
}

const MAX_AREA_M2 = 10_000_000;

export default function MapSelector({ selection, sources, onChange }: MapSelectorProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const featureGroupRef = useRef<import("leaflet").FeatureGroup | null>(null);
  const drawControlRef = useRef<import("leaflet").Control.Draw | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onChangeRef = useRef(onChange);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [activeTool, setActiveTool] = useState<"rectangle" | "circle" | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;
    let cancelled = false;
    let cleanup = () => {};

    import("leaflet").then(async (leaflet) => {
      if (cancelled || !mapElementRef.current) return;
      const L = leaflet;
      (window as typeof window & { L?: typeof leaflet }).L = L;
      await import("leaflet-draw");
      const geometryUtil = (L as typeof L & { GeometryUtil?: { readableArea?: (area: number, metric?: boolean | string | string[], precision?: Record<string, number>) => string } }).GeometryUtil;
      if (geometryUtil) {
        geometryUtil.readableArea = (area, metric = true, precision = {}) => {
          const digits = { km: 2, ha: 2, m: 0, mi: 2, ac: 2, yd: 0, ...precision };
          if (metric) {
            const units = typeof metric === "string" ? [metric] : Array.isArray(metric) ? metric : ["ha", "m"];
            if (area >= 1_000_000 && units.includes("km")) return `${(area / 1_000_000).toFixed(digits.km)} km²`;
            if (area >= 10_000 && units.includes("ha")) return `${(area / 10_000).toFixed(digits.ha)} ha`;
            return `${area.toFixed(digits.m)} m²`;
          }
          const squareYards = area / 0.836127;
          if (squareYards >= 3_097_600) return `${(squareYards / 3_097_600).toFixed(digits.mi)} mi²`;
          if (squareYards >= 4_840) return `${(squareYards / 4_840).toFixed(digits.ac)} acres`;
          return `${squareYards.toFixed(digits.yd)} yd²`;
        };
      }
      if (cancelled || !mapElementRef.current) return;
      leafletRef.current = leaflet;
      const map = L.map(mapElementRef.current, {
        center: [31.2304, 121.4737],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer(sources.imagery.url, {
        maxZoom: sources.imagery.maxZoom,
        attribution: sources.imagery.attribution,
        crossOrigin: true,
      }).addTo(map);
      const group = new L.FeatureGroup();
      map.addLayer(group);
      featureGroupRef.current = group;
      mapRef.current = map;

      const drawControl = new L.Control.Draw({
        position: "topleft",
        draw: {
          polyline: false,
          polygon: false,
          marker: false,
          circlemarker: false,
          rectangle: { shapeOptions: { color: "#e07563", weight: 2, fillOpacity: 0.1 } },
          circle: { shapeOptions: { color: "#e07563", weight: 2, fillOpacity: 0.1 } },
        },
        edit: { featureGroup: group, edit: false, remove: false },
      });
      drawControlRef.current = drawControl;

      const handleCreated = (event: import("leaflet").DrawEvents.Created) => {
        group.clearLayers();
        group.addLayer(event.layer);
        setActiveTool(null);
        setError("");
        let nextSelection: AreaSelection;
        if (event.layerType === "circle") {
          const circle = event.layer as import("leaflet").Circle;
          const center = circle.getLatLng();
          const radius = circle.getRadius();
          const polygon = createCirclePolygon([center.lng, center.lat], radius);
          nextSelection = createSelection("circle", polygon, radius);
        } else {
          const rectangle = event.layer as import("leaflet").Rectangle;
          const raw = rectangle.getLatLngs()[0] as import("leaflet").LatLng[];
          nextSelection = createSelection("rectangle", raw.map((point) => [point.lng, point.lat] as LngLat));
        }
        if (nextSelection.areaM2 > MAX_AREA_M2) {
          setError(`当前选区为 ${formatArea(nextSelection.areaM2)}，超过 10 km² 限制。请缩小选区。`);
        }
        onChangeRef.current(nextSelection);
      };
      map.on(L.Draw.Event.CREATED, handleCreated as import("leaflet").LeafletEventHandlerFn);

      cleanup = () => {
        map.off(L.Draw.Event.CREATED, handleCreated as import("leaflet").LeafletEventHandlerFn);
        map.remove();
        mapRef.current = null;
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  // Map initialization intentionally runs once. Source changes are applied in a separate effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = featureGroupRef.current;
    const module = leafletRef.current;
    if (!map || !group || !module) return;
    const L = module;
    group.clearLayers();
    if (!selection) return;
    const latLngs = selection.polygon.map(([lng, lat]) => L.latLng(lat, lng));
    const layer = selection.kind === "circle" && selection.radiusM
      ? L.circle([selection.center[1], selection.center[0]], { radius: selection.radiusM, color: "#e07563", weight: 2, fillOpacity: 0.1 })
      : L.polygon(latLngs, { color: "#e07563", weight: 2, fillOpacity: 0.1 });
    group.addLayer(layer);
  }, [selection]);

  useEffect(() => {
    const map = mapRef.current;
    const module = leafletRef.current;
    if (!map || !module || sources.imagery.kind !== "xyz") return;
    const L = module;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    L.tileLayer(sources.imagery.url, {
      maxZoom: sources.imagery.maxZoom,
      attribution: sources.imagery.attribution,
      crossOrigin: true,
    }).addTo(map).bringToBack();
  }, [sources.imagery.url, sources.imagery.maxZoom, sources.imagery.attribution, sources.imagery.kind]);

  function startDrawing(tool: "rectangle" | "circle") {
    const map = mapRef.current;
    const module = leafletRef.current;
    if (!map || !module) return;
    const L = module;
    setActiveTool(tool);
    setError("");
    const drawMap = map as import("leaflet").DrawMap;
    const drawer = tool === "rectangle"
      ? new L.Draw.Rectangle(drawMap, { shapeOptions: { color: "#e07563", weight: 2, fillOpacity: 0.1 } })
      : new L.Draw.Circle(drawMap, { shapeOptions: { color: "#e07563", weight: 2, fillOpacity: 0.1 } });
    drawer.enable();
  }

  function clearSelection() {
    featureGroupRef.current?.clearLayers();
    setError("");
    setActiveTool(null);
    onChange(null);
  }

  async function searchPlace(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    try {
      let results: Array<{ lat: string; lon: string; display_name: string }> = [];
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
        const payload = (await response.json()) as { results?: typeof results; error?: string };
        if (!response.ok || !payload.results?.length) throw new Error(payload.error || "未找到该地点");
        results = payload.results;
      } catch {
        const endpoint = new URL("https://nominatim.openstreetmap.org/search");
        endpoint.searchParams.set("q", query.trim());
        endpoint.searchParams.set("format", "jsonv2");
        endpoint.searchParams.set("limit", "5");
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`地点服务返回 HTTP ${response.status}`);
        results = await response.json() as typeof results;
        if (!results.length) throw new Error("未找到该地点");
      }
      const result = results[0];
      mapRef.current?.flyTo([Number(result.lat), Number(result.lon)], 15, { duration: 1.2 });
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "地点搜索失败");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="map-shell">
      <form className="map-search" onSubmit={searchPlace}>
        <Search size={17} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索城市、地标或坐标"
          aria-label="搜索地点"
        />
        <button type="submit" disabled={searching}>{searching ? "定位中" : "定位"}</button>
      </form>
      <div className="map-tools" role="toolbar" aria-label="选区工具">
        <button className={activeTool === "rectangle" ? "active" : ""} onClick={() => startDrawing("rectangle")} type="button">
          <Square size={16} />矩形框选
        </button>
        <button className={activeTool === "circle" ? "active" : ""} onClick={() => startDrawing("circle")} type="button">
          <Circle size={16} />圆形圈选
        </button>
        <button onClick={clearSelection} type="button" disabled={!selection}>
          <Trash2 size={16} />清除
        </button>
      </div>
      <div ref={mapElementRef} className="map-canvas" aria-label="地图选区" />
      {!selection && (
        <div className="map-hint">
          <MousePointer2 size={18} />
          <span>选择矩形或圆形，在地图上拖拽生成场景范围</span>
        </div>
      )}
      {selection && (
        <div className={`selection-chip ${selection.areaM2 > MAX_AREA_M2 ? "danger" : ""}`}>
          <span>{selection.kind === "circle" ? "圆形选区" : "矩形选区"}</span>
          <strong>{formatArea(selection.areaM2)}</strong>
          <small>上限 10 km²</small>
        </div>
      )}
      {error && <div className="map-error" role="alert">{error}</div>}
    </div>
  );
}
