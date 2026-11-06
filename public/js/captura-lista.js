// =============================================================
//  captura-lista.js  —  la parte CLIENTE de la lista.
//  Hace dos cosas, las dos basadas en localStorage (que es del navegador):
//   1) el botón "Capturar" de cada tarjeta (marca/desmarca y guarda);
//   2) el filtro "mostrar solo los que ya capturé": como el servidor NO sabe
//      qué capturó cada persona, este filtro se aplica acá, escondiendo las
//      tarjetas no capturadas sobre lo que el servidor ya mandó.
// =============================================================
import { estaCapturado, alternarCaptura } from './capturados.js';

const CLAVE_FILTRO = 'pokedex:solo-capturados';
const casilla = document.querySelector('#solo-capturados');

// Pone el texto y el estado del botón.
function pintarBoton(boton, capturado) {
  boton.textContent = capturado ? '✓ Capturado' : 'Capturar';
  boton.setAttribute('aria-pressed', capturado);
}

// Esconde o muestra cada tarjeta según el filtro y lo que haya en localStorage.
function aplicarFiltro() {
  const soloCapturados = casilla?.checked ?? false;
  document.querySelectorAll('.pokemon-card').forEach((tarjeta) => {
    const boton = tarjeta.querySelector('.captura-btn');
    const id = Number(boton.dataset.id);
    tarjeta.hidden = soloCapturados && !estaCapturado(id);
  });
}

// --- 1) Botones de captura ---
document.querySelectorAll('.captura-btn').forEach((boton) => {
  const id = Number(boton.dataset.id);
  const tarjeta = boton.closest('.pokemon-card');

  pintarBoton(boton, estaCapturado(id));
  if (estaCapturado(id)) tarjeta.classList.add('pokemon-card--capturado');

  boton.addEventListener('click', () => {
    const ahora = alternarCaptura(id);
    tarjeta.classList.toggle('pokemon-card--capturado', ahora);
    pintarBoton(boton, ahora);
    aplicarFiltro(); // por si el filtro está activo y acabo de descapturar uno
  });
});

// --- 2) Filtro "solo capturados" ---
if (casilla) {
  // Al cargar, recordamos cómo lo dejó la persona la última vez.
  const guardado = localStorage.getItem(CLAVE_FILTRO);
  if (guardado !== null) casilla.checked = guardado === 'si';

  casilla.addEventListener('change', () => {
    try {
      localStorage.setItem(CLAVE_FILTRO, casilla.checked ? 'si' : 'no');
    } catch { /* si no se puede guardar, igual aplicamos el filtro */ }
    aplicarFiltro();
  });
}

aplicarFiltro(); // estado inicial
