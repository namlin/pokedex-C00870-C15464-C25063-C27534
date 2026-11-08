// =============================================================
//  MODELO — el dueño de los datos.
//  Ahora los datos NO están quemados en un archivo: se traen de la
//  PokéAPI (pokeapi.co) con fetch/async-await y se transforman al
//  "shape" que ya usan las vistas. Se traen una sola vez y se guardan
//  en memoria (caché), para no pedirlos en cada visita.
// =============================================================

const BASE = 'https://pokeapi.co/api/v2';

// Los 10 Pokémon del caso de estudio (misma selección de antes).
const IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 25];

// Nota: NO hay campo "capturado". Lo capturado es de cada persona y vive en el
// navegador (localStorage); el servidor no lo sabe. El filtro "solo capturados"
// se resuelve del lado cliente (ver public/js/captura-lista.js).

// La PokéAPI da los tipos en inglés; el sitio los usa en español (y el CSS
// se engancha de .tipo--planta, etc.). Este mapa traduce.
const TIPOS_ES = {
  normal: 'normal', fire: 'fuego', water: 'agua', grass: 'planta', electric: 'eléctrico',
  ice: 'hielo', fighting: 'lucha', poison: 'veneno', ground: 'tierra', flying: 'volador',
  psychic: 'psiquico', bug: 'bicho', rock: 'roca', ghost: 'fantasma', dragon: 'dragon',
  dark: 'siniestro', steel: 'acero', fairy: 'hada',
};

// Nombre de la estadística en la API -> llave que usa el sitio.
const STATS_ES = {
  hp: 'hp', attack: 'ataque', defense: 'defensa',
  'special-attack': 'ataqueEsp', 'special-defense': 'defensaEsp', speed: 'velocidad',
};

/**
 * @typedef {Object} Pokemon
 * @property {number} id
 * @property {string} nombre        Nombre en español (para mostrar).
 * @property {string} slug          Nombre en inglés (nombre del archivo de imagen).
 * @property {string[]} tipos
 * @property {number} peso          En kilogramos.
 * @property {number} tamano        En metros.
 * @property {{hp:number, ataque:number, defensa:number, ataqueEsp:number, defensaEsp:number, velocidad:number}} stats
 * @property {{nombre:string, oculta:boolean, descripcion:string}[]} habilidades
 * @property {string[]} evolucion   Nombres de la cadena evolutiva, en orden.
 * @property {'inicial'|'media'|'final'} etapa
 * @property {string} genus
 * @property {string} descripcion
 */

// La caché: se llena una sola vez con cargar(). null = todavía no se pidió.
/** @type {Pokemon[] | null} */
let pokedex = null;

// --- Helpers de red ---

/**
 * Pide un JSON y lanza error si la respuesta no fue OK.
 * @param {string} url
 * @returns {Promise<any>}
 */
async function traerJson(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(`La PokéAPI respondió ${respuesta.status} en ${url}`);
  return respuesta.json();
}

/** Saca el número final de una URL de la API (".../ability/65/" -> "65"). */
function idDeUrl(url) {
  return url.match(/\/(\d+)\/?$/)[1];
}

// --- Helpers de mapeo (puros: reciben JSON de la API, devuelven lo del sitio) ---

/** El texto en español de una lista con {language, ...}, o el primero si no hay. */
function enEspanol(entradas, campo) {
  const es = entradas.find((e) => e.language.name === 'es');
  return (es ?? entradas[0])[campo];
}

/** Junta saltos de línea y espacios raros de las descripciones de la API. */
function limpiar(texto) {
  return texto.replace(/\s+/g, ' ').trim();
}

/**
 * Convierte el arreglo de stats de la API al objeto del sitio.
 * @param {{base_stat:number, stat:{name:string}}[]} statsApi
 */
export function mapearEstadisticas(statsApi) {
  const stats = {};
  for (const s of statsApi) stats[STATS_ES[s.stat.name]] = s.base_stat;
  return stats;
}

/**
 * Traduce los tipos de inglés a los slugs en español del sitio.
 * @param {{type:{name:string}}[]} tiposApi
 */
export function mapearTipos(tiposApi) {
  return tiposApi.map((t) => TIPOS_ES[t.type.name] ?? t.type.name);
}

/** Aplana la cadena evolutiva siguiendo la línea principal: [bulbasaur, ivysaur, venusaur]. */
function aplanarCadena(nodo, acumulado = []) {
  acumulado.push(nodo.species.name);
  if (nodo.evolves_to.length > 0) aplanarCadena(nodo.evolves_to[0], acumulado);
  return acumulado;
}

/** 'bulbasaur' -> 'Bulbasaur' */
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Arma una ficha completa del sitio a partir de los JSON de la API.
 * @returns {Pokemon}
 */
