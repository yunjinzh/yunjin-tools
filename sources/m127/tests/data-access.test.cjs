const assert=require('node:assert/strict');
const D=require('../dist/data-access.js');
(async()=>{
 let calls=0;const response=await D.boundedFetch('https://test.invalid',{timeoutMs:200,attempts:2},async()=>{if(++calls===1)throw Error('temporary network failure');return new Response('ok')});assert.equal(await response.text(),'ok');assert.equal(calls,2);
 calls=0;await assert.rejects(D.boundedFetch('x',{timeoutMs:200,attempts:2},async()=>{calls++;return new Response('missing',{status:404})}),/404/);assert.equal(calls,1);
 const slow=async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError'))));await assert.rejects(D.boundedFetch('x',{timeoutMs:15,attempts:2},slow),/超时/);
 const cancel=new AbortController();const task=D.boundedFetch('x',{signal:cancel.signal,timeoutMs:500,attempts:2},slow);cancel.abort();await assert.rejects(task,e=>e.name==='AbortError');
 // A stalled response body must be timed out as well as initial headers.
 await assert.rejects(D.boundedFetch('x',{timeoutMs:15,attempts:1},async(url,{signal})=>({ok:true,status:200,headers:{},arrayBuffer:()=>slow(url,{signal})})),/超时/);
 const grid={bbox:[0,0,10,10],width:10,height:10,year:2020,resolution:'1km',dem:Array.from({length:100},(_,i)=>i),pop:Array.from({length:100},(_,i)=>i*10)};const c=D.crop(grid,[2,3,6,7]);assert.deepEqual(c.bbox,[2,3,6,7]);assert.equal(c.width,4);assert.equal(c.height,4);assert.equal(c.dem[0],32);assert.equal(c.pop.at(-1),650);assert.equal(grid.dem.length,100);assert.throws(()=>D.crop(grid,[20,20,30,30]),/覆盖/);assert.throws(()=>D.crop(grid,[1,1,2,2]),/采样/);
 console.log('PASS: network retry, fatal HTTP, request/body timeout, cancellation, exact-cell cropping, out-of-coverage and tiny-region guards');
})().catch(e=>{console.error(e);process.exit(1)});
