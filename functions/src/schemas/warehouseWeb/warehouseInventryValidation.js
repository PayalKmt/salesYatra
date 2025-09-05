const { z } = require('zod');

const CreateWarehouseInventorySchema = z.object({
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
  reserved: z.number().min(0, "Reserved cannot be negative").default(0),
  minimumStockLevel: z.number().min(0).optional(),
  lastRestocked: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const UpdateWarehouseInventorySchema = z.object({
  stock: z.number().min(0).optional(),
  reserved: z.number().min(0).optional(),
  minimumStockLevel: z.number().min(0).optional(),
  lastRestocked: z.string().datetime().optional(),
  createdAt: z.never().optional(),
  updatedAt: z.never().optional(),
});

module.exports = {
  CreateWarehouseInventorySchema,
  UpdateWarehouseInventorySchema
};