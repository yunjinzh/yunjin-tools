"use client";

import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ModeKey =
  | "id"
  | "business"
  | "portrait"
  | "meme"
  | "restore"
  | "outfit"
  | "scene"
  | "avatar";

type Mode = {
  key: ModeKey;
  code: string;
  name: string;
  en: string;
  note: string;
  output: string;
};

type Choice = {
  value: string;
  label: string;
  note: string;
};

type OptionGroup = {
  id: string;
  label: string;
  choices: Choice[];
};

const MODES: Mode[] = [
  {
    key: "id",
    code: "01",
    name: "证件照",
    en: "ID PHOTO",
    note: "标准尺寸 / 多底色",
    output: "单张竖版",
  },
  {
    key: "business",
    code: "02",
    name: "商务照",
    en: "BUSINESS",
    note: "求职 / 个人品牌",
    output: "单张竖版",
  },
  {
    key: "portrait",
    code: "03",
    name: "写真",
    en: "PORTRAIT",
    note: "四种氛围 / 一套成片",
    output: "四宫格",
  },
  {
    key: "meme",
    code: "04",
    name: "表情包",
    en: "MEME SET",
    note: "九宫格 / 自动配字",
    output: "九宫格",
  },
  {
    key: "restore",
    code: "05",
    name: "老照片修复",
    en: "RESTORE",
    note: "去损伤 / 增强 / 上色",
    output: "高清原比例",
  },
  {
    key: "outfit",
    code: "06",
    name: "AI 换装",
    en: "OUTFIT",
    note: "职业 / 礼服 / 国风 · 需模型",
    output: "单张竖版",
  },
  {
    key: "scene",
    code: "07",
    name: "场景写真",
    en: "SCENARIO",
    note: "毕业 / 婚纱 / 纪念 · 需模型",
    output: "单张竖版",
  },
  {
    key: "avatar",
    code: "08",
    name: "AI 头像",
    en: "AVATAR",
    note: "插画 / 3D / 赛博 · 需模型",
    output: "方形头像",
  },
];

const OPTION_MAP: Record<ModeKey, OptionGroup[]> = {
  id: [
    {
      id: "format",
      label: "选择规格",
      choices: [
        { value: "一寸", label: "标准一寸", note: "25 × 35 mm" },
        { value: "二寸", label: "标准二寸", note: "35 × 49 mm" },
        { value: "护照", label: "护照 / 签证", note: "33 × 48 mm" },
        { value: "方形", label: "职业头像", note: "1 : 1" },
      ],
    },
    {
      id: "background",
      label: "选择底色",
      choices: [
        { value: "银白", label: "银白", note: "#F1F0EC" },
        { value: "标准蓝", label: "标准蓝", note: "#438EDB" },
        { value: "标准红", label: "标准红", note: "#D64B45" },
      ],
    },
  ],
  business: [
    {
      id: "setting",
      label: "场景风格",
      choices: [
        { value: "现代办公室", label: "现代办公室", note: "暖色虚化" },
        { value: "高级灰", label: "高级灰", note: "纯色影棚" },
        { value: "户外自然", label: "户外自然", note: "黄昏柔光" },
      ],
    },
    {
      id: "crop",
      label: "选择景别",
      choices: [
        { value: "头肩特写", label: "大头照", note: "头肩特写" },
        { value: "半身", label: "半身", note: "腰部以上" },
        { value: "全身", label: "全身", note: "站姿构图" },
      ],
    },
  ],
  portrait: [
    {
      id: "style",
      label: "写真风格",
      choices: [
        { value: "日系小清新", label: "日系小清新", note: "户外胶片" },
        { value: "胶片复古", label: "胶片复古", note: "暖调怀旧" },
        { value: "INS 简约", label: "INS 简约", note: "咖啡馆 / 纯色" },
        { value: "古风国风", label: "古风国风", note: "汉服古典" },
      ],
    },
  ],
  meme: [
    {
      id: "style",
      label: "表情风格",
      choices: [
        { value: "真人表情", label: "真人表情", note: "保持本人脸" },
        { value: "3D 卡通", label: "3D 卡通", note: "圆润立体" },
        { value: "Q 版萌", label: "Q 版萌", note: "Chibi 风" },
      ],
    },
  ],
  restore: [],
  outfit: [
    {
      id: "outfit",
      label: "服装方向",
      choices: [
        { value: "商务正装", label: "商务正装", note: "西装职业" },
        { value: "休闲时尚", label: "休闲时尚", note: "日常穿搭" },
        { value: "礼服晚装", label: "礼服晚装", note: "红毯风" },
        { value: "国风汉服", label: "国风汉服", note: "古典雅致" },
        { value: "电商模特", label: "电商模特", note: "目录棚拍" },
      ],
    },
  ],
  scene: [
    {
      id: "scene",
      label: "场景主题",
      choices: [
        { value: "毕业照", label: "毕业照", note: "学位服" },
        { value: "宝宝百天", label: "宝宝百天", note: "萌娃留念" },
        { value: "孕妇写真", label: "孕妇写真", note: "孕期纪念" },
        { value: "婚纱照", label: "婚纱照", note: "浪漫唯美" },
        { value: "老年寿星", label: "老年寿星", note: "长辈写真" },
      ],
    },
  ],
  avatar: [
    {
      id: "style",
      label: "头像风格",
      choices: [
        { value: "动漫二次元", label: "动漫二次元", note: "日系插画" },
        { value: "游戏原画", label: "游戏原画", note: "CG 半写实" },
        { value: "皮克斯 3D", label: "皮克斯 3D", note: "圆润立体" },
        { value: "赛博朋克", label: "赛博朋克", note: "霓虹科幻" },
        { value: "水彩手绘", label: "水彩手绘", note: "柔和艺术" },
      ],
    },
  ],
};

const MODE_COLORS: Record<ModeKey, { bg: string; overlay: string }> = {
  id: { bg: "#F1F0EC", overlay: "rgba(224,117,99,.08)" },
  business: { bg: "#C8D2D0", overlay: "rgba(16,32,30,.12)" },
  portrait: { bg: "#EBD3C5", overlay: "rgba(224,117,99,.17)" },
  meme: { bg: "#E6CF56", overlay: "rgba(20,20,18,.08)" },
  restore: { bg: "#B8A88E", overlay: "rgba(115,73,41,.12)" },
  outfit: { bg: "#C7B6B1", overlay: "rgba(104,50,44,.12)" },
  scene: { bg: "#BECBC2", overlay: "rgba(50,81,61,.12)" },
  avatar: { bg: "#B8C4D4", overlay: "rgba(76,52,110,.15)" },
};

