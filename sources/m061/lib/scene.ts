import earcut from "earcut";
import polygonClipping from "polygon-clipping";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { AsciiFbxExporter } from "./exporters/AsciiFbxExporter";
import { bboxDimensions, lngLatToLocal, pointInPolygon } from "./geo";
import {
  classifyFeature,
  getBuildingHeight,
  getRailWidth,
  getRoadWidth,
  getWaterwayWidth,
  isLandmark,
} from "./osm";
import { sampleTerrain } from "./raster";
import type {
  AreaSelection,
  BuildBundle,
  GeoFeature,
  LngLat,
  SceneStyle,
  TerrainGrid,
  FeatureRange,
} from "./types";

export interface SceneBuildResult {
  root: THREE.Group;
  ground: THREE.Mesh;
  layers: Record<string, THREE.Group>;
  objectCount: number;
  triangleCount: number;
}

const LAYER_Y_OFFSETS: Record<string, number> = {
  green: 0.14,
  water: 0.2,
  road: 0.34,
  rail: 0.5,
  building: 0.1,
};

const groundTextures = new WeakMap<THREE.Mesh, THREE.Texture>();

function asRings(coordinates: unknown): LngLat[][][] {
  if (!Array.isArray(coordinates)) return [];
  const level1 = coordinates as unknown[];
  if (!level1.length) return [];
  if (typeof (level1[0] as unknown[])?.[0] === "number") return [[coordinates as LngLat[]]];
  const level2 = level1[0] as unknown[];
  if (Array.isArray(level2) && typeof (level2[0] as unknown[])?.[0] === "number") return [coordinates as LngLat[][]];
  return coordinates as LngLat[][][];
}

function asLines(coordinates: unknown): LngLat[][] {
  if (!Array.isArray(coordinates)) return [];
  const level1 = coordinates as unknown[];
  if (!level1.length) return [];
  if (typeof (level1[0] as unknown[])?.[0] === "number") return [coordinates as LngLat[]];
  return coordinates as LngLat[][];
}

function clipPolygonToSelection(polygon: LngLat[][], selection: AreaSelection) {
  try {
    return polygonClipping.intersection(
      polygon as Parameters<typeof polygonClipping.intersection>[0],
      [selection.polygon] as Parameters<typeof polygonClipping.intersection>[1],
    ) as unknown as LngLat[][][];
  } catch {
    return [];
  }
}

function segmentIntersectionT(a: LngLat, b: LngLat, c: LngLat, d: LngLat) {
  const abX = b[0] - a[0];
  const abY = b[1] - a[1];
  const cdX = d[0] - c[0];
  const cdY = d[1] - c[1];
  const denominator = abX * cdY - abY * cdX;
  if (Math.abs(denominator) < 1e-14) return null;
  const acX = c[0] - a[0];
  const acY = c[1] - a[1];
  const t = (acX * cdY - acY * cdX) / denominator;
  const u = (acX * abY - acY * abX) / denominator;
  return t >= -1e-10 && t <= 1 + 1e-10 && u >= -1e-10 && u <= 1 + 1e-10 ? Math.max(0, Math.min(1, t)) : null;
}

function interpolatePoint(a: LngLat, b: LngLat, t: number): LngLat {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function samePoint(a: LngLat, b: LngLat) {
  return Math.abs(a[0] - b[0]) < 1e-10 && Math.abs(a[1] - b[1]) < 1e-10;
}

function clipLineToSelection(line: LngLat[], selection: AreaSelection) {
  const output: LngLat[][] = [];
  let current: LngLat[] | null = null;
  const boundary = selection.polygon;
  for (let index = 0; index < line.length - 1; index += 1) {
    const a = line[index];
    const b = line[index + 1];
    const values = [0, 1];
    for (let edge = 0; edge < boundary.length - 1; edge += 1) {
      const t = segmentIntersectionT(a, b, boundary[edge], boundary[edge + 1]);
      if (t != null) values.push(t);
    }
    values.sort((left, right) => left - right);
    const unique = values.filter((value, valueIndex) => valueIndex === 0 || Math.abs(value - values[valueIndex - 1]) > 1e-9);
    for (let interval = 0; interval < unique.length - 1; interval += 1) {
      const startT = unique[interval];
      const endT = unique[interval + 1];
      if (endT - startT < 1e-10) continue;
      const midpoint = interpolatePoint(a, b, (startT + endT) / 2);
      if (!pointInPolygon(midpoint, boundary)) {
        current = null;
        continue;
      }
      const start = interpolatePoint(a, b, startT);
      const end = interpolatePoint(a, b, endT);
      if (!current || !samePoint(current[current.length - 1], start)) {
        current = [start, end];
        output.push(current);
      } else {
        current.push(end);
      }
    }
  }
  return output.filter((entry) => entry.length >= 2);
}

function material(color: string, opacity: number, roughness = 0.82) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
    transparent: opacity < 0.999,
    opacity,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
}

