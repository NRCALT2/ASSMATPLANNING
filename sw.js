const CACHE_NAME = 'supermam-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/ideas.html',
  '/ideas.css',
  '/planning.html',
  '/planning.css',
  // ajoute ici d'autres fichiers statiques que tu veux rendre offline
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
