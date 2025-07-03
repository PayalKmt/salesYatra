const { db } = require('../config/firebase');
const {
  StoreSchema,
  UpdateStoreSchema,
} = require("../schemas/storeValidation.js");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");

const createStore = async (storeData) => {
  try {
    // Generate a unique ID for the user
    const storeId = uuidv4();

    const validatedData = StoreSchema.parse({
      storeId,
      ...storeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const storeRef = db.collection("stores").doc(storeId);

    // Store the user data in Firestore
    await storeRef.set(validatedData);

    // Return the created user data
    return {
      storeId,
      ...validatedData,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "Failed to create user");
  }
};

const getStore = async (storeId) => {
  try {
    const doc = await this.collection.doc(storeId).get();

    if (!doc.exists) {
      return "Not Found!";
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    throw new Error(`Failed to get store: ${error.message}`);
  }
};

/**
 * Update a store with validation
 * @param {string} storeId - ID of the store to update
 * @param {object} updateData - Partial store data to update
 * @returns {Promise<object>} - Updated store document
 */
const updateStore = async (storeId, updateData) => {
  try {
    // Validate the update data
    const validatedUpdate = UpdateStoreSchema.parse(updateData);

    // Update in Firestore
    await this.collection.doc(storeId).update(validatedUpdate);

    // Return the updated document
    return this.getStore(storeId);
  } catch (error) {
    throw new Error(`Store update failed: ${error.message}`);
  }
};

/**
 * Delete a store
 * @param {string} storeId - ID of the store to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
const deleteStore = async (storeId) => {
  try {
    await this.collection.doc(storeId).delete();
    return true;
  } catch (error) {
    throw new Error(`Store deletion failed: ${error.message}`);
  }
};

module.exports = { createStore, getStore, updateStore, deleteStore };