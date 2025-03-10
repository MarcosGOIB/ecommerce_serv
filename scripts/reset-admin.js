require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');


const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function resetAdmin() {
  try {

    
    console.log('Iniciando script de reinicio de administrador...');
    
    const plainPassword = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log(`Hash generado para contraseña '${plainPassword}': ${hashedPassword}`);
    
    const checkResult = await pool.query(
      "SELECT * FROM users WHERE email = 'admin@example.com'"
    );
    
    if (checkResult.rows.length === 0) {
      console.log('El usuario administrador no existe. Creándolo...');
      
    
      await pool.query(
        "INSERT INTO users (username, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())",
        ['admin', 'admin@example.com', hashedPassword, 'admin']
      );
      
      console.log('Usuario administrador creado exitosamente.');
    } else {
      console.log('El usuario administrador existe. Actualizando contraseña...');
      
      
      await pool.query(
        "UPDATE users SET password = $1, updated_at = NOW() WHERE email = 'admin@example.com'",
        [hashedPassword]
      );
      
      console.log('Contraseña del administrador actualizada exitosamente.');
    }
    
    
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = 'admin@example.com'"
    );
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      
      console.log('Información del administrador:');
      console.log(`- ID: ${user.id}`);
      console.log(`- Username: ${user.username}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
     
      const isValid = await bcrypt.compare(plainPassword, user.password);
      console.log(`¿La contraseña '${plainPassword}' es válida? ${isValid ? 'SÍ' : 'NO'}`);
      
      if (!isValid) {
        console.error('¡ADVERTENCIA! La verificación de contraseña falló. Algo está mal con el hash o bcrypt.');
      }
    }
    
    console.log('Proceso completado. El usuario administrador está listo para ser usado.');
    console.log('Credenciales:');
    console.log('- Email: admin@example.com');
    console.log('- Contraseña: admin123');
    
  } catch (error) {
    console.error('Error durante la ejecución del script:', error);
  } finally {
    
    await pool.end();
  }
}


resetAdmin();

