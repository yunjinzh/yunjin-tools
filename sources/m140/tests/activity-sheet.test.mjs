import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderActivitySheet } from '../dist/activity-sheet.js';
import { CHAPTERS } from '../dist/content.js';
import { CHILD_GUIDES } from '../dist/child-content.js';

let checked = 0;
for (const chapter of CHAPTERS) {
  const guide = CHILD_GUIDES[chapter.id];
  for (let verseIndex = 0; verseIndex < chapter.verses.length; verseIndex++) {
    const card = renderActivitySheet(chapter, guide, { verseIndex });
    assert.equal((card.match(/<article\b/g) || []).length, 1);
    assert.equal((card.match(/<ruby>/g) || []).length, 4);
    assert(card.includes(chapter.title));
    assert(card.includes(guide.goal) && card.includes(guide.talk) && card.includes(guide.activity));
    assert(!card.includes(guide.verses[verseIndex].plain), 'explanation is hidden by default');
    assert(!/<(?:input|button|textarea|select)\b|\bid=/.test(card), 'card has no controls or duplicate IDs');
    assert(card.includes(`第 ${verseIndex + 1} / ${chapter.verses.length} 小段`));
    checked++;
  }
}
console.log(`PASS all ${checked} paragraphs across 40 chapters render a single identified activity card`);

const chapter = CHAPTERS[0], guide = CHILD_GUIDES[0];
const noPinyin = renderActivitySheet(chapter, guide, { showPinyin: false, showExplanation: true });
assert(!noPinyin.includes('<ruby>') && !noPinyin.includes('<rt>'));
assert(noPinyin.includes(guide.verses[0].plain));
console.log('PASS pinyin and child explanation toggle independently');

const malicious = { ...chapter, title: '<img src=x onerror=alert(1)>', verses: [{ text: '<script>恶意</script>，&测试。甲乙丙，丁戊己。', pinyin: '" onclick="alert(1)， a b。c d，e f。' }] };
const maliciousGuide = { goal: '<input>', talk: '"</p><script>', activity: '<iframe src=x>', verses: [{ plain: '<svg onload=alert(1)>' }] };
const escaped = renderActivitySheet(malicious, maliciousGuide, { showExplanation: true });
assert(!/<(?:img|script|input|iframe|svg)\b/i.test(escaped));
assert(escaped.includes('&lt;script&gt;') && escaped.includes('&lt;svg onload=alert(1)&gt;'));
assert(escaped.includes('&amp;测试'));
console.log('PASS all supplied text is escaped, including title, verse, pronunciation and guide');

for (const index of [-1, 200, NaN, '1', 1.2]) assert.equal(renderActivitySheet(chapter, guide, { verseIndex: index }), renderActivitySheet(chapter, guide));
assert.throws(() => renderActivitySheet({}, guide), TypeError);
assert.throws(() => renderActivitySheet(chapter, { ...guide, verses: [] }), TypeError);
console.log('PASS invalid positions fall back to the first paragraph and missing aligned content fails explicitly');

const css = readFileSync(new URL('../dist/activity-sheet.css', import.meta.url), 'utf8');
assert(css.includes('#activityPrintRoot{display:none}'));
assert(css.includes('body.printing-activity>:not(#activityPrintRoot){display:none!important}'));
assert(css.includes('body.printing-activity #activityPrintRoot{display:block!important'));
assert(!css.includes('body>:not(#activityPrintRoot)'));
assert(css.includes('@page{size:A4 portrait;margin:12mm}'));
console.log('PASS print isolation is opt-in and normal browser printing does not hide the page');
console.log(JSON.stringify({ paragraphs: checked, browserPrintPreviewVerified: false, actualPrinterVerified: false }));
