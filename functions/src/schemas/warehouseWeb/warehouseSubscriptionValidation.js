const { z } = require('zod');

exports.CreateSubscriptionSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  planType: z.enum(['basic', 'premium', 'enterprise']),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)),
  price: z.number().positive("Price must be positive"),
  paymentTransactionId: z.string().min(1, "Payment transaction ID is required")
}).superRefine((data, ctx) => {
  if (data.endDate <= data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End date must be after start date',
      path: ['endDate']
    });
  }
});

exports.UpdateSubscriptionSchema = z.object({
  planType: z.enum(['basic', 'premium', 'enterprise']).optional(),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  price: z.number().positive().optional(),
  paymentTransactionId: z.string().min(1).optional()
}).refine(data => {
  if (data.endDate && isNaN(data.endDate.getTime())) {
    throw new Error('End date must be a valid date');
  }
  return true;
});
