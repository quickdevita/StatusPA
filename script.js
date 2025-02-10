// Inizializzazione della mappa con controlli di zoom attivi
var map = L.map('map', {
  zoomControl: true // Assicura che i pulsanti di zoom siano visibili
}).setView([38.1157, 13.3615], 13); // Palermo

// Aggiunta della mappa satellitare Esri
var esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Ripristino dei controlli di zoom in alto a sinistra
L.control.zoom({ position: 'topleft' }).addTo(map);

// Creazione del geocoder di Leaflet, posizionato al centro in alto
var geocoderControl = L.Control.geocoder({
  defaultMarkGeocode: false // Evita di aggiungere marker indesiderati
}).on('markgeocode', function(e) {
  map.setView(e.geocode.center, 15); // Centra la mappa sulla posizione trovata
}).addTo(map);

// Caricamento dei dati dal file JSON
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(zone => {
      var polygon = L.polygon(zone.coordinates, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.5
      }).addTo(map);

      // Popup con le informazioni del lavoro
      polygon.bindPopup(`<b>${zone.name}</b><br>${zone.info}`);
    });
  })
  .catch(error => console.error("Errore nel caricamento dei dati:", error));

// Gestione dell'installazione PWA
let deferredPrompt;
const installButton = document.createElement('button');
installButton.textContent = 'Installa';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.body.appendChild(installButton);

  installButton.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log("L'utente ha installato la PWA!");
      } else {
        console.log("L'utente ha rifiutato di installare la PWA.");
      }
      deferredPrompt = null;
    });
  });
});

// Registrazione del Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(function(registration) {
      console.log('Service Worker registrato con successo:', registration);
    })
    .catch(function(error) {
      console.log('Errore nel registro del Service Worker:', error);
    });
}
