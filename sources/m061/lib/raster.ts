import {
  clamp,
  latToTileY,
  lonToTileX,
  tileUrl,
  tileXToLon,
  tileYToLat,
} from "./geo";
import type {
  AreaSelection,
  BBox,
  ImageryProvider,
  ImageryTexture,
  TerrainGrid,
  TerrainProvider,
} from "./types";

interface RasterResponse {
  blob: Blob;
  contentType: string;
  source: string;
}

async function fetchRaster(url: string): Promise<RasterResponse> {
  try {
    const response = await fetch("/api/raster", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || `栅格请求失败（HTTP ${response.status}）`);
    }
    return {
      blob: await response.blob(),
      contentType: response.headers.get("content-type") || "image/png",
      source: response.headers.get("x-raster-source") || url,
    };
  } catch (proxyError) {
    const response = await fetch(url, { mode: "cors", signal: AbortSignal.timeout(45_000) });
    if (!response.ok) {
      throw new Error(`${proxyError instanceof Error ? proxyError.message : String(proxyError)}；浏览器直连返回 HTTP ${response.status}`);
    }
    const contentType = response.headers.get("content-type") || "image/png";
    if (!contentType.startsWith("image/")) throw new Error("浏览器直连服务未返回图片");
    return { blob: await response.blob(), contentType, source: new URL(url).hostname };
  }
}

async function blobToImage(blob: Blob) {
  return createImageBitmap(blob);
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.9) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("影像编码失败"))), type, quality);
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("影像读取失败"));
    reader.readAsDataURL(blob);
  });
}

function chooseImageryZoom(selection: AreaSelection, maxZoom: number, tileSize: number) {
  const [west, south, east, north] = selection.bbox;
  for (let zoom = maxZoom; zoom >= 0; zoom -= 1) {
    const xCount = Math.floor(lonToTileX(east, zoom)) - Math.floor(lonToTileX(west, zoom)) + 1;
    const yCount = Math.floor(latToTileY(south, zoom)) - Math.floor(latToTileY(north, zoom)) + 1;
    const pixels = xCount * yCount * tileSize * tileSize;
    if (xCount <= 10 && yCount <= 10 && pixels <= 25_000_000) return zoom;
  }
  return Math.min(maxZoom, 14);
}

async function fetchXyzMosaic(selection: AreaSelection, provider: ImageryProvider): Promise<ImageryTexture> {
  const tileSize = provider.tileSize || 256;
  const zoom = chooseImageryZoom(selection, provider.maxZoom, tileSize);
  const [west, south, east, north] = selection.bbox;
  const minX = Math.floor(lonToTileX(west, zoom));
  const maxX = Math.floor(lonToTileX(east, zoom));
  const minY = Math.floor(latToTileY(north, zoom));
  const maxY = Math.floor(latToTileY(south, zoom));
  const columns = maxX - minX + 1;
  const rows = maxY - minY + 1;
  const mosaic = document.createElement("canvas");
  mosaic.width = columns * tileSize;
  mosaic.height = rows * tileSize;
  const mosaicContext = mosaic.getContext("2d", { alpha: false });
  if (!mosaicContext) throw new Error("无法创建影像画布");
  mosaicContext.fillStyle = "#d8d6cf";
  mosaicContext.fillRect(0, 0, mosaic.width, mosaic.height);

  const requests: Array<Promise<void>> = [];
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      requests.push(
        fetchRaster(tileUrl(provider.url, zoom, x, y)).then(async ({ blob }) => {
          const image = await blobToImage(blob);
          mosaicContext.drawImage(image, (x - minX) * tileSize, (y - minY) * tileSize, tileSize, tileSize);
          image.close();
        }),
      );
    }
  }
  await Promise.all(requests);

  const northPixel = latToTileY(north, zoom) * tileSize - minY * tileSize;
  const southPixel = latToTileY(south, zoom) * tileSize - minY * tileSize;
  const westPixel = lonToTileX(west, zoom) * tileSize - minX * tileSize;
  const eastPixel = lonToTileX(east, zoom) * tileSize - minX * tileSize;
  const cropWidth = Math.max(1, eastPixel - westPixel);
  const cropHeight = Math.max(1, southPixel - northPixel);
  const maxDimension = 4096;
  const scale = Math.min(1, maxDimension / Math.max(cropWidth, cropHeight));

  const output = document.createElement("canvas");
  output.width = Math.max(2, Math.round(cropWidth * scale));
  output.height = Math.max(2, Math.round(cropHeight * scale));
  const outputContext = output.getContext("2d", { alpha: false });
  if (!outputContext) throw new Error("无法创建影像输出画布");
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = "high";
  outputContext.drawImage(
    mosaic,
    westPixel,
    northPixel,
    cropWidth,
    cropHeight,
    0,
    0,
    output.width,
    output.height,
  );

  const blob = await canvasToBlob(output, "image/jpeg", 0.9);
  return {
    dataUrl: await blobToDataUrl(blob),
    mimeType: "image/jpeg",
    blob,
    width: output.width,
    height: output.height,
    source: provider.name,
    attribution: provider.attribution,
    zoom,
  };
}

