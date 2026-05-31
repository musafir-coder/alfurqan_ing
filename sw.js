const CACHE = 'alfurqon-v2';
const ASSETS = [
  '/al-furqon/',
  '/al-furqon/index.html',
  '/al-furqon/assets/logo-symbol.png',
  '/al-furqon/assets/logo-name.png',
  '/al-furqon/assets/icon-192.png',
  '/al-furqon/assets/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
