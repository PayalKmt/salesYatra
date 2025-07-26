// backend/functions/controllers/warehouseController.js
const warehouseService = require('../../../services/superAdminPanel/onboardWarehouse/warehouseService');
const { onboardWarehouseSchema } = require('../../../schemas/superAdminPanel/onboardWarehouse/warehouseSchema');

/**
 * @class WarehouseController
 * @description Handles HTTP requests related to warehouse onboarding.
 * Validates input, calls the service layer, and sends appropriate responses.
 */
class WarehouseController {
  /**
   * @method onboardWarehouse
   * @description Handles the POST request to onboard a new warehouse.
   * Validates the request body against the Zod schema.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async onboardWarehouse(req, res) {
    try {
      // Validate the request body using Zod schema
      const validatedData = onboardWarehouseSchema.parse(req.body);

      // Call the service to create the warehouse
      const warehouseId = await warehouseService.createWarehouse(validatedData);

      // Send a success response
      console.log('Warehouse onboarded successfully with ID:', warehouseId);
      return res.status(201).send({
        status: 'success',
        message: 'Warehouse onboarded successfully!',
        warehouseId: warehouseId,
      });
    } catch (error) {
      // Handle Zod validation errors
      if (error.issues) { // Zod error structure
        console.error('Validation Error:', error.issues);
        return res.status(400).send({
          status: 'error',
          message: 'Validation failed.',
          errors: error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      // Handle other unexpected errors
      console.error('Error onboarding warehouse:', error);
      return res.status(500).send({
        status: 'error',
        message: 'Failed to onboard warehouse.',
        details: error.message,
      });
    }
  }
}

module.exports = new WarehouseController();
