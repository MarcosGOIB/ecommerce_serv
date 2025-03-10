// Este archivo sirve como punto de entrada para Render
// Simplemente importa y ejecuta el server.js dentro de src

// Ejecutar el script de configuración para Render primero
require('./src/render-setup');

// Importar y ejecutar el servidor principal
require('./src/server');

console.log('Servidor iniciado desde el archivo raíz');
