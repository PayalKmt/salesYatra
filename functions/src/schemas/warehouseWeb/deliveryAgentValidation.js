const { z } = require("zod");
// const admin = require('firebase-admin');

// const { userRef } = require("../warehouseWeb/warehouseUsersValidation");

const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
});

const RouteItemSchema = z.object({
  storeId: z.string(),
  storeName: z.string(),
  address: z.string(),
  location: LocationSchema,
  orders: z.array(z.string()),
  distanceFromPrevious: z.number().optional(),
  completed: z.boolean().default(false),
  completedAt: z.string().datetime().optional(),
});

const CreateDeliveryAgentSchema = z.object({
  // userId: z.string().min(1, "User ID is required"),
  userRef: z.any(),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  vehicleId: z.string().min(1, "Vehicle ID is required").optional(),
  currentOrders: z.array(z.string()).default([]),
  assignedRoute: z.array(RouteItemSchema).optional(),
  status: z.enum(["available", "busy"]).default("available"),
  currentLocation: LocationSchema.optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const UpdateDeliveryAgentSchema = z.object({
  vehicleId: z.string().min(1).optional(),
  status: z.enum(["available", "busy"]).optional(),
  currentOrders: z.array(z.string()).optional(),
  assignedRoute: z.array(RouteItemSchema).optional(),
  currentLocation: LocationSchema.optional(),
  createdAt: z.never().optional(),
  updatedAt: z.never().optional(),
});

module.exports = {
  CreateDeliveryAgentSchema,
  UpdateDeliveryAgentSchema,
  RouteItemSchema
};
