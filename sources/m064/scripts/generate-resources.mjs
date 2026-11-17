import { readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { extname, join, relative, basename, dirname } from "node:path";
import { createHash } from "node:crypto";

const root = join(process.cwd(), "public", "resources");
const output = join(process.cwd(), "public", "resource-manifest.json");
const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);
const pptExts = new Set([".ppt", ".pptx"]);

await mkdir(root, { recursive: true });

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}

function cleanTitle(file) {
  return basename(file, extname(file))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function webPath(file) {
  return "/resources/" + relative(root, file).split(/[/\\]+/).map(encodeURIComponent).join("/");
}

function idFor(file) {
  return "scan_" + createHash("sha1").update(relative(root, file)).digest("hex").slice(0, 14);
}

const files = await walk(root);
const byStem = new Map();
for (const file of files) {
  const key = join(dirname(file), basename(file, extname(file))).toLowerCase();
  if (!byStem.has(key)) byStem.set(key, []);
  byStem.get(key).push(file);
}

const coverFiles = new Set();
for (const file of files) {
  if (!pptExts.has(extname(file).toLowerCase())) continue;
  const key = join(dirname(file), basename(file, extname(file))).toLowerCase();
  const cover = (byStem.get(key) || []).find((candidate) => imageExts.has(extname(candidate).toLowerCase()));
  if (cover) coverFiles.add(cover);
}

const resources = [];
for (const file of files) {
  const extension = extname(file).toLowerCase();
  const isImage = imageExts.has(extension);
  const isPpt = pptExts.has(extension);
  if ((!isImage && !isPpt) || coverFiles.has(file)) continue;

  const info = await stat(file);
  const relativeFile = relative(root, file);
  const parts = relativeFile.split(/[/\\]+/);
  const category = parts.length > 1 ? parts[0] : isImage ? "图片" : "演示文稿";
  let coverImage = isImage ? webPath(file) : "";
  if (isPpt) {
    const key = join(dirname(file), basename(file, extension)).toLowerCase();
    const cover = (byStem.get(key) || []).find((candidate) => imageExts.has(extname(candidate).toLowerCase()));
    if (cover) coverImage = webPath(cover);
  }

  resources.push({
    id: idFor(file),
    title: cleanTitle(file),
    description: `自动发现于资源目录 · ${relativeFile}`,
    type: isImage ? "image" : "ppt",
    category,
    tags: [category, cleanTitle(file)],
    filePath: webPath(file),
    coverImage,
    fileName: basename(file),
    fileSize: info.size,
    ratio: isImage ? 1.25 : 0.75,
    source: "scanner",
    createdAt: info.mtime.toISOString(),
    stats: { views: 0, downloads: 0, favorites: 0 },
  });
}

resources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
await writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(), resources }, null, 2));
console.log(`[resource-scan] ${resources.length} file(s) indexed from public/resources`);
