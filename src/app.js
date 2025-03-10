const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Configuración de directorios de uploads
const publicUploadsDir = path.join(__dirname, 'public/uploads');
const tmpUploadsDir = path.join(__dirname, 'tmp/uploads');

// Asegurar que ambos directorios existen
if (!fs.existsSync(publicUploadsDir)) {
  console.log(`Creando directorio: ${publicUploadsDir}`);
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

if (!fs.existsSync(tmpUploadsDir)) {
  console.log(`Creando directorio: ${tmpUploadsDir}`);
  fs.mkdirSync(tmpUploadsDir, { recursive: true });
}

// Configuración CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configura rutas para acceder a las imágenes desde diferentes ubicaciones
app.use('/uploads', express.static(publicUploadsDir));
app.use('/api/uploads', express.static(publicUploadsDir));
app.use('/api/uploads', express.static(tmpUploadsDir));

// Endpoint para probar rutas de imágenes
app.get('/check-image-paths', (req, res) => {
  res.json({
    publicUploadsDir: fs.existsSync(publicUploadsDir),
    tmpUploadsDir: fs.existsSync(tmpUploadsDir),
    files: {
      publicUploads: fs.existsSync(publicUploadsDir) ? fs.readdirSync(publicUploadsDir) : [],
      tmpUploads: fs.existsSync(tmpUploadsDir) ? fs.readdirSync(tmpUploadsDir) : []
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Ruta de estado de la API
app.get('/', (req, res) => {
  res.json({ message: 'API de ecommerce funcionando correctamente' });
});

// Manejador de errores
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = app;
