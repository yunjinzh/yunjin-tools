import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {assembleOfflinePackage} from '../dist/offline-download.js';

const root=new URL('../dist/downloads/',import.meta.url);
// Hosted transport parts are intentionally absent from the portable ZIP.
// package_offline.py recreates them when validating a new publication.
const manifest=existsSync(new URL('source-manifest.json',root))?JSON.parse(readFileSync(new URL('source-manifest.json',root))):null;
const localFetch=async url=>new Response(readFileSync(new URL(url.pathname.split('/').pop(),root)));

test('offline download reconstructs the complete ZIP exactly from hosted transport parts',{skip:!manifest},async()=>{
 const progress=[];const {blob,name}=await assembleOfflinePackage((...values)=>progress.push(values),localFetch);
 const bytes=Buffer.from(await blob.arrayBuffer());assert.equal(name,'embodied-studio-source.zip');
 assert.equal(bytes.readUInt32LE(0),0x04034b50);assert.equal(bytes.length,manifest.bytes);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
 assert.deepEqual(progress.at(-1),[manifest.parts.length,manifest.parts.length]);
});

test('offline download rejects incomplete data instead of offering a corrupt archive',{skip:!manifest},async()=>{
 const brokenFetch=async url=>url.pathname.endsWith('.bin')?new Response(new Uint8Array([0,1,2])):localFetch(url);
 await assert.rejects(assembleOfflinePackage(()=>{},brokenFetch),/传输不完整/);
});
