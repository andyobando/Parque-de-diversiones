import { getAtracciones, getAtraccion, addAtraccion, updateAtraccion, deleteAtraccion } from '../services/serviceAtracciones.js';

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

let currentDeleteId = null;

// Initialize
document.addEventListener('DOMContentLoaded', fetchAndRender);

async function fetchAndRender() {
    showLoader(true);
    try {
        const attractions = await getAtracciones();
        renderAttractions(attractions);
        attachDynamicEvents();
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error de conexión. ¿Está corriendo json-server?</td></tr>`;
    } finally {
        showLoader(false);
    }
}

function renderAttractions(attractions) {
    tbody.innerHTML = '';
    if (attractions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">No hay atracciones registradas</td></tr>`;
        return;
    }

    attractions.forEach(attr => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${attr.id}</td>
      <td><strong>${attr.nombre}</strong></td>
      <td style="text-transform: capitalize;">${attr.categoria}</td>
      <td><span class="status-badge ${getStatusClass(attr.estado)}">${capitalize(attr.estado)}</span></td>
      <td>${attr.alturaMinima} cm</td>
      <td>${attr.tiempoEspera} min</td>
      <td>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-sm btn-edit" data-id="${attr.id}">Editar</button>
          <button class="btn btn-sm btn-danger" data-id="${attr.id}" data-name="${attr.nombre}">Eliminar</button>
        </div>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

function attachDynamicEvents() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => editAttraction(e.target.dataset.id));
    });
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', (e) => openDeleteModal(e.target.dataset.id, e.target.dataset.name));
    });
}

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

// Modals Logic
btnNew.addEventListener('click', () => {
    openModal();
});

btnCloseModal.addEventListener('click', closeModal);
btnCancelModal.addEventListener('click', closeModal);
btnCancelDelete.addEventListener('click', closeDeleteModal);

function openModal(editMode = false) {
    modal.classList.remove('hidden');
    if (!editMode) {
        document.getElementById('modalTitle').textContent = 'Nueva Atracción';
        form.reset();
        document.getElementById('attractionId').value = '';
    } else {
        document.getElementById('modalTitle').textContent = 'Editar Atracción';
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
            await updateAtraccion(idControl, attractionData);
        } else {
            // CREATE (POST)
            await addAtraccion(attractionData);
        }
        closeModal();
        fetchAndRender();
    } catch (error) {
        console.error(error);
        alert('Ha ocurrido un error al guardar la atracción');
    }
});

// GET ONE (for editing)
async function editAttraction(id) {
    try {
        const attr = await getAtraccion(id);
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
}

// DELETE
btnConfirmDelete.addEventListener('click', async () => {
    if (!currentDeleteId) return;

    try {
        await deleteAtraccion(currentDeleteId);
        closeDeleteModal();
        fetchAndRender();
    } catch (error) {
        console.error(error);
        alert('Ha ocurrido un error al eliminar');
    }
});
