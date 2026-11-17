"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Category = {
  id: string;
  label: string;
  prompt: string;
  group: "目标" | "地表";
  color: string;
  task: string;
};

type Bounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

type Detection = {
  id: string;
  classId: string;
  label: string;
  score: number;
  rect: [number, number, number, number];
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: Record<string, string | number>;
};

type RasterPixels = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

type GeoAIFeature = {
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties?: {
    label?: string;
    score?: number;
    class_name?: string;
    confidence?: number;
  };
};

const CATEGORIES: Category[] = [
  {
    id: "building",
    label: "建筑物",
    prompt: "building",
    group: "目标",
    color: "#E07563",
    task: "building-detection",
  },
  {
    id: "vehicle",
    label: "车辆",
    prompt: "vehicle",
    group: "目标",
    color: "#466B63",
    task: "car-detection",
  },
  {
    id: "ship",
    label: "船舶",
    prompt: "ship",
    group: "目标",
    color: "#426A83",
    task: "ship-detection",
  },
  {
    id: "solar",
    label: "光伏板",
    prompt: "solar panel",
    group: "目标",
    color: "#C49138",
    task: "solar-panel-detection",
  },
  {
    id: "tank",
    label: "储油罐",
    prompt: "oil storage tank",
    group: "目标",
    color: "#8A5564",
    task: "oil-storage-tank-detection",
  },
  {
    id: "bridge",
    label: "桥梁",
    prompt: "bridge",
    group: "目标",
    color: "#786958",
    task: "oriented-object-detection",
  },
  {
    id: "road",
    label: "道路",
    prompt: "road",
    group: "地表",
    color: "#34383C",
    task: "land-cover-classification",
  },
  {
    id: "vegetation",
    label: "植被",
    prompt: "vegetation",
    group: "地表",
    color: "#67865F",
    task: "land-cover-classification",
  },
  {
    id: "water",
    label: "水体",
    prompt: "water",
    group: "地表",
    color: "#5C7D95",
    task: "land-cover-classification",
  },
  {
    id: "footprint",
    label: "建筑轮廓",
    prompt: "building footprint",
    group: "地表",
    color: "#B35B4C",
    task: "building-footprint-segmentation",
  },
];

const DEFAULT_BOUNDS: Bounds = {
  west: 113.32384,
  south: 23.11502,
  east: 113.33912,
  north: 23.12686,
};

const DEMO_RECTS: Record<string, [number, number, number, number][]> = {
  building: [
    [8, 12, 13, 19],
    [24, 8, 31, 15],
    [48, 12, 55, 18],
    [66, 9, 74, 16],
    [15, 42, 22, 49],
    [36, 38, 43, 46],
    [58, 47, 66, 54],
    [74, 34, 81, 41],
    [45, 70, 53, 78],
    [68, 72, 76, 79],
  ],
  vehicle: [
    [17, 27, 19, 30],
    [29, 29, 31, 32],
    [44, 27, 46, 30],
    [60, 28, 62, 31],
    [72, 55, 74, 58],
    [39, 58, 41, 61],
    [83, 25, 85, 28],
  ],
  ship: [
    [79, 68, 86, 72],
    [87, 80, 94, 84],
    [72, 88, 78, 92],
  ],
  solar: [
    [10, 16, 15, 20],
    [49, 15, 54, 19],
    [59, 49, 65, 53],
    [69, 74, 75, 78],
  ],
  tank: [
    [82, 12, 87, 18],
    [89, 14, 94, 20],
    [84, 24, 89, 30],
    [91, 27, 96, 33],
  ],
  bridge: [
    [71, 59, 84, 63],
    [64, 83, 79, 87],
  ],
  road: [
    [0, 29, 100, 35],
    [30, 0, 35, 100],
    [0, 61, 78, 66],
  ],
  vegetation: [
    [2, 70, 20, 91],
    [39, 20, 51, 33],
    [53, 57, 68, 72],
    [77, 38, 96, 57],
  ],
  water: [
    [78, 62, 100, 100],
    [0, 0, 9, 24],
  ],
  footprint: [
    [23, 7, 32, 16],
    [47, 11, 56, 20],
    [35, 37, 44, 47],
    [57, 46, 67, 55],
  ],
};

function seededScore(seed: string, index: number) {
  let hash = index * 97;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  }
  return 0.62 + (hash % 360) / 1000;
}

function webMercatorToWgs84(x: number, y: number): [number, number] {
  const longitude = (x / 20037508.34) * 180;
  let latitude = (y / 20037508.34) * 180;
  latitude = (180 / Math.PI)
    * (2 * Math.atan(Math.exp((latitude * Math.PI) / 180)) - Math.PI / 2);
  return [longitude, latitude];
}

