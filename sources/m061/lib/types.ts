export type LngLat = [number, number];

export type BBox = [west: number, south: number, east: number, north: number];

export type SelectionKind = "rectangle" | "circle";

export interface AreaSelection {
  kind: SelectionKind;
  polygon: LngLat[];
  bbox: BBox;
  center: LngLat;
  areaM2: number;
  radiusM?: number;
}

export type ImageryKind = "xyz" | "wms";

export interface ImageryProvider {
  kind: ImageryKind;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  layers?: string;
  format?: string;
  tileSize?: number;
  exportConfirmed: boolean;
}

export interface TerrainProvider {
  name: string;
  url: string;
  attribution: string;
  zoom: number;
  gridSize: number;
}

export interface DataSourceSettings {
  overpassEndpoint: string;
  imagery: ImageryProvider;
  terrain: TerrainProvider;
}

export interface SceneStyle {
  imageryOpacity: number;
  semanticOpacity: number;
  verticalExaggeration: number;
  defaultFloorHeight: number;
  defaultBuildingLevels: number;
  buildingColor: string;
  landmarkColor: string;
  roadColor: string;
  waterColor: string;
  greenColor: string;
  railColor: string;
  showImagery: boolean;
  showBuildings: boolean;
  showRoads: boolean;
  showWater: boolean;
  showGreen: boolean;
  showRail: boolean;
  highlightLandmarks: boolean;
}

export interface TerrainGrid {
  bbox: BBox;
  width: number;
  height: number;
  values: number[];
  min: number;
  max: number;
  datum: number;
  source: string;
  attribution: string;
}

export interface ImageryTexture {
  dataUrl: string;
  mimeType: string;
  blob: Blob;
  width: number;
  height: number;
  source: string;
  attribution: string;
  zoom?: number;
}

export interface GeoFeature {
  type: "Feature";
  id?: string | number;
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  } | null;
}

export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

export interface LayerStats {
  buildings: number;
  roads: number;
  water: number;
  green: number;
  rail: number;
  other: number;
  missingHeight: number;
}

export interface BuildBundle {
  selection: AreaSelection;
  geojson: GeoFeatureCollection;
  terrain: TerrainGrid;
  imagery: ImageryTexture | null;
  sources: DataSourceSettings;
  style: SceneStyle;
  stats: LayerStats;
  generatedAt: string;
}

export type LayerKind = "building" | "road" | "water" | "green" | "rail" | "other";

export interface FeatureRange {
  startFace: number;
  endFace: number;
  properties: Record<string, unknown>;
  featureId?: string | number;
}

export const DEFAULT_SOURCES: DataSourceSettings = {
  overpassEndpoint: "auto",
  imagery: {
    kind: "xyz",
    name: "Esri World Imagery（预览）",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 18,
    tileSize: 256,
    exportConfirmed: false,
  },
  terrain: {
    name: "Mapzen Terrarium / AWS Open Data",
    url: "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
    attribution: "Elevation data: Mapzen / AWS Open Data",
    zoom: 12,
    gridSize: 65,
  },
};

export const DEFAULT_STYLE: SceneStyle = {
  imageryOpacity: 0.82,
  semanticOpacity: 0.92,
  verticalExaggeration: 1.35,
  defaultFloorHeight: 3.2,
  defaultBuildingLevels: 3,
  buildingColor: "#cdbb91",
  landmarkColor: "#b64d39",
  roadColor: "#f4f2eb",
  waterColor: "#9ecbd7",
  greenColor: "#62a875",
  railColor: "#b59d6a",
  showImagery: true,
  showBuildings: true,
  showRoads: true,
  showWater: true,
  showGreen: true,
  showRail: true,
  highlightLandmarks: true,
};
