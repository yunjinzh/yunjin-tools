const assert=require('node:assert/strict');
const {harness}=require('./original-card-textures.cjs');
(async()=>{
 for(const [width,height] of [[1180,757],[390,844]]){
  const h=harness(true);h.surface.clientWidth=width;h.surface.clientHeight=height;await h.loadAll();h.frame();
  const initial=h.journey.getState();assert.equal(initial.near,0,`${width}: first complete card should be visible`);
  // Advancing near the first poster makes it leave the lateral viewport: the HUD
  // display card changes to the next fully visible poster before route index does.
  h.journey.step(8);h.frame();let s=h.journey.getState();assert.equal(s.index,0);assert.equal(s.near,1,`${width}: offscreen first poster must not remain selected`);assert.equal(s.displayIndex,1);assert.equal(s.displayReason,'visible');
  // Half-metre sweep includes the reported ~1.07km position and repeated pauses.
  for(const base of [0,1040,1056,1072]){h.journey.seek(Math.floor(base/16));for(let j=0;j<32;j++){h.journey.step(.5);h.frame();s=h.journey.getState();if(s.near>=0){assert(s.readableCard.visibility>=.90-1e-8);assert(s.readableCard.height>=s.readableCard.minHeight);assert(s.readableCard.width>=36);assert(s.readableCard.distance>0);assert.equal(s.displayIndex,s.near);}else{assert.equal(s.displayIndex,s.index);assert.equal(s.displayReason,'upcoming');}const same=s.displayIndex;h.frame();h.frame();assert.equal(h.journey.getState().displayIndex,same,'stationary selection flicker');}}
  h.journey.stop();
 }
 console.log('PASS: 1180x757 and 390x844 full-card projection, >=90% safe-region visibility, pixel readability, lateral exit, 1.07km sweep, stable pause and explicit fallback.');
})().catch(e=>{console.error(e);process.exitCode=1});
