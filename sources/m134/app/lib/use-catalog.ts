'use client';
import {useEffect,useReducer,useRef} from 'react';
import {catalogReducer,catalogURL,defaultCatalog,readCatalog} from './catalog-state';
import type {CatalogEvent} from './catalog-state';

export function useCatalog(categories:string[]) {
  const [state,dispatch]=useReducer(catalogReducer,defaultCatalog);
  const current=useRef(state);
  useEffect(()=>{
    const restore=()=>{
      const next=readCatalog(location.search,categories);current.current=next;
      dispatch({type:'RESTORE',state:next});
    };
    restore();window.addEventListener('popstate',restore);
    return ()=>window.removeEventListener('popstate',restore);
  },[categories]);
  function transition(event:CatalogEvent) {
    const next=catalogReducer(current.current,event);current.current=next;dispatch(event);
    const url=catalogURL(location.href,next);
    if(url.href!==location.href) {
      if(event.type==='NAVIGATE')history.pushState({},'',url);
      else history.replaceState({},'',url);
    }
    if(event.type==='NAVIGATE')window.scrollTo({top:0,behavior:'smooth'});
  }
  return {state,transition};
}
