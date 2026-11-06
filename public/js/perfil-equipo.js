// Las capturas se comparten con la lista y el perfil de la profesora.
import { listaCapturados } from './capturados.js';

const modal = document.querySelector('#add-pokemon-capture-dialog');
const grilla = modal.querySelector('.capturados');
const nota = modal.querySelector('.modal__nota');
const reintentar = modal.querySelector('[data-reintentar]');
const formulario = modal.querySelector('.modal__buscador');
const nombre = formulario.elements.nombre;
const tipo = formulario.elements.tipo;

let catalogo;
let carga;
let capturados = [];

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Una sola petición en curso, aunque se abra el modal mientras carga la página.
async function obtenerCatalogo() {
  if (catalogo) return catalogo;
  if (!carga) {
    carga = (async () => {
      const respuesta = await fetch('/api/pokemon');
      if (!respuesta.ok) throw new Error('No se pudo obtener la Pokédex');
      const datos = await respuesta.json();
      if (!Array.isArray(datos)) throw new Error('La Pokédex no es válida');

      catalogo = datos;
      const tipos = [...new Set(datos.flatMap((pokemon) => pokemon.tipos))].sort();
      tipo.replaceChildren(new Option('Todos los tipos', ''));
      tipos.forEach((valor) => tipo.add(new Option(valor[0].toUpperCase() + valor.slice(1), valor)));
      return catalogo;
    })().finally(() => { carga = null; });
  }
  return carga;
}

function crearTarjeta(pokemon, seleccionados) {
  const tarjeta = document.createElement('li');
  tarjeta.className = 'captura';
  tarjeta.dataset.id = pokemon.id;

  const casilla = document.createElement('input');
  casilla.type = 'checkbox';
  casilla.className = 'captura__check';
  casilla.id = `equipo-cap-${pokemon.id}`;
  casilla.checked = seleccionados.has(pokemon.id);
  casilla.setAttribute('aria-label', `Seleccionar a ${pokemon.nombre}`);

  const cuerpo = document.createElement('label');
  cuerpo.className = 'captura__cuerpo';
  cuerpo.htmlFor = casilla.id;

  const zona = document.createElement('span');
  zona.className = 'sprite-zona';
  const imagen = document.createElement('img');
  imagen.src = `/assets/${encodeURIComponent(pokemon.slug)}.png`;
  imagen.alt = '';
  imagen.width = 96;
  imagen.height = 96;
  zona.append(imagen);

  const numero = document.createElement('span');
  numero.className = 'numero';
  numero.textContent = '#' + String(pokemon.id).padStart(3, '0');
  const etiqueta = document.createElement('span');
  etiqueta.className = 'captura__nombre';
  etiqueta.textContent = pokemon.nombre;

  cuerpo.append(zona, numero, etiqueta);
  tarjeta.append(casilla, cuerpo);
  return tarjeta;
}

function filtrar() {
  const buscado = normalizar(nombre.value);
  const tipoBuscado = normalizar(tipo.value);
  let visibles = 0;
  grilla.querySelectorAll('.captura').forEach((tarjeta, indice) => {
    const pokemon = capturados[indice];
    const coincide = normalizar(pokemon.nombre).includes(buscado)
      && (!tipoBuscado || pokemon.tipos.some((valor) => normalizar(valor) === tipoBuscado));
    tarjeta.hidden = !coincide;
    if (coincide) visibles++;
  });

  nota.textContent = capturados.length === 0
    ? 'Todavía no capturaste ninguno. Entrá a la Pokédex y tocá “Capturar”.'
    : visibles === 0
      ? 'Ningún Pokémon capturado coincide con la búsqueda.'
      : `Mostrando ${visibles} de ${capturados.length} Pokémon capturados`;
}

async function actualizarCapturados() {
  grilla.setAttribute('aria-busy', 'true');
  reintentar.hidden = true;
  try {
    const todos = await obtenerCatalogo();
    // Se lee después del await: incluye capturas que cambiaron mientras cargaba.
    const ids = new Set(listaCapturados().map(Number));
    const seleccionados = new Set([...grilla.querySelectorAll('.captura__check:checked')]
      .map((casilla) => Number(casilla.closest('.captura').dataset.id)));
    capturados = todos.filter((pokemon) => ids.has(pokemon.id)).sort((a, b) => a.id - b.id);
    grilla.replaceChildren(...capturados.map((pokemon) => crearTarjeta(pokemon, seleccionados)));
    filtrar();
  } catch {
    nota.textContent = 'No se pudieron cargar los Pokémon. Tus capturas siguen guardadas en este navegador.';
    reintentar.hidden = false;
  } finally {
    grilla.setAttribute('aria-busy', 'false');
  }
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  if (catalogo) filtrar();
});
nombre.addEventListener('input', () => { if (catalogo) filtrar(); });
tipo.addEventListener('change', () => { if (catalogo) filtrar(); });
reintentar.addEventListener('click', actualizarCapturados);
modal.addEventListener('toggle', () => { if (modal.open) actualizarCapturados(); });

// storage avisa de cambios en otras pestañas del mismo sitio.
window.addEventListener('storage', (evento) => {
  if (evento.key === 'pokedex:capturados' || evento.key === null) actualizarCapturados();
});
// Al volver con Atrás, la página puede restaurarse sin ejecutar otra vez el módulo.
window.addEventListener('pageshow', (evento) => { if (evento.persisted) actualizarCapturados(); });

actualizarCapturados();
