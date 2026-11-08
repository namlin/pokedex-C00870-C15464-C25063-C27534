// =============================================================
//  SERVIDOR — arma la app: motor de plantillas, middlewares, estáticos,
//  rutas y queda escuchando. Ahora además monta socket.io para la arena.
// =============================================================
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';          // NUEVO: servidor HTTP "crudo"
import { Server } from 'socket.io';                 // NUEVO: socket.io
import pokemonRutas from './rutas/pokemonRutas.js';
import { montarArena } from './sockets/arena.js'; // NUEVO: la lógica de la arena

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLICO = path.join(__dirname, 'public');
const app = express();
const PUERTO = 3000;

// --- Plantillas: EJS, y las vistas viven en vistas/ ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vistas'));

// --- Middlewares (para TODA petición, en este orden) ---
app.use((peticion, respuesta, siguiente) => {        // logger propio
  console.log(peticion.method, peticion.url);
  siguiente();
});
app.use(express.urlencoded({ extended: true }));     // lee el formulario de /agregar
app.use(express.static(PUBLICO));                    // css, js, imágenes, otras páginas

// --- Rutas del sitio (lista, ficha, agregar, crear, arena) ---
app.use('/', pokemonRutas);

// --- Páginas que siguen siendo estáticas (archivos .html), pero con URL
//     limpia. sendFile manda el archivo; si no existe, next() lo deja caer al 404. ---
function paginaEstatica(archivo) {
  return (peticion, respuesta, siguiente) => {
    respuesta.sendFile(archivo, { root: PUBLICO }, (error) => { if (error) siguiente(); });
  };
}
app.get('/acerca-de', paginaEstatica('acerca-de.html'));
app.get('/configuracion', paginaEstatica('configuracion.html'));

// --- Redirecciones de las URLs viejas a las nuevas, para no romper enlaces ---
app.get('/detalle.html', (peticion, respuesta) => {
  respuesta.redirect(301, '/pokemon/' + (peticion.query.id ?? ''));
});
app.get('/perfil-entrenador.html', (peticion, respuesta) => {
  respuesta.redirect(301, '/perfil-entrenador');
});

// --- 404: si nadie respondió, mostramos la página de "no encontrado" ---
app.use((peticion, respuesta) => {
  respuesta.status(404).render('404');
});

// --- socket.io necesita el servidor HTTP "crudo", no la app de Express
//     directamente. Por eso envolvemos la app con createServer, le colgamos
//     socket.io, y quien escucha es ESE servidor (no app.listen). ---
const servidorHttp = createServer(app);
const io = new Server(servidorHttp);
montarArena(io);                                    // toda la lógica vive en sockets/arena.js

servidorHttp.listen(PUERTO, () => {
  console.log('Servidor en http://localhost:' + PUERTO);
});
