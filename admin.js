// Funzione per caricare i dati da localStorage
function loadData() {
  const worksList = document.getElementById('works-list');
  const works = JSON.parse(localStorage.getItem('works')) || []; // Carica i lavori da localStorage o array vuoto

  worksList.innerHTML = ''; // Pulisce la lista

  works.forEach((work, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${work.name}</strong> (${work.color})<br>
      ${work.info}<br>
      Coordinate: ${JSON.stringify(work.coordinates)}<br>
      <button onclick="editWork(${index})">Modifica</button>
      <button onclick="deleteWork(${index})">Elimina</button>
    `;
    worksList.appendChild(li);
  });
}

// Funzione per aggiungere un nuovo lavoro
const addWorkForm = document.getElementById('add-work-form');
addWorkForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('work-name').value;
  const info = document.getElementById('work-info').value;
  const coordinates = JSON.parse(document.getElementById('work-coordinates').value);
  const color = document.getElementById('work-color').value;

  const newWork = { name, info, coordinates, color };

  // Carica i lavori esistenti, aggiunge il nuovo lavoro e salva di nuovo su localStorage
  const works = JSON.parse(localStorage.getItem('works')) || [];
  works.push(newWork);
  localStorage.setItem('works', JSON.stringify(works));

  addWorkForm.reset(); // Reset del form
  loadData(); // Ricarica la lista dei lavori
});

// Funzione per modificare un lavoro
function editWork(index) {
  const works = JSON.parse(localStorage.getItem('works')) || [];
  const work = works[index];

  const newName = prompt("Nuovo nome del lavoro:", work.name);
  const newInfo = prompt("Nuove informazioni del lavoro:", work.info);

  if (newName && newInfo) {
    works[index] = { ...work, name: newName, info: newInfo };
    localStorage.setItem('works', JSON.stringify(works));
    loadData(); // Ricarica i dati
  }
}

// Funzione per eliminare un lavoro
function deleteWork(index) {
  const works = JSON.parse(localStorage.getItem('works')) || [];
  works.splice(index, 1); // Rimuove il lavoro dall'array
  localStorage.setItem('works', JSON.stringify(works)); // Salva di nuovo su localStorage
  loadData(); // Ricarica i dati
}

// Carica i dati all'avvio
loadData();
