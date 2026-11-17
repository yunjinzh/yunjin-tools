# 森间飞行 · Komorebi Flight

A fully procedural Three.js flying game set in an imagined Japanese cedar valley.

## Experience

- Fly a 1903 Wright Flyer through eight torii checkpoints.
- Explore a continuous forest with 7,212 procedural cedars, maples, a river, gabled timber houses, shrines, stone lanterns, arched bridges, mountains, clouds and birds.
- Keyboard and touch flight controls, three camera views, HUD, route map, pause, collision recovery and completion screen.
- Synthesized engine, wind and checkpoint sounds, initially muted.
- Aircraft information and historical source are available in the game.

## Controls

W/S or Up/Down: climb/descend. A/D or Left/Right: bank and turn.
Shift/Space: increase/decrease throttle. C: camera. P/Escape: pause.
R: retry checkpoint. M: sound. H: help. Enter: start or resume.

## Source layout

`dist/` is authored static output. No build step, external assets or network-loaded dependencies.

- `aircraft.js`: cambered cloth wings, ribs, spars, struts, rigging, forward biplane elevator, aft twin rudders, counter-rotating pusher propellers, engine, prone pilot and skids.
- `world.js`: deterministic terrain and procedural scenery, spatial collision grid.
- `flight.js`: arcade flight state and checkpoint progression.
- `batch.js`: material-based static geometry batching. The complete scene contains 95 mesh objects after batching, with instanced forests.
- `main.js`: rendering, interface, input, audio and optional WebMCP session controls.
- `style.css`: responsive game interface.
- `vendor/three.module.js`: local Three.js r180 engine, MIT license. The self-contained official CommonJS bundle has only its export syntax adapted to ESM.

Serve `dist/` through HTTP for local development. Opening the HTML via `file://` is not supported because it uses ES modules. Production hosting uses the static directory in `.openai/hosting.json`.

## Historical reference and artistic scope

NASA Glenn Research Center, **Wright Brothers Aircraft**:
https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/wright-brothers-aircraft/

The aircraft preserves the recognizable 1903 structure, including 40 ft / approximately 12.2 m wingspan and the forward elevator / rear rudder / twin pusher arrangement. It is an educational visual interpretation rather than an engineering replica. The forest journey, gate scale, flight duration, altitude and handling are fictional game settings; the physics is deliberately assisted and does not reproduce the original aircraft's instability.

## Validation

JavaScript syntax and local static references checked. Headless simulation completed the eight-gate course with real terrain and obstacle collision enabled. Verified pause, ground collision, recovery, missed-gate handling, gate headroom and finite geometry. No browser rendering or WebMCP runtime QA was requested or performed.
