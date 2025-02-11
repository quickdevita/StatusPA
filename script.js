// Inizializzazione della mappa con vista su Palermo
var map = L.map('map', {
  zoomControl: false, // Disabilita il controllo predefinito
  minZoom: 12,        // Impedisce di zoomare troppo fuori
}).setView([38.1157, 13.3615], 13);

// Aggiunta della mappa satellitare Esri
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Aggiunta manuale dei controlli di zoom SOLO su PC
if (window.innerWidth > 768) {
  L.control.zoom({
    position: 'bottomleft' // Posiziona in basso a sinistra
  }).addTo(map);
}

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

// Funzione per cercare e centrare la mappa su una zona
function searchZone() {
  let searchText = document.getElementById('search-input').value.toLowerCase();
  let foundZone = zonesData.find(zone => zone.name.toLowerCase().includes(searchText));

  if (foundZone) {
    map.fitBounds(foundZone.coordinates);
  }
}

// Attiva la ricerca solo quando l'utente preme INVIO
document.getElementById('search-input').addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    searchZone();
  }
});

// Ricerca vocale con attivazione della funzione alla fine del riconoscimento
document.getElementById('voice-search').addEventListener('click', () => {
  if ('webkitSpeechRecognition' in window) {
    let recognition = new webkitSpeechRecognition();
    recognition.lang = 'it-IT';

    recognition.onresult = (event) => {
      let speechResult = event.results[0][0].transcript;
      document.getElementById('search-input').value = speechResult;
      
      // Avvia la ricerca dopo il riconoscimento vocale
      searchZone();
    };

    recognition.start();
  } else {
    alert("Il tuo browser non supporta la ricerca vocale.");
  }
});

// Limiti della mappa estesi per includere anche Terrasini, ma limitati a sud
var bounds = [
  [37.950, 12.900], // Coordinata sud-ovest (un po' sopra Terrasini)
  [38.300, 13.800]  // Coordinata nord-est (più a est, includendo tutta la provincia)
];

// Limita la mappa alla provincia di Palermo, includendo Terrasini ma limitato a sud
map.setMaxBounds(bounds);
map.on('drag', function() {
  map.panInsideBounds(bounds, { animate: true });
});

// =========================
// 🔹 GESTIONE MENU UTENTE 🔹
// =========================

// Seleziona gli elementi del menu utente
const userIcon = document.getElementById('user-icon');
const userMenuContainer = document.getElementById('user-menu-container');
const userMenu = document.getElementById('user-menu');
const closeUserMenuBtn = document.getElementById('close-user-menu');

// Apri il menu quando si clicca sull'icona utente
userIcon.addEventListener('click', () => {
  userMenuContainer.classList.add('open');
});

// Chiudi il menu quando si clicca il pulsante di chiusura
closeUserMenuBtn.addEventListener('click', () => {
  closeUserMenu();
});

// Chiudi il menu quando si clicca fuori dal menu
userMenuContainer.addEventListener('click', (event) => {
  if (event.target === userMenuContainer) {
    closeUserMenu();
  }
});

// Funzione per chiudere il menu utente
function closeUserMenu() {
  userMenuContainer.classList.remove('open');
}

// ===========================
// 🔹 GESTIONE DRAG DEL MODALE 🔹
// ===========================

let modal = document.getElementById('modal');
let modalContainer = document.getElementById('modal-container');
let isDragging = false;
let startPos = { x: 0, y: 0 };

// Iniziamo a trascinare il modale
modal.addEventListener('mousedown', (e) => {
  isDragging = true;
  startPos.x = e.clientX - modal.offsetLeft;
  startPos.y = e.clientY - modal.offsetTop;
});

// Muoviamo il modale durante il drag
document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    let x = e.clientX - startPos.x;
    let y = e.clientY - startPos.y;

    // Limiti: Evita che il modale vada troppo in alto
    if (y < 0) y = 0; // Impedisce di spostarlo oltre il bordo superiore

    modal.style.left = `${x}px`;
    modal.style.top = `${y}px`;
  }
});

// Rilasciamo il modale
document.addEventListener('mouseup', () => {
  isDragging = false;
});

