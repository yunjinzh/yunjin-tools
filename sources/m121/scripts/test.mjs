import assert from 'node:assert/strict';
import {colorMask,composeRGBA,inferBackground,fitDimensions,paintMask,alphaBounds,cleanMask} from '../src/core.js';
let checks=0;const ok=(value)=>{assert.ok(value);checks++;};
const w=7,h=7,data=new Uint8ClampedArray(w*h*4).fill(255);
for(let y=2;y<=4;y++)for(let x=2;x<=4;x++)if(x!==3||y!==3){let i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=0;}
const edge=colorMask(data,w,h,[255,255,255],10,0,true),all=colorMask(data,w,h,[255,255,255],10,0,false);
ok(edge[0]===0);ok(edge[24]===255);ok(all[24]===0);ok(all[16]===255);
assert.deepEqual(inferBackground(data,w,h),[255,255,255]);checks++;
ok(colorMask(new Uint8ClampedArray([245,245,245,255]),1,1,[255,255,255],5,10,false)[0]===128);
const original=new Uint8ClampedArray([10,20,30,0,10,20,30,128]);
const composed=composeRGBA(original,new Uint8ClampedArray([255,128]));ok(composed[3]===0);ok(composed[7]===64);ok(composed[4]===10);
const mask=new Uint8ClampedArray(100).fill(255);paintMask(mask,10,10,5,5,2,false);ok(mask[55]===0);ok(mask[0]===255);paintMask(mask,10,10,5,5,2,true);ok(mask[55]===255);
const rgba=composeRGBA(data,all);assert.deepEqual(alphaBounds(rgba,w,h),{x:2,y:2,width:3,height:3});checks++;ok(alphaBounds(new Uint8ClampedArray(16),2,2)===null);
assert.deepEqual(fitDimensions(900,599),[900,599]);checks++;const large=fitDimensions(20000,10000);ok(large[0]<=4096&&large[0]*large[1]<=8388608);
assert.deepEqual([...cleanMask(new Uint8ClampedArray([0,15,24,100,255]),24)],[0,0,0,84,255]);checks++;
assert.deepEqual([...cleanMask(new Uint8ClampedArray([0,15,24,100,255]),0)],[0,15,24,100,255]);checks++;
console.log(JSON.stringify({passed:checks,behaviors:['edge-connected protection','global color removal','soft alpha','original transparency','brush erase and restore','cropping','large image bounds','AI mask cleanup']}));
