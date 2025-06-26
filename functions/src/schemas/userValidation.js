const { z } = require('zod');

const userSchema = z.object({
  phoneNumber: z.string().min(10).max(15).regex(/^[0-9]+$/, "Must be a valid phone number"),
  role: z.enum(['retailer', 'deliveryAgent', 'warehouseManager', 'supplier', 'admin']),
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(200).optional(),
  warehouseId: z.string().optional(), // FK to Warehouses
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  profilePictureUrl: z.string().url().optional()
}).strict(); // .strict() ensures no extra fields are allowed

module.exports = {
  userSchema,
};
