import assert from 'node:assert/strict';
import { createNarrator } from '../dist/narrator.js';

function fixture(voices = [], options = {}) {
  let clock = 0, sequence = 0;
  const timers = new Map(), events = new Map(), utterances = [], states = [], highlights = [];
  const synth = {
    voices, canceled: 0,
    getVoices() { return this.voices; },
    speak(u) { utterances.push(u); },
    cancel() { this.canceled++; },
    addEventListener(name, callback) { events.set(name, callback); },
    removeEventListener(name, callback) { if (events.get(name) === callback) events.delete(name); },
  };
  const env = {
    speechSynthesis: synth,
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    setTimeout(callback, ms) { timers.set(++sequence, { at: clock + ms, callback }); return sequence; },
    clearTimeout(id) { timers.delete(id); },
  };
  const narrator = createNarrator({ env, ...options, onState: s => states.push(s), onSegment: s => highlights.push(s) });
  const tick = ms => {
    const end = clock + ms;
    while (true) {
      const next = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      timers.delete(next[0]); clock = next[1].at; next[1].callback();
    }
    clock = end;
  };
  return { narrator, synth, utterances, states, highlights, timers, tick,
    voiceChanged(list) { synth.voices = list; events.get('voiceschanged')?.(); },
    listenerCount() { return events.size; },
  };
}
const zh = { lang: 'zh-CN', name: 'Test Chinese' };
const piece = id => ({ id, text: '人之初，性本善。' });
let count = 0;
function test(name, run) { run(); count++; console.log('PASS', name); }

test('delayed Chinese voice starts once and reads each segment in order', () => {
  const f = fixture();
  f.narrator.play([piece('one'), piece('two')]);
  assert.equal(f.narrator.getState(), 'loading');
  f.voiceChanged([zh]);
  assert.equal(f.utterances.length, 1);
  assert.equal(f.listenerCount(), 0);
  f.utterances[0].onstart();
  assert.equal(f.highlights.at(-1), 'one');
  f.utterances[0].onend();
  assert.equal(f.utterances.length, 2);
  f.utterances[1].onstart();
  assert.equal(f.highlights.at(-1), 'two');
  f.utterances[1].onend();
  f.tick(10000);
  assert.equal(f.narrator.getState(), 'idle');
  assert.equal(f.highlights.at(-1), null);
  assert.equal(f.states.at(-1).message, '朗读完成。');
  assert.equal(f.utterances.length, 2);
  assert.equal(f.timers.size, 0);
});

test('a second click while waiting cancels voice preparation and queued work', () => {
  const f = fixture();
  f.narrator.play([piece('one')]);
  f.narrator.play([piece('two')]);
  assert.equal(f.narrator.getState(), 'idle');
  f.voiceChanged([zh]); f.tick(10000);
  assert.equal(f.utterances.length, 0);
  assert.equal(f.listenerCount(), 0);
  assert.equal(f.timers.size, 0);
});

test('a second click during speaking stops rather than appending a queue', () => {
  const f = fixture([zh]);
  f.narrator.play([piece('one')]); f.utterances[0].onstart();
  f.narrator.play([piece('two')]);
  assert.equal(f.narrator.getState(), 'idle');
  assert.equal(f.utterances.length, 1);
  assert.equal(f.highlights.at(-1), null);
});

test('callbacks from a canceled session cannot change the next reading', () => {
  const f = fixture([zh]);
  f.narrator.play([piece('old')]); const old = f.utterances[0];
  old.onstart(); f.narrator.stop();
  f.narrator.play([piece('new')]);
  old.onend(); old.onerror({ error: 'interrupted' }); old.onstart();
  assert.equal(f.narrator.getState(), 'loading');
  assert.equal(f.utterances.length, 2);
  f.utterances[1].onstart();
  assert.equal(f.highlights.at(-1), 'new');
  assert.equal(f.narrator.getState(), 'speaking');
});

test('an English-only voice library never reads Chinese with a default English voice', () => {
  const f = fixture([{ lang: 'en-US' }]);
  f.narrator.play([piece('one')]); f.tick(1200);
  assert.equal(f.narrator.getState(), 'idle');
  assert.match(f.states.at(-1).message, /没有可用的中文声音/);
  assert.equal(f.utterances.length, 0);
  assert.equal(f.listenerCount(), 0);
});

test('failure to start is canceled after eight seconds and a later click can retry', () => {
  const f = fixture([zh]);
  f.narrator.play([piece('one')]); f.tick(8000);
  assert.equal(f.narrator.getState(), 'idle');
  assert.match(f.states.at(-1).message, /没有开始朗读/);
  f.narrator.play([piece('two')]);
  assert.equal(f.utterances.length, 2);
  f.utterances[1].onstart();
  assert.equal(f.narrator.getState(), 'speaking');
});

test('speech errors reset state and dispose removes pending callbacks', () => {
  const f = fixture([zh]);
  f.narrator.play([piece('one')]);
  f.utterances[0].onerror({ error: 'audio-busy' });
  assert.equal(f.narrator.getState(), 'idle');
  assert.match(f.states.at(-1).message, /暂时不能朗读/);
  f.narrator.play([piece('two')]); f.narrator.dispose();
  f.utterances[1].onstart(); f.tick(10000);
  assert.equal(f.narrator.getState(), 'idle');
  assert.equal(f.narrator.play([piece('three')]), false);
  assert.equal(f.timers.size, 0);
});

test('unsupported environments report the limitation without throwing', () => {
  const states = [];
  const narrator = createNarrator({ env: {}, onState: s => states.push(s) });
  assert.equal(narrator.play([piece('one')]), false);
  assert.equal(narrator.getState(), 'idle');
  assert.match(states.at(-1).message, /没有朗读功能/);
});
test('a saved Mandarin voice is selected and changing preference affects the next playback', () => {
  const first = { lang: 'zh-CN', name: 'Mainland', voiceURI: 'mainland' };
  const second = { lang: 'zh-TW', name: 'Taiwan Mandarin', voiceURI: 'taiwan' };
  let preference = 'taiwan';
  const f = fixture([first, second], { getVoiceURI: () => preference });
  f.narrator.play([piece('first')]);
  assert.equal(f.utterances[0].voice, second);
  f.narrator.stop(); preference = 'mainland';
  f.narrator.play([piece('second')]);
  assert.equal(f.utterances[1].voice, first);
});
test('a removed preference falls back to a current Mandarin voice without altering text', () => {
  const f = fixture([zh], { getVoiceURI: () => 'old-device-voice' });
  f.narrator.play([{ id: 'original', text: '凡训蒙，须讲究。详训诂，明句读。' }]);
  assert.equal(f.utterances[0].voice, zh);
  assert.equal(f.utterances[0].text, '凡训蒙，须讲究。详训诂，明句读。');
});
test('Cantonese-only libraries stay silent even when their URI was previously selected', () => {
  const f = fixture([{ lang: 'yue-HK', name: 'Cantonese', voiceURI: 'cantonese' }], { getVoiceURI: () => 'cantonese' });
  f.narrator.play([piece('one')]); f.tick(1200);
  assert.equal(f.utterances.length, 0);
  assert.equal(f.narrator.getState(), 'idle');
  assert.match(f.states.at(-1).message, /普通话/);
});
console.log(JSON.stringify({ passed: count, total: count, actualDeviceAudio: false }));
