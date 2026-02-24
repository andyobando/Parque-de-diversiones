const API_URL = 'http://localhost:3000/atracciones';

// Elements
const tbody = document.getElementById('attractionsTbody');
const loader = document.getElementById('loader');
const modal = document.getElementById('attractionModal');
const deleteModal = document.getElementById('deleteModal');
const form = document.getElementById('attractionForm');

// Buttons
const btnNew = document.getElementById('btnNewAttraction');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
// Auth Elements
const btnVolverInicio = document.getElementById('btnVolverInicio');
const thAcciones = document.getElementById('thAcciones');
const ticketsSection = document.getElementById('ticketsSection');

let currentDeleteId = null;
let isAdmin = localStorage.getItem('isAdmin') === 'true';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  fetchAttractions();
});

// Fetch all attractions
async function fetchAttractions() {
  showLoader(true);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al cargar datos');
    const attractions = await res.json();
    renderAttractions(attractions);
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error de conexión. ¿Está corriendo json-server?</td></tr>`;
  } finally {
    showLoader(false);
  }
}

// Render attractions in table
function renderAttractions(attractions) {
  tbody.innerHTML = '';
  if (attractions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">No hay atracciones registradas</td></tr>`;
    return;
  }

  attractions.forEach(attr => {
    const tr = document.createElement('tr');

    let accionesHtml = '';
    if (isAdmin) {
      accionesHtml = `
      <td>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-sm btn-edit" onclick="editAttraction('${attr.id}')">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${attr.id}', '${attr.nombre}')">🗑️ Eliminar</button>
        </div>
      </td>`;
    }

    tr.innerHTML = `
      <td>${attr.id}</td>
      <td><strong>${attr.nombre}</strong></td>
      <td style="text-transform: capitalize;">${attr.categoria}</td>
      <td><span class="status-badge ${getStatusClass(attr.estado)}">${capitalize(attr.estado)}</span></td>
      <td>${attr.alturaMinima} cm</td>
      <td>${attr.tiempoEspera} min</td>
      ${accionesHtml}
    `;
    tbody.appendChild(tr);
  });
}

// Helpers
function showLoader(show) {
  loader.style.display = show ? 'block' : 'none';
  if (show) tbody.innerHTML = '';
}

function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'activa': return 'status-activa';
    case 'en mantenimiento': return 'status-mantenimiento';
    case 'fuera de servicio': return 'status-fuera';
    default: return '';
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Modals Logic ---
btnNew.addEventListener('click', () => {
  openModal();
});

btnCloseModal.addEventListener('click', closeModal);
btnCancelModal.addEventListener('click', closeModal);
btnCancelDelete.addEventListener('click', closeDeleteModal);

function openModal(editMode = false) {
  modal.classList.remove('hidden');
  if (!editMode) {
    document.getElementById('modalTitle').textContent = '🌟 Nueva Atracción Genial';
    form.reset();
    document.getElementById('attractionId').value = '';
  } else {
    document.getElementById('modalTitle').textContent = '✏️ Editar Atracción';
  }
}

function closeModal() {
  modal.classList.add('hidden');
  form.reset();
}

function openDeleteModal(id, name) {
  currentDeleteId = id;
  document.getElementById('deleteAttractionName').textContent = name;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  currentDeleteId = null;
}

// --- CRUD Operations ---

// CREATE or UPDATE
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const idControl = document.getElementById('attractionId').value;
  const attractionData = {
    nombre: document.getElementById('nombre').value,
    categoria: document.getElementById('categoria').value,
    estado: document.getElementById('estado').value,
    alturaMinima: parseInt(document.getElementById('alturaMinima').value),
    tiempoEspera: parseInt(document.getElementById('tiempoEspera').value)
  };

  try {
    if (idControl) {
      // UPDATE (PUT)
      const res = await fetch(`${API_URL}/${idControl}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attractionData)
      });
      if (!res.ok) throw new Error('Error actualizando atracción');
    } else {
      // SET ID logic for json-server automatically or manually if string
      attractionData.id = Date.now().toString(); // Fallback string ID

      // CREATE (POST)
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attractionData)
      });
      if (!res.ok) throw new Error('Error creando atracción');
    }

    closeModal();
    fetchAttractions();

  } catch (error) {
    console.error(error);
    alert('Ha ocurrido un error al guardar la atracción');
  }
});

// GET ONE (for editing)
window.editAttraction = async function (id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Error obteniendo datos');
    const attr = await res.json();

    // Fill Form
    document.getElementById('attractionId').value = attr.id;
    document.getElementById('nombre').value = attr.nombre;
    document.getElementById('categoria').value = attr.categoria;
    document.getElementById('estado').value = attr.estado;
    document.getElementById('alturaMinima').value = attr.alturaMinima;
    document.getElementById('tiempoEspera').value = attr.tiempoEspera;

    openModal(true);
  } catch (error) {
    console.error(error);
    alert('Ha ocurrido un error al intentar editar');
  }
};

// DELETE
btnConfirmDelete.addEventListener('click', async () => {
  if (!currentDeleteId) return;

  try {
    const res = await fetch(`${API_URL}/${currentDeleteId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando atracción');

    closeDeleteModal();
    fetchAttractions();
  } catch (error) {
    console.error(error);
    alert('Ha ocurrido un error al eliminar');
  }
});

// --- Auth Logic ---
function updateAuthUI() {
  if (isAdmin) {
    btnNew.classList.remove('hidden');
    thAcciones.classList.remove('hidden');
    ticketsSection.classList.add('hidden');
  } else {
    btnNew.classList.add('hidden');
    thAcciones.classList.add('hidden');
    ticketsSection.classList.remove('hidden');
  }
}

// Boton volver al inicio
btnVolverInicio.addEventListener('click', () => {
  localStorage.removeItem('isAdmin');
  window.location.href = 'index.html';
});
