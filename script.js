// Definizione dei layer delle mappe
let esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
});

let osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
});

// Inizializzazione della mappa con Esri
var map = L.map('map', {
  zoomControl: false, // Disabilita il controllo predefinito
  minZoom: 12,
  layers: [esriLayer] // Iniziamo con Esri
}).setView([38.1157, 13.3615], 13);

// Definizione dei limiti della mappa (Provincia di Palermo)
var bounds = [
  [37.950, 12.900], // Sud-Ovest
  [38.300, 13.800]  // Nord-Est
];

// Imposta i limiti sulla mappa
map.setMaxBounds(bounds);
map.on('drag', function() {
  map.panInsideBounds(bounds, { animate: true });
});

// Aggiunta manuale dei controlli di zoom SOLO su PC
if (window.innerWidth > 768) {
  L.control.zoom({
      position: 'bottomleft' // Posiziona in basso a sinistra
  }).addTo(map);
}

// Variabili globali
let zonesData = []; // Array per memorizzare i dati delle zone
let layers = [esriLayer, osmLayer]; // Solo Esri e OSM
let currentLayerIndex = 0; // Indice del layer attivo

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

          polygon.on('click', () => openModal(
              zone.name, 
              zone.description || "Descrizione non disponibile", 
              Array.isArray(zone.images) ? zone.images : [], // Verifica che sia un array
              zone.address || "Indirizzo non disponibile",
              zone.startDate || "Data di inizio non disponibile",
              zone.endDate || "Data di fine non disponibile",
              zone.importo || "Importo non disponibile",  // ✅ Cambiato da "info" a "importo"
              zone.stato || "Stato non disponibile"       // ✅ Aggiunto "stato"
          ));
      });
  })
  .catch(error => console.error("Errore nel caricamento dei dati:", error));

// Funzione per cambiare la mappa
function changeMapLayer() {
  currentLayerIndex = (currentLayerIndex + 1) % layers.length; // Cambia layer ciclicamente
  map.eachLayer(layer => map.removeLayer(layer)); // Rimuove il layer attuale
  map.addLayer(layers[currentLayerIndex]); // Aggiunge il nuovo layer

  // Riapplichiamo i limiti della mappa
  map.setMaxBounds(bounds);
  map.panInsideBounds(bounds, { animate: true });

  // Riaggiungiamo i lavori pubblici dopo il cambio della mappa
  zonesData.forEach(zone => {
      var polygon = L.polygon(zone.coordinates, {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.4,
          weight: 1
      }).addTo(map);

      polygon.on('click', () => openModal(
          zone.name, 
          zone.description || "Descrizione non disponibile", 
          Array.isArray(zone.images) ? zone.images : [],
          zone.address || "Indirizzo non disponibile",
          zone.startDate || "Data di inizio non disponibile",
          zone.endDate || "Data di fine non disponibile",
          zone.info || "Informazioni non disponibili"
      ));
  });
}

// Collegamento del bottone per il cambio mappa
document.getElementById('mapToggleButton').addEventListener('click', changeMapLayer);

// ========================
// 🔹 GESTIONE DEL MODALE DEI LAVORI 🔹
// ========================
// Funzione per aprire il modale
function openModal(title, description, images, address, startDate, endDate, importo, stato) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-details").textContent = description; 
  document.getElementById("modal-address").textContent = address;
  document.getElementById("modal-start-date").textContent = startDate;
  document.getElementById("modal-end-date").textContent = endDate;
  document.getElementById("modal-importo").textContent = importo;
  document.getElementById("modal-stato").textContent = stato;


  const modalImagesContainer = document.getElementById("modal-images");
  modalImagesContainer.innerHTML = ""; // Pulisce le immagini precedenti

  if (images.length > 0) {
    images.forEach((imgSrc) => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = "Immagine del lavoro";
      img.classList.add("modal-thumbnail"); // Aggiunge classe per lo stile
      img.addEventListener("click", () => openFullscreenImage(imgSrc)); // Aggiunge evento click
      modalImagesContainer.appendChild(img);
    });
  } else {
    modalImagesContainer.innerHTML = "<p>Nessuna immagine disponibile</p>";
  }

  document.getElementById("modal-container").classList.add("open");
  document.getElementById("modal").classList.add("open");
  document.body.classList.add("modal-open");
}

