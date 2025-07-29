// backend/functions/schemas/warehouseSchema.js
const { z } = require('zod');

// Define Zod schema for Warehouse Details
const warehouseDetailsSchema = z.object({
  warehouseName: z.string().min(1, 'Warehouse Name is required.'),
  address: z.string().min(1, 'Address is required.'),
  warehouseCode: z.string().min(1, 'Warehouse Code is required.'),
  city: z.string().min(1, 'City is required.'),
  capacity: z.string().min(1, 'Capacity (SQFT) is required.').regex(/^\d+$/, 'Capacity must be a number.'),
  state: z.string().min(1, 'State is required.'),
  warehouseType: z.string().min(1, 'Warehouse Type is required.'),
  pinCode: z.string().min(1, 'Pin Code is required.').regex(/^\d{6}$/, 'Pin Code must be 6 digits.'),
  operationalHours: z.string().min(1, 'Operational Hours are required.'),
  country: z.string().min(1, 'Country is required.'),
  productCategories: z.string().optional(), // Can be empty if file upload is preferred
  contactNumberDisplay: z.string().min(1, 'Display Contact Number is required.').regex(/^\d+$/, 'Contact number must be digits.'),
  contactNumberVerified: z.string().min(1, 'Verified Contact Number is required.').regex(/^\d+$/, 'Contact number must be digits.'),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  productListFilePath: z.string().optional(),
  companyPANFilePath: z.string().optional(),
  companyGSTFilePath: z.string().optional(),
  logoFilePath: z.string().optional(),
});

// Define Zod schema for Subscription Plan (updated to match service implementation)
const subscriptionPlanSchema = z.object({
  planName: z.enum(['basic', 'premium', 'enterprise'], {
    required_error: 'Plan name is required',
    invalid_type_error: 'Invalid plan name'
  }),
  price: z.number().min(0, 'Price must be a non-negative number.'),
  billingCycle: z.enum(['monthly', 'quarterly', 'yearly'], {
    required_error: 'Billing cycle is required',
    invalid_type_error: 'Invalid billing cycle'
  }),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  maxUsers: z.number().int().min(1, 'Must have at least 1 user'),
  maxOrders: z.number().int().min(0, 'Cannot be negative'),
  features: z.array(z.string()).optional(),
  status: z.enum(['active', 'pending', 'suspended', 'canceled']).default('pending'),
  autoRenew: z.boolean().default(true),
  promocode: z.string().optional(),
  paymentMethodId: z.string().optional(),
  allowedUserRoles: z.array(z.string())
    .default(['warehouseManager', 'supplier', 'deliveryAgent'])
});

// Define Zod schema for Subscription Update
const subscriptionUpdateSchema = z.object({
  newPlan: z.enum(['basic', 'premium', 'enterprise'], {
    required_error: 'Plan name is required',
    invalid_type_error: 'Invalid plan name'
  }),
  immediate: z.boolean().default(false),
  prorated: z.boolean().default(true),
  paymentMethodId: z.string().optional(),
  promocode: z.string().optional()
});

// Define Zod schema for User Assignment
const userAssignmentSchema = z.object({
  userName: z.string().min(1, 'User Name is required.'),
  phoneNumber: z.string().min(1, 'Phone Number is required.').regex(/^\d+$/, 'Phone number must be digits.'),
  userType: z.string().min(1, 'User Type is required.'),
  role: z.enum(['warehouseManager', 'supplier', 'deliveryAgent'])
});

// Combined schema for the full onboarding data submission
const onboardWarehouseSchema = z.object({
  warehouseDetails: warehouseDetailsSchema,
  subscriptionPlan: subscriptionPlanSchema,
  userAssignments: z.array(userAssignmentSchema).min(1, 'At least one user assignment is required'),
  // Added for subscription tracking
  billingInfo: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    taxId: z.string().optional(),
    billingEmail: z.string().email('Invalid billing email'),
    billingAddress: z.string().min(1, 'Billing address is required')
  }).optional()
});

// Schema for subscription plan response
const subscriptionPlanResponseSchema = z.object({
  planName: z.string(),
  price: z.number(),
  billingCycle: z.string(),
  features: z.array(z.string()),
  limitations: z.object({
    maxUsers: z.number(),
    maxOrders: z.union([z.number(), z.literal('unlimited')])
  })
});

module.exports = {
  warehouseDetailsSchema,
  subscriptionPlanSchema,
  subscriptionUpdateSchema,
  userAssignmentSchema,
  onboardWarehouseSchema,
  subscriptionPlanResponseSchema
};