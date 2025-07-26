// backend/functions/schemas/draftSchema.js
const { z } = require('zod');
const { warehouseDetailsSchema, subscriptionPlanSchema, userAssignmentSchema } = require('../onboardWarehouse/warehouseSchema');

// Schema for saving a draft. All fields are optional as it's a partial save.
const saveDraftSchema = z.object({
  draftId: z.string().optional(), // Optional for new drafts
  warehouseDetails: warehouseDetailsSchema.partial().optional(), // Partial allows some fields to be missing
  subscriptionPlan: subscriptionPlanSchema.partial().optional(),
  userAssignments: z.array(userAssignmentSchema).optional(),
});

module.exports = {
  saveDraftSchema,
};
