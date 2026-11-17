import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.APP_URL || 'http://127.0.0.1:4173/yunjin-tools/';
const local = ['localhost', '127.0.0.1'].includes(new URL(base).hostname);
const selected = new Set(process.argv.slice(2));
const modules = JSON.parse(fs.readFileSync(path.join(root, '_site/modules.json'), 'utf8'))
  .filter(m => m.kind === 'web' && (!selected.size || selected.has(m.id)));
if (!modules.length) throw Error('No matching web modules');
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  headless: true,
  args: ['--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {})
});
const outcomes = [];
let cursor = 0;
async function run() {
  while (cursor < modules.length) {
    const m = modules[cursor++];
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [], failures = [];
    // Before GitHub publication, resolve only this repository's Raw asset URLs locally.
    // This does not validate public GitHub availability; remote checks use APP_URL.
    if (local) await page.route('https://raw.githubusercontent.com/yunjinzh/yunjin-tools/main/assets/**', route => {
      const file = path.join(root, 'assets', path.basename(new URL(route.request().url()).pathname));
      return fs.existsSync(file) ? route.fulfill({ path: file, headers: { 'Access-Control-Allow-Origin': '*' } }) : route.abort();
    });
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) failures.push({ url: r.url().replace(/\?.*$/, ''), status: r.status() }); });
    try {
      const response = await page.goto(new URL(m.url, base).href, { waitUntil: 'domcontentloaded', timeout: 40000 });
      await page.waitForTimeout(1600);
      const view = await page.evaluate(() => ({
        title: document.title,
        textLength: document.body?.innerText?.length || 0,
        canvas: document.querySelectorAll('canvas').length
      }));
      outcomes.push({ id: m.id, name: m.name, http: response.status(), errors, failures, ...view,
        ok: response.ok() && (view.textLength > 30 || view.canvas > 0) && !errors.length && !failures.length });
    } catch (e) {
      outcomes.push({ id: m.id, name: m.name, ok: false, error: e.message.slice(0,500), errors, failures });
    }
    console.log(JSON.stringify(outcomes.at(-1)));
    await context.close();
  }
}
try { await Promise.all([run(), run(), run()]); }
finally { await browser.close(); }
fs.writeFileSync(path.join(root, 'tests/last-smoke.json'), JSON.stringify({ base, localAssets: local, outcomes }, null, 2));
if (outcomes.some(m => !m.ok)) process.exitCode = 1;
