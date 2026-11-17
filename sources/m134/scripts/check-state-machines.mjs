import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';

// Compile only the dependency-free production transitions into a disposable directory.
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'map-state-'));
let count=0;
try {
  for(const name of ['types','learning-machine','catalog-state']) {
    const source=await fs.readFile(`app/lib/${name}.ts`,'utf8');
    const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replaceAll("'./types'","'./types.mjs'");
    await fs.writeFile(path.join(dir,`${name}.mjs`),output);
  }
  const {learningReducer:r,initialLearningState:initial,isDirty,isLearningRecord}=await import(pathToFileURL(path.join(dir,'learning-machine.mjs')));
  const {emptyRecord}=await import(pathToFileURL(path.join(dir,'types.mjs')));
  const {catalogReducer,defaultCatalog,readCatalog,catalogURL}=await import(pathToFileURL(path.join(dir,'catalog-state.mjs')));
  const base=emptyRecord('video-a');
  const reduce=(s,...events)=>events.reduce(r,s);
  const ready=()=>reduce(initial,{type:'READ_START',request:1},{type:'READ_OK',request:1,authenticated:true,records:[]});
  const edit=()=>reduce(ready(),{type:'OPEN_LESSON',id:base.id},{type:'EDIT',patch:{notes:'第一段'}});
  const check=(name,fn)=>{fn();count++;console.log(`PASS ${name}`)};

  check('late reads cannot replace a newer load',()=>{
    let s=reduce(initial,{type:'READ_START',request:1},{type:'READ_START',request:2});
    assert.equal(r(s,{type:'READ_OK',request:1,authenticated:true,records:[base]}),s);
    assert.equal(r(s,{type:'READ_ERROR',request:1,message:'old'}),s);
    s=r(s,{type:'READ_ERROR',request:2,message:'offline'});assert.equal(s.read.kind,'error');
    s=reduce(s,{type:'READ_START',request:3},{type:'READ_OK',request:3,authenticated:false,records:[]});assert.deepEqual(s.read,{kind:'ready',authenticated:false});
  });
  check('pending reads and anonymous sessions cannot write',()=>{
    assert.equal(r(initial,{type:'SAVE_START',request:2,record:base}),initial);
    const s=r(initial,{type:'READ_OK',request:0,authenticated:false,records:[]});
    assert.equal(r(s,{type:'SAVE_START',request:2,record:base}),s);
  });
  check('one panel only, no draft lost on a competing open',()=>{
    const s=edit();for(const event of [{type:'OPEN_LESSON',id:'video-b'},{type:'OPEN_METHOD'}]) assert.equal(r(s,event),s);
  });
  check('dirty close requires confirmation; Escape cancels confirmation',()=>{
    let s=edit();s=r(s,{type:'REQUEST_CLOSE'});assert.equal(s.panel.mode,'confirm-discard');
    const locked=r(s,{type:'EDIT',patch:{notes:'ignored'}});assert.equal(locked,s);
    s=r(s,{type:'REQUEST_CLOSE'});assert.equal(s.panel.mode,'editing');assert.equal(s.panel.draft.notes,'第一段');
    s=reduce(s,{type:'REQUEST_CLOSE'},{type:'DISCARD'});assert.equal(s.panel.kind,'closed');
  });
  check('clean detail closes without warning',()=>{
    const s=reduce(ready(),{type:'OPEN_LESSON',id:base.id},{type:'REQUEST_CLOSE'});assert.equal(s.panel.kind,'closed');
  });
  check('duplicate writes, close and reload are guarded during a write',()=>{
    let s=edit();s=r(s,{type:'SAVE_START',request:4,record:s.panel.draft});
    for(const e of [{type:'SAVE_START',request:5,record:base},{type:'REQUEST_CLOSE'},{type:'DISCARD'},{type:'READ_START',request:6}])assert.equal(r(s,e),s);
  });
  check('save acknowledgement preserves typing and reversions made in flight',()=>{
    for(const notes of ['第一段\n继续补充','']) {
      let s=edit(),submitted=s.panel.draft;
      s=reduce(s,{type:'SAVE_START',request:4,record:submitted},{type:'EDIT',patch:{notes,status:'已学完',favorite:true}},
        {type:'SAVE_OK',request:4,record:{...submitted,revision:1,updated:'now'}});
      assert.equal(s.records[base.id].notes,'第一段');assert.equal(s.panel.draft.notes,notes);
      assert.equal(s.panel.draft.revision,1);assert.equal(s.panel.draft.status,'已学完');assert.equal(s.panel.draft.favorite,true);assert.ok(isDirty(s.panel));
    }
  });
  check('unchanged submitted draft becomes clean',()=>{
    let s=edit(),submitted=s.panel.draft;
    s=reduce(s,{type:'SAVE_START',request:4,record:submitted},{type:'SAVE_OK',request:4,record:{...submitted,revision:1,updated:'now'}});
    assert.equal(isDirty(s.panel),false);
  });
  check('stale acknowledgements and failures cannot affect a different request',()=>{
    let s=edit();s=r(s,{type:'SAVE_START',request:4,record:s.panel.draft});
    for(const e of [{type:'SAVE_OK',request:3,record:base},{type:'SAVE_ERROR',request:3,message:'late'},{type:'SAVE_CONFLICT',request:3,remote:base}]) assert.equal(r(s,e),s);
  });
  check('opening a card during its save merges the ack without losing new notes',()=>{
    let s=ready();const submitted={...base,favorite:true};
    s=reduce(s,{type:'SAVE_START',request:4,record:submitted},{type:'OPEN_LESSON',id:base.id},{type:'EDIT',patch:{notes:'新笔记'}},{type:'SAVE_OK',request:4,record:{...submitted,revision:1,updated:'now'}});
    assert.equal(s.panel.draft.favorite,true);assert.equal(s.panel.draft.notes,'新笔记');assert.ok(isDirty(s.panel));
  });
  check('card acknowledgement respects an explicit toggle back to the original value',()=>{
    let s=reduce(ready(),{type:'SAVE_START',request:4,record:{...base,favorite:true}},{type:'OPEN_LESSON',id:base.id},
      {type:'EDIT',patch:{favorite:true}},{type:'EDIT',patch:{favorite:false}},
      {type:'SAVE_OK',request:4,record:{...base,favorite:true,revision:1,updated:'now'}});
    assert.equal(s.panel.draft.favorite,false);assert.ok(isDirty(s.panel));
  });
  check('network uncertainty keeps draft and baseline; retry remains revision protected',()=>{
    let s=edit(),submitted=s.panel.draft;
    s=reduce(s,{type:'SAVE_START',request:4,record:submitted},{type:'SAVE_ERROR',request:4,message:'uncertain'});
    assert.equal(s.panel.draft.notes,submitted.notes);assert.equal(s.panel.base.revision,0);assert.equal(s.mutation.kind,'error');
    s=r(s,{type:'SAVE_START',request:5,record:s.panel.draft});assert.equal(s.mutation.submitted.revision,0);
  });
  check('401 moves to anonymous but preserves the draft',()=>{
    let s=edit();s=reduce(s,{type:'SAVE_START',request:4,record:s.panel.draft},{type:'SAVE_ERROR',request:4,message:'login',unauthorized:true});
    assert.equal(s.read.authenticated,false);assert.equal(s.panel.draft.notes,'第一段');
  });
  check('conflict resolution is explicit and never automatically writes',()=>{
    for(const choice of ['local','remote']) {
      let s=edit();const remote={...base,notes:'另一台设备',favorite:true,revision:7,updated:'now'};
      s=reduce(s,{type:'SAVE_START',request:4,record:s.panel.draft},{type:'SAVE_CONFLICT',request:4,remote});
      assert.equal(s.panel.draft.notes,'第一段');assert.equal(r(s,{type:'SAVE_START',request:5,record:s.panel.draft}),s);
      s=r(s,{type:'RESOLVE_CONFLICT',choice});assert.equal(s.mutation.kind,'idle');assert.equal(s.panel.draft.revision,7);
      assert.equal(s.panel.draft.notes,choice==='local'?'第一段':remote.notes);assert.equal(isDirty(s.panel),choice==='local');
    }
  });
  check('card conflicts open a recoverable editor',()=>{
    const submitted={...base,favorite:true};
    const s=reduce(ready(),{type:'SAVE_START',request:4,record:submitted},{type:'SAVE_CONFLICT',request:4,remote:{...base,revision:2,notes:'cloud'}});
    assert.equal(s.panel.kind,'lesson');assert.equal(s.panel.draft.favorite,true);assert.equal(s.mutation.kind,'conflict');
  });
  check('a card conflict does not discard another open lesson draft',()=>{
    let s=reduce(ready(),{type:'SAVE_START',request:4,record:{...base,favorite:true}},{type:'OPEN_LESSON',id:'video-b'},{type:'EDIT',patch:{notes:'B draft'}},{type:'SAVE_CONFLICT',request:4,remote:{...base,revision:2}});
    assert.equal(s.panel.draft.notes,'B draft');
    s=reduce(s,{type:'REQUEST_CLOSE'},{type:'DISCARD'});assert.equal(s.mutation.kind,'conflict');
    s=r(s,{type:'OPEN_LESSON',id:base.id});assert.equal(s.panel.draft.favorite,true);
  });
  check('discarding a conflicting draft adopts the known cloud baseline',()=>{
    const remote={...base,revision:4,notes:'cloud'};let s=edit();
    s=reduce(s,{type:'SAVE_START',request:4,record:s.panel.draft},{type:'SAVE_CONFLICT',request:4,remote},{type:'REQUEST_CLOSE'},{type:'DISCARD'},{type:'OPEN_LESSON',id:base.id});
    assert.equal(s.panel.draft.revision,4);assert.equal(s.panel.draft.notes,'cloud');assert.equal(s.mutation.kind,'idle');
  });
  check('late initial load refreshes a clean editor, preserves a dirty one',()=>{
    const remote={...base,revision:4,notes:'cloud'};
    for(const dirty of [false,true]){
      let s=r(initial,{type:'OPEN_LESSON',id:base.id});if(dirty)s=r(s,{type:'EDIT',patch:{notes:'local'}});
      s=r(s,{type:'READ_OK',request:0,authenticated:true,records:[remote]});
      assert.equal(s.panel.draft.notes,dirty?'local':'cloud');assert.equal(s.mutation.kind,dirty?'conflict':'idle');
    }
  });
  check('player events are scoped to lesson and attempt; viewing never marks completion',()=>{
    let s=reduce(ready(),{type:'OPEN_LESSON',id:base.id},{type:'MEDIA_START'});
    assert.equal(s.panel.media,'loading');
    for(const e of [{type:'MEDIA_RESULT',id:'wrong',attempt:1,result:'embedded'},{type:'MEDIA_RESULT',id:base.id,attempt:0,result:'embedded'}])assert.equal(r(s,e),s);
    s=r(s,{type:'MEDIA_RESULT',id:base.id,attempt:1,result:'unavailable'});assert.equal(s.panel.media,'unavailable');
    s=reduce(s,{type:'MEDIA_START'},{type:'MEDIA_RESULT',id:base.id,attempt:1,result:'embedded'});assert.equal(s.panel.media,'loading');
    s=r(s,{type:'MEDIA_RESULT',id:base.id,attempt:2,result:'embedded'});assert.equal(s.panel.draft.status,'未开始');
  });
  check('old notification timers cannot dismiss a newer notice',()=>{
    let s=reduce(ready(),{type:'NOTICE',notice:{id:1,text:'old'}},{type:'NOTICE',notice:{id:2,text:'new'}});
    assert.equal(r(s,{type:'DISMISS_NOTICE',id:1}),s);assert.equal(r(s,{type:'DISMISS_NOTICE',id:2}).notice,null);
  });
  check('API data validation rejects malformed learning records',()=>{
    assert.ok(isLearningRecord(base));for(const value of [null,{}, {...base,revision:-1},{...base,notes:7},{...base,status:'done'},{...base,favorite:1}])assert.equal(isLearningRecord(value),false);
  });
  check('URL roundtrip retains every filter and unknown unrelated parameters',()=>{
    const state={view:'notes',query:'QGIS & 等高线',category:'三维地形',minViews:500000,minLikes:10000,sort:'newest',status:'学习中'};
    const url=catalogURL('https://example.test/?source=bookmark',state);
    assert.deepEqual(readCatalog(url.search,['全部','三维地形']),state);assert.equal(url.searchParams.get('source'),'bookmark');
    assert.deepEqual(readCatalog('?view=bad&views=NaN&likes=0&sort=oops&status=bad&category=missing',['全部']),defaultCatalog);
  });
  check('tab navigation resets filters; reset preserves current view; restore is exact',()=>{
    let s=catalogReducer({...defaultCatalog,query:'filter',view:'notes'},{type:'NAVIGATE',view:'saved'});assert.deepEqual(s,{...defaultCatalog,view:'saved'});
    s=catalogReducer({...s,query:'new'},{type:'RESET'});assert.equal(s.view,'saved');assert.equal(s.query,'');
    assert.deepEqual(catalogReducer(s,{type:'RESTORE',state:{...defaultCatalog,query:'back'}}),{...defaultCatalog,query:'back'});
  });
  console.log(`PASS: ${count} state-machine scenarios.`);
} finally {await fs.rm(dir,{recursive:true,force:true});}
