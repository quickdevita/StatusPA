document.addEventListener("DOMContentLoaded", function () {
  // ============================
  // 🔹 INIZIALIZZAZIONE MAPPA 🔹
  // ============================

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

  // ============================
  // 🔹 GESTIONE DEL MODALE 🔹
  // ============================

  const modalContainer = document.getElementById("modal-container");
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("close-modal");
  const favoriteButton = document.getElementById("favorite-button");
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // 📌 Funzione per aprire il modale
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

    modalContainer.classList.add("open");
    modal.classList.add("open");
    document.body.classList.add("modal-open");
  }

  // 📌 Funzione per chiudere il modale
  function closeModalFunc() {
    modalContainer.classList.remove("open");
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
  }

  // 📌 Gestisce il pulsante "Preferiti"
  favoriteButton.addEventListener("click", function () {
    this.classList.toggle("active");
    const icon = this.querySelector("span");
    icon.textContent = this.classList.contains("active") ? "star" : "star_border";
  });

  // 📌 Cambia la sezione attiva nel modale
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      this.classList.add("active");
      document.getElementById(this.dataset.tab).classList.add("active");
    });
  });

  // 📌 Chiudi il modale quando si clicca fuori
  modalContainer.addEventListener("click", function (event) {
    if (event.target === modalContainer) {
      closeModalFunc();
    }
  });

  closeModal.addEventListener("click", closeModalFunc);

  // ============================
  // 🔹 GESTIONE DELLE ZONE SULLA MAPPA 🔹
  // ============================

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

  // ============================
  // 🔹 GESTIONE DELLA RICERCA 🔹
  // ============================

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

  // ============================
  // 🔹 GESTIONE MENU UTENTE 🔹
  // ============================

  // Seleziona gli elementi del menu utente
  const userIcon = document.getElementById('user-icon');
  const userMenuContainer = document.getElementById('user-menu-container');
  const userMenu = document.getElementById('user-menu');
  const closeUserMenuBtn = document.getElementById('close-user-menu');

  // Versione dell'app
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
  closeUserMenuBtn.addEventListener('click', closeUserMenu);

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
});
