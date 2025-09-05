const { z } = require('zod');

// Location Schema
const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
}).optional();

// Vehicle Metadata Schema
const VehicleMetadataSchema = z.object({
  vehicleType: z.string(),
  licensePlate: z.string().optional(),
  warehouseId: z.string()
}).optional();

// Order Metadata Schema
const OrderMetadataSchema = z.object({
  orderId: z.string(),
  storeId: z.string(),
  warehouseId: z.string(),
  totalAmount: z.number().positive(),
  productCount: z.number().int().positive()
}).optional();

// Base Notification Schema
const notificationBaseSchema = z.object({
  recipientId: z.string().min(1),
  recipientType: z.enum(['user', 'warehouse', 'deliveryAgent']),
  senderId: z.string().min(1),
  senderType: z.enum(['system', 'warehouse', 'admin']),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  isRead: z.boolean().default(false),
  createdAt: z.date().default(() => new Date())
});

// Vehicle Assignment Notification
const vehicleAssignmentSchema = notificationBaseSchema.extend({
  type: z.literal('vehicle_assignment'),
  relatedId: z.string().min(1),
  metadata: VehicleMetadataSchema
});

// Order Assignment Notification
const orderAssignmentSchema = notificationBaseSchema.extend({
  type: z.literal('order_assignment'),
  relatedId: z.string().min(1),
  metadata: OrderMetadataSchema
});

// Custom Notification
const customNotificationSchema = notificationBaseSchema.extend({
  type: z.literal('custom'),
  relatedId: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// System Notification
const systemNotificationSchema = notificationBaseSchema.extend({
  type: z.literal('system'),
  relatedId: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// Combined Notification Schema
const notificationSchema = z.discriminatedUnion('type', [
  vehicleAssignmentSchema,
  orderAssignmentSchema,
  customNotificationSchema,
  systemNotificationSchema
]);

// Get Notifications Query Schema
const getNotificationsSchema = z.object({
  userId: z.string().optional(),
  warehouseId: z.string().optional(),
  type: z.enum(['vehicle_assignment', 'order_assignment', 'custom', 'system']).optional(),
  isRead: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(10),
  page: z.number().int().min(1).default(1)
});

// Mark as Read Schema
const markAsReadSchema = z.object({
  notificationIds: z.array(z.string().min(1)).min(1)
});

module.exports = {
  LocationSchema,
  VehicleMetadataSchema,
  OrderMetadataSchema,
  notificationBaseSchema,
  vehicleAssignmentSchema,
  orderAssignmentSchema,
  customNotificationSchema,
  systemNotificationSchema,
  notificationSchema,
  getNotificationsSchema,
  markAsReadSchema
};