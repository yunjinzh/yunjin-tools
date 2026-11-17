# Rehearsal — Stageshow gallery

Gold: copied the complete original Stageshow playground, kit and 69 example directories plus the comparison scene. Original demo geometry, choreography and posters are retained; the host, labels, navigation and playback presentation were redesigned for a Chinese gallery.

Verified:
- Production Vite build and TypeScript check passed.
- 70/70 direct static scene routes mounted in desktop Chrome, no host JavaScript errors.
- Search, category filtering, selecting a scene, pause/resume, replay, speed selection, static-poster mode tested.
- Host screenshots inspected at 1440px and 390px. No horizontal overflow at 390px.
- Desktop gold still passed film gate. Mobile loop (16s) and desktop states (19s) captured and visually inspected.

Fresh-eye review: gallery hierarchy is clear; the original compact hero's terminal microcopy is small. Retained native example source to show the skill as supplied. Desktop is recommended for inspecting fine typography. Preview cards are intentionally cropped thumbnails; click one to see its complete scene in the stage.

Unresolved upstream findings: original hero-demo mobile framing warnings (compact browser silhouette, bottom bleed, popup gutter), text-selection drift, dashed selection resizing and no-exit selection. Film motion sampling was inconclusive under concurrent local browser load; these checks are NOT reported as passing. These are present in the supplied example, not a certification of all original animations.

Not checked: every transition in every one of 70 examples, physical touch devices, non-Chrome browsers, complete loop-seam verification. Product studies are illustrative recreations, not connections to live product accounts.

Evidence: shots/qa.json, desktop.png, collection.png, mobile.png, mobile-stage.png, gold.png, hero-mobile-loop.png, hero-mobile.json, hero-states.png, hero-states.json. Local QA captures are excluded from hosting.
