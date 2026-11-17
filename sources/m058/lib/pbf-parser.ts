import { PbfReader } from "pbf";

import type {
  Bounds,
  LayerCounts,
  LayerKey,
  LonLat,
  ParseResult,
  PbfHeader,
  SceneFeature,
  SelectionShape,
} from "./types";

type BlobHeader = { type: string; dataSize: number };
type BlobPayload = { raw?: Uint8Array; zlib?: Uint8Array; unsupported?: string };
type PrimitiveBlock = {
  strings: string[];
  groups: Uint8Array[];
  granularity: number;
  latOffset: number;
  lonOffset: number;
};
type WayRecord = { id: number; refs: number[]; tags: Record<string, string> };
type RelationRecord = {
  id: number;
  tags: Record<string, string>;
  roles: number[];
  memberIds: number[];
  memberTypes: number[];
  strings: string[];
};

const MAX_HEADER_SIZE = 64 * 1024;
const MAX_BLOB_SIZE = 32 * 1024 * 1024;
const MAX_FEATURES = 150_000;
const textDecoder = new TextDecoder();

export type ParserProgress = (progress: number, stage: string) => void;

function readBlobHeader(bytes: Uint8Array): BlobHeader {
  const result: BlobHeader = { type: "", dataSize: 0 };
  new PbfReader(bytes).readFields((tag, value, pbf) => {
    if (tag === 1) value.type = pbf.readString();
    else if (tag === 3) value.dataSize = pbf.readVarint();
  }, result);
  return result;
}

function readBlob(bytes: Uint8Array): BlobPayload {
  const result: BlobPayload = {};
  new PbfReader(bytes).readFields((tag, value, pbf) => {
    if (tag === 1) value.raw = pbf.readBytes();
    else if (tag === 3) value.zlib = pbf.readBytes();
    else if (tag === 4) value.unsupported = "LZMA";
    else if (tag === 5) value.unsupported = "BZIP2";
    else if (tag === 6) value.unsupported = "LZ4";
    else if (tag === 7) value.unsupported = "ZSTD";
  }, result);
  return result;
}

async function inflate(payload: BlobPayload): Promise<Uint8Array> {
  if (payload.raw) return payload.raw;
  if (payload.zlib) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("当前浏览器不支持 PBF 的 zlib 解压，请使用最新版 Chrome、Edge 或 Firefox。");
    }
    const input = new Blob([payload.zlib.slice().buffer]).stream();
    const output = input.pipeThrough(new DecompressionStream("deflate"));
    return new Uint8Array(await new Response(output).arrayBuffer());
  }
  throw new Error(payload.unsupported ? `暂不支持 ${payload.unsupported} 压缩的 PBF 数据块。` : "PBF 数据块没有可读取的内容。");
}

async function readBlock(file: File, offset: number) {
  if (offset + 4 > file.size) return null;
  const sizeBytes = await file.slice(offset, offset + 4).arrayBuffer();
  const headerSize = new DataView(sizeBytes).getUint32(0, false);
  if (headerSize <= 0 || headerSize > MAX_HEADER_SIZE) throw new Error("PBF 文件头长度异常，文件可能已损坏。");
  const headerStart = offset + 4;
  const blobStart = headerStart + headerSize;
  const headerBytes = new Uint8Array(await file.slice(headerStart, blobStart).arrayBuffer());
  const header = readBlobHeader(headerBytes);
  if (!header.type || header.dataSize <= 0 || header.dataSize > MAX_BLOB_SIZE) throw new Error("PBF 数据块长度异常，文件可能已损坏。");
  const end = blobStart + header.dataSize;
  if (end > file.size) throw new Error("PBF 文件末尾不完整，可能是下载未完成。");
  const blobBytes = new Uint8Array(await file.slice(blobStart, end).arrayBuffer());
  const data = await inflate(readBlob(blobBytes));
  return { type: header.type, data, nextOffset: end };
}

