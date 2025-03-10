require('dotenv').config();

// Definir un secreto predeterminado fuerte para desarrollo local
const DEFAULT_SECRET = 'ecommerce_api_development_jwt_secret_key_2025';

// Obtener el secreto de las variables de entorno o usar el predeterminado
const jwtSecret = process.env.JWT_SECRET || DEFAULT_SECRET;

// Si estamos en producción y no hay una variable de entorno, emitir una advertencia
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️ ADVERTENCIA: JWT_SECRET no está definido en producción. Usando el secreto predeterminado, lo cual no es seguro.');
}

console.log(`Configuración JWT cargada - Secret: ${jwtSecret.substring(0, 3)}...${jwtSecret.substring(jwtSecret.length - 3)}`);

module.exports = {
  secret: jwtSecret,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d' // 7 días por defecto
};