// Funzione per chiudere il modale dei lavori
function closeModal() {
  document.getElementById("modal-container").classList.remove("open");
  document.getElementById("modal").classList.remove("open");
  document.body.classList.remove("modal-open");
}

// ========================
// 🔹 GESTIONE DELL'IMMAGINE A SCHERMO INTERO 🔹
// ========================
function openFullscreenImage(imgSrc) {
  const fullscreenContainer = document.createElement("div");
  fullscreenContainer.classList.add("fullscreen-container");

  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "Immagine ingrandita";
  img.classList.add("fullscreen-image");
  img.style.transform = "scale(1)";
  img.style.transition = "transform 0.2s ease";

  let scale = 1;

  // Gestione zoom con la rotellina del mouse
  fullscreenContainer.addEventListener("wheel", (event) => {
    event.preventDefault();
    scale += event.deltaY * -0.01;
    scale = Math.min(Math.max(1, scale), 3); // Limita lo zoom tra 1x e 3x
    img.style.transform = `scale(${scale})`;
  });

  // Gestione pinch-to-zoom su touch screen
  let touchStartDistance = 0;
  fullscreenContainer.addEventListener("touchstart", (event) => {
    if (event.touches.length === 2) {
      touchStartDistance = getDistance(event.touches[0], event.touches[1]);
    }
  });

  fullscreenContainer.addEventListener("touchmove", (event) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      const newDistance = getDistance(event.touches[0], event.touches[1]);
      scale *= newDistance / touchStartDistance;
      scale = Math.min(Math.max(1, scale), 3);
      img.style.transform = `scale(${scale})`;
      touchStartDistance = newDistance;
    }
  });

  function getDistance(touch1, touch2) {
    return Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
  }

  // Crea il pulsante di chiusura (X)
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;"; // Simbolo X
  closeButton.classList.add("close-fullscreen");
  closeButton.addEventListener("click", () => {
    fullscreenContainer.remove();
  });

  // Aggiunge immagine e pulsante al contenitore
  fullscreenContainer.appendChild(img);
  fullscreenContainer.appendChild(closeButton);
  document.body.appendChild(fullscreenContainer);

  // Chiudi l'immagine a schermo intero con un click sullo sfondo
  fullscreenContainer.addEventListener("click", (event) => {
    if (event.target === fullscreenContainer) {
      fullscreenContainer.remove();
    }
  });
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

// Seleziona tutti i tab
const tabs = document.querySelectorAll('.tab-button');

// Aggiungi l'evento di click ai tab
tabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const sectionToShow = this.getAttribute('data-tab');

        // Rimuovi la classe "active" da tutti i tab e dalle sezioni
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Aggiungi la classe "active" al tab selezionato e alla sezione corrispondente
        this.classList.add('active');
        document.getElementById(sectionToShow).classList.add('active');

        // Mostra le informazioni extra solo se il tab selezionato è "Info dettagliate"
        const modalExtra = document.querySelector('.modal-extra');
        if (sectionToShow === "info") {
            modalExtra.style.display = "block";
        } else {
            modalExtra.style.display = "none";
        }
    });
});

// ========================
// 🔹 RIDIMENSIONAMENTO E MINIMIZZAZIONE MODALE (STILE GOOGLE MAPS) 🔹
// ========================
let isDragging = false;
let startY = 0;
let startHeight = 0;

const modal = document.getElementById("modal");
const modalHandle = document.querySelector(".modal-handle");

// Altezza massima e minima
const screenHeight = window.innerHeight;
const MINIMIZED_HEIGHT = 100; // Altezza minimizzata
const MEDIUM_HEIGHT = screenHeight * 0.5; // 50% dello schermo
const MAX_HEIGHT = screenHeight * (window.innerWidth < 768 ? 0.9 : 0.85); // 90% mobile, 85% PC

// Funzione per trovare il breakpoint più vicino
function getClosestHeight(currentHeight) {
  const breakpoints = [MINIMIZED_HEIGHT, MEDIUM_HEIGHT, MAX_HEIGHT];
  return breakpoints.reduce((prev, curr) => 
    Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
  );
}