function categoryForLabel(label: string, selected: string[]) {
  const normalized = label.toLowerCase();
  const aliases: Record<string, string[]> = {
    building: ["building", "house", "roof"],
    vehicle: ["vehicle", "car", "truck", "bus"],
    ship: ["ship", "boat", "vessel"],
    solar: ["solar", "panel"],
    tank: ["tank", "gastank", "storage"],
    bridge: ["bridge"],
    road: ["road", "highway"],
    vegetation: ["vegetation", "tree", "forest"],
    water: ["water", "lake", "river"],
    footprint: ["footprint", "building"],
  };
  const matched = selected.find((id) => aliases[id]?.some((alias) => normalized.includes(alias)));
  return CATEGORIES.find((category) => category.id === matched)
    ?? CATEGORIES.find((category) => selected.includes(category.id))
    ?? CATEGORIES[0];
}

function createGeometry(
  rect: [number, number, number, number],
  bounds: Bounds | null,
  imageSize: { width: number; height: number },
) {
  const [x1, y1, x2, y2] = rect;
  const convert = (x: number, y: number) => {
    if (!bounds) {
      return [
        Number(((x / 100) * imageSize.width).toFixed(2)),
        Number(((y / 100) * imageSize.height).toFixed(2)),
      ];
    }
    return [
      Number((bounds.west + (x / 100) * (bounds.east - bounds.west)).toFixed(7)),
      Number((bounds.north - (y / 100) * (bounds.north - bounds.south)).toFixed(7)),
    ];
  };

  return {
    type: "Polygon" as const,
    coordinates: [[
      convert(x1, y1),
      convert(x2, y1),
      convert(x2, y2),
      convert(x1, y2),
      convert(x1, y1),
    ]],
  };
}

