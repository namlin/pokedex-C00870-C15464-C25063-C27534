// =============================================================
//  lista.js  —  Genera la lista de la Pokédex desde los datos
//  y hace funcionar el buscador. Ya no hay <li> escritos a mano.
// =============================================================
import { pokedex, numeroPokedex } from './datos.js';
import { estaCapturado, alternarCaptura } from './capturados.js';

const lista = document.querySelector('.pokemon-list');
const form = document.querySelector('#buscador form');
const contador = document.querySelector('.contador');

// Quita acentos y pasa a minúscula, para comparar "eléctrico" con "electrico"
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Crea la tarjeta (un <li>) de un Pokémon
function crearTarjeta(pokemon) {
  const li = document.createElement('li');
  li.className = 'pokemon-card';

  const a = document.createElement('a');
  a.className = 'pokemon-card__link';
  a.href = `detalle.html?id=${pokemon.id}`;   // una sola ficha, el id va en la URL

  const img = document.createElement('img');
  img.className = 'pokemon-card__image';
  img.src = `assets/${pokemon.slug}.png`;
  img.alt = pokemon.nombre;
  img.width = 96;
  img.height = 96;

  const numero = document.createElement('span');
  numero.className = 'pokemon-card__number';
  numero.textContent = numeroPokedex(pokemon.id);

  const nombre = document.createElement('span');
  nombre.className = 'pokemon-card__name';
  nombre.textContent = pokemon.nombre;

  a.append(img, numero, nombre);
  li.append(a);

  // Botón de captura: va en el <li>, FUERA del enlace, para que no navegue.
  const btnCaptura = document.createElement('button');
  btnCaptura.type = 'button';
  btnCaptura.className = 'captura-btn';
  pintarBoton(btnCaptura, estaCapturado(pokemon.id));
  if (estaCapturado(pokemon.id)) li.classList.add('pokemon-card--capturado');

  btnCaptura.addEventListener('click', () => {
    const ahora = alternarCaptura(pokemon.id);   // guarda en localStorage
    li.classList.toggle('pokemon-card--capturado', ahora);
    pintarBoton(btnCaptura, ahora);
  });

  li.append(btnCaptura);
  return li;
}

// Aplica los filtros del formulario y devuelve la lista ya filtrada y ordenada
function aplicarFiltros() {
  const datos = new FormData(form);
  const texto = normalizar(datos.get('nombre') ?? '');
  const tipo = datos.get('tipo') ?? '';
  const orden = datos.get('orden') ?? 'numero-asc';
  const soloCapturados = datos.get('solo-capturados') === 'si';
  const etapa = datos.get('etapa') ?? 'todas';

  let resultado = pokedex.filter((p) => {
    if (texto && !normalizar(p.nombre).includes(texto)) return false;
    if (tipo && !p.tipos.map(normalizar).includes(normalizar(tipo))) return false;
    if (soloCapturados && !p.capturado) return false;
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
  resultado.sort(ordenadores[orden] ?? ordenadores['numero-asc']);
  return resultado;
}

// Dibuja la lista en pantalla
function dibujar() {
  const resultado = aplicarFiltros();
  lista.replaceChildren();                       // vaciar lo anterior
  for (const pokemon of resultado) {
    lista.append(crearTarjeta(pokemon));         // agregar cada tarjeta
  }
  if (contador) {
    contador.textContent = `${resultado.length} Pokémon`;
  }
  if (resultado.length === 0) {
    const vacio = document.createElement('p');
    vacio.textContent = 'Ningún Pokémon coincide con la búsqueda.';
    lista.append(vacio);
  }
}

// El formulario ya no recarga la página: lo maneja JavaScript
form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  dibujar();
});
// Y además filtra en vivo mientras se escribe o se cambia una opción
form.addEventListener('input', dibujar);

dibujar();   // primer dibujado al cargar

// Pone el texto y el estado del botón de captura
function pintarBoton(boton, capturado) {
  boton.textContent = capturado ? '✓ Capturado' : 'Capturar';
  boton.setAttribute('aria-pressed', capturado);
}