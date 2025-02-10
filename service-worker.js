const CACHE_NAME = 'statuspa-cache-v3';
const urlsToCache = [
  './', // Root per GitHub Pages
  './index.html',
  './styles.css',
  './script.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './manifest.json'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
          .catch((error) => {
            console.error('Errore nella cache dei file:', error);
          });
      })
  );
});

// Intercettazione delle richieste di rete
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/favicon.ico')) {
    // Evita l'errore 404 della favicon
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
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
