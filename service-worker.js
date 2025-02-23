// Versione del service worker
const SW_VERSION = '0.0.81'; // Incrementa il numero della versione
const CACHE_NAME = `statuspa-cache-${SW_VERSION}`;
const MAP_CACHE_NAME = `statuspa-map-cache-${SW_VERSION}`;
const USER_PROFILE_CACHE_NAME = 'user-profile-cache'; // Cache separata per i dati utente
const urlsToCache = [
  '/StatusPA/',
  '/StatusPA/index.html',
  '/StatusPA/styles.css',
  '/StatusPA/script.js',
  '/StatusPA/icons/iconv1-192x192.png',
  '/StatusPA/icons/iconv1-512x512.png',
  '/StatusPA/icons/iconv1-1080x1920.png',
  '/StatusPA/icons/iconv1-1920x1080.png',
  '/StatusPA/favicon.ico',
  '/StatusPA/manifest.json'
];

// Installazione del Service Worker e caching dei file
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forza l'installazione del nuovo worker subito
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
          .catch((error) => console.error('Errore nel caching:', error));
      })
  );

  // Aggiungi la cache dell'utente durante l'installazione
  event.waitUntil(
    caches.open(USER_PROFILE_CACHE_NAME).then(cache => {
      // Qui puoi aggiungere i file relativi all'utente, se necessario
    })
  );
});

// Intercettazione delle richieste di rete
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  if (requestUrl.includes('favicon.ico')) {
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

  if (requestUrl.includes('tile.openstreetmap.org') || requestUrl.includes('arcgisonline.com')) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then(cache => {
        return fetch(event.request).then(response => {
          cache.put(event.request, response.clone()); // Salva la tile nella cache
          return response;
        }).catch(() => {
          return cache.match(event.request); // Se offline, carica la tile dalla cache
        });
      })
    );
    return;
  }

  if (requestUrl.includes('user-profile') || requestUrl.includes('/user-avatar')) {
    event.respondWith(
      caches.open(USER_PROFILE_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request);
        });
      })
    );
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
  const cacheWhitelist = [CACHE_NAME, MAP_CACHE_NAME, USER_PROFILE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Elimina cache vecchie
          }
        })
      );
    })
  );
});

// Forzare il ricaricamento quando il nuovo service worker è attivo
self.addEventListener('controllerchange', () => {
  window.location.reload(); // Ricarica l'app quando il service worker viene aggiornato
});