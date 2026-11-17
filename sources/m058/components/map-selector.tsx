"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { Circle, LocateFixed, MousePointer2, Square } from "lucide-react";

import type { Bounds, LonLat, SceneFeature, SelectionShape } from "../lib/types";

type Props = {
  sourceBounds: Bounds;
  selection: SelectionShape | null;
  features?: SceneFeature[];
  previewBusy?: boolean;
  onSelection: (selection: SelectionShape) => void;
  onSelectionComplete?: (selection: SelectionShape) => void;
};

type DrawMode = "rectangle" | "circle";

const MAX_MAP_FEATURES = 45_000;

function distanceMeters(a: LonLat, b: LonLat) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const lat1 = a[1] * rad;
  const lat2 = b[1] * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12_742_000 * Math.asin(Math.sqrt(h));
}

function rectangleArea(bounds: Bounds) {
  const width = distanceMeters([bounds.west, (bounds.south + bounds.north) / 2], [bounds.east, (bounds.south + bounds.north) / 2]);
  const height = distanceMeters([(bounds.west + bounds.east) / 2, bounds.south], [(bounds.west + bounds.east) / 2, bounds.north]);
  return width * height / 1_000_000;
}

function createRectangle(a: LonLat, b: LonLat): SelectionShape {
  const bounds = { west: Math.min(a[0], b[0]), south: Math.min(a[1], b[1]), east: Math.max(a[0], b[0]), north: Math.max(a[1], b[1]) };
  const polygon: LonLat[] = [
    [bounds.west, bounds.south], [bounds.east, bounds.south],
    [bounds.east, bounds.north], [bounds.west, bounds.north], [bounds.west, bounds.south],
  ];
  return { type: "rectangle", bounds, polygon, areaKm2: rectangleArea(bounds) };
}

function createCircle(center: LonLat, edge: LonLat): SelectionShape {
  const radiusMeters = distanceMeters(center, edge);
  const radiusLat = radiusMeters / 111_320;
  const radiusLon = radiusMeters / Math.max(1, 111_320 * Math.cos(center[1] * Math.PI / 180));
  const polygon: LonLat[] = [];
  for (let index = 0; index <= 64; index += 1) {
    const angle = index / 64 * Math.PI * 2;
    polygon.push([center[0] + Math.cos(angle) * radiusLon, center[1] + Math.sin(angle) * radiusLat]);
  }
  return {
    type: "circle",
    bounds: { west: center[0] - radiusLon, south: center[1] - radiusLat, east: center[0] + radiusLon, north: center[1] + radiusLat },
    polygon,
    areaKm2: Math.PI * radiusMeters * radiusMeters / 1_000_000,
    center,
    radiusMeters,
  };
}

function toLatLngs(points: LonLat[]) {
  return points.map(([lon, lat]) => [lat, lon] as Leaflet.LatLngTuple);
}

function featureStyle(feature: SceneFeature): Leaflet.PathOptions {
  if (feature.layer === "buildings") return { color: "#8c684e", weight: 0.7, fillColor: "#b68b68", fillOpacity: 0.58 };
  if (feature.layer === "water") return { color: "#5d91a7", weight: feature.geometry === "line" ? 2.2 : 0.8, fillColor: "#72a8bd", fillOpacity: 0.62 };
  if (feature.layer === "green") return { color: "#5e865f", weight: 0.7, fillColor: "#6f986f", fillOpacity: 0.5 };
  if (feature.layer === "rail") return { color: "#4f565b", weight: 1.6, dashArray: "5 3", opacity: 0.9 };
  const major = ["motorway", "trunk", "primary", "secondary"].includes(feature.tags.highway);
  return { color: "#ffffff", weight: major ? 3.2 : 1.6, opacity: 0.95 };
}

