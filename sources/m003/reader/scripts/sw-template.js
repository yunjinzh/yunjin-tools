const CACHE_NAME = 'yunjin-reader-__VERSION__';
const PRECACHE = __PRECACHE__;
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('yunjin-reader-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === 'navigate') {
      try { return await fetch(request); }
      catch { return (await cache.match('/index.html', { ignoreVary: true })) || (await cache.match('/', { ignoreVary: true })); }
    }
    // Precache fetches and module requests may differ in Origin headers. All
    // entries here are same-origin static files, so Vary must not block offline use.
    const cached = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
    if (cached) return cached;
    return fetch(request);
  })());
});
