// backend/functions/services/warehouseService.js
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid"); // Import uuid library
const db = admin.firestore();

/**
 * @class WarehouseService
 * @description Handles all Firestore database operations related to warehouse onboarding.
 */
class WarehouseService {
  /**
   * @method createWarehouse
   * @description Adds a new warehouse document to the 'warehouses' collection in Firestore.
   * A UUID is generated for the document ID.
   * @param {object} data - The complete warehouse onboarding data.
   * @returns {Promise<string>} The UUID of the newly created warehouse document.
   */
  async createWarehouse(data) {
    const warehouseId = uuidv4(); // Generate a UUID for the warehouse document
    const warehouseData = {
      warehouseId: warehouseId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending_review", // Initial status
      // allowedUserRoles: ["warehouseManager", "supplier", "deliveryAgent"],
    };

    // Use set() with the generated ID instead of add()
    await db.collection("allWarehouses").doc(warehouseId).set(warehouseData);
    return warehouseId;
  }

  // You can add more service methods here, e.g., getWarehouseById, updateWarehouse, etc.
}

module.exports = new WarehouseService();
