import * as THREE from "three";

import { chooseTileZoom, insideSelection, lonLatToTile, tileToLonLat } from "./geo";
import type { LonLat, SelectionShape, TerrainSummary } from "./types";

export type TerrainData = TerrainSummary & {
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture | null;
  sampleElevation: (point: LonLat) => number;
};

type TileMosaic = {
  canvas: HTMLCanvasElement;
  zoom: number;
  minX: number;
  minY: number;
  columns: number;
  rows: number;
};

const TERRAIN_URL = (z: number, x: number, y: number) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
const IMAGERY_URL = (z: number, x: number, y: number) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

async function fetchTile(url: string) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`瓦片服务返回 ${response.status}`);
  return createImageBitmap(await response.blob());
}

async function createMosaic(selection: SelectionShape, urlForTile: (z: number, x: number, y: number) => string, maxZoom: number): Promise<TileMosaic> {
  const zoom = chooseTileZoom(selection.bounds, 9, maxZoom);
  const northwest = lonLatToTile([selection.bounds.west, selection.bounds.north], zoom);
  const southeast = lonLatToTile([selection.bounds.east, selection.bounds.south], zoom);
  const minX = Math.floor(northwest.x);
  const maxX = Math.floor(southeast.x);
  const minY = Math.floor(northwest.y);
  const maxY = Math.floor(southeast.y);
  const columns = maxX - minX + 1;
  const rows = maxY - minY + 1;
  const canvas = document.createElement("canvas");
  canvas.width = columns * 256;
  canvas.height = rows * 256;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("浏览器无法创建地图瓦片画布。");
  const tasks: Promise<void>[] = [];
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      tasks.push(fetchTile(urlForTile(zoom, x, y)).then((bitmap) => {
        context.drawImage(bitmap, (x - minX) * 256, (y - minY) * 256, 256, 256);
        bitmap.close();
      }));
    }
  }
  await Promise.all(tasks);
  return { canvas, zoom, minX, minY, columns, rows };
}

function sampleCanvas(mosaic: TileMosaic, point: LonLat) {
  const tile = lonLatToTile(point, mosaic.zoom);
  const x = Math.max(0, Math.min(mosaic.canvas.width - 1, Math.round((tile.x - mosaic.minX) * 256)));
  const y = Math.max(0, Math.min(mosaic.canvas.height - 1, Math.round((tile.y - mosaic.minY) * 256)));
  return [x, y] as const;
}

function cropMosaic(mosaic: TileMosaic, selection: SelectionShape, size = 1024) {
  const output = document.createElement("canvas");
  output.width = size;
  output.height = size;
  const context = output.getContext("2d");
  if (!context) throw new Error("浏览器无法生成影像纹理。");
  const topLeft = sampleCanvas(mosaic, [selection.bounds.west, selection.bounds.north]);
  const bottomRight = sampleCanvas(mosaic, [selection.bounds.east, selection.bounds.south]);
  const width = Math.max(1, bottomRight[0] - topLeft[0]);
  const height = Math.max(1, bottomRight[1] - topLeft[1]);
  context.drawImage(mosaic.canvas, topLeft[0], topLeft[1], width, height, 0, 0, size, size);
  if (selection.type === "circle") {
    context.globalCompositeOperation = "destination-in";
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    context.fill();
    context.globalCompositeOperation = "source-over";
  }
  return output;
}

export async function loadTerrain(selection: SelectionShape, terrainEnabled: boolean, imageryEnabled: boolean): Promise<TerrainData> {
  let terrainMosaic: TileMosaic | null = null;
  let imageryMosaic: TileMosaic | null = null;
  const warnings: string[] = [];
  if (terrainEnabled) {
    try { terrainMosaic = await createMosaic(selection, TERRAIN_URL, 13); }
    catch { warnings.push("高程服务不可用，已使用平面地形"); }
  }
  if (imageryEnabled) {
    try { imageryMosaic = await createMosaic(selection, IMAGERY_URL, 17); }
    catch { warnings.push("影像服务不可用，已使用纯色底面"); }
  }
  const terrainPixels = terrainMosaic?.canvas.getContext("2d", { willReadFrequently: true })?.getImageData(0, 0, terrainMosaic.canvas.width, terrainMosaic.canvas.height).data;
  const elevationAt = (point: LonLat) => {
    if (!terrainMosaic || !terrainPixels) return 0;
    const [x, y] = sampleCanvas(terrainMosaic, point);
    const index = (y * terrainMosaic.canvas.width + x) * 4;
    return terrainPixels[index] * 256 + terrainPixels[index + 1] + terrainPixels[index + 2] / 256 - 32768;
  };

  const grid = 64;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let minElevation = Number.POSITIVE_INFINITY;
  let maxElevation = Number.NEGATIVE_INFINITY;
  for (let row = 0; row <= grid; row += 1) {
    const v = row / grid;
    const lat = selection.bounds.south + (selection.bounds.north - selection.bounds.south) * v;
    for (let col = 0; col <= grid; col += 1) {
      const u = col / grid;
      const lon = selection.bounds.west + (selection.bounds.east - selection.bounds.west) * u;
      const elevation = elevationAt([lon, lat]);
      minElevation = Math.min(minElevation, elevation);
      maxElevation = Math.max(maxElevation, elevation);
      positions.push(lon, elevation, lat);
      uvs.push(u, v);
    }
  }
  for (let row = 0; row < grid; row += 1) {
    for (let col = 0; col < grid; col += 1) {
      const point: LonLat = [
        selection.bounds.west + (selection.bounds.east - selection.bounds.west) * ((col + 0.5) / grid),
        selection.bounds.south + (selection.bounds.north - selection.bounds.south) * ((row + 0.5) / grid),
      ];
      if (!insideSelection(point, selection)) continue;
      const a = row * (grid + 1) + col;
      const b = a + 1;
      const c = a + grid + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const texture = imageryMosaic ? new THREE.CanvasTexture(cropMosaic(imageryMosaic, selection)) : null;
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  if (!Number.isFinite(minElevation)) minElevation = 0;
  if (!Number.isFinite(maxElevation)) maxElevation = 0;
  return {
    geometry,
    texture,
    sampleElevation: elevationAt,
    terrainUsed: Boolean(terrainMosaic),
    imageryUsed: Boolean(imageryMosaic),
    minElevation,
    maxElevation,
    warning: warnings.length ? warnings.join("；") : undefined,
  };
}
