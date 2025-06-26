const admin = require('firebase-admin');
const db = admin.firestore();
const { v4: uuidv4 } = require('uuid');
// const { date } = require('zod/v4');

const createDeliveryAgent = async (agentData) => {
  try {
    // Verify user exists
    // const userDoc = await db.collection('users').doc(agentData.userId).get();
    // if (!userDoc.exists) {
    //   throw new Error('User not found');
    // }

    // Verify warehouse exists
    const warehouseDoc = await db.collection('warehouses').doc(agentData.warehouseId).get();
    if (!warehouseDoc.exists) {
      throw new Error('Warehouse not found');
    }

    // Verify vehicle exists if provided
    if (agentData.vehicleId) {
      const vehicleDoc = await db.collection('vehicles').doc(agentData.vehicleId).get();
      if (!vehicleDoc.exists) {
        throw new Error('Vehicle not found');
      }
    }

    const agentId = uuidv4();
    const agentRef = db.collection('deliveryAgents').doc(agentId);

    await agentRef.set({
      agentId,
      ...agentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toDateString()
    });

    return { agentId, ...agentData };
  } catch (error) {
    console.error('Error creating delivery agent:', error);
    throw new Error(error.message || 'Failed to create delivery agent');
  }
};

const getAgentById = async (agentId) => {
  try {
    const doc = await db.collection('deliveryAgents').doc(agentId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error fetching delivery agent by ID:', error);
    throw new Error(error.message || 'Failed to get delivery agent');
  }
};

const getAgentsByWarehouse = async (warehouseId) => {
  try {
    const snapshot = await db.collection('deliveryAgents')
      .where('warehouseId', '==', warehouseId)
      .get();

    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching agents by warehouse:', error);
    throw new Error(error.message || 'Failed to get agents');
  }
};

const updateAgent = async (agentId, updateData) => {
  try {
    const agentRef = db.collection('deliveryAgents').doc(agentId);

    if (updateData.vehicleId) {
      const vehicleDoc = await db.collection('vehicles').doc(updateData.vehicleId).get();
      if (!vehicleDoc.exists) {
        throw new Error('Vehicle not found');
      }
    }

    await agentRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return getAgentById(agentId);
  } catch (error) {
    console.error('Error updating delivery agent:', error);
    throw new Error(error.message || 'Failed to update delivery agent');
  }
};

const assignOrderToAgent = async (agentId, orderId) => {
  try {
    const batch = db.batch();
    const agentRef = db.collection('deliveryAgents').doc(agentId);
    const orderRef = db.collection('orders').doc(orderId);

    batch.update(agentRef, {
      currentOrders: admin.firestore.FieldValue.arrayUnion(orderId),
      status: 'busy',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    batch.update(orderRef, {
      deliveryAgentId: agentId,
      status: 'assigned',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();
    return getAgentById(agentId);
  } catch (error) {
    console.error('Error assigning order to agent:', error);
    throw new Error(error.message || 'Failed to assign order');
  }
};

const removeOrderFromAgent = async (agentId, orderId) => {
  try {
    const batch = db.batch();
    const agentRef = db.collection('deliveryAgents').doc(agentId);
    const orderRef = db.collection('orders').doc(orderId);

    batch.update(agentRef, {
      currentOrders: admin.firestore.FieldValue.arrayRemove(orderId),
      status: 'available',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    batch.update(orderRef, {
      deliveryAgentId: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();
    return getAgentById(agentId);
  } catch (error) {
    console.error('Error removing order from agent:', error);
    throw new Error(error.message || 'Failed to remove order from agent');
  }
};

module.exports = {
  createDeliveryAgent,
  getAgentById,
  getAgentsByWarehouse,
  updateAgent,
  assignOrderToAgent,
  removeOrderFromAgent
};
