import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pngFilename, pngDataURL, savePngToFile } from '../src/export.js';

const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==', 'base64');
const png = new Blob([bytes], { type: 'image/png' });

test('Chinese filenames keep PNG extension and avoid invalid path characters', () => {
  assert.equal(pngFilename('中文/标题:图片.jpg'), '中文_标题_图片_透明背景.png');
  assert.equal(pngFilename('图片.png', true), '图片_背景合成.png');
  assert.equal(pngFilename(''), '清底图片_透明背景.png');
});

test('reject empty and non-PNG exports instead of producing broken data links', async () => {
  await assert.rejects(pngDataURL(new Blob([], { type: 'image/png' })), /无效/);
  await assert.rejects(pngDataURL(new Blob(['hello'], { type: 'text/plain' })), /无效/);
});

test('picker starts synchronously and exact PNG bytes reach the selected file before success', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'qingdi-export-'));
  const target = join(directory, '透明图片.png');
  let pickerOpened = false, closed = false;
  try {
    const result = savePngToFile(png, '透明图片.png', async options => {
      pickerOpened = true;
      assert.equal(options.suggestedName, '透明图片.png');
      assert.deepEqual(options.types[0].accept, { 'image/png': ['.png'] });
      return { name: '透明图片.png', createWritable: async () => ({
        write: async blob => writeFile(target, Buffer.from(await blob.arrayBuffer())),
        close: async () => { closed = true; }
      }) };
    });
    assert.equal(pickerOpened, true, 'must not lose user activation before opening the picker');
    assert.equal(await result, '透明图片.png');
    assert.equal(closed, true);
    assert.deepEqual(await readFile(target), bytes);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('cancelled picker propagates cancellation without reporting success', async () => {
  const cancelled = new DOMException('cancelled', 'AbortError');
  await assert.rejects(savePngToFile(png, 'image.png', async () => { throw cancelled; }), error => error === cancelled);
});

for (const failureStep of ['write', 'close']) {
  test(`failed ${failureStep} aborts the stream and preserves the actual failure`, async () => {
    const failure = new Error('disk full');
    let aborted = false;
    const stream = {
      write: async () => { if (failureStep === 'write') throw failure; },
      close: async () => { if (failureStep === 'close') throw failure; },
      abort: async () => { aborted = true; throw new Error('abort also failed'); }
    };
    await assert.rejects(savePngToFile(png, 'image.png', async () => ({ createWritable: async () => stream })), error => error === failure);
    assert.equal(aborted, true);
  });
}
