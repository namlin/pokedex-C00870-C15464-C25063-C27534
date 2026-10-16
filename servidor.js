// http es un módulo que ya viene con Node (no se instala).
const http = require('http');

// createServer recibe una función que se ejecuta en CADA petición.
const servidor = http.createServer((peticion, respuesta) => {
  respuesta.end('¡Hola desde Node!');
});

// listen deja el servidor "escuchando" pedidos en el puerto 3000.
servidor.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});