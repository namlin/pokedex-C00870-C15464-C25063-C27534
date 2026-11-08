// =============================================================
//  memoria/estado.js  —  el ESTADO del juego y las reglas que lo cambian.
//  Toda la partida vive en un solo objeto Estado (la "fuente de verdad").
//  Nada de este archivo toca el DOM: solo datos y reglas.
// =============================================================

/**
 * Fase de la partida.
 * @typedef {'jugando' | 'ganado'} Fase
 */

/**
 * Una carta del tablero.
 * @typedef {Object} Carta
 * @property {number} id          Posición en el tablero (0 .. n-1).
 * @property {string} pokemon     Slug del Pokémon; dos iguales forman pareja.
 * @property {boolean} volteada   Si está mostrando su cara.
 * @property {boolean} emparejada Si ya fue emparejada (queda descubierta).
 */

/**
 * Todo lo que define la partida en un momento dado.
 * @typedef {Object} Estado
 * @property {Fase} fase
 * @property {Carta[]} tablero      Todas las cartas, en orden de la cuadrícula.
 * @property {number[]} volteadas   Ids de las cartas volteadas sin resolver (0, 1 o 2).
 * @property {number} intentos      Pares intentados (el marcador: menos es mejor).
 * @property {number} parejas       Parejas encontradas (el progreso).
 * @property {number} totalParejas  Cuántas parejas hay que encontrar.
 * @property {boolean} bloqueado    True mientras se muestran dos que no casan.
 */

/**
 * Baraja una copia del arreglo (Fisher-Yates). No modifica el original.
 * @template T
 * @param {T[]} arreglo
 * @returns {T[]} una copia barajada
 */
export function barajar(arreglo) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Crea el estado inicial: cada Pokémon dos veces, barajado.
 * @param {string[]} pokemones  Slugs de los Pokémon que entran al juego.
 * @returns {Estado}
 */
export function crearEstado(pokemones) {
  const cartas = barajar([...pokemones, ...pokemones]).map((pokemon, id) => ({
    id,
    pokemon,
    volteada: false,
    emparejada: false,
  }));
  return {
    fase: 'jugando',
    tablero: cartas,
    volteadas: [],
    intentos: 0,
    parejas: 0,
    totalParejas: pokemones.length,
    bloqueado: false,
  };
}

/**
 * Voltea la carta con ese id, si la jugada es válida.
 * @param {Estado} estado
 * @param {number} id
 */
export function voltear(estado, id) {
  if (estado.bloqueado) return;
  const carta = estado.tablero[id];
  if (carta.volteada || carta.emparejada) return;
  carta.volteada = true;
  estado.volteadas.push(id);
}

/**
 * Si hay dos cartas volteadas, decide: pareja o fallo. Devuelve qué pasó.
 * @param {Estado} estado
 * @returns {'incompleto' | 'pareja' | 'fallo'}
 */
export function resolver(estado) {
  if (estado.volteadas.length < 2) return 'incompleto';
  estado.intentos += 1;
  const [a, b] = estado.volteadas.map((id) => estado.tablero[id]);
  if (a.pokemon === b.pokemon) {
    a.emparejada = true;
    b.emparejada = true;
    estado.volteadas = [];
    estado.parejas += 1;
    if (estado.parejas === estado.totalParejas) estado.fase = 'ganado';
    return 'pareja';
  }
  estado.bloqueado = true; // se muestran un momento y luego se devuelven
  return 'fallo';
}

/**
 * Devuelve al reverso las dos cartas que no casaron y quita el bloqueo.
 * @param {Estado} estado
 */
export function devolver(estado) {
  for (const id of estado.volteadas) estado.tablero[id].volteada = false;
  estado.volteadas = [];
  estado.bloqueado = false;
}
