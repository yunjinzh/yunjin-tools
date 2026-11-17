# Application state audit and transition contract

Audited: 2026-11-10. Scope: all first-party client code, all six report views, all 40,716 records. The hosting authentication gate is platform-owned. Source data, analytical rules, visual design and owner-only access are preserved.

## Decision

Use one immutable state model with named, validated events; keep browser effects in a separate adapter and retain the existing HTML/CSS views. A framework or statechart dependency is unnecessary for this static application. Browser agents and human controls use the same events and guards. Derived values such as result counts, page bounds and export availability are calculated from the current state, not synchronized as separate stores.

## Complete interactive inventory

| Domain | Previous implicit state | Explicit transitions and invariant | UX / DX / AX improvement |
| --- | --- | --- | --- |
| 1. Navigation, URL and history | Hash, `current`, active navigation class, other globals | `NAVIGATE`, URL decode and history hydration; exactly one valid view; old bare hashes remain supported | Deep links, reload and Back/Forward restore the current view; invalid URLs normalize safely; one readable route contract |
| 2. Structure comparison | `structMode` | `SET_STRUCTURE`: social ↔ natural | Selection survives refresh; pressed state exposed to assistive technology and agents |
| 3. Theme inspection | `themeMetric`, `chosenTopic`, independently replaced markup | `SET_THEME`: validated metric and topic; unknown topics rejected | Metric/topic synchronized with URL; detail changes preserve focus; one atomic configuration action |
| 4. Institution scope | `instSource`, `instTopic` | `SET_INSTITUTIONS`: source 0–3, topic -1–9 | Scope survives reload; changing a selector restores keyboard focus; same filtering semantics for agents |
| 5. Cross-fund institution list | Markup present plus permanently disabled button | `TOGGLE_CROSS`: collapsed ↔ expanded | List can be closed again; `aria-expanded`/`aria-controls`; state survives source changes and history |
| 6. Project exploration | Mutable `eState`, cached `filtered`, select contents, page labels and disabled buttons | `OPEN_EVIDENCE`, `FILTER_PROJECTS`, `RESET_FILTERS`, `SET_PAGE`; result state ready/empty is derived | Filters, sorting and page are bookmarkable; query edits coalesce in history; source changes clear incompatible inherited facets; explicit invalid agent facets fail rather than silently broadening results |
| 7. Record dialog | Native `dialog.open`, positional record index, focus held by DOM | closed → open → closing → closed; `OPEN_RECORD`, `CLOSE_RECORD_REQUEST`, `CLOSE_RECORD`; navigation closes dialogs | Stable checksum/worksheet/row identifiers, deep links, Escape/backdrop/Back convergence and focus return; direct-linked dialog close does not leave the site |
| 8. CSV and offline downloads | Immediate clicks and unconditional success toasts | idle → preparing → requested or failed; retry from requested/failed; request IDs reject stale completions | Duplicate requests blocked; source rows captured at request start; exceptions restore controls; wording says download requested, not saved; CSV formula escaping retained and extended |
| 9. Notifications | Independent timers mutating one element | hidden ↔ visible; increasing message IDs; only current ID may dismiss | Old timers cannot erase newer feedback; polite atomic announcements; explicit error tone |
| 10. Print lifecycle | Bare `window.print()` | idle ↔ printing, using beforeprint/afterprint and thrown-error recovery | Prevent repeated submission while printing; no claim that a document was printed or saved |
| 11. Method/topic disclosures | Native details state lost on every render | `SET_DISCLOSURE`, keyed by view/topic/index; native summary semantics retained | Expanded sections survive view reconstruction/history in the session; no custom accordion behavior to learn |
| 12. Browser-agent registration (new adapter) | No agent contract | unavailable → registering → ready/partial, feature detected; registration failures never break the report | Six small tools expose current state and existing actions, with schema and runtime validation; ordinary browser/offline use needs no WebMCP support |

Bootstrap and font loading remain native platform lifecycles: the inline app marks `data-app-ready` after the first render, and embedded fonts retain `font-display: swap`. No artificial network loading states were added because the report does not fetch application data. Native browser download persistence, print outcomes and the hosting sign-in gate are not observable application success states.

## Ownership

| File | Responsibility |
| --- | --- |
| `state.js` | Pure transitions, validation, stable record keys, filtering, derived result state, URL codec and durable snapshots |
| `app.js` | Report templates and DOM projections; analytical content preserved |
| `controller.js` | Rendering, focus, navigation effects, browser history, dialogs, download lifecycle, timers, native events and WebMCP adapter |
| `exports.js` | Pure CSV projection and spreadsheet-safe text escaping |
| `verify.mjs` | Data reconciliation, transition guards, history/URL round trips, export content, interleaving and all six view regressions |
| `verify-agent.mjs` | Mock registry integration, shared UI transitions, atomic validation, asynchronous dialog closure and download failure/retry |

## Persistence boundaries

- URL fragments contain the active view's settings and optional record key. They work on HTTPS and offline HTML. The query is in the fragment rather than a server request parameter.
- Browser history snapshots retain all view settings, disclosures, return focus and scroll within a session. Old history payloads are accepted only when version and route match; malformed snapshots fall back safely.
- Query keystrokes replace the current query entry after the first edit. Selection, pagination, drill-down and view navigation create entries. Back does not require stepping through every character.
- Download/print/notification/agent-registration state is transient and is never restored as an in-progress operation after reload.
- Offline downloads embed the active route and all data/fonts. They remove runtime-injected scripts and transient open/disabled/toast state. No service worker, server, localStorage or external runtime dependency was introduced.

## Browser-agent interface

Tools register only where `document.modelContext.registerTool` is supported. Runtime input is checked even when a caller has already validated against JSON Schema. Invalid batches leave UI and history unchanged. Tool errors are structured results rather than hidden exceptions. Project text is marked untrusted content. No tool sends data, changes access, edits source records or starts a download.

| Tool | Action |
| --- | --- |
| `read_research_state` | Read visible state, result count, bounded page records and provenance keys |
| `navigate_research_view` | Open one existing report view |
| `configure_research_view` | Atomically configure structure, themes or institutions |
| `filter_research_projects` | Patch/reset filters, sort and paginate through the same guarded model |
| `open_research_record` | Open the existing detail dialog by stable record key |
| `close_research_record` | Close the dialog and return after visible state has updated |

For local integration/testing the same guarded functions are available through the frozen `window.ResearchApp` adapter. It exposes detached/immutable snapshots and a bounded event-name log, not a mutable state object. WebMCP requires a supporting secure browser context; HTTP preview may legitimately have no registered tools. Ordinary accessible DOM controls remain available.

## Verification and residual limits

Run `node verify.mjs`, `node verify-agent.mjs`, then `python build.py`. The automated suite uses the full source data, tests invalid and interleaved transitions, and reconciles unchanged project counts, amounts and topic totals. Browser checks passed for URL reload, Back/Forward, dialog keyboard dismissal and focus return, dependent selectors, reversible cross-fund list, theme/structure persistence and offline-export request feedback. All 21 regression groups and the mocked agent-adapter integration passed. Native WebMCP discovery returned no tools in the HTTP preview; actual native discovery is not claimed. The browser download event observer timed out; the app reached requested state, but the saved offline file was not reopened in this run. Print completion remains browser-owned.

No finite test suite guarantees the absence of every regression. WebMCP availability depends on the host browser. A browser can block or cancel a download after a request; the app reports only what it can observe. Stable record keys identify locations within the supplied attachment versions; replacement attachments intentionally get new checksum-based keys.
