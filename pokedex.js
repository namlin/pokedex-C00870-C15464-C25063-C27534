const pokedex = [
  { id: 25, nombre: 'Pikachu', tipos: ['eléctrico'], hp: 35, ataque: 55, defensa: 40, velocidad: 90 },
  { id: 1, nombre: 'Bulbasaur', tipos: ['planta', 'veneno'], hp: 45, ataque: 49, defensa: 49, velocidad: 45 },
  { id: 2, nombre: 'Ivysaur', tipos: ['planta', 'veneno'], hp: 60, ataque: 62, defensa: 63, velocidad: 60 },
  { id: 3, nombre: 'Venusaur', tipos: ['planta', 'veneno'], hp: 80, ataque: 82, defensa: 83, velocidad: 80 },
  { id: 4, nombre: 'Charmander', tipos: ['fuego'], hp: 39, ataque: 52, defensa: 43, velocidad: 65 },
  { id: 5, nombre: 'Charmeleon', tipos: ['fuego'], hp: 58, ataque: 64, defensa: 58, velocidad: 80 },
  { id: 6, nombre: 'Charizard', tipos: ['fuego', 'volador'], hp: 78, ataque: 84, defensa: 78, velocidad: 100 },
  { id: 7, nombre: 'Squirtle', tipos: ['agua'], hp: 44, ataque: 48, defensa: 65, velocidad: 43 },
  { id: 8, nombre: 'Wartortle', tipos: ['agua'], hp: 59, ataque: 63, defensa: 80, velocidad: 58 },
  { id: 9, nombre: 'Blastoise', tipos: ['agua'], hp: 79, ataque: 83, defensa: 100, velocidad: 78 },
];

console.log(pokedex.length);
console.log(pokedex[0].nombre);

function describir(pokemon) {
  return pokemon.nombre + ' #' + pokemon.id + ' (' + pokemon.tipos.join('/') + ')';
}

console.log(describir(pokedex[0]));
console.log(describir(pokedex[1]));

const alias = describir;
console.log(alias(pokedex[2]));
console.log(typeof describir);
console.log(describir.length);   // cantidad de parámetros
console.log(describir.name);

const fuertes = pokedex.filter((p) => p.ataque > 80);
console.log(fuertes.length);
console.log(fuertes[0].nombre);
console.log(fuertes[1].nombre);
console.log(fuertes[2].nombre);

const nombres = pokedex.map((p) => p.nombre);
console.log(nombres);

const hps = pokedex.map((p) => p.hp);
console.log(hps);

console.log(fuertes.map((p) => p.nombre));

const totalHp = pokedex.reduce((suma, p) => suma + p.hp, 0);
console.log(totalHp);

const mayorAtaque = pokedex.reduce((mayor, p) => (p.ataque > mayor.ataque ? p : mayor));
console.log(mayorAtaque.nombre);

const rapidos = [...pokedex]
  .sort((a, b) => b.velocidad - a.velocidad)
  .slice(0, 2)
  .map((p) => p.nombre);
console.log(rapidos);
console.log(pokedex[0].nombre);

function crearPokemon(nombre, hp = 50) {
  return { nombre, hp };
}
console.log(crearPokemon('Rattata'));
console.log(crearPokemon('Pidgey', 40));
console.log(crearPokemon.length);   // los parámetros con valor por defecto no cuentan

function sumarHp(...pokemones) {
  return pokemones.reduce((s, p) => s + p.hp, 0);
}
console.log(sumarHp(...pokedex.slice(0, 3)));

function crearContador() {
  let capturados = 0;
  return () => ++capturados;
}

const capturar = crearContador();
console.log(capturar());
console.log(capturar());
console.log(capturar());

console.log('pikachu'.toUpperCase());
console.log('pikachu'.length);

const a = new Boolean(false);
console.log(typeof a);
if (a) console.log('un objeto Boolean(false) es truthy');

// Dos Pokémon escritos a mano, cada uno con su propio método
const p1 = {
  nombre: 'Pikachu', hp: 35,
  saludar() { return '¡' + this.nombre + '!'; },
};
const p2 = {
  nombre: 'Charmander', hp: 39,
  saludar() { return '¡' + this.nombre + '!'; },
};

console.log(p1.saludar(), p2.saludar());
console.log(p1.saludar === p2.saludar);   // ¿es la misma función?

// Una función que fabrica objetos. Se llama con new.
function Criatura(nombre, hp) {
  this.nombre = nombre;
  this.hp = hp;
  this.saludar = function () {
    return '¡' + this.nombre + '!';
  };
}

