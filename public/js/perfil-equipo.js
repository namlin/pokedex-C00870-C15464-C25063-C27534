// Las capturas se comparten con la lista y el perfil de la profesora.
import { listaCapturados } from './capturados.js';
import { agregarAlEquipo, listaEquipo, quitarDelEquipo, MAX_EQUIPO } from './equipo-pokemon.js';
import { numeroPokedex } from './datos.js';

const modal = document.querySelector('#add-pokemon-capture-dialog');
const grilla = modal.querySelector('.capturados');
const nota = modal.querySelector('.modal__nota');
const reintentar = modal.querySelector('[data-reintentar]');
const formulario = modal.querySelector('.modal__buscador');
const nombre = formulario.elements.nombre;
const tipo = formulario.elements.tipo;
const resumen = document.querySelector('[data-resumen="capturados"]');
const preview = document.querySelector('[data-preview="capturados"]');
const botonAgregar = modal.querySelector('[data-agregar-equipo]');
const modalEquipo = document.querySelector('#team-pokemon-dialog');
const lista = modalEquipo.querySelector('.pokemon-team__list');
const ocupados = modalEquipo.querySelector('.team-pokemon__summary');
const notaEquipo = modalEquipo.querySelector('[data-nota-equipo]');
const reintentarEquipo = modalEquipo.querySelector('[data-reintentar-equipo]');
const resumenEquipo = document.querySelector('[data-resumen="equipo"]');
const previewEquipo = document.querySelector('[data-preview="equipo"]');

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

// El botón resume la colección completa, aunque el modal tenga filtros activos.
function pintarResumen() {
  resumen.textContent = `${capturados.length} Pokémon en tu colección`;
  pintarPreview(preview, capturados);
}

// Capturados y equipo comparten las miniaturas y el indicador de restantes.
function pintarPreview(destino, pokemones) {
  const miniaturas = pokemones.slice(0, 3).map((pokemon) => {
    const marco = document.createElement('span');
    marco.className = 'accion__miniatura';
    const imagen = document.createElement('img');
    imagen.src = `/assets/${encodeURIComponent(pokemon.slug)}.png`;
    imagen.alt = '';
    imagen.width = 32;
    imagen.height = 32;
    marco.append(imagen);
    return marco;
  });

  if (pokemones.length > 3) {
    const restantes = document.createElement('span');
    restantes.className = 'accion__miniatura accion__miniatura--mas';
    restantes.textContent = `+${pokemones.length - 3}`;
    miniaturas.push(restantes);
  }

  destino.replaceChildren(...miniaturas);
}

function crearFichaEquipo(pokemon) {
  const tarjeta = document.createElement('li');
  tarjeta.className = 'pokemon-card pokemon-team__slot';
  const imagen = document.createElement('img');
  imagen.className = 'pokemon-team__image';
  imagen.src = `/assets/${encodeURIComponent(pokemon.slug)}.png`;
  imagen.alt = '';
  imagen.width = 96;
  imagen.height = 96;

  const numero = document.createElement('span');
  numero.className = 'pokemon-card__number pokemon-team__number';
  numero.textContent = numeroPokedex(pokemon.id);
  const etiqueta = document.createElement('span');
  etiqueta.className = 'pokemon-card__name pokemon-team__name';
  etiqueta.textContent = pokemon.nombre;
  const tipos = document.createElement('div');
  tipos.className = 'pokemon-team__types';
  pokemon.tipos.forEach((valor) => {
    const tipo = document.createElement('span');
    tipo.className = `tipo tipo--${normalizar(valor)}`;
    tipo.textContent = valor[0].toUpperCase() + valor.slice(1);
    tipos.append(tipo);
  });

  const quitar = document.createElement('button');
  quitar.type = 'button';
  quitar.className = 'boton boton--borde-rojo boton--chico pokemon-team__remove';
  quitar.dataset.quitarEquipo = pokemon.id;
  quitar.textContent = 'Quitar';
  quitar.setAttribute('aria-label', `Quitar a ${pokemon.nombre} del equipo`);
  tarjeta.append(imagen, numero, etiqueta, tipos, quitar);
  return tarjeta;
}

