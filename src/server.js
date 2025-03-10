const app = require('./app');
require('dotenv').config();
const { pool } = require('./config/database');

console.log('Iniciando servidor...');

// Ejecuta primero el script de configuración para Render (si no se ha hecho desde el archivo raíz)
try {
  require('./render-setup');
  console.log('Script de configuración para Render ejecutado correctamente');
} catch (error) {
  console.error('Error al ejecutar el script de configuración para Render:', error.message);
}

// Prueba inicial de conexión a la base de datos
pool.query('SELECT 1')
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente');
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    console.error('Detalles de la conexión:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      // No mostramos la contraseña por seguridad
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('render.com')
    });
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});
