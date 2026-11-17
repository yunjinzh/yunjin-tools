import osmtogeojson from "osmtogeojson";
import type {
  AreaSelection,
  GeoFeature,
  GeoFeatureCollection,
  LayerKind,
  LayerStats,
  SceneStyle,
} from "./types";
import { clamp, wrapLongitude } from "./geo";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter",
];

const INCLUDED_TAGS = [
  "building",
  "building:part",
  "highway",
  "railway",
  "waterway",
  "natural",
  "landuse",
  "leisure",
  "amenity",
  "place",
  "aeroway",
  "tourism",
  "historic",
  "man_made",
];

function overpassNumber(value: number) {
  const normalized = Math.abs(value) < 5e-8 ? 0 : value;
  return normalized.toFixed(7).replace(/\.?0+$/, "");
}

export function buildOverpassBboxes(selection: AreaSelection) {
  let [west, south, east, north] = selection.bbox;
  if (![west, south, east, north].every(Number.isFinite) || west > east || south > north) {
    throw new Error("选区边界无效，请清除后重新框选");
  }

  south = clamp(south, -90, 90);
  north = clamp(north, -90, 90);
  const center = (west + east) / 2;
  const shift = center - wrapLongitude(center);
  west -= shift;
  east -= shift;

  const segment = (segmentWest: number, segmentEast: number) =>
    `${overpassNumber(south)},${overpassNumber(segmentWest)},${overpassNumber(north)},${overpassNumber(segmentEast)}`;

  if (west < -180) {
    return [segment(west + 360, 180), segment(-180, east)];
  }
  if (east > 180) {
    return [segment(west, 180), segment(-180, east - 360)];
  }
  return [segment(west, east)];
}

export function buildOverpassQuery(selection: AreaSelection) {
  const bboxes = buildOverpassBboxes(selection);
  const blocks = bboxes.map((bbox, index) => {
    const filters = INCLUDED_TAGS.map((tag) => `nwr["${tag}"](${bbox});`).join("\n    ");
    return `  (
    ${filters}
  )->.selection${index};
  .selection${index} out body geom(${bbox});`;
  });
  return `[out:json][timeout:90];
${blocks.join("\n")}`;
}

export function resolveOverpassEndpoints(configured: string) {
  if (configured && configured !== "auto") return [configured];
  return OVERPASS_ENDPOINTS;
}

function unwrapLongitude(value: number, reference: number) {
  let result = value;
  while (result - reference > 180) result -= 360;
  while (result - reference < -180) result += 360;
  return result;
}

function unwrapCoordinates(value: unknown, reference: number): unknown {
  if (!Array.isArray(value)) return value;
  if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
    return [unwrapLongitude(value[0], reference), value[1], ...value.slice(2)];
  }
  return value.map((item) => unwrapCoordinates(item, reference));
}

export function normalizeGeoJsonLongitudes(collection: GeoFeatureCollection, reference: number) {
  for (const feature of collection.features) {
    if (feature.geometry) {
      feature.geometry.coordinates = unwrapCoordinates(feature.geometry.coordinates, reference);
    }
  }
  return collection;
}

export async function fetchOsmData(selection: AreaSelection, endpoint = "auto") {
  const query = buildOverpassQuery(selection);
  const errors: string[] = [];

  for (const candidate of resolveOverpassEndpoints(endpoint)) {
    try {
      let data: unknown;
      let resolvedEndpoint = candidate;
      try {
        const response = await fetch("/api/osm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: candidate, query }),
          signal: AbortSignal.timeout(30_000),
        });
        const payload = (await response.json()) as { data?: unknown; error?: string; endpoint?: string };
        if (!response.ok || !payload.data) {
          throw Object.assign(new Error(payload.error || `HTTP ${response.status}`), { status: response.status });
        }
        data = payload.data;
        resolvedEndpoint = payload.endpoint || candidate;
      } catch (proxyError) {
        const proxyStatus = (proxyError as Error & { status?: number }).status;
        if (proxyStatus && proxyStatus < 500) throw proxyError;
        const directResponse = await fetch(candidate, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: new URLSearchParams({ data: query }),
          signal: AbortSignal.timeout(95_000),
        });
        if (!directResponse.ok) {
          throw new Error(`${proxyError instanceof Error ? proxyError.message : String(proxyError)}；浏览器直连返回 HTTP ${directResponse.status}`);
        }
        data = await directResponse.json();
      }

      const converted = osmtogeojson(data as Parameters<typeof osmtogeojson>[0], {
        flatProperties: true,
        uninterestingTags: () => false,
      }) as GeoFeatureCollection;
      normalizeGeoJsonLongitudes(converted, selection.center[0]);

      return {
        geojson: converted,
        endpoint: resolvedEndpoint,
        query,
      };
    } catch (error) {
      errors.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`OSM 数据获取失败。${errors.join("；")}`);
}

function value(tags: Record<string, unknown>, key: string) {
  const raw = tags[key];
  return raw == null ? "" : String(raw).toLowerCase();
}

export function classifyFeature(feature: GeoFeature): LayerKind {
  const tags = feature.properties || {};
  if (tags.building || tags["building:part"]) return "building";
  if (tags.highway || tags.aeroway === "runway" || tags.aeroway === "taxiway") return "road";
  if (tags.railway) return "rail";

  const natural = value(tags, "natural");
  const landuse = value(tags, "landuse");
  const leisure = value(tags, "leisure");
  const amenity = value(tags, "amenity");

  if (
    tags.waterway ||
    natural === "water" ||
    landuse === "reservoir" ||
    landuse === "basin" ||
    leisure === "swimming_pool"
  ) {
    return "water";
  }

  if (
    ["wood", "grassland", "scrub", "heath", "tree_row"].includes(natural) ||
    ["forest", "grass", "meadow", "orchard", "vineyard", "allotments", "recreation_ground"].includes(landuse) ||
    ["park", "garden", "golf_course", "pitch", "nature_reserve", "playground"].includes(leisure) ||
    amenity === "grave_yard"
  ) {
    return "green";
  }

  return "other";
}

