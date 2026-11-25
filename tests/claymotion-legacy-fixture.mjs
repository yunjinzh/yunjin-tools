// Create a regression fixture from the built-in sample in an isolated v3 browser.
// No existing browser profile or user task is read.
import { chromium, expect as baseExpect } from '@playwright/test';
import fs from 'node:fs';
import crypto from 'node:crypto';

const base = process.env.LEGACY_URL;
const output = process.env.LEGACY_FIXTURE;
if (!base || !output) throw Error('Set LEGACY_URL to a v3 m153 entry and LEGACY_FIXTURE to a temporary JSON file');
const expect = baseExpect.configure({ timeout: 45000 });
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {}) });
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const response = await page.request.get(new URL('app.mjs', base).href);
  expect(response.ok()).toBeTruthy();
  // Exact v3 source and the verified v3 Pages build, whose literals are rebased.
  expect(['e8a484202a0b6102688716c2da68d5dc52c9b839602110e34fc0ce129d87925b',
    '68dbace95484e85691f9018fbf10f25f96603e01c72413a9c7aef7f38f3d521c']).toContain(digest(await response.body()));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('#sample').click();
  await page.waitForFunction(() => ['白模视频已就绪', '处理未完成'].includes(document.querySelector('#status').textContent), null, { timeout: 360000 });
  await expect(page.locator('#status')).toHaveText('白模视频已就绪');
  const data = await page.evaluate(async () => {
    const db = await new Promise((ok, no) => { const r = indexedDB.open('motion-atelier-v1', 1); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
    const get = key => new Promise((ok, no) => { const r = db.transaction('current').objectStore('current').get(key); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
    const [job, settings, motion, result] = await Promise.all(['job', 'settings', 'motion', 'result'].map(get)); db.close();
    async function pack(blob) { const bytes = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768)); return { base64: btoa(s), type: blob.type }; }
    return { job: { name: job.name, file: await pack(job.file) }, settings, motion, result: { settings: result.settings, out: await pack(result.out) } };
  });
  expect(data.motion.complete).toBeTruthy(); expect(data.motion.frames).toHaveLength(86);
  expect(data.motion.frames.filter(f => f.p).every(f => f.p.every(p => p.length === 4))).toBeTruthy();
  const fixture = { schema: 1, source_version: 3, source_commit: 'fdc2a00fe05c07d5b22a043138f234277300236c', source_entry: base,
    generated_from_builtin_sample: true, motion_sha256: digest(JSON.stringify(data.motion.frames)), output_sha256: digest(Buffer.from(data.result.out.base64, 'base64')), ...data };
  fs.writeFileSync(output, JSON.stringify(fixture));
  console.log(JSON.stringify({ ok: true, source_version: 3, frames: 86, motion_sha256: fixture.motion_sha256, output_sha256: fixture.output_sha256 }));
} finally { await browser.close(); }
