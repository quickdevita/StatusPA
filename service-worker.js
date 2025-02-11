// Versione del service worker
const SW_VERSION = 'betav1';
const CACHE_NAME = `statuspa-cache-${SW_VERSION}`;
const urlsToCache = [
  '/StatusPA/',
  '/StatusPA/index.html',
  '/StatusPA/styles.css',
  '/StatusPA/script.js',
  '/StatusPA/icons/icon-192x192.png',
  '/StatusPA/icons/icon-512x512.png',
  '/StatusPA/manifest.json'
];

// Installazione del Service Worker e caching dei file
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
          .catch((error) => console.error('Errore nel caching:', error));
      })
  );
});

// Intercettazione delle richieste di rete
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('favicon.ico')) {
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return new Response('Errore di rete', { status: 408 });
    })
  );
});

// Attivazione e pulizia della cache vecchia
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