export function isLandmark(feature: GeoFeature) {
  const tags = feature.properties || {};
  const building = value(tags, "building");
  const tourism = value(tags, "tourism");
  const historic = value(tags, "historic");
  const amenity = value(tags, "amenity");
  const manMade = value(tags, "man_made");
  return Boolean(
    tags.name &&
      (["cathedral", "church", "mosque", "temple", "stadium", "civic", "government", "university"].includes(building) ||
        tourism === "attraction" ||
        historic ||
        ["townhall", "place_of_worship", "arts_centre"].includes(amenity) ||
        ["tower", "lighthouse"].includes(manMade)),
  );
}

function parseMeters(raw: unknown) {
  if (typeof raw === "number") return raw;
  if (!raw) return Number.NaN;
  const text = String(raw).trim().toLowerCase().replace(",", ".");
  const feetInches = text.match(/^(\d+)\s*'\s*(\d+)?/);
  if (feetInches) {
    return Number(feetInches[1]) * 0.3048 + Number(feetInches[2] || 0) * 0.0254;
  }
  const number = Number.parseFloat(text);
  if (!Number.isFinite(number)) return Number.NaN;
  return text.includes("ft") || text.includes("feet") ? number * 0.3048 : number;
}

export function getBuildingHeight(feature: GeoFeature, style: SceneStyle) {
  const tags = feature.properties || {};
  const explicitHeight = parseMeters(tags.height ?? tags["building:height"]);
  const minHeight = parseMeters(tags.min_height);
  const levels = Number.parseFloat(String(tags["building:levels"] ?? ""));
  const roofLevels = Number.parseFloat(String(tags["roof:levels"] ?? "0"));
  const building = value(tags, "building");

  let height: number;
  let source: "height" | "levels" | "fallback";
  if (Number.isFinite(explicitHeight) && explicitHeight > 0) {
    height = explicitHeight;
    source = "height";
  } else if (Number.isFinite(levels) && levels > 0) {
    height = levels * style.defaultFloorHeight + (Number.isFinite(roofLevels) ? roofLevels * 1.8 : 0);
    source = "levels";
  } else {
    const defaults: Record<string, number> = {
      garage: 3.2,
      garages: 3.2,
      shed: 3.5,
      hut: 3.5,
      greenhouse: 3.2,
      industrial: 9,
      warehouse: 9,
      retail: 6.8,
      commercial: 10,
      office: 13,
      school: 12,
      university: 14,
      hospital: 18,
      civic: 13,
      church: 18,
      cathedral: 28,
      mosque: 22,
      temple: 16,
      stadium: 16,
      tower: 34,
    };
    height = defaults[building] ?? style.defaultBuildingLevels * style.defaultFloorHeight;
    source = "fallback";
  }

  return {
    height: Math.max(2, Math.min(height, 500)),
    minHeight: Number.isFinite(minHeight) ? Math.max(0, minHeight) : 0,
    source,
  };
}

export function getRoadWidth(feature: GeoFeature) {
  const tags = feature.properties || {};
  const explicitWidth = parseMeters(tags.width);
  if (Number.isFinite(explicitWidth) && explicitWidth > 0) return explicitWidth;
  const lanes = Number.parseFloat(String(tags.lanes ?? ""));
  if (Number.isFinite(lanes) && lanes > 0) return Math.max(2.8, lanes * 3.15);
  const highway = value(tags, "highway");
  const widths: Record<string, number> = {
    motorway: 13,
    motorway_link: 7,
    trunk: 11,
    trunk_link: 7,
    primary: 10,
    primary_link: 6,
    secondary: 8,
    secondary_link: 5.5,
    tertiary: 7,
    tertiary_link: 5,
    residential: 5.8,
    living_street: 5,
    service: 3.6,
    unclassified: 5,
    pedestrian: 4,
    footway: 1.8,
    cycleway: 2,
    path: 1.4,
    track: 2.8,
    steps: 1.8,
  };
  return widths[highway] ?? 4;
}

export function getWaterwayWidth(feature: GeoFeature) {
  const tags = feature.properties || {};
  const explicitWidth = parseMeters(tags.width);
  if (Number.isFinite(explicitWidth) && explicitWidth > 0) return explicitWidth;
  const waterway = value(tags, "waterway");
  return waterway === "river" ? 14 : waterway === "canal" ? 8 : waterway === "stream" ? 3 : 5;
}

export function getRailWidth(feature: GeoFeature) {
  const railway = value(feature.properties || {}, "railway");
  return railway === "rail" ? 3 : railway === "tram" ? 2.2 : railway === "subway" ? 2.4 : 1.8;
}

export function calculateLayerStats(geojson: GeoFeatureCollection, style: SceneStyle): LayerStats {
  const stats: LayerStats = {
    buildings: 0,
    roads: 0,
    water: 0,
    green: 0,
    rail: 0,
    other: 0,
    missingHeight: 0,
  };

  for (const feature of geojson.features) {
    const kind = classifyFeature(feature);
    if (kind === "building") {
      stats.buildings += 1;
      if (getBuildingHeight(feature, style).source === "fallback") stats.missingHeight += 1;
    } else if (kind === "road") stats.roads += 1;
    else if (kind === "water") stats.water += 1;
    else if (kind === "green") stats.green += 1;
    else if (kind === "rail") stats.rail += 1;
    else stats.other += 1;
  }
  return stats;
}
