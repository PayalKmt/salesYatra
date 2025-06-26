// controllers/userController.js
const userService = require('../services/userService');
const { StatusCodes } = require('http-status-codes');

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(StatusCodes.CREATED).json(user);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

module.exports = {
    createUser
}