function buildWmsUrl(bbox: BBox, provider: ImageryProvider, width: number, height: number) {
  const url = new URL(provider.url);
  const params = url.searchParams;
  const version = params.get("VERSION") || params.get("version") || "1.1.1";
  params.set("SERVICE", "WMS");
  params.set("REQUEST", "GetMap");
  params.set("VERSION", version);
  params.set("LAYERS", provider.layers || params.get("LAYERS") || "");
  params.set("STYLES", params.get("STYLES") || "");
  params.set("FORMAT", provider.format || "image/jpeg");
  params.set("TRANSPARENT", "FALSE");
  if (version.startsWith("1.3")) {
    params.delete("SRS");
    params.delete("srs");
    params.set("CRS", "EPSG:4326");
    params.set("BBOX", [bbox[1], bbox[0], bbox[3], bbox[2]].join(","));
  } else {
    params.delete("CRS");
    params.delete("crs");
    params.set("SRS", "EPSG:4326");
    params.set("BBOX", bbox.join(","));
  }
  params.set("WIDTH", String(width));
  params.set("HEIGHT", String(height));
  return url.toString();
}

async function fetchWmsImage(selection: AreaSelection, provider: ImageryProvider): Promise<ImageryTexture> {
  const [west, south, east, north] = selection.bbox;
  const ratio = Math.max(0.25, Math.min(4, ((east - west) * Math.cos((selection.center[1] * Math.PI) / 180)) / (north - south)));
  const width = ratio >= 1 ? 4096 : Math.round(4096 * ratio);
  const height = ratio >= 1 ? Math.round(4096 / ratio) : 4096;
  const { blob, contentType } = await fetchRaster(buildWmsUrl(selection.bbox, provider, width, height));
  const image = await blobToImage(blob);
  const output = document.createElement("canvas");
  output.width = image.width;
  output.height = image.height;
  output.getContext("2d", { alpha: false })?.drawImage(image, 0, 0);
  image.close();
  const encoded = await canvasToBlob(output, contentType.includes("png") ? "image/png" : "image/jpeg", 0.9);
  return {
    dataUrl: await blobToDataUrl(encoded),
    mimeType: encoded.type || contentType,
    blob: encoded,
    width: output.width,
    height: output.height,
    source: provider.name,
    attribution: provider.attribution,
  };
}

export async function fetchImagery(selection: AreaSelection, provider: ImageryProvider) {
  if (!provider.url.trim()) throw new Error("请配置影像服务地址");
  return provider.kind === "wms"
    ? fetchWmsImage(selection, provider)
    : fetchXyzMosaic(selection, provider);
}

interface DecodedTile {
  image: ImageBitmap;
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
}

async function decodeTerrainTile(url: string): Promise<DecodedTile> {
  const { blob } = await fetchRaster(url);
  const image = await blobToImage(blob);
  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("无法读取地形栅格");
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, image.width, image.height).data;
  return { image, pixels, width: image.width, height: image.height };
}

function decodeTerrarium(pixels: Uint8ClampedArray, index: number) {
  return pixels[index] * 256 + pixels[index + 1] + pixels[index + 2] / 256 - 32768;
}

