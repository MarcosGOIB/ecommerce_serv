const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../middleware/authMiddleware');


router.use(verifyToken);


router.get('/', isAdmin, userController.getAllUsers);


router.get('/:id', isOwnerOrAdmin, userController.getUserById);
router.put('/:id', isOwnerOrAdmin, userController.updateUser);
router.delete('/:id', isOwnerOrAdmin, userController.deleteUser);

module.exports = router;