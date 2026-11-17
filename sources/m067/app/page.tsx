"use client";

import "leaflet/dist/leaflet.css";
import {
  ChangeEvent,
  CSSProperties,
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CircleMarker, Map as LeafletMap, Polyline } from "leaflet";

type TrackPoint = {
  lat: number;
  lon: number;
  ele: number;
  time: number | null;
  cumulativeKm: number;
};

type TrackData = {
  name: string;
  points: TrackPoint[];
  totalDistanceKm: number;
  durationSeconds: number;
  hasOriginalTime: boolean;
};

type TrackPosition = {
  point: TrackPoint;
  line: [number, number][];
  index: number;
};

const ANIMATION_DURATION_MS = 42000;
const DEMO_COORDS = [
  [25.0217, 121.5292, 42], [25.023, 121.5287, 45], [25.0243, 121.5288, 47],
  [25.0255, 121.5297, 52], [25.0268, 121.53, 55], [25.0279, 121.531, 58],
  [25.0292, 121.5315, 63], [25.0305, 121.5326, 67], [25.0314, 121.5341, 70],
  [25.0327, 121.5354, 73], [25.034, 121.5365, 76], [25.0348, 121.5381, 82],
  [25.0352, 121.54, 86], [25.0349, 121.5419, 82], [25.0344, 121.5437, 77],
  [25.0335, 121.545, 72], [25.032, 121.5457, 69], [25.0306, 121.5468, 65],
  [25.029, 121.547, 62], [25.0275, 121.548, 57], [25.0262, 121.5492, 53],
  [25.0248, 121.5497, 49], [25.0233, 121.5491, 46], [25.0222, 121.548, 43],
] as const;

function haversineKm(a: Pick<TrackPoint, "lat" | "lon">, b: Pick<TrackPoint, "lat" | "lon">) {
  const radius = 6371;
  const radians = (value: number) => (value * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function addCumulativeDistance(points: Omit<TrackPoint, "cumulativeKm">[]): TrackPoint[] {
  let cumulativeKm = 0;
  return points.map((point, index) => {
    if (index) cumulativeKm += haversineKm(points[index - 1], point);
    return { ...point, cumulativeKm };
  });
}

function buildDemoTrack(): TrackData {
  const startTime = Date.parse("2026-07-22T05:30:00+08:00");
  const points = addCumulativeDistance(DEMO_COORDS.map(([lat, lon, ele], index) => ({ lat, lon, ele, time: startTime + index * 128000 })));
  return { name: "台北晨间城市跑", points, totalDistanceKm: points.at(-1)!.cumulativeKm, durationSeconds: 49 * 60 + 16, hasOriginalTime: true };
}

const DEMO_TRACK = buildDemoTrack();

function nestedText(element: Element, localName: string) {
  return Array.from(element.getElementsByTagName("*")).find((node) => node.localName.toLowerCase() === localName.toLowerCase())?.textContent?.trim() ?? "";
}

function parseGpx(source: string, filename: string): TrackData {
  const document = new DOMParser().parseFromString(source, "application/xml");
  if (document.querySelector("parsererror")) throw new Error("GPX 文件格式无法识别");
  const track = Array.from(document.getElementsByTagName("trkpt"));
  const route = track.length ? track : Array.from(document.getElementsByTagName("rtept"));
  const elements = route.length ? route : Array.from(document.getElementsByTagName("wpt"));
  const raw = elements.map((element) => {
    const elevation = Number(nestedText(element, "ele"));
    const parsedTime = Date.parse(nestedText(element, "time"));
    return {
      lat: Number(element.getAttribute("lat")),
      lon: Number(element.getAttribute("lon")),
      ele: Number.isFinite(elevation) ? elevation : 0,
      time: Number.isFinite(parsedTime) ? parsedTime : null,
    };
  }).filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon) && Math.abs(point.lat) <= 90 && Math.abs(point.lon) <= 180);
  if (raw.length < 2) throw new Error("文件中至少需要两个有效轨迹点");
  const points = addCumulativeDistance(raw);
  const totalDistanceKm = points.at(-1)!.cumulativeKm;
  const timed = points.filter((point) => point.time !== null);
  const originalDuration = timed.length > 1 ? Math.max(0, (timed.at(-1)!.time! - timed[0].time!) / 1000) : 0;
  return {
    name: nestedText(document.documentElement, "name") || filename.replace(/\.gpx$/i, ""),
    points,
    totalDistanceKm,
    durationSeconds: originalDuration || Math.max(60, (totalDistanceKm / 10) * 3600),
    hasOriginalTime: originalDuration > 0,
  };
}

