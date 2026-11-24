import { chromium, expect as baseExpect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const expect = baseExpect.configure({ timeout: 45000 });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.APP_URL || 'http://127.0.0.1:4173/yunjin-tools/';
const local = ['localhost', '127.0.0.1'].includes(new URL(base).hostname);
const out = process.env.QA_DIR || path.join(root, 'test-results', `claymotion-${local ? 'local' : 'public'}`);
fs.mkdirSync(out, { recursive: true });
const checks = [], errors = [], failures = [], requests = [];
const result = { base, localAssets: local, checks, errors, failures };
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {})
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, serviceWorkers: 'block' });
// The local run resolves not-yet-published repository assets only. Public runs
// have no route handlers and exercise the actual HTTPS resources.
if (local) await context.route('https://raw.githubusercontent.com/yunjinzh/yunjin-tools/main/assets/**', route => {
  const file = path.join(root, 'assets', path.basename(new URL(route.request().url()).pathname));
  return fs.existsSync(file) ? route.fulfill({ path: file, headers: { 'Access-Control-Allow-Origin': '*' } }) : route.abort();
});
const page = await context.newPage();
page.setDefaultTimeout(45000);
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.status() >= 400 && /^https?:/.test(r.url())) failures.push({ url: r.url(), status: r.status() }); });
page.on('request', r => requests.push(r.url()));
page.on('requestfailed', r => { if (/^https?:/.test(r.url()) && r.failure()?.errorText !== 'net::ERR_ABORTED') failures.push({ url: r.url(), error: r.failure()?.errorText }); });
const check = message => { checks.push(message); console.log(message); };
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
async function storedMotion() {
  return page.evaluate(async () => {
    const db = await new Promise((ok, no) => { const r = indexedDB.open('motion-atelier-v1', 1); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
    try { return await new Promise((ok, no) => { const r = db.transaction('current').objectStore('current').get('motion'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }); }
    finally { db.close(); }
  });
}
async function ready() {
  await page.waitForFunction(() => ['白模视频已就绪', '处理未完成', '示例读取失败'].includes(document.querySelector('#status').textContent), null, { timeout: 360000 });
  expect(await page.locator('#status').innerText(), await page.locator('#detail').innerText()).toBe('白模视频已就绪');
  await expect(page.locator('#download')).toBeVisible();
}
async function downloadVideo(name, audio) {
  const event = page.waitForEvent('download'); await page.locator('#download').click();
  const file = await event, target = path.join(out, name); await file.saveAs(target);
  const bytes = fs.readFileSync(target);
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'format=duration:stream=codec_name,codec_type,width,height,nb_read_frames', '-of', 'json', target], { encoding: 'utf8' }));
  const video = probe.streams.find(s => s.codec_type === 'video');
  expect(video.codec_name).toBe('h264'); expect(video.width).toBe(480); expect(video.height).toBe(360);
  expect(Number(video.nb_read_frames)).toBe(86); expect(Math.abs(Number(probe.format.duration) - 3.44)).toBeLessThan(.06);
  expect(probe.streams.some(s => s.codec_type === 'audio')).toBe(audio);
  execFileSync('ffmpeg', ['-v', 'error', '-i', target, '-f', 'null', '-'], { stdio: 'pipe' });
  return { bytes: bytes.length, sha256: digest(bytes), suggestedFilename: file.suggestedFilename(), probe };
}
let fatal;
try {
  const response = await page.goto(base, { waitUntil: 'domcontentloaded' }); expect(response.ok()).toBeTruthy();
  await expect(page.locator('.card')).toHaveCount(JSON.parse(fs.readFileSync(path.join(root, 'modules.json'))).length);
  await page.locator('#search').fill('白模动作工坊'); await expect(page.locator('.card')).toHaveCount(1);
  await expect(page.locator('.card')).toHaveAttribute('href', /apps\/m153\//);
  await page.goto(new URL('apps/m153/index.html', base).href, { waitUntil: 'networkidle' });
  await expect(page.locator('#runtime')).toContainText('本机处理');
  expect(await page.evaluate(() => document.querySelector('#art').width)).toBeGreaterThan(0);
  await page.locator('#play').click(); await page.waitForTimeout(450); await page.locator('#play').click();
  await page.screenshot({ path: path.join(out, 'home.png'), fullPage: true });
  await page.locator('#helpBtn').click(); await expect(page.locator('#helpstorage')).toContainText('关闭后暂停');
  const packageEvent = page.waitForEvent('download'); await page.locator('#serverDownload').click();
  const packageDownload = await packageEvent; const packageFile = path.join(out, 'motion-atelier-server.zip'); await packageDownload.saveAs(packageFile);
  result.package = { bytes: fs.statSync(packageFile).size, sha256: digest(fs.readFileSync(packageFile)), suggestedFilename: packageDownload.suggestedFilename() };
  expect(result.package.bytes).toBe(5810642); expect(result.package.sha256).toBe('70d2e03008df74b07d0fb5ae65faf6f8b2b0b35bfa13ae79bafe0d00d8453db2');
  execFileSync('python', ['-m', 'zipfile', '-t', packageFile], { stdio: 'pipe' });
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  check('Portal search, initial model preview, local-processing notice and actual server ZIP download/checksum pass');

  await page.locator('#sample').click();
  await page.waitForFunction(() => document.querySelector('#status').textContent === '正在提取人物动作', null, { timeout: 180000 });
  await page.locator('#cancel').click(); await expect(page.locator('#status')).toHaveText('任务已暂停');
  const paused = await storedMotion(); expect(paused.frames.length).toBeGreaterThan(0);
  await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.locator('#status')).toHaveText('任务已暂停');
  const recovered = await storedMotion(); expect(recovered.frames).toEqual(paused.frames);
  await page.locator('#retry').click(); await ready();
  const motion = await storedMotion(); expect(motion.complete).toBeTruthy(); expect(motion.frames).toHaveLength(86);
  expect(motion.frames.filter(f => f.p).length).toBeGreaterThan(70);
  expect(motion.frames.at(-1).t).toBeCloseTo(3.40, 2);
  result.motion = { frames: motion.frames.length, detected: motion.frames.filter(f => f.p).length, pausedFrames: paused.frames.length, sha256: digest(JSON.stringify(motion.frames)) };
  result.originalExport = await downloadVideo('white-with-audio.mp4', true);
  const originalSettings = await page.evaluate(() => ({ bg: document.querySelector('#bg').value, size: document.querySelector('#size').value, audio: document.querySelector('#audio').checked }));
  await expect(page.locator('#workspace')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('#workspace')).toHaveAttribute('data-download-ready', 'true');
  await page.locator('#helpBtn').click(); await page.locator('#stateInspector summary').click();
  await expect(page.locator('#stateInfo')).toContainText('"phase"');
  const snapshot = JSON.parse(await page.locator('#stateInfo').innerText());
  expect(snapshot.phase).toBe('ready'); expect(snapshot.checkpoint).toBe('complete'); expect(snapshot.downloadReady).toBeTruthy();
  expect(snapshot.actions).toContain('download');
  expect(await page.locator('#stateInspector a').evaluate(a => a.href)).toBe(new URL('apps/m153/workflow-audit.md', base).href);
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.screenshot({ path: path.join(out, 'converted.png'), fullPage: true });
  check('Real sample extraction, pause/reload/resume, 86-frame tracking and decoded H.264/AAC output pass');

  await page.locator('#next').click(); expect(await page.locator('#seek').inputValue()).not.toBe('0');
  await page.locator('#prev').click(); expect(Number(await page.locator('#seek').inputValue())).toBe(0);
  await page.locator('#rate').selectOption('.5');
  await page.locator('#play').click(); await page.waitForFunction(() => document.querySelector('#result').currentTime > .15); await page.locator('#play').click();
  const times = await page.evaluate(() => [document.querySelector('#original').currentTime, document.querySelector('#result').currentTime]);
  expect(Math.abs(times[0] - times[1])).toBeLessThan(.20);
  await page.locator('#bg').selectOption('slate'); await page.locator('#size').selectOption('480'); await page.locator('#audio').uncheck();
  await expect(page.locator('#status')).toHaveText('输出设置已更改'); await expect(page.locator('#download')).toBeHidden();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#status')).toHaveText('输出设置已更改'); await expect(page.locator('#download')).toBeHidden();
  await expect(page.locator('#workspace')).toHaveAttribute('data-phase', 'changed');
  expect(digest(JSON.stringify((await storedMotion()).frames))).toBe(result.motion.sha256);
  await page.locator('#bg').selectOption(originalSettings.bg); await page.locator('#size').selectOption(originalSettings.size); await page.locator('#audio').setChecked(originalSettings.audio);
  await ready(); result.restoredExport = await downloadVideo('restored-with-audio.mp4', true);
  expect(result.restoredExport.sha256).toBe(result.originalExport.sha256);
  check('v3 state inspector agrees with the UI; changed settings survive reload and reverting settings restores the identical export');
  await page.locator('#bg').selectOption('slate'); await page.locator('#size').selectOption('480'); await page.locator('#audio').uncheck();
  await page.locator('#retry').click(); await ready();
  const reused = await storedMotion(); expect(digest(JSON.stringify(reused.frames))).toBe(result.motion.sha256);
  result.mutedExport = await downloadVideo('white-muted.mp4', false); expect(result.mutedExport.sha256).not.toBe(result.originalExport.sha256);
  await page.reload({ waitUntil: 'domcontentloaded' }); await ready();
  await expect(page.locator('#bg')).toHaveValue('slate'); await expect(page.locator('#audio')).not.toBeChecked();
  expect((await page.evaluate(() => indexedDB.databases())).some(d => d.name === 'yunjin:m153:motion-atelier-v1')).toBeTruthy();
  check('Synchronized playback, frame stepping, color/size/mute re-export without re-extraction and persisted result pass');
  const existingDownload = await page.locator('#download').getAttribute('href');
  const rejectedFile = page.waitForEvent('dialog').then(async dialog => { expect(dialog.message()).toContain('大于 0 字节'); await dialog.accept(); });
  await page.locator('#file').setInputFiles({ name: 'empty.mp4', mimeType: 'video/mp4', buffer: Buffer.alloc(0) }); await rejectedFile;
  await expect(page.locator('#status')).toHaveText('白模视频已就绪');
  expect(await page.locator('#download').getAttribute('href')).toBe(existingDownload);
  expect(digest(JSON.stringify((await storedMotion()).frames))).toBe(result.motion.sha256);
  check('Rejecting an empty import preserves the existing task, extracted motion and ready download');

  for (const [width, height] of [[390,844], [360,800], [844,390]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await expect(page.locator('#download')).toBeVisible(); await page.screenshot({ path: path.join(out, `layout-${width}.png`), fullPage: true });
  }
  check('390px, 360px and landscape layouts have no horizontal overflow and retain export controls');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('#helpBtn').click();
  const cleared = page.waitForEvent('load'); await page.locator('#clear').click(); await cleared;
  await expect(page.locator('#workspace')).toHaveAttribute('data-phase', 'idle');
  await expect(page.locator('#study')).toBeVisible();
  await expect(page.locator('#jobpanel')).toBeHidden(); expect(await storedMotion()).toBeUndefined();
  await page.locator('#file').setInputFiles({ name: 'invalid.mp4', mimeType: 'video/mp4', buffer: Buffer.from('not a video') });
  await expect(page.locator('#status')).toHaveText('处理未完成'); await expect(page.locator('#retry')).toBeVisible();
  check('Clearing the isolated test task restores the empty workspace; invalid input gives a recoverable error');
  expect(requests.some(url => /\/api\/jobs/.test(url))).toBeFalsy();
  expect(errors).toEqual([]); expect(failures).toEqual([]);
  result.ok = true;
} catch (error) {
  fatal = error; result.ok = false; result.error = error.stack;
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {});
  result.visibleStatus = await page.locator('#status').innerText().catch(() => null);
  result.visibleDetail = await page.locator('#detail').innerText().catch(() => null);
} finally {
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2));
  await browser.close();
}
if (fatal) throw fatal;
