const User = require('../models/userModel');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    const userId = req.params.id;
    
  
    if (req.userRole !== 'admin' && role) {
      return res.status(403).json({ message: 'No autorizado para cambiar el rol de usuario' });
    }
    
    const updatedUser = await User.update(userId, { username, email, password, role });
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    await User.delete(userId);
    
    res.json({
      message: 'Usuario eliminado exitosamente',
      id: userId
    });
  } catch (error) {
    next(error);
  }
};