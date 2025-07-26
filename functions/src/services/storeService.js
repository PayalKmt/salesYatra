const { db } = require("../config/firebase");
const {
  StoreSchema,
  UpdateStoreSchema,
} = require("../schemas/storeValidation");
const { v4: uuidv4 } = require("uuid");

const collection = db.collection("stores");

const createStore = async (storeData) => {
  try {
    // Validate store data
    const validatedData = StoreSchema.parse({
      ...storeData,
      orderedItems: [], // Initialize empty array for orders
      deliveryAgents: [], // Initialize empty array for delivery agents
    });

    // Create store document
    const storeId = uuidv4();
    const storeRef = db.collection("stores").doc(storeId);
    await storeRef.set({
      storeId,
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      storeId: storeId,
      ...validatedData,
    };
  } catch (error) {
    console.error("Error creating store:", error);
    throw new Error(
      error.errors?.[0]?.message || error.message || "Failed to create store"
    );
  }
};

const getStore = async (storeId) => {
  try {
    const doc = await collection.doc(storeId).get();

    if (!doc.exists) {
      throw new Error("Store not found");
    }

    return {
      storeId: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    throw new Error(`Failed to get store: ${error.message}`);
  }
};

const updateStore = async (storeId, updateData) => {
  try {
    // Validate update data
    const validatedUpdate = UpdateStoreSchema.parse({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });

    // Update store document
    await collection.doc(storeId).update(validatedUpdate);

    // Return updated store data
    return getStore(storeId);
  } catch (error) {
    throw new Error(
      `Store update failed: ${error.errors?.[0]?.message || error.message}`
    );
  }
};

const deleteStore = async (storeId) => {
  try {
    // Check if store exists
    const doc = await collection.doc(storeId).get();
    if (!doc.exists) {
      throw new Error("Store not found");
    }

    // Delete store document
    await collection.doc(storeId).delete();
    return { success: true, message: "Store deleted successfully" };
  } catch (error) {
    throw new Error(`Store deletion failed: ${error.message}`);
  }
};

// Additional store-related functions
const addOrderToStore = async (storeId, orderId) => {
  try {
    await collection.doc(storeId).update({
      orderedItems: admin.firestore.FieldValue.arrayUnion(orderId),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error(`Failed to add order to store: ${error.message}`);
  }
};

const assignDeliveryAgentToStore = async (storeId, agentId) => {
  try {
    await collection.doc(storeId).update({
      deliveryAgents: admin.firestore.FieldValue.arrayUnion(agentId),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error(`Failed to assign delivery agent: ${error.message}`);
  }
};

module.exports = {
  createStore,
  getStore,
  updateStore,
  deleteStore,
  addOrderToStore,
  assignDeliveryAgentToStore,
};
