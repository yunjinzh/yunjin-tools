import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

// Uses isolated browser contexts and real resources, including for HTTPS checks.
const base = process.env.APP_URL || 'http://127.0.0.1:4186/yunjin-tools/';
const url = new URL('apps/m155/index.html', base).href;
const output = process.env.QA_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'moye-check-'));
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
async function saved(page) { await expect(page.locator('#saveState')).toHaveText('已存至本机'); }
async function download(page, expected, name) {
  const ready = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const item = await ready;
  expect(item.suggestedFilename()).toBe(name);
  const target = path.join(output, name);
  await item.saveAs(target);
  const bytes = fs.readFileSync(target);
  expect(bytes.equals(Buffer.from(expected))).toBe(true);
  downloads.push({ name, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
}
async function checkpoint(name) { checks.push(name); console.log('PASS: ' + name); }
let ok = false, failure;
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, acceptDownloads: true, serviceWorkers: 'block' });
  const page = watch(await context.newPage());
  expect((await page.goto(url)).status()).toBe(200);
  await expect(page.locator('#preview h1')).toHaveText('山野观察手记');
  await expect(page.locator('#outline button')).toHaveCount(4);
  await expect(page.locator('#docCount')).toHaveText('1');
  await expect(page.locator('#preview table')).toHaveCount(1);
  await saved(page);
  await page.screenshot({ path: path.join(output, 'desktop.png') });
  await checkpoint('Initial sample, rendered table, outline and desktop layout');

  const markdown = '# 同步验收\n\n**重点** 与 *斜体*。\n\n## 清单\n\n- [x] 已完成\n- [ ] 待办\n\n| 项目 | 数值 |\n| --- | --- |\n| 示例 | 42 |\n\n```js\nconst answer = 42;\n```\n\n[示例](https://example.com)\n\n<script>window.__moyeUnsafe=true</script>\n\n[不可执行](javascript:alert(1))\n\n![图片说明](https://example.com/image.png)\n';
  await page.locator('#fileInput').setInputFiles({ name: '同步验收.md', mimeType: 'text/markdown', buffer: Buffer.from('\uFEFF' + markdown.replace(/\n/g, '\r\n')) });
  await expect(page.locator('#source')).toHaveValue(markdown);
  await expect(page.locator('#docTitle')).toHaveText('同步验收');
  await expect(page.locator('#preview strong')).toHaveText('重点');
  await expect(page.locator('#preview table tbody td').last()).toHaveText('42');
  await expect(page.locator('#preview pre code')).toContainText('const answer = 42;');
  await expect(page.locator('#preview input[type=checkbox]')).toHaveCount(2);
  await expect(page.locator('#preview script, #preview img, #preview a[href^="javascript:"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.__moyeUnsafe)).toBeUndefined();
  await expect(page.locator('#preview .md-image-placeholder')).toHaveText('〔图片说明〕');
  await expect(page.locator('#preview a[href="https://example.com/"]')).toHaveAttribute('rel', 'noopener noreferrer');
  await saved(page);
  await download(page, markdown, '同步验收.md');
  await page.reload();
  await expect(page.locator('#source')).toHaveValue(markdown);
  await expect(page.locator('#docCount')).toHaveText('2');
  await checkpoint('UTF-8/BOM/CRLF import, Markdown preview safety, byte-exact download and reload recovery');

  await page.locator('#newBtn').click();
  await page.locator('#source').fill('排版检查');
  await page.locator('#source').press('Control+a');
  await page.locator('[data-format=bold]').click();
  await expect(page.locator('#source')).toHaveValue('**排版检查**');
  await page.locator('[data-format=undo]').click();
  await expect(page.locator('#source')).toHaveValue('排版检查');
  await page.locator('[data-format=redo]').click();
  await expect(page.locator('#source')).toHaveValue('**排版检查**');
  await page.locator('#source').press('Control+a');
  await page.locator('#headingBtn').click();
  await page.locator('[data-format=h2]').click();
  await expect(page.locator('#source')).toHaveValue('## **排版检查**');
  await expect(page.locator('#preview h2')).toHaveText('排版检查');
  await page.locator('#source').fill('链接');
  await page.locator('#source').press('Control+a');
  await page.locator('[data-format=link]').click();
  await page.locator('#md-link-dialog [name=url]').fill('javascript:alert(1)');
  await page.locator('#md-link-dialog [type=submit]').click();
  await expect(page.locator('#md-link-dialog')).toBeVisible();
  expect(await page.locator('#md-link-dialog [name=url]').evaluate(el => el.validity.valid)).toBe(false);
  await page.locator('#md-link-dialog [name=url]').fill('https://example.com/docs');
  await page.locator('#md-link-dialog [type=submit]').click();
  await expect(page.locator('#source')).toHaveValue('[链接](https://example.com/docs)');
  await page.locator('#source').fill('表头');
  await page.locator('#source').press('Control+a');
  await page.locator('#moreBtn').click();
  await page.locator('[data-format=table]').click();
  await expect(page.locator('#preview th').first()).toHaveText('表头');
  await checkpoint('Formatting toolbar, undo/redo, heading, table and validated link insertion');

  await page.locator('#renameBtn').click();
  await page.locator('#nameInput').fill('保留草稿');
  await page.locator('#nameDialog button[type=submit], #nameDialog .btn-green').click();
  await expect(page.locator('#docTitle')).toHaveText('保留草稿');
  const draft = await page.locator('#source').inputValue();
  await saved(page);
  await page.locator('#docList .doc-pick').filter({ hasText: '同步验收' }).click();
  await expect(page.locator('#source')).toHaveValue(markdown);
  await page.locator('#docList .doc-pick').filter({ hasText: '保留草稿' }).click();
  await expect(page.locator('#source')).toHaveValue(draft);
  await page.getByRole('button', { name: '保留草稿的操作', exact: true }).click();
  await page.locator('[data-doc-action=delete]').click();
  await page.locator('#deleteDialog [data-close]').click();
  await expect(page.locator('#docTitle')).toHaveText('保留草稿');
  await page.getByRole('button', { name: '保留草稿的操作', exact: true }).click();
  await page.locator('[data-doc-action=delete]').click();
  await page.locator('#deleteDialog .danger').click();
  await expect(page.locator('#docCount')).toHaveText('2');
  await expect(page.locator('#docList')).not.toContainText('保留草稿');
  await page.locator('#helpBtn').click();
  await expect(page.locator('#helpRows .help-row')).toHaveCount(8);
  await page.locator('#helpDialog [data-close]').click();
  await page.locator('[data-mode-btn=preview]').click();
  await expect(page.locator('.source-pane')).toBeHidden();
  await page.locator('[data-mode-btn=edit]').click();
  await expect(page.locator('.preview-pane')).toBeHidden();
  await page.locator('[data-mode-btn=split]').click();
  await expect(page.locator('.source-pane')).toBeVisible();
  await expect(page.locator('.preview-pane')).toBeVisible();
  await checkpoint('Create/rename/switch/delete with cancellation, help and three desktop view modes');

  await page.locator('#docList .doc-pick').filter({ hasText: '同步验收' }).click();
  const second = watch(await context.newPage());
  await second.goto(url);
  await expect(second.locator('#source')).toHaveValue(markdown);
  const shared = '# 双页同步\n\n第一页的新内容';
  await page.locator('#source').fill(shared);
  await saved(page);
  await expect(second.locator('#source')).toHaveValue(shared);
  const edits = ['# 同时修改 A\n\n保留第一页内容', '# 同时修改 B\n\n保留第二页内容'];
  await Promise.all([page.locator('#source').fill(edits[0]), second.locator('#source').fill(edits[1])]);
  await Promise.all([saved(page), saved(second)]);
  await expect.poll(() => page.evaluate(() => Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(k => k.startsWith('moye.markdown.v1.doc.')).map(k => JSON.parse(localStorage.getItem(k)).body))).toEqual(expect.arrayContaining(edits));
  await second.close();
  await checkpoint('Native cross-tab refresh and concurrent edits preserve both drafts');

  await page.locator('#newBtn').click();
  await page.locator('#source').fill('# 独立草稿\n\n模块存储检查');
  await saved(page);
  const other = watch(await context.newPage());
  await other.goto(new URL('apps/m001/', base).href);
  expect(await other.evaluate(() => Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).some(k => k.startsWith('moye.markdown.')))).toBe(false);
  await other.evaluate(() => localStorage.clear());
  await other.close();
  await page.reload();
  await expect(page.locator('#source')).toHaveValue('# 独立草稿\n\n模块存储检查');
  await checkpoint('Storage stays isolated from other portal modules');

  for (const [width, height] of [[390, 844], [360, 800], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator('.workbench')).toHaveAttribute('data-mode', 'edit');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#menuBtn').click();
    await expect(page.locator('#sidebar')).toHaveClass(/open/);
    await page.locator('#closeSide').click();
    await page.locator('[data-mode-btn=preview]').click();
    await expect(page.locator('#preview h1')).toHaveText('独立草稿');
    await page.screenshot({ path: path.join(output, `mobile-${width}x${height}.png`) });
    await page.locator('[data-mode-btn=edit]').click();
  }
  await checkpoint('390px, 360px and landscape mobile layouts, navigation and preview');
  await context.close();

  const limited = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await limited.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Test storage quota', 'QuotaExceededError'); }; });
  const emergency = watch(await limited.newPage());
  await emergency.goto(url);
  const unsaved = '# 下载保全\n\n存储不可用时的测试文稿';
  await emergency.locator('#source').fill(unsaved);
  await expect(emergency.locator('#saveState')).toHaveText('尚未保存，请下载');
  await download(emergency, unsaved, '山行笔记.md');
  await emergency.locator('#newBtn').click();
  await emergency.locator('#docList .doc-pick').filter({ hasText: '山行笔记' }).click();
  await expect(emergency.locator('#source')).toHaveValue(unsaved);
  await limited.close();
  await checkpoint('Unavailable browser storage is reported; download and in-memory draft remain usable');
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
