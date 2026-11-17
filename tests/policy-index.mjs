import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Exercise the migrated policy reader, including resources rewritten for Pages.
// All requests use the chosen deployment; this test never substitutes local assets.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.APP_URL || 'http://127.0.0.1:4173/yunjin-tools/';
const entry = new URL('apps/m143/index.html', base).href;
const original = JSON.parse(fs.readFileSync(path.join(root, 'web/m143/index-data.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'web/m143/migration-assets.json'), 'utf8'));
const checks = [], resources = [], errors = [], failures = [];
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  headless: true,
  args: ['--disable-dev-shm-usage'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {})
});
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, acceptDownloads: true });
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.status() >= 400) failures.push({ url: r.url(), status: r.status() }); });
page.on('requestfailed', r => {
  if (r.failure()?.errorText !== 'net::ERR_ABORTED') failures.push({ url: r.url(), error: r.failure()?.errorText });
});
const hash = data => createHash('sha256').update(data).digest('hex');

async function openDocument(doc) {
  await page.locator('#search').fill(doc.title);
  await page.locator(`.file-card[data-doc="${doc.id}"]`).click();
  await expect(page.locator('#detail-dialog')).toBeVisible();
  await expect(page.locator('#detail-title')).toHaveText(doc.title);
}
async function closeDocument() {
  await page.locator('#detail-dialog .close-dialog').click();
  await expect(page.locator('#detail-dialog')).not.toBeVisible();
}

