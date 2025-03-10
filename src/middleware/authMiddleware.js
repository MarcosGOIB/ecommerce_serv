const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

exports.verifyToken = (req, res, next) => {
  // Obtener el token del encabezado de autorización
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log(`Verificando token: ${token ? 'Presente' : 'Ausente'}`);

  if (!token) {
    console.log('No se proporcionó token de autenticación');
    return res.status(403).json({ message: 'No se proporcionó token de autenticación' });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    console.log(`Token verificado para usuario ID: ${decoded.id}, Rol: ${decoded.role}`);
    
    // Guardar información del usuario en el objeto request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    
    return res.status(401).json({ message: 'Token no válido' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    console.log(`Acceso denegado: El usuario ID ${req.userId} no es administrador`);
    return res.status(403).json({ message: 'Requiere privilegios de administrador' });
  }
  console.log(`Usuario ID ${req.userId} verificado como administrador`);
  next();
};

exports.isOwnerOrAdmin = async (req, res, next) => {
  try {
    const requestedId = parseInt(req.params.id);
    const userId = req.userId;
    const userRole = req.userRole;
    
    console.log(`Verificación de permisos - Usuario ID: ${userId}, Rol: ${userRole}, Recurso solicitado: ${requestedId}`);
    
    if (userRole === 'admin' || requestedId === userId) {
      console.log('Acceso autorizado como propietario o administrador');
      next();
    } else {
      console.log('Acceso denegado - No es propietario ni administrador');
      return res.status(403).json({ message: 'No autorizado para acceder a este recurso' });
    }
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return res.status(500).json({ message: 'Error al verificar permisos' });
  }
};
