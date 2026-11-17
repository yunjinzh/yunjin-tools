import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const projectUrl = new URL("../", import.meta.url);

function runtimeEnv() {
  return {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };
}

const runtimeContext = {
  waitUntil() {},
  passThroughOnException() {},
};

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${label}-${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

test("model relay exposes CORS preflight for the downloadable file", async () => {
  const worker = await loadWorker("relay-options");
  const response = await worker.fetch(
    new Request("http://localhost/api/model", { method: "OPTIONS" }),
    runtimeEnv(),
    runtimeContext,
  );

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.match(response.headers.get("access-control-allow-methods") ?? "", /POST/);
});

test("model relay rejects arbitrary providers before any upstream request", async () => {
  const worker = await loadWorker("relay-provider-guard");
  const response = await worker.fetch(
    new Request("http://localhost/api/model", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: "custom",
        apiKey: "not-a-real-key",
        model: "test-model",
        system: "system",
        user: "user",
      }),
    }),
    runtimeEnv(),
    runtimeContext,
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.match(await response.text(), /本站转发仅支持/);
});

test("online and standalone interfaces default to relay mode", async () => {
  const [page, route, standalone] = await Promise.all([
    readFile(new URL("app/page.tsx", projectUrl), "utf8"),
    readFile(new URL("app/api/model/route.ts", projectUrl), "utf8"),
    readFile(new URL("public/论文可视化解读生成器_本地版.html", projectUrl), "utf8"),
  ]);

  assert.match(page, /useState<ConnectionMode>\("relay"\)/);
  assert.match(page, /fetch\("\/api\/model"/);
  assert.doesNotMatch(page, /若浏览器提示跨域限制/);

  assert.match(route, /https:\/\/api\.openai\.com\/v1\/chat\/completions/);
  assert.match(route, /https:\/\/api\.anthropic\.com\/v1\/messages/);
  assert.match(route, /https:\/\/api\.deepseek\.com\/chat\/completions/);
  assert.match(route, /https:\/\/dashscope\.aliyuncs\.com\/compatible-mode\/v1\/chat\/completions/);
  assert.match(route, /"Access-Control-Allow-Origin": "\*"/);

  assert.match(standalone, /connectionMode:"relay"/);
  assert.match(standalone, /127\.0\.0\.1:8765\/api\/model/);
  assert.match(standalone, /id="connection-mode"/);
  assert.match(standalone, /本机转发（推荐）/);
  assert.match(standalone, /启动工具\.cmd/);
  assert.doesNotMatch(standalone, /若浏览器提示跨域限制/);

  const script = standalone.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, "standalone script should exist");
  assert.doesNotThrow(() => new vm.Script(script));
});
