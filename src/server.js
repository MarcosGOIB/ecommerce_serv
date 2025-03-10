const app = require('./app');
require('dotenv').config();
const { pool } = require('./config/database');

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