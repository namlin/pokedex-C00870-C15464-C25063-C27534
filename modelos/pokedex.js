// MODELO — es el dueño de los datos. Nadie más toca el arreglo directamente:
// si mañana esto fuera una base de datos, solo cambiaría este archivo y el
// resto de la app (controlador, vistas) ni se enteraría.

const pokedex = [
  { id: 1,  nombre: 'Bulbasaur',  tipos: ['planta', 'veneno'], descripcion: 'Una semilla crece en su lomo desde que nace.' },
  { id: 4,  nombre: 'Charmander', tipos: ['fuego'],            descripcion: 'La llama de su cola mide cómo se siente.' },
  { id: 7,  nombre: 'Squirtle',   tipos: ['agua'],             descripcion: 'Su caparazón lo protege y lo hace más aerodinámico.' },
  { id: 25, nombre: 'Pikachu',    tipos: ['eléctrico'],        descripcion: 'Guarda electricidad en sus mejillas.' },
];

export function obtenerTodos() {
  return pokedex;
}

export function obtenerPorId(id) {
  return pokedex.find((p) => p.id === id);
}

export function agregar(pokemon) {
  pokedex.push(pokemon);
  return pokemon;
}
