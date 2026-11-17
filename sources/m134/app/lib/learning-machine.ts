import {emptyRecord} from './types';
import type {LearningRecord} from './types';

export type ReadState =
  | {kind:'loading'; request:number}
  | {kind:'ready'; authenticated:boolean}
  | {kind:'error'; message:string};
export type MediaState = 'poster'|'loading'|'embedded'|'unavailable';
export type Panel =
  | {kind:'closed'}
  | {kind:'method'}
  | {kind:'lesson'; draft:LearningRecord; base:LearningRecord;
      mode:'editing'|'confirm-discard'; media:MediaState; attempt:number;
      touched?:('notes'|'status'|'favorite')[]};
export type Mutation =
  | {kind:'idle'}
  | {kind:'saving'; request:number; submitted:LearningRecord; fromEditor:boolean}
  | {kind:'error'; id:string; message:string}
  | {kind:'conflict'; id:string; remote:LearningRecord; local:LearningRecord};
export type Notice = {id:number; text:string; error?:boolean; login?:boolean};
export type LearningState = {
  read:ReadState; records:Record<string,LearningRecord>; panel:Panel;
  mutation:Mutation; notice:Notice|null;
};
export const initialLearningState:LearningState = {
  read:{kind:'loading',request:0}, records:{}, panel:{kind:'closed'},
  mutation:{kind:'idle'}, notice:null,
};
export type Event =
  | {type:'READ_START'; request:number}
  | {type:'READ_OK'; request:number; authenticated:boolean; records:LearningRecord[]}
  | {type:'READ_ERROR'; request:number; message:string}
  | {type:'OPEN_LESSON'; id:string}
  | {type:'OPEN_METHOD'}
  | {type:'EDIT'; patch:Partial<Pick<LearningRecord,'notes'|'status'|'favorite'>>}
  | {type:'REQUEST_CLOSE'} | {type:'CONTINUE_EDITING'} | {type:'DISCARD'}
  | {type:'SAVE_START'; request:number; record:LearningRecord}
  | {type:'SAVE_OK'; request:number; record:LearningRecord}
  | {type:'SAVE_ERROR'; request:number; message:string; unauthorized?:boolean}
  | {type:'SAVE_CONFLICT'; request:number; remote:LearningRecord}
  | {type:'RESOLVE_CONFLICT'; choice:'local'|'remote'}
  | {type:'MEDIA_START'}
  | {type:'MEDIA_RESULT'; id:string; attempt:number; result:'embedded'|'unavailable'}
  | {type:'NOTICE'; notice:Notice}
  | {type:'DISMISS_NOTICE'; id:number};

export function sameContent(a:LearningRecord,b:LearningRecord) {
  return a.id===b.id && a.favorite===b.favorite && a.status===b.status && a.notes===b.notes;
}
export const isDirty = (panel:Panel) => panel.kind==='lesson' && !sameContent(panel.draft,panel.base);
const savedPanel = (panel:Panel,record:LearningRecord):Panel => panel.kind==='lesson'&&panel.draft.id===record.id
  ? {...panel,base:record,draft:{...panel.draft,revision:record.revision,updated:record.updated}}
  : panel;

