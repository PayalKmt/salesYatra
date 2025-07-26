const admin = require('firebase-admin');
const db = admin.firestore();
const { v4: uuidv4 } = require('uuid');

const createUser = async (userData) => {
  try {
    // Validate warehouse existence
    const warehouseRef = db.collection('allWarehouses').doc(userData.warehouseId);
    const warehouse = await warehouseRef.get();

    if (!warehouse.exists) {
      throw new Error('Warehouse not found');
    }

    // Validate allowed roles
    // const allowedRoles = warehouse.data().allowedUserRoles;
    // if (!allowedRoles.includes(userData.role)) {
    //   throw new Error(`Role "${userData.role}" not allowed for this warehouse`);
    // }

    // Generate UUID for userId
    const userId = uuidv4();
    const userRef = db.collection('warehouseUsers').doc(userId);

    // const timestamp = admin.firestore.FieldValue.serverTimestamp();

    await userRef.set({
      userId,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { userId, ...userData };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(error.message || 'Failed to create user');
  }
};

// for super admin
const getUsersByWarehouse = async (warehouseId) => {
  try {
    const snapshot = await db.collection('warehouseUsers')
      .where('warehouseId', '==', warehouseId)
      .get();

    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting users by warehouse:', error);
    throw new Error(error.message || 'Failed to get users');
  }
};

const getUserById = async (userId) => {
  try {
    const doc = await db.collection('warehouseUsers').doc(userId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error(error.message || 'Failed to get user');
  }
};

const updateUser = async (userId, updateData) => {
  try {
    const userRef = db.collection('warehouseUsers').doc(userId);

    await userRef.update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    const updatedUser = await userRef.get();
    return updatedUser.data();
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error(error.message || 'Failed to update user');
  }
};

const deleteUser = async (userId) => {
  try {
    await db.collection('warehouseUsers').doc(userId).delete();
    return { id: userId, deleted: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(error.message || 'Failed to delete user');
  }
};

module.exports = {
  createUser,
  getUsersByWarehouse,
  getUserById,
  updateUser,
  deleteUser
};
