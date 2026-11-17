import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [htmlArg, cssArg, outputArg = htmlArg] = process.argv.slice(2);

if (!htmlArg || !cssArg) {
  throw new Error("Usage: node sync-standalone-design.mjs <standalone.html> <globals.css> [output.html]");
}

const htmlPath = resolve(htmlArg);
const cssPath = resolve(cssArg);
const outputPath = resolve(outputArg);
const [htmlSource, cssSource] = await Promise.all([
  readFile(htmlPath, "utf8"),
  readFile(cssPath, "utf8"),
]);

function sliceBetween(source, start, end, label) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) throw new Error(`Missing ${label} markers`);
  return { startIndex, endIndex, value: source.slice(startIndex, endIndex) };
}

function replaceState(source, oldValue, newValue, label) {
  if (source.includes(newValue)) return source;
  const first = source.indexOf(oldValue);
  if (first < 0) throw new Error(`Missing standalone ${label} target`);
  if (source.indexOf(oldValue, first + oldValue.length) >= 0) {
    throw new Error(`Ambiguous standalone ${label} target`);
  }
  return source.slice(0, first) + newValue + source.slice(first + oldValue.length);
}

const cssBlock = sliceBetween(cssSource, ".digest-sheet {", "\n.spin {", "source design CSS");
const htmlBlock = sliceBetween(htmlSource, ".digest-sheet {", "\n.spin {", "standalone design CSS");

let result = htmlSource.slice(0, htmlBlock.startIndex) + cssBlock.value + htmlSource.slice(htmlBlock.endIndex);

result = replaceState(
  result,
  "  --paper: #fff;\n",
  "  --paper: #fbfaf6;\n  --paper-deep: #f3f0e8;\n",
  "paper palette",
);

result = replaceState(
  result,
  '<div class="section-title"><span aria-hidden="true"></span><h2>${Ie(r)}</h2></div>',
  '<div class="section-title"><span aria-hidden="true"></span><h2 class="digest-section-title" data-font-role="source-han-serif-section-title">${Ie(r)}</h2></div>',
  "section-title markup",
);

result = replaceState(
  result,
  'await document.fonts.load(\'700 28px "Source Han Serif SC Embedded"\',T.data.title||"论文标题"),await document.fonts.ready;let t=await SC(Y("#digest-sheet"),{cacheBust:!0,pixelRatio:2,backgroundColor:"#ffffff"})',
  'await Promise.all([document.fonts.load(\'700 30px "Source Han Serif SC Embedded"\',T.data.title||"论文标题"),document.fonts.load(\'700 21px "Source Han Serif SC Embedded"\',"研究背景 核心数据一览 理论与分析框架 知识结构 范式演进与治理响应 未来深化方向")]),await document.fonts.ready;let t=await SC(Y("#digest-sheet"),{cacheBust:!0,pixelRatio:2,backgroundColor:"#fbfaf6"})',
  "export font readiness",
);

await writeFile(outputPath, result);
console.log(JSON.stringify({ output: outputPath, bytes: Buffer.byteLength(result) }));
