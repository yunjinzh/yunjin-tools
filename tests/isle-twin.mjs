import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.APP_URL || 'http://127.0.0.1:4173/yunjin-tools/';
const out = process.env.QA_DIR || path.join(root, '../isle-v1-' + (base.startsWith('http://127.') ? 'local' : 'public'));
fs.mkdirSync(out, { recursive: true });
const expectedModules = JSON.parse(fs.readFileSync(path.join(root, 'modules.json')));
const report = { base, resourceSubstitution: false, checks: [], downloads: [], errors: [], failures: [] };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, acceptDownloads: true, serviceWorkers: 'block' });
function watch(page) {
  page.on('pageerror', e => report.errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) report.failures.push({ url: r.url().replace(/\?.*$/, ''), status: r.status() }); });
  page.on('requestfailed', r => { const error = r.failure()?.errorText; if (error !== 'net::ERR_ABORTED') report.failures.push({ url: r.url().replace(/\?.*$/, ''), error }); });
}
const page = await context.newPage(); watch(page);
const action = value => value === 'close' ? page.locator('#dialog [aria-label="关闭"]').click() : page.locator(`[data-act="${value}"]`).click();
const tab = value => page.locator(`[data-tab="${value}"]`).click();
const check = name => { report.checks.push(name); console.log(name); };
const project = async value => { await page.locator('#projectBtn').click(); await action(value); };
async function download(name, start) {
  const pending = page.waitForEvent('download', { timeout: 120000 });
  await start(); const item = await pending; const target = path.join(out, name);
  await item.saveAs(target); assert.equal(await item.failure(), null);
  const data = fs.readFileSync(target);
  report.downloads.push({ name, suggestedName: item.suggestedFilename(), bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex') });
  return target;
}
async function slider(selector, value) {
  await page.locator(selector).evaluate((element, next) => {
    element.value = String(next); element.dispatchEvent(new Event('input', { bubbles: true })); element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.card').count(), expectedModules.length);
  await page.locator('#search').fill('屿境');
  assert.equal(await page.locator('.card').count(), 1);
  assert.equal(await page.locator('.card').getAttribute('href'), 'apps/m150/index.html');
  check(`Portal: ${expectedModules.length} entries and exact new-tool search`);
  const response = await page.goto(new URL('apps/m150/index.html', base).href, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => S.objects.length === 92 && RESOURCES.length === 667 && document.querySelectorAll('.frameCard').length === 4);
  report.renderer = await page.evaluate(() => renderer.mode);
  report.resources = await page.evaluate(() => RESOURCES.reduce((groups, item) => { groups[item.group] = (groups[item.group] || 0) + 1; return groups; }, {}));
  await page.screenshot({ path: path.join(out, 'desktop.png') });
  check('Initial scene: 92 objects, 667 resources, four camera frames');

  for (const weather of ['cloud', 'rain', 'snow', 'fog', 'clear']) {
    await action('weather:' + weather); assert.equal(await page.evaluate(() => S.env.weather), weather);
  }
  await action('time:18'); assert.equal(await page.evaluate(() => S.env.time), 18);
  await action('cycle'); assert.equal(await page.evaluate(() => S.env.cycle), true);
  await action('cycle');
  await page.locator('#viewBtn').click(); await action('view:top');
  assert.equal(await page.evaluate(() => S.cam.pitch), 89);
  await page.locator('#viewHome').click();
  const span = await page.evaluate(() => S.cam.span); await page.locator('#zoomIn').click();
  assert.ok(await page.evaluate(() => S.cam.span) < span); await page.locator('#viewHome').click();
  check('Five weather modes, time/cycle controls, top/home camera and zoom');

  await tab('resource'); await action('ag:plant');
  await page.getByRole('textbox', { name: '搜索资源', exact: true }).fill('香樟');
  assert.equal(await page.locator('[data-asset]').count(), 3);
  await page.locator('[data-asset]').first().click();
  const canvas = await page.locator('#world').boundingBox();
  await page.mouse.click(canvas.x + canvas.width * .55, canvas.y + canvas.height * .64);
  assert.equal(await page.evaluate(() => S.objects.length), 93);
  await action('cancel'); await page.locator('#undo').click();
  assert.equal(await page.evaluate(() => S.objects.length), 92);
  await page.locator('#redo').click(); assert.equal(await page.evaluate(() => S.objects.length), 93);
  await tab('layers');
  const selected = await page.evaluate(() => S.objects.at(-1).id);
  await action('obj:' + selected);
  await page.locator('[data-field="obj.name"]').fill('同步验收植株');
  await page.locator('[data-field="obj.name"]').press('Tab');
  assert.equal(await page.evaluate(() => current().name), '同步验收植株');
  await action('dupeObj'); assert.equal(await page.evaluate(() => S.objects.length), 94);
  await action('deleteObj'); assert.equal(await page.evaluate(() => S.objects.length), 93);
  await page.locator('[data-field="layerFilter"]').selectOption('plant');
  await action('hideGroup'); assert.equal(await page.evaluate(() => S.objects.filter(o => o.group === 'plant' && o.visible !== false).length), 0);
  await action('showGroup'); assert.equal(await page.evaluate(() => S.objects.filter(o => o.group === 'plant' && o.visible !== false).length), 72);
  check('Resource search and placement, undo/redo, object rename/copy/delete, layer visibility');

  await tab('traffic');
  await slider('[data-range="route.speed"]', 35);
  assert.equal(await page.evaluate(() => S.route.speed), 35);
  await action('both'); assert.equal(await page.evaluate(() => S.route.both), true);
  await action('routeEdit');
  await page.locator('[data-field="nodeX0"]').fill('-65'); await action('saveNodes');
  assert.equal(await page.evaluate(() => S.route.points[0][0]), -65);
  await action('run'); assert.equal(await page.evaluate(() => S.route.run), false);
  check('Traffic speed, two-way lanes, route-node editing and pause');

  await tab('tour'); await page.locator('#addFrame').click();
  assert.equal(await page.locator('.frameCard').count(), 5);
  await page.locator('[data-field="frame.name"]').fill('同步验收视点');
  await page.locator('[data-field="frame.name"]').press('Tab');
  await action('prevFrame');
  assert.equal(await page.evaluate(() => S.frames[3].name), '同步验收视点');
  await page.locator('#playBtn').click(); assert.equal(await page.evaluate(() => !!playing), true);
  await page.keyboard.press('Escape'); assert.equal(await page.evaluate(() => playing), null);
  check('Camera frame creation, naming, reordering and tour playback/stop');

  await project('save');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem(STORE)));
  const projectFile = await download('project.twin.json', () => project('projectOut'));
  assert.deepEqual(JSON.parse(fs.readFileSync(projectFile)), saved);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => S.objects.length), 93);
  assert.equal(await page.evaluate(() => S.route.speed), 35);
  const raw = await context.newPage(); await raw.goto(base);
  assert.equal(await raw.evaluate(() => localStorage.getItem('isle-twin-project-1')), null);
  assert.equal(JSON.parse(await raw.evaluate(() => localStorage.getItem('yunjin:m150:isle-twin-project-1'))).objects.length, 93);
  await raw.close();
  await tab('traffic'); await slider('[data-range="route.speed"]', 50);
  await project('projectIn'); await page.locator('#fileInput').setInputFiles(projectFile);
  await page.waitForFunction(() => S.route.speed === 35);
  check('Actual JSON download, reload persistence, module storage namespace and project restoration');

  await tab('resource'); await action('importAsset');
  await page.locator('#fileInput').setInputFiles({ name: 'sync-triangle.obj', mimeType: 'text/plain', buffer: Buffer.from('v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n') });
  await page.waitForFunction(() => S.custom.some(x => x.name === 'sync-triangle'));
  const assetFile = await download('synthetic.asset.json', () => action('assetOut'));
  const asset = JSON.parse(fs.readFileSync(assetFile)); assert.equal(asset.parts[0].vertices.length, 3); assert.equal(asset.parts[0].faces.length, 1);
  check('Synthetic OBJ import and actual resource JSON export');

  await tab('tour');
  while (await page.locator('.frameCard').count() > 1) await action('deleteFrame');
  await slider('[data-range="frame.duration"]', 1);
  await page.locator('#exportBtn').click();
  await page.locator('[data-field="exportSize"]').selectOption('1280');
  await page.locator('[data-field="exportFPS"]').selectOption('12');
  const videoFile = await download('tour.webm', () => action('beginExport'));
  assert.ok(fs.statSync(videoFile).size > 1000);
  const videoInfo = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height', '-of', 'json', videoFile], { encoding: 'utf8' }));
  assert.equal(videoInfo.streams[0].codec_name, 'vp8'); assert.equal(videoInfo.streams[0].width, 1280); assert.equal(videoInfo.streams[0].height, 720);
  assert.ok(Math.abs(Number(videoInfo.format.duration) - 1) < .1);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', videoFile, '-frames:v', '1', path.join(out, 'video-frame.png')]);
  report.video = videoInfo; await action('close');
  check('Actual 720p/12 fps WebM export, VP8 metadata and frame decoding');

  const zip = await download('isle-twin-offline.zip', () => project('offline'));
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex'), '976ebd9338741903e8a867d2ce372d6cc96c48949537da6b0944bc09721807a8');
  execFileSync('python', ['-c', 'import sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); assert z.namelist()==["isle-twin-studio.html"]; assert z.testzip() is None; z.extractall(sys.argv[2])', zip, out]);
  const offlineContext = await browser.newContext({ offline: true, viewport: { width: 1440, height: 960 } });
  const offline = await offlineContext.newPage(); watch(offline); const external = [];
  offline.on('request', r => { if (/^https?:/.test(r.url())) external.push(r.url()); });
  // Managed Chromium disallows file:// navigation. Execute the downloaded bytes
  // in an isolated document with networking disabled; never replace online URLs.
  await offline.setContent(fs.readFileSync(path.join(out, 'isle-twin-studio.html'), 'utf8'), { waitUntil: 'load' });
  report.offlineDocumentMode = 'Downloaded HTML in isolated network-disabled document; file:// navigation unavailable in managed Chromium';
  await offline.waitForFunction(() => window.IS_OFFLINE && S.objects.length === 92 && RESOURCES.length === 667);
  await offline.locator('[data-act="weather:rain"]').click(); assert.equal(await offline.evaluate(() => S.env.weather), 'rain');
  await offline.locator('#addFrame').click(); assert.equal(await offline.locator('.frameCard').count(), 5);
  assert.deepEqual(external, []); await offline.screenshot({ path: path.join(out, 'offline.png') });
  await offlineContext.close();
  check('Actual offline ZIP checksum, extraction and network-disabled single-file editing');

  await tab('environment');
  for (const width of [768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`);
    await page.locator('#helpBtn').click(); assert.ok(await page.locator('#dialog').isVisible()); await action('close');
  }
  await page.screenshot({ path: path.join(out, 'mobile.png'), fullPage: true });
  check('Tablet/mobile layouts at 768, 390 and 360 pixels; help dialog remains usable');
  assert.deepEqual(report.errors, []); assert.deepEqual(report.failures, []);
  report.ok = true;
} catch (error) {
  report.ok = false; report.error = error.stack; console.error(error);
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close(); fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(report, null, 2));
}