export async function fetchTerrain(selection: AreaSelection, provider: TerrainProvider): Promise<TerrainGrid> {
  const zoom = clamp(Math.round(provider.zoom), 0, 15);
  const [west, south, east, north] = selection.bbox;
  const minX = Math.floor(lonToTileX(west, zoom));
  const maxX = Math.floor(lonToTileX(east, zoom));
  const minY = Math.floor(latToTileY(north, zoom));
  const maxY = Math.floor(latToTileY(south, zoom));
  const tiles = new Map<string, DecodedTile>();

  await Promise.all(
    Array.from({ length: maxY - minY + 1 }, (_, yOffset) =>
      Array.from({ length: maxX - minX + 1 }, (_, xOffset) => {
        const x = minX + xOffset;
        const y = minY + yOffset;
        return decodeTerrainTile(tileUrl(provider.url, zoom, x, y)).then((tile) => {
          tiles.set(`${x}/${y}`, tile);
        });
      }),
    ).flat(),
  );

  const size = clamp(Math.round(provider.gridSize), 17, 129);
  const values: number[] = [];
  let min = Infinity;
  let max = -Infinity;

  for (let row = 0; row < size; row += 1) {
    const v = row / (size - 1);
    const lat = north + (south - north) * v;
    const globalY = latToTileY(lat, zoom);
    const tileY = Math.floor(globalY);
    for (let column = 0; column < size; column += 1) {
      const u = column / (size - 1);
      const lon = west + (east - west) * u;
      const globalX = lonToTileX(lon, zoom);
      const tileX = Math.floor(globalX);
      const tile = tiles.get(`${tileX}/${tileY}`);
      if (!tile) {
        values.push(0);
        min = Math.min(min, 0);
        max = Math.max(max, 0);
        continue;
      }
      const pixelX = clamp(Math.round((globalX - tileX) * (tile.width - 1)), 0, tile.width - 1);
      const pixelY = clamp(Math.round((globalY - tileY) * (tile.height - 1)), 0, tile.height - 1);
      const elevation = decodeTerrarium(tile.pixels, (pixelY * tile.width + pixelX) * 4);
      values.push(elevation);
      min = Math.min(min, elevation);
      max = Math.max(max, elevation);
    }
  }

  for (const tile of tiles.values()) tile.image.close();
  const datum = values.reduce((sum, current) => sum + current, 0) / Math.max(1, values.length);
  return {
    bbox: selection.bbox,
    width: size,
    height: size,
    values,
    min,
    max,
    datum,
    source: provider.name,
    attribution: provider.attribution,
  };
}

export function createFlatTerrain(selection: AreaSelection, provider: TerrainProvider): TerrainGrid {
  const size = clamp(Math.round(provider.gridSize), 17, 129);
  return {
    bbox: selection.bbox,
    width: size,
    height: size,
    values: Array.from({ length: size * size }, () => 0),
    min: 0,
    max: 0,
    datum: 0,
    source: `${provider.name}（未加载，平面回退）`,
    attribution: provider.attribution,
  };
}

export function sampleTerrain(grid: TerrainGrid, lon: number, lat: number) {
  const [west, south, east, north] = grid.bbox;
  const u = clamp((lon - west) / (east - west || 1), 0, 1);
  const v = clamp((north - lat) / (north - south || 1), 0, 1);
  const x = u * (grid.width - 1);
  const y = v * (grid.height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(grid.width - 1, x0 + 1);
  const y1 = Math.min(grid.height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;
  const value = (column: number, row: number) => grid.values[row * grid.width + column];
  const top = value(x0, y0) * (1 - tx) + value(x1, y0) * tx;
  const bottom = value(x0, y1) * (1 - tx) + value(x1, y1) * tx;
  return top * (1 - ty) + bottom * ty;
}

export function tileCoverageDescription(bbox: BBox, zoom: number) {
  const [west, south, east, north] = bbox;
  const minX = Math.floor(lonToTileX(west, zoom));
  const maxX = Math.floor(lonToTileX(east, zoom));
  const minY = Math.floor(latToTileY(north, zoom));
  const maxY = Math.floor(latToTileY(south, zoom));
  return {
    count: (maxX - minX + 1) * (maxY - minY + 1),
    bounds: [tileXToLon(minX, zoom), tileYToLat(maxY + 1, zoom), tileXToLon(maxX + 1, zoom), tileYToLat(minY, zoom)] as BBox,
  };
}
