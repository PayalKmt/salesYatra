// backend/functions/services/draftService.js
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid'); // Import uuid library
const db = admin.firestore();

/**
 * @class DraftService
 * @description Handles all Firestore database operations related to saving and managing drafts.
 */
class DraftService {
  /**
   * @method saveDraft
   * @description Saves or updates a draft document in the 'drafts' collection.
   * If no draftId is provided, a new UUID is generated for the draft.
   * @param {string | undefined} draftId - The ID of the draft to update, or undefined for a new draft.
   * @param {object} data - The draft data to save.
   * @returns {Promise<string>} The ID of the saved/updated draft document.
   */
  async saveDraft(draftId, data) {
    let docIdToUse = draftId;
    if (!docIdToUse) {
      // If no draftId is provided, generate a new UUID
      docIdToUse = uuidv4();
      draftData.createdAt = new Date().toISOString(); // Set createdAt only for new drafts
    }

    const draftData = {
      ...data,
      updatedAt: timestamp,
    };

    // Use set() with the determined ID (either existing or new UUID)
    await db.collection('drafts').doc(docIdToUse).set(draftData, { merge: true });
    return docIdToUse;
  }

  /**
   * @method getDraft
   * @description Retrieves a draft document by its ID.
   * @param {string} draftId - The ID of the draft to retrieve.
   * @returns {Promise<object | null>} The draft data, or null if not found.
   */
  async getDraft(draftId) {
    const doc = await db.collection('drafts').doc(draftId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  // You can add more service methods here, e.g., deleteDraft, listDrafts, etc.
}

module.exports = new DraftService();
