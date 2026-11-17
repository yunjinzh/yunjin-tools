import type { Bounds, LonLat, SelectionShape } from "./types";

const EARTH_RADIUS = 6_378_137;

export type Projector = {
  center: LonLat;
  bounds: Bounds;
  width: number;
  depth: number;
  project: (point: LonLat) => [number, number];
  unproject: (point: [number, number]) => LonLat;
};

export function createProjector(bounds: Bounds): Projector {
  const center: LonLat = [(bounds.west + bounds.east) / 2, (bounds.south + bounds.north) / 2];
  const cosLat = Math.cos((center[1] * Math.PI) / 180);
  const project = (point: LonLat): [number, number] => [
    ((point[0] - center[0]) * Math.PI / 180) * EARTH_RADIUS * cosLat,
    ((point[1] - center[1]) * Math.PI / 180) * EARTH_RADIUS,
  ];
  const unproject = (point: [number, number]): LonLat => [
    center[0] + (point[0] / (EARTH_RADIUS * cosLat)) * 180 / Math.PI,
    center[1] + (point[1] / EARTH_RADIUS) * 180 / Math.PI,
  ];
  const southwest = project([bounds.west, bounds.south]);
  const northeast = project([bounds.east, bounds.north]);
  return {
    center,
    bounds,
    width: northeast[0] - southwest[0],
    depth: northeast[1] - southwest[1],
    project,
    unproject,
  };
}

export function lonLatToTile(point: LonLat, zoom: number) {
  const scale = 2 ** zoom;
  const lat = Math.max(-85.05112878, Math.min(85.05112878, point[1]));
  return {
    x: ((point[0] + 180) / 360) * scale,
    y: ((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2) * scale,
  };
}

export function tileToLonLat(x: number, y: number, zoom: number): LonLat {
  const scale = 2 ** zoom;
  const lon = x / scale * 360 - 180;
  const n = Math.PI - 2 * Math.PI * y / scale;
  const lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lon, lat];
}

export function insideSelection(point: LonLat, selection: SelectionShape) {
  const { bounds } = selection;
  if (point[0] < bounds.west || point[0] > bounds.east || point[1] < bounds.south || point[1] > bounds.north) return false;
  if (selection.type === "rectangle") return true;
  if (!selection.center || !selection.radiusMeters) return false;
  const projector = createProjector(bounds);
  const p = projector.project(point);
  const c = projector.project(selection.center);
  return Math.hypot(p[0] - c[0], p[1] - c[1]) <= selection.radiusMeters;
}

export function chooseTileZoom(bounds: Bounds, targetTiles = 4, maxZoom = 14) {
  for (let zoom = maxZoom; zoom >= 8; zoom -= 1) {
    const northwest = lonLatToTile([bounds.west, bounds.north], zoom);
    const southeast = lonLatToTile([bounds.east, bounds.south], zoom);
    const columns = Math.floor(southeast.x) - Math.floor(northwest.x) + 1;
    const rows = Math.floor(southeast.y) - Math.floor(northwest.y) + 1;
    if (columns * rows <= targetTiles) return zoom;
  }
  return 8;
}
