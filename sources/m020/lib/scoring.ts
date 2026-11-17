export function mergedSeconds(input:{start:number,end:number}[]) {
 const ranges=input.filter(x=>Number.isFinite(x.start)&&Number.isFinite(x.end)&&x.end>x.start).sort((a,b)=>a.start-b.start);let total=0,s=0,e=0;
 for(const r of ranges){if(r.start>e){total+=e-s;s=r.start;e=r.end;}else e=Math.max(e,r.end);}return total+e-s;
}
export function equalAnswer(actual:unknown,expected:unknown){if(Array.isArray(expected))return Array.isArray(actual)&&JSON.stringify([...actual].sort())===JSON.stringify([...expected].sort());return String(actual??'').trim().toLowerCase()===String(expected??'').trim().toLowerCase();}
export function shuffle<T>(items:T[]){const a=[...items];for(let i=a.length-1;i>0;i--){const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);const j=bytes[0]%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function stripQuestion(q:any){return {id:q.id,moduleId:q.moduleId,prompt:q.prompt,options:q.options,difficulty:q.difficulty,type:q.type};}
export function summarizeTime(rows:any[]){
 const kinds:Record<string,number>={},days:Record<string,number>={},lessons:Record<string,number>={};let last=0,total=0;
 for(const r of [...rows].sort((a,b)=>a.start-b.start)){let start=Math.max(last,r.start);const end=r.end;if(end<=start)continue;last=end;const seconds=(end-start)/1000;total+=seconds;kinds[r.kind]=(kinds[r.kind]||0)+seconds;lessons[r.lesson_id]=(lessons[r.lesson_id]||0)+seconds;
 while(start<end){const day=new Date(start+8*3600000).toISOString().slice(0,10),next=Date.parse(day+'T00:00:00+08:00')+86400000,stop=Math.min(end,next);days[day]=(days[day]||0)+(stop-start)/1000;start=stop;}}
 return {total,kinds,days,lessons};}
