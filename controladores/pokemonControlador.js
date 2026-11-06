// =============================================================
//  CONTROLADOR — el intermediario.
//  Recibe la petición, le pide datos al modelo, prepara lo que la vista
//  necesita y llama a respuesta.render(). Como ahora el modelo trae los
//  datos de la PokéAPI (es asíncrono), los controladores usan async/await.
// =============================================================
import * as modelo from '../modelos/pokedex.js';

// Primera letra en mayúscula: "fuego" -> "Fuego".
function mayus(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// -------- GET /  ->  la lista --------
export async function listar(peticion, respuesta) {
  const filtros = {
    nombre: peticion.query.nombre ?? '',
    tipo: peticion.query.tipo ?? '',
    orden: peticion.query.orden ?? 'numero-asc',
    soloCapturados: peticion.query['solo-capturados'] === 'si',
    etapa: peticion.query.etapa ?? 'todas',
  };

  const pokemones = await modelo.filtrarYOrdenar(filtros);

  respuesta.render('lista', {
    titulo: 'Pokédex - Lista de Pokémon',
    pokemones,
    filtros,
    numeroPokedex: modelo.numeroPokedex,
  });
}

// -------- GET /pokemon/7  ->  la ficha --------
export async function ver(peticion, respuesta) {
  const id = Number(peticion.params.id);
  const pokemon = await modelo.buscarPorId(id);

  if (!pokemon) {
    respuesta.status(404).render('404');
    return;
  }

  // Carrusel: 5 vecinos (dos antes, el actual, dos después), circular.
  const todos = await modelo.obtenerTodos();
  const n = todos.length;
  const i = todos.findIndex((x) => x.id === id);
  const vecinos = [];
  for (let k = -2; k <= 2; k++) {
    const vecino = todos[(i + k + n) % n];
    vecinos.push({ pokemon: vecino, pos: k, activo: k === 0 });
  }

  // Frase de "cómo se leen las estadísticas", armada con los propios datos.
  const etiquetas = { hp: 'Puntos de Salud', ataque: 'Ataque', defensa: 'Defensa',
    ataqueEsp: 'Ataque Especial', defensaEsp: 'Defensa Especial', velocidad: 'Velocidad' };
  const entradas = Object.entries(pokemon.stats);
  const alta = entradas.reduce((a, b) => (b[1] > a[1] ? b : a));
  const baja = entradas.reduce((a, b) => (b[1] < a[1] ? b : a));
  const lectura = `${pokemon.nombre} destaca en ${etiquetas[alta[0]]} (${alta[1]}) y es débil en ${etiquetas[baja[0]]} (${baja[1]}).`;

  respuesta.render('detalle', {
    titulo: `Pokédex - ${pokemon.nombre}`,
    pokemon, vecinos, lectura,
    contador: n + ' Pokémon',
    mayus,
    numeroPokedex: modelo.numeroPokedex,
    totalStats: modelo.totalStats,
  });
}

// -------- GET /api/pokemon  ->  los datos en JSON (lo consume el perfil) --------
export async function listarJson(peticion, respuesta) {
  respuesta.json(await modelo.obtenerTodos());
}

// -------- GET /agregar  ->  el formulario --------
export function formularioNuevo(peticion, respuesta) {
  respuesta.render('agregar', { titulo: 'Pokédex - Agregar un Pokémon' });
}

// -------- POST /pokemon  ->  agrega uno y vuelve a la lista --------
export async function crear(peticion, respuesta) {
  const nombre = (peticion.body.nombre || '').trim();
  const nuevo = {
    id: Number(peticion.body.id),
    nombre,
    slug: (peticion.body.slug || nombre).toLowerCase(),
    tipos: (peticion.body.tipos || '').split(',').map((t) => t.trim()).filter(Boolean),
    peso: Number(peticion.body.peso) || 0,
    tamano: Number(peticion.body.tamano) || 0,
    stats: { hp: 0, ataque: 0, defensa: 0, ataqueEsp: 0, defensaEsp: 0, velocidad: 0 },
    habilidades: [],
    evolucion: [nombre],
    etapa: 'inicial',
    capturado: false,
    genus: peticion.body.genus || '',
    descripcion: peticion.body.descripcion || '',
  };
  await modelo.agregar(nuevo);
  respuesta.redirect('/');
}
