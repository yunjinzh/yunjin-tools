// Device-provided speech voices, not a promise of pronunciation accuracy.
// This Mandarin learning edition excludes explicitly Cantonese tags/names and
// ambiguous zh-HK/zh-MO voices. zh-TW/zh-Hant Mandarin remains user-selectable.
// Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice
function voiceLanguage(voice) {
  return typeof voice?.lang === 'string' ? voice.lang.trim().replace(/_/g, '-').toLowerCase() : '';
}

function isMandarinVoice(voice) {
  if (!voice || typeof voice !== 'object') return false;
  const lang = voiceLanguage(voice);
  if (!/^(?:zh|cmn)(?:-|$)/.test(lang)) return false;
  if (/(?:^|-)yue(?:-|$)/.test(lang)) return false;
  if (/^zh(?:-|$)/.test(lang) && /(?:^|-)(?:hk|mo)(?:-|$)/.test(lang)) return false;
  return !/(?:cantonese|\byue\b|粤语|粵語|广东话|廣東話)/i.test(String(voice.name ?? ''));
}

function voiceRank(voice) {
  const lang = voiceLanguage(voice);
  if (/(?:^|-)(?:cn|hans)(?:-|$)/.test(lang)) return 0;
  if (/(?:^|-)sg(?:-|$)/.test(lang)) return 1;
  if (/^cmn(?:-|$)/.test(lang)) return 2;
  if (lang === 'zh') return 3;
  return 4;
}

function usableVoices(voices) {
  if (!Array.isArray(voices)) return [];
  const seen = new Set();
  return voices.filter(isMandarinVoice).filter(voice => {
    const uri = typeof voice.voiceURI === 'string' ? voice.voiceURI.trim() : '';
    // A nonempty URI identifies the voice. Legacy/test voices may omit it;
    // preserve one per name/language in that case without mutating native data.
    const key = uri ? `uri:${uri}` : `name:${String(voice.name ?? '').trim()}|${voiceLanguage(voice)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => voiceRank(a) - voiceRank(b));
}

/** Return current Mandarin-compatible native voice objects, in stable priority order. */
export function listChineseVoices(synthesis) {
  try { return usableVoices(synthesis?.getVoices?.()); }
  catch { return []; }
}

/** Prefer an available saved URI; otherwise select an explicitly suitable Chinese voice. */
export function resolveChineseVoice(voices, preferredURI = '') {
  const eligible = usableVoices(voices);
  const preferred = typeof preferredURI === 'string' ? preferredURI.trim() : '';
  return (preferred && eligible.find(v => v.voiceURI === preferred)) || eligible[0];
}
