const firebase = require("../../config/firebase");
const admin = firebase.admin;
const db = firebase.db;
const { v4: uuidv4 } = require('uuid');

// Plan configuration
const PLAN_CONFIG = {
  basic: {
    maxUsers: 5,
    allowedUserRoles: ['warehouseManager', 'supplier'],
    price: 49.99
  },
  premium: {
    maxUsers: 15,
    allowedUserRoles: ['warehouseManager', 'supplier', 'deliveryAgent', 'accountant'],
    price: 149.99
  },
  enterprise: {
    maxUsers: 50,
    allowedUserRoles: ['warehouseManager', 'supplier', 'deliveryAgent', 'accountant', 'admin'],
    price: 499.99
  }
};

const createSubscription = async (subscriptionData) => {
  try {
    const warehouseRef = db.collection('warehouses').doc(subscriptionData.warehouseId);
    const warehouseDoc = await warehouseRef.get();

    if (!warehouseDoc.exists) {
      throw new Error('Warehouse not found');
    }

    const planConfig = PLAN_CONFIG[subscriptionData.planType];
    if (!planConfig) {
      throw new Error('Invalid plan type');
    }

    const subscriptionId = uuidv4();
    const subscriptionRef = db.collection('warehouseSubscriptions').doc(subscriptionId);

    const subscriptionToCreate = {
      subscriptionId,
      ...subscriptionData,
      maxUsers: planConfig.maxUsers,
      allowedUserRoles: planConfig.allowedUserRoles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await subscriptionRef.set(subscriptionToCreate);

    await warehouseRef.update({
      subscriptionPlan: subscriptionData.planType,
      subscriptionStartDate: subscriptionData.startDate,
      subscriptionEndDate: subscriptionData.endDate,
      maxUsers: planConfig.maxUsers,
      allowedUserRoles: planConfig.allowedUserRoles
    });

    return subscriptionToCreate;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

const getSubscriptionById = async (subscriptionId) => {
  try {
    const doc = await db.collection('subscriptions').doc(subscriptionId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error getting subscription by ID:', error);
    throw error;
  }
};

const getSubscriptionsByWarehouse = async (warehouseId) => {
  try {
    const snapshot = await db.collection('subscriptions')
      .where('warehouseId', '==', warehouseId)
      .orderBy('startDate', 'desc')
      .get();
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting subscriptions by warehouse:', error);
    throw error;
  }
};

const updateSubscription = async (subscriptionId, updateData) => {
  try {
    const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);

    let planConfig;
    if (updateData.planType) {
      planConfig = PLAN_CONFIG[updateData.planType];
      if (!planConfig) {
        throw new Error('Invalid plan type');
      }
      updateData.maxUsers = planConfig.maxUsers;
      updateData.allowedUserRoles = planConfig.allowedUserRoles;
    }

    await subscriptionRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (updateData.planType || updateData.endDate) {
      const subscription = await getSubscriptionById(subscriptionId);
      const warehouseRef = db.collection('warehouses').doc(subscription.warehouseId);

      await warehouseRef.update({
        ...(updateData.planType && {
          subscriptionPlan: updateData.planType,
          maxUsers: planConfig.maxUsers,
          allowedUserRoles: planConfig.allowedUserRoles
        }),
        ...(updateData.endDate && { subscriptionEndDate: updateData.endDate })
      });
    }

    return getSubscriptionById(subscriptionId);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

const cancelSubscription = async (subscriptionId) => {
  try {
    const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);
    const subscription = await getSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const warehouseRef = db.collection('warehouses').doc(subscription.warehouseId);
    await warehouseRef.update({
      subscriptionPlan: null,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      maxUsers: null,
      allowedUserRoles: []
    });

    await subscriptionRef.update({
      status: 'cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { subscriptionId, status: 'cancelled' };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

module.exports = {
  createSubscription,
  getSubscriptionById,
  getSubscriptionsByWarehouse,
  updateSubscription,
  cancelSubscription
};
