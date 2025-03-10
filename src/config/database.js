const { Pool } = require('pg');
require('dotenv').config();

// Detectar si estamos en un entorno que requiere SSL
const isProduction = process.env.NODE_ENV === 'production' || 
                    (process.env.DB_HOST && process.env.DB_HOST.includes('render.com'));

// Configuración del pool de conexiones
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Configuración de SSL según el entorno
  ssl: isProduction ? {
    require: true,
    rejectUnauthorized: false
  } : false,
  connectionTimeoutMillis: 5000,  // 5 segundos para timeout al conectar
  idleTimeoutMillis: 30000,       // 30 segundos antes de cerrar conexiones inactivas
  max: 10                         // Máximo de 10 clientes en el pool
});

// Función de consulta con reintentos automáticos
const queryWithRetry = async (text, params, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      retries++;
      console.log(`Intento ${retries}/${maxRetries} falló. Error: ${err.message}`);
      
      if (retries >= maxRetries || !(err.message.includes('ECONNRESET') || err.message.includes('Connection terminated'))) {
        throw err;
      }
      
      // Espera exponencial entre reintentos
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
    }
  }
};

// Helper para trabajar con conexiones individuales y asegurar su liberación
async function withClient(callback) {
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

// Evento para manejar errores en el pool
pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente del pool PostgreSQL:', err);
});

// Mantener la conexión activa con un ping cada 5 minutos
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Ping a la base de datos exitoso');
  } catch (err) {
    console.error('Error en ping periódico:', err);
  }
}, 5 * 60 * 1000);

// Código de prueba de contraseña
const bcrypt = require('bcrypt');
const plainPassword = 'admin123';
const storedHash = '$2b$10$XW4plBGI93xHgFWjyB7X7.3xHD/dCmbdCYYpj9rZUVLtbQ9mV3iyW';

bcrypt.compare(plainPassword, storedHash, (err, result) => {
    if (err) {
        console.error('Error al comparar:', err);
        return;
    }

    if (result) {
        console.log('La contraseña es correcta.');
    } else {
        console.log('La contraseña es incorrecta.');
    }
});

// Exportar las funciones y el pool
module.exports = {
  query: (text, params) => queryWithRetry(text, params),
  withClient,
  pool
};