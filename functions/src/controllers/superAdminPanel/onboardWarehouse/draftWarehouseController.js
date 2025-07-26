// backend/functions/controllers/draftController.js
const draftService = require('../../../services/superAdminPanel/onboardWarehouse/draftWarehouseService');
const { saveDraftSchema } = require('../../../schemas/superAdminPanel/onboardWarehouse/draftWarehouseSchema');

/**
 * @class DraftController
 * @description Handles HTTP requests related to saving and retrieving drafts.
 * Validates input, calls the service layer, and sends appropriate responses.
 */
class DraftController {
  /**
   * @method saveDraft
   * @description Handles the POST request to save or update a draft.
   * Validates the request body against the Zod schema.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async saveDraft(req, res) {
    try {
      // Validate the request body using Zod schema
      const validatedData = saveDraftSchema.parse(req.body);

      const { draftId, ...dataToSave } = validatedData;

      // Call the service to save the draft
      const newDraftId = await draftService.saveDraft(draftId, dataToSave);

      // Send a success response
      console.log('Draft saved successfully with ID:', newDraftId);
      return res.status(200).send({
        status: 'success',
        message: draftId ? 'Draft updated successfully!' : 'New draft created successfully!',
        draftId: newDraftId,
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
      console.error('Error saving draft:', error);
      return res.status(500).send({
        status: 'error',
        message: 'Failed to save draft.',
        details: error.message,
      });
    }
  }

  /**
   * @method getDraft
   * @description Handles the GET request to retrieve a draft by ID.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async getDraft(req, res) {
    try {
      const { draftId } = req.params; // Get draftId from URL parameters

      if (!draftId) {
        return res.status(400).send({
          status: 'error',
          message: 'Draft ID is required.',
        });
      }

      const draft = await draftService.getDraft(draftId);

      if (!draft) {
        return res.status(404).send({
          status: 'error',
          message: 'Draft not found.',
        });
      }

      return res.status(200).send({
        status: 'success',
        message: 'Draft retrieved successfully.',
        data: draft,
      });
    } catch (error) {
      console.error('Error retrieving draft:', error);
      return res.status(500).send({
        status: 'error',
        message: 'Failed to retrieve draft.',
        details: error.message,
      });
    }
  }
}

module.exports = new DraftController();
