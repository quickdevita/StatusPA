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

      polygon.on('click', () => openModal(
        zone.name, 
        zone.description || "Descrizione non disponibile", 
        Array.isArray(zone.images) ? zone.images : [], // Verifica che sia un array
        zone.address || "Indirizzo non disponibile",
        zone.startDate || "Data di inizio non disponibile",
        zone.endDate || "Data di fine non disponibile",
        zone.info || "Informazioni non disponibili" // Aggiunto campo info
      ));
    });
  })
  .catch(error => console.error("Errore nel caricamento dei dati:", error));

// ========================
// 🔹 GESTIONE DEL MODALE 🔹
// ========================

// Funzione per aprire il modale
function openModal(title, description, images, address, startDate, endDate, info) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-info").textContent = info; // Mostra info
  document.getElementById("modal-details").textContent = description; // Mostra la descrizione
  document.getElementById("modal-address").textContent = address;
  document.getElementById("modal-start-date").textContent = startDate;
  document.getElementById("modal-end-date").textContent = endDate;

  const modalImagesContainer = document.getElementById("modal-images");
  modalImagesContainer.innerHTML = ""; // Pulisce le immagini precedenti

  if (images.length > 0) {
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
      popup.style.left = `${rect.left - popup.offsetWidth - 20}px`; // Sposta a sinistra
      popup.style.top = `${rect.top - 150}px`; // Sposta più in alto
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
const backToMainMenuBtn = document.getElementById('back-to-main-menu'); // Pulsante per tornare al menu principale

const APP_VERSION = 'betav1.3';
document.getElementById('user-version').textContent = `Versione: ${APP_VERSION}`;

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
}

async function checkProfile() {
  const profile = await getProfileFromCache();
  
  if (profile) {
    userAvatar.src = profile.image || 'img/default-avatar.jpg';
    profileNameDisplay.textContent = profile.name || 'Nome utente';
    profileNameDisplay.style.display = 'block'; // Mostra il nome utente solo se c'è un profilo
    createProfileBtn.style.display = 'none';
    manageProfileBtn.style.display = 'block';
  } else {
    userAvatar.src = 'img/default-avatar.jpg';
    profileNameDisplay.style.display = 'none'; // Nasconde "Nome utente" se non c'è un profilo
    createProfileBtn.style.display = 'block';
    manageProfileBtn.style.display = 'none';
  }
}

// Aprire e chiudere il menu
document.getElementById('user-icon').addEventListener('click', () => {
  userMenuContainer.classList.add('open');
  checkProfile();
});

closeUserMenuBtn.addEventListener('click', () => {
  userMenuContainer.classList.remove('open');
});

// Creazione profilo
createProfileBtn.addEventListener('click', () => {
  createProfileSection.style.display = 'block';
});

saveProfileBtn.addEventListener('click', async () => {
  const name = profileNameInput.value.trim();
  if (name.length < 4) {
    alert('Il nome utente deve avere almeno 4 caratteri.');
    return;
  }

  const profileData = { name, image: 'img/default-avatar.jpg' };
  await saveProfileToCache(profileData);
  createProfileSection.style.display = 'none'; // Nasconde il form dopo la registrazione
  checkProfile();
});

// Gestione profilo
manageProfileBtn.addEventListener('click', () => {
  manageProfileSection.style.display = 'block';
});

// Cambiare immagine
changeAvatarBtn.addEventListener('click', () => profileImgInput.click());

profileImgInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const profile = await getProfileFromCache();
    profile.image = URL.createObjectURL(file);
    await saveProfileToCache(profile);
    checkProfile();
  }
});

// Cambiare nome utente
changeUsernameBtn.addEventListener('click', () => {
  newUsernameInput.style.display = 'block';
  saveUsernameBtn.style.display = 'block';
});

// Salva nome utente
saveUsernameBtn.addEventListener('click', async () => {
  const newName = newUsernameInput.value.trim();
  if (newName.length < 4) {
    alert('Il nome utente deve avere almeno 4 caratteri.');
    return;
  }

  const profile = await getProfileFromCache();
  profile.name = newName;
  await saveProfileToCache(profile);

  // Nascondi la barra e il pulsante dopo aver salvato
  newUsernameInput.style.display = 'none';
  saveUsernameBtn.style.display = 'none';

  // Aggiorna il nome visualizzato nel menu utente
  checkProfile();
});

// Eliminare profilo (Esci)
deleteProfileBtn.addEventListener('click', async () => {
  if (confirm('Sei sicuro di voler eliminare il profilo?')) {
    await removeProfileFromCache();
    checkProfile();

    // Nascondi la sezione "Gestisci profilo" e mostra il menu principale
    manageProfileSection.style.display = 'none';
    userMenuContainer.classList.remove('open'); // Rimuove la sezione del menu
    createProfileBtn.style.display = 'block';  // Mostra il pulsante per creare il profilo
  }
});

// Aggiungi il pulsante per tornare al menu principale
backToMainMenuBtn.addEventListener('click', () => {
  // Nascondi la sezione "Gestisci profilo" e mostra il menu principale
  manageProfileSection.style.display = 'none';
  userMenuContainer.classList.add('open'); // Ri-apri il menu utente principale
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

setInterval(() => {
  console.log("Posizione punto esclamativo:", document.getElementById("exclamation-mark").getBoundingClientRect().left);
}, 1000);

