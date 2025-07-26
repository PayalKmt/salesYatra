const { z } = require("zod");

const ProductItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive"), // Price at time of order
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
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "canceled"]).default("pending"),
  totalAmount: z.number().positive("Total amount must be positive").optional(),
  deliveryAgentId: z.string().optional(), // Agent assigned for delivery
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "canceled"]),
});

const assignAgentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  deliveryAgentId: z.union([z.string(), z.null()]),
});

module.exports = {
  createOrderSchema,
  updateStatusSchema,
  assignAgentSchema,
  ProductItemSchema,
};