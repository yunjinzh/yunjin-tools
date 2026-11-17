import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import { createProjector } from "./geo";
import { loadTerrain } from "./terrain";
import type { LonLat, ParseResult, SceneFeature, SceneSettings, TerrainSummary } from "./types";

export type BuiltScene = {
  root: THREE.Group;
  terrain: TerrainSummary;
  objectCounts: Record<string, number>;
};

export type SceneBuildProgress = (progress: number, stage: string) => void;

const COLORS = {
  terrain: 0xd9d7cf,
  road: 0xe7e6e0,
  roadMajor: 0xcfcfd0,
  rail: 0x596068,
  water: 0x72a8bd,
  green: 0x7aa17b,
  greenDark: 0x5f8569,
  residential: 0xcab58d,
  commercial: 0xbb8e67,
  industrial: 0x9f9584,
  civic: 0xb47b68,
  religious: 0xb0715f,
} as const;

function parseMeters(value?: string) {
  if (!value) return null;
  const first = value.split(";")[0].trim().toLowerCase();
  const number = Number.parseFloat(first.replace(",", "."));
  if (!Number.isFinite(number)) return null;
  if (first.includes("ft") || first.includes("feet") || first.includes("'")) return number * 0.3048;
  return number;
}

function buildingHeight(tags: Record<string, string>, settings: SceneSettings) {
  const explicit = parseMeters(tags.height);
  if (explicit && explicit > 0) return Math.min(500, explicit) * settings.heightScale;
  const levels = Number.parseFloat(tags["building:levels"] || "");
  if (Number.isFinite(levels) && levels > 0) return Math.min(120, levels) * 3.15 * settings.heightScale;
  const defaults: Record<string, number> = {
    house: 2, detached: 2, residential: 4, apartments: 6, dormitory: 5,
    commercial: 5, retail: 3, office: 6, hotel: 7,
    industrial: 2, warehouse: 2, school: 3, university: 4,
    hospital: 5, church: 4, cathedral: 6, mosque: 4, temple: 3,
  };
  return (defaults[tags.building] || settings.defaultLevels) * 3.15 * settings.heightScale;
}

function buildingColor(tags: Record<string, string>) {
  const type = `${tags.building || ""} ${tags.amenity || ""} ${tags.office || ""}`;
  if (/church|cathedral|mosque|temple|shrine|place_of_worship/.test(type)) return COLORS.religious;
  if (/school|university|hospital|clinic|civic|public|government/.test(type)) return COLORS.civic;
  if (/industrial|warehouse|factory|manufacture/.test(type)) return COLORS.industrial;
  if (/commercial|retail|office|hotel|supermarket/.test(type)) return COLORS.commercial;
  return COLORS.residential;
}

function roadWidth(tags: Record<string, string>) {
  const explicit = parseMeters(tags.width);
  if (explicit && explicit > 0) return Math.min(40, explicit);
  const widths: Record<string, number> = {
    motorway: 14, motorway_link: 7, trunk: 12, trunk_link: 7,
    primary: 10, primary_link: 6, secondary: 8, secondary_link: 6,
    tertiary: 7, tertiary_link: 5, residential: 5.5, living_street: 4.5,
    unclassified: 5, service: 3.5, pedestrian: 4, footway: 1.8,
    cycleway: 1.8, path: 1.2, steps: 1.5, track: 2.8,
  };
  const laneCount = Number.parseFloat(tags.lanes || "");
  const byLanes = Number.isFinite(laneCount) ? laneCount * 3.2 : 0;
  return Math.max(widths[tags.highway] || 3, byLanes);
}

function averagePoint(ring: LonLat[]) {
  let lon = 0;
  let lat = 0;
  for (const point of ring) {
    lon += point[0];
    lat += point[1];
  }
  return [lon / ring.length, lat / ring.length] as LonLat;
}

function cleanRing(ring: LonLat[]) {
  const result: LonLat[] = [];
  for (const point of ring) {
    const last = result[result.length - 1];
    if (!last || last[0] !== point[0] || last[1] !== point[1]) result.push(point);
  }
  if (result.length > 2) {
    const first = result[0];
    const last = result[result.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) result.pop();
  }
  return result;
}

function polygonGeometry(
  feature: SceneFeature,
  project: (point: LonLat) => [number, number],
  baseHeight: number,
  extrusion: number,
) {
  const outer = cleanRing(feature.coordinates[0]);
  if (outer.length < 3) return null;
  const points = outer.map((point) => {
    const [x, north] = project(point);
    return new THREE.Vector2(x, north);
  });
  const shape = new THREE.Shape(points);
  for (const holeRing of feature.coordinates.slice(1)) {
    const hole = cleanRing(holeRing);
    if (hole.length < 3) continue;
    shape.holes.push(new THREE.Path(hole.map((point) => {
      const [x, north] = project(point);
      return new THREE.Vector2(x, north);
    })));
  }
  const geometry = extrusion > 0
    ? new THREE.ExtrudeGeometry(shape, { depth: extrusion, bevelEnabled: false, curveSegments: 1 })
    : new THREE.ShapeGeometry(shape, 1);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, baseHeight, 0);
  geometry.computeVertexNormals();
  return geometry;
}

