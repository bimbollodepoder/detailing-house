# Detailing House — Simulador de cotización y reservas

Proyecto final JavaScript. Permite elegir vehículo, visualizar precios según tamaño, buscar servicios, agregar al carrito, modificar cantidades, agendar cita, editarla y cancelarla. Todo es una **simulación local**; no realiza reservas reales ni sincroniza entre navegadores.

## Uso

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala **Live Server** y abre `index.html` con **Open with Live Server**.
3. No abras el HTML mediante `file://`: `fetch` necesita servidor HTTP.
4. Con conexión a internet, SweetAlert2 y las fotografías se cargan desde CDN/Unsplash.

## Estructura

- `index.html` — interfaz semántica.
- `css/styles.css` — diseño responsive.
- `js/app.js` — `fetch` de JSON, filtros, renderizado y cambio visual de precios.
- `js/reservas.js` — carrito, almacenamiento, calendario y reservas.
- `data/servicios.json` — catálogo de seis servicios.
- `assets/logo.svg` — ícono gráfico de la marca.

## Criterios del curso

`fetch`, `async/await`, `try/catch/finally`, `forEach`, `filter`, `find`, `map`, `reduce`, `some`, `localStorage`, destructuring, `||`, ternario, manipulación DOM, eventos delegados, SweetAlert2 y cierre de reserva.

Los factores por tamaño (1.00, 1.20, 1.45, 1.65) son ejemplos académicos, no tarifas reales. Las citas y el carrito solo se guardan en el navegador utilizado.

## Publicación

Subir el contenido de esta carpeta a un repositorio público GitHub con `index.html` en raíz, habilitar Settings > Pages > Deploy from a branch > main / (root). Probar las funciones en la URL publicada.
