// Inizializzazione della mappa
var map = L.map('map').setView([38.1157, 13.3615], 13); // Palermo

// Aggiunta della mappa satellitare Esri
var esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Caricamento dei dati da localStorage
function loadData() {
  const data = JSON.parse(localStorage.getItem('works')) || [];
  
  data.forEach(zone => {
    var polygon = L.polygon(zone.coordinates, {
      color: zone.color,
      fillColor: zone.color,
      fillOpacity: 0.5
    }).addTo(map);

    // Popup con le informazioni del lavoro
    polygon.bindPopup(`<b>${zone.name}</b><br>${zone.info}`);

    // Aggiungere funzionalità per modificare o eliminare un lavoro
    polygon.on('popupopen', () => {
      const editButton = document.createElement('button');
      editButton.textContent = 'Modifica';
      editButton.onclick = () => editWork(zone.id);  // Modifica il lavoro
      polygon.getPopup().setContent(`<b>${zone.name}</b><br>${zone.info}<br><button>Rimuovi</button><button>Modifica</button>`).addTo(map);
      
      // Pulsante di rimozione
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Rimuovi';
      removeButton.onclick = () => removeWork(zone.id);
      polygon.getPopup().setContent(`<b>${zone.name}</b><br>${zone.info}<br><button>Modifica</button><button>Rimuovi</button>`).addTo(map);
    });
  });
}

// Funzione per aggiungere un lavoro a localStorage
function addWork(work) {
  const data = JSON.parse(localStorage.getItem('works')) || [];
  data.push(work);
  localStorage.setItem('works', JSON.stringify(data));
  loadData(); // Ricarica la mappa con i nuovi dati
}

// Funzione per modificare un lavoro
function editWork(workId) {
  const data = JSON.parse(localStorage.getItem('works')) || [];
  const updatedWorks = data.map(work => {
    if (work.id === workId) {
      work.name = prompt("Nuovo nome del lavoro", work.name);
      work.info = prompt("Nuove informazioni", work.info);
      work.coordinates = JSON.parse(prompt("Nuove coordinate (array di array)", JSON.stringify(work.coordinates)));
    }
    return work;
  });
  localStorage.setItem('works', JSON.stringify(updatedWorks));
  loadData(); // Ricarica la mappa con i dati aggiornati
}

// Funzione per rimuovere un lavoro da localStorage
function removeWork(workId) {
  const data = JSON.parse(localStorage.getItem('works')) || [];
  const updatedWorks = data.filter(work => work.id !== workId);
  localStorage.setItem('works', JSON.stringify(updatedWorks));
  loadData(); // Ricarica la mappa dopo la rimozione
}

// Funzione per aggiungere un nuovo lavoro (esempio di aggiunta con coordinate)
function addNewWork() {
  const newWork = {
    id: new Date().getTime().toString(), // Genera un ID unico per il lavoro
    name: 'Nuovo Lavoro',
    info: 'Informazioni sul lavoro',
    coordinates: [[38.1157, 13.3615], [38.1167, 13.3625]], // Coordinate esempio
    color: 'yellow' // Colore del poligono
  };
  addWork(newWork); // Aggiungi il lavoro a localStorage
}

// Caricamento iniziale dei dati
loadData();

// Aggiungi un lavoro di esempio cliccando su un bottone
const addButton = document.createElement('button');
addButton.textContent = 'Aggiungi Lavoro';
addButton.onclick = addNewWork;
document.body.appendChild(addButton);

// Gestione dell'installazione PWA
let deferredPrompt;

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

// Registrazione del Service Worker con percorso assoluto
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js') // Cambiato percorso
    .then(function(registration) {
      console.log('Service Worker registrato con successo:', registration);
    })
    .catch(function(error) {
      console.log('Errore nel registro del Service Worker:', error);
    });
}
