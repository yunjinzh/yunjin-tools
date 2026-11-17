import { build } from 'vite';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareAssets } from './prepare-assets.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, '../dist');
await prepareAssets();
await build({ root, build: { outDir: output, emptyOutDir: true, target: 'es2022', sourcemap: false, minify: false } });
async function walk(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path.join(directory, entry.name), relative));
    else result.push(`/${relative}`);
  }
  return result;
}
const files = (await walk(output)).filter((name) => name !== '/sw.js').sort();
const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(path.join(output, file.slice(1))));
const version = hash.digest('hex').slice(0, 12);
const template = await readFile(path.join(root, 'scripts/sw-template.js'), 'utf8');
await writeFile(path.join(output, 'sw.js'), template.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(['/', ...files])));
console.log(`Offline shell ${version}: ${files.length} local assets cached, including PDF fonts and worker.`);
