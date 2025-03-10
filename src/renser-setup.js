const fs = require('fs');
const path = require('path');

console.log('Iniciando configuración para entorno Render...');

// Crear directorio de uploads
const uploadDir = path.join(__dirname, 'tmp/uploads');
if (!fs.existsSync(uploadDir)) {
  console.log(`Creando directorio: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Directorio creado exitosamente');
} else {
  console.log(`El directorio ${uploadDir} ya existe`);
}

// Comprobar variables de entorno críticas
const requiredEnvVars = [
  'DB_HOST', 
  'DB_NAME', 
  'DB_USER', 
  'DB_PASSWORD',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn(`⚠️ ADVERTENCIA: Faltan las siguientes variables de entorno: ${missingVars.join(', ')}`);
  console.warn('Algunas funcionalidades podrían no funcionar correctamente.');
} else {
  console.log('✅ Todas las variables de entorno requeridas están configuradas');
}

console.log('Configuración para Render completada');