function ribbonGeometry(
  feature: SceneFeature,
  project: (point: LonLat) => [number, number],
  sampleHeight: (point: LonLat) => number,
  width: number,
  yOffset: number,
) {
  const line = feature.coordinates[0];
  if (line.length < 2) return null;
  const positions: number[] = [];
  const indices: number[] = [];
  const half = width / 2;
  for (let i = 0; i < line.length; i += 1) {
    const current = project(line[i]);
    const previous = project(line[Math.max(0, i - 1)]);
    const next = project(line[Math.min(line.length - 1, i + 1)]);
    const dx = next[0] - previous[0];
    const dz = next[1] - previous[1];
    const length = Math.hypot(dx, dz) || 1;
    const nx = -dz / length * half;
    const nz = dx / length * half;
    const y = sampleHeight(line[i]) + yOffset;
    positions.push(current[0] + nx, y, -(current[1] + nz));
    positions.push(current[0] - nx, y, -(current[1] - nz));
    if (i < line.length - 1) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function mergedMesh(name: string, geometries: THREE.BufferGeometry[], material: THREE.Material) {
  if (!geometries.length) return null;
  const chunks: THREE.BufferGeometry[] = [];
  const chunkSize = 1500;
  for (let i = 0; i < geometries.length; i += chunkSize) {
    const merged = mergeGeometries(geometries.slice(i, i + chunkSize), false);
    if (merged) chunks.push(merged);
  }
  const group = new THREE.Group();
  group.name = name;
  chunks.forEach((geometry, index) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = chunks.length > 1 ? `${name}-${index + 1}` : name;
    mesh.castShadow = name.includes("building");
    mesh.receiveShadow = true;
    mesh.userData.geoPbfLayer = name;
    group.add(mesh);
  });
  return group;
}

function transformTerrainGeometry(geometry: THREE.BufferGeometry, project: (point: LonLat) => [number, number], minElevation: number) {
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < positions.count; i += 1) {
    const lon = positions.getX(i);
    const elevation = positions.getY(i);
    const lat = positions.getZ(i);
    const [x, north] = project([lon, lat]);
    positions.setXYZ(i, x, elevation - minElevation, -north);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}

export async function buildScene(
  parsed: ParseResult,
  settings: SceneSettings,
  onProgress: SceneBuildProgress,
): Promise<BuiltScene> {
  onProgress(0.03, settings.terrainEnabled ? "下载选区高程数据" : "创建场景底面");
  const projector = createProjector(parsed.selection.bounds);
  const terrainData = await loadTerrain(parsed.selection, settings.terrainEnabled, settings.imageryEnabled);
  const baseElevation = terrainData.minElevation;
  const sampleHeight = (point: LonLat) => terrainData.sampleElevation(point) - baseElevation;
  transformTerrainGeometry(terrainData.geometry, projector.project, baseElevation);

  const root = new THREE.Group();
  root.name = "GeoPBF_Scene";
  root.userData = {
    generator: "GeoPBF 三维场景生成器",
    center: projector.center,
    bounds: parsed.selection.bounds,
    areaKm2: parsed.selection.areaKm2,
    osmAttribution: "© OpenStreetMap contributors, ODbL 1.0",
  };

  const terrainMaterial = new THREE.MeshStandardMaterial({
    color: terrainData.texture ? 0xffffff : COLORS.terrain,
    map: terrainData.texture,
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const terrainMesh = new THREE.Mesh(terrainData.geometry, terrainMaterial);
  terrainMesh.name = "terrain";
  terrainMesh.receiveShadow = true;
  terrainMesh.userData.geoPbfLayer = "terrain";
  const terrainGroup = new THREE.Group();
  terrainGroup.name = "layer-terrain";
  terrainGroup.add(terrainMesh);
  root.add(terrainGroup);

  const buildingBuckets = new Map<number, THREE.BufferGeometry[]>();
  const roadsMajor: THREE.BufferGeometry[] = [];
  const roadsMinor: THREE.BufferGeometry[] = [];
  const rail: THREE.BufferGeometry[] = [];
  const water: THREE.BufferGeometry[] = [];
  const green: THREE.BufferGeometry[] = [];
  const greenDark: THREE.BufferGeometry[] = [];
  const total = parsed.features.length || 1;

  for (let index = 0; index < parsed.features.length; index += 1) {
    const feature = parsed.features[index];
    try {
      if (feature.geometry === "polygon") {
        const centroid = averagePoint(feature.coordinates[0]);
        const base = sampleHeight(centroid) + 0.25;
        if (feature.layer === "buildings") {
          const color = buildingColor(feature.tags);
          const geometry = polygonGeometry(feature, projector.project, base, buildingHeight(feature.tags, settings));
          if (geometry) {
            if (!buildingBuckets.has(color)) buildingBuckets.set(color, []);
            buildingBuckets.get(color)?.push(geometry);
          }
        } else {
          const geometry = polygonGeometry(feature, projector.project, base + (feature.layer === "water" ? 0.08 : 0.12), 0);
          if (geometry && feature.layer === "water") water.push(geometry);
          else if (geometry && feature.layer === "green") {
            if (["forest", "wood"].includes(feature.tags.landuse) || feature.tags.natural === "wood") greenDark.push(geometry);
            else green.push(geometry);
          }
        }
      } else {
        if (feature.layer === "roads") {
          const major = ["motorway", "trunk", "primary", "secondary"].includes(feature.tags.highway);
          const geometry = ribbonGeometry(feature, projector.project, sampleHeight, roadWidth(feature.tags), 0.45);
          if (geometry) (major ? roadsMajor : roadsMinor).push(geometry);
        } else if (feature.layer === "rail") {
          const geometry = ribbonGeometry(feature, projector.project, sampleHeight, 2.2, 0.62);
          if (geometry) rail.push(geometry);
        } else if (feature.layer === "water") {
          const width = Math.max(1.5, parseMeters(feature.tags.width) || (feature.tags.waterway === "river" ? 12 : 4));
          const geometry = ribbonGeometry(feature, projector.project, sampleHeight, width, 0.28);
          if (geometry) water.push(geometry);
        }
      }
    } catch {
      // Invalid or self-intersecting OSM rings are skipped without aborting the scene.
    }
    if (index % 500 === 0) {
      onProgress(0.22 + (index / total) * 0.62, `生成三维网格 ${index.toLocaleString()} / ${total.toLocaleString()}`);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  onProgress(0.88, "合并材质与几何批次");
  const buildingGroup = new THREE.Group();
  buildingGroup.name = "layer-buildings";
  for (const [color, geometries] of buildingBuckets) {
    const group = mergedMesh(`buildings-${color.toString(16)}`, geometries, new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.02 }));
    if (group) buildingGroup.add(group);
  }
  root.add(buildingGroup);

  const roadGroup = new THREE.Group();
  roadGroup.name = "layer-roads";
  const majorMesh = mergedMesh("roads-major", roadsMajor, new THREE.MeshStandardMaterial({ color: COLORS.roadMajor, roughness: 0.93, side: THREE.DoubleSide }));
  const minorMesh = mergedMesh("roads-minor", roadsMinor, new THREE.MeshStandardMaterial({ color: COLORS.road, roughness: 0.96, side: THREE.DoubleSide }));
  if (majorMesh) roadGroup.add(majorMesh);
  if (minorMesh) roadGroup.add(minorMesh);
  root.add(roadGroup);

  const waterGroup = mergedMesh("layer-water", water, new THREE.MeshStandardMaterial({ color: COLORS.water, roughness: 0.4, metalness: 0.05, transparent: true, opacity: 0.92, side: THREE.DoubleSide }));
  if (waterGroup) root.add(waterGroup);
  const greenGroup = new THREE.Group();
  greenGroup.name = "layer-green";
  const lightGreen = mergedMesh("green-open", green, new THREE.MeshStandardMaterial({ color: COLORS.green, roughness: 1, side: THREE.DoubleSide }));
  const darkGreen = mergedMesh("green-wood", greenDark, new THREE.MeshStandardMaterial({ color: COLORS.greenDark, roughness: 1, side: THREE.DoubleSide }));
  if (lightGreen) greenGroup.add(lightGreen);
  if (darkGreen) greenGroup.add(darkGreen);
  root.add(greenGroup);
  const railGroup = mergedMesh("layer-rail", rail, new THREE.MeshStandardMaterial({ color: COLORS.rail, roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide }));
  if (railGroup) root.add(railGroup);

  root.updateMatrixWorld(true);
  onProgress(1, "场景生成完成");
  return {
    root,
    terrain: {
      terrainUsed: terrainData.terrainUsed,
      imageryUsed: terrainData.imageryUsed,
      minElevation: terrainData.minElevation,
      maxElevation: terrainData.maxElevation,
      warning: terrainData.warning,
    },
    objectCounts: {
      buildings: buildingBuckets.size ? Array.from(buildingBuckets.values()).reduce((sum, list) => sum + list.length, 0) : 0,
      roads: roadsMajor.length + roadsMinor.length,
      water: water.length,
      green: green.length + greenDark.length,
      rail: rail.length,
    },
  };
}
