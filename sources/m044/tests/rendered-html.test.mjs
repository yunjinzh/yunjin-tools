import assert from "node:assert/strict";
import test from "node:test";

const productionTitle = /<title>诗词山河｜四年级古诗四阶背诵游戏<\/title>/i;
const developmentPreviewMeta = /<meta[^>]*name=["']codex-preview["'][^>]*>/i;

test("renders production poetry metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, productionTitle);
  assert.doesNotMatch(html, developmentPreviewMeta);
});
