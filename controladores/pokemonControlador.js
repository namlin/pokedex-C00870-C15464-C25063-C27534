// CONTROLADOR — el intermediario. Recibe la petición, le pide los datos al
// modelo y decide qué vista mostrar. No sabe de dónde salen los datos ni
// cómo se ve el HTML: solo coordina las dos cosas.

import * as modelo from '../modelos/pokedex.js';

// GET /pokemon  ->  la lista completa
export function listar(peticion, respuesta) {
  const pokemones = modelo.obtenerTodos();
  respuesta.render('lista', { titulo: 'Pokédex', pokemones });
}

// GET /pokemon/:id  ->  uno solo
export function ver(peticion, respuesta) {
  const id = Number(peticion.params.id);
  const pokemon = modelo.obtenerPorId(id);
  if (!pokemon) {
    respuesta.status(404).render('404', { titulo: 'No encontrado' });
    return;
  }
  respuesta.render('detalle', { titulo: pokemon.nombre, pokemon });
}

// POST /pokemon  ->  agrega uno (desde el formulario) y vuelve a la lista
export function crear(peticion, respuesta) {
  const nuevo = {
    id: Number(peticion.body.id),
    nombre: peticion.body.nombre,
    tipos: peticion.body.tipos.split(',').map((t) => t.trim()).filter(Boolean),
    descripcion: peticion.body.descripcion || '',
  };
  modelo.agregar(nuevo);
  respuesta.redirect('/pokemon');   // patrón "POST y redirigir"
}