try {
  const response = await page.goto(entry, { waitUntil: 'networkidle', timeout: 45000 });
  assert.equal(response.status(), 200);
  const data = await page.evaluate(() => window.POLICY_DATA);
  assert.deepEqual(data.documents.map(d => [d.id, d.title]), original.documents.map(d => [d.id, d.title]));
  await expect(page.locator('.file-card')).toHaveCount(original.documents.length);
  await expect(page.locator('#stat-depts')).toHaveText(String(original.departments.length));
  checks.push(`Current source data: ${data.documents.length} documents and ${data.departments.length} departments`);

  await page.locator('#topic-bar [data-topic="产教融合"]').click();
  const filtered = await page.locator('.file-card').evaluateAll(nodes => nodes.map(n => n.dataset.doc));
  assert(filtered.length > 0 && filtered.length < data.documents.length);
  assert(filtered.every(id => data.documents.find(d => d.id === id).topics.includes('产教融合')));
  await page.locator('#clear-button').click();
  await expect(page.locator('.file-card')).toHaveCount(data.documents.length);
  await page.locator('#year').selectOption('2024');
  assert(await page.locator('.file-card').count() > 0);
  const yearIds = await page.locator('.file-card').evaluateAll(nodes => nodes.map(n => n.dataset.doc));
  assert(yearIds.every(id => data.documents.find(d => d.id === id).year === 2024));
  await page.locator('#clear-button').click();
  await page.locator('#search').fill('no-such-policy-987654321');
  await expect(page.locator('.empty-state')).toBeVisible();
  await page.locator('[data-reset]').click();
  checks.push('Topic/year filters, clear filters, and empty search state');

  const pdfDoc = data.documents.find(d => /\.pdf$/.test(d.localOriginalURL || ''));
  assert(pdfDoc, 'The policy update must include a local original PDF');
  await openDocument(pdfDoc);
  assert((await page.locator('#panel-body').innerText()).length > 300);
  await page.locator('#tab-summary').click();
  await expect(page.locator('#panel-summary')).toBeVisible();
  await expect(page.locator('#panel-summary .summary-text')).toHaveText(pdfDoc.summary);
  await page.locator('#tab-sources').click();
  await page.locator('#panel-sources [data-pdf]').first().click();
  await expect(page.locator('#panel-preview iframe')).toBeVisible({ timeout: 5000 });
  const iframe = new URL(await page.locator('#panel-preview iframe').getAttribute('src'), entry);
  assert.equal(iframe.origin, new URL(entry).origin);
  assert.equal(iframe.pathname, new URL(pdfDoc.localOriginalURL, entry).pathname);
  const pdf = await context.request.get(iframe.href);
  assert.equal(pdf.status(), 200);
  assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-');
  await closeDocument();
  checks.push('Search, full text, summary tabs, and same-origin embedded PDF preview');

  const attachmentDoc = data.documents.find(d => d.attachments.some(a => a.body && a.localURL));
  assert(attachmentDoc, 'The policy update must include readable attachments');
  await openDocument(attachmentDoc);
  await page.locator('#tab-sources').click();
  await page.locator('#panel-sources [data-attachment]').first().click();
  await expect(page.locator('#panel-preview')).toBeVisible();
  assert((await page.locator('#panel-preview').innerText()).length > 200);
  const attachmentLink = page.locator('#panel-preview a[download]').first();
  const [attachmentDownload] = await Promise.all([page.waitForEvent('download'), attachmentLink.click()]);
  assert.equal(await attachmentDownload.failure(), null);
  assert.match(attachmentDownload.suggestedFilename(), /\.docx?$/);
  await closeDocument();
  checks.push('Attachment full-text reading and browser document download');

  // Verify every bundled original/attachment against the imported bytes.
  const localPaths = new Set();
  function collect(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (['localURL', 'localOriginalURL', 'localPreviewURL'].includes(key) && child) localPaths.add(child);
      else if (child && typeof child === 'object') collect(child);
    }
  }
  collect(original);
  for (const file of localPaths) {
    assert.match(file, /^files\/[a-f\d]{12}\.(pdf|docx?)$/);
    const url = new URL(file, entry).href;
    const result = await context.request.get(url);
    assert.equal(result.status(), 200, url);
    const bytes = await result.body();
    assert(bytes.length > 1024, `Unexpectedly small document: ${url}`);
    if (file.endsWith('.pdf')) {
      assert.equal(bytes.subarray(0, 5).toString(), '%PDF-', `Invalid PDF: ${url}`);
      assert(bytes.subarray(-1024).includes(Buffer.from('%%EOF')), `Incomplete PDF: ${url}`);
    } else if (file.endsWith('.docx')) {
      assert.equal(bytes.subarray(0, 4).toString('hex'), '504b0304', `Invalid DOCX: ${url}`);
    } else {
      assert.equal(bytes.subarray(0, 8).toString('hex'), 'd0cf11e0a1b11ae1', `Invalid DOC: ${url}`);
    }
    const localFile = path.join(root, manifest[file] || `web/m143/${file}`);
    assert.equal(hash(bytes), hash(fs.readFileSync(localFile)), `Checksum mismatch: ${url}`);
    resources.push({ url, status: result.status(), bytes: bytes.length, sha256: hash(bytes) });
  }
  checks.push(`${resources.length} bundled PDF/Word files: real HTTP downloads, file signatures, and SHA-256 checks`);

  await page.locator('#search').fill('');
  const [csv] = await Promise.all([page.waitForEvent('download'), page.locator('#export-button').click()]);
  assert.equal(await csv.failure(), null);
  assert.match(csv.suggestedFilename(), /\.csv$/);
  const chunks = [];
  for await (const chunk of await csv.createReadStream()) chunks.push(chunk);
  const exported = Buffer.concat(chunks).toString('utf8');
  assert(exported.includes('站内全文链接'));
  assert(exported.includes(original.documents[0].title));
  assert(exported.includes(entry + '#doc='));
  checks.push('CSV export contains source documents and current deployment links');

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await openDocument(data.documents[0]);
  assert.equal(await page.evaluate(() => document.querySelector('#detail-dialog').getBoundingClientRect().right > innerWidth), false);
  await closeDocument();
  await page.locator('#search').fill('');
  await page.screenshot({ path: path.join(os.tmpdir(), 'policy-index-mobile.png') });
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.screenshot({ path: path.join(os.tmpdir(), 'policy-index-desktop.png') });
  checks.push('390px mobile catalogue and full-text dialog');
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  assert.deepEqual(failures, [], 'Failed browser resource requests');
  const report = { ok: true, entry, localAssets: false, checks, resources, errors, failures };
  fs.writeFileSync(path.join(root, 'tests/last-policy-index.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
