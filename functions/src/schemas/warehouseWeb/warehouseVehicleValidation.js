const { z } = require('zod');

const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
}).optional();

const RouteSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required")
}).optional();

const CreateVehicleSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  agentId: z.string().min().optional(),
  vehicleType: z.enum(['bike', 'van', 'truck']),
  vehicleCapacity: z.number().min(1, "Capacity must be at least 1"),
  currentLoad: z.number().min(0).default(0),
  licensePlate: z.string().min(3, "License plate must be at least 3 characters").optional(),
  currentLocation: LocationSchema,
  route: RouteSchema,
  status: z.enum(['available', 'in_use', 'maintenance']).default('available'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const UpdateVehicleSchema = z.object({
  vehicleType: z.enum(['bike', 'van', 'truck']).optional(),
  vehicleCapacity: z.number().min(1).optional(),
  agentId: z.string().min().optional(),
  currentLoad: z.number().min(0).optional(),
  licensePlate: z.string().min(3).optional(),
  currentLocation: LocationSchema,
  route: RouteSchema,
  status: z.enum(['available', 'in_use', 'maintenance']).optional(),
});

// const assignVehicleSchema = z.object({
//   agentId: z.string().min(1, "Delivery agent ID is required"),
//   orderIds: z.array(z.string()).optional(), 
// });

module.exports = {
    CreateVehicleSchema,
    UpdateVehicleSchema,
    // assignVehicleSchema
}