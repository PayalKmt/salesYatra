const { z } = require('zod');

const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
}).optional();

const CreateVehicleSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  agentId: z.string().min(1).optional(),
  vehicleType: z.enum(['bike', 'van', 'truck']),
  vehicleCapacity: z.number().min(1, "Capacity must be at least 1"),
  licensePlate: z.string().min(3, "License plate must be at least 3 characters").optional(),
  currentLocation: LocationSchema,
  status: z.enum(['available', 'in_use', 'maintenance']).default('available')
});

const UpdateVehicleSchema = z.object({
  vehicleType: z.enum(['bike', 'van', 'truck']).optional(),
  vehicleCapacity: z.number().min(1).optional(),
  agentId: z.string().min(1).optional(),
  licensePlate: z.string().min(3).optional(),
  currentLocation: LocationSchema,
  status: z.enum(['available', 'in_use', 'maintenance']).optional()
});

const assignVehicleSchema = z.object({
  agentId: z.string().min(1, "Delivery agent ID is required"),
});

module.exports = {
    CreateVehicleSchema,
    UpdateVehicleSchema,
    assignVehicleSchema
}