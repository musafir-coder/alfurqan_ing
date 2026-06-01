const CACHE = 'alfurqon-v6';
const ASSETS = [
  '/al-furqon/assets/logo-symbol.png',
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
  const req = e.request;
  const url = new URL(req.url);
  // HTML и config.json — всегда с сети (свежие)
  if (req.destination === 'document' || url.pathname.endsWith('.html') || url.pathname.endsWith('/') || url.pathname.endsWith('config.json')) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  // Остальное — кэш, иначе сеть
  e.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
