// Run the real app's state functions and event handlers in a minimal DOM stub.
// This verifies persistence semantics; it does not claim browser or GPU coverage.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { CHAPTERS } from '../dist/content.js';
import { CHILD_GUIDES } from '../dist/child-content.js';
import { localDay, normalizeReviews, recordReview, getReviewQueue, mergeReviews } from '../dist/review-engine.js';
import { KNOWLEDGE_TOPICS, normalizeKnowledgeProgress, mergeKnowledgeProgress } from '../dist/knowledge-model.js';

const source = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
function between(start, end) {
  const first = source.indexOf(start), last = source.indexOf(end, first + start.length);
  assert.ok(first >= 0 && last > first, `Source boundaries present: ${start}`);
  return source.slice(first, last);
}
const core = between('const esc=', 'let data=');
const checkpoints = between('function checkpoint()', 'function mountToast()');
const reviewRecording = between('function syncMistakes()', 'function renderLesson(');
const merge = between('function mergeRecords(', "$('#importButton')");
const reading = between('function renderReading()', 'function markMistake(');
const reset = between('let clearArmed=', "document.addEventListener('visibilitychange'");
const genericEvents = between("document.addEventListener('click',e=>{const b=e.target.closest('[data-bookmark]')", 'function showCurriculum(');
const plain = value => JSON.parse(JSON.stringify(value));

function createHarness() {
  const elements = new Map(), events = new Map();
  function makeElement(id = '') {
    let html = '';
    const element = {
      id, scrollTop: 0, textContent: '', className: '', onclick: null,
      set innerHTML(value) {
        html = value;
        for (const match of value.matchAll(/\bid="([^"]+)"/g)) elements.set(`#${match[1]}`, makeElement(match[1]));
      },
      get innerHTML() { return html; },
      after(node) { elements.set(`#${node.id}`, node); },
      remove() { elements.delete(`#${element.id}`); },
      focus() {},
    };
    return element;
  }
  for (const id of ['lessonBody', 'lessonFooter', 'clearProgress']) elements.set(`#${id}`, makeElement(id));
  const context = vm.createContext({
    CHAPTERS, CHILD_GUIDES, localDay, normalizeReviews, recordReview, getReviewQueue, mergeReviews,
    KNOWLEDGE_TOPICS, normalizeKnowledgeProgress, mergeKnowledgeProgress,
    matchMedia: () => ({ matches: false }),
    $: selector => elements.get(selector) || null,
    document: {
      createElement: () => makeElement(),
      addEventListener: (type, callback) => { const list = events.get(type) || []; list.push(callback); events.set(type, list); },
    },
  });
  vm.runInContext(`${core}
    let data=defaultData(), draft=null, current=0, activeDialog='#lessonDialog';
    function save(){} function toast(){} function stopSpeech(){} function speak(){}
    function guide(id=current){return CHILD_GUIDES[id]}
    function childVerse(id,i){return guide(id).verses[i]}
    function listenButton(){return ''} function pinyinControl(){return ''}
    function bookmarkButton(){return ''} function verseHTML(){return ''}
    function relatedKnowledge(){return ''} function showActivitySheet(){}
    const knowledgeUI={open(){},syncVisibility(){},setReduced(){},invalidate(){}};
    function setStage(stage){draft.stage=stage;checkpoint()}
    function toggleBookmark(){} function openLesson(){} function focusTheme(){} function showCurriculum(){} function applySettings(){}
    ${checkpoints}
    ${reviewRecording}
    ${merge}
    ${reading}
    ${reset}
    ${genericEvents}
    globalThis.testAPI={
      normalizeData,normalizeDraft,emptyDraft,maxStage,mergeRecords,syncMistakes,recordAttempt,renderReading,
      setState(raw,id=0){data=normalizeData(raw);current=id;draft=data.drafts[id]||emptyDraft(id);data.drafts[id]=draft},
      setData(raw){data=normalizeData(raw);draft=null},
      setActive(value){activeDialog=value},
      getState(){return data},getDraft(){return draft}
    };
  `, context, { filename: 'app-state-under-test.js' });
  return {
    api: context.testAPI,
    element: id => elements.get(`#${id}`),
    dispatch: (type, target) => { for (const callback of events.get(type) || []) callback({ target }); },
  };
}

