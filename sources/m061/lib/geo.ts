import type { AreaSelection, BBox, LngLat } from "./types";

const METERS_PER_DEGREE = 111_319.49079327358;
const MAX_MERCATOR_LAT = 85.05112878;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function wrapLongitude(value: number) {
  if (!Number.isFinite(value)) return value;
  const wrapped = ((value + 180) % 360 + 360) % 360 - 180;
  return wrapped === -180 && value > 0 ? 180 : wrapped;
}

function normalizeWorldCopy(points: LngLat[]) {
  if (!points.length) return points;
  const rawBBox = computeBBox(points);
  const rawCenter = (rawBBox[0] + rawBBox[2]) / 2;
  const shift = rawCenter - wrapLongitude(rawCenter);
  if (Math.abs(shift) < 1e-9) return points;
  return points.map(([lng, lat]) => [lng - shift, lat] as LngLat);
}

export function computeBBox(points: LngLat[]): BBox {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const [lng, lat] of points) {
    west = Math.min(west, lng);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    north = Math.max(north, lat);
  }

  return [west, south, east, north];
}

export function bboxCenter([west, south, east, north]: BBox): LngLat {
  return [(west + east) / 2, (south + north) / 2];
}

export function lngLatToLocal(point: LngLat, origin: LngLat) {
  const cosLat = Math.cos((origin[1] * Math.PI) / 180);
  return {
    x: (point[0] - origin[0]) * METERS_PER_DEGREE * cosLat,
    z: -(point[1] - origin[1]) * METERS_PER_DEGREE,
  };
}

export function localToLngLat(x: number, z: number, origin: LngLat): LngLat {
  const cosLat = Math.cos((origin[1] * Math.PI) / 180);
  return [
    origin[0] + x / (METERS_PER_DEGREE * cosLat),
    origin[1] - z / METERS_PER_DEGREE,
  ];
}

export function polygonAreaM2(points: LngLat[]) {
  if (points.length < 3) return 0;
  const origin = bboxCenter(computeBBox(points));
  const projected = points.map((point) => lngLatToLocal(point, origin));
  let area = 0;
  for (let index = 0; index < projected.length; index += 1) {
    const current = projected[index];
    const next = projected[(index + 1) % projected.length];
    area += current.x * next.z - next.x * current.z;
  }
  return Math.abs(area) / 2;
}

export function closeRing(points: LngLat[]) {
  if (!points.length) return points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return points;
  return [...points, first];
}

export function createCirclePolygon(center: LngLat, radiusM: number, segments = 72) {
  const cosLat = Math.cos((center[1] * Math.PI) / 180);
  const points: LngLat[] = [];
  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const east = Math.cos(angle) * radiusM;
    const north = Math.sin(angle) * radiusM;
    points.push([
      center[0] + east / (METERS_PER_DEGREE * cosLat),
      center[1] + north / METERS_PER_DEGREE,
    ]);
  }
  return closeRing(points);
}

export function createSelection(
  kind: AreaSelection["kind"],
  polygon: LngLat[],
  radiusM?: number,
): AreaSelection {
  if (polygon.length < 3 || polygon.some(([lng, lat]) => !Number.isFinite(lng) || !Number.isFinite(lat))) {
    throw new Error("选区坐标无效，请重新框选");
  }
  const closed = closeRing(normalizeWorldCopy(polygon));
  const bbox = computeBBox(closed);
  return {
    kind,
    polygon: closed,
    bbox,
    center: bboxCenter(bbox),
    areaM2: polygonAreaM2(closed),
    radiusM,
  };
}

export function pointInPolygon(point: LngLat, polygon: LngLat[]) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-12) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function lonToTileX(lon: number, zoom: number) {
  return ((lon + 180) / 360) * 2 ** zoom;
}

export function latToTileY(lat: number, zoom: number) {
  const safeLat = clamp(lat, -MAX_MERCATOR_LAT, MAX_MERCATOR_LAT);
  const radians = (safeLat * Math.PI) / 180;
  return (
    (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) /
    2 *
    2 ** zoom
  );
}

export function tileXToLon(x: number, zoom: number) {
  return (x / 2 ** zoom) * 360 - 180;
}

export function tileYToLat(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export function tileUrl(template: string, z: number, x: number, y: number) {
  const normalizedX = ((x % 2 ** z) + 2 ** z) % 2 ** z;
  const subdomain = ["a", "b", "c"][(Math.abs(x + y) % 3)];
  return template
    .replaceAll("{z}", String(z))
    .replaceAll("{x}", String(normalizedX))
    .replaceAll("{y}", String(y))
    .replaceAll("{s}", subdomain);
}

export function formatArea(areaM2: number) {
  if (areaM2 >= 1_000_000) return `${(areaM2 / 1_000_000).toFixed(2)} km²`;
  return `${Math.round(areaM2).toLocaleString("zh-CN")} m²`;
}

export function formatCoordinate(value: number) {
  return value.toFixed(6);
}

export function bboxDimensions(bbox: BBox) {
  const center = bboxCenter(bbox);
  const west = lngLatToLocal([bbox[0], center[1]], center);
  const east = lngLatToLocal([bbox[2], center[1]], center);
  const south = lngLatToLocal([center[0], bbox[1]], center);
  const north = lngLatToLocal([center[0], bbox[3]], center);
  return {
    width: Math.abs(east.x - west.x),
    depth: Math.abs(north.z - south.z),
  };
}
