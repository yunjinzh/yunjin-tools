import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceWorks = path.join(packageRoot, "作品文件");
const siteDir = path.join(packageRoot, "site");
const siteWorks = path.join(siteDir, "works");
const configPath = path.join(packageRoot, "网站信息.json");
const sourceCssPath = path.join(packageRoot, "site.css");

const kindByExtension = {
  ".avif": "image", ".gif": "image", ".jpeg": "image", ".jpg": "image", ".png": "image", ".svg": "image", ".webp": "image",
  ".mp4": "video", ".mov": "video", ".webm": "video",
  ".html": "web", ".htm": "web", ".pdf": "pdf",
  ".ppt": "slides", ".pptx": "slides", ".key": "slides",
  ".doc": "document", ".docx": "document", ".md": "document", ".txt": "document",
  ".csv": "data", ".xls": "data", ".xlsx": "data", ".geojson": "data", ".json": "data",
  ".fbx": "model", ".glb": "model", ".gltf": "model", ".ifc": "model", ".obj": "model", ".stl": "model",
  ".zip": "archive", ".7z": "archive", ".rar": "archive"
};

const categoryByKind = {
  image: "视觉设计", video: "影像作品", web: "交互原型", pdf: "方案与研究",
  slides: "演示设计", document: "文档策划", data: "数据产品", model: "三维模型", archive: "项目归档"
};

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const encodePath = (value) => String(value).split("/").map(encodeURIComponent).join("/");

function titleFromName(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function simpleHash(value) {
  let hash = 0;
  for (const char of value) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash).toString(36);
}

function slugFromName(name) {
  const value = name.normalize("NFKC").replace(/\.[^.]+$/, "").toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-+|-+$/g, "");
  return value || `work-${simpleHash(name)}`;
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

async function readJson(filePath, optional = false) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (optional && error.code === "ENOENT") return {};
    throw new Error(`无法读取 ${path.relative(packageRoot, filePath)}：${error.message}`);
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

async function assetFromFile(file, urlPrefix) {
  const info = await stat(file.absolute);
  return {
    name: path.basename(file.relative),
    url: `${urlPrefix}/${encodePath(file.relative)}`,
    kind: kindFor(file.relative),
    extension: path.extname(file.relative).slice(1).toUpperCase() || "FILE",
    size: info.size,
    sizeLabel: formatBytes(info.size)
  };
}

function normalizeSections(meta) {
  if (Array.isArray(meta.sections)) {
    return meta.sections.filter((item) => item?.title && item?.content)
      .map((item) => ({ title: String(item.title), content: String(item.content) }));
  }
  return [
    meta.challenge && { title: "项目背景", content: String(meta.challenge) },
    meta.approach && { title: "设计方法", content: String(meta.approach) },
    meta.outcome && { title: "成果价值", content: String(meta.outcome) }
  ].filter(Boolean);
}

async function workFromDirectory(entry) {
  const directory = path.join(sourceWorks, entry.name);
  const files = await listFiles(directory);
  const metaFile = files.find((file) => file.relative === "project.json");
  const meta = metaFile ? await readJson(metaFile.absolute) : {};
  const rawAssets = files.filter((file) => file.relative !== "project.json" && !file.relative.endsWith(".meta.json"));
  const assets = await Promise.all(rawAssets.map((file) => assetFromFile(file, `/works/${encodeURIComponent(entry.name)}`)));
  const requestedCover = meta.cover ? encodePath(String(meta.cover).replace(/^\/+/, "")) : null;
  const coverAsset = requestedCover ? assets.find((asset) => asset.url.endsWith(requestedCover)) : assets.find((asset) => asset.kind === "image");
  const attachments = assets.filter((asset) => asset !== coverAsset);
  const primary = attachments.find((asset) => asset.name === meta.primaryFile) || attachments[0] || coverAsset || null;
  const inferredKind = primary?.kind || "file";
  return {
    slug: String(meta.slug || slugFromName(entry.name)), title: String(meta.title || titleFromName(entry.name)),
    category: String(meta.category || categoryByKind[inferredKind] || "项目作品"), year: String(meta.year || new Date().getFullYear()),
    summary: String(meta.summary || `围绕“${titleFromName(entry.name)}”形成的项目作品与过程归档。`),
    description: String(meta.description || meta.summary || "这里集中呈现项目背景、设计思路与相关成果文件。"),
    role: String(meta.role || "产品策划 / 设计实现"), client: meta.client ? String(meta.client) : "",
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [categoryByKind[inferredKind] || "作品"],
    tone: ["coral", "dark", "lime", "paper"].includes(meta.tone) ? meta.tone : "paper",
    size: ["large", "small", "wide"].includes(meta.size) ? meta.size : "small",
    featured: meta.featured !== false, order: Number.isFinite(Number(meta.order)) ? Number(meta.order) : 999,
    cover: coverAsset?.url || null, primaryUrl: primary?.url || null, primaryKind: primary?.kind || null,
    sections: normalizeSections(meta),
    metrics: Array.isArray(meta.metrics) ? meta.metrics.filter((item) => item?.value && item?.label)
      .map((item) => ({ value: String(item.value), label: String(item.label) })) : [],
    attachments
  };
}