function crearEspacioLibre() {
  const espacio = document.createElement('li');
  espacio.className = 'pokemon-team__slot pokemon-team__slot--empty';
  const etiqueta = document.createElement('span');
  etiqueta.className = 'pokemon-team__empty-text';
  etiqueta.textContent = 'Espacio libre';
  espacio.append(etiqueta);
  return espacio;
}

async function actualizarEquipo() {
  lista.setAttribute('aria-busy', 'true');
  reintentarEquipo.hidden = true;
  try {
    const todos = await obtenerCatalogo();
    const porId = new Map(todos.map((pokemon) => [pokemon.id, pokemon]));
    const equipo = listaEquipo().map((id) => porId.get(id)).filter(Boolean);
    const libres = MAX_EQUIPO - equipo.length;
    ocupados.textContent = `${equipo.length} de ${MAX_EQUIPO} espacios ocupados`;
    resumenEquipo.textContent = `${equipo.length} de ${MAX_EQUIPO} Pokémon · ${libres} ${libres === 1 ? 'espacio disponible' : 'espacios disponibles'}`;
    pintarPreview(previewEquipo, equipo);
    lista.replaceChildren(
      ...equipo.map(crearFichaEquipo),
      ...Array.from({ length: libres }, crearEspacioLibre),
    );
    notaEquipo.textContent = equipo.length === 0
      ? 'Todavía no tenés Pokémon en tu equipo. Agregalos desde Capturados.'
      : '';
  } catch {
    resumenEquipo.textContent = 'No se pudo cargar el equipo';
    notaEquipo.textContent = 'No se pudo cargar el equipo. Tus datos guardados no se modificaron.';
    reintentarEquipo.hidden = false;
  } finally {
    lista.setAttribute('aria-busy', 'false');
  }
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
  numero.textContent = numeroPokedex(pokemon.id);
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
    pintarResumen();
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
modalEquipo.addEventListener('toggle', () => { if (modalEquipo.open) actualizarEquipo(); });
reintentarEquipo.addEventListener('click', actualizarEquipo);

// Delegación: los botones siguen funcionando al regenerar las fichas.
lista.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('[data-quitar-equipo]');
  if (!boton) return;
  const indice = [...lista.querySelectorAll('[data-quitar-equipo]')].indexOf(boton);
  const resultado = quitarDelEquipo(boton.dataset.quitarEquipo);
  if (resultado.ok) {
    await actualizarEquipo();
    const botones = lista.querySelectorAll('[data-quitar-equipo]');
    const siguiente = botones[Math.min(indice, botones.length - 1)]
      ?? modalEquipo.querySelector('.team-dialog__add');
    siguiente.focus();
  }
  notaEquipo.textContent = [resultado.mensaje, resultado.ok ? notaEquipo.textContent : '']
    .filter(Boolean).join(' ');
});

// storage avisa de cambios en otras pestañas del mismo sitio.
window.addEventListener('storage', (evento) => {
  if (evento.key === 'pokedex:capturados' || evento.key === null) actualizarCapturados();
  if (evento.key === 'pokedex:equipo' || evento.key === null) actualizarEquipo();
});
// Al volver con Atrás, la página puede restaurarse sin ejecutar otra vez el módulo.
window.addEventListener('pageshow', (evento) => {
  if (evento.persisted) {
    actualizarCapturados();
    actualizarEquipo();
  }
});

botonAgregar.addEventListener('click', async () => {
  const seleccionados = [...grilla.querySelectorAll('.captura__check:checked')];

  const idsSeleccionados = [...seleccionados].map((casilla) => {
    const tarjeta = casilla.closest('.captura');
    return Number(tarjeta.dataset.id);
  });

  const resultado = agregarAlEquipo(idsSeleccionados);
  nota.textContent = resultado.mensaje;
  if (resultado.ok) {
    const equipo = new Set(listaEquipo());
    seleccionados.forEach((casilla) => {
      if (equipo.has(Number(casilla.closest('.captura').dataset.id))) casilla.checked = false;
    });
    await actualizarEquipo();
  }
});

actualizarCapturados();
actualizarEquipo();
