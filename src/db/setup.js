const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Detectar si estamos en un entorno que requiere SSL
const isProduction = process.env.NODE_ENV === 'production' || 
                    (process.env.DB_HOST && process.env.DB_HOST.includes('render.com'));

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
  } : false
});

async function setupDatabase() {
  try {
    console.log('Iniciando configuración de la base de datos...');
    console.log('Conectando a:', process.env.DB_HOST);
    
    // Prueba simple de conexión
    await pool.query('SELECT 1');
    console.log('Conexión a la base de datos establecida correctamente');

    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    await pool.query(schemaSQL);
    
    console.log('¡Base de datos configurada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
    process.exit(1);
  }
}

setupDatabase();