async function workFromFile(entry) {
  const absolute = path.join(sourceWorks, entry.name);
  const asset = await assetFromFile({ absolute, relative: entry.name }, "/works");
  const baseName = entry.name.replace(/\.[^.]+$/, "");
  const meta = await readJson(path.join(sourceWorks, `${baseName}.meta.json`), true);
  const info = await stat(absolute);
  const category = categoryByKind[asset.kind] || "项目文件";
  return {
    slug: String(meta.slug || slugFromName(entry.name)), title: String(meta.title || titleFromName(entry.name)),
    category: String(meta.category || category), year: String(meta.year || new Date(info.mtimeMs).getFullYear()),
    summary: String(meta.summary || `自动识别的${category}，点击可查看文件详情与原始内容。`),
    description: String(meta.description || `该作品由文件“${entry.name}”自动生成，重新生成网站后作品卡片会同步刷新。`),
    role: String(meta.role || "创作 / 整理"), client: meta.client ? String(meta.client) : "",
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [asset.extension, category],
    tone: ["coral", "dark", "lime", "paper"].includes(meta.tone) ? meta.tone : "paper",
    size: ["large", "small", "wide"].includes(meta.size) ? meta.size : "small",
    featured: meta.featured !== false, order: Number.isFinite(Number(meta.order)) ? Number(meta.order) : 999,
    cover: asset.kind === "image" ? asset.url : null, primaryUrl: asset.url, primaryKind: asset.kind,
    sections: normalizeSections(meta), metrics: [], attachments: [asset]
  };
}

async function scanWorks() {
  await mkdir(sourceWorks, { recursive: true });
  const entries = await readdir(sourceWorks, { withFileTypes: true });
  const works = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"))) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_") || entry.name === "project.json") continue;
    if (entry.isDirectory()) works.push(await workFromDirectory(entry));
    if (entry.isFile() && !entry.name.endsWith(".meta.json")) works.push(await workFromFile(entry));
  }
  works.sort((a, b) => a.order - b.order || Number(b.year) - Number(a.year) || a.title.localeCompare(b.title, "zh-CN"));
  const duplicate = works.find((work, index) => works.findIndex((item) => item.slug === work.slug) !== index);
  if (duplicate) throw new Error(`作品地址重复：${duplicate.slug}`);
  return works;
}

