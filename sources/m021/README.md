# 单词小岛 · Word Island

Buildless static Chinese child-friendly Three.js English practice MVP. Serve `dist/` over HTTP; no build step or remote runtime dependencies. Three.js r170 vendored locally under its MIT license header. Original vocabulary transcription: 399 entries, Intro + Units 1–9, original order and unit-specific senses.

## Features
- Three procedural 3D dioramas: amusement park, museum, nature-building campsite. Other units explicitly use generic practice scenery.
- Five-word groups, learn/listen/letter assembly/independent spelling; unit and group navigation.
- Listening uses a detected device English speech-synthesis voice. If unavailable it clearly reports this and does not award listening credit.
- Independent spelling, hinted spelling, listening, assembly and recognition tracked separately by entry ID.
- Five-column, seven-row same-word connected-group elimination. Orthogonal groups of at least three; gravity after removal; timed falling every four seconds; full board ends game; pause when hidden or parent/map dialog opens. Matching points never count as spelling mastery.
- Rabbit companion, star milestones at 5/15/30 update scene decorations.
- Browser-local new save, own-format JSON export/import with validation and replacement confirmation; reset confirmation. No account, microphone, analytics, child personal data, cloud sync or legacy-save migration.
- Clear WebGL-unavailable 2D fallback preserves all word practice.

## Tests
Run `npm test`: 10 rule/data tests including 3,000 randomized drop/elimination operations, vocabulary counts/identity/senses, grouping, exact spelling semantics, independent-vs-hinted tracking, gravity and full-board condition.
Syntax: `node --check dist/app.js`, `node --check dist/scene.js`, `node --check dist/rules.js`.
Browser interaction and visual QA is coordinated by the parent task; see its report for actual browser coverage. Automated pure-rule tests are not a substitute for browser QA.

## Known scope
- Scene objects are stylized exploratory props; not every vocabulary entry has a dedicated 3D object.
- Units 3–9 have generic practice rather than dedicated scenes.
- A correct independent answer records one successful attempt, not a claim of long-term mastery.
- Speech voice quality/availability depends on the operating system; no recorded audio bundled.
- Saves belong to this browser and origin; export backups before changing devices/origins.
