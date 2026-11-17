# 故事芽 · Super Minds 1–6 六册学习书架

Private, buildless English learning app based on the user's six Student's Books and the supplied Teacher's Books for Levels 1 and 4. The existing Site ID and owner-only audience are preserved. The fourth-book course, its progress keys, its original source pages, and the Egyptian-cat intensive lesson remain available.

## Coverage

| Book | Stations | Tasks | Vocabulary practice items | Bilingual sentence cards | Newly authored base questions | Original student pages |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 10 | 80 | 88 | 167 | 110 | 2–128 |
| 2 | 10 | 80 | 90 | 194 | 110 | 2–128 |
| 3 | 10 | 80 | 86 | 240 | 110 | 2–127 |
| 4 | 10 | 80 | 89 | 267 | 110 | 2–127 |
| 5 | 10 | 80 | 91 | 253 | 110 | 2–127 |
| 6 | 10 | 80 | 94 | 281 | 110 | 2–127 |
| Total | 60 | 480 | 538 | 1,402 | 660 | 758 images |

Each book contains Starter plus Units 1–9, with eight areas per station: vocabulary, grammar, story, reading, pronunciation, cross-curricular learning, expression/project, and unit review. There are 120 grammar targets and 180 bilingual learning passages in total. Vocabulary counts are practice entries across books, not a count of distinct English words.

The 660 base questions, 538 vocabulary questions, and 480 review questions form 1,678 question records. Review questions deliberately repeat learning questions; the final checkpoint selects two per unit and shares their existing records. This is explicitly labelled as revision, not an independent exam or pronunciation assessment.

The retained cat lesson adds its separate 43 reading units, 57 vocabulary cards and 14 comprehension questions. Its data are not included in the table above.

This is coverage of every unit and major learning strand, not a transcription of every textbook exercise, lyric, or listening track. Reading cards distinguish excerpts, teaching retellings and newly authored practice. All numbered student pages remain available for full context. No complete Teacher's Book, source PDF or unprovided Workbook/audio is deployed.

## Homepage and routes

- `dist/index.html`: six-book shelf, range filters, bilingual unit/topic/word search, progress per book, continuation, records, all-book backup/import and separate complete offline downloads.
- `dist/book.html?book=1` through `?book=6`: shared course engine, with hash routes for map, unit tasks, word bag, review, parents, final review and original-page library.
- Original root routes such as `/#/unit/1/reading` redirect to Book 4, preserving earlier bookmarks.
- `dist/cat/index.html`: retained intensive lesson; its back link goes to Book 4.
- Mobile and desktop layouts use local CSS and system fonts. No network dependency is needed for the course text/data.

## Source grounding

Source documents were read from the supplied local attachments. Scans were OCRed and contents/critical narrative pages visually checked. Books 1 and 4 also use their supplied Teacher's Books for specific cross-checks; Books 2, 3, 5 and 6 explicitly state no Teacher's Book was supplied. The new books have dedicated research notes in `docs/source-review-book{1,2,3,5,6}.md`.

1-based PDF pagination differs from the printed textbook:

| Book | 1-based PDF page for printed page p | Retained printed range |
|---|---|---|
| 1 | p − 1 | 2–128 |
| 2 | p + 1 | 2–128 |
| 3 | p + 2 | 2–127 |
| 4 | p + 2 | 2–127 |
| 5 | p | 2–127 |
| 6 | p | 2–127 |

Books 1 and 2 end with festival/cut-out pages, not a grammar appendix. Books 3–6 link printed pp.118–127 as their grammar appendix. Books 5–6 alternate songs and functional-dialogue work; dialogue sections are not advertised as songs. New pronunciation practice based on a dialogue target is labelled as authored practice.

Selected content avoids treating old statistics, records and travel listings as current information. Fictional meetings, magical cures and time-travel scenes are clearly framed as stories. Source images remain unchanged. Lower-level source scans can contain cropped edges; Book 1's teacher text helped resolve the selected narrative details. The final FRIENDS plot in Book 3 and the full Book 5 narrative/grammar targets received independent source review. A potentially ambiguous some/any distractor was replaced, and Book 6's /aɪ/ and /eɪ/ heading correctly says diphthongs.

Book 4 retains the established content decisions: the T77 sample is labelled as a teacher sample, the planetarium poem is a fake clue, the map is hidden in a trumpet while Ben plays trombone, the last clue is on an oar, and the treasure is given to the museum. Original cat photos remain in `dist/cat/source-pages/`.

## Progress, speech and recording

