// =============================================================
//  RUTAS — el mapa: cada método + dirección va a una función del controlador.
// =============================================================
import express from 'express';
import * as controlador from '../controladores/pokemonControlador.js';

const router = express.Router();

router.get('/', controlador.listar);                 // la lista
router.get('/pokemon/:id', controlador.ver);         // la ficha, con URL limpia: /pokemon/7
router.get('/api/pokemon', controlador.listarJson);  // los datos en JSON (los usa el perfil)
router.get('/agregar', controlador.formularioNuevo); // el formulario, en página aparte
router.post('/pokemon', controlador.crear);          // crea y redirige a la lista

router.get('/perfil-entrenador', (peticion, respuesta) => respuesta.render('perfil-entrenador'));

router.get('/perfil-equipo', (peticion, respuesta) => respuesta.render('perfil-equipo'));

router.get('/arena', (peticion, respuesta) => respuesta.render('arena'));

router.get('/memoria', (peticion, respuesta) => respuesta.render('memoria'));

export default router;
