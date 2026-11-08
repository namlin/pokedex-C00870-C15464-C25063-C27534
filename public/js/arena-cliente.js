// =============================================================
//  arena-cliente.js  —  la parte del arena que corre en el navegador.
//  No decide NADA del combate: manda eventos ('elegir', 'atacar') y
//  DIBUJA lo que el servidor contesta. El servidor es el árbitro.
// =============================================================

// io() viene de /socket.io/socket.io.js (el <script> del arena.ejs).
const socket = io();
let miId = null;

const lobby       = document.querySelector('#lobby');
const lobbyTexto  = document.querySelector('#lobby-texto');
const ulDisp      = document.querySelector('#disponibles');
const arena       = document.querySelector('#arena');
const botonAtacar = document.querySelector('#atacar');
const aviso       = document.querySelector('#aviso');
const log         = document.querySelector('#log');

socket.on('connect', () => { miId = socket.id; });

// --- Lobby en tiempo real ---
// El servidor manda la lista de disponibles al entrar y CADA VEZ que
// alguien elige o se va. Por eso, cuando otra persona agarra un Pokémon,
// desaparece de esta lista sin que recarguemos nada.
socket.on('disponibles', (lista) => {
  ulDisp.innerHTML = lista.map((p) => `
    <li>
      <button class="arena-pick" data-id="${p.id}">
        <span class="arena-pick__sprite"><img src="/assets/${p.slug}.png" alt="${p.nombre}" width="96" height="96"></span>
        <span class="arena-pick__nombre">${p.nombre}</span>
      </button>
    </li>`).join('');

  ulDisp.querySelectorAll('.arena-pick').forEach((boton) => {
    boton.addEventListener('click', () => {
      socket.emit('elegir', Number(boton.dataset.id));
      lobbyTexto.textContent = 'Listo, buscando rival…';
      ulDisp.querySelectorAll('.arena-pick').forEach((b) => { b.disabled = true; });
    });
  });
});

socket.on('esperando', () => mostrarAviso('Esperando rival…'));
socket.on('ocupado', () => mostrarAviso('Ese Pokémon ya lo agarraron, elegí otro.'));

// --- Empezó la partida ---
socket.on('partida-lista', (estado) => {
  lobby.hidden = true;
  arena.hidden = false;
  botonAtacar.hidden = false;
  aviso.hidden = true;
  dibujar(estado);
});

// --- Cada ataque: llega el estado nuevo a los dos ---
socket.on('estado', (estado) => {
  dibujar(estado);
  if (estado.evento) log.textContent = estado.evento;
  if (estado.terminado) {
    botonAtacar.hidden = true;
    mostrarAviso(estado.ganador === miId ? '¡Ganaste! 🎉' : 'Perdiste 😵');
  }
});

socket.on('aviso', (texto) => mostrarAviso(texto));
socket.on('rival-se-fue', () => {
  botonAtacar.hidden = true;
  mostrarAviso('Tu rival se desconectó.');
});

// --- Atacar: solo manda el evento ---
botonAtacar.addEventListener('click', () => socket.emit('atacar'));

// --- Dibujar ---
function dibujar(estado) {
  const yo      = estado.lados[miId].pokemon;
  const rivalId = Object.keys(estado.lados).find((id) => id !== miId);
  const rival   = estado.lados[rivalId].pokemon;

  pintarLado('yo', yo);
  pintarLado('rival', rival);

  const miTurno = estado.turnoDe === miId && !estado.terminado;
  botonAtacar.disabled = !miTurno;
  if (!estado.terminado) mostrarAviso(miTurno ? 'Tu turno' : 'Turno del rival');
}

function pintarLado(lado, pokemon) {
  const img = document.querySelector(`#${lado}-img`);
  img.src = `/assets/${pokemon.slug}-grande.png`;   // la ilustración grande para la arena
  img.alt = pokemon.nombre;
  document.querySelector(`#${lado}-nombre`).textContent = pokemon.nombre;
  const barra = document.querySelector(`#${lado}-hp`);
  barra.style.width = Math.round((pokemon.hp / pokemon.hpMax) * 100) + '%';
  barra.textContent = pokemon.hp + ' / ' + pokemon.hpMax;
}

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.hidden = false;
}
