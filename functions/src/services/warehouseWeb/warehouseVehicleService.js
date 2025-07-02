const admin = require('firebase-admin');
const db = admin.firestore();
const { GeoPoint } = require('firebase-admin/firestore'); 
const { v4: uuidv4 } = require('uuid');

const createVehicle = async (vehicleData) => {
  try {
    // Verify warehouse exists
    const warehouseDoc = await db.collection('warehouses').doc(vehicleData.warehouseId).get();
    if (!warehouseDoc.exists) {
      throw new Error('Warehouse not found');
    }

    const vehicleId = uuidv4();
    const vehicleRef = db.collection('vehicles').doc(vehicleId);

    const vehicleToCreate = {
      vehicleId,
      ...vehicleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Convert location to GeoPoint if provided
    if (vehicleData.currentLocation) {
      vehicleToCreate.currentLocation = new GeoPoint(
        vehicleData.currentLocation.latitude,
        vehicleData.currentLocation.longitude
      );
    }

    await vehicleRef.set(vehicleToCreate);
    return vehicleToCreate;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw new Error(error.message || 'Failed to create vehicle');
  }
};

const getVehicleById = async (vehicleId) => {
  try {
    const doc = await db.collection('vehicles').doc(vehicleId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    throw new Error(error.message || 'Failed to get vehicle');
  }
};

const getVehiclesByWarehouse = async (warehouseId) => {
  try {
    const snapshot = await db.collection('vehicles')
      .where('warehouseId', '==', warehouseId)
      .get();

    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching vehicles by warehouse:', error);
    throw new Error(error.message || 'Failed to get vehicles');
  }
};

const updateVehicle = async (vehicleId, updateData) => {
  try {
    const vehicleRef = db.collection('vehicles').doc(vehicleId);

    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    if (updateData.currentLocation) {
      updatePayload.currentLocation = new GeoPoint(
        updateData.currentLocation.latitude,
        updateData.currentLocation.longitude
      );
    }

    await vehicleRef.update(updatePayload);
    return getVehicleById(vehicleId);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw new Error(error.message || 'Failed to update vehicle');
  }
};

const updateVehicleLocation = async (vehicleId, location) => {
  try {
    const vehicleRef = db.collection('vehicles').doc(vehicleId);

    await vehicleRef.update({
      currentLocation: new GeoPoint(location.latitude, location.longitude),
      updatedAt: new Date().toISOString()
    });

    return getVehicleById(vehicleId);
  } catch (error) {
    console.error('Error updating vehicle location:', error);
    throw new Error(error.message || 'Failed to update vehicle location');
  }
};


const assignVehicleToAgent = async (vehicleId, agentId) => {
  try {
    // console.log(vehicleId);
    // console.log(agentId);
    const agentDocRef = db.collection('deliveryAgents').doc(agentId);
    const agentDoc = await agentDocRef.get();
    const vehicleDocRef = db.collection('vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleDocRef.get();

    if (!agentDoc.exists) throw new Error('Delivery agent not found');
    if (!vehicleDoc.exists) throw new Error('Vehicle not found');

    // Check if vehicle is already assigned to another agent
    const existingAgentSnapshot = await db.collection('deliveryAgents')
      .where('vehicleId', '==', vehicleId)
      .limit(1)
      .get();

    if (!existingAgentSnapshot.empty && existingAgentSnapshot.docs[0].id !== agentId) {
      throw new Error('Vehicle is already assigned to another agent');
    }

    const batch = db.batch();
    const agentRef = db.collection('deliveryAgents').doc(agentId);
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    // console.log("Vehicle Ref .....", vehicleRef);

    // Update agent with vehicle assignment
    batch.update(agentRef, {
      vehicleId: vehicleId,
      updatedAt: new Date().toISOString()
    });

    // Optionally update vehicle with agent reference if needed
    batch.update(vehicleRef, {
      agentId: agentId,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
    return getVehicleById(vehicleId);
  } catch (error) {
    console.error('Error assigning vehicle to agent:', error);
    throw new Error(error.message || 'Failed to assign vehicle');
  }
};


const deleteVehicle = async (vehicleId) => {
  try {
    const agentsSnapshot = await db.collection('deliveryAgents')
      .where('vehicleId', '==', vehicleId)
      .get();

    if (!agentsSnapshot.empty) {
      throw new Error('Cannot delete vehicle assigned to delivery agents');
    }

    await db.collection('vehicles').doc(vehicleId).delete();
    return { vehicleId, deleted: true };
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw new Error(error.message || 'Failed to delete vehicle');
  }
};

module.exports = {
  createVehicle,
  getVehicleById,
  getVehiclesByWarehouse,
  updateVehicle,
  updateVehicleLocation,
  assignVehicleToAgent,
  deleteVehicle
};
