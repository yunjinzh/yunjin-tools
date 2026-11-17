import { listChineseVoices, resolveChineseVoice } from './voice-options.js';

/**
 * A user-initiated, cancellable Chinese reading queue.
 * env is optional and allows deterministic tests without a browser or audio device.
 */
export function createNarrator({ getRate = () => .85, getVoiceURI = () => '', onState, onSegment, env } = {}) {
  const host = env ?? (typeof window !== 'undefined' ? window : {});
  const synthesis = host.speechSynthesis;
  const Utterance = host.SpeechSynthesisUtterance;
  const later = host.setTimeout?.bind(host) ?? globalThis.setTimeout;
  const clear = host.clearTimeout?.bind(host) ?? globalThis.clearTimeout;
  let state = 'idle';
  let generation = 0;
  let disposed = false;
  let voiceTimer = null;
  let startTimer = null;
  let voiceListener = null;
  let activeUtterance = null;
  let queue = [];
  let cursor = 0;

  function notify(next, message = '') {
    state = next;
    onState?.({ state: next, message });
  }

  function removeVoiceWait() {
    if (voiceTimer !== null) clear(voiceTimer);
    voiceTimer = null;
    if (voiceListener && synthesis?.removeEventListener) {
      synthesis.removeEventListener('voiceschanged', voiceListener);
    }
    voiceListener = null;
  }

  function removeStartWait() {
    if (startTimer !== null) clear(startTimer);
    startTimer = null;
  }

  function reset(message = '', cancel = true) {
    // Invalidate callbacks before cancel(), which may dispatch an error immediately.
    generation++;
    removeVoiceWait();
    removeStartWait();
    activeUtterance = null;
    queue = [];
    cursor = 0;
    if (cancel && synthesis) {
      try { synthesis.cancel(); } catch { /* Reading remains available as text. */ }
    }
    onSegment?.(null);
    notify('idle', message);
  }

  function chineseVoice() {
    try {
      return resolveChineseVoice(listChineseVoices(synthesis), getVoiceURI());
    } catch {
      return undefined;
    }
  }

  function readSegment(token, voice) {
    if (disposed || token !== generation) return;
    const segment = queue[cursor];
    if (!segment) { reset('朗读完成。', false); return; }
    let utterance;
    try {
      utterance = new Utterance(segment.text);
      utterance.voice = voice;
      utterance.lang = voice.lang || 'zh-CN';
      const rate = Number(getRate());
      utterance.rate = Number.isFinite(rate) ? Math.min(1.5, Math.max(.5, rate)) : .85;
    } catch {
      reset('设备暂时不能朗读。可以先看拼音，也可以稍后再试。');
      return;
    }
    activeUtterance = utterance;
    const isCurrent = () => !disposed && generation === token && activeUtterance === utterance;
    const total = queue.length;
    onSegment?.(null);
    notify('loading', total > 1 ? `正在准备第 ${cursor + 1} 段…` : '正在准备中文朗读…');
    startTimer = later(() => {
      if (!isCurrent()) return;
      reset('设备没有开始朗读。请再试一次，或先看拼音。');
    }, 8000);
    utterance.onstart = () => {
      if (!isCurrent()) return;
      removeStartWait();
      onSegment?.(segment.id);
      notify('speaking', total > 1 ? `正在读第 ${cursor + 1} / ${total} 段，再点一次可停止。` : '正在朗读，再点一次可停止。');
    };
    utterance.onend = () => {
      if (!isCurrent()) return;
      removeStartWait();
      activeUtterance = null;
      cursor++;
      if (cursor === queue.length) reset('朗读完成。', false);
      else readSegment(token, voice);
    };
    utterance.onerror = event => {
      if (!isCurrent()) return;
      reset(['interrupted', 'canceled'].includes(event?.error)
        ? '朗读已停止。'
        : '设备暂时不能朗读。可以先看拼音，也可以稍后再试。');
    };
    try { synthesis.speak(utterance); }
    catch { if (isCurrent()) reset('设备暂时不能朗读。可以先看拼音，也可以稍后再试。'); }
  }

  function play(segments) {
    if (disposed) return false;
    if (state !== 'idle') { reset(); return false; }
    if (!synthesis || typeof synthesis.speak !== 'function' || typeof Utterance !== 'function') {
      reset('这个浏览器没有朗读功能。可以先看拼音，请大人陪你读。', false);
      return false;
    }
    const prepared = Array.isArray(segments) ? segments
      .filter(s => s && typeof s.text === 'string' && s.text.trim())
      .map((s, i) => ({ id: String(s.id ?? i), text: s.text.trim() })) : [];
    if (!prepared.length) { reset('请先选择要听的文字。', false); return false; }
    reset();
    const token = ++generation;
    queue = prepared;
    cursor = 0;
    notify('loading', '正在寻找设备的中文声音…');
    const voice = chineseVoice();
    if (voice) { readSegment(token, voice); return true; }

    const tryReady = () => {
      if (disposed || token !== generation) return;
      const ready = chineseVoice();
      if (!ready) return;
      removeVoiceWait();
      readSegment(token, ready);
    };
    voiceListener = tryReady;
    synthesis.addEventListener?.('voiceschanged', voiceListener);
    voiceTimer = later(() => {
      if (disposed || token !== generation) return;
      const ready = chineseVoice();
      removeVoiceWait();
      if (ready) readSegment(token, ready);
      else reset('设备没有可用的中文声音（普通话）。请大人在系统中添加中文普通话语音；现在可以看拼音，也可以请大人陪读。');
    }, 1200);
    return true;
  }

  return {
    play,
    stop() { if (!disposed) reset(); },
    getState() { return state; },
    dispose() { if (disposed) return; reset(); disposed = true; },
  };
}
