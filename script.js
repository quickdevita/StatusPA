// Inizializzazione della mappa con Leaflet.js
var map = L.map('map').setView([38.1157, 13.3615], 13); // Coordinate di Palermo (modifica se necessario)

// Aggiungi la mappa di OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
