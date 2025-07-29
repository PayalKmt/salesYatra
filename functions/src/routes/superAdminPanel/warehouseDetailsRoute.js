const express = require('express');
const router = express.Router();

const warehouseController = require('../../controllers/superAdminPanel/onboardWarehouse/warehouseController');
const draftController = require('../../controllers/superAdminPanel/onboardWarehouse/draftWarehouseController');

router.post('/onboardWarehouse', warehouseController.onboardWarehouse);

router.post('/onboardWarehouse/saveDraft', draftController.saveDraft);
router.get('/onboardWarehouse/getDraft/:draftId', draftController.getDraft);

router.get('/warehouseInfo/:warehouseId',warehouseController.getWarehouse);

router.post('/update/subscription/:warehouseId', warehouseController.updateSubscription);
router.get('/get/availablePlans', warehouseController.getAvailablePlans);

module.exports = router;
