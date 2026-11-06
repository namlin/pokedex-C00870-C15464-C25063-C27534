// =============================================================
//  memoria/main.js  —  junta todo: pide los Pokémon, tiene el estado,
//  escucha los clics y, ante cada jugada, cambia el estado y redibuja.
//  El ciclo es siempre el mismo:  evento -> cambiar estado -> dibujar.
// =============================================================
import { crearEstado, voltear, resolver, devolver } from './estado.js';
import { dibujar } from './render.js';

const raiz = document.querySelector('#juego');

/** @type {import('./estado.js').Estado} */
let estado;
/** @type {string[]} */
let pokemones = [];

/** Repinta la pantalla con el estado actual. */
function actualizar() {
  dibujar(estado, raiz);
}

/**
 * Procesa el clic en una carta: la voltea y, si ya hay dos, resuelve.
 * @param {number} id
 */
function jugar(id) {
  voltear(estado, id);
  actualizar();

  const resultado = resolver(estado);
  if (resultado === 'incompleto') return;

  actualizar(); // deja ver la segunda carta antes de decidir
  if (resultado === 'fallo') {
    setTimeout(() => {
      devolver(estado);
      actualizar();
    }, 900);
  }
}

/** Trae los Pokémon de la API, elige 6 y arranca una partida. */
async function iniciar() {
  const todos = await (await fetch('/api/pokemon')).json();
  pokemones = todos.slice(0, 6).map((p) => p.slug);
  estado = crearEstado(pokemones);
  actualizar();
}

// --- Setup del juego: los manejadores de eventos ---

// Un solo listener para todo el tablero (delegación): sirve aunque el
// tablero se vuelva a dibujar entero en cada jugada.
raiz.querySelector('#tablero').addEventListener('click', (evento) => {
  const boton = evento.target.closest('.carta');
  if (!boton) return;
  jugar(Number(boton.dataset.id));
});

raiz.querySelector('#reiniciar').addEventListener('click', () => {
  estado = crearEstado(pokemones);
  actualizar();
});

iniciar();