function positionAtDistance(track: TrackData, progress: number): TrackPosition {
  const points = track.points;
  const target = track.totalDistanceKm * Math.min(1, Math.max(0, progress));
  let low = 0;
  let high = points.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (points[middle].cumulativeKm < target) low = middle + 1;
    else high = middle;
  }
  const nextIndex = Math.max(1, low);
  const previous = points[nextIndex - 1];
  const next = points[nextIndex];
  const segment = Math.max(next.cumulativeKm - previous.cumulativeKm, 1e-9);
  const ratio = Math.min(1, Math.max(0, (target - previous.cumulativeKm) / segment));
  const point: TrackPoint = {
    lat: previous.lat + (next.lat - previous.lat) * ratio,
    lon: previous.lon + (next.lon - previous.lon) * ratio,
    ele: previous.ele + (next.ele - previous.ele) * ratio,
    time: null,
    cumulativeKm: target,
  };
  return { point, index: nextIndex, line: [...points.slice(0, nextIndex).map((item) => [item.lat, item.lon] as [number, number]), [point.lat, point.lon]] };
}

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  return [Math.floor(safe / 3600), Math.floor((safe % 3600) / 60), safe % 60].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatPace(secondsPerKm: number) {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return "--:--";
  const rounded = Math.round(secondsPerKm);
  return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`;
}

function formatCoordinates(point?: Pick<TrackPoint, "lat" | "lon">) {
  if (!point) return "--";
  return `${Math.abs(point.lat).toFixed(4)}°${point.lat >= 0 ? "N" : "S"}, ${Math.abs(point.lon).toFixed(4)}°${point.lon >= 0 ? "E" : "W"}`;
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return <div className="metric"><span className="metric-label">{label}</span><span className="metric-value">{value}</span><span className="metric-unit">{unit}</span></div>;
}

export default function Home() {
  const [track, setTrack] = useState<TrackData>(DEMO_TRACK);
  const [progress, setProgress] = useState(0.02);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [notice, setNotice] = useState("正在播放示例轨迹");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const routeRef = useRef<Polyline | null>(null);
  const glowRef = useRef<Polyline | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const position = useMemo(() => positionAtDistance(track, progress), [track, progress]);
  const elapsedSeconds = track.durationSeconds * progress;
  const completedDistanceKm = position.point.cumulativeKm;
  const pace = completedDistanceKm > 0.02 ? elapsedSeconds / completedDistanceKm : track.durationSeconds / Math.max(track.totalDistanceKm, 0.001);

  useEffect(() => {
    let disposed = false;
    void import("leaflet").then((L) => {
      if (disposed || !mapElementRef.current || mapRef.current) return;
      const map = L.map(mapElementRef.current, { zoomControl: false, attributionControl: true, preferCanvas: true });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
        crossOrigin: true,
      }).addTo(map);
      const bounds = L.latLngBounds(track.points.map((point) => [point.lat, point.lon] as [number, number]));
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
      glowRef.current = L.polyline(position.line, { color: "#f1f0ec", weight: 11, opacity: 0.9, lineCap: "round", lineJoin: "round", smoothFactor: 1 }).addTo(map);
      routeRef.current = L.polyline(position.line, { color: "#e07563", weight: 5, opacity: 1, lineCap: "round", lineJoin: "round", smoothFactor: 1 }).addTo(map);
      markerRef.current = L.circleMarker([position.point.lat, position.point.lon], { radius: 8, color: "#e07563", weight: 4, fillColor: "#f1f0ec", fillOpacity: 1 }).addTo(map);
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
    });
    return () => { disposed = true; };
    // Map is initialized once; later track changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    void import("leaflet").then((L) => {
      const bounds = L.latLngBounds(track.points.map((point) => [point.lat, point.lon] as [number, number]));
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16, animate: true, duration: 0.8 });
    });
  }, [track]);

  useEffect(() => {
    routeRef.current?.setLatLngs(position.line);
    glowRef.current?.setLatLngs(position.line);
    markerRef.current?.setLatLng([position.point.lat, position.point.lon]);
  }, [position]);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (previousTimeRef.current === null) previousTimeRef.current = timestamp;
      const delta = timestamp - previousTimeRef.current;
      previousTimeRef.current = timestamp;
      setProgress((current) => {
        const next = current + (delta * playbackSpeed) / ANIMATION_DURATION_MS;
        if (next >= 1) { setIsPlaying(false); setNotice("轨迹播放完成"); return 1; }
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    if (isPlaying) animationRef.current = requestAnimationFrame(animate);
    else previousTimeRef.current = null;
    return () => { if (animationRef.current !== null) cancelAnimationFrame(animationRef.current); animationRef.current = null; };
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    if (progress >= 1 && recorderRef.current?.state === "recording") setTimeout(() => recorderRef.current?.stop(), 700);
  }, [progress]);

  const loadFile = useCallback(async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".gpx")) { setError("请选择 .gpx 格式的轨迹文件"); return; }
    if (file.size > 20 * 1024 * 1024) { setError("文件过大，请选择 20MB 以内的 GPX 文件"); return; }
    try {
      const parsed = parseGpx(await file.text(), file.name);
      setTrack(parsed); setProgress(0); setPlaybackSpeed(1); setIsPlaying(true); setError("");
      setNotice(`${parsed.name} · ${parsed.points.length.toLocaleString()} 个轨迹点`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "读取轨迹时发生错误"); }
  }, []);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) { setError("当前浏览器不支持屏幕录制，请使用最新版 Chrome 或 Edge"); return; }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
      const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 8_000_000 } : undefined);
      recordChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) recordChunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(recordChunksRef.current, { type: recorder.mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = `${track.name.replace(/[\\/:*?"<>|]/g, "-")}-轨迹动画.webm`; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        stream.getTracks().forEach((item) => item.stop());
        setIsRecording(false); setNotice("视频已保存到本地");
      };
      stream.getVideoTracks()[0].onended = () => { if (recorder.state === "recording") recorder.stop(); };
      recorderRef.current = recorder;
      recorder.start(500);
      setProgress(0); setPlaybackSpeed(1); setIsPlaying(true); setIsRecording(true); setNotice("正在录制，请保持当前标签页可见");
    } catch { setNotice("已取消录制"); setIsRecording(false); }
  };

  const stopRecording = () => { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); };
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => { void loadFile(event.target.files?.[0]); event.target.value = ""; };
  const handleDrop = (event: DragEvent<HTMLElement>) => { event.preventDefault(); setIsDragging(false); void loadFile(event.dataTransfer.files?.[0]); };
  const togglePlayback = () => { if (progress >= 1) setProgress(0); setIsPlaying((current) => !current); setNotice(isPlaying ? "动画已暂停" : "正在播放轨迹"); };
  const toggleFullscreen = async () => { if (!document.fullscreenElement) await shellRef.current?.requestFullscreen(); else await document.exitFullscreen(); };

  const elevationBounds = track.points.reduce((bounds, point) => ({ min: Math.min(bounds.min, point.ele), max: Math.max(bounds.max, point.ele) }), { min: Infinity, max: -Infinity });
  const elevationPath = useMemo(() => {
    const sampled = track.points.filter((_, index) => index % Math.max(1, Math.floor(track.points.length / 90)) === 0);
    const range = Math.max(elevationBounds.max - elevationBounds.min, 1);
    return sampled.map((point, index) => `${index ? "L" : "M"}${((index / Math.max(1, sampled.length - 1)) * 240).toFixed(1)} ${(52 - ((point.ele - elevationBounds.min) / range) * 42).toFixed(1)}`).join(" ");
  }, [track, elevationBounds.max, elevationBounds.min]);

  return (
    <main className="studio-shell" ref={shellRef}>
      <svg className="paper-noise" aria-hidden="true"><filter id="noise-filter"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" seed="17" /></filter><rect width="100%" height="100%" filter="url(#noise-filter)" /></svg>
      <input ref={fileInputRef} className="visually-hidden" type="file" accept=".gpx,application/gpx+xml" onChange={handleFileChange} />
      <header className="topbar">
        <div className="brand-block"><span className="index">01 / MOTION LAB</span><strong>轨迹动画</strong></div>
        <div className="metrics">
          <Metric label="已用时" value={formatDuration(elapsedSeconds)} unit="H:M:S" />
          <Metric label="已完成" value={completedDistanceKm.toFixed(2)} unit="KM" />
          <Metric label="平均配速" value={formatPace(pace)} unit="/KM" />
          <Metric label="进度" value={Math.round(progress * 100).toString()} unit="%" />
          <Metric label="海拔" value={Math.round(position.point.ele).toString()} unit="M" />
        </div>
        <button className="file-button" type="button" onClick={() => fileInputRef.current?.click()}><span>上传 GPX</span><i>↗</i></button>
      </header>
      <section className={`map-stage${isDragging ? " is-dragging" : ""}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false); }} onDrop={handleDrop}>
        <div ref={mapElementRef} className="real-map" aria-label="真实地图轨迹动画" />
        <div className="map-vignette" />
        <div className="map-caption"><span>ROUTE / {formatCoordinates(position.point)}</span><h1>让轨迹<br />开始行走</h1><p>{notice}。轨迹文件只在当前浏览器解析，不会上传服务器。</p></div>
        <div className="map-label label-c">{track.name} / {track.points.length} POINTS</div>
        <button className="upload-card" type="button" onClick={() => fileInputRef.current?.click()}><span className="upload-number">GPX</span><span className="upload-copy"><strong>{isDragging ? "松开即可读取轨迹" : "放入一段真实旅程"}</strong><small>{track.hasOriginalTime ? "已识别时间与海拔数据" : "支持轨迹、路线与航点数据"}</small></span><span className="upload-plus">＋</span></button>
        <div className="elevation-card"><span>海拔剖面</span><svg viewBox="0 0 240 60" preserveAspectRatio="none"><path d={elevationPath} /><line x1={240 * progress} x2={240 * progress} y1="6" y2="57" className="elevation-cursor" /></svg><small>{Math.round(elevationBounds.min)} M — {Math.round(elevationBounds.max)} M</small></div>
        {isDragging && <div className="drop-overlay"><strong>DROP GPX</strong><span>释放文件，生成轨迹动画</span></div>}
        {isRecording && <div className="recording-badge"><i /> REC · 动画结束后自动保存</div>}
        {error && <div className="error-toast" role="alert"><span>操作未完成</span>{error}<button onClick={() => setError("")}>×</button></div>}
      </section>
      <footer className="control-deck">
        <button className="play-button" type="button" onClick={togglePlayback}>{isPlaying ? "Ⅱ" : "▶"}</button>
        <div className="timeline-block"><div className="timeline-copy"><span>{formatDuration(elapsedSeconds).slice(3)}</span><span>RUN {Math.round(progress * 100)}%</span><span>{formatDuration(track.durationSeconds).slice(3)}</span></div><input className="timeline-range" type="range" min="0" max="1000" value={Math.round(progress * 1000)} onChange={(event) => setProgress(Number(event.target.value) / 1000)} style={{ "--progress": `${progress * 100}%` } as CSSProperties} /></div>
        <div className="speed-control"><span>PLAYBACK</span>{[0.5, 1, 2, 4].map((speed) => <button key={speed} className={playbackSpeed === speed ? "active" : ""} type="button" onClick={() => setPlaybackSpeed(speed)}>{speed}×</button>)}</div>
        <button className={`record-button${isRecording ? " active" : ""}`} type="button" onClick={() => void (isRecording ? stopRecording() : startRecording())}>{isRecording ? "停止并保存" : "录制视频"}<span>{isRecording ? "■" : "●"}</span></button>
        <button className="expand-button" type="button" onClick={() => void toggleFullscreen()}>全屏 <span>↗</span></button>
      </footer>
    </main>
  );
}
