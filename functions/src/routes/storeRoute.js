// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// add the store creation part
router.post('/create/store', storeController.createStore);

// router.get('/:userId', userController.getUser);

module.exports = router;