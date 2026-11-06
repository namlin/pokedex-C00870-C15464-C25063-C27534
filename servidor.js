// SERVIDOR — arma la aplicación: configura el motor de plantillas, enchufa
// los middlewares, sirve lo estático, monta las rutas y queda escuchando.
// (Reemplaza al servidor.js de la clase de Node.)

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pokemonRutas from './rutas/pokemonRutas.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PUERTO = 3000;

// --- Plantillas: usamos EJS y las vistas viven en la carpeta vistas/ ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vistas'));

// --- Middlewares (corren para TODA petición, en este orden) ---
app.use((peticion, respuesta, siguiente) => {        // logger propio
  console.log(peticion.method, peticion.url);
  siguiente();
});
app.use(express.urlencoded({ extended: true }));     // lee los formularios (POST)
app.use(express.static(path.join(__dirname, 'public')));  // sirve public/

// --- Rutas: todo lo que empiece con /pokemon lo maneja ese router ---
// (La raíz "/" la sirve express.static con public/index.html: ese es el
//  sitio estático de siempre. La versión con plantillas vive en /pokemon.)
app.use('/pokemon', pokemonRutas);

// --- 404: si nadie respondió, no existe ---
app.use((peticion, respuesta) => {
  respuesta.status(404).render('404', { titulo: 'No encontrado' });
});

app.listen(PUERTO, () => {
  console.log('Servidor en http://localhost:' + PUERTO);
});
