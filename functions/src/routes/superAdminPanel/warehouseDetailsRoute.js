// backend/functions/routes/api.js
const express = require('express');
const router = express.Router();

// Import controllers
const warehouseController = require('../../controllers/superAdminPanel/onboardWarehouse/warehouseController');
const draftController = require('../../controllers/superAdminPanel/onboardWarehouse/draftWarehouseController');

/**
 * @route POST /onboardWarehouse
 * @description Endpoint for submitting new warehouse onboarding data.
 */
router.post('/onboardWarehouse', warehouseController.onboardWarehouse);

/**
 * @route POST /saveDraft
 * @description Endpoint for saving or updating draft onboarding data.
 */
router.post('/onboardWarehouse/saveDraft', draftController.saveDraft);

/**
 * @route GET /getDraft/:draftId
 * @description Endpoint for retrieving a specific draft by ID.
 */
router.get('/onboardWarehouse/getDraft/:draftId', draftController.getDraft);

module.exports = router;
