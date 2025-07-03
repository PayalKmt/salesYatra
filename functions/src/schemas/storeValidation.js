const { z } = require("zod");

// Zod schema for Firestore GeoPoint
const GeoPointSchema = z
  .object({
    _latitude: z.number(),
    _longitude: z.number(),
  })
  .strict();

// Zod schema for Firestore DocumentReference
const DocumentReferenceSchema = z
  .object({
    id: z.string(),
    path: z.string(),
  })
  .strict();

// Main Store schema
const StoreSchema = z
  .object({
    storeName: z.string().min(1, "Store name is required"),
    ownerName: z.string().min(1, "Owner name is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    orderedItem: z.array(z.string()).default([]),
    location: GeoPointSchema,
    address: z.string().min(1, "Address is required"),
    deliveryAgentId: DocumentReferenceSchema.optional(),
    openingHours: z.string(),
    rating: z.number().min(0).max(5).default(0),
    warehouseId: DocumentReferenceSchema.optional(),
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
    orderedItem: z.array(z.string()).optional(),
    location: GeoPointSchema.optional(),
    address: z.string().min(1).optional(),
    deliveryAgentId: DocumentReferenceSchema.optional(),
    openingHours: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    warehouseId: DocumentReferenceSchema.optional(),
    createdAt: z.never().optional(), // Block manual updates
    updatedAt: z.never().optional(), // Block manual updates
  })
  .strict();
module.exports = {
  StoreSchema,
  UpdateStoreSchema,
};
