# Carruseles móviles y contacto flotante

## Cambios
- Convertir las tarjetas de “Plataformas y sistemas digitales” y “Automatización y sistemas inteligentes” en carruseles táctiles solamente en mobile; en escritorio conservar el diseño vertical actual.
- Incorporar flechas y dots grises en ambos carruseles, y reemplazar el indicador amarillo del carrusel de testimonios por la misma escala de grises.
- Agregar junto al selector de idioma un botón flotante de contacto basado en la referencia de Sigma Analytics. Al abrirse ofrecerá: agendar una reunión en el calendario actual, enviar un email a `contacto@sigmatecnologiasarg.com` y visitar el Instagram de Sigma.
- Mantener el diseño oscuro, monocromático y con controles accesibles; verificar que los botones no se superpongan en mobile.

## Detalle técnico
- Reutilizar Embla para navegación táctil, dots y flechas.
- Reutilizar el modal de agenda ya existente.
- Crear un componente de contacto flotante y montarlo globalmente junto al selector de idioma.
- Validar visualmente en mobile y escritorio, además del estado de compilación.
