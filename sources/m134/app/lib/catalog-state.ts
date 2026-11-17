export type View='explore'|'saved'|'notes';
export type CatalogState={view:View;query:string;category:string;minViews:number;minLikes:number;sort:string;status:string};
export const defaultCatalog:CatalogState={view:'explore',query:'',category:'全部',minViews:100000,minLikes:1000,sort:'curated',status:'全部进度'};
export type CatalogEvent={type:'PATCH';patch:Partial<Omit<CatalogState,'view'>>}|{type:'NAVIGATE';view:View}|{type:'RESTORE';state:CatalogState}|{type:'RESET'};
export function catalogReducer(state:CatalogState,event:CatalogEvent):CatalogState {
  switch(event.type){
    case 'PATCH':return {...state,...event.patch};
    case 'NAVIGATE':return {...defaultCatalog,view:event.view};
    case 'RESTORE':return event.state;
    case 'RESET':return {...defaultCatalog,view:state.view};
  }
}
export function readCatalog(search:string,categories:string[]):CatalogState {
  const p=new URLSearchParams(search);
  const allowed=(key:string,values:string[],fallback:string)=>values.includes(p.get(key)||'')?p.get(key)!:fallback;
  return {
    view:allowed('view',['explore','saved','notes'],'explore') as View,
    query:(p.get('q')||'').slice(0,500),category:allowed('category',categories,'全部'),
    minViews:Number(allowed('views',['100000','500000','1000000','10000000'],'100000')),
    minLikes:Number(allowed('likes',['1000','10000','50000'],'1000')),
    sort:allowed('sort',['curated','views','likes','newest'],'curated'),
    status:allowed('status',['全部进度','未开始','学习中','已学完'],'全部进度'),
  };
}
export function catalogURL(href:string,state:CatalogState) {
  const url=new URL(href);
  for(const [key,param] of Object.entries({view:'view',query:'q',category:'category',minViews:'views',minLikes:'likes',sort:'sort',status:'status'})){
    const k=key as keyof CatalogState;
    if(state[k]===defaultCatalog[k]&&k!=='view')url.searchParams.delete(param);
    else url.searchParams.set(param,String(state[k]));
  }
  return url;
}
