const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');


const envPaths = [
  path.join(__dirname, '../../.env'),      
  path.join(__dirname, '../../../.env'),   
  path.join(__dirname, '../.env'),         
  '.env'                                   
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`Archivo .env cargado desde: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('No se encontró el archivo .env en ninguna ruta esperada.');
  console.warn('Asegúrate de que el archivo .env existe en la raíz del proyecto.');
  process.exit(1);
}


const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Variables de entorno faltantes: ${missingEnvVars.join(', ')}`);
  console.error('Asegúrate de que todas las variables requeridas estén definidas en el archivo .env');
  process.exit(1);
}


const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function updateDatabase() {
  try {
    console.log('Iniciando actualización de la base de datos...');
    console.log(`Conectando a ${process.env.DB_NAME} como ${process.env.DB_USER}@${process.env.DB_HOST}`);
    
    
    const updateSQL = `
      -- Modificar la tabla de productos para agregar campos adicionales
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
      ADD COLUMN IF NOT EXISTS game_type VARCHAR(100);

      -- Actualizar productos existentes con valores predeterminados basados en su categoría
      -- Accesorios (category_id = 2)
      UPDATE products 
      SET brand = CASE 
          WHEN name LIKE '%Ultra Pro%' THEN 'Ultra Pro' 
          ELSE 'Dragon Shield' 
      END
      WHERE category_id = 2 AND brand IS NULL;

      -- Juegos de Cartas (category_id = 1)
      UPDATE products 
      SET game_type = CASE 
          WHEN name LIKE '%Magic%' THEN 'Magic' 
          WHEN name LIKE '%Yu-Gi-Oh%' THEN 'Yu-Gi-Oh' 
          ELSE 'Pokemon' 
      END
      WHERE category_id = 1 AND game_type IS NULL;

      -- Singles (category_id = 3)
      UPDATE products 
      SET game_type = CASE 
          WHEN name LIKE '%Magic%' OR name LIKE '%Jace%' THEN 'Magic' 
          WHEN name LIKE '%Yu-Gi-Oh%' OR name LIKE '%Blue-Eyes%' THEN 'Yu-Gi-Oh' 
          ELSE 'Pokemon' 
      END
      WHERE category_id = 3 AND game_type IS NULL;
    `;
    
   
    await pool.query(updateSQL);
    
    console.log('¡Base de datos actualizada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error al actualizar la base de datos:', error);
    process.exit(1);
  } finally {
    
    pool.end();
  }
}

updateDatabase();