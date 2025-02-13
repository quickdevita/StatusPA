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
        fillOpacity: 0.4,
        weight: 1
      }).addTo(map);

      polygon.on('click', () => openModal(zone.name, zone.info));
    });
  })
  .catch(error => console.error("Errore nel caricamento dei dati:", error));

// ========================
// 🔹 GESTIONE DEL MODALE 🔹
// ========================

// Funzione per aprire il modale
function openModal(title, description, images, address, startDate, endDate) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-info").textContent = description;
  document.getElementById("modal-address").textContent = address || "Non disponibile";
  document.getElementById("modal-start-date").textContent = startDate || "Non disponibile";
  document.getElementById("modal-end-date").textContent = endDate || "Non disponibile";

  const modalImagesContainer = document.getElementById("modal-images");
  modalImagesContainer.innerHTML = ""; // Pulisce le immagini precedenti

  if (images && images.length > 0) {
    images.forEach((imgSrc) => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = "Immagine del lavoro";
      modalImagesContainer.appendChild(img);
    });
  } else {
    modalImagesContainer.innerHTML = "<p>Nessuna immagine disponibile</p>";
  }

  document.getElementById("modal-container").classList.add("open");
  document.getElementById("modal").classList.add("open");
  document.body.classList.add("modal-open");
}

// Funzione per chiudere il modale
function closeModalFunc() {
  document.getElementById("modal-container").classList.remove("open");
  document.getElementById("modal").classList.remove("open");
  document.body.classList.remove("modal-open");
}

// Chiudere il modale con il pulsante di chiusura
document.getElementById("close-modal").addEventListener("click", closeModalFunc);

// Chiudere cliccando fuori dal modale
document.getElementById("modal-container").addEventListener("click", function (event) {
  if (event.target === document.getElementById("modal-container")) {
    closeModalFunc();
  }
});

document.addEventListener("DOMContentLoaded", function() {
  var exclamationButton = document.getElementById("exclamation-mark");

  if (!exclamationButton) {
      console.error("Errore: Il pulsante con id 'exclamation-mark' non esiste!");
      return;
  }

  // Crea il pop-up
  var popup = document.createElement("div");
  popup.id = "popup";
  popup.style.position = "absolute";
  popup.style.display = "none"; // Nascondi di default
  popup.innerHTML = `
      <p><strong>Colore Zone:</strong></p>
      <ul>
          <li><span style="color: #FFFF00;">Giallo:</span> Lavori in corso</li>
          <li><span style="color: #90EE90;">Verde chiaro:</span> Lavori completati</li>
          <li><span style="color: #FF0000;">Rosso:</span> Lavori fermi</li>
          <li><span style="color: #FFA500;">Arancione:</span> Lavori in progetto</li>
      </ul>`;

  document.body.appendChild(popup);

  // Funzione per aggiornare la posizione
  function aggiornaPosizionePopup() {
      var rect = exclamationButton.getBoundingClientRect();
      var isMobile = window.innerWidth <= 768; // Schermi piccoli

      if (isMobile) {
          popup.classList.add("popup-left"); // Posiziona il pop-up a sinistra del punto esclamativo
          popup.classList.remove("popup-down"); // Rimuove la classe per la punta sopra
          popup.style.left = `${rect.left - popup.offsetWidth - 10}px`; // Posiziona il pop-up a sinistra
          popup.style.top = `${rect.top + rect.height / 2 - popup.offsetHeight / 2}px`; // Posiziona verticalmente
      } else {
          popup.style.top = `${rect.bottom + 10}px`; // Posiziona il pop-up sotto il punto esclamativo
          popup.classList.add("popup-down");
          popup.classList.remove("popup-left");
      }
  }

  // Mostra/nasconde il pop-up e aggiorna posizione
  exclamationButton.addEventListener("click", function(event) {
      event.stopPropagation(); // Evita la chiusura immediata

      if (popup.style.display === "block") {
          popup.style.display = "none";
      } else {
          popup.style.display = "block";
          aggiornaPosizionePopup();
      }

      // Assicura che il pulsante non scompaia su mobile
      exclamationButton.style.display = "block";
      exclamationButton.style.visibility = "visible";
  });

  // Chiude il pop-up cliccando fuori, ma NON nasconde il pulsante
  document.addEventListener("click", function(event) {
      if (!popup.contains(event.target) && event.target !== exclamationButton) {
          popup.style.display = "none";
      }
  });

  // Evita la chiusura immediata se si clicca sul pop-up
  popup.addEventListener("click", function(event) {
      event.stopPropagation();
  });

  // Aggiorna posizione quando cambia la finestra
  window.addEventListener("resize", aggiornaPosizionePopup);
});


// ==========================
// 🔹 GESTIONE DEL MENU UTENTE 🔹
// ==========================

const userIcon = document.getElementById('user-icon');
const userMenuContainer = document.getElementById('user-menu-container');
const closeUserMenuBtn = document.getElementById('close-user-menu');
const APP_VERSION = 'betav1'; // Versione aggiornata della PWA

// Apri il menu quando si clicca sull'icona utente
userIcon.addEventListener('click', () => {
  userMenuContainer.classList.add('open');
  // Aggiungi la versione all'interno del menu utente
  const versionElement = document.getElementById('user-version');
  if (versionElement) {
    versionElement.textContent = `Versione: ${APP_VERSION}`;
  }
});

// Chiudi il menu quando si clicca il pulsante di chiusura
closeUserMenuBtn.addEventListener('click', () => {
  userMenuContainer.classList.remove('open');
});

// Chiudi il menu quando si clicca fuori dal menu
userMenuContainer.addEventListener('click', (event) => {
  if (event.target === userMenuContainer) {
    userMenuContainer.classList.remove('open');
  }
});

// ==========================
// 🔹 LIMITI DELLA MAPPA 🔹
// ==========================

var bounds = [
  [37.950, 12.900], // Coordinata sud-ovest (un po' sopra Terrasini)
  [38.300, 13.800]  // Coordinata nord-est (più a est, includendo tutta la provincia)
];

// Limita la mappa alla provincia di Palermo
map.setMaxBounds(bounds);
map.on('drag', function() {
  map.panInsideBounds(bounds, { animate: true });
});

// =========================
// 🔹 GESTIONE DELLA RICERCA 🔹
// ==========================

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
