const { z } = require("zod");

const ProductItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
});

const AddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

const createOrderSchema = z.object({
  products: z.array(ProductItemSchema).min(1, "At least one product required"),
  retailerId: z.string().min(1, "Retailer ID is required"),
  supplierId: z.string().min(1, "Supplier ID is required"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  deliveryAddress: AddressSchema,
  storeId: z.array(z.string().min(1)).optional(),
  estimatedDeliveryTime: z.string().datetime({ offset: true }),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "paypal",
    "bank_transfer",
    "cash_on_delivery",
  ]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "canceled"]),
});

const assignAgentSchema = z.object({
  deliveryAgentId: z.string().min(1, "Delivery agent ID is required"),
});

const assignStoresSchema = z.object({
  storeId: z.array(z.string().min(1, "Each Store ID must be non-empty")).min(1, "At least one store ID is required"),
});


module.exports = {
  createOrderSchema,
  updateStatusSchema,
  assignAgentSchema,
  assignStoresSchema
};