const MEME_CAPTIONS = [
  "收到",
  "等等我",
  "好耶",
  "不理解",
  "让我想想",
  "稳住",
  "在忙",
  "可以",
  "下次一定",
];

const BACKGROUND_COLORS: Record<string, string> = {
  银白: "#F1F0EC",
  标准蓝: "#438EDB",
  标准红: "#D64B45",
};

const FORMAT_SPECS: Record<
  string,
  { width: number; height: number; label: string }
> = {
  一寸: { width: 295, height: 413, label: "25 × 35 mm / 300 DPI" },
  二寸: { width: 413, height: 579, label: "35 × 49 mm / 300 DPI" },
  护照: { width: 390, height: 567, label: "33 × 48 mm / 300 DPI" },
  方形: { width: 800, height: 800, label: "1 : 1 / 800 PX" },
};

const GENERATIVE_ONLY = new Set<ModeKey>(["outfit", "scene", "avatar"]);
const CUTOUT_MODES = new Set<ModeKey>(["id", "business"]);

type CutoutStatus = "idle" | "processing" | "ready" | "error";
type ModelProvider = "openai" | "compatible";
type ModelOutputSize =
  | "auto"
  | "1024x1024"
  | "1024x1536"
  | "1536x1024";

type ModelConfig = {
  provider: ModelProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
  size: ModelOutputSize;
  rememberKey: boolean;
};

type ModelTestState =
  | { status: "idle"; message: "" }
  | { status: "testing"; message: string }
  | { status: "success" | "error"; message: string };

const MODEL_STORAGE_KEY = "form:model-settings:v1";
const MODEL_SESSION_KEY = "form:model-session-key:v1";
const OPENAI_BASE_URL = "https://api.openai.com/v1";

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  provider: "openai",
  baseUrl: OPENAI_BASE_URL,
  apiKey: "",
  model: "gpt-image-1.5",
  size: "auto",
  rememberKey: false,
};

function isModelConfigReady(config: ModelConfig) {
  return Boolean(
    config.apiKey.trim() && config.baseUrl.trim() && config.model.trim(),
  );
}

function buildModelPrompt(
  mode: Mode,
  selections: Record<string, string>,
) {
  const shared =
    "Use the uploaded photo as the identity reference. Preserve the person's recognizable face, age, skin tone, hairstyle, body proportions, pose, camera angle and framing. Produce one polished, coherent image with realistic anatomy, clean edges and no text, watermark, collage or extra people.";

  if (mode.key === "outfit") {
    return `${shared} Replace only the clothing with a refined ${selections.outfit ?? "商务正装"} outfit. Keep the original person and setting visually consistent. Make the fabric, folds, fit, lighting and shadows photorealistic.`;
  }
  if (mode.key === "scene") {
    return `${shared} Recreate the portrait as a professional ${selections.scene ?? "毕业照"} themed photo. Adapt clothing, props, environment and lighting to the theme while keeping the person unmistakably the same. Use a premium editorial photography finish.`;
  }
  if (mode.key === "avatar") {
    return `${shared} Transform the portrait into a ${selections.style ?? "动漫二次元"} avatar. Keep the face highly recognizable and centered. Use a deliberate art direction, a simple complementary background and a square-profile-image composition.`;
  }

  return shared;
}

async function responseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error) return payload.error;
  } catch {
    // The proxy normally returns JSON errors, but keep a useful fallback.
  }
  return `请求失败（${response.status}）`;
}