function documentShell(title, description, content) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#f1f0ec">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="/favicon.svg">
  <link rel="stylesheet" href="/fonts/source-han-serif-sc-vf/font.css">
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body>${content}</body>
</html>`;
}

const brand = (home = "/") => `<a class="brand" href="${home}" aria-label="返回首页"><span>YJ</span><span class="brand-copy">SPACE · PRODUCT<br>PORTFOLIO</span></a>`;

function renderHome(config, works) {
  const cards = works.filter((work) => work.featured).map((work, index) => `<a class="work-card ${work.tone} ${work.size}" href="/works/${encodeURIComponent(work.slug)}/" aria-label="查看作品：${escapeHtml(work.title)}">
    <div class="work-card-top"><span>${escapeHtml(work.category)}</span><span>${String(index + 1).padStart(2, "0")}</span></div>
    ${work.cover ? `<img class="work-cover" src="${work.cover}" alt="">` : `<div class="work-mark" aria-hidden="true"><i></i><i></i><i></i></div>`}
    <div class="work-card-copy"><h3>${escapeHtml(work.title)}</h3><p>${escapeHtml(work.summary)}</p></div><span class="card-arrow" aria-hidden="true">↗</span>
  </a>`).join("");
  const timeline = config.experience.map((item, index) => `<article><span class="timeline-index">${String(index + 1).padStart(2, "0")}</span><p>${escapeHtml(item.period)}</p><h3>${escapeHtml(item.role)}</h3><div><span>${escapeHtml(item.detail)}</span><i>↗</i></div></article>`).join("");
  const stats = config.stats.map((item) => `<div><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join("");
  const about = config.about.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  const hero = config.heroTitle || ["把复杂空间，", "变成可理解、", "可行动的产品。"];
  const heroTitle = `${escapeHtml(hero[0])}<br>${escapeHtml(hero[1]).replace("可理解", "<span>可理解</span>")}<br>${escapeHtml(hero[2])}`;
  return `<main>
    <header class="site-header">${brand("#top")}<nav aria-label="主导航"><a href="#works">作品</a><a href="#experience">经历</a><a href="#about">关于</a></nav><a class="header-contact" href="#about">合作交流 <span>↗</span></a></header>
    <section class="hero" id="top"><div class="hero-copy"><p class="eyebrow"><span></span>${escapeHtml(config.eyebrow)}</p><h1>${heroTitle}</h1><div class="hero-bottom"><p>${escapeHtml(config.intro)}</p><a class="round-link" href="#works" aria-label="浏览代表作品">↓</a></div></div>
      <div class="hero-visual" aria-hidden="true"><div class="visual-label label-top">106.71° E<br>26.58° N</div><div class="visual-orbit orbit-one"></div><div class="visual-orbit orbit-two"></div><div class="visual-core"><span>空间</span><small>SPACE</small></div><div class="visual-pin">●</div><div class="visual-label label-bottom">DATA / MODEL / SCENE<br>SYSTEM / DECISION</div></div><div class="hero-stats">${stats}</div></section>
    <section class="works-section" id="works"><div class="section-heading"><div><p class="section-no">01 / SELECTED WORKS</p><h2>代表作品</h2></div><p>从一张地图、一个模型到一套真实运行的系统，作品最终要回答的都是同一个问题：它帮助谁做出了更好的决定？</p></div><div class="work-grid">${cards}</div><p class="works-note"><span>●</span> 已自动识别 ${works.length} 项内容；新增文件并重新生成后，卡片与详情页会同步更新。</p></section>
    <section class="experience-section" id="experience"><div class="section-heading light"><div><p class="section-no">02 / EXPERIENCE</p><h2>经历不是履历，<br>是看问题的方式。</h2></div><p>跨越数据生产、三维 GIS 产品、时空大数据与数字孪生实践，我更关心不同技术如何在同一套业务逻辑中协同。</p></div><div class="timeline">${timeline}</div></section>
    <section class="about-section" id="about"><p class="section-no">03 / ABOUT & CONTACT</p><div class="about-grid"><h2>${escapeHtml(config.aboutTitle).replace("连接现实。", "<span>连接现实。</span>")}</h2><div class="about-copy">${about}<a href="#top">从一个具体问题开始聊聊 <span>↗</span></a></div></div><footer><span>YUNJIN · PORTFOLIO</span><span>© 2026 — SPATIAL / DIGITAL TWIN</span><a href="#top">BACK TO TOP ↑</a></footer></section>
  </main>`;
}

function renderPreview(work) {
  if (!work.primaryUrl || !work.primaryKind) return "";
  if (work.primaryKind === "image") return `<img class="detail-media" src="${work.primaryUrl}" alt="${escapeHtml(work.title)} 预览">`;
  if (work.primaryKind === "video") return `<video class="detail-media" src="${work.primaryUrl}" controls preload="metadata"></video>`;
  if (work.primaryKind === "web") return `<iframe class="detail-frame" src="${work.primaryUrl}" title="${escapeHtml(work.title)} 交互预览" loading="lazy"></iframe>`;
  if (work.primaryKind === "pdf") return `<object class="detail-frame" data="${work.primaryUrl}" type="application/pdf"><a href="${work.primaryUrl}">打开 PDF 文件</a></object>`;
  return "";
}

