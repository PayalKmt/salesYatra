const { z } = require('zod');

const promoCodeSchema = z.object({
  code: z.string().min(3).max(20),
  discountPercentage: z.number().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  warehouseId: z.string(),
  productId: z.string().nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
})
.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"], // Highlights the field in error
  }
);

const validatePromoCodeSchema = z.object({
  code: z.string(),
  warehouseId: z.string(),
  productId: z.string().nullable(),
});

module.exports = {
  promoCodeSchema,
  validatePromoCodeSchema,
};