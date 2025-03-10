const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Configurar directorios de subida
const tmpUploadDir = path.join(__dirname, '../tmp/uploads');
const publicUploadDir = path.join(__dirname, '../public/uploads');

// Asegurar que los directorios existen
[tmpUploadDir, publicUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creando directorio: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log("Directorios de uploads configurados:");
console.log(`- Temporal: ${tmpUploadDir}`);
console.log(`- Público: ${publicUploadDir}`);

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Guardar en el directorio público para asegurar que sea accesible
    cb(null, publicUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log(`Generando archivo: ${filename}`);
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
    
    // Definir la URL relativa para acceder a la imagen
    const imageUrl = `/uploads/${req.file.filename}`;
    
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

// Ruta para verificar archivos existentes
router.get('/check', verifyToken, isAdmin, (req, res) => {
  try {
    const publicFiles = fs.existsSync(publicUploadDir) 
      ? fs.readdirSync(publicUploadDir) 
      : [];
    
    const tmpFiles = fs.existsSync(tmpUploadDir) 
      ? fs.readdirSync(tmpUploadDir) 
      : [];
    
    res.json({
      publicDirectory: publicUploadDir,
      tmpDirectory: tmpUploadDir,
      publicFiles,
      tmpFiles
    });
  } catch (error) {
    console.error('Error al verificar archivos:', error);
    res.status(500).json({ message: 'Error al verificar archivos', error: error.message });
  }
});

module.exports = router;
