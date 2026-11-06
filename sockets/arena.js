// =============================================================
//  sockets/arena.js  —  la lógica de tiempo real de la Arena.
//  Los datos de los Pokémon salen del MODELO (que los trae de la PokéAPI),
//  no de datos.js. Como el modelo es asíncrono, acá se usa async/await.
// =============================================================
import { Combate } from '../modelos/combate.js';
import * as modelo from '../modelos/pokedex.js';

// Los Pokémon que se pueden usar en la Arena (los iniciales + Pikachu).
const ELEGIBLES = [1, 4, 7, 25];

export function montarArena(io) {
  let esperando = null;              // { socketId, pokemonId } | null
  const elegidos = new Map();        // socketId -> pokemonId (los tomados)
  const combatePorSala = new Map();  // sala -> Combate

  // Los Pokémon que todavía se pueden elegir. Pide la lista al modelo (API)
  // y le quita los que ya están tomados.
  async function disponibles() {
    const tomados = new Set(elegidos.values());
    const todos = await modelo.obtenerTodos();
    return todos
      .filter((p) => ELEGIBLES.includes(p.id) && !tomados.has(p.id))
      .map((p) => ({ id: p.id, nombre: p.nombre, slug: p.slug }));
  }

  async function liberarSala(sala) {
    const combate = combatePorSala.get(sala);
    if (combate) {
      for (const id of Object.keys(combate.jugadores)) elegidos.delete(id);
    }
    combatePorSala.delete(sala);
    io.emit('disponibles', await disponibles());
  }

  io.on('connection', async (socket) => {
    socket.emit('disponibles', await disponibles());

    socket.on('elegir', async (pokemonId) => {
      const tomados = new Set(elegidos.values());
      if (tomados.has(pokemonId)) { socket.emit('ocupado'); return; }

      elegidos.set(socket.id, pokemonId);
      io.emit('disponibles', await disponibles());

      const rival = esperando && io.sockets.sockets.get(esperando.socketId);
      if (rival && esperando.socketId !== socket.id) {
        const sala = 'sala-' + esperando.socketId + '-' + socket.id;
        // Pedimos las dos fichas al modelo y se las pasamos al combate.
        const [pokeA, pokeB] = await Promise.all([
          modelo.buscarPorId(esperando.pokemonId),
          modelo.buscarPorId(pokemonId),
        ]);
        const combate = new Combate(
          { socketId: esperando.socketId, pokemon: pokeA },
          { socketId: socket.id, pokemon: pokeB },
        );
        combatePorSala.set(sala, combate);

        rival.join(sala); socket.join(sala);
        rival.data.sala = sala; socket.data.sala = sala;

        io.to(sala).emit('partida-lista', combate.estado());
        esperando = null;
      } else {
        esperando = { socketId: socket.id, pokemonId };
        socket.emit('esperando');
      }
    });

    socket.on('atacar', async () => {
      const combate = combatePorSala.get(socket.data.sala);
      if (!combate) return;
      try {
        const evento = combate.atacar(socket.id);
        io.to(socket.data.sala).emit('estado', { ...combate.estado(), evento });
        if (combate.terminado) await liberarSala(socket.data.sala);
      } catch (error) {
        socket.emit('aviso', error.message);
      }
    });

    socket.on('disconnect', async () => {
      if (esperando?.socketId === socket.id) esperando = null;
      elegidos.delete(socket.id);
      const sala = socket.data.sala;
      if (sala) {
        socket.to(sala).emit('rival-se-fue');
        await liberarSala(sala);
      }
      io.emit('disponibles', await disponibles());
    });
  });
}
