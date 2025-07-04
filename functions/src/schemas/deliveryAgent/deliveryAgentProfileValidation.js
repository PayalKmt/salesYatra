const { z } = require('zod');

const GeoPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const AgentStatusSchema = z.enum(['available', 'busy', 'on_break', 'offline']);

const CreateAgentSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
//   userId: z.string().min(1, "User ID is required"),
//   warehouseId: z.string().min(1, "Warehouse ID is required"),
//   vehicleId: z.string().min(1, "Vehicle ID is required"),
//   status: AgentStatusSchema,
//   licensePlate: z.string().min(1, "License number is required"),
  currentLocation: GeoPointSchema,  // *
  totalDeliveries: z.number().min(0),  //*
  successfulDeliveries: z.number().min(0), //*
  lastActive: z.date().optional(), //*
  createdAt: z.date().optional(), //*
  updatedAt: z.date().optional(),  //*
});

const UpdateAgentSchema = CreateAgentSchema.pick({
//   status: true,
  currentLocation: true,
  totalDeliveries: true,
  successfulDeliveries: true,
  lastActive: true,
  updatedAt: true
}).partial();

module.exports = {
  CreateAgentSchema,
  UpdateAgentSchema,
//   AgentStatusSchema
};