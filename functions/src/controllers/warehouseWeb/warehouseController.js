const warehouseService = require('../../services/warehouseWeb/warehouseService');
const { StatusCodes } = require('http-status-codes');

const { CreateWarehouseSchema } = require('../../schemas/warehouseWeb/warehouseValidation');
const { z } = require('zod');

const createWarehouse = async (req, res) => {
  try {
    const validatedData = CreateWarehouseSchema.parse(req.body);
    const warehouse = await warehouseService.createWarehouse(validatedData);
    res.status(StatusCodes.CREATED).json(warehouse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: error.errors });
    } else {
      res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
    }
  }
};

const getWarehouse = async (req, res) => {
  try {
    const warehouse = await warehouseService.getWarehouseById(req.params.id);
    warehouse
      ? res.json(warehouse)
      : res.status(StatusCodes.BAD_REQUEST).json({ message: 'Warehouse not found' });
  } catch (error) {
    res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
  }
};

// const updateWarehouse = async (req, res) => {
//   try {
//     const validatedData = UpdateWarehouseSchema.parse(req.body);
//     const warehouse = await WarehouseService.updateWarehouse(req.params.id, validatedData);
//     warehouse
//       ? res.json(warehouse)
//       : res.status(404).json({ message: 'Warehouse not found' });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       res.status(400).json({ errors: error.errors });
//     } else {
//       res.status(500).json({ message: error.message });
//     }
//   }
// };

const deleteWarehouse = async (req, res) => {
  try {
    const result = await warehouseService.deleteWarehouse(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
  }
};

const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await warehouseService.getAllWarehouses();
    res.json(warehouses);
  } catch (error) {
    res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
  }
};

module.exports = {
  createWarehouse,
  getWarehouse,
//   updateWarehouse,
  deleteWarehouse,
  getAllWarehouses
};
