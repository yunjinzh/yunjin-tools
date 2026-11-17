/* Keep imported tools independent when they share a GitHub Pages origin. */
(() => {
  'use strict';
  const config = window.__YUNJIN_TOOL__;
  if (!config) return;
  const base = new URL(config.base, location.origin);
  const files = new Set(config.files);
  const assets = config.assets;
  const namespace = `yunjin:${config.id === 'gis101' ? location.pathname : config.id}:`;
  function localPath(url) {
    if (url.origin === location.origin) {
      if (url.pathname.startsWith(base.pathname)) return decodeURIComponent(url.pathname.slice(base.pathname.length));
      if (url.pathname.startsWith('/yunjin-tools/apps/')) return null;
      return decodeURIComponent(url.pathname.slice(1));
    }
    if (config.origins.includes(url.origin)) return decodeURIComponent(url.pathname.slice(1));
    return null;
  }
  function resolve(value) {
    if (typeof value !== 'string' || !value || /^(?:data:|blob:|javascript:|mailto:|#)/i.test(value)) return value;
    try {
      const url = new URL(value, document.baseURI);
      const rel = localPath(url);
      if (rel === null) return value;
      if (rel === '') return base.href + url.search + url.hash;
      if (assets[rel]) return assets[rel] + url.search + url.hash;
      if (files.has(rel) || files.has(rel.replace(/\/$/, '') + '/index.html')) return base.href + rel + url.search + url.hash;
    } catch (_) {}
    return value;
  }
  window.__resolveToolURL = resolve;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' || input instanceof URL) return originalFetch(resolve(String(input)), init);
    if (input instanceof Request && resolve(input.url) !== input.url) return originalFetch(new Request(resolve(input.url), input), init);
    return originalFetch(input, init);
  };
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) { return open.call(this, method, resolve(String(url)), ...rest); };
  const attr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    return attr.call(this, name, /^(?:src|href|poster|data-src)$/i.test(name) ? resolve(String(value)) : value);
  };
  for (const [proto, key] of [[HTMLImageElement.prototype,'src'],[HTMLMediaElement.prototype,'src'],[HTMLSourceElement.prototype,'src'],[HTMLVideoElement.prototype,'poster'],[HTMLAnchorElement.prototype,'href'],[HTMLScriptElement.prototype,'src'],[HTMLLinkElement.prototype,'href'],[HTMLIFrameElement.prototype,'src']]) {
    const descriptor = Object.getOwnPropertyDescriptor(proto,key);
    if (descriptor?.set && descriptor.configurable) Object.defineProperty(proto,key,{...descriptor,set(value){descriptor.set.call(this,resolve(String(value)));}});
  }
  function cssURL(value) { return String(value).replace(/url\((['"]?)([^)'"\n]+)\1\)/g,(_,quote,url)=>`url(${quote}${resolve(url)}${quote})`); }
  const setCSS = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function(name,value,priority){return setCSS.call(this,name,cssURL(value),priority);};
  for (const key of ['backgroundImage','background','listStyleImage']) {
    const descriptor=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,key);
    if(descriptor?.set&&descriptor.configurable)Object.defineProperty(CSSStyleDeclaration.prototype,key,{...descriptor,set(value){descriptor.set.call(this,cssURL(value));}});
  }
  for (const name of ['localStorage','sessionStorage']) {
    try {
      const storage=window[name];
      const keys=()=>Object.keys(storage).filter(k=>k.startsWith(namespace)).map(k=>k.slice(namespace.length));
      const api={getItem:key=>storage.getItem(namespace+key),setItem:(key,value)=>storage.setItem(namespace+key,value),removeItem:key=>storage.removeItem(namespace+key),clear:()=>keys().forEach(key=>storage.removeItem(namespace+key)),key:index=>keys()[index]??null};
      const proxy=new Proxy(api,{get(target,key){if(key==='length')return keys().length;if(key in target)return target[key];if(typeof key==='symbol')return undefined;return target.getItem(key);},set(target,key,value){target.setItem(key,value);return true;},deleteProperty(target,key){target.removeItem(key);return true;},ownKeys:keys,getOwnPropertyDescriptor(){return{enumerable:true,configurable:true};}});
      Object.defineProperty(window,name,{configurable:true,get:()=>proxy});
    } catch (_) {}
  }
  if(window.indexedDB){const open=IDBFactory.prototype.open,del=IDBFactory.prototype.deleteDatabase;IDBFactory.prototype.open=function(name,...args){return open.call(this,namespace+name,...args);};IDBFactory.prototype.deleteDatabase=function(name){return del.call(this,namespace+name);};}
  if(navigator.serviceWorker){const register=navigator.serviceWorker.register.bind(navigator.serviceWorker);navigator.serviceWorker.register=(script,options={})=>register(resolve(String(script)),{...options,scope:options.scope?resolve(options.scope):base.pathname});}
  document.addEventListener('click',event=>{const a=event.target.closest?.('a[href]');if(a){const before=a.getAttribute('href'),after=resolve(before);if(after!==before)attr.call(a,'href',after);}},true);
})();
