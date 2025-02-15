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
const userIcon = document.getElementById('user-icon');
const userMenuContainer = document.getElementById('user-menu-container');
const closeUserMenuBtn = document.getElementById('close-user-menu');
const profileText = document.getElementById('profile-text');
const deleteProfileBtn = document.getElementById('delete-profile');
const saveProfileBtn = document.getElementById('save-profile');
const profileSection = document.getElementById('profile-section');
const createProfileSection = document.getElementById('create-profile-section');
const userVersion = document.getElementById('user-version');
const profileNameInput = document.getElementById('profile-name'); // input per il nome utente
const profileImgInput = document.getElementById('profile-img'); // input per l'immagine utente
const profileNameDisplay = document.getElementById('profile-name-display'); // Nome utente da visualizzare sopra il profilo

const APP_VERSION = 'betav1.3'; // Versione aggiornata della PWA

// Funzione per gestire la cache
async function getProfileFromCache() {
  try {
    const cache = await caches.open('user-profile-cache');
    const response = await cache.match('user-profile');
    if (response) {
      return response.json();
    }
  } catch (error) {
    console.error('Errore nel recupero del profilo dalla cache:', error);
  }
  return null; // Se non esiste il profilo
}

// Funzione per salvare il profilo nella cache
async function saveProfileToCache(profileData) {
  try {
    const cache = await caches.open('user-profile-cache');
    const profileResponse = new Response(JSON.stringify(profileData), {
      headers: { 'Content-Type': 'application/json' },
    });
    await cache.put('user-profile', profileResponse);
  } catch (error) {
    console.error('Errore nel salvataggio del profilo nella cache:', error);
  }
}

// Funzione per rimuovere il profilo dalla cache
async function removeProfileFromCache() {
  try {
    const cache = await caches.open('user-profile-cache');
    await cache.delete('user-profile');
  } catch (error) {
    console.error('Errore nella rimozione del profilo dalla cache:', error);
  }
}

// Verifica se il profilo esiste nella cache
async function checkProfile() {
  const profile = await getProfileFromCache();
  const manageProfileBtn = document.getElementById('manage-profile');

  if (profile) {
    document.querySelector('#profile-img').src = profile.image || 'img/default-icon.jpg'; // Imposta l'immagine dell'utente
    document.querySelector('#profile-name').textContent = profile.name || 'Nome utente'; // Imposta il nome utente
    profileNameDisplay.textContent = profile.name || 'Nome utente'; // Aggiorna il nome sopra il profilo
    // Abilita l'input per l'immagine e nasconde la sezione di creazione del profilo
    profileImgInput.disabled = false;
    createProfileSection.style.display = 'none';
    // Mostra il pulsante "Gestisci profilo"
    manageProfileBtn.style.display = 'block';
  } else {
    createProfileSection.style.display = 'block';  // Mostra la sezione per la creazione del profilo
    manageProfileBtn.style.display = 'none';  // Nascondi il pulsante "Gestisci profilo"
    profileImgInput.disabled = true; // Disabilita l'input per l'immagine finché non è stato creato un profilo
    document.querySelector('#profile-img').src = 'img/default-icon.jpg'; // Imposta l'immagine predefinita
    profileNameDisplay.textContent = 'Il mio profilo'; // Testo predefinito
  }
}

// Apre il menu quando si clicca sull'icona utente
userIcon.addEventListener('click', () => {
  userMenuContainer.classList.add('open');
  // Mostra la versione dell'app
  if (userVersion) {
    userVersion.textContent = `Versione: ${APP_VERSION}`;
  }
  // Verifica lo stato del profilo e aggiorna il menu
  checkProfile();
});

// Chiude il menu quando si clicca il pulsante di chiusura
closeUserMenuBtn.addEventListener('click', () => {
  userMenuContainer.classList.remove('open');
});

// Gestisce la creazione del profilo
saveProfileBtn.addEventListener('click', async () => {
  const profileName = profileNameInput.value.trim();
  const profileImage = profileImgInput.files[0]; // Ottieni l'immagine

  if (profileName) {
    const profileData = {
      name: profileName,  // Ottieni il nome utente dal campo di input
      image: profileImage ? URL.createObjectURL(profileImage) : '',  // Se c'è un'immagine, la salva
    };
    await saveProfileToCache(profileData);  // Salva il profilo nella cache
    checkProfile();  // Ricarica il menu con il nuovo profilo
    alert('Profilo creato con successo!');
  } else {
    alert('Per favore, inserisci un nome utente.');
  }
});

// Gestisce l'apertura della sezione "Gestisci profilo"
document.getElementById('manage-profile').addEventListener('click', async () => {
  // Non chiudere il menu modale
  const manageSection = document.getElementById('manage-profile-section');
  manageSection.style.display = 'block';
  document.getElementById('create-profile-section').style.display = 'none'; // Nascondi la creazione profilo
  checkProfile();
});

// Gestisce la cancellazione del profilo
deleteProfileBtn.addEventListener('click', async () => {
  const confirmation = confirm('Sei sicuro di voler eliminare il profilo?');
  if (confirmation) {
    await removeProfileFromCache();  // Rimuove il profilo dalla cache
    checkProfile();  // Ricarica il menu
    alert('Profilo cancellato!');
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

setInterval(() => {
  console.log("Posizione punto esclamativo:", document.getElementById("exclamation-mark").getBoundingClientRect().left);
}, 1000);

