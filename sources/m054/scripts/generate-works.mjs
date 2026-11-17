import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const worksRoot = path.join(projectRoot, "public", "works");
const outputFile = path.join(projectRoot, "app", "generated", "works.ts");

const kindByExtension = {
  ".avif": "image", ".gif": "image", ".jpeg": "image", ".jpg": "image", ".png": "image", ".svg": "image", ".webp": "image",
  ".mp4": "video", ".mov": "video", ".webm": "video",
  ".html": "web", ".htm": "web",
  ".pdf": "pdf",
  ".ppt": "slides", ".pptx": "slides", ".key": "slides",
  ".doc": "document", ".docx": "document", ".md": "document", ".txt": "document",
  ".csv": "data", ".xls": "data", ".xlsx": "data", ".geojson": "data", ".json": "data",
  ".fbx": "model", ".glb": "model", ".gltf": "model", ".ifc": "model", ".obj": "model", ".stl": "model",
  ".zip": "archive", ".7z": "archive", ".rar": "archive",
};

const categoryByKind = {
  image: "视觉设计", video: "影像作品", web: "交互原型", pdf: "方案与研究",
  slides: "演示设计", document: "文档策划", data: "数据产品", model: "三维模型", archive: "项目归档",
};

function titleFromName(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function slugFromName(name) {
  const normalized = name
    .normalize("NFKC")
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `work-${simpleHash(name)}`;
}

function simpleHash(value) {
  let hash = 0;
  for (const char of value) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash).toString(36);
}

function kindFor(fileName) {
  return kindByExtension[path.extname(fileName).toLowerCase()] || "file";
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`无法读取作品描述文件 ${path.relative(projectRoot, filePath)}：${error.message}`);
  }
}

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"))) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute, relative));
    else files.push({ absolute, relative });
  }
  return files;
}

async function assetFromFile(file, publicPrefix) {
  const info = await stat(file.absolute);
  return {
    name: path.basename(file.relative),
    url: encodeURI(path.posix.join(publicPrefix, file.relative)),
    kind: kindFor(file.relative),
    extension: path.extname(file.relative).slice(1).toUpperCase() || "FILE",
    size: info.size,
    sizeLabel: formatBytes(info.size),
  };
}

function normalizeSections(meta) {
  if (Array.isArray(meta.sections)) {
    return meta.sections
      .filter((section) => section?.title && section?.content)
      .map((section) => ({ title: String(section.title), content: String(section.content) }));
  }
  return [
    meta.challenge && { title: "项目背景", content: String(meta.challenge) },
    meta.approach && { title: "设计方法", content: String(meta.approach) },
    meta.outcome && { title: "成果价值", content: String(meta.outcome) },
  ].filter(Boolean);
}

async function workFromDirectory(entry) {
  const directory = path.join(worksRoot, entry.name);
  const files = await listFiles(directory);
  const metaFile = files.find((file) => file.relative === "project.json");
  const meta = metaFile ? await readJson(metaFile.absolute) : {};
  const assetFiles = files.filter((file) => file.relative !== "project.json" && !file.relative.endsWith(".meta.json"));
  const allAssets = await Promise.all(assetFiles.map((file) => assetFromFile(file, `/works/${entry.name}`)));
  const requestedCover = meta.cover ? String(meta.cover).replace(/^\/+/, "") : null;
  const coverAsset = requestedCover
    ? allAssets.find((asset) => asset.url.endsWith(encodeURI(requestedCover)))
    : allAssets.find((asset) => asset.kind === "image");
  const attachments = allAssets.filter((asset) => asset !== coverAsset);
  const primary = attachments.find((asset) => asset.name === meta.primaryFile) || attachments[0] || coverAsset || null;
  const inferredKind = primary?.kind || "file";

  return {
    slug: String(meta.slug || slugFromName(entry.name)),
    title: String(meta.title || titleFromName(entry.name)),
    category: String(meta.category || categoryByKind[inferredKind] || "项目作品"),
    year: String(meta.year || new Date().getFullYear()),
    summary: String(meta.summary || `围绕“${titleFromName(entry.name)}”形成的项目作品与过程归档。`),
    description: String(meta.description || meta.summary || "这里集中呈现项目背景、设计思路与相关成果文件。"),
    role: String(meta.role || "产品策划 / 设计实现"),
    client: meta.client ? String(meta.client) : "",
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [categoryByKind[inferredKind] || "作品"],
    tone: ["coral", "dark", "lime", "paper"].includes(meta.tone) ? meta.tone : "paper",
    size: ["large", "small", "wide"].includes(meta.size) ? meta.size : "small",
    featured: meta.featured !== false,
    order: Number.isFinite(Number(meta.order)) ? Number(meta.order) : 999,
    cover: coverAsset?.url || null,
    primaryUrl: primary?.url || null,
    primaryKind: primary?.kind || null,
    sections: normalizeSections(meta),
    metrics: Array.isArray(meta.metrics)
      ? meta.metrics.filter((metric) => metric?.value && metric?.label).map((metric) => ({ value: String(metric.value), label: String(metric.label) }))
      : [],
    attachments,
  };
}

