const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const db = require('../config/database');


exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No se proporcionó token de autenticación' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido o expirado' });
  }
};


exports.isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Requiere privilegios de administrador' });
  }
  next();
};


exports.isOwnerOrAdmin = async (req, res, next) => {
  try {
    if (req.userRole === 'admin' || parseInt(req.params.id) === req.userId) {
      next();
    } else {
      return res.status(403).json({ message: 'No autorizado para acceder a este recurso' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al verificar permisos' });
  }
};