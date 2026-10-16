// =============================================================
//  combate.js  —  Una máquina de estados: un combate por turnos.
//  Extra opcional, pensado para conectar con el proyecto Arcade.
//  Usa los datos reales de la Pokédex (datos.js).
// =============================================================
import { buscarPorId } from './datos.js';

// La tabla de transiciones es el corazón de la máquina de estados:
// dice, para cada estado, qué evento lleva a qué estado nuevo.
// Lo que no esté en la tabla, no se permite.
const transiciones = {
  esperando:  { atacar: 'resolviendo' },
  resolviendo: { seguir: 'esperando', terminar: 'terminado' },
  terminado:  {},
};

export class Combate {
  #estado = 'esperando';

  constructor(idA, idB) {
    const a = buscarPorId(idA);
    const b = buscarPorId(idB);
    // Cada peleador: su nombre, su ataque y la vida que le va quedando
    this.a = { nombre: a.nombre, ataque: a.stats.ataque, hp: a.stats.hp };
    this.b = { nombre: b.nombre, ataque: b.stats.ataque, hp: b.stats.hp };
    this.turnoDe = this.a;   // empieza el primero
  }

  get estado() { return this.#estado; }

  // Único camino para cambiar de estado: pasar por aquí.
  #mover(evento) {
    const siguiente = transiciones[this.#estado][evento];
    if (!siguiente) {
      throw new Error(`No se puede "${evento}" estando en "${this.#estado}"`);
    }
    this.#estado = siguiente;
  }

  atacar() {
    this.#mover('atacar');                 // esperando -> resolviendo
    const quienAtaca = this.turnoDe;
    const quienRecibe = quienAtaca === this.a ? this.b : this.a;

    // El golpe hace una parte del ataque, para que el combate dure varios turnos
    const dano = Math.max(1, Math.round(quienAtaca.ataque / 4));
    quienRecibe.hp = Math.max(0, quienRecibe.hp - dano);
    const linea = `${quienAtaca.nombre} le pega a ${quienRecibe.nombre} (-${dano}, le quedan ${quienRecibe.hp} HP)`;

    if (quienRecibe.hp === 0) {
      this.#mover('terminar');             // resolviendo -> terminado
      this.ganador = quienAtaca.nombre;
      return `${linea}. ¡${quienAtaca.nombre} gana!`;
    }

    this.#mover('seguir');                 // resolviendo -> esperando
    this.turnoDe = quienRecibe;            // le toca al otro
    return linea;
  }
}