// Funzione per iniziare il trascinamento
modalHandle.addEventListener("mousedown", (e) => {
  isDragging = true;
  startY = e.clientY;
  startHeight = modal.offsetHeight;
  modalHandle.style.cursor = "grabbing";
  modal.classList.remove("minimized");
});

// Funzione per il trascinamento
document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const offset = e.clientY - startY;
    const newHeight = startHeight - offset;

    if (newHeight > MINIMIZED_HEIGHT && newHeight < MAX_HEIGHT) {
      modal.style.height = newHeight + "px";
    }
  }
});

// Rilascia il mouse e adatta il modale
document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    modalHandle.style.cursor = "grab";

    // Trova l'altezza più vicina e adatta il modale
    const closestHeight = getClosestHeight(modal.offsetHeight);
    modal.style.height = closestHeight + "px";
  }
});

// 🔹 GESTIONE TOUCH (PER DISPOSITIVI MOBILI)
modalHandle.addEventListener("touchstart", (e) => {
  isDragging = true;
  startY = e.touches[0].clientY;
  startHeight = modal.offsetHeight;
  modal.classList.remove("minimized");
});

document.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const offset = e.touches[0].clientY - startY;
    const newHeight = startHeight - offset;

    if (newHeight > MINIMIZED_HEIGHT && newHeight < MAX_HEIGHT) {
      modal.style.height = newHeight + "px";
    }
  }
});

