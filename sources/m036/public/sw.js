/* Offline copies stay in this browser and are made only on visitor request. */
const CACHE = 'shanhe-exhibition-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async()=>{for(const name of await caches.keys()){if(name.startsWith('shanhe-exhibition-')&&name!==CACHE)await caches.delete(name);}await self.clients.claim();})()));
self.addEventListener('message', event => {
 if (event.data?.type !== 'save-offline') return;
 const reply = data => event.source?.postMessage(data);
 event.waitUntil((async () => {
  try {
   const response = await fetch('/offline-manifest.json', {cache:'no-store'});
   if (!response.ok) throw Error('manifest unavailable');
   const {assets} = await response.json();
   const cache = await caches.open(CACHE);
   let done = 0;
   const queue = [...assets];
   await Promise.all(Array.from({length:4}, async () => {
    while (queue.length) {
     const url = queue.shift();
     const result = await fetch(url, {cache:'reload', signal:AbortSignal.timeout(30000)});
     if (!result.ok) throw Error('asset unavailable');
     if(/\.(jpg|webp|png)(\?|$)/.test(url)&&!result.headers.get('content-type')?.startsWith('image/'))throw Error('invalid image response');
     await cache.put(url, result);
     reply({type:'offline-progress', done:++done, total:assets.length});
    }
   }));
   reply({type:'offline-ready'});
  } catch { reply({type:'offline-error'}); }
 })());
});
self.addEventListener('fetch', event => {
 if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
 if (event.request.mode === 'navigate') {
  event.respondWith(fetch(event.request).catch(async () => (await caches.match('/')) || Response.error()));
 } else {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
 }
});
