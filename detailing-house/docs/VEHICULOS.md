# Precios según vehículo

El usuario selecciona su vehículo antes de cotizar. Los precios del catálogo permanecen en `data/servicios.json` y corresponden al carro chico. El selector HTML define estos multiplicadores de ejemplo:

- Chico: 1.00
- Mediano: 1.20
- Camioneta: 1.45
- Pick-up: 1.65

`app.js` muestra el precio ajustado con `Math.round(precio * factor)`. `reservas.js` calcula los precios del carrito, actualiza el total cuando cambia el vehículo y guarda el tipo de vehículo en cada cita.

Los importes son ilustrativos, no tarifas comerciales verificadas. Las reservas antiguas anteriores a este cambio mostrarán "Vehículo no registrado".
