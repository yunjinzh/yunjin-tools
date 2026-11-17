import assert from 'node:assert/strict';
import { CHAPTERS } from '../dist/content.js';
import { KNOWLEDGE_TOPICS, HISTORY_ERAS, activeDynasties, normalizeKnowledgeProgress, recordKnowledgeVisit, recordKnowledgeAnswer, recordKnowledgeOrder, mergeKnowledgeProgress } from '../dist/knowledge-model.js';

let passed = 0;
function test(name, run) { run(); passed++; console.log(`PASS ${name}`); }
const ids = year => activeDynasties(year).map(era => era.id);

test('all knowledge activities link to real source verses with distinct answer choices', () => {
  assert.deepEqual(KNOWLEDGE_TOPICS.map(topic => topic.id), ['astronomy', 'seasons', 'history']);
  for (const topic of KNOWLEDGE_TOPICS) {
    assert(topic.title && topic.goal && topic.note && topic.sources.length);
    assert.equal(new Set(topic.items.map(item => item.id)).size, topic.items.length);
    assert(topic.items.every(item => item.title && item.pinyin && item.summary && item.detail));
    assert(topic.verseLinks.every(link => CHAPTERS[link.chapterId]?.verses[link.verseIndex]));
    assert(topic.chapterIds.every(id => CHAPTERS[id]));
    assert.equal(topic.question.options.filter(option => option.id === topic.question.answer).length, 1);
    assert.equal(new Set(topic.question.options.map(option => option.id)).size, topic.question.options.length);
  }
});

test('chosen years distinguish two concurrent dynasties from three', () => {
  assert.deepEqual(ids(1100), ['song', 'liao']);
  assert.deepEqual(ids(1120), ['song', 'liao', 'jin']);
  assert.deepEqual(ids(1150), ['song', 'jin']);
  assert.equal(activeDynasties(1100)[0].label, '北宋');
  assert.equal(activeDynasties(1150)[0].label, '南宋');
});

test('annual boundaries and the Song transition are explicit', () => {
  assert.deepEqual(ids(915), []);
  assert.deepEqual(ids(916), ['liao']);
  assert(ids(1115).includes('jin'));
  assert(ids(1125).includes('liao'));
  assert(!ids(1126).includes('liao'));
  assert.equal(activeDynasties(1127)[0].label, '北宋转南宋');
  assert.equal(activeDynasties(1127)[0].transition, true);
  assert.deepEqual(ids(1279), ['song']);
  assert.deepEqual(ids(1280), []);
  for (const value of [null, '1120', 1120.5, NaN, Infinity]) assert.deepEqual(activeDynasties(value), []);
});

test('timeline lookups cannot mutate canonical era dates or phases', () => {
  const result = activeDynasties(1120);
  result[0].start = 5;
  result[0].phases[0].title = 'changed';
  assert.equal(HISTORY_ERAS[0].start, 960);
  assert.equal(activeDynasties(1120)[0].phases[0].title, '北宋');
});

test('malformed and unknown records do not manufacture topic completion', () => {
  for (const bad of [null, [], 'text', 3, false]) assert.deepEqual(normalizeKnowledgeProgress(bad), {});
  const clean = normalizeKnowledgeProgress({ astronomy: { seen: ['sun', 'moon', 'sun', 'bogus', 5], solved: 'true', helped: 1, order: ['xia'] }, history: { seen: ['sun', 'song'], solved: true, helped: true, order: ['zhou', 'xia', 'zhou', 'bad', 'shang'] }, bogus: { solved: true }, seasons: null });
  assert.deepEqual(clean.astronomy, { seen: ['sun', 'moon'], solved: false, helped: false });
  assert.deepEqual(clean.history, { seen: ['song'], solved: true, helped: true, order: ['zhou', 'xia', 'shang'] });
  assert.equal(clean.bogus, undefined);
  assert.equal(clean.seasons, undefined);
});

