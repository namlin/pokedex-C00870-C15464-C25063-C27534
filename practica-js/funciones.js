// Ejercicios 1 a 5 — se corren con:  node funciones.js
// Cada función se escribe acá; los console.log se descomentan para probar.

// 1) Contador con memoria
//    crearContador() devuelve una función; cada llamada sube 1 (1, 2, 3...)
// console.log(c(), c(), c());   // 1 2 3

// 2) Saludo configurable
//    crearSaludo('Hola') devuelve una función que recibe un nombre
// console.log(crearSaludo('Hola')('Mari'));   // Hola, Mari

// Arreglo de productos para los ejercicios 3, 4 y 5:
const productos = [
  { nombre: 'Cuaderno',  precio: 500,  categoria: 'papelería'  },
  { nombre: 'Audífonos', precio: 1200, categoria: 'tecnología' },
  { nombre: 'Lapicero',  precio: 300,  categoria: 'papelería'  },
  { nombre: 'Teclado',   precio: 2000, categoria: 'tecnología' },
];

// 3) Lo caro del carrito: sumar el precio de los que cuestan más de 1000
// console.log(total);   // 3200

// 4) Fábrica de descuentos: crearDescuento(50) devuelve una función que resta ese %
// console.log(crearDescuento(50)(1000));   // 500

// 5) Agrupar por categoría: { papelería: [...], tecnología: [...] }
// console.log(porCategoria);

// El código va aquí 👇
