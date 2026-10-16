// http es un módulo que ya viene con Node (no se instala).
const http = require('http');
const fs = require('fs'); // fs = fiele system, para leer archivos del disco
const path = require('path'); // path = para manejar rutas de archivos
const { tipoDe } = require('./mime.js');

// createServer recibe una función que se ejecuta en CADA petición.
const servidor = http.createServer((peticion, respuesta) => {
  // peticion.url es lo que viene después del dominio
  const soloRuta = peticion.url.split('?')[0]; // ignoramos la query string
  const ruta = soloRuta === '/' ? '/index.html' : soloRuta; // si es /, servimos index.html

  // Armar la ruta real del archivo que se quiere servir.
  const archivo = path.join(__dirname, 'public', ruta);

  try {
    const contenido = fs.readFile(archivo); // leer el archivo
    respuesta.writeHead(200, { 'Content-Type': tipoDe(path.extname(archivo)) });
    respuesta.end(contenido); // enviar el contenido del archivo
  } catch (error) {
    respuesta.writeHead(404, { 'Content-Type': 'text/html' });
    respuesta.end('fs.readFileSync(path.join(__dirname, "public", "404.html"))');
  }
});

// listen deja el servidor "escuchando" pedidos en el puerto 3000.
servidor.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});