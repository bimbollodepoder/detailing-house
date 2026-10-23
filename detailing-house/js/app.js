"use strict";

// Catálogo externo: los arrays de objetos se obtienen desde servicios.json.
let servicios = [];
const listaServicios = document.getElementById("listaServicios");
const buscarServicio = document.getElementById("buscarServicio");
const filtroCategoria = document.getElementById("filtroCategoria");
const tipoVehiculo = document.getElementById("tipoVehiculo");
const formatoMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", maximumFractionDigits: 0
});

function obtenerFactorVehiculo() {
  return Number(tipoVehiculo.selectedOptions[0]?.dataset.factor) || 1;
}

function mostrarServicios(lista) {
  listaServicios.replaceChildren();
  if (lista.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.className = "empty-state";
    mensaje.textContent = "No encontramos servicios para esta búsqueda.";
    listaServicios.appendChild(mensaje);
    return;
  }

  lista.forEach(({ id, nombre, categoria, descripcion, precio, imagen }) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "service-card";
    const foto = document.createElement("div");
    foto.className = `service-photo ${imagen}`;
    const etiqueta = document.createElement("span");
    etiqueta.className = "service-tag";
    etiqueta.textContent = categoria.toUpperCase();
    foto.appendChild(etiqueta);

    const contenido = document.createElement("div");
    contenido.className = "service-body";
    const titulo = document.createElement("h3");
    titulo.textContent = nombre;
    const descripcionTexto = document.createElement("p");
    descripcionTexto.textContent = descripcion;
    const pie = document.createElement("div");
    pie.className = "service-bottom";
    const importe = document.createElement("strong");
    importe.textContent = formatoMoneda.format(Math.round(precio * obtenerFactorVehiculo()));
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "add-button";
    boton.dataset.id = String(id);
    boton.textContent = "+";
    boton.setAttribute("aria-label", `Agregar ${nombre} a la cotización`);
    pie.append(importe, boton);
    contenido.append(titulo, descripcionTexto, pie);
    tarjeta.append(foto, contenido);
    listaServicios.appendChild(tarjeta);
  });
}

function filtrarServicios() {
  const busqueda = buscarServicio.value.toLowerCase().trim();
  const categoria = filtroCategoria.value || "todos";
  const resultados = servicios.filter((servicio) =>
    servicio.nombre.toLowerCase().includes(busqueda) &&
    (categoria === "todos" || servicio.categoria === categoria)
  );
  mostrarServicios(resultados);
}

async function cargarServicios() {
  listaServicios.textContent = "Cargando servicios...";
  listaServicios.setAttribute("aria-busy", "true");
  try {
    const respuesta = await fetch("./data/servicios.json");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    if (!Array.isArray(datos) || !datos.every((item) =>
      Number.isFinite(Number(item.id)) && typeof item.nombre === "string" &&
      Number.isFinite(Number(item.precio)))) {
      throw new Error("El catálogo JSON tiene un formato inválido");
    }
    servicios = datos;
    filtrarServicios();
    document.dispatchEvent(new CustomEvent("serviciosCargados", { detail: servicios }));
  } catch (error) {
    listaServicios.textContent = "No se pudo cargar el catálogo. Abre el proyecto con Live Server y revisa data/servicios.json.";
    if (typeof Swal !== "undefined") {
      Swal.fire({ icon: "error", title: "Catálogo no disponible", text: "Revisa que el JSON exista y estés usando Live Server." });
    }
  } finally {
    listaServicios.removeAttribute("aria-busy");
  }
}

buscarServicio.addEventListener("input", filtrarServicios);
filtroCategoria.addEventListener("change", filtrarServicios);
tipoVehiculo.addEventListener("change", filtrarServicios);
cargarServicios();