function construirPokemon({ datos, especie, cadena, habilidades }) {
  const indice = cadena.indexOf(datos.name);
  const etapa = indice <= 0 ? 'inicial' : (indice === cadena.length - 1 ? 'final' : 'media');

  return {
    id: datos.id,
    nombre: enEspanol(especie.names, 'name'),
    slug: datos.name,
    tipos: mapearTipos(datos.types),
    peso: datos.weight / 10,     // hectogramos -> kg
    tamano: datos.height / 10,   // decímetros -> m
    stats: mapearEstadisticas(datos.stats),
    habilidades,
    evolucion: cadena.map(capitalizar),
    etapa,
    genus: enEspanol(especie.genera, 'genus'),
    descripcion: limpiar(enEspanol(especie.flavor_text_entries, 'flavor_text')),
  };
}

/**
 * Trae la descripción en español de una habilidad (por su URL en la API).
 * Usa un caché porque varias Pokémon comparten habilidad.
 */
async function traerHabilidad(url, cache) {
  const id = idDeUrl(url);
  if (!cache.has(id)) {
    const ab = await traerJson(`${BASE}/ability/${id}`);
    const flavor = ab.flavor_text_entries.find((f) => f.language.name === 'es');
    cache.set(id, {
      nombre: enEspanol(ab.names, 'name'),
      descripcion: flavor ? limpiar(flavor.flavor_text) : '',
    });
  }
  return cache.get(id);
}

/** Trae un Pokémon completo (sus 3-4 peticiones) y lo arma. */
async function traerPokemon(id, cacheHabilidades) {
  const [datos, especie] = await Promise.all([
    traerJson(`${BASE}/pokemon/${id}`),
    traerJson(`${BASE}/pokemon-species/${id}`),
  ]);
  const cadenaRaw = await traerJson(`${BASE}/evolution-chain/${idDeUrl(especie.evolution_chain.url)}`);
  const cadena = aplanarCadena(cadenaRaw.chain);
  const habilidades = await Promise.all(
    datos.abilities.map(async (a) => {
      const info = await traerHabilidad(a.ability.url, cacheHabilidades);
      return { nombre: info.nombre, oculta: a.is_hidden, descripcion: info.descripcion };
    }),
  );
  return construirPokemon({ datos, especie, cadena, habilidades });
}

/** Llena la caché: trae los 10 Pokémon (en paralelo) y los ordena. */
async function cargar() {
  const cacheHabilidades = new Map();
  const fichas = await Promise.all(IDS.map((id) => traerPokemon(id, cacheHabilidades)));
  pokedex = fichas.sort((a, b) => a.id - b.id);
}

// --- Lo que usan los controladores (ahora todo es async) ---

/** Todos los Pokémon; los trae de la API la primera vez y luego usa la caché. */
export async function obtenerTodos() {
  if (!pokedex) await cargar();
  return pokedex;
}

/** Busca uno por id. */
export async function buscarPorId(id) {
  return (await obtenerTodos()).find((p) => p.id === id);
}

// Quita acentos y pasa a minúscula, para comparar "eléctrico" con "electrico".
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Filtra y ordena con los criterios del formulario. Ojo: "solo capturados" NO
// está acá, porque el servidor no sabe qué capturó cada persona (eso vive en
// localStorage). Ese filtro lo aplica el cliente sobre lo que el servidor manda.
export async function filtrarYOrdenar({ nombre = '', tipo = '', orden = 'numero-asc', etapa = 'todas' } = {}) {
  const todos = await obtenerTodos();
  const resultado = todos.filter((p) => {
    if (nombre && !normalizar(p.nombre).includes(normalizar(nombre))) return false;
    if (tipo && !p.tipos.map(normalizar).includes(normalizar(tipo))) return false;
    if (etapa !== 'todas' && p.etapa !== etapa) return false;
    return true;
  });

  const ordenadores = {
    'numero-asc': (a, b) => a.id - b.id,
    'numero-desc': (a, b) => b.id - a.id,
    'nombre-asc': (a, b) => a.nombre.localeCompare(b.nombre),
    'nombre-desc': (a, b) => b.nombre.localeCompare(a.nombre),
    'tamano-desc': (a, b) => b.tamano - a.tamano,
    'tamano-asc': (a, b) => a.tamano - b.tamano,
  };
  return [...resultado].sort(ordenadores[orden] ?? ordenadores['numero-asc']);
}

/** Agrega un Pokémon a la caché en memoria (se pierde al reiniciar el servidor). */
export async function agregar(pokemon) {
  (await obtenerTodos()).push(pokemon);
  return pokemon;
}

// Helpers de presentación (no necesitan datos de la API).
export function numeroPokedex(id) {
  return '#' + String(id).padStart(3, '0');
}
export function totalStats(pokemon) {
  return Object.values(pokemon.stats).reduce((suma, n) => suma + n, 0);
}
