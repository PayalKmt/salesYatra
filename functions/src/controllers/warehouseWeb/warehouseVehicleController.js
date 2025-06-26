const vehicleService = require('../../services/warehouseWeb/warehouseVehicleService');
const { z } = require('zod');
const { CreateVehicleSchema, UpdateVehicleSchema } = require('../../schemas/warehouseWeb/warehouseVehicleValidation');

const handleError = (error, res) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  res.status(error.statusCode || 500).json({ message: error.message });
};

const createVehicle = async (req, res) => {
  try {
    const validatedData = CreateVehicleSchema.parse(req.body);
    const vehicle = await vehicleService.createVehicle(validatedData);
    res.status(201).json(vehicle);
  } catch (error) {
    handleError(error, res);
  }
};

const getVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    handleError(error, res);
  }
};

const getWarehouseVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getVehiclesByWarehouse(req.params.warehouseId);
    res.json(vehicles);
  } catch (error) {
    handleError(error, res);
  }
};

const updateVehicle = async (req, res) => {
  try {
    const validatedData = UpdateVehicleSchema.parse(req.body);
    const vehicle = await vehicleService.updateVehicle(req.params.vehicleId, validatedData);
    res.json(vehicle);
  } catch (error) {
    handleError(error, res);
  }
};

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    const vehicle = await vehicleService.updateVehicleLocation(req.params.vehicleId, { latitude, longitude });
    res.json(vehicle);
  } catch (error) {
    handleError(error, res);
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const result = await vehicleService.deleteVehicle(req.params.vehicleId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  createVehicle,
  getVehicle,
  getWarehouseVehicles,
  updateVehicle,
  updateLocation,
  deleteVehicle
};