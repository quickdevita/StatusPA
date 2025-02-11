// Inizializzazione della mappa con vista su Palermo
var map = L.map('map').setView([38.1157, 13.3615], 13);

// Aggiunta della mappa satellitare Esri
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Variabili globali
let zonesData = []; // Array per memorizzare i dati delle zone

// Caricamento dei dati dal file JSON
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    zonesData = data; // Salvo i dati per la ricerca

    data.forEach(zone => {
      var polygon = L.polygon(zone.coordinates, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.5
      }).addTo(map);

      polygon.on('click', () => openModal(zone.name, zone.info));
    });
  })
  .catch(error => console.error("Errore nel caricamento dei dati:", error));

// Funzione per aprire il modale
function openModal(title, info) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-info').innerText = info;
  document.getElementById('modal-container').classList.add('open');
  document.getElementById('modal').classList.add('open');
}

// Chiudere il modale
document.getElementById('close-modal').addEventListener('click', () => {
  closeModal();
});

// Chiudere cliccando fuori dal modale
document.getElementById('modal-container').addEventListener('click', (event) => {
  if (event.target === document.getElementById('modal-container')) {
    closeModal();
  }
});

// Chiudere trascinando verso il basso
let startY;
document.getElementById('modal').addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
});
document.getElementById('modal').addEventListener('touchmove', (e) => {
  let moveY = e.touches[0].clientY;
  if (moveY - startY > 50) { // Se trascini verso il basso
    closeModal();
  }
});

function closeModal() {
  document.getElementById('modal-container').classList.remove('open');
  document.getElementById('modal').classList.remove('open');
}

// Ricerca in tempo reale
document.getElementById('search-input').addEventListener('input', function () {
  let searchText = this.value.toLowerCase();
  let foundZone = zonesData.find(zone => zone.name.toLowerCase().includes(searchText));

  if (foundZone) {
    map.fitBounds(foundZone.coordinates);
  }
});

// Ricerca vocale
document.getElementById('voice-search').addEventListener('click', () => {
  if ('webkitSpeechRecognition' in window) {
    let recognition = new webkitSpeechRecognition();
    recognition.lang = 'it-IT';

    recognition.onresult = (event) => {
      let speechResult = event.results[0][0].transcript;
      document.getElementById('search-input').value = speechResult;
      
      let foundZone = zonesData.find(zone => zone.name.toLowerCase().includes(speechResult.toLowerCase()));
      if (foundZone) {
        map.fitBounds(foundZone.coordinates);
      }
    };

    recognition.start();
  } else {
    alert("Il tuo browser non supporta la ricerca vocale.");
  }
});
