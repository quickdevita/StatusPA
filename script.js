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
  // Log per il debug
  console.log("Apertura modale con i seguenti dati:", title, description, images, address, startDate, endDate, info);

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
      img.style.maxWidth = "100%"; // Assicura che le immagini si adattino bene al contenitore
      modalImagesContainer.appendChild(img);
    });
  } else {
    modalImagesContainer.innerHTML = "<p>Nessuna immagine disponibile</p>";
  }

  // Aggiungi classe per aprire il modale
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

// Gestire il click sul pulsante di chiusura
document.getElementById("close-modal").addEventListener("click", closeModalFunc);

// Chiudere il modale se si clicca fuori dal contenitore del modale
document.getElementById("modal-container").addEventListener("click", function (event) {
  if (event.target === document.getElementById("modal-container")) {
    closeModalFunc();
  }
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

const APP_VERSION = 'beta0.1';
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
}); // <-- Aggiunta la parentesi mancante qui


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
  newUsernameInput.style.display = 'none';
  saveUsernameBtn.style.display = 'none';
  checkProfile();
});

// Elimina profilo
deleteProfileBtn.addEventListener('click', async () => {
  const confirmDelete = confirm('Sei sicuro di voler eliminare il profilo?');
  if (confirmDelete) {
    await removeProfileFromCache();
    checkProfile();
  }
});

// Torna al menu principale
backToMainMenuBtn.addEventListener('click', () => {
  manageProfileSection.style.display = 'none';
});
