// Inizializzazione di Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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

// Funzione per caricare i dati da Firestore
async function loadData() {
  const worksList = document.getElementById('works-list');
  try {
    const querySnapshot = await getDocs(collection(db, "works"));
    worksList.innerHTML = ''; // Pulisce la lista

    querySnapshot.forEach((doc) => {
      const work = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${work.name}</strong> (${work.color})<br>
        ${work.info}<br>
        Coordinate: ${JSON.stringify(work.coordinates)}<br>
        <button onclick="editWork('${doc.id}')">Modifica</button>
        <button onclick="deleteWork('${doc.id}')">Elimina</button>
      `;
      worksList.appendChild(li);
    });
  } catch (error) {
    console.error("Errore nel caricamento dei dati:", error);
  }
}

// Funzione per aggiungere un nuovo lavoro
const addWorkForm = document.getElementById('add-work-form');
addWorkForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('work-name').value;
  const info = document.getElementById('work-info').value;
  const coordinates = JSON.parse(document.getElementById('work-coordinates').value);
  const color = document.getElementById('work-color').value;

  const newWork = { name, info, coordinates, color };

  try {
    await addDoc(collection(db, "works"), newWork);
    addWorkForm.reset(); // Reset del form
    loadData(); // Ricarica la lista dei lavori
  } catch (error) {
    console.error("Errore nell'aggiunta del lavoro:", error);
  }
});

// Funzione per modificare un lavoro
async function editWork(id) {
  const worksRef = doc(db, "works", id);
  const newName = prompt("Nuovo nome del lavoro:");
  const newInfo = prompt("Nuove informazioni del lavoro:");

  try {
    await updateDoc(worksRef, {
      name: newName,
      info: newInfo,
    });
    loadData(); // Ricarica i dati
  } catch (error) {
    console.error("Errore nella modifica del lavoro:", error);
  }
}

// Funzione per eliminare un lavoro
async function deleteWork(id) {
  const workRef = doc(db, "works", id);

  try {
    await deleteDoc(workRef);
    loadData(); // Ricarica i dati
  } catch (error) {
    console.error("Errore nell'eliminazione del lavoro:", error);
  }
}

// Carica i dati all'avvio
loadData();
