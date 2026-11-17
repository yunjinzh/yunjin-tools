// Local, transparent practice scheduling. These intervals are a product rule,
// not a measurement of memory or a claim of scientifically optimal spacing.
const REVIEW_RESULTS = new Set(['independent', 'helped', 'retry']);
const RESULT_WEIGHT = { independent: 0, helped: 1, retry: 2 };

function calendarDate(day) {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const [year, month, date] = day.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || date < 1 || date > 31) return null;
  // setUTCFullYear avoids Date.UTC's special handling of years 00–99.
  const result = new Date(0);
  result.setUTCHours(0, 0, 0, 0);
  result.setUTCFullYear(year, month - 1, date);
  return result.getUTCFullYear() === year && result.getUTCMonth() === month - 1 &&
    result.getUTCDate() === date ? result : null;
}

function formatCalendar(date, utc = false) {
  const year = utc ? date.getUTCFullYear() : date.getFullYear();
  const month = utc ? date.getUTCMonth() + 1 : date.getMonth() + 1;
  const day = utc ? date.getUTCDate() : date.getDate();
  if (!Number.isFinite(year) || year < 1 || year > 9999) throw new RangeError('Date is outside the supported calendar');
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** The device's current local calendar date; never UTC day truncation. */
export function localDay(now = new Date()) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError('Expected a valid Date');
  return formatCalendar(now);
}

/** Add calendar days without local daylight-saving transitions. */
export function shiftDay(day, days) {
  const date = calendarDate(day);
  if (!date || !Number.isSafeInteger(days)) throw new TypeError('Expected YYYY-MM-DD and an integer day offset');
  date.setUTCDate(date.getUTCDate() + days);
  return formatCalendar(date, true);
}

function parseKey(key) {
  if (typeof key !== 'string' || !/^(0|[1-9]\d*):(q|0|[1-9]\d*)$/.test(key)) return null;
  const [chapter, verse] = key.split(':');
  const chapterId = Number(chapter), verseIndex = verse === 'q' ? null : Number(verse);
  return Number.isSafeInteger(chapterId) && (verseIndex === null || Number.isSafeInteger(verseIndex)) ?
    { chapterId, verseIndex } : null;
}

function chapterMap(chapters) {
  return new Map((Array.isArray(chapters) ? chapters : [])
    .filter(chapter => chapter && Number.isSafeInteger(chapter.id) && chapter.id >= 0)
    .map(chapter => [chapter.id, chapter]));
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) ||
    !calendarDate(raw.due) || !calendarDate(raw.lastDay)) return null;
  const lastResult = REVIEW_RESULTS.has(raw.lastResult) ? raw.lastResult : 'retry';
  const streak = lastResult === 'independent' && Number.isSafeInteger(raw.streak) && raw.streak >= 0 ?
    Math.min(raw.streak, 10000) : 0;
  return { due: raw.due, streak, lastDay: raw.lastDay, lastResult };
}

/** Strip invalid keys and schedule fields while retaining independently valid records. */
export function normalizeReviews(raw, chapters) {
  const result = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
  const known = chapterMap(chapters);
  for (const [key, value] of Object.entries(raw)) {
    const parsed = parseKey(key);
    if (!parsed) continue;
    const chapter = known.get(parsed.chapterId);
    if (!chapter || (parsed.verseIndex === null ? !chapter.quiz :
      !Array.isArray(chapter.verses) || parsed.verseIndex >= chapter.verses.length)) continue;
    const item = normalizeItem(value);
    if (item) result[key] = item;
  }
  return result;
}

/**
 * Mutates reviews[key] and returns that item. A caller must use a valid content
 * key; normalizeReviews additionally checks that the key exists in its edition.
 * A correct recognition answer records practice, not long-term mastery.
 */
export function recordReview(reviews, key, { success, helped = false, day = localDay(), isReview = false } = {}) {
  if (!reviews || typeof reviews !== 'object' || Array.isArray(reviews) ||
    !parseKey(key) || !calendarDate(day) || typeof success !== 'boolean') {
    throw new TypeError('Expected a review map, valid key, calendar day, and boolean success');
  }
  const previous = normalizeItem(reviews[key]);
  const lastResult = !success ? 'retry' : helped ? 'helped' : 'independent';
  const tomorrow = shiftDay(day, 1);
  // Clock rollback or an older event must not overwrite a newer record.
  if (previous && previous.lastDay > day) return (reviews[key] = previous);

  if (previous && previous.lastDay === day) {
    const result = RESULT_WEIGHT[lastResult] > RESULT_WEIGHT[previous.lastResult] ? lastResult : previous.lastResult;
    // Same-day retries never advance or postpone the next practice. A mistake
    // after an earlier successful attempt can bring the practice closer again.
    return (reviews[key] = {
      due: result === 'independent' ? previous.due : (previous.due < tomorrow ? previous.due : tomorrow),
      streak: result === 'independent' ? previous.streak : 0,
      lastDay: day,
      lastResult: result
    });
  }

  let due = tomorrow, streak = 0;
  if (previous && lastResult === 'independent') {
    if (isReview && previous.due <= day) {
      streak = Math.min(previous.streak + 1, 10000);
      due = shiftDay(day, streak === 1 ? 3 : 7);
    } else {
      // Reading/re-answering a lesson or reviewing early cannot lengthen its
      // interval. The scheduled review still has to be attempted when due.
      due = previous.due;
      streak = previous.streak;
    }
  }
  return (reviews[key] = { due, streak, lastDay: day, lastResult });
}

/** Due today or overdue, sorted by date then original book order. */
export function getReviewQueue(reviews, chapters, { day = localDay(), includeFuture = false } = {}) {
  if (!calendarDate(day)) throw new TypeError('Expected a valid calendar day');
  return Object.entries(normalizeReviews(reviews, chapters))
    .filter(([, item]) => includeFuture || item.due <= day)
    .map(([key, item]) => ({ key, ...parseKey(key), item }))
    .sort((a, b) => a.item.due.localeCompare(b.item.due) || a.chapterId - b.chapterId ||
      (a.verseIndex ?? Number.MAX_SAFE_INTEGER) - (b.verseIndex ?? Number.MAX_SAFE_INTEGER));
}

/** Merge without overwriting a same-day request for more help with an easier result. */
export function mergeReviews(local, incoming, chapters) {
  const result = normalizeReviews(local, chapters), additions = normalizeReviews(incoming, chapters);
  for (const [key, remote] of Object.entries(additions)) {
    const own = result[key];
    if (!own || remote.lastDay > own.lastDay) { result[key] = remote; continue; }
    if (remote.lastDay < own.lastDay) continue;
    const lastResult = RESULT_WEIGHT[remote.lastResult] > RESULT_WEIGHT[own.lastResult] ? remote.lastResult : own.lastResult;
    result[key] = {
      due: own.due < remote.due ? own.due : remote.due,
      streak: lastResult === 'independent' ? Math.min(own.streak, remote.streak) : 0,
      lastDay: own.lastDay,
      lastResult
    };
  }
  return result;
}
