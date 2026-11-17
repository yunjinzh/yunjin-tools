# Super Minds 2 — source review

Source: supplied local PDF `Super Minds 2. Students Book () (z-library.sk, 1lib.sk, z-lib.sk).pdf`, 132 PDF pages, Cambridge University Press 2012 (copyright page checked). No Book 2 Teacher's Book or original audio supplied.

Page mapping: 1-based PDF page = printed page + 1. PyMuPDF zero-based index = printed page. Confirmed visually on printed pp4, 8–9, 14–15, 26–27, 38–39, 50–51, 62–63, 74–75, 86–87, 98–99, 110–111. Course page range 2–128 includes map, lessons, festivals and cut-outs; ordinary units finish at p117.

| ID | Exact unit name | Printed pages | Story pages | Skills selected | English for school |
|---|---|---|---|---|---|
|0|Back to school|4–9|8–9 The burglars|New classroom bridge from pp4–7|No CLIL in Starter; new learning-habits text clearly labelled|
|1|My day|10–21|14–15 What a day!|16 Janice the pilot|18–19 Time zones|
|2|The zoo|22–33|26–27 The Zoo Keeper|28 Hipsway Zoo|30–31 Animal families|
|3|Where we live|34–45|38–39 The tree on the track|40 Favourite places|42–43 Towns and art|
|4|The market|46–57|50–51 Bad apples|52 Banana cake|54–55 Bacteria and food|
|5|My bedroom|58–69|62–63 Tidy up!|New bridge based on64–65 room/thinking tasks|66–67 Recycling|
|6|People|70–81|74–75 Thunder's birthday|76 Incomplete invitations|78–79 Butterfly life cycle|
|7|Off we go!|82–93|86–87 The bus trip|89 Amazing long car|90–91 Measuring|
|8|Sports club|94–105|98–99 The football club|100 Favourite sports survey|102–103 Breathing|
|9|Holiday plans|106–117|110–111 Dream holidays|New bridge based on106–107 and112–113|114–115 Fairy tales|

## Visual checks

All ten full story spreads read visually, not based solely on OCR. Key verified details:
- Starter two burglars take a computer; Thunder lifts their car; police arrive.
- Thunder's day includes broken lamp, teeth brushing, school clock collision, keys under car, chicken dinner and broken bed.
- Zoo: Flash catches parrot, Thunder lifts hippo, Whisper calls snake, Misty frightens monkey; keys returned. No claim made about the precise mechanism of Misty's power.
- Train: initial shouted warning not understood; big STOP marking is then visible; train stops before tree. No claim about the precise method of making the marking.
- Market: each of four children has one bad apple; eight apples ordered, four bad; good/bad boxes exposed.
- Bedroom: Flash hides clothes/books/toys in wardrobe; T-shirt on lamp leads Mum to open it; objects fall out.
- Birthday: dog distracts Thunder during tug of war; Flash is too fast for her three-legged partner Whisper; Misty's blindfold problem makes the game unfair; no medals.
- Bus: sheep first, tyre second, airport destination reveal; driver offers beach trip.
- Football: boy claims team full; Flash/Misty form own team; both score; visible score 2–0; decline later invitation.
- Holiday wishes: Thunder tree house, Whisper swimming, Misty cousins, Flash grandma's garden; final garden party.
- All 90 target vocabulary items transcribed from first page of each unit. Ten-page contact sheets viewed.
- p28 Hipsway Zoo advert rendered separately to resolve OCR loss: 100 kinds of animals, big bird house, zoo keepers answer questions, one café, 10:00–6:00. Authoring uses only selected facts and labels this textbook information, not live opening hours.

## Adaptations and boundaries

- Every story/CLIL selected passage is explicitly `依据课文的教学改写`, not a complete verbatim transcript. Starter reading/world, bedroom reading, holiday reading are `依据单元目标新编`.
- Starter has no independent Phonics column. Its b/d/w exercise is explicitly a new review based on classroom vocabulary.
- Unit9 only introduces Can I/we in the map; second grammar slot uses actual p109 whole-year question matching and is explicitly a review.
- Unit1 pp18–19 timezone values are treated as a dated classroom model. The material expressly disallows using those values as real-time city clocks or flight schedules. Janice's local departure/arrival clocks are not used to infer flight duration.
- Unit5 phonics distinguishes short /ʊ/ in book/look from long /uː/ in room; avoids treating all oo spellings alike.
- No guessed CD listening answers supplied. The site may read authored texts with device TTS, not reproduce class audio or songs.
- Unit4 bacteria text uses some, not all, bacteria. No mould-growing experiment assigned; oven work assigned to adult. Unit8 breathing observation is not presented as health assessment.
- Unit7 unusual car description explicitly concerns the car in the text, not all limousines.
- New models/data (survey counts, room plan, drawing measurements, personal schedule) are labelled examples; children should supply actual values.
- No Book2 Teacher's Book was supplied. `teacherAvailable=False`, all `teacher` notes state student source or new authoring; no Teacher verification claim.

## Validation

Executed with Python helper imports. All IDs sequential, vocab counts 7–10, exactly 2 grammar points ×2 MCQs, 3 passages ×2 MCQs, 3 phonics pairs and1 phonics MCQ per unit. All answer indices valid, options unique, pages within2–128; all bilingual cards have nonempty English/Chinese. Totals:10 units,90 target vocabulary items,20 grammar points,30 passages,194 bilingual sentence cards,110 base questions,10 projects,53 glossary additions. Challenge/vocabulary questions are assigned/generated by parent compiler and excluded from110.
