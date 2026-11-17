import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const sample = fileURLToPath(new URL('../../public/samples/quiet-reading.pdf', import.meta.url));

async function assertNoHorizontalOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

async function expectRenderedPage(page, number) {
  await expect(page.locator('#reader')).toBeVisible();
  await expect(page.locator('#page-input')).toHaveValue(String(number));
  await expect(page.locator(`.page[data-page-number="${number}"] canvas`)).toBeVisible();
}

async function openSavedBook(page) {
  await page.waitForFunction(() => {
    const reader = document.querySelector('#reader');
    return (reader && !reader.hidden) || !!document.querySelector('[data-action="open-book"]');
  });
  if (!(await page.locator('#reader').isVisible())) {
    await page.locator('[data-action="open-book"]').first().click();
  }
}

async function importSample(page) {
  await page.goto('/');
  await page.getByRole('button', { name: '体验示例书', exact: true }).click();
  await expectRenderedPage(page, 1);
}

test('手机书架、PDF 阅读、目录、续读和主题设置', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('button', { name: '导入 PDF', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: '我的书架', exact: true })).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('mobile-library.png'), fullPage: true });

  await page.getByRole('button', { name: '体验示例书', exact: true }).click();
  await expectRenderedPage(page, 1);
  await page.getByRole('button', { name: '下一页', exact: true }).click();
  await expectRenderedPage(page, 2);
  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('mobile-reader.png'), fullPage: true });

  await page.reload();
  await openSavedBook(page);
  await expectRenderedPage(page, 2);

  await page.getByRole('button', { name: '阅读设置', exact: true }).click();
  await expect(page.locator('#settings-dialog')).toBeVisible();
  await page.locator('input[name="theme"][value="dark"]').check();
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '关闭阅读设置', exact: true }).click();
  await expect(page.locator('#settings-dialog')).not.toBeVisible();

  await page.getByRole('button', { name: '打开目录', exact: true }).click();
  await expect(page.locator('#outline-dialog')).toBeVisible();
  const outlineItems = page.locator('#outline-dialog .outline-item');
  await expect(outlineItems.first()).toBeVisible();
  await outlineItems.last().click();
  await expect(page.locator('#outline-dialog')).not.toBeVisible();
  await expectRenderedPage(page, 3);

  await page.reload();
  await openSavedBook(page);
  await expectRenderedPage(page, 3);
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('真实文件导入、重复检测、损坏提示与删除', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('#pdf-file').setInputFiles(sample);
  await expectRenderedPage(page, 1);
  await page.getByRole('button', { name: '返回书架', exact: true }).click();
  await expect(page.locator('#library')).toBeVisible();
  const deleteButton = page.getByRole('button', { name: /^删除《/ });
  await expect(deleteButton).toHaveCount(1);

  await page.locator('#pdf-file').setInputFiles(sample);
  await expect(page.locator('.toast')).toContainText(/已存在|已导入|重复|已经/);
  await expect(deleteButton).toHaveCount(1);

  await page.locator('#pdf-file').setInputFiles({
    name: 'broken.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\nThis is not a valid PDF file.'),
  });
  await expect(page.locator('.toast')).toContainText(/损坏|无法|失败|有效|无效/);
  await expect(deleteButton).toHaveCount(1);

  await deleteButton.click();
  await expect(page.locator('#delete-dialog')).toBeVisible();
  await page.getByRole('button', { name: '确认删除', exact: true }).click();
  await expect(deleteButton).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: '体验示例书', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('缓存完成后断网重启仍可续读本地 PDF', async ({ page, context }) => {
  await importSample(page);
  await page.locator('#page-input').fill('2');
  await page.locator('#page-input').press('Enter');
  await expectRenderedPage(page, 2);
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) throw new Error('Service worker unavailable');
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 60_000 });
  await page.reload();
  await openSavedBook(page);
  await expectRenderedPage(page, 2);

  await context.setOffline(true);
  await page.reload();
  await openSavedBook(page);
  await expectRenderedPage(page, 2);
  await page.getByRole('button', { name: '下一页', exact: true }).click();
  await expectRenderedPage(page, 3);
  await context.setOffline(false);
});

test('桌面书架保持可用布局', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '我的书架', exact: true })).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('desktop-library.png'), fullPage: true });
});

test.describe('加载任务取消', () => {
  test.use({ serviceWorkers: 'block' });
  test('PDF 视图加载中返回后，旧任务不会重新打开书籍', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    let releaseModule;
    let moduleRequested;
    const held = new Promise((resolve) => { releaseModule = resolve; });
    const requested = new Promise((resolve) => { moduleRequested = resolve; });
    await page.route('**/assets/pdf_viewer-*.js', async (route) => {
      moduleRequested();
      await held;
      await route.continue();
    });
    await page.goto('/');
    await page.getByRole('button', { name: '体验示例书', exact: true }).click();
    await requested;
    await page.getByRole('button', { name: '返回书架', exact: true }).click();
    await expect(page.locator('#library')).toBeVisible();
    releaseModule();
    await page.waitForFunction(() => performance.getEntriesByType('resource').some((resource) => /pdf_viewer-.*\.js/.test(resource.name)));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(page.locator('#reader')).toBeHidden();
    expect(new URL(page.url()).hash).toBe('');
    await page.locator('[data-action="open-book"]').first().click();
    await expectRenderedPage(page, 1);
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expectRenderedPage(page, 2);
    expect(errors).toEqual([]);
  });
});
