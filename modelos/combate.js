// =============================================================
//  modelos/combate.js  —  el MOTOR del combate de la Arena. Vive en el
//  servidor (el árbitro). Ya no busca datos en datos.js: recibe el Pokémon
//  ya resuelto (la ficha que viene del modelo, que la trajo de la PokéAPI).
//  Usa la misma regla de daño del combate local (un cuarto del ataque).
// =============================================================

export class Combate {
  // jugadorA y jugadorB son { socketId, pokemon }, donde pokemon es una ficha
  // del modelo (con nombre, slug y stats).
  constructor(jugadorA, jugadorB) {
    this.jugadores = {
      [jugadorA.socketId]: this.crearLado(jugadorA),
      [jugadorB.socketId]: this.crearLado(jugadorB),
    };
    this.turnoDe = jugadorA.socketId;
    this.terminado = false;
    this.ganador = null;
  }

  // Arma el "lado" de un jugador a partir de su ficha. Doble de PS para que
  // el combate dure unos turnos.
  crearLado({ socketId, pokemon }) {
    return {
      socketId,
      pokemon: {
        id: pokemon.id,
        nombre: pokemon.nombre,
        slug: pokemon.slug,
        ataque: pokemon.stats.ataque,
        hpMax: pokemon.stats.hp * 2,
        hp: pokemon.stats.hp * 2,
      },
    };
  }

  rivalDe(socketId) {
    return Object.keys(this.jugadores).find((id) => id !== socketId);
  }

  atacar(socketId) {
    if (this.terminado) throw new Error('El combate ya terminó');
    if (socketId !== this.turnoDe) throw new Error('No es tu turno');

    const atacante = this.jugadores[socketId].pokemon;
    const defensor = this.jugadores[this.rivalDe(socketId)].pokemon;

    const dano = Math.max(1, Math.round(atacante.ataque / 4));
    defensor.hp = Math.max(0, defensor.hp - dano);

    let evento = `${atacante.nombre} atacó a ${defensor.nombre} (-${dano}).`;
    if (defensor.hp === 0) {
      this.terminado = true;
      this.ganador = socketId;
      evento += ` ¡Cayó ${defensor.nombre}! Ganó ${atacante.nombre}.`;
    } else {
      this.turnoDe = this.rivalDe(socketId);
    }
    return evento;
  }

  estado() {
    const lados = {};
    for (const [id, lado] of Object.entries(this.jugadores)) {
      lados[id] = { pokemon: lado.pokemon };
    }
    return { lados, turnoDe: this.turnoDe, terminado: this.terminado, ganador: this.ganador };
  }
}
