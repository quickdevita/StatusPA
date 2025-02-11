// Inizializzazione della mappa con controllo dello zoom attivato
var map = L.map('map', { zoomControl: true }).setView([38.1157, 13.3615], 13); // Palermo

// Aggiunta della mappa satellitare Esri
var esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Assicura che i pulsanti di zoom siano visibili e posizionati correttamente
map.zoomControl.remove(); 
L.control.zoom({ position: 'bottomleft' }).addTo(map);

// Riferimenti al menu modale
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');

// Funzione per aprire il menu modale
function openModal(zone) {
  modalContent.innerHTML = `<h2>${zone.name}</h2><p>${zone.info}</p>`;
  modal.classList.add('open');
}

// Chiudere il menu modale con il pulsante
closeModal.addEventListener('click', () => {
  modal.classList.remove('open');
});

// Chiudere il menu modale trascinandolo verso il basso
let startY;
modal.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
});

modal.addEventListener('touchmove', (e) => {
  let moveY = e.touches[0].clientY;
  if (moveY - startY > 50) {
    modal.classList.remove('open');
  }
});

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

      // Aprire il menu modale quando si clicca su un'area
      polygon.on('click', () => openModal(zone));
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
        map.setView(result[0].coordinates[0], 15);
        openModal(result[0]); // Apri il menu modale quando trovi una zona
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

// Registrazione del Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(reg => console.log('Service Worker registrato:', reg))
    .catch(err => console.log('Errore Service Worker:', err));
}
