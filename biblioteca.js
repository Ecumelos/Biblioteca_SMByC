let datosGlobales = [];
let currentView = 'tabla'; // "tabla" o "lista"
let currentPage = 1;
const itemsPerPageTabla = 10;
const itemsPerPageLista = 4;

// Función para obtener los datos filtrados en base a búsqueda y checkboxes
function getFilteredData() {
  const searchText = document.getElementById("busqueda").value.toLowerCase();
  const selectedTipos = Array.from(document.querySelectorAll("#check-tipo input[type='checkbox']:checked")).map(cb => cb.value);
  const selectedTematicas = Array.from(document.querySelectorAll("#check-tematica input[type='checkbox']:checked")).map(cb => cb.value);
  const selectedAnios = Array.from(document.querySelectorAll("#check-anio input[type='checkbox']:checked")).map(cb => cb.value);

  return datosGlobales.filter(row => {
    const textMatch = row["Titulo"]?.toLowerCase().includes(searchText);
    const tipoMatch = selectedTipos.length === 0 || selectedTipos.includes(row["Tipo"]);
    const tematicaMatch = selectedTematicas.length === 0 || selectedTematicas.includes(row["Temática"]);
    const anioMatch = selectedAnios.length === 0 || selectedAnios.includes(row["Fecha publicación"]);
    return textMatch && tipoMatch && tematicaMatch && anioMatch;
  });
}

// Renderiza la página actual según la vista y paginación
function renderCurrentPage() {
  const filteredData = getFilteredData();
  const itemsPerPage = currentView === 'tabla' ? itemsPerPageTabla : itemsPerPageLista;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  if (currentView === 'tabla') {
    renderTabla(currentItems);
  } else {
    renderLista(currentItems);
  }
  updatePaginationControls(totalPages);
}

// Renderiza la vista de tabla
function renderTabla(data) {
  const tbody = document.querySelector("#tabla-recursos tbody");
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Tipo"]}</td>
      <td>${row["Temática"]}</td>
      <td>${row["Titulo"]}</td>
      <td>${row["Fecha publicación"]}</td>
      <td>
        <a class="icono" href="${row["Consultar"]}" target="_blank">
          <img src="${row["Foto"]}" alt="Foto">
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Renderiza la vista lista en dos columnas: información a la izquierda y foto a la derecha
function renderLista(data) {
  const listaContainer = document.getElementById("lista-container");
  listaContainer.innerHTML = "";
  data.forEach(row => {
    const card = document.createElement("div");
    card.className = "lista-item";
    card.innerHTML = `
      <div class="info">
        <h2>${row["Titulo"]}</h2>
        <p><strong>Tipo:</strong> ${row["Tipo"]}</p>
        <p><strong>Temática:</strong> ${row["Temática"]}</p>
        <p><strong>Fecha:</strong> ${row["Fecha publicación"]}</p>
        <a href="${row["Consultar"]}" target="_blank">Consultar</a>
      </div>
      <div class="foto">
        <img src="${row["Foto"]}" alt="Imagen">
      </div>
    `;
    listaContainer.appendChild(card);
  });
}

// Actualiza los controles de paginación
function updatePaginationControls(totalPages) {
  const paginacionDiv = document.getElementById("paginacion");
  paginacionDiv.innerHTML = "";

  // Botón "Anterior"
  const btnPrev = document.createElement("button");
  btnPrev.textContent = "Anterior";
  btnPrev.disabled = currentPage === 1;
  btnPrev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderCurrentPage();
    }
  });
  paginacionDiv.appendChild(btnPrev);

  // Botones numéricos para cada página
  for (let i = 1; i <= totalPages; i++) {
    const btnPage = document.createElement("button");
    btnPage.textContent = i;
    if (i === currentPage) btnPage.classList.add("active");
    btnPage.addEventListener("click", () => {
      currentPage = i;
      renderCurrentPage();
    });
    paginacionDiv.appendChild(btnPage);
  }

  // Botón "Siguiente"
  const btnNext = document.createElement("button");
  btnNext.textContent = "Siguiente";
  btnNext.disabled = currentPage === totalPages;
  btnNext.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderCurrentPage();
    }
  });
  paginacionDiv.appendChild(btnNext);
}

// Función para crear checkboxes para cada filtro
function crearCheckboxes(data, campo, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  const opciones = [...new Set(data.map(row => row[campo]).filter(Boolean))].sort();
  contenedor.innerHTML = "";
  opciones.forEach(op => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = op;
    checkbox.addEventListener("change", () => {
      currentPage = 1;
      renderCurrentPage();
    });
    label.appendChild(checkbox);
    label.append(" " + op);
    contenedor.appendChild(label);
  });
}

// Event listener para el campo de búsqueda
document.getElementById("busqueda").addEventListener("input", () => {
  currentPage = 1;
  renderCurrentPage();
});

// Toggle de vista: tabla vs lista
document.getElementById("btn-tabla").addEventListener("click", () => {
  currentView = "tabla";
  document.getElementById("tabla-container").style.display = "block";
  document.getElementById("lista-container").style.display = "none";
  document.getElementById("btn-tabla").classList.add("active");
  document.getElementById("btn-lista").classList.remove("active");
  currentPage = 1;
  renderCurrentPage();
});

document.getElementById("btn-lista").addEventListener("click", () => {
  currentView = "lista";
  document.getElementById("tabla-container").style.display = "none";
  document.getElementById("lista-container").style.display = "flex";
  document.getElementById("btn-lista").classList.add("active");
  document.getElementById("btn-tabla").classList.remove("active");
  currentPage = 1;
  renderCurrentPage();
});

// Carga el CSV usando PapaParse
Papa.parse("biblioteca.csv", {
  download: true,
  header: true,
  complete: function(results) {
    datosGlobales = results.data;

    // Crear checkboxes para filtros
    crearCheckboxes(datosGlobales, "Tipo", "check-tipo");
    crearCheckboxes(datosGlobales, "Temática", "check-tematica");
    crearCheckboxes(datosGlobales, "Fecha publicación", "check-anio");

    // Renderizamos la primera página sin filtros aplicados
    renderCurrentPage();

    // Hacemos que cada encabezado de filtro sea colapsable
    document.querySelectorAll('.filtro-header').forEach(header => {
      header.addEventListener('click', () => {
        const grupo = header.nextElementSibling;
        if (grupo) grupo.classList.toggle('collapsed');
      });
    });
  }
});
