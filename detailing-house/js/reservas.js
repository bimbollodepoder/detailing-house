"use strict";

// Simulador local: el carrito y las reservas persisten solo en este navegador.
const CLAVE_CARRITO = "dh_carrito";
const CLAVE_RESERVAS = "dh_reservas";
const CLAVE_VEHICULO = "dh_tipo_vehiculo";
const HORARIOS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00"];
const elemento = (id) => document.getElementById(id);
const moneda = (valor) => new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", maximumFractionDigits: 0
}).format(valor);

function leerStorage(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave) || "[]");
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    return [];
  }
}

let catalogo = [];
let carrito = leerStorage(CLAVE_CARRITO);
let reservas = leerStorage(CLAVE_RESERVAS);
let reservaEnEdicion = null;
const selectorVehiculo = elemento("tipoVehiculo");
const fechaElegida = elemento("fechaReserva");
const vehiculoGuardado = localStorage.getItem(CLAVE_VEHICULO);
if ([...selectorVehiculo.options].some((opcion) => opcion.value === vehiculoGuardado)) {
  selectorVehiculo.value = vehiculoGuardado;
}

const factorActual = () => Number(selectorVehiculo.selectedOptions[0]?.dataset.factor) || 1;
const nombreVehiculo = () => selectorVehiculo.selectedOptions[0].textContent.split(" · ")[0];
const precioVehiculo = (base) => Math.round(base * factorActual());
function hoyLocal() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}
fechaElegida.min = hoyLocal();

function guardarCarrito() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}
function guardarReservas() {
  localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas));
}
function obtenerTotal() {
  return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

function actualizarPreciosVehiculo() {
  localStorage.setItem(CLAVE_VEHICULO, selectorVehiculo.value);
  carrito = carrito.map((item) => {
    const servicio = catalogo.find((dato) => Number(dato.id) === Number(item.id));
    const precioBase = Number(servicio?.precio ?? item.precioBase ?? item.precio);
    return { ...item, precioBase, precio: precioVehiculo(precioBase) };
  });
  guardarCarrito();
  dibujarCarrito();
}

function dibujarCarrito() {
  const lista = elemento("listaCotizacion");
  lista.replaceChildren();
  if (!carrito.length) {
    const mensaje = document.createElement("p");
    mensaje.className = "empty-state";
    mensaje.textContent = "Tu cotización está vacía. Agrega un servicio para comenzar.";
    lista.appendChild(mensaje);
  }
  carrito.forEach((item) => {
    const fila = document.createElement("article");
    fila.className = "cart-item";
    const titulo = document.createElement("strong");
    titulo.textContent = item.nombre;
    const cantidad = document.createElement("span");
    cantidad.textContent = `Cantidad: ${item.cantidad}`;
    const subtotal = document.createElement("span");
    subtotal.textContent = moneda(item.precio * item.cantidad);
    const acciones = document.createElement("div");
    acciones.className = "cart-actions";
    [["restar", "−"], ["sumar", "+"], ["quitar", "Quitar"]].forEach(([accion, texto]) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.dataset.accion = accion;
      boton.dataset.id = String(item.id);
      boton.textContent = texto;
      boton.setAttribute("aria-label", `${texto} ${item.nombre}`);
      acciones.appendChild(boton);
    });
    fila.append(titulo, cantidad, subtotal, acciones);
    lista.appendChild(fila);
  });
  elemento("totalCotizacion").textContent = moneda(obtenerTotal());
  elemento("vaciarCotizacion").disabled = carrito.length === 0;
  elemento("confirmarReserva").disabled = carrito.length === 0;
  dibujarResumen();
}

function agregarServicio(id) {
  const servicio = catalogo.find((dato) => Number(dato.id) === Number(id));
  if (!servicio) return;
  const existente = carrito.find((item) => Number(item.id) === Number(id));
  if (existente) {
    existente.cantidad += 1;
  } else {
    const { nombre, precio } = servicio;
    carrito.push({ id, nombre, precioBase: precio, precio: precioVehiculo(precio), cantidad: 1 });
  }
  guardarCarrito();
  dibujarCarrito();
  Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Servicio agregado", timer: 1400, showConfirmButton: false });
}

function cambiarCarrito(id, accion) {
  const item = carrito.find((dato) => Number(dato.id) === Number(id));
  if (!item) return;
  if (accion === "sumar") item.cantidad += 1;
  if (accion === "restar") item.cantidad -= 1;
  if (accion === "quitar" || item.cantidad <= 0) {
    carrito = carrito.filter((dato) => Number(dato.id) !== Number(id));
  }
  guardarCarrito();
  dibujarCarrito();
}

function dibujarResumen() {
  const fecha = fechaElegida.value || "Sin fecha";
  const hora = elemento("horaReserva").value || "Sin horario";
  elemento("resumenReserva").textContent = `${nombreVehiculo()} · ${carrito.length} servicios diferentes · ${moneda(obtenerTotal())} · ${fecha} · ${hora}`;
}

function horariosDisponibles() {
  const fecha = fechaElegida.value;
  const selector = elemento("horaReserva");
  const anterior = selector.value;
  selector.replaceChildren(new Option("Selecciona una hora", ""));
  HORARIOS.forEach((hora) => {
    const ocupado = reservas.some((reserva) =>
      reserva.fecha === fecha && reserva.hora === hora && reserva.id !== reservaEnEdicion);
    const opcion = new Option(`${hora}${ocupado ? " — Ocupado" : ""}`, hora);
    opcion.disabled = ocupado;
    selector.add(opcion);
  });
  if ([...selector.options].some((opcion) => opcion.value === anterior && !opcion.disabled)) {
    selector.value = anterior;
  }
  dibujarResumen();
}

