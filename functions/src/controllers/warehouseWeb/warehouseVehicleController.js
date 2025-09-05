const VehicleService = require('../../services/warehouseWeb/warehouseVehicleService');
const { StatusCodes } = require('http-status-codes');
const {
  CreateVehicleSchema,
  UpdateVehicleSchema
  // assignVehicleSchema
} = require('../../schemas/warehouseWeb/warehouseVehicleValidation');

const handleError = (res, error) => {
  console.error(error);
  if (error.name === 'ZodError') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation error',
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: error.message
  });
};

const createVehicle = async (req, res) => {
  try {
    const validatedData = CreateVehicleSchema.parse(req.body);
    const vehicle = await VehicleService.createVehicle(validatedData);
    res.status(StatusCodes.CREATED).json(vehicle);
  } catch (error) {
    handleError(res, error);
  }
};

const getVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleService.getVehicleById(req.params.vehicleId);
    if (!vehicle) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Vehicle not found'
      });
    }
    res.status(StatusCodes.OK).json(vehicle);
  } catch (error) {
    handleError(res, error);
  }
};

const getWarehouseVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleService.getVehiclesByWarehouse(req.params.warehouseId);
    res.status(StatusCodes.OK).json(vehicles);
  } catch (error) {
    handleError(res, error);
  }
};

const updateVehicle = async (req, res) => {
  try {
    const validatedData = UpdateVehicleSchema.parse(req.body);
    const vehicle = await VehicleService.updateVehicle(req.params.vehicleId, validatedData);
    res.status(StatusCodes.OK).json(vehicle);
  } catch (error) {
    handleError(res, error);
  }
};

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Latitude and longitude are required'
      });
    }
    const vehicle = await VehicleService.updateVehicleLocation(
      req.params.vehicleId, 
      { latitude, longitude }
    );
    res.status(StatusCodes.OK).json(vehicle);
  } catch (error) {
    handleError(res, error);
  }
};

const assignVehicle = async (req, res) => {
  try {
    const validatedData = assignVehicleSchema.parse(req.body);
    const vehicle = await VehicleService.assignVehicleToAgent(
      req.params.vehicleId,
      validatedData.agentId
    );
    res.status(StatusCodes.OK).json({
      message: 'Vehicle assigned successfully',
      vehicle
    });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const result = await VehicleService.deleteVehicle(req.params.vehicleId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createVehicle,
  getVehicle,
  getWarehouseVehicles,
  updateVehicle,
  updateLocation,
  assignVehicle,
  deleteVehicle
};