function readHeaderBlock(bytes: Uint8Array): PbfHeader {
  const result: PbfHeader = { bounds: null, requiredFeatures: [], optionalFeatures: [] };
  new PbfReader(bytes).readFields((tag, value, pbf) => {
    if (tag === 1) {
      const bbox: Partial<Bounds> = {};
      pbf.readMessage((field, target, reader) => {
        if (field === 1) target.west = reader.readSVarint() / 1e9;
        else if (field === 2) target.east = reader.readSVarint() / 1e9;
        else if (field === 3) target.north = reader.readSVarint() / 1e9;
        else if (field === 4) target.south = reader.readSVarint() / 1e9;
      }, bbox);
      if ([bbox.west, bbox.south, bbox.east, bbox.north].every(Number.isFinite)) value.bounds = bbox as Bounds;
    } else if (tag === 4) value.requiredFeatures.push(pbf.readString());
    else if (tag === 5) value.optionalFeatures.push(pbf.readString());
    else if (tag === 16) value.writingProgram = pbf.readString();
    else if (tag === 17) value.source = pbf.readString();
    else if (tag === 32) value.timestamp = pbf.readVarint();
  }, result);
  return result;
}

export async function inspectPbf(file: File): Promise<PbfHeader> {
  if (!file.name.toLowerCase().endsWith(".osm.pbf") && !file.name.toLowerCase().endsWith(".pbf")) {
    throw new Error("请选择 .osm.pbf 或 .pbf 文件。");
  }
  const block = await readBlock(file, 0);
  if (!block || block.type !== "OSMHeader") throw new Error("未找到 OSMHeader，这不是有效的 OSM PBF 文件。");
  const header = readHeaderBlock(block.data);
  const supported = new Set(["OsmSchema-V0.6", "DenseNodes"]);
  const unknown = header.requiredFeatures.filter((item) => !supported.has(item));
  if (unknown.length) throw new Error(`PBF 使用了暂不支持的必需特性：${unknown.join("、")}`);
  if (!header.bounds) throw new Error("PBF 文件头不含边界框，当前版本无法在解析前定位地图范围。");
  return header;
}

function decodeStringTable(bytes: Uint8Array) {
  const strings: string[] = [];
  new PbfReader(bytes).readFields((tag, target, pbf) => {
    if (tag === 1) target.push(textDecoder.decode(pbf.readBytes()));
  }, strings);
  return strings;
}

function readPrimitiveBlock(bytes: Uint8Array): PrimitiveBlock {
  const raw = { stringBytes: null as Uint8Array | null, groups: [] as Uint8Array[], granularity: 100, latOffset: 0, lonOffset: 0 };
  new PbfReader(bytes).readFields((tag, value, pbf) => {
    if (tag === 1) value.stringBytes = pbf.readBytes();
    else if (tag === 2) value.groups.push(pbf.readBytes());
    else if (tag === 17) value.granularity = pbf.readVarint();
    else if (tag === 19) value.latOffset = pbf.readVarint(true);
    else if (tag === 20) value.lonOffset = pbf.readVarint(true);
  }, raw);
  return {
    strings: raw.stringBytes ? decodeStringTable(raw.stringBytes) : [""],
    groups: raw.groups,
    granularity: raw.granularity,
    latOffset: raw.latOffset,
    lonOffset: raw.lonOffset,
  };
}

function expandedBounds(selection: SelectionShape): Bounds {
  const latPad = Math.max((selection.bounds.north - selection.bounds.south) * 0.12, 0.003);
  const lonPad = Math.max((selection.bounds.east - selection.bounds.west) * 0.12, 0.003);
  return {
    west: selection.bounds.west - lonPad,
    south: selection.bounds.south - latPad,
    east: selection.bounds.east + lonPad,
    north: selection.bounds.north + latPad,
  };
}

function inBounds(lon: number, lat: number, bounds: Bounds) {
  return lon >= bounds.west && lon <= bounds.east && lat >= bounds.south && lat <= bounds.north;
}

function haversineMeters(a: LonLat, b: LonLat) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const lat1 = a[1] * rad;
  const lat2 = b[1] * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12_742_000 * Math.asin(Math.sqrt(h));
}

function pointInSelection(point: LonLat, selection: SelectionShape) {
  if (!inBounds(point[0], point[1], selection.bounds)) return false;
  if (selection.type === "rectangle") return true;
  return Boolean(selection.center && selection.radiusMeters && haversineMeters(point, selection.center) <= selection.radiusMeters);
}

