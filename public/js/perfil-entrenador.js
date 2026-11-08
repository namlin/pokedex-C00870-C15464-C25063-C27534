// =============================================================
//  perfil-entrenador.js  —  muestra en el perfil los Pokémon que la
//  persona capturó (ids guardados en localStorage).
//  Los datos de cada Pokémon ya no salen de datos.js: se piden al
//  servidor con fetch a /api/pokemon (que a su vez los trae de la PokéAPI).
// =============================================================
import { listaCapturados } from './capturados.js';

// Número con ceros: 7 -> "#007".
function numeroPokedex(id) {
  return '#' + String(id).padStart(3, '0');
}

async function pintarCapturados() {
  // 1) Traemos todos los Pokémon del servidor (JSON) y los indexamos por id.
  const todos = await (await fetch('/api/pokemon')).json();
  const porId = new Map(todos.map((p) => [p.id, p]));

  // 2) De los ids capturados, armamos las fichas completas (y descartamos ids raros).
  const capturados = listaCapturados()
    .map((id) => porId.get(id))
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);

  // 3) Resumen de la tarjeta de sección: el número y los mini-sprites.
  const detalle = document.querySelector('.seccion--capturados .seccion__detalle');
  if (detalle) {
    detalle.textContent = `${capturados.length} Pokémon en tu colección`;
  }

  const mini = document.querySelector('.seccion--capturados .mini-sprites');
  if (mini) {
    const primeros = capturados.slice(0, 3)
      .map((p) => `<li><img src="assets/${p.slug}.png" alt="" width="34" height="34"></li>`)
      .join('');
    const resto = capturados.length > 3
      ? `<li class="mini-sprites__mas">+${capturados.length - 3}</li>` : '';
    mini.innerHTML = primeros + resto;
  }

  // 4) Grilla dentro del diálogo "Pokémon capturados".
  const grilla = document.querySelector('#modal-capturados .capturados');
  if (grilla) {
    if (capturados.length === 0) {
      grilla.innerHTML = '<li class="capturados__vacio">Todavía no capturaste ninguno. Entrá a la Pokédex y tocá “Capturar”.</li>';
    } else {
      grilla.innerHTML = capturados.map((p) => `
        <li class="captura">
          <input type="checkbox" class="captura__check" id="cap-${p.id}" aria-label="Seleccionar a ${p.nombre}">
          <label class="captura__cuerpo" for="cap-${p.id}">
            <span class="sprite-zona"><img src="assets/${p.slug}.png" alt="" width="96" height="96"></span>
            <span class="numero">${numeroPokedex(p.id)}</span>
            <span class="captura__nombre">${p.nombre}</span>
          </label>
        </li>`).join('');
    }
    const nota = document.querySelector('#modal-capturados .modal__nota');
    if (nota) nota.textContent = `${capturados.length} Pokémon capturados`;
  }
}

pintarCapturados();