let passed = 0;
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`); }
const rawData = overrides => ({ version: 1, completed: [], bookmarks: [], mistakes: [], visits: [], drafts: {}, reviews: {}, ...overrides });
const review = (lastResult = 'independent') => ({ lastDay: '2026-11-14', due: '2026-11-15', streak: 0, lastResult });

test('legacy records migrate with gentle settings and preserve completed courses', () => {
  const { api } = createHarness();
  const result = api.normalizeData(rawData({ completed: [0, 39], bookmarks: ['0:0'], last: 39 }));
  assert.deepEqual(plain(result.completed), [0, 39]);
  assert.equal(result.settings.challenge, 'gentle'); assert.equal(result.settings.large, true);
  assert.deepEqual(plain(result.reviews), {});
});

test('reading cursor, read history and help flags survive a JSON round trip', () => {
  const { api } = createHarness();
  const draft = { ...api.emptyDraft(39), readIndex: 2, readSeen: [0, 1], recallHelp: { 0: true }, orderHelp: true, quizHelp: true };
  const clean = api.normalizeDraft(plain(draft), 39);
  assert.equal(clean.readIndex, 2); assert.deepEqual(plain(clean.readSeen), [0, 1]);
  assert.equal(clean.recallHelp[0], true); assert.equal(clean.orderHelp, true); assert.equal(clean.quizHelp, true);
});

test('malformed child fields are normalized without unlocking future stages', () => {
  const { api } = createHarness();
  const result = api.normalizeDraft({ readIndex: 99, readSeen: [0, -1, 0, 999], stage: 4, recallHelp: { 0: 'true' }, quizHelp: 1 }, 0);
  assert.equal(result.readIndex, 1); assert.equal(result.stage, 0);
  assert.deepEqual(plain(result.readSeen), [0]); assert.deepEqual(plain(result.recallHelp), {}); assert.equal(result.quizHelp, false);
  const invalid = api.normalizeData({ version: 1, completed: null, bookmarks: false, drafts: null, reviews: [] });
  assert.deepEqual(plain(invalid.completed), []); assert.deepEqual(plain(invalid.reviews), {});
});

test('both two-choice and four-choice saved questions survive normalization', () => {
  const { api } = createHarness();
  const d = api.emptyDraft(0);
  d.recallChoices[0] = ['性本善', '人之初'];
  d.recallChoices[1] = ['苟不教', '性乃迁', '教之道', '贵以专'];
  const clean = api.normalizeDraft(d, 0);
  assert.equal(clean.recallChoices[0].length, 2); assert.equal(clean.recallChoices[1].length, 4);
});

test('advancing and returning a reading paragraph resets persisted scroll before saving', () => {
  const h = createHarness();
  h.api.setState(rawData({ drafts: { 39: h.api.emptyDraft(39) } }), 39);
  h.api.renderReading(); h.element('lessonBody').scrollTop = 700;
  h.element('nextStep').onclick();
  assert.equal(h.api.getDraft().readIndex, 1); assert.equal(h.api.getDraft().scroll, 0);
  assert.deepEqual(plain(h.api.getDraft().readSeen), [0]);
  h.element('lessonBody').scrollTop = 300; h.element('previousReading').onclick();
  assert.equal(h.api.getDraft().readIndex, 0); assert.equal(h.api.getDraft().scroll, 0);
});

test('opening the original text marks each exercise kind as assisted', () => {
  for (const stage of [1, 2, 3]) {
    const h = createHarness(), d = h.api.emptyDraft(0);
    d.readDone = true; d.recallAnswers = [true, true]; d.order = [0, 1, 2, 3]; d.orderSolved = true; d.stage = stage;
    if (stage === 1) d.recallAnswers[0] = false;
    if (stage === 2) d.orderSolved = false;
    h.api.setState(rawData({ drafts: { 0: d } }));
    h.dispatch('toggle', { open: true, matches: selector => selector === '.reference-sheet' });
    const updated = h.api.getDraft();
    assert.equal(stage === 1 ? updated.recallHelp[0] : stage === 2 ? updated.orderHelp : updated.quizHelp, true);
    const key = stage === 3 ? '0:q' : '0:0';
    assert.notEqual(h.api.getState().reviews[key].lastResult, 'independent');
  }
});

test('listening to the correct order cannot be recorded as an independent attempt', () => {
  const h = createHarness(), d = h.api.emptyDraft(0);
  d.readDone = true; d.recallAnswers = [true, true]; d.stage = 2;
  h.api.setState(rawData({ drafts: { 0: d } }));
  const say = { dataset: { say: CHAPTERS[0].verses[0].text } };
  h.dispatch('click', { closest: selector => selector === '[data-say]' ? say : null });
  assert.equal(h.api.getDraft().orderHelp, true);
  h.api.recordAttempt('0:0', true, h.api.getDraft().orderHelp);
  assert.notEqual(h.api.getState().reviews['0:0'].lastResult, 'independent');
});

test('post-answer reading and listening do not retroactively downgrade an independent result', () => {
  for (const stage of [1, 2, 3]) {
    const h = createHarness(), d = h.api.emptyDraft(0);
    d.readDone = true; d.recallAnswers = [true, true]; d.order = [0, 1, 2, 3]; d.orderSolved = true; d.quizSolved = true; d.stage = stage;
    const key = stage === 3 ? '0:q' : '0:0';
    h.api.setState(rawData({ drafts: { 0: d }, reviews: { [key]: review() } }));
    h.dispatch('toggle', { open: true, matches: selector => selector === '.reference-sheet' });
    if (stage === 2) {
      const say = { dataset: { say: CHAPTERS[0].verses[0].text } };
      h.dispatch('click', { closest: selector => selector === '[data-say]' ? say : null });
    }
    const updated = h.api.getDraft();
    assert.notEqual(stage === 1 ? updated.recallHelp[0] : stage === 2 ? updated.orderHelp : updated.quizHelp, true);
    assert.equal(h.api.getState().reviews[key].lastResult, 'independent');
  }
});

test('merging stronger progress preserves prior assistance, wrong answers and read history', () => {
  const h = createHarness(), local = h.api.emptyDraft(0), remote = h.api.emptyDraft(0);
  local.readSeen = [0]; local.recallHelp[0] = true; local.recallWrong[0] = ['人之初']; local.orderHelp = true;
  remote.readDone = true; remote.stage = 1; remote.readSeen = [1]; remote.recallAnswers[0] = true; remote.quizHelp = true;
  h.api.setState(rawData({ completed: [0], mistakes: [0], drafts: { 0: local }, reviews: { '0:0': review('retry') } }));
  h.api.mergeRecords(rawData({ drafts: { 0: remote } }));
  const merged = h.api.getState().drafts[0];
  assert.equal(merged.recallAnswers[0], true); assert.equal(merged.recallHelp[0], true);
  assert.equal(merged.orderHelp, true); assert.equal(merged.quizHelp, true);
  assert.deepEqual(plain(merged.readSeen).sort(), [0, 1]); assert.deepEqual(plain(merged.recallWrong[0]), ['人之初']);
  assert.deepEqual(plain(h.api.getState().mistakes), [0]);
});

test('independent review of one paragraph cannot clear an old whole-course mistake', () => {
  const h = createHarness();
  h.api.setData(rawData({ mistakes: [0], reviews: { '0:0': review() } }));
  h.api.syncMistakes(); assert.deepEqual(plain(h.api.getState().mistakes), [0]);
  h.api.setData(rawData({ mistakes: [0], reviews: { '0:0': review(), '0:1': review(), '0:q': review() } }));
  h.api.syncMistakes(); assert.deepEqual(plain(h.api.getState().mistakes), []);
});

test('merging records keeps local lesson position and adopts incoming position only on an empty device', () => {
  const h = createHarness();
  h.api.setData(rawData()); h.api.mergeRecords(rawData({ completed: [5], last: 5 }));
  assert.equal(h.api.getState().last, 5);
  h.api.setData(rawData({ completed: [0], last: 1 })); h.api.mergeRecords(rawData({ completed: [5], last: 5 }));
  assert.equal(h.api.getState().last, 1); assert.deepEqual(plain(h.api.getState().completed), [0, 5]);
});

test('clear plus undo preserves both old records and learning added after the clear', () => {
  const h = createHarness();
  h.api.setData(rawData({ completed: [0], bookmarks: ['0:0'], reviews: { '0:0': review('retry') }, last: 0 }));
  h.element('clearProgress').onclick(); h.element('confirmReset').onclick();
  assert.deepEqual(plain(h.api.getState().completed), []);
  h.api.setData(rawData({ completed: [2], bookmarks: ['2:0'], reviews: { '2:0': review() }, last: 2 }));
  h.element('undoReset').onclick();
  assert.deepEqual(plain(h.api.getState().completed).sort((a, b) => a - b), [0, 2]);
  assert.deepEqual(plain(h.api.getState().bookmarks).sort(), ['0:0', '2:0']);
  assert.equal(h.api.getState().last, 2); assert.ok(h.api.getState().reviews['0:0']); assert.ok(h.api.getState().reviews['2:0']);
});

test('app normalization migrates old backups and validates knowledge cursor and voice alongside lesson progress', () => {
  const { api } = createHarness();
  const legacy = api.normalizeData(rawData({ completed: [7] }));
  assert.deepEqual(plain(legacy.knowledge), {});
  assert.deepEqual(plain(legacy.knowledgeCursor), { topic: 'astronomy', item: 'sun', year: 1120 });
  assert.equal(legacy.settings.voiceURI, '');
  const result = api.normalizeData(rawData({
    completed: [7], knowledge: { astronomy: { seen: ['moon'], solved: true }, unknown: { solved: true } },
    knowledgeCursor: { topic: 'history', item: 'moon', year: 9999 },
    settings: { voiceURI: 'zh-CN-device-voice', challenge: 'challenge' },
  }));
  assert.deepEqual(plain(result.completed), [7]);
  assert.deepEqual(plain(result.knowledge), { astronomy: { seen: ['moon'], solved: true, helped: false } });
  assert.deepEqual(plain(result.knowledgeCursor), { topic: 'history', item: 'xia', year: 1250 });
  assert.equal(result.settings.voiceURI, 'zh-CN-device-voice');
  assert.equal(result.settings.challenge, 'challenge');
  const malformed = api.normalizeData(rawData({ knowledge: [], knowledgeCursor: { topic: 'invalid' }, settings: { voiceURI: { bad: true } } }));
  assert.deepEqual(plain(malformed.knowledge), {}); assert.equal(malformed.knowledgeCursor.topic, 'astronomy');
  assert.equal(malformed.settings.voiceURI, '');
});

test('importing knowledge-only learning keeps local cursor and voice while merging course and observation records', () => {
  const h = createHarness();
  const incoming = rawData({
    completed: [5], last: 5, knowledge: { astronomy: { seen: ['moon'], solved: true }, history: { seen: ['song'] } },
    knowledgeCursor: { topic: 'history', item: 'song', year: 1150 }, settings: { voiceURI: 'remote-voice' },
  });
  h.api.setData(rawData()); h.api.mergeRecords(incoming);
  assert.equal(h.api.getState().last, 5);
  assert.deepEqual(plain(h.api.getState().knowledgeCursor), incoming.knowledgeCursor);
  h.api.setData(rawData({
    knowledge: { astronomy: { seen: ['sun'], helped: true } },
    knowledgeCursor: { topic: 'astronomy', item: 'sun', year: 1120 }, settings: { voiceURI: 'local-voice' },
  }));
  h.api.mergeRecords(incoming);
  const merged = h.api.getState();
  assert.equal(merged.last, 0); assert.equal(merged.knowledgeCursor.item, 'sun');
  assert.deepEqual(plain(merged.knowledge.astronomy.seen), ['sun', 'moon']);
  assert.equal(merged.knowledge.astronomy.solved, true); assert.equal(merged.knowledge.astronomy.helped, true);
  assert.deepEqual(plain(merged.knowledge.history.seen), ['song']);
  assert.deepEqual(plain(merged.completed), [5]); assert.equal(merged.settings.voiceURI, 'local-voice');
});

test('clear and undo retain new knowledge learning, current cursor and local voice selection', () => {
  const h = createHarness();
  h.api.setData(rawData({
    knowledge: { history: { seen: ['xia'], order: ['xia'], solved: true, helped: true } },
    knowledgeCursor: { topic: 'history', item: 'xia', year: 1120 }, settings: { voiceURI: 'preferred-voice' },
  }));
  h.element('clearProgress').onclick(); h.element('confirmReset').onclick();
  assert.deepEqual(plain(h.api.getState().knowledge), {});
  assert.equal(h.api.getState().settings.voiceURI, 'preferred-voice');
  h.api.setData(rawData({
    knowledge: { history: { seen: ['song'], order: ['xia', 'shang', 'zhou'] }, seasons: { seen: ['winter'] } },
    knowledgeCursor: { topic: 'seasons', item: 'winter', year: 1150 }, settings: { voiceURI: 'new-preferred-voice' },
  }));
  h.element('undoReset').onclick();
  const restored = h.api.getState();
  assert.deepEqual(plain(restored.knowledge.history.seen), ['song', 'xia']);
  assert.deepEqual(plain(restored.knowledge.history.order), ['xia', 'shang', 'zhou']);
  assert.equal(restored.knowledge.history.solved, true); assert.equal(restored.knowledge.history.helped, true);
  assert.deepEqual(plain(restored.knowledge.seasons.seen), ['winter']);
  assert.equal(restored.knowledgeCursor.item, 'winter'); assert.equal(restored.settings.voiceURI, 'new-preferred-voice');
});

console.log(JSON.stringify({ passed, total: passed, scope: 'real state functions and event handlers; minimal DOM stubs, no browser rendering' }));
