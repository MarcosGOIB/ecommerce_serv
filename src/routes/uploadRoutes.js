const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Configurar directorio de subida
// Usar directorio que persista en Render
const uploadDir = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../tmp/uploads') // En Render, usamos /tmp que es accesible pero temporal
  : path.join(__dirname, '../public/uploads');

console.log("Directorio de uploads:", uploadDir);

// Asegurar que el directorio existe
if (!fs.existsSync(uploadDir)) {
  console.log("Creando directorio de uploads...");
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Directorio creado con éxito");
  } catch (error) {
    console.error("Error al crear directorio:", error);
  }
}

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Guardando archivo en:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log("Nombre de archivo generado:", filename);
    cb(null, filename);
  }
});

// Filtrar por tipo de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('No es una imagen. Por favor sube solo imágenes.'));
  }
};

// Configurar multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Ruta de subida
router.post('/', verifyToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      console.log("No se proporcionó ninguna imagen");
      return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
    }

    console.log("Archivo recibido:", req.file);
    
    // Para Render, modificamos la URL para ser relativa a la API
    // En producción (Render), las imágenes aún se guardan pero deberían migrarse a una solución permanente
    const imageUrl = process.env.NODE_ENV === 'production'
      ? `/api/uploads/${req.file.filename}` // Ruta accesible desde el frontend
      : `/uploads/${req.file.filename}`;
    
    console.log("URL de la imagen que se guarda en BD:", imageUrl);
    
    res.status(201).json({ 
      message: 'Imagen subida con éxito',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen', error: error.message });
  }
});

module.exports = router;