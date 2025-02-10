// Inizializzazione della mappa
var map = L.map('map').setView([38.1157, 13.3615], 13); // Palermo

// Aggiunta della mappa satellitare Esri
var esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Caricamento dei dati dal file JSON
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(zone => {
      var polygon = L.polygon(zone.coordinates, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.5
      }).addTo(map);

      // Popup con le informazioni del lavoro
      polygon.bindPopup(`<b>${zone.name}</b><br>${zone.info}`);
    });
  })
  .catch(error => console.error("Errore nel caricamento dei dati:", error));