export function MapSelector({ sourceBounds, selection, features = [], previewBusy = false, onSelection, onSelectionComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const selectionLayerRef = useRef<Leaflet.Polygon | null>(null);
  const featureLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const selectionRef = useRef(selection);
  const previewBusyRef = useRef(previewBusy);
  const onSelectionRef = useRef(onSelection);
  const onSelectionCompleteRef = useRef(onSelectionComplete);
  const [mode, setMode] = useState<DrawMode>("rectangle");
  const modeRef = useRef(mode);
  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const sampledFeatures = useMemo(() => {
    const stride = Math.max(1, Math.ceil(features.length / MAX_MAP_FEATURES));
    return features.filter((_feature, index) => index % stride === 0);
  }, [features]);
  const sampledFeaturesRef = useRef(sampledFeatures);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { selectionRef.current = selection; }, [selection]);
  useEffect(() => { previewBusyRef.current = previewBusy; }, [previewBusy]);
  useEffect(() => { onSelectionRef.current = onSelection; }, [onSelection]);
  useEffect(() => { onSelectionCompleteRef.current = onSelectionComplete; }, [onSelectionComplete]);
  useEffect(() => { sampledFeaturesRef.current = sampledFeatures; }, [sampledFeatures]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let disposed = false;
    let observer: ResizeObserver | null = null;
    let cleanupDrawing: (() => void) | null = null;
    let map: Leaflet.Map | null = null;

    void import("leaflet").then(({ default: L }) => {
      if (disposed || !containerRef.current) return;
      leafletRef.current = L;
      map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      preferCanvas: false,
      worldCopyJump: false,
      maxBoundsViscosity: 0.8,
      });
      mapRef.current = map;
    map.createPane("pbfCoveragePane").style.zIndex = "340";
    map.createPane("pbfFeaturePane").style.zIndex = "410";
    map.createPane("selectionPane").style.zIndex = "620";
    const sourceLatLngBounds = L.latLngBounds(
      L.latLng(sourceBounds.south, sourceBounds.west),
      L.latLng(sourceBounds.north, sourceBounds.east),
    );
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      crossOrigin: true,
      attribution: "© OpenStreetMap contributors",
    });
    tiles.on("tileerror", () => setTileError(true));
    tiles.addTo(map);
    L.rectangle(sourceLatLngBounds, {
      pane: "pbfCoveragePane",
      color: "#557968",
      weight: 1.6,
      dashArray: "8 5",
      fillColor: "#708b7b",
      fillOpacity: 0.055,
      interactive: false,
    }).addTo(map);
    featureLayerRef.current = L.layerGroup().addTo(map);
    if (selectionRef.current) {
      selectionLayerRef.current = L.polygon(toLatLngs(selectionRef.current.polygon), {
        pane: "selectionPane", color: "#b33e35", weight: 3, dashArray: "8 4", fillColor: "#e07563", fillOpacity: 0.2, interactive: false,
      }).addTo(map);
    }
    map.fitBounds(sourceLatLngBounds, { padding: [32, 32], maxZoom: 11, animate: false });
    window.requestAnimationFrame(() => { map.invalidateSize(); setMapReady(true); });

    observer = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (mapRef.current === map) map.invalidateSize({ animate: false });
      });
    });
    observer.observe(containerRef.current);

    const handleDown = (event: L.LeafletMouseEvent) => {
      const original = event.originalEvent as MouseEvent;
      if (original.button !== 0 || previewBusyRef.current) return;
      L.DomEvent.preventDefault(original);
      cleanupDrawing?.();
      const start: LonLat = [event.latlng.lng, event.latlng.lat];
      let latest: SelectionShape | null = null;
      let finished = false;
      map.dragging.disable();
      setDrawing(true);
      const handleMove = (moveEvent: L.LeafletMouseEvent) => {
        const end: LonLat = [moveEvent.latlng.lng, moveEvent.latlng.lat];
        latest = modeRef.current === "circle" ? createCircle(start, end) : createRectangle(start, end);
        selectionRef.current = latest;
        if (!selectionLayerRef.current) {
          selectionLayerRef.current = L.polygon(toLatLngs(latest.polygon), {
            pane: "selectionPane", color: "#b33e35", weight: 3, dashArray: "8 4", fillColor: "#e07563", fillOpacity: 0.2, interactive: false,
          }).addTo(map);
        } else {
          selectionLayerRef.current.setLatLngs(toLatLngs(latest.polygon));
        }
        selectionLayerRef.current.bringToFront();
        onSelectionRef.current(latest);
      };
      const handleUp = () => {
        if (finished) return;
        finished = true;
        map.off("mousemove", handleMove);
        map.off("mouseup", handleUp);
        window.removeEventListener("mouseup", handleUp);
        map.dragging.enable();
        setDrawing(false);
        cleanupDrawing = null;
        if (latest && latest.areaKm2 > 0.001) onSelectionCompleteRef.current?.(latest);
      };
      cleanupDrawing = handleUp;
      map.on("mousemove", handleMove);
      map.on("mouseup", handleUp);
      window.addEventListener("mouseup", handleUp);
    };
    map.on("mousedown", handleDown);
    if (sampledFeaturesRef.current.length) {
      for (const feature of sampledFeaturesRef.current) {
        const style = { ...featureStyle(feature), pane: "pbfFeaturePane", interactive: false };
        if (feature.geometry === "polygon") featureLayerRef.current?.addLayer(L.polygon(feature.coordinates.map(toLatLngs), style));
        else featureLayerRef.current?.addLayer(L.polyline(toLatLngs(feature.coordinates[0]), style));
      }
      selectionLayerRef.current?.bringToFront();
    }
    });

    return () => {
      disposed = true;
      cleanupDrawing?.();
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      selectionLayerRef.current = null;
      featureLayerRef.current = null;
    };
  }, [sourceBounds]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;
    if (!selection) {
      if (selectionLayerRef.current) map.removeLayer(selectionLayerRef.current);
      selectionLayerRef.current = null;
      return;
    }
    if (!selectionLayerRef.current) {
      selectionLayerRef.current = L.polygon(toLatLngs(selection.polygon), {
        pane: "selectionPane", color: "#b33e35", weight: 3, dashArray: "8 4", fillColor: "#e07563", fillOpacity: 0.2, interactive: false,
      }).addTo(map);
    } else {
      selectionLayerRef.current.setLatLngs(toLatLngs(selection.polygon));
    }
    selectionLayerRef.current.bringToFront();
  }, [selection]);

  useEffect(() => {
    const group = featureLayerRef.current;
    const L = leafletRef.current;
    if (!group || !L) return;
    group.clearLayers();
    for (const feature of sampledFeatures) {
      const style = { ...featureStyle(feature), pane: "pbfFeaturePane", interactive: false };
      if (feature.geometry === "polygon") {
        const polygon = L.polygon(feature.coordinates.map(toLatLngs), style);
        group.addLayer(polygon);
      } else {
        const line = L.polyline(toLatLngs(feature.coordinates[0]), style);
        group.addLayer(line);
      }
    }
    selectionLayerRef.current?.bringToFront();
  }, [sampledFeatures]);

  const fitSource = () => mapRef.current?.fitBounds(
    [[sourceBounds.south, sourceBounds.west], [sourceBounds.north, sourceBounds.east]],
    { padding: [32, 32], maxZoom: 11, animate: true },
  );

  return (
    <div className="map-selector">
      <div ref={containerRef} className={`map-canvas ${drawing ? "is-drawing" : ""}`} aria-label="PBF 数据选区地图" />
      <div className="map-tools" aria-label="选区工具">
        <button className={mode === "rectangle" ? "active" : ""} onClick={() => setMode("rectangle")} title="矩形框选" disabled={previewBusy}>
          <Square size={17} strokeWidth={1.8} /><span>矩形</span>
        </button>
        <button className={mode === "circle" ? "active" : ""} onClick={() => setMode("circle")} title="圆形圈选" disabled={previewBusy}>
          <Circle size={17} strokeWidth={1.8} /><span>圆形</span>
        </button>
        <button onClick={fitSource} title="返回 PBF 数据范围"><LocateFixed size={17} strokeWidth={1.8} /></button>
      </div>
      {mapReady && <div className="map-legend">
        <span><i className="coverage" />PBF 覆盖范围</span>
        <span><i className="buildings" />建筑</span><span><i className="water" />水系</span><span><i className="green" />绿地</span>
      </div>}
      <div className="map-hint"><MousePointer2 size={14} />{
        !mapReady ? "地图加载中…"
          : previewBusy ? "正在读取选区内的 PBF 图层…"
            : features.length ? `已显示 ${features.length.toLocaleString()} 个 PBF 要素，可重新绘制`
              : "按住并拖动绘制选区；完成后自动读取 PBF 图层"
      }</div>
      {tileError && <div className="map-error">在线底图未完全加载；PBF 覆盖范围、数据图层与选区仍可正常显示。</div>}
    </div>
  );
}
