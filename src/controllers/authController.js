const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');


const secret = process.env.JWT_SECRET || 'tu_secreto_super_seguro';
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
   
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
   
    const newUser = await User.create({ username, email, password });
    
  
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      secret,
      { expiresIn }
    );
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(`Intento de inicio de sesión: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

  
    const user = await User.findByEmail(email);
    
    if (!user) {
      console.log(`Usuario no encontrado: ${email}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log(`Usuario encontrado: ${user.email}, ID: ${user.id}, Rol: ${user.role}`);

  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log(`Contraseña válida: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

  
    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn }
    );

    console.log(`Token generado para el usuario: ${user.email}`);

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    console.log(`Obteniendo perfil para el usuario ID: ${req.userId}`);
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    next(error);
  }
};