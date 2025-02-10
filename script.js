// Inizializzazione della mappa
var map = L.map('map', {
  zoomControl: false  // Disabilita i controlli di zoom di Leaflet
}).setView([38.1157, 13.3615], 13); // Palermo

// Aggiunta della mappa satellitare Esri
var esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Aggiungi i controlli di zoom manualmente
L.control.zoom({
  position: 'bottomright' // Posiziona i controlli di zoom in basso a destra
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

// Funzione di ricerca
document.getElementById('search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const searchQuery = event.target.value.toLowerCase();
    searchLocation(searchQuery);
  }
});

// Funzione per cercare la zona sulla mappa
function searchLocation(query) {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      const result = data.filter(zone => zone.name.toLowerCase().includes(query));
      if (result.length > 0) {
        const zone = result[0];  // Se troviamo un match, prendi il primo
        map.setView(zone.coordinates[0], 15);  // Centra la mappa sulla zona
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
let deferredPrompt; // Dichiarata una sola volta
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
        console.log('L\'utente ha installato la PWA!');
      } else {
        console.log('L\'utente ha rifiutato di installare la PWA.');
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