function dibujarReservas() {
  const lista = elemento("listaReservas");
  lista.replaceChildren();
  if (!reservas.length) {
    const aviso = document.createElement("p");
    aviso.className = "empty-state";
    aviso.textContent = "Todavía no hay reservas guardadas.";
    lista.appendChild(aviso);
    return;
  }
  reservas.forEach((reserva) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "history-card";
    const titulo = document.createElement("h3");
    titulo.textContent = `Cita ${reserva.fecha} · ${reserva.hora}`;
    const detalle = document.createElement("p");
    detalle.textContent = `${reserva.vehiculoNombre || "Vehículo no registrado"} · ${reserva.items.map((item) => `${item.nombre} × ${item.cantidad}`).join(", ")} · ${moneda(reserva.total)}`;
    const acciones = document.createElement("div");
    acciones.className = "cart-actions";
    [["editar", "Modificar"], ["cancelar", "Cancelar"]].forEach(([accion, texto]) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.dataset.accion = accion;
      boton.dataset.id = reserva.id;
      boton.textContent = texto;
      acciones.appendChild(boton);
    });
    tarjeta.append(titulo, detalle, acciones);
    lista.appendChild(tarjeta);
  });
}

function limpiarEdicion() {
  reservaEnEdicion = null;
  elemento("confirmarReserva").textContent = "CONFIRMAR RESERVA →";
}

selectorVehiculo.addEventListener("change", actualizarPreciosVehiculo);
elemento("listaServicios").addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-id]");
  if (boton) agregarServicio(Number(boton.dataset.id));
});
elemento("listaCotizacion").addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (boton) cambiarCarrito(Number(boton.dataset.id), boton.dataset.accion);
});
elemento("vaciarCotizacion").addEventListener("click", async () => {
  const resultado = await Swal.fire({ title: "¿Vaciar cotización?", icon: "question", showCancelButton: true, confirmButtonText: "Sí, vaciar", cancelButtonText: "Volver" });
  if (resultado.isConfirmed) {
    carrito = [];
    localStorage.removeItem(CLAVE_CARRITO);
    dibujarCarrito();
  }
});
fechaElegida.addEventListener("change", horariosDisponibles);
elemento("horaReserva").addEventListener("change", dibujarResumen);

elemento("formReserva").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const fecha = fechaElegida.value;
  const hora = elemento("horaReserva").value;
  if (!carrito.length || !fecha || !hora || fecha < hoyLocal()) {
    Swal.fire("Datos incompletos", "Selecciona servicios, fecha válida y horario.", "warning");
    return;
  }
  if (reservas.some((reserva) => reserva.fecha === fecha && reserva.hora === hora && reserva.id !== reservaEnEdicion)) {
    Swal.fire("Horario ocupado", "Selecciona otro horario.", "warning");
    horariosDisponibles();
    return;
  }
  const confirmacion = await Swal.fire({ title: reservaEnEdicion ? "¿Guardar cambios?" : "¿Confirmar cita?", text: `${nombreVehiculo()} · ${fecha} a las ${hora} · ${moneda(obtenerTotal())}`, icon: "question", showCancelButton: true, confirmButtonText: "Confirmar", cancelButtonText: "Volver" });
  if (!confirmacion.isConfirmed) return;
  const id = reservaEnEdicion || (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : String(Date.now()));
  const nueva = { id, fecha, hora, vehiculo: selectorVehiculo.value, vehiculoNombre: nombreVehiculo(), items: carrito.map((item) => ({ ...item })), total: obtenerTotal() };
  reservas = reservaEnEdicion
    ? reservas.map((reserva) => reserva.id === id ? nueva : reserva)
    : [...reservas, nueva];
  guardarReservas();
  carrito = [];
  localStorage.removeItem(CLAVE_CARRITO);
  limpiarEdicion();
  elemento("formReserva").reset();
  fechaElegida.min = hoyLocal();
  dibujarCarrito();
  dibujarReservas();
  horariosDisponibles();
  Swal.fire("¡Cita guardada!", "Esta reserva es una simulación y está guardada en este navegador.", "success");
});

elemento("listaReservas").addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  const reserva = reservas.find((dato) => dato.id === boton.dataset.id);
  if (!reserva) return;
  if (boton.dataset.accion === "cancelar") {
    const resultado = await Swal.fire({ title: "¿Cancelar esta cita?", icon: "warning", showCancelButton: true, confirmButtonText: "Sí, cancelar", cancelButtonText: "Volver" });
    if (!resultado.isConfirmed) return;
    reservas = reservas.filter((dato) => dato.id !== reserva.id);
    guardarReservas();
    if (reservaEnEdicion === reserva.id) limpiarEdicion();
    dibujarReservas();
    horariosDisponibles();
  } else {
    reservaEnEdicion = reserva.id;
    carrito = reserva.items.map((item) => ({ ...item }));
    selectorVehiculo.value = reserva.vehiculo;
    selectorVehiculo.dispatchEvent(new Event("change"));
    fechaElegida.value = reserva.fecha;
    horariosDisponibles();
    elemento("horaReserva").value = reserva.hora;
    elemento("confirmarReserva").textContent = "GUARDAR CAMBIOS →";
    dibujarCarrito();
    elemento("reservas").scrollIntoView({ behavior: "smooth" });
  }
});

// app.js despacha este evento cuando termina la lectura asíncrona del JSON.
document.addEventListener("serviciosCargados", (evento) => {
  catalogo = evento.detail;
  actualizarPreciosVehiculo();
});
dibujarCarrito();
dibujarReservas();
horariosDisponibles();
