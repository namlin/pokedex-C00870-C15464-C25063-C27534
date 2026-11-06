// =============================================================
//  ficha.js  —  Una sola ficha para todos los Pokémon.
//  Lee el id de la dirección (detalle.html?id=7) y arma la página
//  con la MISMA estructura y clases del HTML original.
//  Reemplaza a los archivos detalle-pokemon-*.html.
// =============================================================
import { pokedex, buscarPorId, numeroPokedex, totalStats } from './datos.js';

const parametros = new URLSearchParams(location.search);
const id = Number(parametros.get('id'));
const pokemon = buscarPorId(id);

const ficha = document.querySelector('#ficha-pokemon');
const carrusel = document.querySelector('#carrusel .carrusel');

if (!pokemon) {
  ficha.innerHTML = '<h1>No encontramos ese Pokémon</h1><p class="volver"><a href="./">Volver a la lista</a></p>';
} else {
  document.title = `Pokédex - ${pokemon.nombre}`;
  dibujarFicha(pokemon);
  dibujarCarrusel(pokemon);
}

function mayus(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

function dibujarFicha(p) {
  const tipos = p.tipos.map((t) => `<span class="tipo tipo--${t}">${mayus(t)}</span>`).join(' ');

  const evolucion = p.evolucion
    .map((n) => n === p.nombre
      ? `<li class="cadena-evolutiva__actual" aria-current="true">${n}</li>`
      : `<li>${n}</li>`)
    .join('\n          ');

  const habilidades = p.habilidades
    .map((h) => `          <dt>${h.nombre}${h.oculta ? ' <em>(oculta)</em>' : ''}</dt>\n          <dd>${h.descripcion}</dd>`)
    .join('\n');

  const celdas = Object.values(p.stats)
    .map((v) => `<td style="--valor: ${v}">${v}</td>`)
    .join('\n                ');

  // Frase de "cómo se leen las estadísticas", armada con los propios datos
  const etiquetas = { hp: 'Puntos de Salud', ataque: 'Ataque', defensa: 'Defensa',
    ataqueEsp: 'Ataque Especial', defensaEsp: 'Defensa Especial', velocidad: 'Velocidad' };
  const entradas = Object.entries(p.stats);
  const alta = entradas.reduce((a, b) => (b[1] > a[1] ? b : a));
  const baja = entradas.reduce((a, b) => (b[1] < a[1] ? b : a));
  const lectura = `${p.nombre} destaca en ${etiquetas[alta[0]]} (${alta[1]}) y débil en ${etiquetas[baja[0]]} (${baja[1]}).`;

  ficha.innerHTML = `
      <h1><span>${numeroPokedex(p.id)}</span> ${p.nombre}</h1>

      <nav id="indice-ficha">
        <ul>
          <li><a href="#detalles">Detalles</a></li>
          <li><a href="#habilidades">Habilidades</a></li>
          <li><a href="#estadisticas">Estadísticas</a></li>
          <li><a href="#mas-informacion">Más información</a></li>
        </ul>
      </nav>

      <p>${p.descripcion}</p>

      <div class="ficha-pokemon__resumen">
        <figure class="ficha-pokemon__imagen">
          <img src="assets/${p.slug}.png" alt="${p.nombre}, un Pokémon de tipo ${p.tipos.join(' y ')}" width="300" height="300">
          <figcaption>${p.nombre}, el ${p.genus}</figcaption>
        </figure>

        <section id="detalles" class="ficha-pokemon__detalles">
          <h2>Detalles</h2>
          <dl>
            <dt>Peso</dt>
            <dd>${p.peso.toFixed(1)} kg</dd>
            <dt>Tamaño</dt>
            <dd>${p.tamano.toFixed(1)} m</dd>
            <dt>Tipo</dt>
            <dd>${tipos}</dd>
          </dl>
          <h3>Cadena evolutiva</h3>
          <ol class="cadena-evolutiva">
          ${evolucion}
          </ol>
        </section>

        <section id="habilidades" class="ficha-pokemon__habilidades">
          <h2>Habilidades</h2>
          <dl>
${habilidades}
          </dl>
        </section>
      </div>

      <section id="estadisticas">
        <h2>Estadísticas</h2>
        <table class="stats-table">
          <caption>Estadísticas base de ${p.nombre}</caption>
          <thead>
            <tr>
              <th abbr="PS">Puntos de Salud</th>
              <th abbr="ATQ">Ataque</th>
              <th abbr="DEF">Defensa</th>
              <th abbr="AT. ESP.">Ataque Especial</th>
              <th abbr="DEF. ESP.">Defensa Especial</th>
              <th abbr="VEL">Velocidad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
                ${celdas}
            </tr>
          </tbody>
          <tfoot>
            <tr class="stats-table__total">
              <td colspan="6">Total: ${totalStats(p)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section id="mas-informacion">
        <h2>Más información</h2>
        <h3>¿Cómo se leen estas estadísticas?</h3>
        <p>Cada número de la tabla es un valor base, en una escala que en la práctica va de 5 a 255. ${lectura}</p>
        <h3>¿Qué es una habilidad oculta?</h3>
        <p>Es una habilidad que el Pokémon puede tener en lugar de la habitual, pero que no aparece por métodos normales de captura. En la ficha la marcamos con la palabra <em>oculta</em> entre paréntesis.</p>
        <h3>¿De dónde salieron estos datos?</h3>
        <p>Las ilustraciones vienen del repositorio público de PokeAPI y los datos de la misma PokeAPI. Los enlaces completos están en el pie de esta página.</p>
      </section>

      <p><a href="https://bulbapedia.bulbagarden.net/wiki/${p.nombre}_(Pokémon)" target="_blank" rel="noopener">Ver ficha completa en Bulbapedia</a> (se abre en una pestaña nueva)</p>`;
}

function dibujarCarrusel(p) {
  if (!carrusel) return;
  const n = pokedex.length;
  const i = pokedex.findIndex((x) => x.id === p.id);
  carrusel.replaceChildren();
  // Siempre 5: dos antes, el actual y dos después. Es circular: si estás en el
  // primero, el "anterior" es el último (y al revés). El operador % da la vuelta.
  for (let k = -2; k <= 2; k++) {
    const j = (i + k + n) % n;          // índice que da la vuelta (circular)
    const vecino = pokedex[j];
    const li = document.createElement('li');
    li.className = 'carrusel__item';
    li.dataset.pos = k;                  // -2..2: lo usa el CSS para el arco
    if (k === 0) {
      li.classList.add('carrusel__item--activo');
      li.innerHTML = `<img src="assets/pokeball.svg" alt="Estás viendo ${numeroPokedex(vecino.id)} ${vecino.nombre}" width="40" height="40">`;
    } else {
      li.innerHTML = `<a href="detalle.html?id=${vecino.id}"><img src="assets/pokeball-inactiva.svg" alt="Ir a ${numeroPokedex(vecino.id)} ${vecino.nombre}" width="32" height="32"></a>`;
    }
    carrusel.append(li);
  }
}