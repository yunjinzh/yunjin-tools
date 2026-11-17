/* Pure application model. UI, URLs and agent tools use the same guarded events. */
const ResearchState = (() => {
  const VIEWS = ['overview', 'structure', 'themes', 'institutions', 'explorer', 'method'];
  const FILTER_DEFAULTS = {source:-1, topic:-1, cat:'', disc:'', q:'', org:'', page:1, sort:'source'};
  const freeze = value => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze); Object.freeze(value);
    }
    return value;
  };
  function create({rows, sources, topics}) {
    const keys = rows.map(r => `${sources[r[0]].sha256.slice(0,12)}:${r[11]}:${r[12]}`);
    const byKey = new Map(keys.map((key,i) => [key, rows[i]]));
    const keyByRow = new Map(rows.map((r,i) => [r,keys[i]]));
    const texts = new Map(rows.map(r => [r,[r[1],r[2],r[3],r[9]].join(' ').toLocaleLowerCase()]));
    const sourceRows = sources.map((_,i) => rows.filter(r => r[0] === i));
    const options = [-1,...sources.map((_,i)=>i)].map(source => {
      const rs = source === -1 ? rows : sourceRows[source];
      return [source,{cat:new Set(rs.map(r=>r[6]||'未提供')),disc:new Set(rs.map(r=>r[8]||'未提供'))}];
    });
    const optionsBySource = new Map(options);
    const fail = message => { throw new Error(message); };
    const enumValue = (v, values, name) => values.includes(v) ? v : fail(`Invalid ${name}`);
    const integer = (v,min,max,name) => Number.isInteger(v) && v >= min && v <= max ? v : fail(`Invalid ${name}`);
    const string = (v,name) => typeof v === 'string' && v.length <= 2000 ? v : fail(`Invalid ${name}`);
    const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : fail('Expected an object');
    const strictKeys = (value, keys) => {object(value);Object.keys(value).forEach(k=>{if(!keys.includes(k))fail(`Unknown field: ${k}`)});};
    function initial() {
      return freeze({version:1,view:'overview',structure:{mode:'social'},themes:{metric:'share',topic:0},
        institutions:{source:2,topic:-1,cross:false},explorer:{...FILTER_DEFAULTS},dialog:null,dialogPhase:'closed',disclosures:{},
        download:{status:'idle',kind:null,requestId:0,count:0,error:null},print:'idle',notice:{id:0,message:'',tone:'info'},
        agent:{status:'unavailable',registered:[],failed:[]},lastEvent:'INIT'});
    }
    let cachedFilters = '', cachedResult;
    function results(filters) {
      const signature = JSON.stringify([filters.source,filters.topic,filters.cat,filters.disc,filters.q,filters.org,filters.sort]);
      if (signature !== cachedFilters || !cachedResult) {
        const words = filters.q.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
        let matching = (filters.source < 0 ? rows : sourceRows[filters.source]).filter(r =>
          (filters.topic < 0 || r[16].includes(filters.topic)) && (!filters.cat || (r[6]||'未提供') === filters.cat) &&
          (!filters.disc || (r[8]||'未提供') === filters.disc) && (!filters.org || r[4] === filters.org) &&
          words.every(word=>texts.get(r).includes(word)));
        if (filters.sort !== 'source') {
          const index = filters.sort === 'org' ? 4 : 1;
          matching = [...matching].sort((a,b)=>a[index].localeCompare(b[index],'zh-CN') || a._id-b._id);
        }
        cachedFilters = signature; cachedResult = {rows:matching,total:matching.length,pages:Math.max(1,Math.ceil(matching.length/25))};
      }
      const page = Math.max(1,Math.min(filters.page,cachedResult.pages));
      return {...cachedResult,page,pageRows:cachedResult.rows.slice((page-1)*25,page*25),status:cachedResult.total ? 'ready' : 'empty'};
    }
    function normalize(filters) {
      const f = {...filters};
      for (const key of ['cat','disc']) if(f[key] && !optionsBySource.get(f.source)[key].has(f[key])) f[key]='';
      f.page = results(f).page;
      return f;
    }
    function checkFilters(patch) {
      strictKeys(patch,Object.keys(FILTER_DEFAULTS));
      for(const [k,v] of Object.entries(patch)) {
        if(k==='source')integer(v,-1,sources.length-1,k);
        else if(k==='topic')integer(v,-1,topics.length-1,k);
        else if(k==='page')integer(v,1,Number.MAX_SAFE_INTEGER,k);
        else if(k==='sort')enumValue(v,['source','org','title'],k);
        else string(v,k);
      }
      return patch;
    }
    function transition(state,event) {
      object(event); let next = {...state,lastEvent:event.type};
      switch(event.type) {
        case 'NAVIGATE': enumValue(event.view,VIEWS,'view');next.view=event.view;next.dialog=null;next.dialogPhase='closed';break;
        case 'SET_STRUCTURE': enumValue(event.mode,['social','natural'],'mode');next.structure={mode:event.mode};break;
        case 'SET_THEME': {
          strictKeys(event.patch,['metric','topic']);
          if('metric' in event.patch)enumValue(event.patch.metric,['share','count'],'metric');
          if('topic' in event.patch)integer(event.patch.topic,0,topics.length-1,'topic');
          next.themes={...state.themes,...event.patch};break;
        }
        case 'SET_INSTITUTIONS': {
          strictKeys(event.patch,['source','topic']);
          if('source' in event.patch)integer(event.patch.source,0,sources.length-1,'source');
          if('topic' in event.patch)integer(event.patch.topic,-1,topics.length-1,'topic');
          next.institutions={...state.institutions,...event.patch};break;
        }
        case 'TOGGLE_CROSS':next.institutions={...state.institutions,cross:!state.institutions.cross};break;
        case 'FILTER_PROJECTS': {
          checkFilters(event.patch);
          const combined={...state.explorer,...event.patch,page:1};
          for(const k of ['cat','disc'])if(event.patch[k]&&!optionsBySource.get(combined.source)[k].has(event.patch[k]))fail(`Unknown ${k} for this source`);
          next.explorer=normalize(combined);next.dialog=null;next.dialogPhase='closed';break;
        }
        case 'SET_PAGE':integer(event.page,1,Number.MAX_SAFE_INTEGER,'page');next.explorer=normalize({...state.explorer,page:event.page});next.dialog=null;next.dialogPhase='closed';break;
        case 'RESET_FILTERS':next.explorer={...FILTER_DEFAULTS};next.dialog=null;next.dialogPhase='closed';break;
        case 'OPEN_EVIDENCE': {
          checkFilters(event.filters);const combined={...FILTER_DEFAULTS,...event.filters};
          for(const k of ['cat','disc'])if(combined[k]&&!optionsBySource.get(combined.source)[k].has(combined[k]))fail(`Unknown ${k} for this source`);
          next.explorer=normalize(combined);next.view='explorer';next.dialog=null;next.dialogPhase='closed';break;
        }
        case 'OPEN_RECORD':if(!byKey.has(event.key))fail('Unknown record');next.dialog=event.key;next.dialogPhase='open';break;
        case 'CLOSE_RECORD_REQUEST':if(!state.dialog)return state;next.dialogPhase='closing';break;
        case 'CLOSE_RECORD':next.dialog=null;next.dialogPhase='closed';break;
        case 'SET_DISCLOSURE':
          if(typeof event.key!=='string'||!/^\w+:\d+:\d+$/.test(event.key)||typeof event.open!=='boolean')fail('Invalid disclosure');
          next.disclosures={...state.disclosures,[event.key]:event.open};break;
        case 'DOWNLOAD_START':
          enumValue(event.kind,['csv','offline'],'download kind');integer(event.requestId,1,Number.MAX_SAFE_INTEGER,'requestId');
          if(state.download.status==='preparing')return state;
          if(event.kind==='csv' && (!results(state.explorer).total || state.view!=='explorer'))fail('No visible results to export');
          next.download={status:'preparing',kind:event.kind,requestId:event.requestId,count:results(state.explorer).total,error:null};break;
        case 'DOWNLOAD_REQUESTED':case 'DOWNLOAD_FAILED':
          if(state.download.status!=='preparing'||event.requestId!==state.download.requestId)return state;
          next.download={...state.download,status:event.type==='DOWNLOAD_REQUESTED'?'requested':'failed',error:event.type==='DOWNLOAD_FAILED'?String(event.error):null};break;
        case 'PRINT_START':next.print='printing';break;
        case 'PRINT_END':next.print='idle';break;
        case 'AGENT_SETUP':
          enumValue(event.status,['unavailable','registering','ready','partial'],'agent status');
          if(!Array.isArray(event.registered)||!Array.isArray(event.failed)||![...event.registered,...event.failed].every(v=>typeof v==='string'))fail('Invalid tool registration');
          next.agent={status:event.status,registered:[...event.registered],failed:[...event.failed]};break;
        case 'NOTICE':string(event.message,'notice');next.notice={id:state.notice.id+1,message:event.message,tone:event.tone==='error'?'error':'info'};break;
        case 'DISMISS_NOTICE':if(event.id!==state.notice.id)return state;next.notice={...state.notice,message:''};break;
        default:fail(`Unknown event: ${event.type}`);
      }
      return freeze(next);
    }
    function durable(state) {
      const {version,view,structure,themes,institutions,explorer,dialog,disclosures}=state;
      return JSON.parse(JSON.stringify({version,view,structure,themes,institutions,explorer,dialog,disclosures}));
    }
    function encode(state) {
      const p = new URLSearchParams();
      if(state.view==='structure'&&state.structure.mode!=='social')p.set('mode',state.structure.mode);
      if(state.view==='themes') {
        if(state.themes.metric!=='share')p.set('metric',state.themes.metric);
        if(state.themes.topic!==0)p.set('topic',state.themes.topic);
      }
      if(state.view==='institutions') {
        if(state.institutions.source!==2)p.set('source',state.institutions.source);
        if(state.institutions.topic!==-1)p.set('topic',state.institutions.topic);
        if(state.institutions.cross)p.set('cross','1');
      }
      if(state.view==='explorer')for(const [key,value] of Object.entries(state.explorer))if(value!==FILTER_DEFAULTS[key])p.set(key,String(value));
      if(state.dialog)p.set('record',state.dialog);
      return '#'+state.view+(p.size?'?'+p.toString():'');
    }
    function decode(hash,base=initial()) {
      const [view,query='']=String(hash||'').replace(/^#/,'').split('?');
      let state=transition(base,{type:'NAVIGATE',view:VIEWS.includes(view)?view:'overview'});
      const p=new URLSearchParams(query);
      const num=(key,min,max,fallback)=>{const raw=p.get(key);const n=raw!==null&&/^-?\d+$/.test(raw)?Number(raw):NaN;return Number.isSafeInteger(n)&&n>=min&&n<=max?n:fallback;};
      const text=key=>(p.get(key)||'').slice(0,2000);
      if(state.view==='structure')state=transition(state,{type:'SET_STRUCTURE',mode:p.get('mode')==='natural'?'natural':'social'});
      if(state.view==='themes')state=transition(state,{type:'SET_THEME',patch:{metric:p.get('metric')==='count'?'count':'share',topic:num('topic',0,topics.length-1,0)}});
      if(state.view==='institutions') {
        state=transition(state,{type:'SET_INSTITUTIONS',patch:{source:num('source',0,sources.length-1,2),topic:num('topic',-1,topics.length-1,-1)}});
        if(state.institutions.cross!==(p.get('cross')==='1'))state=transition(state,{type:'TOGGLE_CROSS'});
      }
      if(state.view==='explorer') {
        const source=num('source',-1,sources.length-1,-1),valid=optionsBySource.get(source);
        state=transition(state,{type:'OPEN_EVIDENCE',filters:{source,topic:num('topic',-1,topics.length-1,-1),cat:valid.cat.has(text('cat'))?text('cat'):'',disc:valid.disc.has(text('disc'))?text('disc'):'',org:text('org'),q:text('q'),sort:['org','title'].includes(p.get('sort'))?p.get('sort'):'source',page:num('page',1,Number.MAX_SAFE_INTEGER,1)}});
      }
      if(byKey.has(p.get('record')))state=transition(state,{type:'OPEN_RECORD',key:p.get('record')});
      return state;
    }
    function restore(snapshot,base=initial()) {
      if(!snapshot||snapshot.version!==1)return base;
      try {
        let s=transition(base,{type:'NAVIGATE',view:snapshot.view});
        s=transition(s,{type:'SET_STRUCTURE',mode:snapshot.structure.mode});
        s=transition(s,{type:'SET_THEME',patch:snapshot.themes});
        s=transition(s,{type:'SET_INSTITUTIONS',patch:{source:snapshot.institutions.source,topic:snapshot.institutions.topic}});
        if(s.institutions.cross!==snapshot.institutions.cross)s=transition(s,{type:'TOGGLE_CROSS'});
        s=transition(s,{type:'FILTER_PROJECTS',patch:snapshot.explorer});
        s=transition(s,{type:'SET_PAGE',page:snapshot.explorer.page});
        if(snapshot.dialog)s=transition(s,{type:'OPEN_RECORD',key:snapshot.dialog});
        for(const [key,open] of Object.entries(snapshot.disclosures||{}))s=transition(s,{type:'SET_DISCLOSURE',key,open});
        return s;
      } catch {return base;}
    }
    return Object.freeze({initial,transition,results,durable,encode,decode,restore,keys,keyFor:r=>keyByRow.get(r),record:key=>byKey.get(key),checkFilters});
  }
  return Object.freeze({create,VIEWS,FILTER_DEFAULTS});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=ResearchState;