function drawSampleRaster(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = 1400;
  const height = 860;
  canvas.width = width;
  canvas.height = height;

  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#83907D");
  base.addColorStop(0.55, "#A5A18E");
  base.addColorStop(1, "#63767A");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#54747B";
  ctx.beginPath();
  ctx.moveTo(1090, 480);
  ctx.bezierCurveTo(1220, 430, 1290, 610, 1400, 560);
  ctx.lineTo(1400, 860);
  ctx.lineTo(1050, 860);
  ctx.bezierCurveTo(1120, 720, 1010, 620, 1090, 480);
  ctx.fill();

  ctx.strokeStyle = "rgba(227, 218, 192, .82)";
  ctx.lineWidth = 58;
  ctx.beginPath();
  ctx.moveTo(0, 275);
  ctx.lineTo(1400, 285);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(470, 0);
  ctx.lineTo(448, 860);
  ctx.stroke();
  ctx.lineWidth = 32;
  ctx.beginPath();
  ctx.moveTo(0, 550);
  ctx.lineTo(1120, 560);
  ctx.stroke();

  const blocks = [
    [115, 102, 132, 92], [342, 70, 150, 100], [680, 96, 120, 86],
    [922, 84, 145, 92], [220, 366, 115, 92], [500, 345, 122, 102],
    [805, 420, 140, 95], [1020, 320, 120, 88], [620, 650, 128, 95],
    [935, 640, 135, 88],
  ];
  blocks.forEach(([x, y, w, h], index) => {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(((index % 3) - 1) * 0.035);
    ctx.fillStyle = index % 2 ? "#CAC4B0" : "#B9B7AA";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = "rgba(67, 66, 60, .55)";
    ctx.lineWidth = 6;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  });

  ctx.fillStyle = "rgba(63, 103, 65, .7)";
  for (let i = 0; i < 110; i += 1) {
    const x = (i * 113) % width;
    const y = (i * 71 + 520) % height;
    ctx.beginPath();
    ctx.arc(x, y, 9 + (i % 7), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(245, 236, 210, .72)";
  for (let i = 0; i < 14; i += 1) {
    const x = 245 + ((i * 127) % 850);
    const y = 236 + ((i * 89) % 330);
    ctx.fillRect(x, y, 19, 8);
  }

  ctx.fillStyle = "rgba(20, 30, 28, .13)";
  for (let i = 0; i < 3200; i += 1) {
    const x = (i * 47) % width;
    const y = (i * 83) % height;
    ctx.fillRect(x, y, 1, 1);
  }
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement>(null);
  const rasterPixelsRef = useRef<RasterPixels | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isTiff, setIsTiff] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 1400, height: 860 });
  const [selectedCategories, setSelectedCategories] = useState([
    "building",
    "vehicle",
    "vegetation",
  ]);
  const [threshold, setThreshold] = useState(0.68);
  const [maxResults, setMaxResults] = useState(30);
  const [hasGeoReference, setHasGeoReference] = useState(true);
  const [bounds, setBounds] = useState<Bounds>(DEFAULT_BOUNDS);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [view, setView] = useState<"results" | "geojson">("results");
  const [toast, setToast] = useState("");
  const [engine, setEngine] = useState<"geoai" | "preview">("preview");
  const [engineStage, setEngineStage] = useState("等待任务");
  const [sourceCrs, setSourceCrs] = useState("EPSG:4326");

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeDetection = detections.find((item) => item.id === activeId) ?? null;
  const averageConfidence = detections.length
    ? detections.reduce((sum, item) => sum + item.score, 0) / detections.length
    : 0;

  const geojson = useMemo(() => ({
    type: "FeatureCollection",
    name: file ? file.name.replace(/\.[^.]+$/, "") : "geoai_result",
    metadata: {
      source: file?.name ?? "sample_guangzhou.tif",
      coordinate_space: hasGeoReference ? "EPSG:4326" : "image-pixel",
      image_size: [imageSize.width, imageSize.height],
      confidence_threshold: threshold,
      inference_engine: engine === "geoai"
        ? "GeoAI.js 1.0.7 / Grounding DINO Tiny"
        : "GeoAI-compatible preview",
      model_tasks: selectedCategories.map(
        (id) => CATEGORIES.find((category) => category.id === id)?.task,
      ),
      generated_by: "GeoAI Vision Studio",
    },
    features: detections.map((item) => ({
      type: "Feature",
      id: item.id,
      geometry: item.geometry,
      properties: item.properties,
    })),
  }), [
    detections,
    file,
    hasGeoReference,
    imageSize.height,
    imageSize.width,
    engine,
    selectedCategories,
    threshold,
  ]);

  const setCanvasAsRaster = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("无法读取影像像素");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    rasterPixelsRef.current = {
      data: new Uint8ClampedArray(imageData.data),
      width: canvas.width,
      height: canvas.height,
    };
    setImageSize({ width: canvas.width, height: canvas.height });
  };

  const canvasToPreviewUrl = (canvas: HTMLCanvasElement) => new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("影像预览生成失败"));
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });

  const loadImageFile = async (nextFile: File, geoOverride?: Bounds) => {
    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    const tiff = extension === "tif" || extension === "tiff";
    const supported = ["jpg", "jpeg", "png", "tif", "tiff"].includes(extension ?? "");
    if (!supported) {
      setToast("请上传 JPG、PNG、TIF 或 TIFF 文件");
      return;
    }
    if (nextFile.size > 200 * 1024 * 1024) {
      setToast("当前版本单文件上限为 200 MB");
      return;
    }

    setFile(nextFile);
    setIsTiff(tiff);
    setDetections([]);
    setActiveId(null);
    setEngineStage("正在读取影像");

    try {
      if (tiff) {
        setPreviewUrl("");
        const { fromArrayBuffer } = await import("geotiff");
        const geoTiff = await fromArrayBuffer(await nextFile.arrayBuffer());
        const tiffImage = await geoTiff.getImage();
        const originalWidth = tiffImage.getWidth();
        const originalHeight = tiffImage.getHeight();
        const scale = Math.min(1, 1600 / Math.max(originalWidth, originalHeight));
        const outputWidth = Math.max(1, Math.round(originalWidth * scale));
        const outputHeight = Math.max(1, Math.round(originalHeight * scale));
        const rgb = await tiffImage.readRGB({
          width: outputWidth,
          height: outputHeight,
          interleave: true,
          resampleMethod: "bilinear",
        });
        const rgba = new Uint8ClampedArray(outputWidth * outputHeight * 4);
        const source = rgb as ArrayLike<number> & { BYTES_PER_ELEMENT?: number };
        const divisor = (source.BYTES_PER_ELEMENT ?? 1) > 1 ? 256 : 1;
        for (let sourceIndex = 0, targetIndex = 0; targetIndex < rgba.length; sourceIndex += 3, targetIndex += 4) {
          rgba[targetIndex] = Math.min(255, Number(source[sourceIndex] ?? 0) / divisor);
          rgba[targetIndex + 1] = Math.min(255, Number(source[sourceIndex + 1] ?? 0) / divisor);
          rgba[targetIndex + 2] = Math.min(255, Number(source[sourceIndex + 2] ?? 0) / divisor);
          rgba[targetIndex + 3] = 255;
        }
        const canvas = document.createElement("canvas");
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("无法创建 GeoTIFF 预览");
        context.putImageData(new ImageData(rgba, outputWidth, outputHeight), 0, 0);
        setCanvasAsRaster(canvas);
        setPreviewUrl(await canvasToPreviewUrl(canvas));

        const geoKeys = (tiffImage.getGeoKeys() ?? {}) as Record<string, unknown>;
        const geographicCode = Number(geoKeys.GeographicTypeGeoKey ?? 0);
        const projectedCode = Number(geoKeys.ProjectedCSTypeGeoKey ?? 0);
        let detectedBounds: Bounds | null = null;
        try {
          const [minX, minY, maxX, maxY] = tiffImage.getBoundingBox();
          if (geographicCode === 4326) {
            detectedBounds = { west: minX, south: minY, east: maxX, north: maxY };
            setSourceCrs("EPSG:4326");
          } else if (projectedCode === 3857) {
            const [west, south] = webMercatorToWgs84(minX, minY);
            const [east, north] = webMercatorToWgs84(maxX, maxY);
            detectedBounds = { west, south, east, north };
            setSourceCrs("EPSG:3857 → EPSG:4326");
          } else if (geoOverride) {
            detectedBounds = geoOverride;
            setSourceCrs("EPSG:4326");
          } else if (geographicCode || projectedCode) {
            setSourceCrs(`EPSG:${geographicCode || projectedCode}`);
          }
        } catch {
          detectedBounds = geoOverride ?? null;
        }
        if (detectedBounds) {
          setBounds(detectedBounds);
          setHasGeoReference(true);
          setToast("GeoTIFF 像素与空间边界已解析");
        } else {
          setHasGeoReference(false);
          setToast("影像已读取；请补充 WGS84 经纬度边界后再导出地理坐标");
        }
        setEngineStage("GeoTIFF 就绪");
        return;
      }

      const sourceUrl = URL.createObjectURL(nextFile);
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("图片解码失败"));
        image.src = sourceUrl;
      });
      const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("无法创建影像画布");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setCanvasAsRaster(canvas);
      setPreviewUrl(sourceUrl);
      if (geoOverride) {
        setBounds(geoOverride);
        setHasGeoReference(true);
        setSourceCrs("EPSG:4326");
      } else {
        setHasGeoReference(false);
        setSourceCrs("IMAGE_PIXEL");
      }
      setEngineStage("影像就绪");
    } catch (error) {
      rasterPixelsRef.current = null;
      setPreviewUrl("");
      setEngineStage("读取失败");
      setToast(error instanceof Error ? error.message : "无法读取影像");
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (nextFile) void loadImageFile(nextFile);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) void loadImageFile(nextFile);
  };

  const loadSample = () => {
    const canvas = sampleCanvasRef.current;
    if (!canvas) return;
    drawSampleRaster(canvas);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const sample = new File([blob], "guangzhou_industrial_2026.png", {
        type: "image/png",
      });
      void loadImageFile(sample, DEFAULT_BOUNDS);
    }, "image/png");
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((current) => {
      if (current.includes(id)) {
        if (current.length === 1) {
          setToast("至少保留一个识别类别");
          return current;
        }
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  const generateDetections = () => {
    const source = file?.name ?? "sample";
    const output: Detection[] = [];
    selectedCategories.forEach((categoryId) => {
      const category = CATEGORIES.find((item) => item.id === categoryId);
      if (!category) return;
      const rectangles = DEMO_RECTS[categoryId] ?? [];
      rectangles.forEach((rect, index) => {
        const score = Math.min(0.98, seededScore(`${source}-${categoryId}`, index));
        if (score < threshold || output.length >= maxResults) return;
        const geometry = createGeometry(
          rect,
          hasGeoReference ? bounds : null,
          imageSize,
        );
        const area = Math.round(
          ((rect[2] - rect[0]) / 100) * imageSize.width
          * ((rect[3] - rect[1]) / 100) * imageSize.height,
        );
        output.push({
          id: `${categoryId}-${String(index + 1).padStart(3, "0")}`,
          classId: categoryId,
          label: category.label,
          score,
          rect,
          geometry,
          properties: {
            class_name: category.label,
            class_id: categoryId,
            confidence: Number(score.toFixed(4)),
            model_task: category.task,
            area_px: area,
            source_file: source,
            source_crs: hasGeoReference ? sourceCrs : "IMAGE_PIXEL",
            engine: "GeoAI-compatible preview",
          },
        });
      });
    });
    return output.sort((a, b) => b.score - a.score).slice(0, maxResults);
  };

  const normalizeGeoAIOutput = (features: GeoAIFeature[]) => {
    const source = file?.name ?? "uploaded_image";
    return features.map((feature, index): Detection | null => {
      if (feature.geometry?.type !== "Polygon" || !feature.geometry.coordinates?.[0]?.length) {
        return null;
      }
      const coordinates = feature.geometry.coordinates[0];
      const xValues = coordinates.map((coordinate) => coordinate[0]);
      const yValues = coordinates.map((coordinate) => coordinate[1]);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      let rect: [number, number, number, number];
      if (hasGeoReference) {
        rect = [
          ((minX - bounds.west) / (bounds.east - bounds.west)) * 100,
          ((bounds.north - maxY) / (bounds.north - bounds.south)) * 100,
          ((maxX - bounds.west) / (bounds.east - bounds.west)) * 100,
          ((bounds.north - minY) / (bounds.north - bounds.south)) * 100,
        ];
      } else {
        rect = [
          (minX / imageSize.width) * 100,
          (minY / imageSize.height) * 100,
          (maxX / imageSize.width) * 100,
          (maxY / imageSize.height) * 100,
        ];
      }
      rect = rect.map((value) => Math.min(100, Math.max(0, value))) as [number, number, number, number];
      const outputLabel = feature.properties?.label
        ?? feature.properties?.class_name
        ?? "object";
      const score = Number(feature.properties?.score ?? feature.properties?.confidence ?? 0);
      const category = categoryForLabel(outputLabel, selectedCategories);
      const area = Math.round(
        ((rect[2] - rect[0]) / 100) * imageSize.width
        * ((rect[3] - rect[1]) / 100) * imageSize.height,
      );
      return {
        id: `${category.id}-ai-${String(index + 1).padStart(3, "0")}`,
        classId: category.id,
        label: category.label,
        score,
        rect,
        geometry: feature.geometry,
        properties: {
          class_name: category.label,
          original_label: outputLabel,
          class_id: category.id,
          confidence: Number(score.toFixed(4)),
          model_task: "zero-shot-object-detection",
          model_id: "onnx-community/grounding-dino-tiny-ONNX",
          area_px: area,
          source_file: source,
          source_crs: hasGeoReference ? sourceCrs : "IMAGE_PIXEL",
          engine: "GeoAI.js 1.0.7",
        },
      };
    }).filter((item): item is Detection => item !== null && item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  };

  const runGeoAIInference = async () => {
    const raster = rasterPixelsRef.current;
    if (!raster) throw new Error("影像像素尚未准备完成");
    setEngineStage("加载 Grounding DINO 模型");
    setProgress(16);
    const [{ geoai }, { RawImage }] = await Promise.all([
      import("geoai"),
      import("@huggingface/transformers"),
    ]);
    const pipeline = await geoai.pipeline([
      {
        task: "zero-shot-object-detection",
        modelParams: { dtype: "q8" },
      },
    ], { provider: "esri" });

    type LocalGeoImage = InstanceType<typeof RawImage> & {
      pixelToWorld: (x: number, y: number) => [number, number];
      worldToPixel: (x: number, y: number) => [number, number];
      getBounds: () => Bounds;
      getCRS: () => string;
    };
    type LocalPipeline = {
      polygonToImage: () => Promise<LocalGeoImage>;
      inference: (params: {
        inputs: { polygon: GeoJSON.Feature; classLabel: string[] };
        postProcessingParams: { threshold: number; topk: number };
      }) => Promise<{ detections: { features: GeoAIFeature[] } }>;
    };

    const rawImage = new RawImage(
      raster.data,
      raster.width,
      raster.height,
      4,
    ) as LocalGeoImage;
    rawImage.pixelToWorld = (x: number, y: number) => {
      if (!hasGeoReference) return [x, y];
      return [
        bounds.west + (x / raster.width) * (bounds.east - bounds.west),
        bounds.north - (y / raster.height) * (bounds.north - bounds.south),
      ];
    };
    rawImage.worldToPixel = (x: number, y: number) => {
      if (!hasGeoReference) return [x, y];
      return [
        ((x - bounds.west) / (bounds.east - bounds.west)) * raster.width,
        ((bounds.north - y) / (bounds.north - bounds.south)) * raster.height,
      ];
    };
    rawImage.getBounds = () => hasGeoReference
      ? bounds
      : { west: 0, south: raster.height, east: raster.width, north: 0 };
    rawImage.getCRS = () => hasGeoReference ? "EPSG:4326" : "IMAGE_PIXEL";

    const localPipeline = pipeline as unknown as LocalPipeline;
    localPipeline.polygonToImage = async () => rawImage;
    const polygonCoordinates = hasGeoReference
      ? [[
        [bounds.west, bounds.north],
        [bounds.east, bounds.north],
        [bounds.east, bounds.south],
        [bounds.west, bounds.south],
        [bounds.west, bounds.north],
      ]]
      : [[
        [0, 0],
        [raster.width, 0],
        [raster.width, raster.height],
        [0, raster.height],
        [0, 0],
      ]];
    const polygon: GeoJSON.Feature = {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: polygonCoordinates },
    };

    setEngineStage("正在执行浏览器端推理");
    setProgress((value) => Math.max(value, 62));
    const result = await localPipeline.inference({
      inputs: {
        polygon,
        classLabel: selectedCategories.map(
          (id) => CATEGORIES.find((category) => category.id === id)?.prompt ?? id,
        ),
      },
      postProcessingParams: {
        threshold,
        topk: maxResults,
      },
    });
    setEngineStage("空间坐标转换");
    return normalizeGeoAIOutput(result.detections.features);
  };

  const runAnalysis = async () => {
    if (!file) {
      loadSample();
      setToast("已载入示例影像，请再次点击生成识别结果");
      return;
    }
    if (!rasterPixelsRef.current) {
      setToast("影像仍在解码，请稍候再试");
      return;
    }
    setIsAnalyzing(true);
    setProgress(6);
    setEngineStage(engine === "geoai" ? "准备 GeoAI.js 模型" : "准备快速预览管线");
    setDetections([]);
    setActiveId(null);
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(88, current + (engine === "geoai" ? 1.6 : 8)));
    }, engine === "geoai" ? 700 : 120);
    let output: Detection[];
    let usedFallback = false;
    try {
      if (engine === "geoai") {
        output = await runGeoAIInference();
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 1350));
        output = generateDetections();
      }
    } catch (error) {
      usedFallback = true;
      output = generateDetections();
      console.error("GeoAI inference failed; preview fallback used", error);
    } finally {
      window.clearInterval(timer);
    }
    setDetections(output);
    setProgress(100);
    setIsAnalyzing(false);
    setActiveId(output[0]?.id ?? null);
    setView("results");
    setEngineStage(usedFallback ? "实时模型不可用 · 已回退预览" : "识别完成");
    setToast(usedFallback
      ? `实时模型未完成加载，已用预览管线生成 ${output.length} 个要素`
      : `识别完成，共生成 ${output.length} 个空间要素`);
  };

  const downloadGeoJSON = () => {
    if (!detections.length) {
      setToast("请先生成识别结果");
      return;
    }
    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/geo+json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${geojson.name || "geoai_result"}.geojson`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("GeoJSON 已下载");
  };

  const copyGeoJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(geojson, null, 2));
    setToast("GeoJSON 已复制到剪贴板");
  };

  return (
    <main className="site-shell">
      <svg className="noise-overlay" aria-hidden="true">
        <filter id="paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="3"
            seed="17"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>

      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="GeoAI Vision Studio 首页">
          <span className="brand-mark">G</span>
          <span>
            <b>GEOAI</b>
            <small>VISION STUDIO / 01</small>
          </span>
        </a>
        <nav className="nav-links" aria-label="主导航">
          <a className="active" href="#workspace">影像工作台</a>
          <a href="#api">模型能力</a>
          <a href="#api">API 说明</a>
        </nav>
        <div className="top-actions">
          <span className="system-status"><i /> {engine === "geoai" ? "GEOAI.JS LIVE" : "PREVIEW ENGINE"}</span>
          <button className="icon-button" type="button" aria-label="帮助">?</button>
        </div>
      </header>

      <section className="hero-strip">
        <div className="eyebrow-block">
          <span>01 / IMAGE INTELLIGENCE</span>
          <i />
          <span>JPG · PNG · GEOTIFF</span>
        </div>
        <h1>
          让每一个像素
          <br />
          <em>成为空间要素。</em>
        </h1>
        <div className="hero-sidecopy">
          <p>
            上传航空、卫星或无人机影像，选择目标类别，生成包含位置、
            识别准确率与业务属性的标准 GeoJSON。
          </p>
          <span>GEOAI.JS COMPATIBLE PIPELINE</span>
        </div>
      </section>

      <section className="workspace" id="workspace">
        <aside className="control-panel panel-card">
          <div className="panel-heading">
            <span className="step-index">01</span>
            <div>
              <h2>影像与模型</h2>
              <p>配置输入数据及识别类别</p>
            </div>
          </div>

          <div
            className={`dropzone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.tif,.tiff,image/jpeg,image/png,image/tiff"
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <span className="file-badge">{isTiff ? "TIF" : "IMG"}</span>
                <strong>{file.name}</strong>
                <small>
                  {(file.size / 1024 / 1024).toFixed(2)} MB · {imageSize.width} × {imageSize.height}
                </small>
                <b className="replace-label">点击替换</b>
              </>
            ) : (
              <>
                <span className="upload-glyph">↥</span>
                <strong>拖放影像到这里</strong>
                <small>JPG / PNG / TIF · 最大 200 MB</small>
                <b>选择文件</b>
              </>
            )}
          </div>

          {!file && (
            <button className="sample-link" type="button" onClick={loadSample}>
              <span>↗</span> 加载示例影像
            </button>
          )}

          <div className="control-block">
            <div className="control-label">
              <span>识别类别</span>
              <small>{selectedCategories.length} 已选</small>
            </div>
            <div className="category-grid">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={selectedCategories.includes(category.id) ? "selected" : ""}
                  onClick={() => toggleCategory(category.id)}
                >
                  <i style={{ backgroundColor: category.color }} />
                  <span>{category.label}</span>
                  <small>{category.group}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="control-block engine-control">
            <div className="control-label">
              <span>推理引擎</span>
              <small>{engine === "geoai" ? "真实模型" : "快速验证"}</small>
            </div>
            <div className="engine-switch" role="group" aria-label="推理引擎">
              <button
                type="button"
                className={engine === "geoai" ? "active" : ""}
                onClick={() => setEngine("geoai")}
              >
                <b>GeoAI 实时</b>
                <small>Grounding DINO · 首次需下载模型</small>
              </button>
              <button
                type="button"
                className={engine === "preview" ? "active" : ""}
                onClick={() => setEngine("preview")}
              >
                <b>快速预览</b>
                <small>验证交互与 GeoJSON 结构</small>
              </button>
            </div>
            <p className="engine-stage"><i />{engineStage}</p>
          </div>

          <div className="control-block compact-controls">
            <div className="control-label">
              <label htmlFor="threshold">置信度阈值</label>
              <b>{Math.round(threshold * 100)}%</b>
            </div>
            <input
              id="threshold"
              type="range"
              min="0.2"
              max="0.95"
              step="0.01"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
            />
            <div className="range-scale"><span>宽松</span><span>严格</span></div>
          </div>

          <div className="coordinate-toggle">
            <div>
              <span>空间坐标</span>
              <small>{hasGeoReference ? "EPSG:4326" : "影像像素坐标"}</small>
            </div>
            <button
              className={hasGeoReference ? "on" : ""}
              type="button"
              role="switch"
              aria-checked={hasGeoReference}
              onClick={() => setHasGeoReference((value) => !value)}
            >
              <i />
            </button>
          </div>

          {hasGeoReference && (
            <div className="bounds-grid">
              {(["west", "north", "east", "south"] as const).map((key) => (
                <label key={key}>
                  <span>{{ west: "西", north: "北", east: "东", south: "南" }[key]}</span>
                  <input
                    type="number"
                    step="0.00001"
                    value={bounds[key]}
                    onChange={(event) => setBounds({
                      ...bounds,
                      [key]: Number(event.target.value),
                    })}
                  />
                </label>
              ))}
            </div>
          )}

          <label className="max-results">
            <span>最大结果数</span>
            <select
              value={maxResults}
              onChange={(event) => setMaxResults(Number(event.target.value))}
            >
              <option value="15">15 个</option>
              <option value="30">30 个</option>
              <option value="50">50 个</option>
              <option value="100">100 个</option>
            </select>
          </label>

          <button
            className="analyze-button"
            type="button"
            onClick={runAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <><i className="spinner" /> {engineStage} {Math.round(progress)}%</>
            ) : (
              <><span>生成识别结果</span><b>↗</b></>
            )}
          </button>
        </aside>

        <section className="canvas-panel panel-card">
          <div className="canvas-toolbar">
            <div>
              <span className="step-index">02</span>
              <div>
                <h2>识别画布</h2>
                <p>{file?.name ?? "等待载入影像"}</p>
              </div>
            </div>
            <div className="canvas-meta">
              <span><i className={file ? "ready" : ""} /> {file ? "影像就绪" : "未载入"}</span>
              <button type="button" aria-label="适配画布">⌗</button>
              <button type="button" aria-label="放大">＋</button>
              <button type="button" aria-label="缩小">−</button>
            </div>
          </div>

          <div className={`image-stage ${isAnalyzing ? "processing" : ""}`}>
            {previewUrl ? (
              <div
                className="image-frame"
                style={{ aspectRatio: `${imageSize.width} / ${imageSize.height}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="待识别遥感影像" />
                <div className="detection-layer">
                  {detections.map((detection) => {
                    const category = CATEGORIES.find((item) => item.id === detection.classId);
                    const [x1, y1, x2, y2] = detection.rect;
                    return (
                      <button
                        key={detection.id}
                        type="button"
                        className={`detection-box ${activeId === detection.id ? "active" : ""}`}
                        style={{
                          left: `${x1}%`,
                          top: `${y1}%`,
                          width: `${x2 - x1}%`,
                          height: `${y2 - y1}%`,
                          borderColor: category?.color,
                          backgroundColor: `${category?.color}28`,
                        }}
                        onClick={() => setActiveId(detection.id)}
                        aria-label={`${detection.label}，置信度 ${Math.round(detection.score * 100)}%`}
                      >
                        <span style={{ backgroundColor: category?.color }}>
                          {detection.label} {Math.round(detection.score * 100)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {isAnalyzing && (
                  <div className="scan-overlay">
                    <i style={{ top: `${Math.min(progress, 96)}%` }} />
                    <span>{engine === "geoai" ? "GEOAI.JS / LIVE INFERENCE" : "GEOAI / PREVIEW PIPELINE"}</span>
                  </div>
                )}
              </div>
            ) : isTiff ? (
              <div className="tiff-placeholder">
                <div className="tiff-map-grid" />
                <span className="file-badge">TIF</span>
                <h3>GeoTIFF 影像已连接</h3>
                <p>已读取栅格尺寸与空间参考，生成后将在此显示矢量识别结果。</p>
                <small>{imageSize.width} × {imageSize.height} PX · EPSG:4326</small>
                {isAnalyzing && <div className="tiff-progress" style={{ width: `${progress}%` }} />}
              </div>
            ) : (
              <div className="empty-canvas">
                <div className="coordinate-cross"><i /><i /></div>
                <span>INPUT / 00</span>
                <h3>等待影像输入</h3>
                <p>上传一幅遥感、航空或无人机影像开始分析</p>
                <button type="button" onClick={loadSample}>打开示例影像 ↗</button>
              </div>
            )}
          </div>

          <div className="canvas-footer">
            <span>CRS / {hasGeoReference ? sourceCrs : "IMAGE_PIXEL"}</span>
            <span>{imageSize.width} × {imageSize.height} PX</span>
            <span>ZOOM / FIT</span>
            <div className="legend">
              {selectedCategories.slice(0, 4).map((id) => {
                const category = CATEGORIES.find((item) => item.id === id);
                return category ? (
                  <span key={id}><i style={{ backgroundColor: category.color }} />{category.label}</span>
                ) : null;
              })}
            </div>
          </div>
        </section>

        <aside className="result-panel panel-card">
          <div className="panel-heading result-heading">
            <span className="step-index">03</span>
            <div>
              <h2>空间结果</h2>
              <p>检查属性并导出要素</p>
            </div>
          </div>

          <div className="result-kpis">
            <div><strong>{String(detections.length).padStart(2, "0")}</strong><span>识别要素</span></div>
            <div><strong>{detections.length ? `${Math.round(averageConfidence * 100)}%` : "—"}</strong><span>平均置信度</span></div>
          </div>

          <div className="result-tabs">
            <button
              type="button"
              className={view === "results" ? "active" : ""}
              onClick={() => setView("results")}
            >识别结果</button>
            <button
              type="button"
              className={view === "geojson" ? "active" : ""}
              onClick={() => setView("geojson")}
            >GeoJSON</button>
          </div>

          {view === "results" ? (
            <div className="result-scroll">
              {detections.length ? detections.map((detection, index) => {
                const category = CATEGORIES.find((item) => item.id === detection.classId);
                const firstPoint = detection.geometry.coordinates[0][0];
                return (
                  <button
                    type="button"
                    key={detection.id}
                    className={`result-item ${activeId === detection.id ? "active" : ""}`}
                    onClick={() => setActiveId(detection.id)}
                  >
                    <span className="result-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="result-main">
                      <b><i style={{ backgroundColor: category?.color }} />{detection.label}</b>
                      <small>{firstPoint[0]}, {firstPoint[1]}</small>
                    </span>
                    <span className="score-ring" style={{ "--score": `${detection.score * 360}deg` } as React.CSSProperties}>
                      {Math.round(detection.score * 100)}
                    </span>
                  </button>
                );
              }) : (
                <div className="no-results">
                  <span>⌁</span>
                  <h3>尚无识别结果</h3>
                  <p>完成左侧配置并点击“生成识别结果”</p>
                </div>
              )}
            </div>
          ) : (
            <div className="json-preview">
              <div><span>FEATURECOLLECTION</span><button type="button" onClick={copyGeoJSON}>复制</button></div>
              <pre>{JSON.stringify(geojson, null, 2)}</pre>
            </div>
          )}

          {activeDetection && view === "results" && (
            <div className="attribute-card">
              <div><span>要素属性</span><small>{activeDetection.id}</small></div>
              <dl>
                <div><dt>类别</dt><dd>{activeDetection.label}</dd></div>
                <div><dt>置信度</dt><dd>{(activeDetection.score * 100).toFixed(1)}%</dd></div>
                <div><dt>面积</dt><dd>{activeDetection.properties.area_px} px²</dd></div>
                <div><dt>模型任务</dt><dd>{activeDetection.properties.model_task}</dd></div>
              </dl>
            </div>
          )}

          <button className="export-button" type="button" onClick={downloadGeoJSON}>
            <span>↓</span>
            <div><b>导出 GeoJSON</b><small>FeatureCollection · 位置与属性</small></div>
            <i>↗</i>
          </button>
        </aside>
      </section>

      <section className="api-section" id="api">
        <div>
          <span className="section-index">02</span>
          <h2>从影像到要素，<br /><em>不离开浏览器。</em></h2>
        </div>
        <div className="api-grid">
          <article>
            <span>01 / PIPELINE</span>
            <h3>模型管线</h3>
            <p>对应 GeoAI.js 1.0.7 的 <code>geoai.pipeline()</code>，并用本地影像适配器将上传像素转换为 GeoRawImage。</p>
          </article>
          <article>
            <span>02 / INFERENCE</span>
            <h3>浏览器推理</h3>
            <p>通过 <code>pipeline.inference()</code> 在浏览器运行 Grounding DINO，模型文件仅在首次使用时下载。</p>
          </article>
          <article>
            <span>03 / GEOJSON</span>
            <h3>空间化输出</h3>
            <p>像素框依据影像边界转换为空间多边形，并写入类别、准确率、模型与来源属性。</p>
          </article>
        </div>
      </section>

      <footer>
        <span>GEOAI VISION STUDIO</span>
        <p>SPATIAL IMAGE INTELLIGENCE / 2026</p>
        <a href="#workspace">返回工作台 ↑</a>
      </footer>

      <canvas ref={sampleCanvasRef} className="sample-canvas" aria-hidden="true" />
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
