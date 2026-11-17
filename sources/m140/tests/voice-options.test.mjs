import assert from 'node:assert/strict';
import { listChineseVoices, resolveChineseVoice } from '../dist/voice-options.js';

let count = 0;
function test(name, run) { run(); count++; console.log('PASS', name); }
const list = voices => listChineseVoices({ getVoices: () => voices });

test('only Mandarin-compatible Chinese voices are eligible, including cmn tags', () => {
  const voices = [
    { lang: 'en-US', name: 'English' },
    { lang: 'yue-HK', name: 'Cantonese' },
    { lang: 'zh-HK', name: 'Hong Kong voice' },
    { lang: 'zh-MO', name: 'Macao voice' },
    { lang: 'zh-yue', name: 'Yue voice' },
    { lang: 'zh-CN', name: '粤语' },
    { lang: 'cmn-Hans-CN', name: 'Mandarin', voiceURI: 'cmn' },
    { lang: 'cmn-HK', name: 'Hong Kong Mandarin', voiceURI: 'cmn-hk' },
    { lang: 'zh-TW', name: 'Taiwan Mandarin', voiceURI: 'tw' },
    { lang: 'zh_CN', name: 'Mainland', voiceURI: 'cn' },
    { lang: 'zh-Hant', name: 'Traditional Chinese', voiceURI: 'hant' },
  ];
  assert.deepEqual(list(voices).map(v => v.voiceURI), ['cmn', 'cn', 'cmn-hk', 'tw', 'hant']);
});

test('automatic selection prioritizes Mainland/Hans, then Singapore and explicit Mandarin', () => {
  const voices = [
    { lang: 'zh-TW', name: 'Taiwan', voiceURI: 'tw' },
    { lang: 'zh', name: 'Generic', voiceURI: 'zh' },
    { lang: 'cmn', name: 'Mandarin', voiceURI: 'cmn' },
    { lang: 'zh-SG', name: 'Singapore', voiceURI: 'sg' },
    { lang: 'zh-Hans', name: 'Simplified', voiceURI: 'hans' },
  ];
  assert.deepEqual(list(voices).map(v => v.voiceURI), ['hans', 'sg', 'cmn', 'zh', 'tw']);
  assert.equal(resolveChineseVoice(voices).voiceURI, 'hans');
  assert.equal(voices[0].voiceURI, 'tw');
});

test('a valid user preference overrides automatic regional order', () => {
  const cn = { lang: 'zh-CN', voiceURI: 'cn' }, tw = { lang: 'zh-TW', voiceURI: 'tw' };
  assert.equal(resolveChineseVoice([cn, tw], 'tw'), tw);
  assert.equal(resolveChineseVoice([cn, tw], 'missing'), cn);
});

test('unsafe or non-Chinese preferences cannot bypass language filtering', () => {
  const en = { lang: 'en-US', voiceURI: 'saved' }, cn = { lang: 'zh-CN', voiceURI: 'cn' };
  assert.equal(resolveChineseVoice([en, cn], 'saved'), cn);
  assert.equal(resolveChineseVoice([en], 'saved'), undefined);
});

test('duplicate native URIs and legacy name-language duplicates are collapsed', () => {
  const a = { lang: 'zh-CN', name: 'A', voiceURI: 'a' };
  const b = { lang: 'zh-CN', name: 'Legacy' };
  const c = { lang: 'zh-TW', name: 'Legacy' };
  assert.deepEqual(list([a, { ...a }, b, { ...b, lang: 'zh_CN' }, c]), [a, b, c]);
  assert.equal(list([a, { ...a, voiceURI: 'other-provider' }]).length, 2);
});

test('empty, malformed and throwing voice providers have a safe empty result', () => {
  for (const input of [undefined, null, {}, { getVoices: () => null }, { getVoices() { throw Error('unavailable'); } }]) {
    assert.deepEqual(listChineseVoices(input), []);
  }
  assert.deepEqual(list([null, 2, { lang: 1 }, { name: 'No language' }]), []);
  assert.equal(resolveChineseVoice(null), undefined);
});
console.log(JSON.stringify({ passed: count, total: count, actualDeviceAudio: false }));
