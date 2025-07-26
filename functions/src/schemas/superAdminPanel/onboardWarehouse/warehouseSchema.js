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

// Define Zod schema for Subscription Plan
const subscriptionPlanSchema = z.object({
  subscriptionType: z.string().min(1, 'Subscription Type is required.'),
  numberOfUsers: z.number().int().min(0, 'Number of Users must be a non-negative integer.'),
  additionalUser: z.number().int().min(0, 'Additional User must be a non-negative integer.').optional(),
  price: z.number().min(0, 'Price must be a non-negative number.'),
  billingCycle: z.string().min(1, 'Billing Cycle is required.'),
  startDate: z.string().datetime().optional(), // ISO 8601 string from Flutter DateTime
  endDate: z.string().datetime().optional(),   // ISO 8601 string from Flutter DateTime
  promocode: z.string().optional(),
  allowedUserRoles: z.array(z.string()).optional()
    .default(['warehouseManager', 'supplier', 'deliveryAgent'])
});

// Define Zod schema for User Assignment
const userAssignmentSchema = z.object({
  userName: z.string().min(1, 'User Name is required.'),
  phoneNumber: z.string().min(1, 'Phone Number is required.').regex(/^\d+$/, 'Phone number must be digits.'),
  userType: z.string().min(1, 'User Type is required.'),
});

// Combined schema for the full onboarding data submission
const onboardWarehouseSchema = z.object({
  warehouseDetails: warehouseDetailsSchema,
  subscriptionPlan: subscriptionPlanSchema,
  userAssignments: z.array(userAssignmentSchema).optional(),
});

module.exports = {
  warehouseDetailsSchema,
  subscriptionPlanSchema,
  userAssignmentSchema,
  onboardWarehouseSchema,
};
