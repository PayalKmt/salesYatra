// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/users', userController.createUser);



// router.get('/:userId', userController.getUser);

module.exports = router;