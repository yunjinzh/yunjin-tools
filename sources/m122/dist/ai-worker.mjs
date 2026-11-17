import {chooseMove} from './ai.mjs';
self.onmessage=async ({data})=>{try{const result=await chooseMove(data.snapshot,data.settings,nodes=>self.postMessage({id:data.id,type:'progress',nodes}));self.postMessage({id:data.id,type:'result',result});}catch(e){self.postMessage({id:data.id,type:'error',message:e.message});}};
