const userService = require('../../services/warehouseWeb/warehouseUsersService');
const { CreateUserSchema, UpdateUserSchema } = require('../../schemas/warehouseWeb/warehouseUsersValidation');
const { z } = require('zod');

const createUser = async (req, res) => {
  try {
    const validatedData = CreateUserSchema.parse(req.body);
    const user = await userService.createUser(validatedData);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

const getUsersByWarehouse = async (req, res) => {
  try {
    const users = await userService.getUsersByWarehouse(req.params.warehouseId);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    user ? res.status(200).json(user) : res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const validatedData = UpdateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.params.id, validatedData);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  getUsersByWarehouse,
  getUserById,
  updateUser,
  deleteUser
};