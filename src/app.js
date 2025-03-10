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

// Configurar directorio de subida según el entorno
const uploadDir = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'tmp/uploads') 
  : path.join(__dirname, 'public/uploads');

// Asegurar que el directorio existe
if (!fs.existsSync(uploadDir)) {
  console.log(`Creando directorio de subidas: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración CORS adecuada para producción
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // En producción, especificar el dominio de Netlify
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir imágenes, ajustada para producción
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
if (process.env.NODE_ENV === 'production') {
  app.use('/api/uploads', express.static(uploadDir));
}

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
