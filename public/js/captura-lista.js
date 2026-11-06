// =============================================================
//  captura-lista.js  —  la parte CLIENTE de la lista.
//  Las tarjetas ahora las arma el servidor (con plantillas). Pero "capturado"
//  vive en localStorage, que es del navegador: el servidor no lo sabe. Así que
//  esta pieza chiquita sigue corriendo en el cliente, sobre las tarjetas ya
//  pintadas, para poner el estado inicial y manejar los clics.
//  Reutiliza capturados.js (el mismo de siempre).
// =============================================================
import { estaCapturado, alternarCaptura } from './capturados.js';

// Pone el texto y el estado del botón (igual que antes).
function pintarBoton(boton, capturado) {
  boton.textContent = capturado ? '✓ Capturado' : 'Capturar';
  boton.setAttribute('aria-pressed', capturado);
}

// Recorremos los botones que el servidor ya dejó en el HTML.
document.querySelectorAll('.captura-btn').forEach((boton) => {
  const id = Number(boton.dataset.id);          // el data-id de la plantilla
  const tarjeta = boton.closest('.pokemon-card');

  // 1) Estado inicial, según lo que haya guardado en localStorage.
  pintarBoton(boton, estaCapturado(id));
  if (estaCapturado(id)) tarjeta.classList.add('pokemon-card--capturado');

  // 2) Al tocar: alternar, guardar y repintar.
  boton.addEventListener('click', () => {
    const ahora = alternarCaptura(id);
    tarjeta.classList.toggle('pokemon-card--capturado', ahora);
    pintarBoton(boton, ahora);
  });
});
