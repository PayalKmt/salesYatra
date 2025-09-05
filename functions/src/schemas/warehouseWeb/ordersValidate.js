const { z } = require("zod");

const ProductItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive").optional(), // Price at time of order
  name: z.string().optional(), // Added for enriched order data
});

const createOrderSchema = z.object({
  products: z.array(ProductItemSchema).min(1, "At least one product required"),
  storeId: z.string().min(1, "Store ID is required"), // The store making the purchase
  warehouseId: z.string().min(1, "Warehouse ID is required"), // Warehouse fulfilling the order
  estimatedDeliveryTime: z.string().datetime({ offset: true }),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "paypal",
    "bank_transfer",
    "cash_on_delivery",
  ]),
  status: z.enum(["pending", "confirmed", "ready_for_delivery", "assigned", "shipped", "delivered", "canceled"]).default("pending"),
  totalAmount: z.number().positive("Total amount must be positive").optional(),
  deliveryAgentId: z.string().optional(), // Agent assigned for delivery
  vehicleId: z.string().optional(), // Added for van assignment
  cancellationReason: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "ready_for_delivery", "assigned", "shipped", "delivered", "canceled"]),
});

const assignAgentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  deliveryAgentId: z.union([z.string(), z.null()]),
  vehicleId: z.string().optional(), // Added for van assignment
});

module.exports = {
  createOrderSchema,
  updateStatusSchema,
  assignAgentSchema,
  ProductItemSchema,
};