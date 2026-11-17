export type Bounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type LonLat = [number, number];

export type SelectionShape = {
  type: "rectangle" | "circle";
  bounds: Bounds;
  polygon: LonLat[];
  areaKm2: number;
  center?: LonLat;
  radiusMeters?: number;
};

export type LayerKey = "buildings" | "roads" | "water" | "green" | "rail";

export type SceneFeature = {
  id: string;
  osmId: number;
  source: "way" | "relation";
  layer: LayerKey;
  geometry: "polygon" | "line";
  coordinates: LonLat[][];
  tags: Record<string, string>;
};

export type PbfHeader = {
  bounds: Bounds | null;
  requiredFeatures: string[];
  optionalFeatures: string[];
  writingProgram?: string;
  source?: string;
  timestamp?: number;
};

export type LayerCounts = Record<LayerKey, number>;

export type ParseStats = {
  nodesRead: number;
  nodesKept: number;
  waysRead: number;
  relationsRead: number;
  layers: LayerCounts;
  elapsedMs: number;
  truncated: boolean;
};

export type ParseResult = {
  features: SceneFeature[];
  stats: ParseStats;
  selection: SelectionShape;
};

export type SceneSettings = {
  heightScale: number;
  defaultLevels: number;
  terrainEnabled: boolean;
  imageryEnabled: boolean;
};

export type TerrainSummary = {
  terrainUsed: boolean;
  imageryUsed: boolean;
  minElevation: number;
  maxElevation: number;
  warning?: string;
};

export type WorkerRequest =
  | { action: "inspect"; requestId: string; file: File }
  | { action: "parse"; requestId: string; file: File; selection: SelectionShape };

export type WorkerResponse =
  | { type: "header"; requestId: string; header: PbfHeader }
  | { type: "progress"; requestId: string; progress: number; stage: string }
  | { type: "result"; requestId: string; result: ParseResult }
  | { type: "error"; requestId: string; error: string };
