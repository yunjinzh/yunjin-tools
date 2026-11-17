import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [inputArg, fontArg, outputArg] = process.argv.slice(2);

if (!inputArg || !fontArg || !outputArg) {
  throw new Error("Usage: node patch-standalone-source-han.mjs <input.html> <font.woff> <output.html>");
}

const inputPath = resolve(inputArg);
const fontPath = resolve(fontArg);
const outputPath = resolve(outputArg);
const [source, font] = await Promise.all([readFile(inputPath, "utf8"), readFile(fontPath)]);

function replaceOnce(value, search, replacement, label) {
  const first = value.indexOf(search);
  if (first < 0) throw new Error(`Standalone patch target missing: ${label}`);
  if (value.indexOf(search, first + search.length) >= 0) {
    throw new Error(`Standalone patch target is ambiguous: ${label}`);
  }
  return value.slice(0, first) + replacement + value.slice(first + search.length);
}

const embeddedFontFace = `@font-face {
  font-family: "Source Han Serif SC Embedded";
  src: url("data:font/woff;base64,${font.toString("base64")}") format("woff");
  font-style: normal;
  font-weight: 700;
  font-display: swap;
}
`;

let result = replaceOnce(source, "<style>:root {", `<style>${embeddedFontFace}:root {`, "font-face insertion");
result = replaceOnce(
  result,
  "  --shadow: 0 24px 80px rgba(16, 54, 83, .15);\n}",
  "  --shadow: 0 24px 80px rgba(16, 54, 83, .15);\n  --font-source-han-serif: \"Source Han Serif SC Embedded\", \"Source Han Serif SC\", \"Noto Serif SC\", STSong, SimSun, serif;\n}",
  "font variable",
);
result = replaceOnce(
  result,
  '  font-family: "Source Han Serif SC", "Noto Serif SC", SimSun, serif;\n  font-size: 30px;',
  "  font-family: var(--font-source-han-serif);\n  font-synthesis: none;\n  font-weight: 700;\n  font-size: 30px;",
  "editor first-level title",
);
result = replaceOnce(
  result,
  ".digest-hero h1 { max-width: 700px; margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -.035em; }",
  ".digest-hero h1, .digest-hero .digest-title { max-width: 700px; margin: 0; font-family: var(--font-source-han-serif) !important; font-synthesis: none; font-weight: 700; font-size: 28px; line-height: 1.25; letter-spacing: -.035em; }",
  "generated article first-level title CSS",
);
result = replaceOnce(
  result,
  ".section-title h2 { margin: 0; color: #123a59; font-size: 19px; line-height: 1.2; letter-spacing: -.02em; }",
  ".section-title h2, .section-title .digest-section-title { margin: 0; color: #123a59; font-family: var(--font-source-han-serif) !important; font-synthesis: none; font-weight: 700; font-size: 19px; line-height: 1.2; letter-spacing: -.02em; }",
  "generated article section-title CSS",
);
result = replaceOnce(
  result,
  "<h1>${Ie(r.title)}</h1>",
  '<h1 class="digest-title" data-font-role="source-han-serif-title">${Ie(r.title)}</h1>',
  "generated article first-level title markup",
);
result = replaceOnce(
  result,
  '<div class="section-title"><span aria-hidden="true"></span><h2>${Ie(r)}</h2></div>',
  '<div class="section-title"><span aria-hidden="true"></span><h2 class="digest-section-title" data-font-role="source-han-serif-section-title">${Ie(r)}</h2></div>',
  "generated article section-title markup",
);
result = replaceOnce(
  result,
  'try{let t=await SC(Y("#digest-sheet"),{cacheBust:!0,pixelRatio:2,backgroundColor:"#ffffff"})',
  'try{await Promise.all([document.fonts.load(\'700 30px "Source Han Serif SC Embedded"\',T.data.title||"论文标题"),document.fonts.load(\'700 21px "Source Han Serif SC Embedded"\',"研究背景 核心数据一览 理论与分析框架 知识结构 范式演进与治理响应 未来深化方向")]),await document.fonts.ready;let t=await SC(Y("#digest-sheet"),{cacheBust:!0,pixelRatio:2,backgroundColor:"#fbfaf6"})',
  "PNG export font readiness",
);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, result);

console.log(JSON.stringify({
  output: outputPath,
  bytes: Buffer.byteLength(result),
  embeddedFontBytes: font.byteLength,
}));
