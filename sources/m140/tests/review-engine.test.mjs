import assert from 'node:assert/strict';
import { CHAPTERS } from '../dist/content.js';
import { localDay, shiftDay, normalizeReviews, recordReview, getReviewQueue, mergeReviews } from '../dist/review-engine.js';

let passed = 0;
function test(name, run) { run(); passed++; console.log(`PASS ${name}`); }
const independent = (due, lastDay, streak = 0) => ({ due, lastDay, streak, lastResult: 'independent' });

test('legacy empty records and malformed root values produce an empty map', () => {
  for (const raw of [undefined, null, false, [], 'bad', 8]) assert.deepEqual(normalizeReviews(raw, CHAPTERS), {});
});

test('normalization keeps valid content keys and removes invalid or impossible dates', () => {
  const raw = {
    '0:0': independent('2026-11-15', '2026-11-14'),
    '39:q': independent('2026-11-15', '2026-11-14'),
    '0:999': independent('2026-11-15', '2026-11-14'),
    '40:0': independent('2026-11-15', '2026-11-14'),
    '00:0': independent('2026-11-15', '2026-11-14'),
    '1:0': independent('2026-02-29', '2026-02-28'),
    '2:0': independent('2026-11-15', 'yesterday'),
    '3:0': null,
    '4:0': { ...independent('2026-11-15', '2026-11-14'), streak: -5 },
    '5:0': { ...independent('2026-11-15', '2026-11-14', 4), lastResult: 'helped' },
  };
  const clean = normalizeReviews(raw, CHAPTERS);
  assert.deepEqual(Object.keys(clean), ['0:0', '39:q', '4:0', '5:0']);
  assert.equal(clean['4:0'].streak, 0);
  assert.equal(clean['5:0'].streak, 0);
  assert.notEqual(clean['0:0'], raw['0:0']);
});

test('calendar arithmetic crosses leap days, months and years without a DST hour offset', () => {
  assert.equal(shiftDay('2024-02-28', 1), '2024-02-29');
  assert.equal(shiftDay('2024-02-29', 1), '2024-03-01');
  assert.equal(shiftDay('2026-12-31', 1), '2027-01-01');
  assert.equal(shiftDay('2026-03-08', 1), '2026-03-09');
  assert.equal(shiftDay('2026-11-01', 1), '2026-11-02');
  assert.equal(shiftDay('2026-03-01', -1), '2026-02-28');
  assert.throws(() => shiftDay('2026-02-29', 1), TypeError);
  assert.throws(() => shiftDay('2026-11-14', 0.5), TypeError);
  assert.equal(localDay(new Date(2026, 10, 14, 23, 59)), '2026-11-14');
});

test('a new correct lesson answer schedules tomorrow without claiming review mastery', () => {
  const reviews = {};
  const item = recordReview(reviews, '0:0', { success: true, day: '2026-11-14' });
  assert.equal(item, reviews['0:0']);
  assert.deepEqual(item, independent('2026-11-15', '2026-11-14'));
});

test('due independent reviews progress to 3 then 7 days and remain at 7 days', () => {
  const reviews = { '0:0': independent('2026-11-15', '2026-11-14') };
  assert.equal(recordReview(reviews, '0:0', { success: true, isReview: true, day: '2026-11-15' }).due, '2026-11-18');
  assert.equal(reviews['0:0'].streak, 1);
  assert.equal(recordReview(reviews, '0:0', { success: true, isReview: true, day: '2026-11-18' }).due, '2026-11-25');
  assert.equal(reviews['0:0'].streak, 2);
  assert.equal(recordReview(reviews, '0:0', { success: true, isReview: true, day: '2026-11-25' }).due, '2026-12-02');
});

test('an early review and a same-day repeat never extend the due date or streak', () => {
  const reviews = { '0:0': independent('2026-11-18', '2026-11-15', 1) };
  const early = recordReview(reviews, '0:0', { success: true, isReview: true, day: '2026-11-16' });
  assert.equal(early.due, '2026-11-18'); assert.equal(early.streak, 1);
  const duplicate = recordReview(reviews, '0:0', { success: true, isReview: true, day: '2026-11-16' });
  assert.deepEqual(duplicate, early);
});

test('re-answering an overdue lesson is not counted as the scheduled review', () => {
  const reviews = { '0:0': independent('2026-11-15', '2026-11-14') };
  const result = recordReview(reviews, '0:0', { success: true, day: '2026-11-18' });
  assert.equal(result.due, '2026-11-15'); assert.equal(result.streak, 0);
});

