import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

// Fresh contexts and real assets; only the quota test changes a browser API.
const base = process.env.APP_URL || 'http://127.0.0.1:4186/yunjin-tools/';
const url = new URL('apps/m156/index.html', base).href;
const output = process.env.QA_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'mdstudio-check-'));
fs.mkdirSync(output, { recursive: true });
const errors = [], failures = [], checks = [], downloads = [];
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {})
});
function watch(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push({ url: response.url(), status: response.status() }); });
  page.on('requestfailed', request => { if (request.failure()?.errorText !== 'net::ERR_ABORTED') failures.push({ url: request.url(), error: request.failure()?.errorText }); });
  return page;
}
const checkpoint = name => { checks.push(name); console.log('PASS: ' + name); };
const saved = page => expect(page.locator('#statusText')).toHaveText('已保存');
async function download(page, kind, name) {
  await page.locator('#exportBtn').click();
  const ready = page.waitForEvent('download');
  await page.locator(`[data-export="${kind}"]`).click();
  const item = await ready;
  expect(item.suggestedFilename()).toBe(name);
  const target = path.join(output, name);
  await item.saveAs(target);
  const bytes = fs.readFileSync(target);
  downloads.push({ name, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
  return { bytes, target };
}
let ok = false, failure;
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, serviceWorkers: 'block' });
  const page = watch(await context.newPage());
  expect((await page.goto(url)).status()).toBe(200);
  await expect(page.locator('#preview h1')).toHaveText('从想法到成稿');
  await expect(page.locator('#preview table')).toHaveCount(1);
  await expect(page.locator('#preview input[type=checkbox]')).toHaveCount(2);
  await expect(page.locator('#previewInfo')).toHaveText('LIVE');
  await saved(page);
  await page.locator('#outlineBtn').click();
  await expect(page.locator('#outlineLinks button')).toHaveCount(3);
  await page.locator('#outlineBtn').click();
  await page.screenshot({ path: path.join(output, 'desktop.png') });
  checkpoint('Initial Markdown sample, worker preview, table, checklist and outline');

  await page.locator('#editor').fill('排版检查');
  await page.locator('#editor').press('Control+a');
  await page.locator('[data-command=bold]').click();
  await expect(page.locator('#editor')).toHaveValue('**排版检查**');
  await page.locator('[data-command=undo]').click();
  await expect(page.locator('#editor')).toHaveValue('排版检查');
  await page.locator('[data-command=redo]').click();
  await expect(page.locator('#editor')).toHaveValue('**排版检查**');
  await page.locator('#editor').fill('Alpha alpha ALPHA\nalpha');
  await page.locator('#findBtn').click();
  await page.locator('#findInput').fill('alpha');
  await expect(page.locator('#matchCount')).toContainText('/4');
  await page.locator('#caseSensitive').check();
  await expect(page.locator('#matchCount')).toContainText('/2');
  await page.locator('#replaceInput').fill('替换');
  await page.locator('#replaceAll').click();
  await expect(page.locator('#editor')).toHaveValue('Alpha 替换 ALPHA\n替换');
  await page.locator('#closeFind').click();
  checkpoint('Formatting, undo/redo and case-sensitive literal find/replace');

  const markdown = '# 排版验收\n\n**重点** 与 *说明*。\n\n## 小节\n\n- [x] 完成\n- [ ] 校对\n\n| 项目 | 数值 |\n| --- | --- |\n| 示例 | 42 |\n\n```js\nconst answer = 42;\n```\n\n[链接](https://example.com/docs)\n\n<script>window.__unsafeStudio=true</script>\n\n[危险](javascript:alert(1))\n\n![外图](https://example.com/image.png)\n';
  const input = { name: '排版验收.md', mimeType: 'text/markdown', buffer: Buffer.from('\uFEFF' + markdown.replace(/\n/g, '\r\n')) };
  await page.locator('#fileInput').setInputFiles(input);
  await expect(page.locator('#confirmDialog')).toBeVisible();
  await page.locator('#dialogCancel').click();
  await expect(page.locator('#editor')).toHaveValue('Alpha 替换 ALPHA\n替换');
  await page.locator('#fileInput').setInputFiles(input);
  await page.locator('#dialogAccept').click();
  await expect(page.locator('#editor')).toHaveValue(markdown);
  await expect(page.locator('#docTitle')).toHaveValue('排版验收');
  await expect(page.locator('#preview h1')).toHaveText('排版验收');
  await expect(page.locator('#preview strong')).toHaveText('重点');
  await expect(page.locator('#preview pre code')).toHaveText('const answer = 42;\n');
  await expect(page.locator('#preview script, #preview a[href^="javascript:"], #preview img')).toHaveCount(0);
  await expect(page.locator('#preview .image-placeholder')).toContainText('外部图片未加载');
  expect(await page.evaluate(() => window.__unsafeStudio)).toBeUndefined();
  await saved(page);
  const md = await download(page, 'md', '排版验收.md');
  expect(md.bytes.equals(Buffer.from(markdown))).toBe(true);
  await page.reload();
  await expect(page.locator('#editor')).toHaveValue(markdown);
  checkpoint('Import cancellation, UTF-8/BOM/CRLF normalization, safe preview, exact Markdown download and reload');

  for (const style of ['clean', 'wechat', 'github', 'academic', 'swiss', 'field', 'blueprint', 'magazine', 'briefing', 'lesson', 'archive', 'minimal']) {
    await page.locator('#studioStylesOpen').click();
    await expect(page.locator('#studioStylesGallery [data-article-style]')).toHaveCount(12);
    await page.locator(`[data-article-style="${style}"]`).click();
    await expect(page.locator('#styleSelect')).toHaveValue(style);
    await expect(page.locator('#preview')).toHaveClass('markdown style-' + style);
    await expect(page.locator('#studioStylesDialog')).not.toBeVisible();
  }
  for (const theme of ['light', 'warm', 'dark', 'celadon', 'mist', 'midnight']) {
    await page.locator('#themeSelect').selectOption(theme);
    await expect(page.locator('body')).toHaveAttribute('data-theme', theme);
  }
  await page.locator('#themeSelect').selectOption('light');
  await page.locator('#styleSelect').selectOption('blueprint');
  await page.locator('#resizer').focus();
  await page.locator('#resizer').press('Home');
  await expect(page.locator('#resizer')).toHaveAttribute('aria-valuenow', '25');
  await page.locator('#resizer').press('End');
  await expect(page.locator('#resizer')).toHaveAttribute('aria-valuenow', '75');
  await page.locator('#helpBtn').click();
  await page.locator('#sizeSelect').selectOption('19');
  await expect(page.locator('#remoteImages')).not.toBeChecked();
  await page.locator('#closeHelp').click();
  await page.reload();
  await expect(page.locator('#styleSelect')).toHaveValue('blueprint');
  await expect(page.locator('#resizer')).toHaveAttribute('aria-valuenow', '75');
  await expect(page.locator('#preview')).toHaveCSS('font-size', '19px');
  checkpoint('Twelve gallery styles, six themes, keyboard split resizing and persistent typography preferences');

  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
  await page.locator('#copyBtn').click();
  await expect(page.locator('#toast')).toHaveText('富文本排版已复制');
  const rich = await page.evaluate(async () => {
    const item = (await navigator.clipboard.read()).find(item => item.types.includes('text/html'));
    return { html: await (await item.getType('text/html')).text(), text: await (await item.getType('text/plain')).text() };
  });
  expect(rich.text).toContain('排版验收');
  expect(rich.html).toContain('font-family:');
  const html = await download(page, 'html', '排版验收.html');
  expect(html.bytes.toString()).toContain('style-blueprint');
  expect(html.bytes.toString()).toContain('Content-Security-Policy');
  const exported = watch(await context.newPage());
  // Render downloaded bytes in a separate blank document. Managed Chrome blocks
  // file:// navigation; this does not intercept or replace application resources.
  await exported.setContent(html.bytes.toString());
  await expect(exported.locator('h1')).toHaveText('排版验收');
  await expect(exported.locator('script')).toHaveCount(0);
  await expect(exported.locator('main article')).toHaveCSS('font-size', '19px');
  const appearance = p => p.locator('h1').evaluate(el => { const s = getComputedStyle(el); return [s.fontFamily, s.fontWeight, s.color, s.borderBottomStyle]; });
  expect(await appearance(exported)).toEqual(await page.locator('#preview h1').evaluate(el => { const s = getComputedStyle(el); return [s.fontFamily, s.fontWeight, s.color, s.borderBottomStyle]; }));
  await exported.close();
  const text = await download(page, 'txt', '排版验收.txt');
  expect(text.bytes.toString()).toContain('排版验收');
  expect(text.bytes.toString()).toContain('const answer = 42;');
  checkpoint('Native rich-text clipboard, downloaded standalone HTML with matching style, and plain-text export');

  await page.locator('#snapshotBtn').click();
  await page.locator('#editor').fill('# 临时内容');
  await saved(page);
  await page.locator('#historyBtn').click();
  await page.locator('#revisionsList .revision').first().getByRole('button', { name: '恢复' }).click();
  await page.locator('#dialogAccept').click();
  await expect(page.locator('#editor')).toHaveValue(markdown);
  await page.locator('[data-command=image]').click();
  await page.locator('#imageInput').setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9WQAAAAASUVORK5CYII=', 'base64') });
  await expect(page.locator('#editor')).toHaveValue(/data:image\/png;base64/);
  await expect(page.locator('#preview img')).toHaveCount(1);
  await expect.poll(() => page.locator('#preview img').evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  await saved(page);
  const retained = await page.locator('#editor').inputValue();
  const other = watch(await context.newPage());
  await other.goto(new URL('apps/m155/index.html', base).href);
  expect(await other.evaluate(() => localStorage.getItem('mdstudio.v3.draft'))).toBeNull();
  await other.evaluate(() => localStorage.clear());
  await other.close();
  await page.reload();
  await expect(page.locator('#editor')).toHaveValue(retained);
  checkpoint('History snapshot restore, embedded image insertion and storage isolation from Moye');

  for (const [width, height] of [[390, 844], [360, 800], [800, 390]]) {
    await page.setViewportSize({ width, height });
    await page.locator('#viewPicker [data-view=edit]').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#viewPicker [data-view=preview]').click();
    await page.locator('#studioStylesOpen').click();
    await page.locator('[data-article-style=lesson]').click();
    await expect(page.locator('#preview')).toHaveClass('markdown style-lesson');
    await expect(page.locator('#editor')).toBeHidden();
    await page.screenshot({ path: path.join(output, `mobile-${width}x${height}.png`) });
  }
  await context.close();
  checkpoint('Phone and landscape layouts, editing/preview navigation and mobile style gallery');

  const limited = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await limited.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Test quota', 'QuotaExceededError'); }; });
  const emergency = watch(await limited.newPage());
  await emergency.goto(url);
  const unsaved = '# 保全测试\n\n存储不可用时仍可下载。';
  await emergency.locator('#editor').fill(unsaved);
  await expect(emergency.locator('#statusText')).toHaveText('保存失败');
  const backup = await download(emergency, 'md', '写作示例.md');
  expect(backup.bytes.equals(Buffer.from(unsaved))).toBe(true);
  await limited.close();
  checkpoint('Storage failure is visible and the unsaved document still downloads exactly');
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  ok = true;
} catch (error) {
  failure = String(error.stack || error);
  console.error(failure);
  process.exitCode = 1;
} finally {
  await browser.close();
  fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify({ ok, base, url, checks, downloads, errors, failures, failure }, null, 2) + '\n');
  console.log(JSON.stringify({ ok, checks: checks.length, output }));
}
