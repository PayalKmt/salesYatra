const { db } = require('../config/firebase');
const { StoreSchema } = require('../schemas/storeValidation.js');
const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');

const createStore = async (storeData) => {
    try {
        const validatedData = StoreSchema.parse({
            ...storeData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Generate a unique ID for the user
    const storeId = uuidv4();
    const storeRef = db.collection('stores').doc(storeId);
    
    
    // Store the user data in Firestore
    await storeRef.set(validatedData);

        // Return the created user data
        return {
            storeId,
            ...validatedData
          };
        } catch (error) {
          console.error('Error creating user:', error);
          throw new Error(error.message || 'Failed to create user');
        }
}

module.exports = { createStore };