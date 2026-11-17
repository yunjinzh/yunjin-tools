import { build } from 'esbuild';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await mkdir('dist/workers', { recursive: true });
await mkdir('dist/assets/ai', { recursive: true });
await mkdir('dist/licenses', { recursive: true });
await build({entryPoints:['src/app.js'],outfile:'dist/app.js',bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'eof'});
await build({entryPoints:['src/ai-worker.js'],outfile:'dist/workers/ai-worker.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof'});
await build({entryPoints:['src/color-worker.js'],outfile:'dist/workers/color-worker.js',bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'eof'});
const resources = {};
async function chunk(key, path, mime) {
  const bytes = await readFile(path), size = bytes.length;
  const chunks = [], step = 4 * 1024 * 1024;
  for (let offset = 0; offset < size; offset += step) {
    const part = bytes.subarray(offset, Math.min(offset + step, size));
    const hash = createHash('sha256').update(part).digest('hex');
    const name = `${hash}.bin`;
    await writeFile(`dist/assets/ai/${name}`, part);
    chunks.push({name, offsets:[offset, offset + part.length]});
  }
  resources[key] = {size, mime, chunks};
}
const model = await readFile('downloads/isnet_quint8.onnx');
const digest = createHash('sha256').update(model).digest('hex');
if (digest !== 'd1ca3535c21b53d08fa3b640e5949389f82e764f6376a0502d44982c35cae482') throw new Error('Model checksum mismatch');
await chunk('/models/isnet_quint8', 'downloads/isnet_quint8.onnx', 'application/octet-stream');
for (const suffix of ['wasm', 'mjs']) await chunk(`/onnxruntime-web/ort-wasm-simd-threaded.${suffix}`, `node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.${suffix}`, suffix === 'wasm' ? 'application/wasm' : 'text/javascript');
await writeFile('dist/assets/ai/resources.json', JSON.stringify(resources));
await copyFile('node_modules/@imgly/background-removal/LICENSE.md', 'dist/licenses/AGPL-3.0.md');
await copyFile('node_modules/@imgly/background-removal/ThirdPartyLicenses.json', 'dist/licenses/imgly-third-party.json');
// ONNX Runtime MIT license is retained in dist/licenses/ONNX-RUNTIME.txt (official v1.21.0 source).
console.log(JSON.stringify({built:true, model_sha256:digest, resource_bytes:Object.values(resources).reduce((s,v)=>s+v.size,0), chunks:Object.values(resources).reduce((s,v)=>s+v.chunks.length,0)}));