function renderDetail(work, works, index) {
  const next = works[(index + 1) % works.length];
  const tags = work.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  const sections = work.sections.map((section, sectionIndex) => `<article class="detail-section"><span>${String(sectionIndex + 1).padStart(2, "0")}</span><div><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.content)}</p></div></article>`).join("");
  const metrics = work.metrics.length ? `<section class="detail-metrics" aria-label="项目数据">${work.metrics.map((item) => `<div><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join("")}</section>` : "";
  const preview = renderPreview(work);
  const previewSection = preview ? `<section class="detail-preview-section"><div class="preview-heading"><p class="section-no">LIVE PREVIEW</p><h2>作品预览</h2></div>${preview}</section>` : "";
  const attachments = work.attachments.length ? `<section class="attachments-section"><div><p class="section-no">PROJECT FILES</p><h2>项目文件</h2></div><div class="attachment-list">${work.attachments.map((asset, assetIndex) => `<a href="${asset.url}" target="_blank" rel="noreferrer"><span>${String(assetIndex + 1).padStart(2, "0")}</span><strong>${escapeHtml(asset.name)}</strong><small>${escapeHtml(asset.extension)} · ${escapeHtml(asset.sizeLabel)}</small><i>↗</i></a>`).join("")}</div></section>` : "";
  return `<main class="detail-page"><header class="site-header detail-header">${brand("/")}<nav aria-label="作品导航"><a href="/#works">全部作品</a><a href="/#experience">经历</a><a href="/#about">关于</a></nav><a class="header-contact" href="/#works">返回作品集 <span>↙</span></a></header>
    <section class="detail-hero"><div class="detail-kicker"><span>${String(index + 1).padStart(2, "0")} / ${String(works.length).padStart(2, "0")}</span><span>${escapeHtml(work.category)}</span><span>${escapeHtml(work.year)}</span></div><h1>${escapeHtml(work.title)}</h1><div class="detail-intro"><p>${escapeHtml(work.summary)}</p><div class="tag-list" aria-label="项目标签">${tags}</div></div></section>
    <section class="detail-visual ${work.tone}">${work.cover ? `<img src="${work.cover}" alt="${escapeHtml(work.title)} 封面">` : `<div class="detail-art" aria-hidden="true"><span class="detail-art-label">PROJECT / ${String(index + 1).padStart(2, "0")}</span><i></i><i></i><i></i><strong>${escapeHtml(work.title.slice(0, 2))}</strong><small>DATA · SPACE · SYSTEM · DECISION</small></div>`}</section>
    <section class="detail-overview"><div class="overview-meta"><p class="section-no">PROJECT OVERVIEW</p><dl><div><dt>年份</dt><dd>${escapeHtml(work.year)}</dd></div><div><dt>角色</dt><dd>${escapeHtml(work.role)}</dd></div>${work.client ? `<div><dt>领域</dt><dd>${escapeHtml(work.client)}</dd></div>` : ""}<div><dt>文件</dt><dd>${work.attachments.length ? `${work.attachments.length} 项` : "项目说明"}</dd></div></dl></div><div class="overview-copy"><p class="detail-lead">${escapeHtml(work.description)}</p>${sections}</div></section>${metrics}${previewSection}${attachments}
    <a class="next-work ${next.tone}" href="/works/${encodeURIComponent(next.slug)}/"><span>NEXT PROJECT</span><strong>${escapeHtml(next.title)}</strong><i>→</i></a><footer class="detail-footer"><span>YUNJIN · PORTFOLIO</span><span>© 2026 — SPATIAL / DIGITAL TWIN</span><a href="/">HOME ↑</a></footer></main>`;
}

async function build() {
  const [config, rawCss, works] = await Promise.all([readJson(configPath), readFile(sourceCssPath, "utf8"), scanWorks()]);
  await mkdir(siteDir, { recursive: true });
  await rm(siteWorks, { recursive: true, force: true });
  await mkdir(path.join(siteDir, "assets"), { recursive: true });
  await cp(sourceWorks, siteWorks, { recursive: true });
  await writeFile(path.join(siteDir, "assets", "site.css"), rawCss.replace(/^@import\s+["']tailwindcss["'];?\s*/m, ""), "utf8");
  await writeFile(path.join(siteDir, "index.html"), documentShell(config.siteTitle, config.description, renderHome(config, works)), "utf8");
  for (let index = 0; index < works.length; index += 1) {
    const work = works[index];
    const directory = path.join(siteWorks, work.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), documentShell(`${work.title}｜${config.name}作品集`, work.summary, renderDetail(work, works, index)), "utf8");
  }
  const notFound = `<main class="not-found"><span>404 / NOT FOUND</span><h1>这件作品，<br>暂时不在这里。</h1><p>它可能已经更名、移动，或仍在整理中。</p><a href="/">返回作品集 <span>↗</span></a></main>`;
  await writeFile(path.join(siteDir, "404.html"), documentShell(`页面未找到｜${config.siteTitle}`, config.description, notFound), "utf8");
  await writeFile(path.join(siteDir, ".nojekyll"), "", "utf8");
  await writeFile(path.join(siteDir, "build-info.json"), JSON.stringify({ generatedAt: new Date().toISOString(), works: works.length, font: "Source Han Serif SC VF" }, null, 2), "utf8");
  console.log(`网站生成完成：${works.length} 项作品`);
}

build().catch((error) => {
  console.error(`网站生成失败：${error.message}`);
  process.exitCode = 1;
});
