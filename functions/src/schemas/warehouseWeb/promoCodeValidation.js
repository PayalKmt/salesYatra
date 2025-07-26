const { z } = require('zod');

const basePromoCodeSchema = z.object({
  code: z.string().min(3).max(20),
  discountPercentage: z.number().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  warehouseId: z.string(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  productIds: z.array(z.string()).optional().default([]),
});

const promoCodeSchema = basePromoCodeSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

const updatePromoCodeSchema = basePromoCodeSchema.partial();

const validatePromoCodeSchema = z.object({
  code: z.string(),
  warehouseId: z.string(),
});

// Schema for assigning a promo code to a product
const assignPromoCodeSchema = z.object({
  promoCodeId: z.string().min(1),
  productId: z.string().min(1),
});


module.exports = {
  promoCodeSchema,
  updatePromoCodeSchema, // Export the new schema
  validatePromoCodeSchema,
  assignPromoCodeSchema,
};
