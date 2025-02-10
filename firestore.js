// Inizializza Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funzione per caricare i lavori da Firestore
export async function getWorksFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, "works"));
    querySnapshot.forEach((doc) => {
      const zone = doc.data();
      var polygon = L.polygon(zone.coordinates, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.5
      }).addTo(map);

      polygon.bindPopup(`<b>${zone.name}</b><br>${zone.info}`);
    });
  } catch (error) {
    console.error("Errore nel recupero dei dati da Firestore:", error);
  }
}