test('helped success resets the interval and remains helped after a same-day correct retry', () => {
  const reviews = { '0:0': independent('2026-11-20', '2026-11-13', 2) };
  recordReview(reviews, '0:0', { success: true, helped: true, isReview: true, day: '2026-11-14' });
  const result = recordReview(reviews, '0:0', { success: true, isReview: true, day: '2026-11-14' });
  assert.deepEqual(result, { due: '2026-11-15', streak: 0, lastDay: '2026-11-14', lastResult: 'helped' });
});

test('a mistake then same-day correct answer still needs practice tomorrow', () => {
  const reviews = {};
  recordReview(reviews, '1:0', { success: false, day: '2026-11-14' });
  recordReview(reviews, '1:0', { success: true, isReview: true, day: '2026-11-14' });
  assert.deepEqual(reviews['1:0'], { due: '2026-11-15', streak: 0, lastDay: '2026-11-14', lastResult: 'retry' });
});

test('a later same-day mistake can shorten an advanced interval without deleting the record', () => {
  const reviews = { '0:0': independent('2026-11-15', '2026-11-14') };
  recordReview(reviews, '0:0', { success: true, isReview: true, day: '2026-11-15' });
  recordReview(reviews, '0:0', { success: false, day: '2026-11-15' });
  assert.deepEqual(reviews['0:0'], { due: '2026-11-16', streak: 0, lastDay: '2026-11-15', lastResult: 'retry' });
});

test('a clock rollback cannot overwrite newer practice', () => {
  const item = independent('2026-11-18', '2026-11-15', 1);
  const reviews = { '0:0': item };
  assert.deepEqual(recordReview(reviews, '0:0', { success: false, day: '2026-11-14' }), item);
});

test('queue includes due and overdue items with stable book order and explicit quiz keys', () => {
  const reviews = {
    '1:0': independent('2026-11-15', '2026-11-14'),
    '0:q': independent('2026-11-15', '2026-11-14'),
    '0:1': independent('2026-11-15', '2026-11-14'),
    '0:0': independent('2026-11-13', '2026-11-12'),
    '2:0': independent('2026-11-16', '2026-11-15'),
  };
  const queue = getReviewQueue(reviews, CHAPTERS, { day: '2026-11-15' });
  assert.deepEqual(queue.map(item => item.key), ['0:0', '0:1', '0:q', '1:0']);
  assert.equal(queue[2].verseIndex, null);
  assert.equal(getReviewQueue(reviews, CHAPTERS, { day: '2026-11-15', includeFuture: true }).length, 5);
});

test('merging same-day files conservatively retains the weaker result and earlier due date', () => {
  const local = { '0:0': independent('2026-11-21', '2026-11-14', 2) };
  const incoming = { '0:0': { due: '2026-11-15', lastDay: '2026-11-14', streak: 0, lastResult: 'retry' }, '1:q': independent('2026-11-18', '2026-11-15', 1) };
  const result = mergeReviews(local, incoming, CHAPTERS);
  assert.deepEqual(result['0:0'], incoming['0:0']);
  assert.equal(result['1:q'].due, '2026-11-18');
  assert.equal(local['0:0'].streak, 2);
  assert.deepEqual(mergeReviews(incoming, local, CHAPTERS), result);
});

test('merging prefers the newer calendar result and rejects malformed imported entries', () => {
  const local = { '0:0': { due: '2026-11-15', lastDay: '2026-11-14', streak: 0, lastResult: 'retry' } };
  const incoming = { '0:0': independent('2026-11-18', '2026-11-15', 1), '99:q': independent('2026-11-18', '2026-11-15') };
  assert.deepEqual(mergeReviews(local, incoming, CHAPTERS), { '0:0': incoming['0:0'] });
});

test('invalid direct calls fail without mutating a valid map', () => {
  const reviews = {};
  assert.throws(() => recordReview(reviews, '__proto__', { success: true }), TypeError);
  assert.throws(() => recordReview(reviews, '0:0', { success: true, day: '2026-02-30' }), TypeError);
  assert.throws(() => recordReview(reviews, '0:0', { success: 'yes' }), TypeError);
  assert.deepEqual(reviews, {});
});

console.log(JSON.stringify({ passed, total: passed, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
