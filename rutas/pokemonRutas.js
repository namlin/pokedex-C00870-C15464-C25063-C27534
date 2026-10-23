// RUTAS — el "mapa": conecta cada método + dirección con una función del
// controlador. Acá se ve clarito el enrutamiento por método HTTP.

import express from 'express';
import * as controlador from '../controladores/pokemonControlador.js';

const router = express.Router();

router.get('/', controlador.listar);    // GET  /pokemon
router.get('/:id', controlador.ver);    // GET  /pokemon/:id
router.post('/', controlador.crear);    // POST /pokemon

export default router;
