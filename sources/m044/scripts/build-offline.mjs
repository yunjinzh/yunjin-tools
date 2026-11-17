import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "offline-dist");
const sourceHtmlPath = path.join(distRoot, "offline", "index.html");
const outputPath = path.join(projectRoot, "public", "四年级古诗四阶背诵游戏.html");
const imagesDir = path.join(projectRoot, "public", "poems", "lines");

let html = await readFile(sourceHtmlPath, "utf8");
const stylesheetMatches = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
const scriptMatch = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);

for (const match of stylesheetMatches) {
  const cssPath = path.resolve(path.dirname(sourceHtmlPath), match[1]);
  const css = await readFile(cssPath, "utf8");
  html = html.replace(match[0], () => `<style>${css}</style>`);
}

if (!scriptMatch) throw new Error("Offline JavaScript bundle was not found");

const scriptPath = path.resolve(path.dirname(sourceHtmlPath), scriptMatch[1]);
const script = (await readFile(scriptPath, "utf8")).replaceAll("</script", "<\\/script");
const imageFiles = (await readdir(imagesDir)).filter((name) => name.endsWith(".webp")).sort();
const imageEntries = await Promise.all(
  imageFiles.map(async (name) => {
    const data = await readFile(path.join(imagesDir, name));
    return [`/poems/lines/${name}`, `data:image/webp;base64,${data.toString("base64")}`];
  }),
);
const imageMap = JSON.stringify(Object.fromEntries(imageEntries)).replaceAll("</script", "<\\/script");
const inlineScript = `<script>window.__POETRY_IMAGES__=${imageMap};</script><script type="module">${script}</script>`;

html = html.replace(scriptMatch[0], () => inlineScript);
html = html.replace("</head>", `<meta name="description" content="现行人教版四年级上下册18首古典诗词，四关交互背诵游戏；单文件离线可用。" /></head>`);

await writeFile(outputPath, html);
console.log(outputPath);
