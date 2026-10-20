const CLAVE = 'pokedex:capturados';

// Lee del localStorage y devuelve un Set de ids (sin repetidos).
function leer() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE)) ?? []);
  } catch {
    return new Set();   // si algo falla (modo privado, etc.), arrancamos vacío
  }
}

// Guarda el Set en localStorage (como texto JSON).
function escribir(conjunto) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...conjunto]));
  } catch { /* si no se puede guardar, seguimos sin romper */ }
}

export function estaCapturado(id) {
  return leer().has(id);
}

// Si estaba, lo quita; si no, lo agrega. Devuelve el estado nuevo (true = capturado).
export function alternarCaptura(id) {
  const capturados = leer();
  if (capturados.has(id)) {
    capturados.delete(id);
  } else {
    capturados.add(id);
  }
  escribir(capturados);
  return capturados.has(id);
}

export function listaCapturados() {
  return [...leer()];
}