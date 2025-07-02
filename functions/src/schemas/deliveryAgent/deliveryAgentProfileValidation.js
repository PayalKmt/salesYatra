// const { z } = require('zod');

// const GeoPointSchema = z.object({
//   latitude: z.number(),
//   longitude: z.number(),
// });

// const AgentStatusSchema = z.enum(['available', 'busy', 'on_break', 'offline']);

// const AgentSchema = z.object({
//   agentId: z.string().min(1, "Agent ID is required"),
//   userId: z.string().min(1, "User ID is required"),
//   warehouseId: z.string().min(1, "Warehouse ID is required"),
//   vehicleId: z.string().min(1, "Vehicle ID is required"),
//   status: AgentStatusSchema,
//   currentLocation: GeoPointSchema,
//   licensePlate: z.string().min(1, "License number is required"),
//   totalDeliveries: z.number().min(0),
//   successfulDeliveries: z.number().min(0),
//   lastActive: z.date().optional(),
//   createdAt: z.date().optional(),
//   updatedAt: z.date().optional(),
// });

// const UpdateAgentSchema = AgentSchema.pick({
//   status: true,
//   currentLocation: true,
//   totalDeliveries: true,
//   successfulDeliveries: true,
//   lastActive: true,
//   updatedAt: true
// }).partial();

// module.exports = {
//   AgentSchema,
//   UpdateAgentSchema,
//   AgentStatusSchema
// };