function featureName(feature: GeoFeature, fallback: string) {
  return String(feature.properties.name || feature.properties["name:en"] || `${fallback}_${feature.id ?? "feature"}`);
}

function terrainY(terrain: TerrainGrid, point: LngLat, exaggeration: number) {
  return (sampleTerrain(terrain, point[0], point[1]) - terrain.datum) * exaggeration;
}

function buildGround(bundle: BuildBundle, texture?: THREE.Texture) {
  const { selection, terrain, style } = bundle;
  const { width, depth } = bboxDimensions(selection.bbox);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const [west, south, east, north] = selection.bbox;
  for (let row = 0; row < terrain.height; row += 1) {
    const v = row / (terrain.height - 1);
    for (let column = 0; column < terrain.width; column += 1) {
      const u = column / (terrain.width - 1);
      const elevation = terrain.values[row * terrain.width + column] ?? terrain.datum;
      positions.push(-width / 2 + u * width, (elevation - terrain.datum) * style.verticalExaggeration, -depth / 2 + v * depth);
      uvs.push(u, 1 - v);
    }
  }
  for (let row = 0; row < terrain.height - 1; row += 1) {
    for (let column = 0; column < terrain.width - 1; column += 1) {
      const midpoint: LngLat = [
        west + ((column + 0.5) / (terrain.width - 1)) * (east - west),
        north - ((row + 0.5) / (terrain.height - 1)) * (north - south),
      ];
      if (!pointInPolygon(midpoint, selection.polygon)) continue;
      const a = row * terrain.width + column;
      const b = a + 1;
      const c = a + terrain.width;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: texture ? "#ffffff" : "#dedbd2",
    map: texture,
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = true;
    texture.anisotropy = 8;
  }
  const mesh = new THREE.Mesh(geometry, groundMaterial);
  mesh.name = "Terrain_Imagery_Ground";
  mesh.receiveShadow = true;
  mesh.userData.exportTexture = Boolean(texture);
  if (texture) groundTextures.set(mesh, texture);
  return mesh;
}

function buildExtrudedPolygon(
  feature: GeoFeature,
  polygon: LngLat[][],
  bundle: BuildBundle,
  height: number,
  minHeight: number,
  meshMaterial: THREE.Material,
) {
  const { selection, terrain, style } = bundle;
  if (!polygon.length || polygon[0].length < 3) return null;
  const flattened: number[] = [];
  const holes: number[] = [];
  const rings: Array<{ points: LngLat[]; offset: number }> = [];
  let vertexOffset = 0;

  polygon.forEach((ring, ringIndex) => {
    const cleanRing = ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;
    if (cleanRing.length < 3) return;
    if (ringIndex > 0) holes.push(vertexOffset);
    rings.push({ points: cleanRing, offset: vertexOffset });
    cleanRing.forEach((point) => {
      const local = lngLatToLocal(point, selection.center);
      flattened.push(local.x, local.z);
    });
    vertexOffset += cleanRing.length;
  });
  if (flattened.length < 6) return null;
  const triangles = earcut(flattened, holes, 2);
  if (!triangles.length) return null;

  const vertexCount = flattened.length / 2;
  const coordinates: LngLat[] = rings.flatMap((ring) => ring.points);
  const positions: number[] = [];
  const uvs: number[] = [];
  const allY: number[] = [];
  const bbox = selection.bbox;
  const rangeLng = bbox[2] - bbox[0] || 1;
  const rangeLat = bbox[3] - bbox[1] || 1;

  for (let index = 0; index < vertexCount; index += 1) {
    const point = coordinates[index];
    const baseY = terrainY(terrain, point, style.verticalExaggeration);
    allY.push(baseY);
    positions.push(flattened[index * 2], baseY + minHeight, flattened[index * 2 + 1]);
    uvs.push((point[0] - bbox[0]) / rangeLng, (point[1] - bbox[1]) / rangeLat);
  }
  for (let index = 0; index < vertexCount; index += 1) {
    positions.push(flattened[index * 2], allY[index] + Math.max(height, minHeight + 0.5), flattened[index * 2 + 1]);
    uvs.push(uvs[index * 2], uvs[index * 2 + 1]);
  }

  const indices: number[] = [];
  for (let index = 0; index < triangles.length; index += 3) {
    indices.push(triangles[index + 2], triangles[index + 1], triangles[index]);
    indices.push(triangles[index] + vertexCount, triangles[index + 1] + vertexCount, triangles[index + 2] + vertexCount);
  }
  for (const ring of rings) {
    for (let index = 0; index < ring.points.length; index += 1) {
      const a = ring.offset + index;
      const b = ring.offset + ((index + 1) % ring.points.length);
      indices.push(a, b, b + vertexCount, a, b + vertexCount, a + vertexCount);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.name = featureName(feature, "Building");
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { osmId: feature.id, isLandmark: isLandmark(feature), ...feature.properties };
  return mesh;
}

function buildFlatPolygon(feature: GeoFeature, polygon: LngLat[][], bundle: BuildBundle, meshMaterial: THREE.Material, kind: string) {
  return buildExtrudedPolygon(feature, polygon, bundle, 0.06, LAYER_Y_OFFSETS[kind] || 0.1, meshMaterial);
}

function buildLine(feature: GeoFeature, line: LngLat[], bundle: BuildBundle, width: number, meshMaterial: THREE.Material, kind: string) {
  if (line.length < 2) return null;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let distance = 0;
  const offsetY = LAYER_Y_OFFSETS[kind] || 0.3;

  for (let index = 0; index < line.length; index += 1) {
    const current = lngLatToLocal(line[index], bundle.selection.center);
    const previous = lngLatToLocal(line[Math.max(0, index - 1)], bundle.selection.center);
    const next = lngLatToLocal(line[Math.min(line.length - 1, index + 1)], bundle.selection.center);
    const dx = next.x - previous.x;
    const dz = next.z - previous.z;
    const length = Math.hypot(dx, dz) || 1;
    const nx = -dz / length;
    const nz = dx / length;
    const y = terrainY(bundle.terrain, line[index], bundle.style.verticalExaggeration) + offsetY;
    positions.push(current.x + nx * width / 2, y, current.z + nz * width / 2);
    positions.push(current.x - nx * width / 2, y, current.z - nz * width / 2);
    if (index > 0) {
      distance += Math.hypot(current.x - previous.x, current.z - previous.z);
    }
    uvs.push(0, distance / Math.max(1, width), 1, distance / Math.max(1, width));
    if (index < line.length - 1) {
      const base = index * 2;
      indices.push(base, base + 2, base + 1, base + 2, base + 3, base + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.name = featureName(feature, kind);
  mesh.receiveShadow = true;
  mesh.userData = { osmId: feature.id, ...feature.properties };
  return mesh;
}

function createTexture(dataUrl: string) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    new THREE.TextureLoader().load(dataUrl, resolve, undefined, reject);
  });
}

function consolidateLayer(group: THREE.Group) {
  const buckets = new Map<string, THREE.Mesh[]>();
  for (const child of [...group.children]) {
    if (!(child instanceof THREE.Mesh)) continue;
    const entry = Array.isArray(child.material) ? child.material[0] : child.material;
    const bucket = buckets.get(entry.uuid) || [];
    bucket.push(child);
    buckets.set(entry.uuid, bucket);
  }
  if (!buckets.size) return 0;
  group.clear();
  let mergedCount = 0;
  for (const meshes of buckets.values()) {
    const geometries: THREE.BufferGeometry[] = [];
    const ranges: FeatureRange[] = [];
    let faceOffset = 0;
    for (const mesh of meshes) {
      mesh.updateMatrix();
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrix);
      geometries.push(geometry);
      const faceCount = geometry.index ? geometry.index.count / 3 : geometry.getAttribute("position").count / 3;
      ranges.push({
        startFace: faceOffset,
        endFace: faceOffset + faceCount,
        properties: { ...mesh.userData },
        featureId: mesh.userData.osmId,
      });
      faceOffset += faceCount;
    }
    const geometry = mergeGeometries(geometries, false);
    geometries.forEach((entry) => entry.dispose());
    meshes.forEach((mesh) => mesh.geometry.dispose());
    if (!geometry) continue;
    const merged = new THREE.Mesh(geometry, meshes[0].material);
    merged.name = `${group.name}_${mergedCount + 1}`;
    merged.castShadow = group.name === "Buildings";
    merged.receiveShadow = true;
    merged.userData.isLandmark = Boolean(meshes[0].userData.isLandmark);
    Object.defineProperty(merged.userData, "featureRanges", { value: ranges, enumerable: false });
    group.add(merged);
    mergedCount += 1;
  }
  return mergedCount;
}

export async function buildScene(bundle: BuildBundle): Promise<SceneBuildResult> {
  const root = new THREE.Group();
  root.name = "GeoScene";
  root.userData = {
    originLongitude: bundle.selection.center[0],
    originLatitude: bundle.selection.center[1],
    horizontalUnit: "meter",
    source: "OpenStreetMap",
    generatedAt: bundle.generatedAt,
  };
  const layers: Record<string, THREE.Group> = {
    building: new THREE.Group(),
    road: new THREE.Group(),
    water: new THREE.Group(),
    green: new THREE.Group(),
    rail: new THREE.Group(),
  };
  for (const [name, group] of Object.entries(layers)) {
    group.name = `${name[0].toUpperCase()}${name.slice(1)}s`;
    root.add(group);
  }

  let texture: THREE.Texture | undefined;
  if (bundle.imagery?.dataUrl && bundle.style.showImagery) {
    texture = await createTexture(bundle.imagery.dataUrl);
  }
  const ground = buildGround(bundle, texture);
  root.add(ground);

  const materials = {
    building: material(bundle.style.buildingColor, bundle.style.semanticOpacity),
    landmark: material(bundle.style.landmarkColor, bundle.style.semanticOpacity, 0.7),
    road: material(bundle.style.roadColor, Math.min(1, bundle.style.semanticOpacity * 0.94), 0.96),
    water: material(bundle.style.waterColor, Math.min(0.92, bundle.style.semanticOpacity), 0.55),
    green: material(bundle.style.greenColor, Math.min(0.88, bundle.style.semanticOpacity), 0.98),
    rail: material(bundle.style.railColor, bundle.style.semanticOpacity, 0.72),
  };

  let triangleCount = ground.geometry.index ? ground.geometry.index.count / 3 : ground.geometry.getAttribute("position").count / 3;
  let objectCount = 1;

  for (const feature of bundle.geojson.features) {
    if (!feature.geometry) continue;
    const kind = classifyFeature(feature);
    if (kind === "other") continue;
    const enabled = kind === "building" ? bundle.style.showBuildings :
      kind === "road" ? bundle.style.showRoads :
      kind === "water" ? bundle.style.showWater :
      kind === "green" ? bundle.style.showGreen : bundle.style.showRail;
    if (!enabled) continue;

    const geometryType = feature.geometry.type;
    if (geometryType.includes("Polygon")) {
      const polygons = asRings(feature.geometry.coordinates).flatMap((polygon) => clipPolygonToSelection(polygon, bundle.selection));
      for (const polygon of polygons) {
        let mesh: THREE.Mesh | null = null;
        if (kind === "building") {
          const height = getBuildingHeight(feature, bundle.style);
          mesh = buildExtrudedPolygon(
            feature,
            polygon,
            bundle,
            height.height,
            height.minHeight,
            bundle.style.highlightLandmarks && isLandmark(feature) ? materials.landmark : materials.building,
          );
        } else {
          mesh = buildFlatPolygon(feature, polygon, bundle, materials[kind], kind);
        }
        if (mesh) {
          layers[kind].add(mesh);
          objectCount += 1;
          triangleCount += mesh.geometry.index ? mesh.geometry.index.count / 3 : mesh.geometry.getAttribute("position").count / 3;
        }
      }
    } else if (geometryType.includes("LineString")) {
      const lines = asLines(feature.geometry.coordinates).flatMap((line) => clipLineToSelection(line, bundle.selection));
      for (const line of lines) {
        const width = kind === "road" ? getRoadWidth(feature) : kind === "rail" ? getRailWidth(feature) : getWaterwayWidth(feature);
        const mesh = buildLine(feature, line, bundle, width, materials[kind === "green" ? "green" : kind], kind);
        if (mesh) {
          layers[kind].add(mesh);
          objectCount += 1;
          triangleCount += mesh.geometry.index ? mesh.geometry.index.count / 3 : mesh.geometry.getAttribute("position").count / 3;
        }
      }
    }
  }

  const drawMeshCount = Object.values(layers).reduce((sum, group) => sum + consolidateLayer(group), 0);

  return { root, ground, layers, objectCount: Math.max(objectCount, drawMeshCount + 1), triangleCount: Math.round(triangleCount) };
}

export function disposeScene(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((entry) => {
      const mat = entry as THREE.MeshStandardMaterial;
      mat.map?.dispose();
      mat.dispose();
    });
  });
}

