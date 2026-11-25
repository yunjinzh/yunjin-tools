// Browser task phases describe user-visible work. Tracking, storage and playback
// evolve independently; permissions are derived instead of copied into each view.
const busyPhases = new Set(['preparing','read','loading','extract','choose','export','verify','upload','queued','remote','pausing','clearing']);
export const sameSettings = (a,b) => !!a && !!b && a.bg===b.bg && a.size===b.size && a.audio===b.audio;
export function taskPolicy(phase,context={}) {
  const {hasJob=false,hasMotion=false,hasResult=false,previousLook=false,remote=false}=context;
  const busy=busyPhases.has(phase);
  const retry={
    ready:previousLook&&hasResult?'export':null,pause:'resume',failed:hasMotion?'export':'retry',changed:'export',
    disconnected:'reconnect',expired:'upload'
  }[phase];
  const pause=busy && !['preparing','pausing','clearing'].includes(phase);
  const rules = {
    busy, pause, retry:hasJob?retry||null:null,
    choose:phase==='choose', settings:!busy && phase!=='disconnected',
    preview:hasResult && ['ready','changed','pause','failed'].includes(phase),
    download:phase==='ready' && hasResult,
    worker:remote?'server':'browser'
  };
  rules.actions=[rules.pause&&'pause',rules.retry,rules.choose&&'choose',rules.preview&&'seek',rules.download&&'download'].filter(Boolean);
  return rules;
}
export const retryLabel={resume:'继续处理',export:'重新导出 MP4',retry:'重试处理',reconnect:'重新连接任务',upload:'重新上传原片'};
export function restoration({paused,result:out,settings,motion,failure,draft}) {
  if(paused) return 'pause';
  if(failure) return 'failed';
  if(out?.out && motion?.complete) {
    if(sameSettings(out.settings,settings))return 'ready';
    if(draft !== false)return 'changed';
  }
  return 'continue';
}
export function serverPhase(state,stage) {
  if(state==='running')return ({inspect:'read',extract:'extract',encode:'export',verify:'verify'})[stage]||'remote';
  return ({queued:'queued',choose:'choose',pausing:'pausing',paused:'pause',failed:'failed',ready:'ready'})[state]||'remote';
}
export async function registerStateTools(registry,read,act) {
  if(typeof registry?.registerTool!=='function')return false;
  const empty={type:'object',properties:{},additionalProperties:false};
  const commands=['pause','resume','retry','reconnect','export','upload','choose','seek'];
  const tools=[
    {name:'get_motion_state',description:'Read the current video task phase, playback, tracking quality, available actions and download readiness.',inputSchema:empty,annotations:{readOnlyHint:true},execute:()=>read()},
    {name:'act_on_motion_task',description:'Use a currently available action on the same task revision. choose takes a 1-based person number. seek takes seconds. Use the visible download link to save the file.',inputSchema:{type:'object',properties:{task:{type:'string'},revision:{type:'integer'},action:{type:'string',enum:commands},value:{type:'number'}},required:['task','revision','action'],additionalProperties:false},execute:async args=>{
      const state=read();
      if(!args||Object.keys(args).some(k=>!['task','revision','action','value'].includes(k))||args.task!==state.task||args.revision!==state.revision||!commands.includes(args.action)||!state.actions.includes(args.action))throw Error('操作已失效，请重新读取任务状态。');
      if(args.action==='choose'&&(!Number.isInteger(args.value)||args.value<1||args.value>state.candidates))throw Error('人物编号超出范围。');
      if(args.action==='seek'&&(!Number.isFinite(args.value)||args.value<0||args.value>state.duration))throw Error('时间超出原片范围。');
      if(!['choose','seek'].includes(args.action)&&args.value!==undefined)throw Error('此操作不需要数值。');
      await act(args.action,args.value);return read();
    }}
  ];
  const registered=await Promise.all(tools.map(async tool=>{
    try{await registry.registerTool(tool);return true;}
    catch{return false;}
  }));
  return registered.every(Boolean);
}
