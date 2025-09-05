const { z } = require("zod");

const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
});

const AddressSchema = z.object({
  houseNumber: z.string().min(1, "House/Apartment number is required"),
  street: z.string().min(1, "Street/Road name is required"),
  colony: z.string().min(1, "Colony/Society name is required"),
  landmark: z.string().optional(),
  city: z.string().min(1, "City/Town is required"),
  // district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string()
    .min(6, "PIN code must be at least 6 characters")
    .max(10, "PIN code cannot exceed 10 characters"),
  country: z.string().min(1, "Country is required").default("India"),
  fullAddress: z.string().min(1, "Full address is required").optional()
});

// Main Store schema
const StoreSchema = z
  .object({
    storeName: z.string().min(1, "Store name is required"),
    ownerName: z.string().min(1, "Owner name is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    orderedItems: z.array(z.string()).default([]), // Stores order IDs
    location: LocationSchema,
    address: AddressSchema,
    deliveryAgents: z.array(z.string()).default([]), // Delivery agents who can deliver to this store
    openingHours: z.string(),
    rating: z.number().min(0).max(5).default(0),
    warehouseId: z.string().optional(), // Preferred warehouse
    routePriority: z.number().min(1).optional(), // For route optimization
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
  .strict();

// Update schema (all fields optional)
const UpdateStoreSchema = z
  .object({
    storeName: z.string().min(1).optional(),
    ownerName: z.string().min(1).optional(),
    phoneNumber: z.string().min(10).optional(),
    orderedItems: z.array(z.string()).optional(),
    location: LocationSchema,
    address: AddressSchema,
    deliveryAgents: z.array(z.string()).default([]),
    openingHours: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    warehouseId: z.string().optional(),
    routePriority: z.number().min(1).optional(),
    createdAt: z.never().optional(), // Block manual updates
    updatedAt: z.never().optional(), // Block manual updates
  })
  .strict();

module.exports = {
  StoreSchema,
  UpdateStoreSchema,
};