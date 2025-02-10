// Inizializzazione della mappa
var map = L.map('map', {
  zoomControl: true // Forza la visualizzazione dei pulsanti di zoom
}).setView([38.1157, 13.3615], 13); // Palermo

// Aggiunta della mappa satellitare Esri
var esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Ripristino dei controlli di zoom
L.control.zoom({ position: 'topleft' }).addTo(map);

// Geocoder per la ricerca delle vie
var geocoder = L.Control.geocoder({
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

// Funzione di ricerca combinata (vie + lavori JSON)
document.getElementById('search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const searchQuery = event.target.value.toLowerCase();
    searchLocation(searchQuery);
  }
});

function searchLocation(query) {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      const result = data.find(zone => zone.name.toLowerCase().includes(query));
      if (result) {
        map.setView(result.coordinates[0], 15); // Centra sulla zona trovata
      } else {
        // Se non trova nei lavori JSON, prova il geocoder per le vie
        geocoder.options.geocoder.geocode(query, function(results) {
          if (results.length > 0) {
            map.setView(results[0].center, 15);
          } else {
            alert("Luogo non trovato.");
          }
        });
      }
    })
    .catch(error => console.error("Errore nella ricerca:", error));
}

// Funzione per l'inserimento vocale
document.getElementById('voice-search').addEventListener('click', () => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      document.getElementById('search-input').value = spokenText;
      searchLocation(spokenText.toLowerCase());
    };
    recognition.start();
  } else {
    alert("Riconoscimento vocale non supportato.");
  }
});

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
