import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.APP_URL || 'http://127.0.0.1:4173/yunjin-tools/';
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {})
});
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const results = [];
try {
  await page.goto(base + 'apps/gis101/web/tools.html');
  await page.locator('.tool-card').first().waitFor();
  const links = await page.locator('.tool-card').evaluateAll(cards => cards.map(c => c.href));
  if (links.length !== 6 || links.some(href => !href.startsWith(base + 'apps/gis101/tools/'))) throw Error('Directory did not resolve the six local tools');
  if (await page.locator('#modeInfo').innerText() !== '自动目录读取') throw Error('Directory index could not be read');
  await page.locator('#searchInput').fill('bookmark.html');
  if (await page.locator('.tool-card').count() !== 1) throw Error('Directory search failed');
  results.push('Six same-origin tools discovered and keyword search passed');
  for (const href of links) {
    const child = await context.newPage();
    const childErrors = [];
    child.on('pageerror', e => childErrors.push(e.message));
    const response = await child.goto(href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await child.waitForTimeout(1000);
    if (!response.ok() || childErrors.length) throw Error(`${href}: HTTP ${response.status()}; ${childErrors.join('; ')}`);
    results.push({ url: href, http: response.status(), title: await child.title(), errors: childErrors });
    await child.close();
  }
  let intercepted = 0;
  await page.route('**/apps/gis101/tools/', route => { intercepted++; return route.fulfill({ status: 503, body: 'Simulated unavailable directory index' }); });
  await page.reload();
  await page.locator('.tool-card').first().waitFor();
  const fallbackLinks = await page.locator('.tool-card').evaluateAll(cards => cards.map(c => c.href));
  const fallbackMode = await page.locator('#modeInfo').innerText();
  if (fallbackLinks.length !== 6 || fallbackLinks.some(href => !href.startsWith(base + 'apps/gis101/tools/')) || fallbackMode !== '内置清单') throw Error('Fallback catalogue failed: ' + JSON.stringify({intercepted, fallbackMode, fallbackLinks}));
  if (errors.length) throw Error(errors.join('; '));
  results.push('Fallback retains the six real migrated tool links when the index is unavailable');
  fs.writeFileSync(path.join(root, 'tests/last-directory.json'), JSON.stringify({ base, ok: true, results }, null, 2));
  console.log(JSON.stringify({ ok: true, results }));
} finally { await browser.close(); }
