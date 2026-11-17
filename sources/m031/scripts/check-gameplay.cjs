const assert = require('node:assert/strict');
const { STRATAGEMS } = require('../dist/data.js');
const E = require('../dist/engine.js');
const { StratagemGameplay, dist } = require('../dist/game-core.js');

function setup(id) {
 const scenario = STRATAGEMS[id - 1]; let state = E.start(scenario);
 const game = new StratagemGameplay({
  resolve(key) { const result = E.act(scenario, state, key); state = result.state; game.sync(state); return result.accepted; },
  parameter(value) { state = E.parameter(scenario, state, value); game.sync(state); }
 });
 game.reset(scenario, state);
 return { scenario, game, state: () => state, undo() { state = E.undo(state); game.restore(game.snapshots.pop(), state); } };
}
function settle(game, label) {
 for (let i = 0; game.order && !game.failed && i < 1200; i++) game.tick(.1);
 assert(!game.failed, `${label}: ${game.lastMessage}`);
 assert(!game.order, `${label}: action did not finish`);
}
function correct(run) {
 const phase = run.state().phase, task = run.scenario.steps[phase];
 if (task.range) run.game.setParameter(Math.ceil((task.range.low + task.range.high) / 2));
 assert(run.game.launch(task.answer), `${run.scenario.id}/${phase}: ${run.game.lastMessage}`);
 assert.equal(run.state().phase, phase, 'Actions must not advance before actual movement/response');
 settle(run.game, `${run.scenario.id}/${phase}`);
 assert.equal(run.state().phase, phase + 1, `${run.scenario.id}/${phase} did not advance`);
}
for (const scenario of STRATAGEMS) {
 const run = setup(scenario.id);
 for (let phase = 0; phase < 3; phase++) correct(run);
 assert(run.state().done); assert.equal(run.game.snapshots.length, 3);
 const final = run.game.snapshot(); run.undo();
 assert.equal(run.state().phase, 2); assert(!run.game.order); assert(!run.game.failed);
 assert(run.game.metrics.actions < final.metrics.actions);
 correct(run); assert(run.state().done);
}

// Free movement changes physical state without completing a teaching stage.
{
 const run = setup(6), original = { ...run.game.player };
 run.game.plan({ x: original.x + 5, z: original.z }); run.game.launchFree();
 run.game.paused = true; run.game.tick(.1); assert.equal(dist(original, run.game.player), 0);
 run.game.advanceTurn(); assert(dist(original, run.game.player) > 0);
 run.game.paused = false; settle(run.game, 'free movement');
 assert.equal(run.state().phase, 0); assert(run.game.metrics.stamina < 100);
}
// A cancelled order preserves real costs but cannot commit a stage.
{
 const run = setup(1); run.game.launch('routine'); run.game.tick(.1);
 const moved = run.game.snapshot(); run.game.cancel(); run.game.tick(.1);
 assert.equal(run.state().phase, 0); assert.deepEqual(run.game.player, moved.player);
 assert(run.game.metrics.stamina < 100);
}
// Distant deployment spends a resource and gives no stage credit.
{
 const run = setup(6); const before = run.game.metrics.resource;
 assert.equal(run.game.launch(run.scenario.steps[0].answer, { x: -28, z: -18 }), false);
 assert.equal(run.state().phase, 0); assert.equal(run.game.metrics.resource, before - 1);
}
// Maintaining cover is a physical precondition for hidden movement.
for (const id of [8, 21]) {
 const run = setup(id); correct(run); run.game.toggleCover();
 assert.equal(run.game.launch(run.scenario.steps[1].answer), false);
 run.game.toggleCover(); correct(run);
}
for (const id of [8, 21]) {
 const run = setup(id); correct(run); run.game.launch(run.scenario.steps[1].answer); run.game.toggleCover();
 assert(run.game.failed); assert.equal(run.state().phase, 1);
}
// Parameters stay immutable throughout an allocation; next-turn input uses the latest value.
{
 const run = setup(11); correct(run); run.game.setParameter(8); run.game.launch('allocate');
 assert.equal(run.game.setParameter(5), false); assert.equal(run.state().value, 8);
 settle(run.game, 'locked allocation'); assert.equal(run.game.metrics.resource, 2);
 const wait = setup(4); correct(wait); wait.game.setParameter(5); wait.game.advanceTurn(); assert.equal(wait.state().value, 6);
}
for (const id of [14, 26, 30, 35]) {
 const run = setup(id), pairs = {14:['old','goal'],26:['a','b'],30:['key','host'],35:['b','c']};
 assert.equal(run.game.connect(...pairs[id]), false); assert.equal(run.state().phase, 0);
}
// Convoy consistency matters; rerouting must not immediately complete a crossing.
{
 const run = setup(1); correct(run); const before = run.game.metrics.alarm;
 run.game.plan({ x: 0, z: 17 }); assert.equal(run.game.launch('routine'), false);
 assert(run.game.metrics.alarm > before); assert.equal(run.state().phase, 1);
 run.game.clearRoute(); correct(run);
}
// Leaving an exit open allows escape; restart restores the conditions.
{
 const run = setup(22); correct(run);
 for (let i = 0; i < 200; i++) run.game.tick(.1);
 assert(run.game.failed); assert.equal(run.state().phase, 1);
 run.game.reset(run.scenario, E.start(run.scenario)); assert(!run.game.failed);
}
// Cutting supply has a delayed downstream consequence.
{
 const run = setup(19); correct(run); correct(run);
 assert(run.game.flags.cut); assert.equal(run.game.metrics.supply, 100);
 run.game.launch('effect'); run.game.tick(.1); assert.equal(run.state().phase, 2);
 settle(run.game, 'supply propagation'); assert(run.game.metrics.supply <= 35);
}
// Guard visibility can fail a stealth run; pause cannot erase it.
{
 const run = setup(6); const g = run.game.guards[0];
 run.game.player = { x: g.x, z: g.z + 2, angle: 0 }; g.angle = 0;
 run.game.metrics.alarm = 99; run.game.plan({ x: g.x, z: g.z + 2.2 }); run.game.launchFree();
 run.game.tick(.1); assert(run.game.failed); assert.equal(run.state().phase, 0);
}
// Dependency dragging accepts only the intended direction.
{
 const run = setup(35); correct(run);
 assert.equal(run.game.connect('b', 'a'), false); assert.equal(run.state().phase, 1);
 assert(run.game.connect('a', 'b')); settle(run.game, 'chain 2'); assert.equal(run.state().phase, 2);
 assert(run.game.connect('b', 'c')); settle(run.game, 'chain 3'); assert(run.state().done);
}
// Evacuation must wait for the rear detachment as well as the core group.
{
 const run = setup(36); correct(run); correct(run);
 const target = run.game.target(run.scenario.steps[2].answer);
 run.game.player = { ...target, angle: 0 }; run.game.rear = { x: target.x - 10, z: target.z };
 run.game.launch(run.scenario.steps[2].answer); run.game.tick(.1);
 assert.equal(run.state().phase, 2); assert(run.game.order);
 settle(run.game, 'rear evacuation'); assert(run.state().done); assert(dist(run.game.rear, target) < .1);
}
console.log('PASS: all 36 × 3 spatial stages, undo/replay, pause, free movement, costs, cover, convoy, exits, supply, visibility, dependency links and rear evacuation.');
