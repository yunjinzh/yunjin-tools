import {Game,legalMoves,K} from '../dist/engine.mjs';
import {chooseMove} from '../dist/ai.mjs';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
async function play(seed){const g=new Game(),moves=[],start=Date.now();let nodes=0;while(!g.status().over){const pick=await chooseMove(g.snapshot(),{seed,depth:2,temperature:.8});assert.ok(g.legal().some(m=>m.from===pick.move.from&&m.to===pick.move.to));const m=g.move(pick.move);assert.equal(g.board.filter(p=>Math.abs(p)===K).length,2);moves.push([m.from,m.to,m.label]);nodes+=pick.nodes;if(g.ply%40===0)console.log(seed,g.ply,'plies',Math.round((Date.now()-start)/1000)+'s');}return {seed,plies:g.ply,result:g.status(),nodes,seconds:(Date.now()-start)/1000,moves};}
const results=await Promise.all(['CH-7942','CH-RIVER9'].map(play));assert.notDeepEqual(results[0].moves.slice(0,10),results[1].moves.slice(0,10));
const repeated=await Promise.all(results.map(r=>play(r.seed)));
for(let i=0;i<results.length;i++){assert.deepEqual(results[i].moves,repeated[i].moves);assert.deepEqual(results[i].result,repeated[i].result);results[i].fullReplayVerified=true;console.log(JSON.stringify({...results[i],moves:results[i].moves.slice(0,12)}));}
writeFileSync('tests/acceptance-results.json',JSON.stringify(results,null,2));
