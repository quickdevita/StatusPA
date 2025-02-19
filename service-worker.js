// Versione del service worker
const SW_VERSION = '0.0.73'; // Incrementa il numero della versione
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
      // ad esempio, caricare una versione predefinita del profilo
    })
  );
});

// Intercettazione delle richieste di rete
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Evita di gestire il caching del favicon
  if (requestUrl.includes('favicon.ico')) {
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

  // Cache delle tile della mappa (Esri e OSM)
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

  // Gestione della cache per i dati utente separatamente
  if (requestUrl.includes('user-profile') || requestUrl.includes('/user-avatar')) { // Gestisce la cache del profilo e dell'immagine
    event.respondWith(
      caches.open(USER_PROFILE_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request);
        });
      })
    );
    return;
  }

  // Cache per altri file
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
  const cacheWhitelist = [CACHE_NAME, MAP_CACHE_NAME, USER_PROFILE_CACHE_NAME]; // Aggiungi USER_PROFILE_CACHE_NAME
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
