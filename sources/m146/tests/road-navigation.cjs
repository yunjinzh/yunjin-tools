const assert=require('node:assert/strict');
const {harness,drain}=require('./original-card-textures.cjs');
(async()=>{
 const h=harness(true);await h.loadAll();h.frame();
 // The route index is continuous; visible selection is independently validated.
 for(const d of [0,11.9,12,12.1,14,14.1,15.99,16,27.9,28,30]){h.journey.seek(0);h.journey.step(d);const s=h.journey.getState();const ahead=Math.min(413,Math.floor((d+4)/16));assert.equal(s.index,ahead,`current upcoming station at ${d}m`);if(s.near>=0){assert(s.readableCard.visibility>=.90);assert.equal(s.displayIndex,s.near);}else assert.equal(s.displayReason,'upcoming');}
 // Final sub-threshold movement still emits a progress/ended notification.
 h.journey.seek(413);h.journey.step(h.journey.getState().totalDistance-h.journey.getState().distance-.1);const n=h.progress.length;h.journey.step(.1);assert.equal(h.journey.getState().ended,true);assert.equal(h.progress.length,n+1,'terminal progress must not be throttled');assert.equal(h.progress.at(-1).distance,h.journey.getState().totalDistance);h.frame();assert.equal(h.progress.length,n+1,'terminal callback must not repeat every frame');
 // Paused and open-dialog journeys do not move; return resumes from same location.
 h.journey.seek(0);await h.loadAll();h.journey.play(true);h.frame();const p=h.journey.getState().distance;h.setDialog(true);h.frame();h.frame();assert.equal(h.journey.getState().distance,p);h.setDialog(false);h.frame();assert(h.journey.getState().distance>p);h.journey.play(false);const paused=h.journey.getState().distance;h.frame();assert.equal(h.journey.getState().distance,paused);
 // Losing window focus suspends autoplay, but preserves the user's play intent.
 h.journey.play(true);h.listeners.blur();const before=h.journey.getState().distance;h.frame();assert.equal(h.journey.getState().distance,before);assert.equal(h.journey.getState().suspended,true);h.listeners.focus();h.frame();assert(h.journey.getState().distance>before);
 // Static paused scene should not continuously redraw on the CPU/GPU.
 h.journey.play(false);h.frame();const count=h.getRenderCount();h.frame();h.frame();assert.equal(h.getRenderCount(),count,'idle render wasted work');
 h.journey.seek(413);await h.loadAll();h.journey.play(true);h.journey.step(100);assert.equal(h.journey.getState().playing,false);h.journey.play(true);assert.equal(h.journey.getState().playing,false);h.journey.seek(0);assert.equal(h.journey.getState().ended,false);h.journey.stop();await drain();
 console.log('PASS: route-index continuity and readable-neighbor validity, exact terminal notification, dialog/pause/focus resume, idle rendering, terminal restart prevention and seek recovery.');
})().catch(e=>{console.error(e);process.exitCode=1});