const c1 = new Criatura('Pikachu', 35);
const c2 = new Criatura('Charmander', 39);
console.log(c1.saludar(), c2.saludar());
console.log(c1 instanceof Criatura);
console.log(c1.saludar === c2.saludar);   // sigue siendo una copia por objeto

// Ahora saludar se escribe una sola vez, fuera de la fábrica
function Pokemon2(nombre, hp) {
  this.nombre = nombre;
  this.hp = hp;
}
Pokemon2.prototype.saludar = function () {
  return '¡' + this.nombre + '!';
};

const d1 = new Pokemon2('Squirtle', 44);
const d2 = new Pokemon2('Bulbasaur', 45);
console.log(d1.saludar(), d2.saludar());
console.log(d1.saludar === d2.saludar);   // ahora sí es la misma función

console.log(Object.getPrototypeOf(d1) === Pokemon2.prototype);   // su manual
console.log(Object.hasOwn(d1, 'nombre'));      // ¿lo tiene él mismo?
console.log(Object.hasOwn(d1, 'saludar'));     // ¿lo tiene él mismo?
console.log('saludar' in d1);                  // ¿lo puede usar?
console.log(Object.getPrototypeOf(Pokemon2.prototype) === Object.prototype);
console.log(Object.getPrototypeOf(Object.prototype));

// new, escrito a mano en tres líneas
function miNew(Constructora, ...argumentos) {
  const objeto = Object.create(Constructora.prototype);   // 1
  const resultado = Constructora.apply(objeto, argumentos); // 2
  return (resultado !== null && typeof resultado === 'object') ? resultado : objeto; // 3
}

const m = miNew(Pokemon2, 'Charizard', 78);
console.log(m.saludar());
console.log(m instanceof Pokemon2);

class Pokemon {
  static total = 0;
  #hp;

  constructor(nombre, hp) {
    this.nombre = nombre;
    this.#hp = hp;
    Pokemon.total++;
  }

  get hp() { return this.#hp; }
  get debilitado() { return this.#hp === 0; }

  recibirDanio(cantidad) {
    this.#hp = Math.max(0, this.#hp - cantidad);
    return this;
  }

  saludar() { return '¡' + this.nombre + '!'; }
  toString() { return this.nombre + ' (' + this.#hp + ' HP)'; }
}

const bulba = new Pokemon('Bulbasaur', 45);
const charmander = new Pokemon('Charmander', 39);
console.log(bulba.saludar());
console.log(String(bulba));
bulba.recibirDanio(20);
console.log(bulba.hp);
bulba.recibirDanio(100);
console.log(bulba.debilitado);
console.log(Pokemon.total);
console.log(typeof Pokemon);

class Electrico extends Pokemon {
  constructor(nombre, hp) {
    super(nombre, hp);
    this.tipo = 'eléctrico';
  }
  impactrueno(objetivo) {
    objetivo.recibirDanio(30);
    return this.nombre + ' usa Impactrueno';
  }
}

const pikachu = new Electrico('Pikachu', 35);
console.log(pikachu.impactrueno(charmander));
console.log(charmander.hp);
console.log(pikachu instanceof Pokemon);
console.log(pikachu.saludar());

class Entrenador {
  static LIMITE = 6;
  equipo = [];

  constructor(nombre) { this.nombre = nombre; }
  get tamano() { return this.equipo.length; }

  agregar(pokemon) {
    if (this.tamano >= Entrenador.LIMITE) throw new Error('El equipo está lleno');
    this.equipo.push(pokemon);
    return this;
  }
}

const ash = new Entrenador('Ash');
ash.agregar(charmander).agregar(pikachu);
console.log(ash.tamano);
try {
  for (let i = 0; i < 5; i++) ash.agregar(new Pokemon('Rattata' + i, 30));
} catch (e) {
  console.log(e.message);
}
console.log(ash.tamano);

const transiciones = {
  esperando: { elegirAtaque: 'atacando' },
  atacando: { golpe: 'esperando', debilitado: 'terminado' },
  terminado: {},
};

class Combate {
  #estado = 'esperando';
  get estado() { return this.#estado; }

  enviar(evento) {
    const siguiente = transiciones[this.#estado][evento];
    if (!siguiente) {
      throw new Error(`"${evento}" no es válido en el estado "${this.#estado}"`);
    }
    this.#estado = siguiente;
    return this;
  }
}

const combate = new Combate();
console.log(combate.estado);
combate.enviar('elegirAtaque');
console.log(combate.estado);
try {
  combate.enviar('elegirAtaque');
} catch (e) {
  console.log(e.message);
}
combate.enviar('golpe').enviar('elegirAtaque').enviar('debilitado');
console.log(combate.estado);