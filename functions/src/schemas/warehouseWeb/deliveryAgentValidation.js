const { z } = require('zod');

const CreateDeliveryAgentSchema = z.object({
  // userId: z.string().min(1, "User ID is required"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  vehicleId: z.string().min(1, "Vehicle ID is required").optional(),
  currentOrders: z.array(z.string()).default([]),
  status: z.enum(['available', 'busy']).default('available')
});

const UpdateDeliveryAgentSchema = z.object({
  vehicleId: z.string().min(1).optional(),
  status: z.enum(['available', 'busy']).optional(),
  currentOrders: z.array(z.string()).optional()
});

module.exports = {
    CreateDeliveryAgentSchema,
    UpdateDeliveryAgentSchema
}