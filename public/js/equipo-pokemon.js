import { listaCapturados } from './capturados.js';

const CLAVE = 'pokedex:equipo';
export const MAX_EQUIPO = 6;

// Lee del localStorage y devuelve un Set de ids (sin repetidos).
function leer() {
  const datos = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
  
  // Evita reemplazar información guardada con un formato incorrecto.
  if (
    !Array.isArray(datos) ||
    datos.some((id) => !Number.isInteger(id) || id <= 0) ||
    new Set(datos).size > MAX_EQUIPO
  ) {
    throw new Error('El equipo guardado no tiene un formato válido.');
  }

  return new Set(datos);
}

// Guarda el Set en localStorage (como texto JSON).
function escribir(conjunto) {
  localStorage.setItem(CLAVE, JSON.stringify([...conjunto]));  
}

export function listaEquipo() {
  return [...leer()];
}

// Añade los seleccionados al equipo, si hay espacio.
export function agregarAlEquipo(ids) {
  try {
    const seleccionados = new Set(ids);

    if (seleccionados.size === 0) {
      return { ok: false, mensaje: 'Seleccione al menos un Pokémon para agregar.' };
    }

    const capturados = new Set(listaCapturados());
    if ([...seleccionados].some((id) => !Number.isInteger(id) || id <= 0 || !capturados.has(id))) {
      return { ok: false, mensaje: 'Solo se pueden agregar Pokémon que ya hayas capturado.' };
    }

    const equipo = leer();
    const nuevos = [...seleccionados].filter((id) => !equipo.has(id));
    const disponibles = MAX_EQUIPO - equipo.size;
    if (nuevos.length > 0 && disponibles === 0) {
      return { ok: false, mensaje: `Solo puedes tener ${MAX_EQUIPO} Pokémon en el equipo.` };
    }

    const agregados = Math.min(nuevos.length, disponibles);
    if (agregados === 0) {
      return { ok: true, mensaje: 'Los Pokémon seleccionados ya están en tu equipo.' };
    }

    nuevos.slice(0, disponibles).forEach((id) => equipo.add(id));
    escribir(equipo);

    const mensaje = agregados === 1
      ? 'Se agregó 1 Pokémon a tu equipo.'
      : `Se agregaron ${agregados} Pokémon al equipo.`;
    const omitidos = nuevos.length - agregados;

    return { 
      ok: true,
      mensaje: omitidos > 0
        ? `${mensaje} No se agregaron ${omitidos}: el equipo admite un máximo de ${MAX_EQUIPO} Pokémon.`
        : mensaje
    };
    
  } catch {
    return { ok: false, mensaje: 'No se pudo guardar el equipo.' };
  }
}

// Elimina un Pokémon del equipo.
export function quitarDelEquipo(id) {
  try {
    // Se obtienen los atributos data-id del HTML.
    const pokemonId = Number(id);

    if (!Number.isInteger(pokemonId) || pokemonId <= 0) {
      return { ok: false, mensaje: 'El identificador del Pokémon no es válido.' };
    }

    const equipo = leer();
    const eliminado = equipo.delete(pokemonId); // delete devuelve true si encontró y eliminó el ID del Set.

    if (!eliminado) {
      return { ok: false, mensaje: 'Ese Pokémon no está en tu equipo.'};
    }

    escribir(equipo);

    return { ok: true, mensaje: 'Se quitó el Pokémon de tu equipo.' };

  } catch {
    return {
      ok: false,
      mensaje: 'No se pudo guardar el cambio en el equipo.'
    };
  }
}
