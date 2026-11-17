import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");

const result = await build({
  entryPoints: [path.join(root, "standalone/app.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  write: false,
  outdir: path.join(root, ".standalone-build"),
  legalComments: "none",
  loader: { ".tsx": "tsx", ".ts": "ts", ".css": "css" },
});

const jsFile = result.outputFiles.find((file) => file.path.endsWith(".js"));
const cssFile = result.outputFiles.find((file) => file.path.endsWith(".css"));
if (!jsFile || !cssFile) throw new Error("Standalone build did not produce both JavaScript and CSS.");

const js = jsFile.text.replaceAll("</script>", "<\\/script>");
const css = cssFile.text.replaceAll("</style>", "<\\/style>");
const textbookPdf = await readFile(path.join(root, "public/textbook.pdf"));
const textbookBase64 = textbookPdf.toString("base64");
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#27354a">
  <meta name="description" content="四年级语文上册全册交互式自主学习平台">
  <title>四年级语文AI自主学习平台</title>
  <style>${css}</style>
</head>
<body>
  <noscript>请在浏览器设置中启用 JavaScript 后使用本学习平台。</noscript>
  <div id="root"></div>
  <script>window.__TEXTBOOK_PDF_BASE64__="${textbookBase64}";</script>
  <script>${js}</script>
</body>
</html>`;

const publicDir = path.join(root, "public");
const outputDir = path.join(root, "output");
await mkdir(publicDir, { recursive: true });
await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(path.join(publicDir, "四年级语文AI自主学习平台.html"), html, "utf8"),
  writeFile(path.join(outputDir, "四年级语文AI自主学习平台.html"), html, "utf8"),
]);

console.log(`Standalone HTML created (${Buffer.byteLength(html)} bytes).`);