async function workFromFile(entry) {
  const absolute = path.join(worksRoot, entry.name);
  const file = { absolute, relative: entry.name };
  const asset = await assetFromFile(file, "/works");
  const baseName = entry.name.replace(/\.[^.]+$/, "");
  let meta = {};
  try {
    meta = await readJson(path.join(worksRoot, `${baseName}.meta.json`));
  } catch {
    meta = {};
  }
  const info = await stat(absolute);
  const category = categoryByKind[asset.kind] || "项目文件";
  return {
    slug: String(meta.slug || slugFromName(entry.name)),
    title: String(meta.title || titleFromName(entry.name)),
    category: String(meta.category || category),
    year: String(meta.year || new Date(info.mtimeMs).getFullYear()),
    summary: String(meta.summary || `自动识别的${category}，点击可查看文件详情与原始内容。`),
    description: String(meta.description || `该作品由同目录文件“${entry.name}”自动生成，更新文件并重新发布后，作品卡片会同步刷新。`),
    role: String(meta.role || "创作 / 整理"),
    client: meta.client ? String(meta.client) : "",
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [asset.extension, category],
    tone: ["coral", "dark", "lime", "paper"].includes(meta.tone) ? meta.tone : "paper",
    size: ["large", "small", "wide"].includes(meta.size) ? meta.size : "small",
    featured: meta.featured !== false,
    order: Number.isFinite(Number(meta.order)) ? Number(meta.order) : 999,
    cover: asset.kind === "image" ? asset.url : null,
    primaryUrl: asset.url,
    primaryKind: asset.kind,
    sections: normalizeSections(meta),
    metrics: [],
    attachments: [asset],
  };
}

await mkdir(worksRoot, { recursive: true });
await mkdir(path.dirname(outputFile), { recursive: true });
const rootEntries = await readdir(worksRoot, { withFileTypes: true });
const works = [];

for (const entry of rootEntries.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"))) {
  if (entry.name.startsWith(".") || entry.name.startsWith("_") || entry.name === "project.json") continue;
  if (entry.isDirectory()) works.push(await workFromDirectory(entry));
  if (entry.isFile() && !entry.name.endsWith(".meta.json")) works.push(await workFromFile(entry));
}

works.sort((a, b) => a.order - b.order || Number(b.year) - Number(a.year) || a.title.localeCompare(b.title, "zh-CN"));
const duplicate = works.find((work, index) => works.findIndex((candidate) => candidate.slug === work.slug) !== index);
if (duplicate) throw new Error(`作品 slug 重复：${duplicate.slug}`);

const source = `// 本文件由 scripts/generate-works.mjs 自动生成，请勿手动编辑。\n\n` +
`export type WorkAsset = {\n  name: string;\n  url: string;\n  kind: string;\n  extension: string;\n  size: number;\n  sizeLabel: string;\n};\n\n` +
`export type Work = {\n  slug: string;\n  title: string;\n  category: string;\n  year: string;\n  summary: string;\n  description: string;\n  role: string;\n  client: string;\n  tags: string[];\n  tone: \"coral\" | \"dark\" | \"lime\" | \"paper\";\n  size: \"large\" | \"small\" | \"wide\";\n  featured: boolean;\n  order: number;\n  cover: string | null;\n  primaryUrl: string | null;\n  primaryKind: string | null;\n  sections: { title: string; content: string }[];\n  metrics: { value: string; label: string }[];\n  attachments: WorkAsset[];\n};\n\n` +
`export const works: Work[] = ${JSON.stringify(works, null, 2)};\n\n` +
`export function getWorkBySlug(slug: string) {\n  return works.find((work) => work.slug === slug);\n}\n`;

await writeFile(outputFile, source, "utf8");
console.log(`[portfolio] generated ${works.length} work entries`);