async function generateWithModel(
  image: File,
  config: ModelConfig,
  mode: Mode,
  selections: Record<string, string>,
) {
  const body = new FormData();
  body.set("image", image, image.name);
  body.set("apiKey", config.apiKey);
  body.set("baseUrl", config.baseUrl);
  body.set("model", config.model);
  body.set("size", config.size);
  body.set("prompt", buildModelPrompt(mode, selections));

  const response = await fetch("/api/model/generate", {
    method: "POST",
    body,
  });
  if (!response.ok) throw new Error(await responseErrorMessage(response));

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("模型没有返回有效图片。");
  }
  return URL.createObjectURL(blob);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createPersonCutout(source: string) {
  const image = await loadImage(source);
  const { FilesetResolver, ImageSegmenter } = await import(
    "@mediapipe/tasks-vision"
  );

  const maximumSide = 1800;
  const scale = Math.min(
    1,
    maximumSide / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const input = document.createElement("canvas");
  input.width = width;
  input.height = height;
  const inputContext = input.getContext("2d");
  if (!inputContext) throw new Error("无法读取图片画布");
  inputContext.drawImage(image, 0, 0, width, height);

  const vision = await FilesetResolver.forVisionTasks(
    "/mediapipe/wasm",
  );
  const segmenter = await ImageSegmenter.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/mediapipe/models/selfie_segmenter.tflite",
      delegate: "CPU",
    },
    runningMode: "IMAGE",
    outputCategoryMask: false,
    outputConfidenceMasks: true,
  });

  try {
    const results = segmenter.segment(input);
    const masks = results.confidenceMasks;
    if (!masks?.length) throw new Error("人像模型没有返回蒙版");

    const labels = segmenter.getLabels();
    const labelledPersonIndex = labels.findIndex((label) =>
      /person|human|foreground/i.test(label),
    );
    const personIndex =
      labelledPersonIndex >= 0
        ? labelledPersonIndex
        : masks.length > 1
          ? 1
          : 0;
    const mask = masks[personIndex] ?? masks[masks.length - 1];
    const probabilities = mask.getAsFloat32Array();
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = mask.width;
    maskCanvas.height = mask.height;
    const maskContext = maskCanvas.getContext("2d");
    if (!maskContext) throw new Error("无法创建人像蒙版");

    const maskImage = maskContext.createImageData(mask.width, mask.height);
    let visible = 0;
    for (let index = 0; index < probabilities.length; index += 1) {
      const confidence = probabilities[index];
      const softened = Math.max(
        0,
        Math.min(1, (confidence - 0.12) / 0.7),
      );
      const alpha = Math.round(
        softened * softened * (3 - 2 * softened) * 255,
      );
      const pixel = index * 4;
      maskImage.data[pixel] = 255;
      maskImage.data[pixel + 1] = 255;
      maskImage.data[pixel + 2] = 255;
      maskImage.data[pixel + 3] = alpha;
      if (alpha > 32) visible += 1;
    }

    const coverage = visible / Math.max(1, probabilities.length);
    if (coverage < 0.018) throw new Error("未识别到清晰人像");
    maskContext.putImageData(maskImage, 0, 0);

    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;
    const context = output.getContext("2d");
    if (!context) throw new Error("无法创建抠图画布");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(maskCanvas, 0, 0, width, height);
    context.globalCompositeOperation = "source-in";
    context.drawImage(input, 0, 0, width, height);
    context.globalCompositeOperation = "source-over";

    return await new Promise<string>((resolve, reject) => {
      output.toBlob((blob) => {
        if (!blob) {
          reject(new Error("无法生成透明人像"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    });
  } finally {
    segmenter.close();
  }
}

function getAlphaBounds(image: HTMLImageElement) {
  const probe = document.createElement("canvas");
  const maximum = 640;
  const scale = Math.min(
    1,
    maximum / Math.max(image.naturalWidth, image.naturalHeight),
  );
  probe.width = Math.max(1, Math.round(image.naturalWidth * scale));
  probe.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = probe.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return {
      x: 0,
      y: 0,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }
  context.drawImage(image, 0, 0, probe.width, probe.height);
  const pixels = context.getImageData(0, 0, probe.width, probe.height).data;
  let left = probe.width;
  let top = probe.height;
  let right = 0;
  let bottom = 0;

  for (let y = 0; y < probe.height; y += 2) {
    for (let x = 0; x < probe.width; x += 2) {
      if (pixels[(y * probe.width + x) * 4 + 3] > 28) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (left > right || top > bottom) {
    return {
      x: 0,
      y: 0,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }

  return {
    x: left / scale,
    y: top / scale,
    width: Math.max(1, (right - left) / scale),
    height: Math.max(1, (bottom - top) / scale),
  };
}

function drawCutoutSubject(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  crop: "id" | "head" | "half" | "full" = "id",
) {
  const bounds = getAlphaBounds(image);
  const targetHeightRatio =
    crop === "head" ? 1.15 : crop === "half" ? 0.98 : crop === "full" ? 0.9 : 0.94;
  const targetWidthRatio = crop === "head" ? 1.02 : crop === "full" ? 0.78 : 0.92;
  const scale = Math.min(
    (height * targetHeightRatio) / bounds.height,
    (width * targetWidthRatio) / bounds.width,
  );
  const subjectWidth = bounds.width * scale;
  const subjectHeight = bounds.height * scale;
  const left = (width - subjectWidth) / 2 - bounds.x * scale;
  const bottom = crop === "id" ? height * 1.005 : height * 0.99;
  const top = bottom - subjectHeight - bounds.y * scale;

  context.drawImage(
    image,
    left,
    top,
    image.naturalWidth * scale,
    image.naturalHeight * scale,
  );
}

async function renderIdResult(
  cutoutSource: string,
  selections: Record<string, string>,
) {
  const cutout = await loadImage(cutoutSource);
  const spec = FORMAT_SPECS[selections.format] ?? FORMAT_SPECS["一寸"];
  const canvas = document.createElement("canvas");
  canvas.width = spec.width;
  canvas.height = spec.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("无法创建证件照画布");

  context.fillStyle =
    BACKGROUND_COLORS[selections.background] ?? BACKGROUND_COLORS["银白"];
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawCutoutSubject(context, cutout, canvas.width, canvas.height, "id");

  return canvas.toDataURL("image/jpeg", 0.96);
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  filter = "none",
  zoom = 1,
) {
  const imageRatio = image.width / image.height;
  const targetRatio = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  const zoomedWidth = sourceWidth / zoom;
  const zoomedHeight = sourceHeight / zoom;
  sourceX += (sourceWidth - zoomedWidth) / 2;
  sourceY += (sourceHeight - zoomedHeight) / 2;

  context.save();
  context.filter = filter;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    zoomedWidth,
    zoomedHeight,
    x,
    y,
    width,
    height,
  );
  context.restore();
}

function drawLabel(
  context: CanvasRenderingContext2D,
  title: string,
  subtitle: string,
  width: number,
  height: number,
) {
  const bandHeight = Math.max(84, height * 0.085);
  context.fillStyle = "rgba(18,18,16,.88)";
  context.fillRect(0, height - bandHeight, width, bandHeight);
  context.fillStyle = "#F1F0EC";
  context.font = `700 ${Math.max(24, width * 0.026)}px sans-serif`;
  context.fillText(title, width * 0.045, height - bandHeight * 0.48);
  context.fillStyle = "#E07563";
  context.font = `600 ${Math.max(15, width * 0.014)}px sans-serif`;
  context.fillText(subtitle.toUpperCase(), width * 0.045, height - bandHeight * 0.18);
}

async function renderResult(
  source: string,
  mode: Mode,
  selections: Record<string, string>,
  cutoutSource?: string | null,
) {
  if (mode.key === "id") {
    if (!cutoutSource) throw new Error("人像抠图尚未完成");
    return renderIdResult(cutoutSource, selections);
  }

  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器无法创建图像画布");

  const colors = MODE_COLORS[mode.key];
  const firstChoice = Object.values(selections)[0] ?? "默认";

  if (mode.key === "business") {
    if (!cutoutSource) throw new Error("人像抠图尚未完成");
    const cutout = await loadImage(cutoutSource);
    canvas.width = 1000;
    canvas.height = 1320;
    const setting = selections.setting ?? "现代办公室";

    if (setting === "高级灰") {
      const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      background.addColorStop(0, "#D9D9D4");
      background.addColorStop(0.55, "#A5A8A5");
      background.addColorStop(1, "#686B69");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(241,240,236,.16)";
      context.beginPath();
      context.arc(230, 330, 290, 0, Math.PI * 2);
      context.fill();
    } else if (setting === "户外自然") {
      const background = context.createLinearGradient(0, 0, 0, canvas.height);
      background.addColorStop(0, "#D8DFD8");
      background.addColorStop(0.48, "#9FB09D");
      background.addColorStop(1, "#596E5A");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.filter = "blur(28px)";
      ["#E7B98A", "#6D8E70", "#BECDAE", "#E9D6B2"].forEach((color, index) => {
        context.fillStyle = color;
        context.beginPath();
        context.arc(120 + index * 260, 260 + (index % 2) * 230, 130, 0, Math.PI * 2);
        context.fill();
      });
      context.filter = "none";
    } else {
      const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      background.addColorStop(0, "#E9E2D8");
      background.addColorStop(0.6, "#C9C2B8");
      background.addColorStop(1, "#8E8B86");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.filter = "blur(16px)";
      context.fillStyle = "rgba(241,240,236,.62)";
      for (let index = 0; index < 4; index += 1) {
        context.fillRect(80 + index * 250, 90, 110, 850);
      }
      context.filter = "none";
      context.fillStyle = "rgba(63,58,52,.14)";
      context.fillRect(0, 970, canvas.width, 350);
    }

    const crop =
      selections.crop === "头肩特写"
        ? "head"
        : selections.crop === "全身"
          ? "full"
          : "half";
    context.save();
    context.shadowColor = "rgba(24,22,20,.25)";
    context.shadowBlur = 34;
    context.shadowOffsetY = 16;
    drawCutoutSubject(context, cutout, canvas.width, canvas.height, crop);
    context.restore();
    drawLabel(context, setting, `${selections.crop} / BUSINESS PORTRAIT`, canvas.width, canvas.height);
  } else if (mode.key === "meme") {
    canvas.width = 1200;
    canvas.height = 1200;
    context.fillStyle = "#F1F0EC";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const gap = 18;
    const size = (canvas.width - gap * 4) / 3;
    MEME_CAPTIONS.forEach((caption, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const x = gap + column * (size + gap);
      const y = gap + row * (size + gap);
      const filters = [
        "contrast(1.08) saturate(1.05)",
        "contrast(1.15) saturate(.8)",
        "brightness(1.08) saturate(1.2)",
      ];
      drawCover(context, image, x, y, size, size, filters[index % 3], 1 + index * 0.012);
      context.fillStyle = "rgba(18,18,16,.78)";
      context.fillRect(x, y + size - 70, size, 70);
      context.fillStyle = "#F1F0EC";
      context.textAlign = "center";
      context.font = "700 34px sans-serif";
      context.fillText(caption, x + size / 2, y + size - 24);
    });
    context.textAlign = "start";
  } else if (mode.key === "portrait") {
    canvas.width = 1400;
    canvas.height = 1680;
    context.fillStyle = colors.bg;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const gap = 26;
    const cellWidth = (canvas.width - gap * 3) / 2;
    const cellHeight = (canvas.height - gap * 3 - 110) / 2;
    const filters = [
      "brightness(1.05) saturate(.94)",
      "sepia(.22) contrast(1.08) saturate(.92)",
      "contrast(1.1) saturate(.72)",
      "brightness(1.04) saturate(1.12)",
    ];
    for (let index = 0; index < 4; index += 1) {
      const column = index % 2;
      const row = Math.floor(index / 2);
      drawCover(
        context,
        image,
        gap + column * (cellWidth + gap),
        gap + row * (cellHeight + gap),
        cellWidth,
        cellHeight,
        filters[index],
        1 + index * 0.025,
      );
    }
    drawLabel(context, firstChoice, "PORTRAIT SET · 04 FRAMES", canvas.width, canvas.height);
  } else if (mode.key === "restore") {
    const maximum = 1600;
    const scale = Math.min(1, maximum / Math.max(image.width, image.height));
    canvas.width = Math.max(640, Math.round(image.width * scale));
    canvas.height = Math.max(640, Math.round(image.height * scale));
    context.fillStyle = "#E7DED1";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawCover(
      context,
      image,
      0,
      0,
      canvas.width,
      canvas.height,
      "contrast(1.14) brightness(1.04) saturate(1.28)",
    );
    context.fillStyle = "rgba(224,117,99,.04)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawLabel(context, "智能修复", "RESTORED / ENHANCED", canvas.width, canvas.height);
  } else {
    const square = mode.key === "avatar" || selections.format === "方形";
    canvas.width = square ? 1200 : 1000;
    canvas.height = square ? 1200 : 1320;
    context.fillStyle =
      selections.background === "标准蓝"
        ? "#438EDB"
        : selections.background === "标准红"
          ? "#D64B45"
          : colors.bg;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const margin = 0;
    const filters: Record<ModeKey, string> = {
      id: "brightness(1.04) contrast(1.04) saturate(.96)",
      business: "contrast(1.08) saturate(.84)",
      portrait: "none",
      meme: "none",
      restore: "none",
      outfit: "contrast(1.08) saturate(.92)",
      scene: "brightness(1.06) saturate(1.06)",
      avatar: "contrast(1.18) saturate(1.35)",
    };
    drawCover(
      context,
      image,
      margin,
      margin,
      canvas.width - margin * 2,
      canvas.height - margin * 2,
      filters[mode.key],
      1,
    );

    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, colors.overlay);
    gradient.addColorStop(1, "rgba(0,0,0,.03)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (mode.key === "avatar") {
      context.globalCompositeOperation = "screen";
      context.fillStyle = "rgba(116,72,180,.14)";
      context.fillRect(0, 0, canvas.width * 0.42, canvas.height);
      context.fillStyle = "rgba(224,117,99,.17)";
      context.fillRect(canvas.width * 0.68, 0, canvas.width * 0.32, canvas.height);
      context.globalCompositeOperation = "source-over";
    }

    drawLabel(
      context,
      firstChoice,
      `${mode.en} / GENERATED PREVIEW`,
      canvas.width,
      canvas.height,
    );
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

function initialSelections(mode: ModeKey) {
  return OPTION_MAP[mode].reduce<Record<string, string>>((values, group) => {
    values[group.id] = group.choices[0]?.value ?? "";
    return values;
  }, {});
}

export default function Home() {
  const [activeMode, setActiveMode] = useState<ModeKey>("id");
  const [selections, setSelections] = useState<Record<string, string>>(
    initialSelections("id"),
  );
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [cutoutStatus, setCutoutStatus] = useState<CutoutStatus>("idle");
  const [cutoutError, setCutoutError] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [modelConfig, setModelConfig] = useState<ModelConfig>(
    DEFAULT_MODEL_CONFIG,
  );
  const [modelDraft, setModelDraft] = useState<ModelConfig>(
    DEFAULT_MODEL_CONFIG,
  );
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelSettingsError, setModelSettingsError] = useState("");
  const [modelTest, setModelTest] = useState<ModelTestState>({
    status: "idle",
    message: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mode = useMemo(
    () => MODES.find((item) => item.key === activeMode) ?? MODES[0],
    [activeMode],
  );
  const optionGroups = OPTION_MAP[activeMode];
  const hasModelConfig = isModelConfigReady(modelConfig);

  useEffect(() => {
    let cancelled = false;
    try {
      const stored = window.localStorage.getItem(MODEL_STORAGE_KEY);
      const parsed = stored
        ? (JSON.parse(stored) as Partial<ModelConfig>)
        : {};
      const sessionKey =
        window.sessionStorage.getItem(MODEL_SESSION_KEY) ?? "";
      const hydrated: ModelConfig = {
        ...DEFAULT_MODEL_CONFIG,
        ...parsed,
        apiKey:
          parsed.rememberKey && typeof parsed.apiKey === "string"
            ? parsed.apiKey
            : sessionKey,
      };
      window.setTimeout(() => {
        if (cancelled) return;
        setModelConfig(hydrated);
        setModelDraft(hydrated);
      }, 0);
    } catch {
      window.localStorage.removeItem(MODEL_STORAGE_KEY);
      window.sessionStorage.removeItem(MODEL_SESSION_KEY);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isModelSettingsOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModelSettingsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isModelSettingsOpen]);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  useEffect(() => {
    return () => {
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    };
  }, [cutoutUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl?.startsWith("blob:")) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  useEffect(() => {
    if (!sourceUrl || !sourceFile) {
      return;
    }

    let cancelled = false;

    createPersonCutout(sourceUrl)
      .then((nextCutout) => {
        if (cancelled) {
          URL.revokeObjectURL(nextCutout);
          return;
        }
        setCutoutUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return nextCutout;
        });
        setCutoutStatus("ready");
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setCutoutStatus("error");
        setCutoutError(
          reason instanceof Error && reason.message.includes("未识别")
            ? "没有识别到完整人物，请换一张正脸、无遮挡、人物占比较大的照片。"
            : "本地人像分离失败，请刷新页面或更换图片重试。",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [sourceFile, sourceUrl]);

  useEffect(() => {
    if (
      activeMode !== "id" ||
      !cutoutUrl ||
      cutoutStatus !== "ready"
    ) {
      return;
    }
    let cancelled = false;
    renderIdResult(cutoutUrl, selections)
      .then((nextResult) => {
        if (!cancelled) setResultUrl(nextResult);
      })
      .catch(() => {
        if (!cancelled) setError("证件照合成失败，请重新选择照片。");
      });
    return () => {
      cancelled = true;
    };
  }, [activeMode, cutoutStatus, cutoutUrl, selections]);

  const selectMode = useCallback((key: ModeKey) => {
    setActiveMode(key);
    setSelections(initialSelections(key));
    setResultUrl(null);
    setError("");
  }, []);

  const acceptFile = useCallback(
    (file?: File) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("请上传 JPG、PNG 或 WebP 图片。");
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        setError("图片不能超过 12 MB。");
        return;
      }
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      const nextUrl = URL.createObjectURL(file);
      setSourceFile(file);
      setSourceUrl(nextUrl);
      setSourceName(file.name);
      setCutoutUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setCutoutStatus("processing");
      setCutoutError("");
      setResultUrl(null);
      setError("");
    },
    [sourceUrl],
  );

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const openModelSettings = () => {
    setModelDraft(modelConfig);
    setModelSettingsError("");
    setModelTest({ status: "idle", message: "" });
    setIsModelSettingsOpen(true);
  };

  const validateModelDraft = () => {
    const nextConfig: ModelConfig = {
      ...modelDraft,
      apiKey: modelDraft.apiKey.trim(),
      baseUrl: modelDraft.baseUrl.trim().replace(/\/+$/, ""),
      model: modelDraft.model.trim(),
    };

    if (!isModelConfigReady(nextConfig)) {
      throw new Error("API Base、API Key 与模型 ID 都需要填写。");
    }
    let baseUrl: URL;
    try {
      baseUrl = new URL(nextConfig.baseUrl);
    } catch {
      throw new Error("API Base 不是有效的网址。");
    }
    if (baseUrl.protocol !== "https:") {
      throw new Error("API Base 必须使用 HTTPS。");
    }
    return nextConfig;
  };

  const saveModelSettings = () => {
    try {
      const nextConfig = validateModelDraft();
      const storedConfig = {
        ...nextConfig,
        apiKey: nextConfig.rememberKey ? nextConfig.apiKey : "",
      };
      window.localStorage.setItem(
        MODEL_STORAGE_KEY,
        JSON.stringify(storedConfig),
      );
      window.sessionStorage.setItem(MODEL_SESSION_KEY, nextConfig.apiKey);
      setModelConfig(nextConfig);
      setModelDraft(nextConfig);
      setModelSettingsError("");
      setIsModelSettingsOpen(false);
      setError("");
    } catch (reason) {
      setModelSettingsError(
        reason instanceof Error ? reason.message : "模型设置无效。",
      );
    }
  };

  const testModelConnection = async () => {
    let nextConfig: ModelConfig;
    try {
      nextConfig = validateModelDraft();
    } catch (reason) {
      setModelSettingsError(
        reason instanceof Error ? reason.message : "模型设置无效。",
      );
      return;
    }

    setModelSettingsError("");
    setModelTest({ status: "testing", message: "正在验证 Key 与模型…" });
    try {
      const response = await fetch("/api/model/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: nextConfig.apiKey,
          baseUrl: nextConfig.baseUrl,
          model: nextConfig.model,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || `连接失败（${response.status}）`);
      }
      setModelTest({
        status: "success",
        message: payload.message || "连接成功。",
      });
    } catch (reason) {
      setModelTest({
        status: "error",
        message: reason instanceof Error ? reason.message : "连接测试失败。",
      });
    }
  };

  const clearModelSettings = () => {
    window.localStorage.removeItem(MODEL_STORAGE_KEY);
    window.sessionStorage.removeItem(MODEL_SESSION_KEY);
    setModelConfig(DEFAULT_MODEL_CONFIG);
    setModelDraft(DEFAULT_MODEL_CONFIG);
    setShowApiKey(false);
    setModelSettingsError("");
    setModelTest({ status: "idle", message: "" });
    setError("");
  };

  const generate = async () => {
    if (!sourceUrl || !sourceFile) {
      setError("先上传一张清晰照片，再开始生成。");
      fileInputRef.current?.click();
      return;
    }
    if (GENERATIVE_ONLY.has(activeMode) && !hasModelConfig) {
      setError(
        `${mode.name}需要图像生成模型，请先完成模型设置。`,
      );
      openModelSettings();
      return;
    }
    if (CUTOUT_MODES.has(activeMode) && cutoutStatus !== "ready") {
      setError(
        cutoutStatus === "error"
          ? cutoutError
          : "正在本地分离人物与背景，完成后即可生成。",
      );
      return;
    }
    setError("");
    setIsGenerating(true);
    setProgress(8);

    const progressTimer = window.setInterval(() => {
      setProgress((current) =>
        Math.min(current + Math.ceil(Math.random() * 10), 88),
      );
    }, GENERATIVE_ONLY.has(activeMode) ? 900 : 160);

    try {
      const nextResult = GENERATIVE_ONLY.has(activeMode)
        ? await generateWithModel(sourceFile, modelConfig, mode, selections)
        : await renderResult(sourceUrl, mode, selections, cutoutUrl);
      setProgress(100);
      setResultUrl(nextResult);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "这张图片暂时无法处理，请更换图片后重试。",
      );
    } finally {
      window.clearInterval(progressTimer);
      window.setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 320);
    }
  };

  const resetUpload = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setSourceFile(null);
    setSourceName("");
    if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    setCutoutUrl(null);
    setCutoutStatus("idle");
    setCutoutError("");
    setResultUrl(null);
    setError("");
  };

  return (
    <main>
      <svg className="noise-svg" aria-hidden="true">
        <filter id="paper-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-noise)" />
      </svg>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="FORM 人像实验室首页">
          <span className="brand-mark">F.</span>
          <span className="brand-copy">
            FORM
            <small>AI PORTRAIT LAB</small>
          </span>
        </a>
        <nav aria-label="主导航">
          <a href="#studio">创作台</a>
          <a href="#modes">能力</a>
          <a href="#process">流程</a>
        </nav>
        <div className="header-controls">
          <button
            className="model-settings-trigger"
            type="button"
            onClick={openModelSettings}
            aria-label="打开模型设置"
          >
            <i className={hasModelConfig ? "online" : ""} />
            MODEL
          </button>
          <a className="header-action" href="#studio">
            START <span>↘</span>
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-index">
          <span>AI PORTRAIT SYSTEM</span>
          <span>V1.0 / 2026</span>
        </div>
        <div className="hero-title">
          <h1>
            一张照片
            <br />
            <em>八种身份。</em>
          </h1>
          <p className="hero-english">ONE PHOTO. EIGHT POSSIBILITIES.</p>
        </div>
        <div className="hero-brief">
          <span className="rule-mark">◆</span>
          <p>
            上传一张清晰正脸照，在本地完成证件照换底色、商务背景、写真拼版、
            表情包与照片增强；生成式模式在接入模型后启用。
          </p>
          <a href="#studio">
            打开创作台 <span>↓</span>
          </a>
        </div>
        <div className="hero-stats" aria-label="产品数据">
          <article>
            <strong>08</strong>
            <span>种创作模式</span>
          </article>
          <article>
            <strong>12M</strong>
            <span>单图上限</span>
          </article>
          <article>
            <strong>01</strong>
            <span>张照片起步</span>
          </article>
        </div>
        <div className="hero-red-block" aria-hidden="true">
          <span>PORTRAIT</span>
          <span>FORM</span>
        </div>
      </section>

      <section className="studio-section" id="studio">
        <div className="section-heading">
          <span className="eyebrow">01 / CREATION DESK</span>
          <h2>选择一种身份，开始重塑形象。</h2>
          <p>
            证件照会先分离人物，再按所选底色与标准尺寸实时合成。
          </p>
        </div>

        <div className="studio-shell">
          <aside className="mode-sidebar" aria-label="创作模式">
            <div className="sidebar-title">
              <span>MODE</span>
              <span>08</span>
            </div>
            {MODES.map((item) => (
              <button
                className={item.key === activeMode ? "mode-button active" : "mode-button"}
                key={item.key}
                type="button"
                onClick={() => selectMode(item.key)}
                aria-pressed={item.key === activeMode}
              >
                <span className="mode-code">{item.code}</span>
                <span className="mode-name">
                  {item.name}
                  <small>{item.en}</small>
                </span>
                <span className="mode-arrow">↗</span>
              </button>
            ))}
          </aside>

          <div className="workbench">
            <div className="workbench-topline">
              <div>
                <span className="step-no">01</span>
                <span>上传原图</span>
              </div>
              <div>
                <span className="step-no">02</span>
                <span>设定参数</span>
              </div>
              <div>
                <span className="step-no">03</span>
                <span>生成结果</span>
              </div>
            </div>

            <div className="workbench-grid">
              <div className="upload-column">
                <div
                  className={`upload-zone ${isDragging ? "dragging" : ""} ${
                    sourceUrl ? "has-image" : ""
                  }`}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => !sourceUrl && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && !sourceUrl) {
                      fileInputRef.current?.click();
                    }
                  }}
                  aria-label="上传照片"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onFileChange}
                    hidden
                  />
                  {sourceUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sourceUrl} alt="已上传原图预览" />
                      <div className="image-badge">ORIGINAL</div>
                    </>
                  ) : (
                    <div className="upload-empty">
                      <span className="upload-symbol">＋</span>
                      <strong>DROP IMAGE HERE</strong>
                      <span>拖入或点击上传照片</span>
                      <small>JPG / PNG / WEBP · MAX 12 MB</small>
                    </div>
                  )}
                </div>
                <div className="file-line">
                  <span>{sourceName || "等待上传文件"}</span>
                  {sourceUrl ? (
                    <button type="button" onClick={resetUpload}>
                      移除
                    </button>
                  ) : (
                    <span>LOCAL ONLY</span>
                  )}
                </div>
              </div>

              <div className="settings-column">
                <div className="active-mode-title">
                  <span>{mode.code}</span>
                  <div>
                    <h3>{mode.name}</h3>
                    <p>{mode.note}</p>
                  </div>
                  <small>{mode.output}</small>
                </div>

                <div
                  className={`engine-status ${
                    GENERATIVE_ONLY.has(activeMode) && !hasModelConfig
                      ? "offline"
                      : ""
                  }`}
                >
                  <div className="engine-copy">
                    <span>
                      {GENERATIVE_ONLY.has(activeMode)
                        ? hasModelConfig
                          ? "MODEL READY"
                          : "MODEL REQUIRED"
                        : CUTOUT_MODES.has(activeMode)
                          ? "LOCAL SEGMENTATION"
                          : "LOCAL PROCESSING"}
                    </span>
                    <strong>
                      {GENERATIVE_ONLY.has(activeMode)
                        ? hasModelConfig
                          ? `${modelConfig.model} · 已就绪`
                          : "图像生成模型未连接"
                        : CUTOUT_MODES.has(activeMode)
                          ? cutoutStatus === "processing"
                            ? "正在分离人物与背景…"
                            : cutoutStatus === "ready"
                              ? "人像分离完成，可真实换背景"
                              : cutoutStatus === "error"
                                ? "人像分离失败"
                                : "上传后自动分离人物"
                          : "浏览器本地可用"}
                    </strong>
                  </div>
                  {GENERATIVE_ONLY.has(activeMode) && (
                    <button type="button" onClick={openModelSettings}>
                      {hasModelConfig ? "修改" : "连接"} ↗
                    </button>
                  )}
                </div>

                {activeMode === "restore" ? (
                  <div className="restore-note">
                    <span>AUTO</span>
                    <strong>清晰增强 + 对比校正 + 色彩恢复</strong>
                    <p>
                      本地增强褪色和低对比照片的亮度、色彩与可见细节；
                      不虚构五官，不承诺重建已经缺失的区域。
                    </p>
                  </div>
                ) : (
                  optionGroups.map((group) => (
                    <fieldset className="option-group" key={group.id}>
                      <legend>{group.label}</legend>
                      <div className="choice-grid">
                        {group.choices.map((choice) => (
                          <button
                            type="button"
                            key={choice.value}
                            className={
                              selections[group.id] === choice.value
                                ? "choice active"
                                : "choice"
                            }
                            aria-pressed={selections[group.id] === choice.value}
                            onClick={() => {
                              setSelections((current) => ({
                                ...current,
                                [group.id]: choice.value,
                              }));
                              if (activeMode !== "id") setResultUrl(null);
                            }}
                          >
                            <span>
                              {group.id === "background" && (
                                <i
                                  className="color-chip"
                                  style={{
                                    background:
                                      BACKGROUND_COLORS[choice.value],
                                  }}
                                />
                              )}
                              {choice.label}
                            </span>
                            <small>{choice.note}</small>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  ))
                )}

                {(error || cutoutError) && (
                  <p className="error-message">{error || cutoutError}</p>
                )}

                <button
                  className="generate-button"
                  type="button"
                  onClick={generate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span>PROCESSING</span>
                      <span>{progress.toString().padStart(2, "0")}%</span>
                    </>
                  ) : GENERATIVE_ONLY.has(activeMode) && !hasModelConfig ? (
                    <>
                      <span>连接模型后生成</span>
                      <span>SET MODEL ↗</span>
                    </>
                  ) : GENERATIVE_ONLY.has(activeMode) ? (
                    <>
                      <span>调用模型生成</span>
                      <span>GENERATE ↗</span>
                    </>
                  ) : CUTOUT_MODES.has(activeMode) &&
                    cutoutStatus === "processing" ? (
                    <>
                      <span>正在分离人像</span>
                      <span>LOCAL AI</span>
                    </>
                  ) : (
                    <>
                      <span>生成预览</span>
                      <span>GENERATE ↗</span>
                    </>
                  )}
                  {isGenerating && (
                    <i className="progress-line" style={{ width: `${progress}%` }} />
                  )}
                </button>
              </div>

              <div className="result-column">
                <div className={`result-frame ${resultUrl ? "ready" : ""}`}>
                  {resultUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resultUrl} alt={`${mode.name}生成结果`} />
                      <span className="result-stamp">PREVIEW / {mode.en}</span>
                    </>
                  ) : (
                    <div className="result-empty">
                      <span>{mode.code}</span>
                      <strong>OUTPUT</strong>
                      <p>完成上传与参数选择后，生成结果将在这里出现。</p>
                    </div>
                  )}
                </div>
                <div className="result-actions">
                  <span>
                    {resultUrl
                      ? activeMode === "id"
                        ? `实时预览 · ${
                            FORMAT_SPECS[selections.format]?.label ?? ""
                          }`
                        : "预览已生成"
                      : "尚未生成"}
                  </span>
                  {resultUrl ? (
                    <a
                      href={resultUrl}
                      download={`FORM-${mode.key}-${
                            selections.format ?? "portrait"
                      }.${GENERATIVE_ONLY.has(activeMode) ? "png" : "jpg"}`}
                    >
                      下载 {GENERATIVE_ONLY.has(activeMode) ? "PNG" : "JPG"} ↓
                    </a>
                  ) : (
                    <span>{mode.output}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="modes-section" id="modes">
        <div className="section-heading inverse">
          <span className="eyebrow">02 / EIGHT MODES</span>
          <h2>每个可用模式，都执行独立的图像流程。</h2>
        </div>
        <div className="mode-catalog">
          {MODES.map((item) => (
            <button type="button" key={item.key} onClick={() => selectMode(item.key)}>
              <span>{item.code}</span>
              <strong>{item.name}</strong>
              <small>{item.en}</small>
              <p>{item.note}</p>
              <i>↗</i>
            </button>
          ))}
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="process-title">
          <span className="eyebrow">03 / WORKFLOW</span>
          <h2>从随手拍到可用成片，只保留三个动作。</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <strong>UPLOAD</strong>
            <h3>上传清晰照片</h3>
            <p>正脸、光线均匀、无遮挡的照片能获得更稳定的预览结果。</p>
          </li>
          <li>
            <span>02</span>
            <strong>DIRECT</strong>
            <h3>选择用途与方向</h3>
            <p>八类用途分别提供规格、风格、场景或服装参数。</p>
          </li>
          <li>
            <span>03</span>
            <strong>EXPORT</strong>
            <h3>生成并下载</h3>
            <p>本地模式直接导出；生成式模式仅在你点击生成后调用所选服务。</p>
          </li>
        </ol>
      </section>

      <section className="privacy-strip">
        <div>
          <span>PRIVACY / LOCAL-FIRST</span>
          <strong>本地优先，外部调用由你决定</strong>
        </div>
        <p>
          抠图、换底色、拼版与增强仍在浏览器本地完成；AI 换装、场景与头像
          仅在生成时把当前图片发送给你配置的模型服务，本站不保留图片与 Key。
        </p>
        <a href="#studio">开始创作 ↗</a>
      </section>

      {isModelSettingsOpen && (
        <div
          className="model-modal-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setIsModelSettingsOpen(false);
            }
          }}
        >
          <form
            className="model-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="model-dialog-title"
            onSubmit={(event) => {
              event.preventDefault();
              saveModelSettings();
            }}
          >
            <div className="model-dialog-index">
              <span>MODEL / CONNECTION</span>
              <span>01—05</span>
            </div>
            <div className="model-dialog-heading">
              <div>
                <p>EXTERNAL ENGINE</p>
                <h2 id="model-dialog-title">模型设置</h2>
              </div>
              <button
                className="model-dialog-close"
                type="button"
                onClick={() => setIsModelSettingsOpen(false)}
                aria-label="关闭模型设置"
              >
                ×
              </button>
            </div>

            <div className="provider-switch" aria-label="服务类型">
              <button
                type="button"
                className={
                  modelDraft.provider === "openai" ? "active" : undefined
                }
                onClick={() => {
                  setModelDraft((current) => ({
                    ...current,
                    provider: "openai",
                    baseUrl: OPENAI_BASE_URL,
                    model: current.provider === "openai"
                      ? current.model
                      : DEFAULT_MODEL_CONFIG.model,
                  }));
                  setModelTest({ status: "idle", message: "" });
                }}
              >
                <span>01</span>
                <strong>OpenAI</strong>
                <small>官方图像编辑接口</small>
              </button>
              <button
                type="button"
                className={
                  modelDraft.provider === "compatible" ? "active" : undefined
                }
                onClick={() => {
                  setModelDraft((current) => ({
                    ...current,
                    provider: "compatible",
                    baseUrl:
                      current.provider === "openai" ? "" : current.baseUrl,
                    model:
                      current.provider === "openai" ? "" : current.model,
                  }));
                  setModelTest({ status: "idle", message: "" });
                }}
              >
                <span>02</span>
                <strong>兼容服务</strong>
                <small>OpenAI-compatible</small>
              </button>
            </div>

            <div className="model-form-grid">
              <label className="model-field wide">
                <span>API BASE URL</span>
                <input
                  type="url"
                  value={modelDraft.baseUrl}
                  placeholder="https://api.example.com/v1"
                  onChange={(event) =>
                    setModelDraft((current) => ({
                      ...current,
                      baseUrl: event.target.value,
                    }))
                  }
                  autoComplete="url"
                />
                <small>服务地址末尾可包含 /v1，系统会调用 images/edits。</small>
              </label>

              <label className="model-field wide">
                <span>API KEY</span>
                <div className="key-input">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={modelDraft.apiKey}
                    placeholder="sk-••••••••••••••••"
                    onChange={(event) =>
                      setModelDraft((current) => ({
                        ...current,
                        apiKey: event.target.value,
                      }))
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((current) => !current)}
                  >
                    {showApiKey ? "隐藏" : "显示"}
                  </button>
                </div>
              </label>

              <label className="model-field">
                <span>MODEL ID</span>
                <input
                  type="text"
                  value={modelDraft.model}
                  placeholder="gpt-image-1.5"
                  onChange={(event) =>
                    setModelDraft((current) => ({
                      ...current,
                      model: event.target.value,
                    }))
                  }
                  autoComplete="off"
                />
              </label>

              <label className="model-field">
                <span>OUTPUT SIZE</span>
                <select
                  value={modelDraft.size}
                  onChange={(event) =>
                    setModelDraft((current) => ({
                      ...current,
                      size: event.target.value as ModelOutputSize,
                    }))
                  }
                >
                  <option value="auto">AUTO / 按模式</option>
                  <option value="1024x1024">1024 × 1024</option>
                  <option value="1024x1536">1024 × 1536</option>
                  <option value="1536x1024">1536 × 1024</option>
                </select>
              </label>
            </div>

            <label className="remember-key">
              <input
                type="checkbox"
                checked={modelDraft.rememberKey}
                onChange={(event) =>
                  setModelDraft((current) => ({
                    ...current,
                    rememberKey: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>在此浏览器保存 Key</strong>
                <small>
                  关闭时 Key 默认仅保留在当前标签会话；勾选后写入本机浏览器存储。
                </small>
              </span>
            </label>

            <div className="model-security-note">
              <span>SECURITY NOTE</span>
              <p>
                Key 不会写入站点源码。测试或生成时，它会经本站后端转发至所选
                API Base；请只使用可信服务，并建议设置额度上限。
              </p>
            </div>

            {(modelSettingsError || modelTest.message) && (
              <p
                className={`model-test-message ${
                  modelSettingsError || modelTest.status === "error"
                    ? "error"
                    : modelTest.status
                }`}
                role="status"
              >
                {modelSettingsError || modelTest.message}
              </p>
            )}

            <div className="model-dialog-actions">
              <button
                className="clear-model"
                type="button"
                onClick={clearModelSettings}
              >
                清除设置
              </button>
              <div>
                <button
                  className="test-model"
                  type="button"
                  onClick={testModelConnection}
                  disabled={modelTest.status === "testing"}
                >
                  {modelTest.status === "testing" ? "测试中…" : "测试连接"}
                </button>
                <button className="save-model" type="submit">
                  保存并启用 <span>↗</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <footer>
        <div className="footer-brand">FORM.</div>
        <p>AI PORTRAIT LAB / ONE PHOTO, EIGHT POSSIBILITIES.</p>
        <div>
          <a href="#top">TOP ↑</a>
          <span>© 2026</span>
        </div>
      </footer>
    </main>
  );
}