function pointInRing(point: LonLat, ring: LonLat[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi || 1e-12) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function geometryTouchesSelection(rings: LonLat[][], selection: SelectionShape) {
  if (rings.some((ring) => ring.some((point) => pointInSelection(point, selection)))) return true;
  const center: LonLat = [(selection.bounds.west + selection.bounds.east) / 2, (selection.bounds.south + selection.bounds.north) / 2];
  return rings.length > 0 && pointInRing(center, rings[0]);
}

function readTags(keys: number[], vals: number[], strings: string[]) {
  const tags: Record<string, string> = {};
  for (let i = 0; i < Math.min(keys.length, vals.length); i += 1) {
    const key = strings[keys[i]];
    if (key) tags[key] = strings[vals[i]] ?? "";
  }
  return tags;
}

function classify(tags: Record<string, string>, closed: boolean): LayerKey | null {
  if ((tags.building && tags.building !== "no") || (tags["building:part"] && tags["building:part"] !== "no")) return closed ? "buildings" : null;
  if (tags.highway && !["proposed", "abandoned"].includes(tags.highway)) return "roads";
  if (tags.railway && !["proposed", "abandoned", "razed"].includes(tags.railway)) return "rail";
  if (
    tags.natural === "water" || tags.water || tags.waterway ||
    ["reservoir", "basin", "salt_pond"].includes(tags.landuse) || tags.leisure === "swimming_pool"
  ) return "water";
  if (
    ["park", "garden", "pitch", "golf_course", "nature_reserve", "playground"].includes(tags.leisure) ||
    ["forest", "grass", "meadow", "recreation_ground", "cemetery", "allotments", "village_green", "orchard", "vineyard"].includes(tags.landuse) ||
    ["wood", "grassland", "scrub", "heath", "wetland"].includes(tags.natural)
  ) return closed ? "green" : null;
  return null;
}

function readDenseNodes(
  bytes: Uint8Array,
  block: PrimitiveBlock,
  nodes: Map<number, LonLat>,
  bounds: Bounds,
  counters: { nodesRead: number; nodesKept: number },
) {
  const data = { ids: [] as number[], lats: [] as number[], lons: [] as number[] };
  new PbfReader(bytes).readFields((tag, value, pbf) => {
    if (tag === 1) pbf.readPackedSVarint(value.ids);
    else if (tag === 8) pbf.readPackedSVarint(value.lats);
    else if (tag === 9) pbf.readPackedSVarint(value.lons);
  }, data);
  let id = 0;
  let latValue = 0;
  let lonValue = 0;
  const length = Math.min(data.ids.length, data.lats.length, data.lons.length);
  for (let i = 0; i < length; i += 1) {
    id += data.ids[i];
    latValue += data.lats[i];
    lonValue += data.lons[i];
    counters.nodesRead += 1;
    const lat = 1e-9 * (block.latOffset + block.granularity * latValue);
    const lon = 1e-9 * (block.lonOffset + block.granularity * lonValue);
    if (inBounds(lon, lat, bounds)) {
      nodes.set(id, [lon, lat]);
      counters.nodesKept += 1;
    }
  }
}

function readNode(
  bytes: Uint8Array,
  block: PrimitiveBlock,
  nodes: Map<number, LonLat>,
  bounds: Bounds,
  counters: { nodesRead: number; nodesKept: number },
) {
  const data = { id: 0, lat: 0, lon: 0 };
  new PbfReader(bytes).readFields((tag, value, pbf) => {
    if (tag === 1) value.id = pbf.readSVarint();
    else if (tag === 8) value.lat = pbf.readSVarint();
    else if (tag === 9) value.lon = pbf.readSVarint();
  }, data);
  counters.nodesRead += 1;
  const lat = 1e-9 * (block.latOffset + block.granularity * data.lat);
  const lon = 1e-9 * (block.lonOffset + block.granularity * data.lon);
  if (inBounds(lon, lat, bounds)) {
    nodes.set(data.id, [lon, lat]);
    counters.nodesKept += 1;
  }
}

function readWay(bytes: Uint8Array, strings: string[]) {
  const data = { id: 0, keys: [] as number[], vals: [] as number[], refs: [] as number[] };
  new PbfReader(bytes).readFields((tag, value, pbf) => {
    if (tag === 1) value.id = pbf.readVarint();
    else if (tag === 2) pbf.readPackedVarint(value.keys);
    else if (tag === 3) pbf.readPackedVarint(value.vals);
    else if (tag === 8) pbf.readPackedSVarint(value.refs);
  }, data);
  let ref = 0;
  data.refs = data.refs.map((delta) => (ref += delta));
  return { id: data.id, refs: data.refs, tags: readTags(data.keys, data.vals, strings) } satisfies WayRecord;
}

function readRelation(bytes: Uint8Array, strings: string[]) {
  const data = { id: 0, keys: [] as number[], vals: [] as number[], roles: [] as number[], memberIds: [] as number[], memberTypes: [] as number[] };
  new PbfReader(bytes).readFields((tag, value, pbf) => {
    if (tag === 1) value.id = pbf.readVarint();
    else if (tag === 2) pbf.readPackedVarint(value.keys);
    else if (tag === 3) pbf.readPackedVarint(value.vals);
    else if (tag === 8) pbf.readPackedVarint(value.roles);
    else if (tag === 9) pbf.readPackedSVarint(value.memberIds);
    else if (tag === 10) pbf.readPackedVarint(value.memberTypes);
  }, data);
  let memberId = 0;
  data.memberIds = data.memberIds.map((delta) => (memberId += delta));
  return { id: data.id, tags: readTags(data.keys, data.vals, strings), roles: data.roles, memberIds: data.memberIds, memberTypes: data.memberTypes, strings } satisfies RelationRecord;
}

function splitKnownSegments(refs: number[], nodes: Map<number, LonLat>) {
  const segments: LonLat[][] = [];
  let current: LonLat[] = [];
  for (const ref of refs) {
    const point = nodes.get(ref);
    if (point) current.push(point);
    else {
      if (current.length >= 2) segments.push(current);
      current = [];
    }
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}

function createWayFeatures(way: WayRecord, nodes: Map<number, LonLat>, selection: SelectionShape): SceneFeature[] {
  const closed = way.refs.length >= 4 && way.refs[0] === way.refs[way.refs.length - 1];
  const layer = classify(way.tags, closed);
  if (!layer) return [];
  const areaLayer = ["buildings", "water", "green"].includes(layer);
  if (closed && areaLayer && way.refs.every((ref) => nodes.has(ref))) {
    const ring = way.refs.map((ref) => nodes.get(ref) as LonLat);
    if (!geometryTouchesSelection([ring], selection)) return [];
    return [{ id: `way/${way.id}`, osmId: way.id, source: "way", layer, geometry: "polygon", coordinates: [ring], tags: way.tags }];
  }
  if (!["roads", "rail", "water"].includes(layer)) return [];
  return splitKnownSegments(way.refs, nodes)
    .filter((segment) => segment.some((point) => pointInSelection(point, selection)))
    .map((segment, index) => ({ id: `way/${way.id}/${index}`, osmId: way.id, source: "way" as const, layer, geometry: "line" as const, coordinates: [segment], tags: way.tags }));
}

function assembleRings(parts: number[][]) {
  const pending = parts.filter((part) => part.length >= 2).map((part) => [...part]);
  const rings: number[][] = [];
  while (pending.length) {
    const chain = pending.shift() as number[];
    let changed = true;
    while (chain[0] !== chain[chain.length - 1] && changed) {
      changed = false;
      for (let i = 0; i < pending.length; i += 1) {
        const part = pending[i];
        const start = chain[0];
        const end = chain[chain.length - 1];
        if (part[0] === end) chain.push(...part.slice(1));
        else if (part[part.length - 1] === end) chain.push(...[...part].reverse().slice(1));
        else if (part[part.length - 1] === start) chain.unshift(...part.slice(0, -1));
        else if (part[0] === start) chain.unshift(...[...part].reverse().slice(0, -1));
        else continue;
        pending.splice(i, 1);
        changed = true;
        break;
      }
    }
    if (chain.length >= 4 && chain[0] === chain[chain.length - 1]) rings.push(chain);
  }
  return rings;
}

function createRelationFeatures(
  relation: RelationRecord,
  ways: Map<number, WayRecord>,
  nodes: Map<number, LonLat>,
  selection: SelectionShape,
) {
  if (relation.tags.type !== "multipolygon" && relation.tags.type !== "boundary") return { features: [] as SceneFeature[], consumed: new Set<number>() };
  const layer = classify(relation.tags, true);
  if (!layer || ["roads", "rail"].includes(layer)) return { features: [] as SceneFeature[], consumed: new Set<number>() };
  const outerParts: number[][] = [];
  const innerParts: number[][] = [];
  const consumed = new Set<number>();
  for (let i = 0; i < relation.memberIds.length; i += 1) {
    if (relation.memberTypes[i] !== 1) continue;
    const way = ways.get(relation.memberIds[i]);
    if (!way) continue;
    const role = relation.strings[relation.roles[i]] || "outer";
    if (role === "inner") innerParts.push(way.refs);
    else outerParts.push(way.refs);
    consumed.add(way.id);
  }
  const outers = assembleRings(outerParts).filter((refs) => refs.every((ref) => nodes.has(ref))).map((refs) => refs.map((ref) => nodes.get(ref) as LonLat));
  const inners = assembleRings(innerParts).filter((refs) => refs.every((ref) => nodes.has(ref))).map((refs) => refs.map((ref) => nodes.get(ref) as LonLat));
  const features: SceneFeature[] = [];
  for (let i = 0; i < outers.length; i += 1) {
    const outer = outers[i];
    const holes = inners.filter((ring) => ring[0] && pointInRing(ring[0], outer));
    const rings = [outer, ...holes];
    if (!geometryTouchesSelection(rings, selection)) continue;
    features.push({ id: `relation/${relation.id}/${i}`, osmId: relation.id, source: "relation", layer, geometry: "polygon", coordinates: rings, tags: relation.tags });
  }
  return { features, consumed };
}

export async function parsePbf(file: File, selection: SelectionShape, onProgress: ParserProgress): Promise<ParseResult> {
  const started = performance.now();
  const header = await inspectPbf(file);
  if (!header.bounds) throw new Error("PBF 缺少有效边界框。");
  const scanBounds = expandedBounds(selection);
  const nodes = new Map<number, LonLat>();
  const ways = new Map<number, WayRecord>();
  const relationRecords: RelationRecord[] = [];
  const counters = { nodesRead: 0, nodesKept: 0, waysRead: 0, relationsRead: 0 };
  let offset = 0;
  let blocks = 0;
  onProgress(0.01, "检查 PBF 文件头");
  while (offset < file.size) {
    const block = await readBlock(file, offset);
    if (!block) break;
    offset = block.nextOffset;
    blocks += 1;
    if (block.type === "OSMData") {
      const primitive = readPrimitiveBlock(block.data);
      for (const groupBytes of primitive.groups) {
        new PbfReader(groupBytes).readFields((tag, _target, pbf) => {
          if (tag === 1) readNode(pbf.readBytes(), primitive, nodes, scanBounds, counters);
          else if (tag === 2) readDenseNodes(pbf.readBytes(), primitive, nodes, scanBounds, counters);
          else if (tag === 3) {
            counters.waysRead += 1;
            const way = readWay(pbf.readBytes(), primitive.strings);
            if (way.refs.some((ref) => nodes.has(ref))) ways.set(way.id, way);
          } else if (tag === 4) {
            counters.relationsRead += 1;
            const relation = readRelation(pbf.readBytes(), primitive.strings);
            if (["multipolygon", "boundary"].includes(relation.tags.type) && classify(relation.tags, true)) relationRecords.push(relation);
          }
        }, null);
      }
    }
    if (blocks % 3 === 0 || offset === file.size) {
      onProgress(Math.min(0.94, offset / file.size), counters.waysRead ? "解析道路、建筑与地表要素" : "扫描选区附近节点");
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  onProgress(0.96, "组装多面关系与场景图层");
  let features: SceneFeature[] = [];
  for (const way of ways.values()) {
    features.push(...createWayFeatures(way, nodes, selection));
    if (features.length >= MAX_FEATURES) break;
  }
  const consumed = new Set<number>();
  if (features.length < MAX_FEATURES) {
    for (const relation of relationRecords) {
      const built = createRelationFeatures(relation, ways, nodes, selection);
      built.consumed.forEach((id) => consumed.add(id));
      features.push(...built.features);
      if (features.length >= MAX_FEATURES) break;
    }
  }
  if (consumed.size) features = features.filter((feature) => feature.source !== "way" || !consumed.has(feature.osmId));
  const truncated = features.length >= MAX_FEATURES;
  features = features.slice(0, MAX_FEATURES);
  const layers: LayerCounts = { buildings: 0, roads: 0, water: 0, green: 0, rail: 0 };
  for (const feature of features) layers[feature.layer] += 1;
  onProgress(1, "解析完成");
  return {
    features,
    selection,
    stats: {
      ...counters,
      layers,
      elapsedMs: Math.round(performance.now() - started),
      truncated,
    },
  };
}
