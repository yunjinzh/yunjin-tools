import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.APP_URL || 'http://127.0.0.1:4173/yunjin-tools/';
const local = ['localhost', '127.0.0.1'].includes(new URL(base).hostname);
const out = process.env.QA_DIR || `/workspace/work/beijing-v1-${local ? 'local' : 'public'}`;
fs.mkdirSync(out, { recursive: true });
const checks = [], errors = [], failures = [], downloads = [];
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {})
});
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true, serviceWorkers: 'block' });
let page = await context.newPage();
function observe(p) {
  p.setDefaultTimeout(20000);
  p.on('pageerror', e => errors.push(e.message));
  p.on('response', r => { if (r.status() >= 400) failures.push({ url: r.url().replace(/\?.*$/, ''), status: r.status() }); });
  p.on('requestfailed', r => { if (r.failure()?.errorText !== 'net::ERR_ABORTED') failures.push({ url: r.url().replace(/\?.*$/, ''), error: r.failure()?.errorText }); });
}
observe(page);
context.on('page', observe);
const action = (panel, name) => page.locator(`#${panel}-panel [data-action="${name}"]`).first();
const check = text => { checks.push(text); console.log(text); };
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('beijing-nightline.v1')));
async function pause() {
  if (!await page.locator('#pause-panel').isVisible()) await page.keyboard.press('F2');
  await expect(page.locator('#pause-panel')).toBeVisible();
}
async function closePause() { await action('pause', 'close').click(); await expect(page.locator('#pause-panel')).toBeHidden(); }
async function importSave(value) {
  await pause();
  await page.locator('#save-file').setInputFiles({ name: 'synthetic-save.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
  await expect(page.locator('#toast')).toHaveText('存档已导入，继续你的北京之旅。');
}
async function exportSave(name) {
  await pause();
  const pending = page.waitForEvent('download');
  await action('pause', 'export').click();
  const download = await pending;
  expect(await download.failure()).toBeNull();
  expect(download.suggestedFilename()).toBe('京城夜行-存档.json');
  const file = path.join(out, name + '.json');
  await download.saveAs(file);
  const bytes = fs.readFileSync(file), saved = JSON.parse(bytes.toString());
  expect(saved).toEqual(await state());
  downloads.push({ name: download.suggestedFilename(), check: name, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
  return saved;
}
async function home() { await pause(); await action('pause', 'home').click(); await expect(page.locator('#home')).toBeVisible(); }
async function brake() {
  await page.keyboard.down('Space');
  try { await expect.poll(async () => Number(await page.locator('#speed').textContent()), { timeout: 30000 }).toBeLessThan(4); }
  finally { await page.keyboard.up('Space'); }
}
let fatal;
try {
  const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
  expect(response.ok()).toBeTruthy();
  const modules = JSON.parse(fs.readFileSync(path.join(root, 'modules.json')));
  await expect(page.locator('.card')).toHaveCount(modules.length);
  await page.locator('#search').fill('京城夜行');
  await expect(page.locator('.card')).toHaveCount(1);
  await expect(page.locator('.card')).toHaveAttribute('href', /apps\/m151\//);
  const portal = page, popup = context.waitForEvent('page');
  await portal.locator('.card').click();
  page = await popup;
  await page.bringToFront();
  await portal.close();
  await expect(page.locator('#load-state')).toContainText('场景准备就绪', { timeout: 45000 });
  await expect(page.locator('#fatal')).toBeHidden();
  expect(await page.locator('#scene').evaluate(c => !!(c.getContext('webgl2') || c.getContext('webgl')))).toBeTruthy();
  await page.screenshot({ path: path.join(out, 'home.png') });
  check('Portal entry and local Three.js modules load; WebGL scene renders without a fatal error');

  await page.locator('[data-start="roam"]').click();
  await expect(page.locator('#hud')).toBeVisible();
  await pause();
  await page.locator('#quality').selectOption('low');
  await page.locator('#touch-setting').selectOption('off');
  if ((await state()).settings.sound) await action('pause', 'sound').click();
  const fresh = await exportSave('initial');
  expect(fresh.cash).toBe(120);
  await closePause();
  await page.keyboard.press('e');
  await expect(page.locator('#speed-panel')).toBeVisible();
  await expect(page.locator('#vehicle-name')).toHaveText('京城 GT');
  await page.keyboard.down('w');
  try { await expect.poll(async () => Number(await page.locator('#speed').textContent()), { timeout: 30000 }).toBeGreaterThan(3); }
  finally { await page.keyboard.up('w'); }
  await brake();
  await page.keyboard.press('e');
  await expect(page.locator('#speed-panel')).toBeHidden();
  for (const label of ['第一人称', '俯视机位', '跟随机位']) {
    await page.keyboard.press('c'); await expect(page.locator('#toast')).toHaveText(label);
  }
  await page.keyboard.press('r');
  await expect(page.locator('#radio-name')).toContainText('胡同留声');
  await page.screenshot({ path: path.join(out, 'street.png') });
  check('Enter own car, accelerate, brake, exit, switch all three cameras and change radio');

  await page.keyboard.press('m');
  await expect(page.locator('#map-list [data-job]')).toHaveCount(6);
  await page.locator('[data-map-tab="places"]').click();
  await expect(page.locator('#map-list [data-place]')).toHaveCount(12);
  await page.locator('#map-list [data-place="forbidden"]').click();
  await expect(page.locator('#map-panel')).toBeHidden();
  await expect(page.locator('#navigation')).toBeVisible();
  await expect(page.locator('#radio-message')).toContainText('故宫');
  await page.keyboard.press('m');
  await page.locator('[data-map-tab="jobs"]').click();
  await page.locator('[data-job="race"]').click();
  await page.locator('[data-accept="race"]').click();
  await expect(page.locator('#mission-name')).toHaveText('二环夜跑');
  await expect(page.locator('#mission-step')).toContainText('1 / 9');
  await pause(); await action('pause', 'retry').click();
  await expect(page.locator('#mission-name')).toHaveText('二环夜跑');
  await pause(); await action('pause', 'cancel-job').click();
  await expect(page.locator('#mission-hud')).toBeHidden();
  check('Map lists six jobs and eleven landmarks plus garage; navigation, race acceptance, retry and cancellation work');

  await home(); await page.locator('[data-start="stealth"]').click();
  await expect(page.locator('#mission-name')).toHaveText('雨夜寻声');
  await expect(page.locator('#weather-label')).toHaveText('雨夜');
  await page.keyboard.press('q');
  await expect(page.locator('#stealth-meter span')).toHaveText('已蹲行');
  await home(); await page.locator('[data-start="ferry"]').click();
  await expect(page.locator('#mission-name')).toHaveText('什海夜渡');
  await expect(page.locator('#interaction span')).toContainText('收集磁带');
  await page.keyboard.press('e');
  await expect(page.locator('#toast')).toContainText('已收集《什海晚风》');
  await expect(page.locator('#interaction span')).toContainText('上船');
  await page.keyboard.press('e');
  await expect(page.locator('#vehicle-name')).toHaveText('什海游船');
  await expect(page.locator('#mission-progress')).toHaveText('阶段 2 / 4');
  await page.keyboard.down('w');
  try { await expect.poll(async () => Number(await page.locator('#speed').textContent()), { timeout: 30000 }).toBeGreaterThan(2); }
  finally { await page.keyboard.up('w'); }
  await brake(); await page.keyboard.press('e');
  await expect(page.locator('#speed-panel')).toBeHidden();
  check('Stealth starts in rain and supports crouching; ferry boarding advances stage and boat controls/shore exit work');

  await importSave({ ...fresh, cash: 120, position: { x: -18, z: -130 } });
  await closePause(); await page.keyboard.press('e');
  await expect(page.locator('#toast')).toContainText('已收集《胡同清晨》');
  const collected = await exportSave('tape');
  expect(collected.cash).toBe(165); expect(collected.tapes).toEqual(['tape-0']);
  await importSave({ ...fresh, cash: 2500, position: { x: -218, z: 110 } });
  await closePause(); await page.keyboard.press('e');
  await expect(page.locator('#garage-panel')).toBeVisible();
  await expect(page.locator('#paint-list button')).toHaveCount(5);
  await page.locator('[data-paint="1"]').click();
  for (let i = 1; i <= 3; i++) {
    await page.locator('#upgrade-button').click();
    await expect(page.locator('#upgrade-info')).toContainText(`当前 ${i} / 3 级`);
  }
  await expect(page.locator('#upgrade-button')).toBeDisabled();
  await action('garage', 'close').click();
  const upgraded = await exportSave('upgraded');
  expect(upgraded.cash).toBe(510); expect(upgraded.paint).toBe(1); expect(upgraded.upgrade).toBe(3);
  check('Synthetic save positions verify tape collection (+45), paint purchase and all three upgrades with correct balances');

  await importSave({ ...fresh, cash: 987, completed: ['handover', 'race'], tapes: ['tape-1', 'tape-3'], delivered: 4, bestRace: 62.5, upgrade: 2, paint: 3, position: { x: -18, z: 35 } });
  const restored = await exportSave('roundtrip');
  expect(restored.cash).toBe(987); expect(restored.completed).toEqual(['handover', 'race']); expect(restored.delivered).toBe(4);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('beijing-nightline.v1.previous')).cash)).toBe(510);
  await page.locator('#save-file').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"version":2}') });
  await expect(page.locator('#toast')).toContainText('无法读取存档');
  expect((await state()).cash).toBe(987);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#load-state')).toContainText('场景准备就绪', { timeout: 45000 });
  await expect(page.locator('#story-label')).toHaveText('继续故事');
  expect((await state()).cash).toBe(987);
  await page.bringToFront();
  await page.locator('[data-start="roam"]').click();
  // Software WebGL can take several seconds to draw its first frames after reload.
  await expect(page.locator('#cash')).toHaveText('¥987', { timeout: 45000 });
  const storageProbe = await context.newPage();
  await storageProbe.goto(base, { waitUntil: 'domcontentloaded' });
  const keys = await storageProbe.evaluate(() => Object.keys(localStorage));
  await storageProbe.close();
  await page.bringToFront();
  expect(keys).toContain('yunjin:m151:beijing-nightline.v1');
  expect(keys).not.toContain('beijing-nightline.v1');
  check('Actual JSON downloads match saved state; valid import, backup, invalid-import rejection, reload and module storage isolation pass');

  await pause();
  for (const quality of ['high', 'medium', 'low']) { await page.locator('#quality').selectOption(quality); expect((await state()).settings.quality).toBe(quality); }
  for (const hour of [22.1, 8, 17.4]) { await action('pause', 'day').click(); expect((await state()).hour).toBeCloseTo(hour, 0); }
  for (const weather of [1, 2, 0]) { await action('pause', 'weather').click(); expect((await state()).weather).toBe(weather); }
  await page.locator('#touch-setting').selectOption('on');
  await action('pause', 'help').click();
  await expect(page.locator('#help-panel')).toBeVisible();
  await action('help', 'close').click();
  await expect(page.locator('#pause-panel')).toBeVisible();
  await closePause();
  await expect(page.locator('#touch-controls')).toBeVisible();
  for (const [width, height] of [[844, 390], [390, 844], [360, 800]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const mapBounds = await page.locator('#map-button').boundingBox();
    const statusBounds = await page.locator('.top-status').boundingBox();
    const controlsBounds = await page.locator('.dpad').boundingBox();
    expect(mapBounds.y).toBeGreaterThanOrEqual(statusBounds.y + statusBounds.height);
    expect(mapBounds.y + mapBounds.height).toBeLessThanOrEqual(controlsBounds.y);
    await pause(); await expect(page.locator('#save-file')).toBeAttached(); await closePause();
    if (width > height) {
      await page.keyboard.press('m');
      await page.locator('[data-map-tab="jobs"]').click();
      await page.locator('[data-job="race"]').click();
      await page.locator('[data-accept="race"]').click();
      await expect(page.locator('#mission-hud')).toBeVisible();
      const missionBounds = await page.locator('#mission-hud').boundingBox();
      expect(missionBounds.x).toBeGreaterThanOrEqual(mapBounds.x + mapBounds.width);
      await page.screenshot({ path: path.join(out, 'mobile-landscape-mission.png') });
      await pause(); await action('pause', 'cancel-job').click();
    }
    await page.screenshot({ path: path.join(out, `mobile-${width}.png`) });
  }
  check('Quality, day/night, all weather states, help return, touch controls and three mobile viewports pass');
  expect(errors).toEqual([]); expect(failures).toEqual([]);
} catch (e) {
  fatal = e.stack || String(e);
  await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
} finally {
  await browser.close();
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ ok: !fatal, base, resourceSubstitution: false, checks, downloads, errors, failures, ...(fatal ? { error: fatal } : {}) }, null, 2) + '\n');
}
if (fatal) throw Error(fatal);
