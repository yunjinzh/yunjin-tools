import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const sampleUrl = new URL('../public/samples/quiet-reading.pdf', import.meta.url);
const pdfjsRoot = new URL('../node_modules/pdfjs-dist/', import.meta.url);

test('the welcome sample has three Chinese pages, clickable contents, and matching outlines', async () => {
  const document = await getDocument({
    data: new Uint8Array(await readFile(sampleUrl)),
    cMapUrl: `${fileURLToPath(new URL('cmaps/', pdfjsRoot))}/`,
    cMapPacked: true,
    standardFontDataUrl: `${fileURLToPath(new URL('standard_fonts/', pdfjsRoot))}/`,
    useSystemFonts: true,
  }).promise;
  try {
    assert.equal(document.numPages, 3);
    const outline = await document.getOutline();
    assert.deepEqual(outline.map((item) => item.title), ['从一页开始', '在字里行间停一停', '让阅读成为日常']);
    for (let index = 0; index < outline.length; index += 1) {
      const destination = typeof outline[index].dest === 'string'
        ? await document.getDestination(outline[index].dest)
        : outline[index].dest;
      assert.equal(await document.getPageIndex(destination[0]), index);
    }
    const expectedText = ['把时间', '雨落在窗沿', '愿你读得自在'];
    for (let pageNumber = 1; pageNumber <= 3; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str).join('');
      assert.ok(text.includes(expectedText[pageNumber - 1]), `page ${pageNumber} contains readable Chinese text`);
      assert.ok(text.includes(`${String(pageNumber).padStart(2, '0')} / 03`), 'page number is present');
    }
    const coverPage = await document.getPage(1);
    const links = (await coverPage.getAnnotations()).filter((annotation) => annotation.subtype === 'Link');
    assert.equal(links.length, 3);
    assert.ok(links.every((link) => link.dest), 'each contents entry has an internal PDF destination');
    assert.equal((await document.getMetadata()).info.Title, '把时间，留给阅读');
  } finally {
    await document.loadingTask.destroy();
  }
});
