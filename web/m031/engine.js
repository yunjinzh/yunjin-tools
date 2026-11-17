/* Shared, deterministic teaching engine; UI and WebMCP call the same actions. */
(function(root){
 'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x));
 function start(s){return {id:s.id,phase:0,value:s.steps[0].range?.initial??0,nodes:copy(s.nodes),paths:[],history:[],log:[],feedback:'选择队伍与目标，安排当前阶段的行动。',tone:'neutral',attempts:0,done:false};}
 function parameter(s,state,value){const r=s.steps[state.phase]?.range;if(!r)throw new Error('当前阶段没有参数');if(!Number.isFinite(value)||value<r.min||value>r.max)throw new Error('参数超出范围');return {...state,value};}
 function act(s,state,key){
  if(state.id!==s.id)throw new Error('场景与状态不匹配');
  if(state.done)throw new Error('推演已完成，请重置后重试');
  const task=s.steps[state.phase];const choice=task.options.find(x=>x.key===key);if(!choice)throw new Error('操作不属于当前阶段');
  let next=copy(state);next.attempts++;
  if(key!==task.answer){
   next.feedback=choice.why||'当前环节的条件尚未成立。先完成前一环，后一环才能产生作用。';next.tone='warning';
   if(s.id===35&&key==='break'){
    const phase=state.phase===2?1:0;next=start(s);
    for(let i=0;i<phase;i++){next=act(s,next,s.steps[i].answer).state;}
    next.history=[...state.history,copy({...state,history:[]})];next.attempts=state.attempts+1;
    next.paths=[{from:phase===1?'b':'a',to:'c',label:'前环断开 · 后环条件失效',kind:'cut'}];
    next.feedback='前环已断开：目标的后续控制条件不再成立。沙盘回到仍有效的环节，请重新建立依赖。';next.tone='warning';
   }
   return {state:next,accepted:false};
  }
  if(task.range&&(state.value<task.range.low||state.value>task.range.high)){
   next.feedback=task.range.why;next.tone='warning';
   if(s.id===32){next.nodes=next.nodes.map(x=>x.id==='enemy'?{...x,x:620,y:180,label:'疑虑不足 · 继续接近'}:x);}
   return {state:next,accepted:false};
  }
  const snapshot=copy({...state,history:[]});next.history=[...state.history,snapshot];
  next.nodes=next.nodes.map(x=>({...x,...(task.patch[x.id]||{})}));next.paths=copy(task.paths);
  if(s.id===32&&state.phase===0)next.nodes=next.nodes.map(x=>x.id==='enemy'?{...x,x:750,y:130,label:'已有疑虑 · 重新评估'}:x);
  next.log.push({phase:state.phase,title:task.title,choice:choice.label,value:task.range?state.value:null,unit:task.range?.unit||'',result:task.result});
  next.phase++;next.done=next.phase===s.steps.length;next.feedback=task.result;next.tone=next.done?'complete':'success';next.value=s.steps[next.phase]?.range?.initial??0;
  return {state:next,accepted:true};
 }
 function undo(state){if(!state.history.length)return state;const previous=copy(state.history[state.history.length-1]);previous.history=state.history.slice(0,-1);previous.feedback='已回到上一个阶段，可以尝试不同操作。';previous.tone='neutral';return previous;}
 const api={start,parameter,act,undo};root.StratagemEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
