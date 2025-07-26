const express = require('express');
const router = express.Router();
const vehicleController = require('../../controllers/warehouseWeb/warehouseVehicleController');
// const validate = require('../middleware/validate');
// const { CreateVehicleSchema, UpdateVehicleSchema } = require('../schemas/vehicleSchema');

// Create new vehicle
router.post('/create/vehicle', vehicleController.createVehicle);

// Get vehicle by ID
router.get('/get/vehicle/:vehicleId', vehicleController.getVehicle);

// Get all vehicles for a warehouse
router.get('/get/allVehicles/:warehouseId', vehicleController.getWarehouseVehicles);

// Update vehicle details
router.put('/update/vehicleDetail/:vehicleId', vehicleController.updateVehicle);

// Update vehicle location
router.put('/update/vehicleLocation/:vehicleId', vehicleController.updateLocation);

// assign vehicle to agent
router.post('/assignVehicle/:vehicleId', vehicleController.assignVehicle);

// Delete vehicle
router.delete('/delete/vehicle/:vehicleId', vehicleController.deleteVehicle);

module.exports = router;