test('viewing an object persists once without counting as answering the question', () => {
  const input = { astronomy: { seen: ['sun'], solved: false, helped: false } };
  const first = recordKnowledgeVisit(input, 'astronomy', 'moon');
  assert.deepEqual(input.astronomy.seen, ['sun']);
  assert.deepEqual(first.astronomy.seen, ['sun', 'moon']);
  assert.equal(first.astronomy.solved, false);
  assert.deepEqual(recordKnowledgeVisit(first, 'astronomy', 'moon'), first);
  assert.deepEqual(recordKnowledgeVisit(first, 'astronomy', 'spring'), first);
  assert.deepEqual(recordKnowledgeVisit(first, '__proto__', 'moon'), first);
});

test('a wrong attempt then a correct attempt keeps assistance visible', () => {
  const wrong = recordKnowledgeAnswer({}, 'astronomy', { correct: false });
  assert.deepEqual(wrong.astronomy, { seen: [], solved: false, helped: true });
  const corrected = recordKnowledgeAnswer(wrong, 'astronomy', { correct: true, helped: false });
  assert.deepEqual(corrected.astronomy, { seen: [], solved: true, helped: true });
  assert.equal(wrong.astronomy.solved, false);
  assert.equal(recordKnowledgeAnswer({}, 'seasons', { correct: true }).seasons.helped, false);
});

test('invalid answer calls preserve valid work without mutating it', () => {
  const input = recordKnowledgeVisit({}, 'seasons', 'winter');
  for (const result of [null, undefined, {}, { correct: 'yes' }]) assert.deepEqual(recordKnowledgeAnswer(input, 'seasons', result), input);
  assert.deepEqual(recordKnowledgeAnswer(input, 'missing', { correct: true }), input);
});

test('early-history order keeps the chosen wrong order and round trips through JSON', () => {
  const input = recordKnowledgeVisit({}, 'history', 'xia');
  const next = recordKnowledgeOrder(input, ['zhou', 'xia', 'zhou', 'song', 'shang']);
  assert.deepEqual(next.history.order, ['zhou', 'xia', 'shang']);
  assert.equal(next.history.solved, false);
  assert.deepEqual(input.history.order, []);
  assert.deepEqual(normalizeKnowledgeProgress(JSON.parse(JSON.stringify(next))), next);
  assert.deepEqual(recordKnowledgeOrder(next, []).history.order, []);
});

test('merging unions observations and assistance without discarding completed attempts', () => {
  const local = { astronomy: { seen: ['sun'], solved: true, helped: false } };
  const remote = { astronomy: { seen: ['moon', 'sun'], solved: false, helped: true }, seasons: { seen: ['winter'], solved: false, helped: false } };
  const result = mergeKnowledgeProgress(local, remote);
  assert.deepEqual(result.astronomy, { seen: ['sun', 'moon'], solved: true, helped: true });
  assert.deepEqual(result.seasons.seen, ['winter']);
  assert.deepEqual(local.astronomy.seen, ['sun']);
  result.seasons.seen.push('spring');
  assert.deepEqual(remote.seasons.seen, ['winter']);
});

test('merging order prefers longer progress and keeps local order on ties', () => {
  const local = recordKnowledgeOrder({}, ['shang', 'xia']);
  assert.deepEqual(mergeKnowledgeProgress(local, recordKnowledgeOrder({}, ['zhou'])).history.order, ['shang', 'xia']);
  assert.deepEqual(mergeKnowledgeProgress(local, recordKnowledgeOrder({}, ['zhou', 'xia'])).history.order, ['shang', 'xia']);
  assert.deepEqual(mergeKnowledgeProgress(local, recordKnowledgeOrder({}, ['zhou', 'xia', 'shang'])).history.order, ['zhou', 'xia', 'shang']);
});

console.log(JSON.stringify({ passed, total: 11, scope: 'content links, annual timeline and pure progress transitions; no renderer or child learning-effect claims' }));