document.addEventListener("touchend", () => {
  if (isDragging) {
    isDragging = false;

    // Trova l'altezza più vicina e adatta il modale
    const closestHeight = getClosestHeight(modal.offsetHeight);
    modal.style.height = closestHeight + "px";
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
    <p><strong>Legenda colori lavori:</strong></p>
    <ul style="list-style: none; padding: 0;">
        <li style="display: flex; align-items: center; margin-bottom: 5px;">
            <span style="width: 15px; height: 15px; background-color: #FFFF00; border: 1px solid black; border-radius: 50%; display: inline-block; margin-right: 10px;"></span> 
            Lavori in corso
        </li>
        <li style="display: flex; align-items: center; margin-bottom: 5px;">
            <span style="width: 15px; height: 15px; background-color: #90EE90; border: 1px solid black; border-radius: 50%; display: inline-block; margin-right: 10px;"></span> 
            Lavori completati
        </li>
        <li style="display: flex; align-items: center; margin-bottom: 5px;">
            <span style="width: 15px; height: 15px; background-color: #FF0000; border: 1px solid black; border-radius: 50%; display: inline-block; margin-right: 10px;"></span> 
            Lavori fermi
        </li>
        <li style="display: flex; align-items: center; margin-bottom: 5px;">
            <span style="width: 15px; height: 15px; background-color: #FFA500; border: 1px solid black; border-radius: 50%; display: inline-block; margin-right: 10px;"></span> 
            Lavori in progetto
        </li>
    </ul>`;


  document.body.appendChild(popup);

  // Funzione per aggiornare la posizione del popup
function aggiornaPosizionePopup() {
  var rect = exclamationButton.getBoundingClientRect();
  var isMobile = window.innerWidth <= 768; // Controllo se è uno smartphone

  if (isMobile) {
      // Su smartphone: popup alla SINISTRA del punto esclamativo, leggermente più in alto
      popup.style.left = `${rect.left - popup.offsetWidth - 21}px`; // Sposta a sinistra
      popup.style.top = `${rect.top - 110}px`; // Sposta più in alto
      popup.classList.add("popup-left");
      popup.classList.remove("popup-down");
  } else {
      // Su PC: popup SOTTO il punto esclamativo, centrato orizzontalmente
      popup.style.left = `${rect.left + (rect.width / 2) - (popup.offsetWidth / 2)}px`; // Centra orizzontalmente
      popup.style.top = `${rect.bottom + 12}px`; // Posiziona sotto
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
      
      // Usa setTimeout per posizionare il pop-up dopo che è stato mostrato
      setTimeout(aggiornaPosizionePopup, 10);
  }

  // Assicura che il pulsante non scompaia su mobile
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
const userMenuContainer = document.getElementById('user-menu-container');
const closeUserMenuBtn = document.getElementById('close-user-menu');
const userAvatar = document.getElementById('user-avatar');
const profileNameDisplay = document.getElementById('profile-name-display');
const createProfileBtn = document.getElementById('create-profile');
const manageProfileBtn = document.getElementById('manage-profile');

const createProfileSection = document.getElementById('create-profile-section');
const profileNameInput = document.getElementById('profile-name');
const saveProfileBtn = document.getElementById('save-profile');

const manageProfileSection = document.getElementById('manage-profile-section');
const changeAvatarBtn = document.getElementById('change-avatar');
const profileImgInput = document.getElementById('profile-img-input');
const changeUsernameBtn = document.getElementById('change-username');
const newUsernameInput = document.getElementById('new-username');
const saveUsernameBtn = document.getElementById('save-username');
const deleteProfileBtn = document.getElementById('delete-profile');
const backToMainMenuBtn = document.getElementById('back-to-main-menu');
const settingsBtn = document.getElementById('settings-button'); // Pulsante impostazioni
const updatesButton = document.getElementById('updates-button'); //Pulsante Aggiornamenti App
const allMainButtons = [createProfileBtn, manageProfileBtn, settingsBtn, updatesButton]; // Pulsanti principali

const APP_VERSION = 'beta0.4';
document.getElementById('user-version').textContent = `Versione: ${APP_VERSION}`;

// ==========================
// 📌 FUNZIONI CACHE PROFILO
// ==========================
async function getProfileFromCache() {
  const cache = await caches.open('user-profile-cache');
  const response = await cache.match('user-profile');
  return response ? response.json() : null;
}

async function saveProfileToCache(profileData) {
  const cache = await caches.open('user-profile-cache');
  const response = new Response(JSON.stringify(profileData), {
    headers: { 'Content-Type': 'application/json' },
  });
  await cache.put('user-profile', response);
}

async function removeProfileFromCache() {
  const cache = await caches.open('user-profile-cache');
  await cache.delete('user-profile');
  await cache.delete('/user-avatar');
}

// ==========================
// 🔄 AGGIORNAMENTO MENU UTENTE
// ==========================
async function checkProfile() {
  const profile = await getProfileFromCache();

if (profile && !profile.id) {
  profile.id = crypto.randomUUID(); // Se manca l'ID, lo assegniamo
  await saveProfileToCache(profile);
}


  if (profile) {
    profileNameDisplay.textContent = profile.name || 'Nome utente';
    profileNameDisplay.style.display = 'block';
    createProfileBtn.style.display = 'none';
    manageProfileBtn.style.display = 'block';

    if (profile.image === '/user-avatar') {
      const cache = await caches.open('user-profile-cache');
      const response = await cache.match('/user-avatar');
      if (response) {
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        userAvatar.src = objectURL;
      } else {
        userAvatar.src = 'img/default-avatar.jpg';
      }
    } else {
      userAvatar.src = profile.image || 'img/default-avatar.jpg';
    }
  } else {
    userAvatar.src = 'img/default-avatar.jpg';
    profileNameDisplay.style.display = 'none';
    createProfileBtn.style.display = 'block';
    manageProfileBtn.style.display = 'none';
  }
}

// ==========================
// 📌 GESTIONE DEL MENU
// ==========================
function showSectionOnly(sectionToShow) {
  allMainButtons.forEach(button => button.style.display = 'none');
  createProfileSection.style.display = 'none';
  manageProfileSection.style.display = 'none';
  sectionToShow.style.display = 'block';
}

// Funzione per mostrare/nascondere i pulsanti principali
function toggleMainButtons(shouldShow) {
  if (shouldShow) {
    settingsBtn.style.display = 'block';
    updatesButton.style.display = 'block';
  } else {
    settingsBtn.style.display = 'none';
    updatesButton.style.display = 'none';
  }
}

// Aprire il menu utente
document.getElementById('user-icon').addEventListener('click', (event) => {
  userMenuContainer.classList.add('open');
  checkProfile();
  event.stopPropagation();
});

// Chiudere il menu utente
document.addEventListener('click', (event) => {
  if (!userMenuContainer.contains(event.target) && userMenuContainer.classList.contains('open')) {
    userMenuContainer.classList.remove('open');
  }
});

closeUserMenuBtn.addEventListener('click', () => {
  userMenuContainer.classList.remove('open');
});

// ==========================
// 🆕 CREAZIONE PROFILO
// ==========================
createProfileBtn.addEventListener('click', () => {
  showSectionOnly(createProfileSection);
});

saveProfileBtn.addEventListener('click', async () => {
  const name = profileNameInput.value.trim();
  if (name.length < 4) {
    alert('Il nome utente deve avere almeno 4 caratteri.');
    return;
  }

  const userId = crypto.randomUUID(); // Genera un ID univoco
  const profileData = { id: userId, name, image: 'img/default-avatar.jpg' };
  await saveProfileToCache(profileData);

  createProfileSection.style.display = 'none';
  await checkProfile();
  toggleMainButtons(true); // Mostra subito i pulsanti principali
});

// ==========================
// ⚙️ GESTIONE PROFILO
// ==========================
manageProfileBtn.addEventListener('click', () => {
  showSectionOnly(manageProfileSection);

  // Nascondi i pulsanti principali quando la gestione del profilo è aperta
  toggleMainButtons(false);
});

// Cambiare immagine
changeAvatarBtn.addEventListener('click', () => profileImgInput.click());

profileImgInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const cache = await caches.open('user-profile-cache');
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    const response = new Response(blob, { headers: { 'Content-Type': file.type } });

    await cache.put('/user-avatar', response);

    const profile = await getProfileFromCache();
    profile.image = '/user-avatar';
    await saveProfileToCache(profile);

    const objectURL = URL.createObjectURL(blob);
    userAvatar.src = objectURL;
  }
});

// Cambiare nome utente
changeUsernameBtn.addEventListener('click', () => {
  newUsernameInput.style.display = 'block';
  saveUsernameBtn.style.display = 'block';
});

saveUsernameBtn.addEventListener('click', async () => {
  const newName = newUsernameInput.value.trim();
  if (newName.length < 4) {
    alert('Il nome utente deve avere almeno 4 caratteri.');
    return;
  }

  const profile = await getProfileFromCache();
  profile.name = newName;
  await saveProfileToCache(profile);

  newUsernameInput.style.display = 'none';
  saveUsernameBtn.style.display = 'none';
  checkProfile();
});

// Eliminare profilo
deleteProfileBtn.addEventListener('click', async () => {
  if (confirm('Sei sicuro di voler eliminare il profilo?')) {
    await removeProfileFromCache();
    checkProfile();
    manageProfileSection.style.display = 'none';
    userMenuContainer.classList.remove('open');
    createProfileBtn.style.display = 'block';

    // Ripristina la visibilità dei pulsanti principali quando il profilo viene eliminato
    toggleMainButtons(true);
  }
});

// ==========================
// 🔙 TORNA AL MENU PRINCIPALE
// ==========================
backToMainMenuBtn.addEventListener('click', async () => {
  const profile = await getProfileFromCache();

  if (profile) {
    createProfileBtn.style.display = 'none';
    manageProfileBtn.style.display = 'block';
  } else {
    createProfileBtn.style.display = 'block';
    manageProfileBtn.style.display = 'none';
  }

  // Ripristina la visibilità dei pulsanti principali
  toggleMainButtons(true);
  createProfileSection.style.display = 'none';
  manageProfileSection.style.display = 'none';
});

// Funzione per il tasto "Impostazioni"
document.getElementById('settings-button').addEventListener('click', function() {
  openCard('settings-card');
});

// Funzione per il tasto "Aggiornamenti App"
document.getElementById('updates-button').addEventListener('click', function() {
  openCard('updates-card');
});

// Funzione per aprire una scheda
function openCard(cardId) {
  // Mostra il filtro di sfondo e disabilita lo scorrimento
  document.body.classList.add('modal-open');
  
  // Nasconde tutte le altre schede
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
      card.style.display = 'none';
  });

  // Mostra la scheda selezionata
  const card = document.getElementById(cardId);
  card.style.display = 'block';
}

// Funzione per chiudere una scheda
function closeCard(cardId) {
  // Nasconde la scheda
  const card = document.getElementById(cardId);
  card.style.display = 'none';

  // Rimuove il filtro di sfondo e riabilita lo scorrimento
  document.body.classList.remove('modal-open');
}


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