- Local keys: `storysprout:super-minds-N-v2`, N=1…6; Book 4's exact previous key and IDs are retained. Legacy Book 4 state lacking `bookNumber` is accepted. Each new state identifies its book; mismatching book-number imports are rejected.
- `storysprout:egyptian-cat-v1` stays unchanged; Book 4 and global exports include it. `storysprout:last-book` stores the latest opened book for continuation.
- Per-book export/import and shelf-wide export/import are separate and labelled. Shelf import also accepts previous Book 4 backups. Import previews replacements, validates answers against current question data, drops unknown IDs, and rolls back prior writes if a later localStorage write fails. Invalid local records can be retained in an export's recovery field rather than silently exported as blank normal records.
- Stars count currently correct questions, so repeated clicks cannot farm rewards. Heard/self-read/answers are independent. Reading completion requires self-read plus comprehension; creation also requires written notes and self-assessed tasks/retelling. Beginner notes can be six characters; other books use fifteen.
- `speechSynthesis` supplies computer speech with available English voices and 0.65/0.8/1 rate. Chinese explanations use Chinese speech. This is not the textbook CD. Voice availability and offline speech depend on the device.
- Optional microphone recordings stay in the page, stop on navigation/hidden state, and are limited to three minutes. They are not uploaded, automatically assessed or included in backups. Download before refreshing. Denied or unavailable microphones have an oral-retelling fallback.
- No analytics, external AI, translation service, child account or third-party API is used. User-written text is escaped before display.

## Authoring, assets and rebuilding

- `scripts/books/bookN.py`: new Books 1,2,3,5,6, with `scripts/book_helpers.py`.
- `scripts/build-course.py` and `scripts/course-readings.py`: established Book 4 authoring source. They generate the legacy `dist/course-data.js` used by regression tests and the six-book compiler.
- `scripts/build-six.py`: validates and assigns stable IDs, emits each `dist/books/N/course-data.js` and the shelf catalog. Partial flags are for local authoring only; publication uses the full default build.
- `dist/course-core.js`: factory-backed scoring, validation and completion; `course-app.js` is the active-book UI.
- `dist/book-loader.js`: loads the chosen book without fetch, supporting local `file://` packages. `offline-env.js` identifies the selected book inside an offline package.
- `dist/shelf.js`, `shelf.css`, `shelf-redirect.js`: global shelf, state aggregation and prior-route compatibility.
- `scripts/render-source-pages.py SOURCE_DIRECTORY`: regenerate the five new student-page asset sets using the supplied PDFs, PyMuPDF and Pillow. Book 4's existing `dist/pages` assets remain unchanged.
- `scripts/make-offline.py`: rebuild the retained cat single-file offline HTML.
- `scripts/package-offline.py`: generate six complete per-book ZIPs, verify integrity/source-page count, and enforce the individual static asset cap (25 MiB). Each ZIP contains its own `index.html`, course program/data and original-page images. Book 4 also includes the cat lesson. Other books can be opened online via the shelf link.

Rebuild after content or UI edits:

```sh
# Only if Book 4's authoring sources changed:
python scripts/build-course.py

python scripts/build-six.py
python scripts/make-offline.py
node scripts/verify.mjs
python scripts/package-offline.py
```

Do not delete the `pages` or `cat` image folders: they are actively used by the source-page viewer and retained intensive lesson. Complete per-book packages are approximately 15.3–23.7 MiB; avoiding one huge six-book ZIP also keeps every hosted file within the size limit.

## Verification and limitations

- Six-book Node VM checks: 11,849 assertions across all 480 task renders, curriculum schema, question options/answers, 758 source assets, page boundaries, source labelling, old Book 4 state, per-book isolation, TTS cancellation, shelf search/filter/continuation, global backup preview, rollback on failed multi-book writes, single-book import preservation and relative entrypoint assets.
- Established Book 4 regression suite: 1,862 assertions, including completion rules, microphone-denied handling, unsafe-text escaping, cat backup rollback and clue sequencing.
- Retained cat regression suite: 204 assertions.
- Offline ZIP integrity and required files/source-page counts validated for all six books; every file remains below the static-asset size limit. Additional loader/offline and static checks are documented by the verification script output.
- Sampled compressed source images were visually inspected for usable textbook text and correct printed page numbers. HTML IDs and CSS delimiters were checked.

These are content, source-image and simulated-DOM checks. This managed runtime has no required browser-control capability, so no preview server, substitute browser or screenshot automation was used. Actual viewport appearance, browser-specific voices, speaker output and microphone hardware remain untested. Do not describe these checks as a passing real-browser/audio test.
