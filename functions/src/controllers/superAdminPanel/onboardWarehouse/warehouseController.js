// backend/functions/controllers/warehouseController.js
const warehouseService = require("../../../services/superAdminPanel/onboardWarehouse/warehouseService");
const {
  onboardWarehouseSchema,
} = require("../../../schemas/superAdminPanel/onboardWarehouse/warehouseSchema");
const {
  updateSubscriptionSchema,
} = require("../../../schemas/superAdminPanel/onboardWarehouse/warehouseSchema");

/**
 * @class WarehouseController
 * @description Handles HTTP requests related to warehouse onboarding and subscription management.
 */
class WarehouseController {
  /**
   * @method onboardWarehouse
   * @description Handles the POST request to onboard a new warehouse.
   */
  async onboardWarehouse(req, res) {
    try {
      const validatedData = onboardWarehouseSchema.parse(req.body);
      const warehouseId = await warehouseService.createWarehouse(validatedData);

      console.log("Warehouse onboarded successfully with ID:", warehouseId);
      return res.status(201).send({
        status: "success",
        message: "Warehouse onboarded successfully!",
        warehouseId: warehouseId,
      });
    } catch (error) {
      if (error.issues) {
        console.error("Validation Error:", error.issues);
        return res.status(400).send({
          status: "error",
          message: "Validation failed.",
          errors: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      console.error("Error onboarding warehouse:", error);
      return res.status(500).send({
        status: "error",
        message: "Failed to onboard warehouse.",
        details: error.message,
      });
    }
  }

  // backend/functions/controllers/warehouseController.js
  /**
   * @method getWarehouse
   * @description Gets a warehouse by its ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getWarehouse(req, res) {
    try {
      const warehouseId = req.params.warehouseId;

      console.log(warehouseId);
      // Validate warehouseId format
      if (!warehouseId || typeof warehouseId !== "string") {
        return res.status(400).send({
          status: "error",
          message: "Valid warehouse ID is required",
        });
      }

      const warehouse = await warehouseService.getWarehouseById(warehouseId);

      if (!warehouse) {
        return res.status(404).send({
          status: "error",
          message: "Warehouse not found",
        });
      }

      return res.status(200).send({
        status: "success",
        data: warehouse,
      });
    } catch (error) {
      console.error("Error fetching warehouse:", error);

      if (error.message === "Warehouse not found") {
        return res.status(404).send({
          status: "error",
          message: error.message,
        });
      }

      return res.status(500).send({
        status: "error",
        message: "Failed to fetch warehouse",
        details: error.message,
      });
    }
  }

  /**
   * @method updateSubscription
   * @description Handles the POST request to update a warehouse's subscription plan.
   */
  async updateSubscription(req, res) {
    try {
      // Validate request body
      const validatedData = updateSubscriptionSchema.parse(req.body);
      const { warehouseId, newPlan, paymentStatus } = validatedData;

      // Verify warehouse exists and belongs to the requesting user (add auth check in real implementation)
      const warehouse = await warehouseService.getWarehouseById(warehouseId);
      if (!warehouse) {
        return res.status(404).send({
          status: "error",
          message: "Warehouse not found",
        });
      }

      // Update subscription plan
      const updatedWarehouse = await warehouseService.updateSubscriptionPlan(
        warehouseId,
        newPlan,
        paymentStatus
      );

      return res.status(200).send({
        status: "success",
        message: "Subscription plan updated successfully",
        data: {
          warehouseId,
          previousPlan: warehouse.subscriptionPlan,
          newPlan: updatedWarehouse.subscriptionPlan,
          subscriptionStatus: updatedWarehouse.subscriptionStatus,
        },
      });
    } catch (error) {
      if (error.issues) {
        return res.status(400).send({
          status: "error",
          message: "Validation failed.",
          errors: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      console.error("Error updating subscription:", error);
      return res.status(500).send({
        status: "error",
        message: "Failed to update subscription plan.",
        details: error.message,
      });
    }
  }

  /**
   * @method getAvailablePlans
   * @description Handles the GET request to retrieve available subscription plans.
   */
  async getAvailablePlans(req, res) {
    try {
      const plans = await warehouseService.getAvailablePlans();
      return res.status(200).send({
        status: "success",
        data: plans,
      });
    } catch (error) {
      console.error("Error fetching available plans:", error);
      return res.status(500).send({
        status: "error",
        message: "Failed to fetch available plans.",
        details: error.message,
      });
    }
  }
}

module.exports = new WarehouseController();
