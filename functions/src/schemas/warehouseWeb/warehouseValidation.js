const { z } = require('zod');

// Location schema
const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
});

// Subscription plan options
const SubscriptionPlanSchema = z.enum(['basic', 'premium', 'enterprise']);

// Warehouse creation schema
const CreateWarehouseSchema = z.object({
  warehouseName: z.string().min(2).max(100),
  location: LocationSchema,
  managerId: z.string().min(1, "Manager ID is required"),
  capacity: z.number().positive(),
  subscriptionPlan: SubscriptionPlanSchema,
  subscriptionStartDate: z.string().datetime().optional(),
  subscriptionEndDate: z.date().nullable().optional().default(null),
  maxUsers: z.number().positive().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  allowedUserRoles: z.array(z.string()).optional()
    .default(['warehouseManager', 'supplier', 'deliveryAgent'])
});

module.exports = {
  CreateWarehouseSchema
};