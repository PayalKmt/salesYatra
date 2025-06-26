const { z } = require('zod');

// Zod schema for Firestore GeoPoint
const GeoPointSchema = z.object({
  _latitude: z.number(),
  _longitude: z.number()
});

// Zod schema for Firestore DocumentReference
const DocumentReferenceSchema = z.object({
  id: z.string(),
  path: z.string()
});

// Zod schema for Firestore Timestamp
const FirestoreTimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number()
}).or(z.date()); // Accepts either Firestore timestamp or JS Date

// Main Store schema with optional timestamps
const StoreSchema = z.object({
  storeName: z.string(),
  ownerName: z.string(),
  phoneNumber: z.string(),
  location: GeoPointSchema,
  address: z.string(),
  deliveryAgentId: DocumentReferenceSchema,
  openingHours: z.string(),
  rating: z.number().min(0).max(5),
  warehouseId: DocumentReferenceSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Type conversion utilities
function toFirestoreTimestamp(date) {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1e6
  };
}

function fromFirestoreTimestamp(timestamp) {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
}

module.exports = { fromFirestoreTimestamp, toFirestoreTimestamp, StoreSchema };