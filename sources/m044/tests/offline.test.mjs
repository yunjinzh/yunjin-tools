import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("poem library contains 18 textbook entries and 72 line illustrations", async () => {
  const source = await readFile(new URL("app/poems.ts", root), "utf8");
  const poemIds = [...source.matchAll(/^\s{4}id: "([^"]+)",$/gm)].map((match) => match[1]);
  const images = (await readdir(new URL("public/poems/lines/", root))).filter((name) => name.endsWith(".webp"));

  assert.equal(poemIds.length, 18);
  assert.equal(new Set(poemIds).size, 18);
  assert.equal(images.length, 72);
  for (const id of poemIds) {
    for (let line = 1; line <= 4; line += 1) {
      assert.ok(images.includes(`${id}-${line}.webp`), `missing ${id}-${line}.webp`);
    }
  }
});

test("offline deliverable is a single self-contained HTML file", async () => {
  const file = new URL("public/四年级古诗四阶背诵游戏.html", root);
  const html = await readFile(file, "utf8");
  const details = await stat(file);

  assert.equal((html.match(/data:image\/webp;base64/g) ?? []).length, 72);
  assert.equal(/<script[^>]+src=/.test(html), false);
  assert.equal(/<link[^>]+rel="stylesheet"/.test(html), false);
  assert.ok(html.includes("诗词山河"));
  assert.ok(details.size < 50 * 1024 * 1024);
});
