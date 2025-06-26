const { z } = require('zod');

const CreateProductSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(2),
  price: z.number().positive(),
  stock: z.number().min(0),
  retailerPrice: z.number().positive(),
  wholesalerPrice: z.number().positive(),
  distributorPrice: z.number().positive(),
  supplierId: z.string().min(1),
  warehouseId: z.string().min(1),
  minimumOrderQuantity: z.number().min(1)
});

const UpdateProductSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  category: z.string().min(2).optional(),
  price: z.number().positive().optional(),
  stock: z.number().min(0).optional(),
  retailerPrice: z.number().positive().optional(),
  wholesalerPrice: z.number().positive().optional(),
  distributorPrice: z.number().positive().optional(),
  supplierId: z.string().min(1).optional(),
  minimumOrderQuantity: z.number().min(1).optional()
});

module.exports = {
    CreateProductSchema,
    UpdateProductSchema
}