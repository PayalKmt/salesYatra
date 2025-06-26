const express = require('express');
const router = express.Router();
const userController = require('../../controllers/warehouseWeb/warehouseUsersController');
// const validate = require('../middleware/validate');
// const { CreateUserSchema, UpdateUserSchema } = require('../../schemas/warehouseWeb/warehouseUsersValidation');

// Create user
router.post('/create/warehouseUser', userController.createUser);

// Get users by warehouse
router.get('/warehouse/:warehouseId', userController.getUsersByWarehouse);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('update/:id', userController.updateUser);

// Delete user
router.delete('delete/:id', userController.deleteUser);

module.exports = router;