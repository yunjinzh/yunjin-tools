import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SETTINGS, generationBody, splitPrompts, restoreJobs, type Job } from "../lib/image-types";
import { ApiError, handleAction, upstream, validateGeneration, safeImageUrl } from "../lib/listenhub";
import { ClientError } from "../lib/client-api";
import { ImageQueue } from "../lib/queue";
import { makeZip } from "../lib/zip";
import { writeFileSync, mkdirSync } from "node:fs";

const body = generationBody("一只小狐狸", DEFAULT_SETTINGS);
const envelope = (data: unknown, status = 200) => Response.json({ code: 0, data }, { status });
const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));
async function until(predicate: () => boolean) { for (let i = 0; i < 200; i++) { if (predicate()) return; await tick(); } throw new Error("Timed out waiting for queue"); }

test("split prompts preserves multiline blocks and drops blank lines", () => {
  assert.deepEqual(splitPrompts(" 春天\r\n\n夏天 ", "lines"), ["春天", "夏天"]);
  assert.deepEqual(splitPrompts("春天\n森林\n---\n夏天\n海岸", "blocks"), ["春天\n森林", "夏天\n海岸"]);
});
test("only Pro receives quality; validation rejects unsupported parameters", () => {
  assert.equal("quality" in body.imageConfig, false);
  assert.equal(generationBody("test", { ...DEFAULT_SETTINGS, model: "gpt-image-2-official", quality: "high" }).imageConfig.quality, "high");
  assert.throws(() => validateGeneration({ ...body, model: "other" }), ApiError);
  assert.throws(() => validateGeneration({ ...body, prompt: " " }), ApiError);
  assert.throws(() => validateGeneration({ ...body, imageConfig: { imageSize: "8K", aspectRatio: "1:1" } }), ApiError);
});
test("creation forwards documented request and keeps key out of response", async () => {
  let calls = 0;
  const response = await handleAction("create", body, "test-key-not-real", async (url, init) => {
    calls++; assert.equal(url, "https://api.marswave.ai/openapi/v1/images/generation/async");
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer test-key-not-real");
    assert.deepEqual(JSON.parse(init?.body as string), body);
    return envelope({ taskId: "task-1", status: "pending" }, 202);
  });
  assert.deepEqual(await response.json(), { taskId: "task-1", status: "pending" }); assert.equal(calls, 1);
});
test("estimate uses real upstream credit value including zero", async () => {
  const r = await handleAction("estimate", body, "test-key", async () => envelope({ credits: 0, canGenerate: true }));
  assert.equal((await r.json() as any).credits, 0);
  await assert.rejects(() => handleAction("estimate", body, "test-key", async () => envelope({ canGenerate: true })), ApiError);
});
test("ambiguous submissions are never silently retried", async () => {
  let calls = 0;
  await assert.rejects(() => upstream("/images/generation/async", "test-key", body, async () => { calls++; throw new Error("network"); }), (e: any) => e.uncertain === true);
  assert.equal(calls, 1);
  await assert.rejects(() => handleAction("create", body, "test-key", async () => envelope({})), (e: any) => e.uncertain === true);
});
test("business credit and subscription errors stop new work", async () => {
  for (const code of [26004, 23016]) await assert.rejects(() => upstream("/images/generation/async", "test-key", body, async () => Response.json({ code, message: "rejected" }, { status: 400 })), (e: any) => e.status === 403 && !e.uncertain);
});
test("429 retry-after and upstream secret redaction survive proxy", async () => {
  await assert.rejects(() => upstream("/images/generation/async", "test-key", body, async () => Response.json({ code: 1, message: "test-key busy" }, { status: 429, headers: { "Retry-After": "35" } })), (e: any) => e.status === 429 && e.retryAfter === 35 && !e.message.includes("test-key"));
});
test("download authenticates task before fetching result; never forwards key to image host", async () => {
  let calls = 0;
  const r = await handleAction("download", { taskId: "task-1", index: 0 }, "test-key", async (url, init) => {
    calls++;
    if (calls === 1) return envelope({ status: "success", images: [{ url: "https://assets.listenhub.app/result.png" }] });
    assert.equal(url, "https://assets.listenhub.app/result.png"); assert.equal(init?.headers, undefined);
    return new Response(new Uint8Array([1, 2, 3]), { headers: { "Content-Type": "image/png" } });
  });
  assert.equal(calls, 2); assert.equal(r.headers.get("Content-Type"), "image/png"); assert.deepEqual([...new Uint8Array(await r.arrayBuffer())], [1, 2, 3]);
  await assert.rejects(() => handleAction("download", { taskId: "../private" }, "test-key"), ApiError);
});
test("download rejects unsafe addresses", () => {
  for (const url of ["http://example.com/a", "https://127.0.0.1/a", "https://localhost/a", "https://a.internal/a", "https://a:b@example.com/a", "https://example.com:444/a"]) assert.throws(() => safeImageUrl(url), ApiError);
});
test("queue obeys concurrency and produces one task per requested copy", async () => {
  let active = 0, peak = 0, created = 0;
  const q = new ImageQueue([], async action => {
    if (action === "create") { active++; peak = Math.max(active, peak); return { taskId: `task-${++created}` }; }
    active--; return { status: "success", images: [{ url: "https://assets.listenhub.app/test.png" }] };
  }, () => {}, 0, tick);
  q.add(["A", "B", "C"], { ...DEFAULT_SETTINGS, copies: 2, concurrency: 2 });
  await until(() => q.jobs.every(j => j.status === "success")); assert.equal(created, 6); assert.equal(peak, 2);
});
test("pause stops subsequent submissions while submitted task finishes", async () => {
  let creates = 0;
  const q = new ImageQueue([], async action => action === "create" ? { taskId: `task-${++creates}` } : { status: "success", images: [{ url: "https://example.com/a.png" }] }, () => {}, 0, tick);
  q.add(["A", "B", "C"], { ...DEFAULT_SETTINGS, concurrency: 1 }); q.pause();
  await until(() => q.active.size === 0); assert.equal(creates, 1); assert.equal(q.jobs.filter(j => j.status === "paused").length, 2);
  q.resume(); await until(() => q.jobs.every(j => j.status === "success")); assert.equal(creates, 3);
});
test("refresh and resume query existing task ID without a new creation", async () => {
  const original: Job = { id: "one", batchId: "batch", sequence: 1, prompt: "A", settings: DEFAULT_SETTINGS, status: "generating", taskId: "exists", createdAt: 1 };
  const restored = restoreJobs([original]); assert.equal(restored[0].status, "paused");
  const q = new ImageQueue(restored, async (action, data) => { assert.equal(action, "task"); assert.deepEqual(data, { taskId: "exists" }); return { status: "success", images: [{ url: "https://example.com/a.png" }] }; }, () => {}, 0, tick);
  q.resume(); await until(() => q.jobs[0].status === "success");
  assert.equal(restoreJobs([{ ...original, status: "submitting", taskId: undefined }])[0].status, "unknown");
});
test("uncertain create pauses queue and cannot be retried automatically", async () => {
  let calls = 0;
  const q = new ImageQueue([], async () => { calls++; throw new ClientError("ambiguous", 502, true); }, () => {}, 0, tick);
  q.add(["A", "B"], { ...DEFAULT_SETTINGS, concurrency: 1 });
  await until(() => q.active.size === 0); assert.equal(calls, 1); assert.equal(q.jobs[0].status, "unknown"); assert.equal(q.jobs[1].status, "paused"); q.retry(q.jobs[0].id); assert.equal(calls, 1);
});
test("temporary poll failures re-query instead of re-creating; API fail is terminal", async () => {
  let creates = 0, polls = 0;
  const q = new ImageQueue([], async action => { if (action === "create") return { taskId: `task-${++creates}` }; if (++polls === 1) throw new ClientError("network", 502); return { status: "fail", failMsg: "model refused" }; }, () => {}, 0, tick);
  q.add(["A"], DEFAULT_SETTINGS); await until(() => q.jobs[0].status === "failed"); assert.equal(creates, 1); assert.equal(polls, 2); assert.equal(q.jobs[0].error, "model refused");
});
test("ZIP includes UTF-8 names and standard signatures; saved for independent reader", async () => {
  const zip = makeZip([{ name: "提示词.json", bytes: new TextEncoder().encode('{"prompt":"小狐狸"}') }, { name: "test.png", bytes: new Uint8Array([1, 2, 3]) }]);
  const bytes = new Uint8Array(await zip.arrayBuffer()); const view = new DataView(bytes.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50); assert.equal(view.getUint32(bytes.length - 22, true), 0x06054b50);
  mkdirSync(".sites-runtime", { recursive: true }); writeFileSync(".sites-runtime/zip-test.zip", bytes);
});