/** Pure transitions: effects cannot invent a second source of truth. */
export function learningReducer(s:LearningState,e:Event):LearningState {
  switch(e.type) {
    case 'READ_START':
      return s.mutation.kind==='saving'?s:{...s,read:{kind:'loading',request:e.request}};
    case 'READ_OK': {
      if(s.read.kind!=='loading'||s.read.request!==e.request) return s;
      const records=Object.fromEntries(e.records.map(r=>[r.id,r]));
      let panel=s.panel, mutation=s.mutation;
      if(panel.kind==='lesson'&&e.authenticated) {
        const remote=records[panel.draft.id]||emptyRecord(panel.draft.id);
        if(!isDirty(panel)) panel={...panel,base:remote,draft:{...remote}};
        else if(!sameContent(remote,panel.base)) mutation={kind:'conflict',id:remote.id,remote,local:panel.draft};
        else panel=savedPanel(panel,remote);
      }
      return {...s,records,panel,mutation,read:{kind:'ready',authenticated:e.authenticated}};
    }
    case 'READ_ERROR':
      return s.read.kind==='loading'&&s.read.request===e.request ? {...s,read:{kind:'error',message:e.message}}:s;
    case 'OPEN_LESSON': {
      // Opening another panel never silently discards a draft or a pending write.
      if(s.panel.kind!=='closed') return s;
      const record=s.records[e.id]||emptyRecord(e.id);
      const draft=s.mutation.kind==='conflict'&&s.mutation.id===e.id?s.mutation.local:record;
      return {...s,panel:{kind:'lesson',draft:{...draft},base:record,mode:'editing',media:'poster',attempt:0}};
    }
    case 'OPEN_METHOD': return s.panel.kind==='closed'?{...s,panel:{kind:'method'}}:s;
    case 'EDIT': {
      if(s.panel.kind!=='lesson'||s.panel.mode!=='editing')return s;
      const panel=s.panel;
      const changed=(['notes','status','favorite'] as const).filter(key=>e.patch[key]!==undefined&&e.patch[key]!==panel.draft[key]);
      return {...s,panel:{...panel,draft:{...panel.draft,...e.patch},touched:[...new Set([...(panel.touched||[]),...changed])]}};
    }
    case 'REQUEST_CLOSE':
      if(s.mutation.kind==='saving') return s;
      if(s.panel.kind==='lesson'&&s.panel.mode==='confirm-discard') return {...s,panel:{...s.panel,mode:'editing'}};
      return isDirty(s.panel)&&s.panel.kind==='lesson'
        ? {...s,panel:{...s.panel,mode:'confirm-discard'}}
        : {...s,panel:{kind:'closed'}};
    case 'CONTINUE_EDITING': return s.panel.kind==='lesson'?{...s,panel:{...s.panel,mode:'editing'}}:s;
    case 'DISCARD': {
      if(s.mutation.kind==='saving'||s.panel.kind!=='lesson'||s.panel.mode!=='confirm-discard') return s;
      const conflict=s.mutation.kind==='conflict'&&s.mutation.id===s.panel.draft.id?s.mutation:null;
      return {...s,panel:{kind:'closed'},
        records:conflict?{...s.records,[conflict.id]:conflict.remote}:s.records,
        mutation:conflict?{kind:'idle'}:s.mutation};
    }
    case 'SAVE_START':
      if(s.mutation.kind==='saving'||s.read.kind!=='ready'||!s.read.authenticated||
        s.mutation.kind==='conflict'||
        (s.panel.kind==='lesson'&&s.panel.mode==='confirm-discard')) return s;
      return {...s,mutation:{kind:'saving',request:e.request,submitted:{...e.record},fromEditor:s.panel.kind==='lesson'&&s.panel.draft.id===e.record.id}};
    case 'SAVE_OK': {
      if(s.mutation.kind!=='saving'||s.mutation.request!==e.request||s.mutation.submitted.id!==e.record.id) return s;
      // Preserve edits made while the submitted snapshot was in flight.
      // A card save can also finish after its lesson was opened: merge unchanged fields only.
      let panel=s.panel;
      if(panel.kind==='lesson'&&panel.draft.id===e.record.id) {
        const draft={...panel.draft};
        for(const key of ['notes','status','favorite'] as const) {
          if(!s.mutation.fromEditor&&!panel.touched?.includes(key)) Object.assign(draft,{[key]:e.record[key]});
        }
        panel=savedPanel({...panel,draft},e.record);
      }
      return {...s,records:{...s.records,[e.record.id]:e.record},panel,mutation:{kind:'idle'}};
    }
    case 'SAVE_ERROR':
      if(s.mutation.kind!=='saving'||s.mutation.request!==e.request) return s;
      return {...s,mutation:{kind:'error',id:s.mutation.submitted.id,message:e.message},
        read:e.unauthorized?{kind:'ready',authenticated:false}:s.read};
    case 'SAVE_CONFLICT': {
      if(s.mutation.kind!=='saving'||s.mutation.request!==e.request||s.mutation.submitted.id!==e.remote.id) return s;
      const submitted=s.mutation.submitted;
      // Card conflicts get an explicit editor too, so recovery is always reachable.
      const panel=s.panel.kind==='closed'
        ? {kind:'lesson' as const,draft:submitted,base:s.records[submitted.id]||emptyRecord(submitted.id),mode:'editing' as const,media:'poster' as const,attempt:0}
        : s.panel;
      return {...s,panel,mutation:{kind:'conflict',id:e.remote.id,remote:e.remote,local:submitted}};
    }
    case 'RESOLVE_CONFLICT': {
      if(s.mutation.kind!=='conflict'||s.panel.kind!=='lesson'||s.panel.draft.id!==s.mutation.id) return s;
      const remote=s.mutation.remote;
      return {...s,records:{...s.records,[remote.id]:remote},mutation:{kind:'idle'},panel:{...s.panel,
        base:remote,draft:e.choice==='remote'?{...remote}:{...s.panel.draft,revision:remote.revision,updated:remote.updated}}};
    }
    case 'MEDIA_START': return s.panel.kind==='lesson'
      ? {...s,panel:{...s.panel,media:'loading',attempt:s.panel.attempt+1}}:s;
    case 'MEDIA_RESULT': return s.panel.kind==='lesson'&&s.panel.draft.id===e.id&&s.panel.attempt===e.attempt&&s.panel.media==='loading'
      ? {...s,panel:{...s.panel,media:e.result}}:s;
    case 'NOTICE': return {...s,notice:e.notice};
    case 'DISMISS_NOTICE': return s.notice?.id===e.id?{...s,notice:null}:s;
  }
}

export function isLearningRecord(v:unknown):v is LearningRecord {
  if(!v||typeof v!=='object') return false;
  const r=v as LearningRecord;
  return typeof r.id==='string'&&typeof r.favorite==='boolean'&&
    ['未开始','学习中','已学完'].includes(r.status)&&typeof r.notes==='string'&&r.notes.length<=10000&&
    Number.isSafeInteger(r.revision)&&r.revision>=0&&typeof r.updated==='string';
}
