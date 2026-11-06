// =============================================================
//  memoria/render.js  —  dibuja la pantalla A PARTIR del estado.
//  Regla de oro: la UI se DERIVA del estado. Esta función nunca lee del
//  DOM para decidir; solo escribe lo que dice el estado.
// =============================================================

/** @typedef {import('./estado.js').Estado} Estado */
/** @typedef {import('./estado.js').Carta} Carta */

/**
 * Pinta todo el juego según el estado: marcador, tablero y aviso.
 * @param {Estado} estado
 * @param {HTMLElement} raiz  Contenedor del juego.
 */
export function dibujar(estado, raiz) {
  raiz.querySelector('#intentos').textContent = String(estado.intentos);
  raiz.querySelector('#parejas').textContent = `${estado.parejas} / ${estado.totalParejas}`;

  raiz.querySelector('#tablero').innerHTML = estado.tablero.map(cartaHTML).join('');

  raiz.querySelector('#aviso').textContent = estado.fase === 'ganado'
    ? `¡Ganaste en ${estado.intentos} intentos!`
    : 'Encontrá todas las parejas.';
}

/**
 * HTML de una carta. Descubierta muestra el sprite; tapada, la pokébola.
 * @param {Carta} carta
 * @returns {string}
 */
function cartaHTML(carta) {
  const descubierta = carta.volteada || carta.emparejada;
  const clases = ['carta'];
  if (descubierta) clases.push('carta--descubierta');
  if (carta.emparejada) clases.push('carta--emparejada');
  const cara = descubierta
    ? `<img src="/assets/${carta.pokemon}.png" alt="${carta.pokemon}">`
    : '<img src="/assets/pokeball.svg" alt="Carta tapada">';
  return `<button class="${clases.join(' ')}" data-id="${carta.id}" ${descubierta ? 'disabled' : ''}>${cara}</button>`;
}
