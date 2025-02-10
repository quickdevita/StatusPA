// Inizializzazione di Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inizializzazione dell'app Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inizializzazione della mappa
var map = L.map('map').setView([38.1157, 13.3615], 13); // Palermo

// Aggiunta della mappa satellitare Esri
var esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Caricamento dei dati da Firestore
async function loadData() {
  try {
    const querySnapshot = await getDocs(collection(db, "works"));
    querySnapshot.forEach((doc) => {
      const zone = doc.data();
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
        editButton.onclick = () => editWork(doc.id);  // Modifica il lavoro
        polygon.getPopup().setContent(`<b>${zone.name}</b><br>${zone.info}<br><button>Rimuovi</button>`).addTo(map);
        
        // Pulsante di rimozione
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Rimuovi';
        removeButton.onclick = () => removeWork(doc.id);
        polygon.getPopup().setContent(`<b>${zone.name}</b><br>${zone.info}<br><button>Modifica</button><button>Rimuovi</button>`).addTo(map);
      });
    });
  } catch (error) {
    console.error("Errore nel caricamento dei dati:", error);
  }
}

loadData();

// Funzione per modificare un lavoro
async function editWork(workId) {
  try {
    const docRef = doc(db, "works", workId);
    // Logica per aggiornare i dati del lavoro. Esempio:
    // Attendere un input dell'utente e poi aggiornare Firestore
    await updateDoc(docRef, {
      name: "Nuovo Nome del Lavoro",
      info: "Nuove informazioni",
      coordinates: [[38.1157, 13.3615], [38.1167, 13.3625]]  // Aggiornare con le nuove coordinate
    });
    alert('Lavoro aggiornato con successo');
  } catch (error) {
    console.error("Errore nell'aggiornamento del lavoro:", error);
  }
}

// Funzione per rimuovere un lavoro
async function removeWork(workId) {
  try {
    await deleteDoc(doc(db, "works", workId));
    alert('Lavoro rimosso con successo');
    loadData();  // Ricarica i dati per aggiornare la mappa
  } catch (error) {
    console.error("Errore nella rimozione del lavoro:", error);
  }
}

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
