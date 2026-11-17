import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

// Build a self-contained, classic-script edition that runs directly from file://.
// Only the explicitly known project modules are bundled; no external build tool.
const root = dirname(fileURLToPath(import.meta.url));
const dist = resolve(root, 'dist');
const output = process.argv[2] || '/workspace/scratch/7c644533ca94/三字经-云山书院-离线版.html';
const read = path => readFileSync(resolve(dist, path), 'utf8');

function stripImports(source) {
  return source.replace(/^import\s+[\s\S]*?\sfrom\s+['"][^'"]+['"];?\s*$/gm, '');
}
function returnNamedExports(source) {
  let found = 0;
  const result = source.replace(/\bexport\s*\{([^}]+)\}\s*;?/g, (_, names) => {
    found++;
    const entries = names.split(',').map(s => s.trim()).filter(Boolean).map(s => {
      const [local, exported] = s.split(/\s+as\s+/);
      return exported ? `${exported}: ${local}` : local;
    });
    return `return {${entries.join(',')}};`;
  });
  if (found !== 1) throw new Error(`Expected one named export block; got ${found}`);
  return result;
}

const three = `const THREE = (() => {\n${returnNamedExports(read('vendor/three.module.js'))}\n})();`;
const controlsRaw = read('vendor/OrbitControls.js');
const controlNames = controlsRaw.match(/^import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"];?/m)?.[1];
if (!controlNames) throw new Error('OrbitControls imports are not in the expected shape');
const controls = `const { OrbitControls } = (() => {\nconst {${controlNames}} = THREE;\n${returnNamedExports(stripImports(controlsRaw))}\n})();`;
const content = read('content.js').replace(/\bexport\s+(?=const\s+(?:META|CHAPTERS)\b)/g, '');
function isolatedModule(file, names) {
  const source = stripImports(read(file)).replace(/\bexport\s+(?=(?:function|const|let|class)\b)/g, '');
  return `const {${names.join(',')}} = (() => {\n${source}\nreturn {${names.join(',')}};\n})();`;
}
const childContent = isolatedModule('child-content.js', ['CHILD_GUIDES']);
const reviews = isolatedModule('review-engine.js', ['localDay','normalizeReviews','recordReview','getReviewQueue','mergeReviews']);
const voices = isolatedModule('voice-options.js', ['listChineseVoices','resolveChineseVoice']);
const narrator = isolatedModule('narrator.js', ['createNarrator']);
const knowledge = isolatedModule('knowledge-model.js', ['KNOWLEDGE_TOPICS','HISTORY_ERAS','activeDynasties','normalizeKnowledgeProgress','recordKnowledgeVisit','recordKnowledgeAnswer','recordKnowledgeOrder','mergeKnowledgeProgress']);
const knowledgeScene = isolatedModule('knowledge-scene.js', ['createKnowledgeScene']);
const knowledgeUI = isolatedModule('knowledge-ui.js', ['createKnowledgeUI']);
const activitySheet = isolatedModule('activity-sheet.js', ['renderActivitySheet']);
const scene = `const createWorld = (() => {\n${stripImports(read('scene.js')).replace(/\bexport\s+(?=function\s+createWorld\b)/g, '')}\nreturn createWorld;\n})();`;
const app = stripImports(read('app.js'));
const javascript = `(() => {\n'use strict';\n${three}\n${controls}\n${content}\n${childContent}\n${reviews}\n${voices}\n${narrator}\n${knowledge}\n${knowledgeScene}\n${knowledgeUI}\n${activitySheet}\n${scene}\n${app}\n})();`;

// Parsing before writing catches both input-module drift and bundling defects.
new Script(javascript, { filename: 'sanzijing-offline.js' });
if (/^\s*(?:import|export)\s/m.test(javascript)) throw new Error('An ES module declaration remains');

const font = readFileSync(resolve(dist, 'serif.woff')).toString('base64');
const css = ['style.css','knowledge.css','activity-sheet.css'].map(read).join('\n').replace(/url\(\s*(['"]?)\.\/serif\.woff\1\s*\)/g,
  `url('data:font/woff;base64,${font}')`);
if (css.includes('./serif.woff')) throw new Error('Font embedding failed');
const license = `<!--
THREE.JS MIT LICENSE
Copyright © 2010-2024 three.js authors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
-->
`;
let html = read('index.html');
html = html.replace('</head>', () => '<!--\n' + read('vendor/NOTICE.txt').replace(/-->/g, '-- >') + '\n-->\n</head>');
html = html.replace(/<link\s+rel="stylesheet"\s+href="style\.css">/,
  () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
html = html.replace(/<link\s+rel="stylesheet"\s+href="(?:knowledge|activity-sheet)\.css">/g, '');
html = html.replace(/<script\s+type="module"\s+src="app\.js"><\/script>/,
  () => `${license}<script>${javascript.replace(/<\/script/gi, '<\\/script')}</script>`);
if (html.includes('src="app.js"') || html.includes('href="style.css"')) throw new Error('Entry-point embedding failed');
const inline = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if (inline.length !== 1) throw new Error('Expected one complete inline application script');
new Script(inline[0][1], { filename: 'sanzijing-final-inline.js' });
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, html);
console.log(JSON.stringify({ output, bytes: Buffer.byteLength(html), javascriptParsed: true, embeddedFont: true }));
