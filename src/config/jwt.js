require('dotenv').config();

// Asegurar que tengamos un secret, incluso en entorno de desarrollo
// Pero emitir una advertencia si no hay variable de entorno en producción
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️ ADVERTENCIA: JWT_SECRET no está definido en producción. Usando fallback, pero esto no es seguro.');
}

module.exports = {
  secret: process.env.JWT_SECRET || 'jwt_fallback_secret_key_temporal_solo_para_desarrollo',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};