import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectUrl = new URL("../", import.meta.url);

test("generated article title and body section headings use the bundled Source Han Serif face", async () => {
  const [css, page, layout, fontInfo] = await Promise.all([
    readFile(new URL("app/globals.css", projectUrl), "utf8"),
    readFile(new URL("app/page.tsx", projectUrl), "utf8"),
    readFile(new URL("app/layout.tsx", projectUrl), "utf8"),
    stat(new URL("public/fonts/source-han-serif-sc-700.woff", projectUrl)),
  ]);

  assert.match(css, /@font-face\s*{[^}]*font-family:\s*"Source Han Serif SC Embedded"/s);
  assert.match(css, /\.digest-hero h1,[^{]*\.digest-hero \.digest-title\s*{[^}]*font-family:\s*var\(--font-source-han-serif\)\s*!important/s);
  assert.match(css, /\.section-title h2,[^{]*\.section-title \.digest-section-title\s*{[^}]*font-family:\s*var\(--font-source-han-serif\)\s*!important/s);
  assert.match(page, /<h1 className="digest-title" data-font-role="source-han-serif-title">/);
  assert.match(page, /<h2 className="digest-section-title" data-font-role="source-han-serif-section-title">/);
  assert.match(page, /document\.fonts\.load\('700 30px "Source Han Serif SC Embedded"'/);
  assert.match(page, /document\.fonts\.load\([\s\S]*'700 21px "Source Han Serif SC Embedded"'/);
  assert.match(layout, /rel="preload"[\s\S]*href="\/fonts\/source-han-serif-sc-700\.woff"/);
  assert.ok(fontInfo.size > 1_000_000, "bundled CJK font should contain real glyph data");
});

test("downloadable single-file version embeds and waits for Source Han Serif", async () => {
  const html = await readFile(new URL("public/论文可视化解读生成器_本地版.html", projectUrl), "utf8");

  assert.match(html, /src:\s*url\("data:font\/woff;base64,/);
  assert.match(html, /<h1 class="digest-title" data-font-role="source-han-serif-title">/);
  assert.match(html, /<h2 class="digest-section-title" data-font-role="source-han-serif-section-title">/);
  assert.match(html, /\.digest-hero h1,\s*\.digest-hero \.digest-title \{[^}]*font-family: var\(--font-source-han-serif\) !important;/);
  assert.match(html, /\.section-title h2,\s*\.section-title \.digest-section-title \{[^}]*font-family: var\(--font-source-han-serif\) !important;/);
  assert.match(html, /document\.fonts\.load\('700 30px "Source Han Serif SC Embedded"'/);
  assert.match(html, /document\.fonts\.load\('700 21px "Source Han Serif SC Embedded"'/);
});

test("generated digest uses the upgraded editorial section system", async () => {
  const css = await readFile(new URL("app/globals.css", projectUrl), "utf8");

  assert.match(css, /counter-reset:\s*digest-section/);
  assert.match(css, /content:\s*counter\(digest-section, decimal-leading-zero\)/);
  assert.match(css, /content:\s*"PAPER \/ VISUAL DIGEST"/);
  assert.match(css, /\.background-callout::before\s*{[^}]*content:\s*"CONTEXT"/s);
});
