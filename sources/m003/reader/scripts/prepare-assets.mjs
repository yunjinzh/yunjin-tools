import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function prepareAssets() {
  await mkdir(path.join(root, 'public/pdfjs'), { recursive: true });
  for (const directory of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
    await cp(path.join(root, 'node_modules/pdfjs-dist', directory), path.join(root, 'public/pdfjs', directory), { recursive: true });
  }
  await cp(path.join(root, 'node_modules/pdfjs-dist/web/images'), path.join(root, 'public/pdfjs/images'), { recursive: true });
  await cp(path.join(root, 'node_modules/pdfjs-dist/LICENSE'), path.join(root, 'public/pdfjs/LICENSE'));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareAssets();
