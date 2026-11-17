# Super Minds 1 — content/source review

Authoring file: `/workspace/sites/storysprout-reading-a762/scripts/books/book1.py`

## Inputs and pagination

- Local Student's Book: `Super Minds Level 1 Student’s book (Puhta H., Gerngross G.) (z-library.sk, 1lib.sk, z-lib.sk).pdf`.
- Local Teacher's Book: `Super Minds 1. Teachers Book () (z-library.sk, 1lib.sk, z-lib.sk).pdf`.
- Student PDF starts with printed page 2; printed p = 1-based PDF page + 1. The last PDF page is unnumbered cover/back-cover material. `pageMin=2`, `pageMax=128` correctly retains the numbered instructional/appendix range.
- Student scans have occasional cropped right edges and noisy OCR. Read the rendered contents pages and all 20 story pages (the opening page plus ending on the facing page). Corroborated storyline and phonics in the Teacher's Book rather than inventing missing text from OCR.
- OCR references: `book1/text.json` (128 PDF pages), `teacher1/text.json` (251 PDF pages). Teacher references below use printed T-numbers, not PDF page indices.

## Exact unit map verified against printed 2–3

| ID | Title | Printed pages | Story | Phonics | Subject reading |
|---|---|---|---|---|---|
| 0 | Friends | 4–9 | Meet the Super Friends, 8–9 | Alphabet names, p6; new bridge exercise, not a phoneme lesson | New greeting/friendship bridge |
| 1 | At school | 10–21 | Watch out, Flash!, 14–15 | short a, p15 | Paint colour mixing, 18–19 |
| 2 | Let's play! | 22–33 | The go-kart race, 26–27 | short e, p27 | Tangrams, 30–31 |
| 3 | Pet show | 34–45 | The spider, 38–39 | short i, p39 | Camouflage, 42–43 |
| 4 | Lunchtime | 46–57 | The pizza, 50–51 | short o in the book's British pronunciation, p51 | Fruit/vegetable growth, 54–55 |
| 5 | Free time | 58–69 | We're lost!, 62–63 | short u, p63 | Healthy activities and survey, 66–67 |
| 6 | The old house | 70–81 | At the house, 74–75 | h, p75 | Habitats, 78–79 |
| 7 | Get dressed | 82–93 | The cap, 86–87 | sp/st, p87 | Materials, 90–91 |
| 8 | The robot | 94–105 | The problem, 98–99 | hard g initially/finally, p99 | Skeleton, 102–103 |
| 9 | At the beach | 106–117 | The top of the hill, 110–111 | ee/ea examples with /iː/, p111 | Weather map and postcards, 114–115 |

Pages 118–128 contain festivals and cut-out materials; these remain reference pages rather than being misrepresented as extra narrative units or grammar appendices. The book has no unit grammar-reference appendix (`grammarAppendix=False`, `grammarPage=None`).

## Teacher/source checks

- Starter: T5 explicitly gives Misty six, Whisper eight, Flash eight, Thunder seven. The module uses a **new** child Lily for its age model, clearly labelled. T8 confirms Tabby is four and Whisper speaks to animals. Rendered p8 shows Thunder's strength, Flash's speed and Misty's invisibility.
- T14–T15: Flash apologises after colliding with a man; friends return school objects; she has forgotten her bag. Phonics /æ/, not the letter-name A.
- T26 and rendered 26–27: Ben interferes with Misty's car; Thunder helps; Misty wins. The retelling does not substitute a different winner or erase the unfair incident.
- T38–T39 and rendered 38–39: friends initially fear the spider, admire its web, then fear the many spiders. The text does not falsely say all fear disappears permanently. Teacher T39's first comprehension statement is false because Whisper likes the spider but Flash initially does not.
- T40's listening script gives Lucy the lizard first, Donald the dog second, Sally the spider third. Reading module explicitly says it adapts this activity; it is not presented as an original printed continuous paragraph. No original audio is claimed.
- T50–T51: Misty jumps the queue and receives sausages and peas; the other three later receive hot pizza. The retelling retains that contrast.
- T62–T63 and rendered 62–63: rabbit guides the lost friends; the carrot is thrown, rabbit hits its head and says it is now lost. Retelling includes the actual humorous ending.
- T74–T75: Misty enters first, sees a cat, spiders and rats, reassures friends, then startles them when appearing. Safety-relevant role play is kept as understanding a fantasy story, not an instruction to enter derelict houses.
- T86–T87: Whisper's actual cap is under a chair in his bedroom; Gary owns the similar cap. Whisper returns it and apologises. Retelling avoids saying Gary stole it.
- T98–T99: missing batteries are brought by Flash; the head is facing the wrong way, causing reversed speech. Misty turns the head to fix speech. This is not falsely attributed only to replacing batteries.
- T110–T111: Flash meets the blocking rock; Thunder lifts it; all four arrive at the top together. MCQ explicitly includes “no one alone” as the correct answer.
- T15, T27, T39, T51, T63, T75, T87, T99, T111 checked for phonics. Stated IPA is limited to the supplied examples. Short-o uses the book's British /ɒ/ with a note about device-voice accents. No claim that every written `ea` has /iː/.

## Teaching labels and precision

- Every passage is marked either `依据课文的教学改写` or `依据单元目标新编`; there are no unlabelled invented “original textbook” readings.
- Starter friendship/world bridge, several personal-description readings, shopping-basket numbers and balanced-week bridge are new lesson-target activities.
- All 30 passages have 4–6 short bilingual cards; all English reading-card sentences are at most 12 words under an English-word token count. Some story vocabulary is glossed explicitly because a full story needs more than the unit word list.
- Chinese translations checked against English subject, number, tense/function and scene. Names retained consistently. Flash and Misty use she; Whisper and Thunder use he.
- Paint “primary colours” explicitly refers to this book's red/yellow/blue paint-mixing activity, avoiding a universal claim across colour models.
- Cloth passages use “some” and “in this lesson” where source examples do not justify universal material claims.
- The habitat card distinguishes the Arctic for polar bears. Jungle is an example habitat for tigers, not their sole habitat.
- Weather examples are identified as the book's map scenario, not current conditions or a year-round national climate claim.
- No pronunciation auto-scoring, CD playback, original recording availability, or guaranteed study-time claims.

## Validation completed

Executed Python via `runpy` with shared `book_helpers` import:

- 10 units, IDs 0–9; 88 core vocabulary entries; 61 glossary entries.
- 20 grammar points; exactly 2 questions per point.
- 30 passages, 167 bilingual reading cards; exactly 2 comprehension questions per passage.
- 10 phonics modules, each 3 pairs and 1 objective question.
- 110 authored base questions total. Each has exactly 3 unique choices, a valid integer answer index and an explanation.
- All 60 comprehension questions reviewed: correct answer is recoverable from the associated paragraph's sentence cards (or clear stated main idea).
- 10 creation modules, each exactly 3 concrete tasks, a writing frame, English example, Chinese success criteria and specific teacher/source explanation.
- Every passage's reference pages lie within its unit's printed start/end bounds.
- No source uncertainties remain that block the selected learning content. Cropping/OCR limitations concern source-image quality and are documented above; teacher checks resolved the narrative details used.

UI, browser interaction, audio/microphone behaviour and publication are owned by the parent task and were not changed or tested by this content subtask.
