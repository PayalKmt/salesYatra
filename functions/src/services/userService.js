const { db } = require('../config/firebase');
const { userSchema } = require('../schemas/userValidation');
const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');

const createUser = async (userData) => {
  try {
    // Validate the input data against the schema
    const validatedData = userSchema.parse({
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Generate a unique ID for the user
    const userId = uuidv4();
    const userRef = db.collection('users').doc(userId);

    // Store the user data in Firestore
    await userRef.set(validatedData);

    // Return the created user data
    return {
      userId,
      ...validatedData
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(error.message || 'Failed to create user');
  }
};

// const getUser = async (userId) => {
//   try {
//     const userRef = await db.collection('users').doc(userId).get();
    
//     if (!userRef.exists) {
//       throw new Error('User not found');
//     }
    
//     return userRef.data();
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     throw new Error(error.message || 'Failed to fetch user');
//   }
// };

module.exports = {
  createUser
};