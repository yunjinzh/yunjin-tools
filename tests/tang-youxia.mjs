import { chromium, expect as baseExpect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const expect = baseExpect.configure({ timeout: 30000 });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.APP_URL || 'http://127.0.0.1:4173/yunjin-tools/';
const local = ['localhost', '127.0.0.1'].includes(new URL(base).hostname);
const out = process.env.QA_DIR || path.join(root, 'test-results', `tang-youxia-${local ? 'local' : 'public'}`);
fs.mkdirSync(out, { recursive: true });
const checks = [], errors = [], failures = [];
const result = { base, resourceSubstitution: false, diagnosticsReadOnly: true, simulationStepping: false, checks, errors, failures };
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {})
});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, serviceWorkers: 'block' });
let page = await context.newPage();
function observe(p) {
  p.setDefaultTimeout(45000);
  p.on('pageerror', e => errors.push(e.message));
  p.on('response', r => { if (r.status() >= 400 && /^https?:/.test(r.url())) failures.push({ url: r.url().replace(/\?.*$/, ''), status: r.status() }); });
  p.on('requestfailed', r => { if (/^https?:/.test(r.url()) && r.failure()?.errorText !== 'net::ERR_ABORTED') failures.push({ url: r.url().replace(/\?.*$/, ''), error: r.failure()?.errorText }); });
}
observe(page); context.on('page', observe);
const probe = () => page.evaluate(() => window.trailProbe.state());
const button = name => page.getByRole('button', { name, exact: true });
const check = text => { checks.push(text); console.log(text); };
async function travel(title) {
  await page.locator('#guide').click();
  await expect(page.locator('#modal')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('#mTitle')).toHaveText(title);
}
async function enter(title, continuation = false) {
  await expect(page.locator('#mTitle')).toHaveText(title);
  await button(continuation ? '从上个路标继续' : '进入此关').click();
  await expect(page.locator('#game')).toBeVisible();
  await expect(page.locator('#jtitle')).toHaveText(title);
  expect((await probe()).renderer).toBe('WebGL');
}
async function next(title) { await button('前往' + title).click(); await enter(title); }
async function fight(boss = false) {
  let phaseSeen = false, attempts = 0;
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    const s = await probe();
    if (s.kind === 'victory') break;
    expect(s.kind).not.toBe('loss');
    phaseSeen ||= !!s.e?.phase;
    await page.locator('#guide').click();
    await page.keyboard.press('j');
    attempts++;
    await page.waitForTimeout(360);
  }
  await expect(page.locator('#mTitle')).toHaveText(boss ? '墨散信全' : '墨退柳青');
  if (boss) expect(phaseSeen).toBeTruthy();
  await button('继续送信').click();
  return { attempts, phaseSeen };
}
async function completed(index) {
  await expect.poll(async () => (await probe()).save.done).toContain(index);
  expect((await probe()).save.steps[index]).toBeUndefined();
}
let fatal;
try {
  const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
  expect(response.ok()).toBeTruthy();
  const modules = JSON.parse(fs.readFileSync(path.join(root, 'modules.json')));
  await expect(page.locator('.card')).toHaveCount(modules.length);
  await page.locator('#search').fill('仗剑入唐');
  await expect(page.locator('.card')).toHaveCount(1);
  await expect(page.locator('.card')).toHaveAttribute('href', /apps\/m152\//);
  const portal = page, popup = context.waitForEvent('page');
  await portal.locator('.card').click(); page = await popup;
  await portal.close(); await page.bringToFront();
  await expect(page.locator('#cards .card')).toHaveCount(3);
  await page.goto(new URL('apps/m152/index.html?diagnostics=1', base).href, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.trailProbe);
  await expect(page.locator('#homeProgress')).toHaveText('已收录 0 / 6 首');
  result.images = await page.evaluate(async () => {
    return Promise.all([COVER, ...ART].map(async src => { const image = new Image(); image.src = src; await image.decode(); return { width: image.naturalWidth, height: image.naturalHeight }; }));
  });
  expect(result.images).toHaveLength(7);
  expect(result.images.every(i => i.width > 0 && i.height > 0)).toBeTruthy();
  await page.locator('#soundBtn').click(); expect((await probe()).save.sound).toBeTruthy();
  await page.locator('#soundBtn').click(); expect((await probe()).save.sound).toBeFalsy();
  await page.locator('[data-act="book"]').click();
  await expect(page.locator('.bookRow:disabled')).toHaveCount(6);
  await button('返回行卷').click();
  await page.screenshot({ path: path.join(out, 'home.png') });
  check('Portal search, three volumes, seven embedded images, music toggle and six initially locked poem cards pass');

  await page.locator('#continue').click(); await enter('渭城折柳');
  const before = (await probe()).p.x;
  await page.keyboard.down('ArrowLeft');
  try { await expect.poll(async () => (await probe()).p.x).toBeLessThan(before - .3); }
  finally { await page.keyboard.up('ArrowLeft'); }
  const dashBefore = (await probe()).p.x;
  await page.keyboard.down('ArrowRight'); await page.keyboard.press('k');
  try { await expect.poll(async () => (await probe()).p.x).toBeGreaterThan(dashBefore + .5); }
  finally { await page.keyboard.up('ArrowRight'); }
  await page.locator('[data-act="pause"]').click();
  await button('查看本关唐诗').click();
  await expect(page.locator('#mTitle')).toHaveText('送元二使安西');
  await button('返回途中').click(); await button('继续行旅').click();
  await travel('驿卒'); await button('接下嘱托').click();
  expect((await probe()).save.steps[0]).toBe(1);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.bringToFront();
  await page.waitForFunction(() => !!window.trailProbe);
  expect((await probe()).save.steps[0]).toBe(1);
  await page.locator('#continue').click(); await enter('渭城折柳', true);
  await expect(page.locator('#progress')).toHaveText('路标 2 / 3');
  check('WebGL scene, keyboard movement, dash, pause/poem help and real reload recovery at a completed checkpoint pass');

  await travel('折柳寄远');
  await button('一枚青石').click();
  await expect(page.locator('.feedback')).toContainText('再想想');
  expect((await probe()).step).toBe(1);
  await button('一枝新柳').click(); await button('收好心意').click();
  await button('前去护送').click(); result.firstFight = await fight();
  await travel('西行客'); await button('递上柳枝').click(); await completed(0);
  await expect(page.locator('.poem')).toContainText('劝君更尽一杯酒');
  check('Weicheng: wrong-choice feedback, willow selection, actual sword encounter and first poem reward pass');

  await next('鹳楼望渡'); await travel('摆渡翁'); await button('沿堤登楼').click();
  await travel('凭栏远望');
  for (let i = 0; i < 3; i++) await button('更上一层').click();
  await expect(page.locator('.stair .on')).toHaveCount(4);
  await expect(page.locator('.feedback')).toContainText('最高层');
  await button('记下新渡的位置').click(); await travel('新渡船家'); await button('系好渡绳').click(); await completed(1);
  check('Guanque Tower: all three climbs, new-ferry discovery and poem reward pass');

  await next('峨眉寻月'); await travel('月下石'); await button('收起舆图').click();
  await travel('重排水程'); await button('渝州').click();
  await expect(page.locator('.feedback')).toContainText('看动词');
  for (const name of ['清溪', '三峡', '渝州']) await button(name).click();
  await expect(page.locator('.feedback')).toContainText('清溪　→　三峡　→　渝州');
  await button('收好水程图').click(); await travel('艄公'); await button('推舟启程').click(); await completed(2);
  check('Emei: incorrect route rejection, Qingxi–Three Gorges–Yuzhou ordering and poem reward pass');

  await next('白帝飞舟'); await travel('送药人'); await button('接过药匣').click();
  await travel('轻舟出峡'); await button('解缆开船').click();
  await expect(page.locator('.feedback')).toContainText('擦过浅滩', { timeout: 30000 });
  expect((await probe()).mini.gate).toBe(0);
  await button('左移').click();
  await expect.poll(async () => (await probe()).mini?.gate, { timeout: 30000 }).toBe(1);
  await button('右移').click(); await button('右移').click();
  await expect.poll(async () => (await probe()).mini?.gate, { timeout: 30000 }).toBe(2);
  await button('左移').click(); await button('泊舟交药').click();
  await travel('江陵医者'); await button('交付药匣').click(); await completed(3);
  check('Baidi boat: a missed gate preserves progress; all three real-time water gates and medicine delivery pass');

  await next('枫桥听钟'); await travel('老船工'); await button('去寻钟亭').click();
  await travel('夜半三钟');
  await button('敲钟').focus();
  await page.waitForFunction(() => window.trailProbe.state().mini?.pos < .2);
  await page.keyboard.press('Space'); await expect(page.locator('.feedback')).toContainText('这一拍偏了');
  result.bellAttempts = [];
  for (let attempt = 0; attempt < 12 && !await button('去接客船').isVisible(); attempt++) {
    await page.waitForTimeout(320);
    await page.waitForFunction(() => { const p = window.trailProbe.state().mini?.pos; return p > .47 && p < .65; });
    // A locator click waits for stable frames; use the already focused native
    // button's keyboard activation to avoid adding delay to this timing puzzle.
    await page.keyboard.press('Space');
    result.bellAttempts.push(await page.locator('.feedback').innerText());
  }
  await button('去接客船').click(); await travel('夜泊客'); await button('接住缆绳').click(); await completed(4);
  check('Fengqiao bell: mistimed input and three correctly timed bells lead to the passenger boat and fifth poem');

  await next('芙蓉寄心'); await travel('托信人'); await button('收入信囊').click();
  await travel('护住书信'); await button('守住信囊').click();
  await expect.poll(async () => (await probe()).kind, { timeout: 90000, intervals: [500] }).toBe('loss');
  await expect(page.locator('#mTitle')).toHaveText('暂避锋芒');
  await button('整装再战').click(); expect((await probe()).p.hp).toBe(5);
  result.bossFight = await fight(true);
  await travel('洛阳来客'); await button('轻舟已过万重山').click();
  await expect(page.locator('.feedback')).toContainText('再想想');
  await button('一片冰心在玉壶').click(); await button('收好心意').click(); await completed(5);
  await expect(page.locator('#mTitle')).toHaveText('山河有信，江湖有诗');
  expect((await probe()).save.done).toEqual([0, 1, 2, 3, 4, 5]);
  await page.screenshot({ path: path.join(out, 'complete.png') });
  await button('展开六首诗笺').click(); await expect(page.locator('.bookRow:enabled')).toHaveCount(6);
  for (const poem of ['送元二使安西', '登鹳雀楼', '峨眉山月歌', '早发白帝城', '枫桥夜泊', '芙蓉楼送辛渐']) {
    await page.locator('.bookRow').filter({ hasText: poem }).click();
    await expect(page.locator('#mTitle')).toHaveText(poem);
    await expect(page.locator('.poem')).toContainText('〔唐〕');
    await button('返回诗笺').click();
  }
  await button('返回行卷').click();
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.bringToFront();
  await expect(page.locator('#homeProgress')).toHaveText('已收录 6 / 6 首');
  await expect(page.locator('#continue')).toHaveText('重游江湖');
  check('Furong: defeat/retry, two-phase boss combat, correct letter answer, all six poem cards and full-progress reload pass');

  const storagePage = await context.newPage(); await storagePage.goto(base);
  const keys = await storagePage.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain('yunjin:m152:tang-youxia-1'); expect(keys).not.toContain('tang-youxia-1');
  await storagePage.close(); await page.bringToFront();
  // Carry only this test's completed save into a real touch-emulated context.
  // Resizing a desktop page alone does not enable the coarse-pointer joystick.
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    acceptDownloads: true, serviceWorkers: 'block', storageState: await context.storageState()
  });
  await page.close(); page = await mobile.newPage(); observe(page);
  await page.goto(new URL('apps/m152/index.html?diagnostics=1', base).href, { waitUntil: 'domcontentloaded' });
  await page.bringToFront();
  expect(await page.evaluate(() => matchMedia('(pointer:coarse)').matches)).toBeTruthy();
  const touch = await mobile.newCDPSession(page);
  for (const [width, height] of [[390, 844], [360, 800], [844, 390]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.locator('#cards .card').first().click();
    await page.locator('.chapters button').first().click();
    await enter('渭城折柳');
    for (const selector of ['#guide', '#stick', '[data-act="pause"]', '[data-act="attack"]']) {
      const b = await page.locator(selector).boundingBox();
      expect(b.x).toBeGreaterThanOrEqual(0); expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(width + 1); expect(b.y + b.height).toBeLessThanOrEqual(height + 1);
    }
    if (width === 390) {
      const b = await page.locator('#stick').boundingBox(), x = (await probe()).p.x;
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }] });
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: b.x + b.width - 4, y: b.y + b.height / 2 }] });
      try { await expect.poll(async () => (await probe()).p.x).toBeGreaterThan(x + .3); }
      finally { await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    }
    await page.screenshot({ path: path.join(out, `mobile-${width}.png`) });
    await page.locator('[data-act="pause"]').click(); await button('继续行旅').click();
    await page.locator('[data-act="pause"]').click(); await button('返回行卷').click();
  }
  expect((await probe()).save.done).toHaveLength(6);
  check('Module-specific storage, replay without duplicate rewards, joystick movement and three mobile viewports pass');

  const pending = page.waitForEvent('download');
  await page.locator('[data-act="offline"]').click();
  const download = await pending; expect(await download.failure()).toBeNull();
  expect(download.suggestedFilename()).toBe('仗剑入唐_离线版.html');
  const file = path.join(out, 'tang-youxia-offline.html'); await download.saveAs(file);
  const bytes = fs.readFileSync(file), original = fs.readFileSync(path.join(root, 'sources/m152/dist/index.html'));
  expect(bytes.equals(original)).toBeTruthy();
  result.download = { filename: download.suggestedFilename(), bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
  const html = bytes.toString(); expect(html.includes('migration-config.js')).toBeFalsy();
  expect(/<script[^>]+src=/i.test(html)).toBeFalsy();
  const offline = await browser.newContext({ viewport: { width: 1000, height: 800 }, serviceWorkers: 'block' });
  await offline.setOffline(true); const documentPage = await offline.newPage(), network = [];
  documentPage.on('request', r => { if (/^https?:/.test(r.url())) network.push(r.url()); });
  documentPage.on('pageerror', e => errors.push(e.message));
  await documentPage.setContent(html, { waitUntil: 'load', timeout: 45000 });
  await expect(documentPage.locator('#cards .card')).toHaveCount(3);
  await documentPage.locator('#continue').click();
  await documentPage.getByRole('button', { name: '进入此关', exact: true }).click();
  expect(await documentPage.evaluate(() => W.renderer())).toBe('WebGL');
  await documentPage.locator('#guide').click();
  await expect(documentPage.locator('#mTitle')).toHaveText('驿卒', { timeout: 60000 });
  expect(network).toEqual([]);
  await documentPage.screenshot({ path: path.join(out, 'offline.png') });
  result.offlineMode = 'Actual downloaded HTML in an isolated network-disabled document';
  await offline.close();
  check('Actual standalone HTML download matches the original SHA-256 and runs a scene/quest with network disabled');
  expect(errors).toEqual([]); expect(failures).toEqual([]);
} catch (e) {
  fatal = e.stack || String(e);
  result.failureState = await probe().catch(() => null);
  await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
} finally {
  await browser.close();
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ ok: !fatal, ...result, ...(fatal ? { error: fatal } : {}) }, null, 2) + '\n');
}
if (fatal) throw Error(fatal);
