const express = require('express');
const warehouseController = require('../../controllers/warehouseWeb/warehouseController');
// const validate = require('../middleware/validate');

const router = express.Router();

// Create a warehouse
router.post('/create/warehouse', warehouseController.createWarehouse);

// Get all warehouses
router.get('/allWarehouse', warehouseController.getAllWarehouses);

// Get a specific warehouse
router.get('/:id', warehouseController.getWarehouse);

// Update warehouse
// router.put('/:id', validate(UpdateWarehouseSchema), WarehouseController.updateWarehouse);

// Delete warehouse
router.delete('delete/:id', warehouseController.deleteWarehouse);

module.exports = router;