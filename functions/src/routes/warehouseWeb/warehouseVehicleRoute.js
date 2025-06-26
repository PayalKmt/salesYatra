const express = require('express');
const router = express.Router();
const vehicleController = require('../../controllers/warehouseWeb/warehouseVehicleController');
// const validate = require('../middleware/validate');
// const { CreateVehicleSchema, UpdateVehicleSchema } = require('../schemas/vehicleSchema');

// Create new vehicle
router.post('/create/vehicle', vehicleController.createVehicle);

// Get vehicle by ID
router.get('/:vehicleId', vehicleController.getVehicle);

// Get all vehicles for a warehouse
router.get('/warehouse/:warehouseId/allVehicles', vehicleController.getWarehouseVehicles);

// Update vehicle details
router.put('/update/vehicleDetail/:vehicleId', vehicleController.updateVehicle);

// Update vehicle location
router.put('/update/vehicleLocation/:vehicleId', vehicleController.updateLocation);

// Delete vehicle
router.delete('delete/:vehicleId', vehicleController.deleteVehicle);

module.exports = router;