export async function exportGlb(root: THREE.Object3D, includeTextures = true) {
  const exporter = new GLTFExporter();
  const removedMaps: Array<{ material: THREE.MeshStandardMaterial; map: THREE.Texture }> = [];
  if (!includeTextures) {
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.userData.exportTexture) return;
      const entry = child.material as THREE.MeshStandardMaterial;
      if (entry.map) {
        removedMaps.push({ material: entry, map: entry.map });
        entry.map = null;
        entry.needsUpdate = true;
      }
    });
  }
  try {
    const result = await exporter.parseAsync(root, {
      binary: true,
      onlyVisible: true,
      truncateDrawRange: true,
      maxTextureSize: 4096,
    });
    return new Blob([result as ArrayBuffer], { type: "model/gltf-binary" });
  } finally {
    for (const { material: entry, map } of removedMaps) {
      entry.map = map;
      entry.needsUpdate = true;
    }
  }
}

export function exportFbx(root: THREE.Object3D, textureFile?: string) {
  const exporter = new AsciiFbxExporter();
  return new Blob([exporter.parse(root, { textureFile })], { type: "application/octet-stream" });
}

export function applyStyleToScene(result: SceneBuildResult, style: SceneStyle) {
  result.layers.building.visible = style.showBuildings;
  result.layers.road.visible = style.showRoads;
  result.layers.water.visible = style.showWater;
  result.layers.green.visible = style.showGreen;
  result.layers.rail.visible = style.showRail;
  const groundMaterial = result.ground.material as THREE.MeshStandardMaterial;
  groundMaterial.map = style.showImagery ? groundTextures.get(result.ground) || groundMaterial.map : null;
  groundMaterial.opacity = style.imageryOpacity;
  groundMaterial.transparent = style.imageryOpacity < 0.999;
  groundMaterial.needsUpdate = true;
  const colors: Record<string, string> = {
    road: style.roadColor,
    water: style.waterColor,
    green: style.greenColor,
    rail: style.railColor,
  };
  result.layers.building.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const entry = child.material as THREE.MeshStandardMaterial;
    entry.color.set(child.userData.isLandmark && style.highlightLandmarks ? style.landmarkColor : style.buildingColor);
    entry.opacity = style.semanticOpacity;
    entry.transparent = style.semanticOpacity < 0.999;
    entry.needsUpdate = true;
  });
  for (const kind of ["road", "water", "green", "rail"]) {
    result.layers[kind].traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const entry = child.material as THREE.MeshStandardMaterial;
      entry.color.set(colors[kind]);
      entry.opacity = style.semanticOpacity;
      entry.transparent = style.semanticOpacity < 0.999;
      entry.needsUpdate = true;
    });
  }
}
