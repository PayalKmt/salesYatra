const admin = require("firebase-admin");
const {
  CreateAgentSchema,
  UpdateAgentSchema,
} = require("../../schemas/deliveryAgent/deliveryAgentProfileValidation");

const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

async function createAgent(agentData) {
  try {
    const validatedData = CreateAgentSchema.parse(agentData);

    const agentRef = db.collection("deliveryAgents").doc(validatedData.agentId);
    const existingDoc = await agentRef.get();
    console.log(existingDoc);

    // if (existingDoc.exists) {
    //   throw new Error('Agent with this ID already exists');
    // }

    const deliveryAgentProfileId = uuidv4();
    const deliveryAgentProfileRef = db
      .collection("deliveryAgentProfile")
      .doc(deliveryAgentProfileId);
    const now = new Date().toISOString();

    await deliveryAgentProfileRef.set({
      deliveryAgentProfileId,
      ...validatedData,
      lastActive: validatedData.lastActive || now,
      createdAt: validatedData.createdAt || now,
      updatedAt: validatedData.updatedAt || now,
    });

    return (await deliveryAgentProfileRef.get()).data();
  } catch (error) {
    console.error("Error creating agent:", error);
    throw error;
  }
}

async function getAgentById(agentId) {
  try {
    const agentRef = db.collection("deliveryAgents").doc(agentId);
    const doc = await agentRef.get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error("Error getting agent:", error);
    throw error;
  }
}

async function updateAgent(agentId, warehouseId, updateData) {
  try {
    const agentRef = db.collection("deliveryAgents").doc(agentId);
    const agent = await agentRef.get();

    if (!agent.exists) {
      throw new Error("Agent not found");
    }

    if (agent.data().warehouseId !== warehouseId) {
      throw new Error("Agent does not belong to this warehouse");
    }

    const validatedData = UpdateAgentSchema.parse(updateData);
    const now = admin.firestore.Timestamp.now();

    await agentRef.update({
      ...validatedData,
      updatedAt: now,
    });

    return (await agentRef.get()).data();
  } catch (error) {
    console.error("Error updating agent:", error);
    throw error;
  }
}

async function updateAgentLocation(agentId, warehouseId, location) {
  try {
    const agentRef = db.collection("deliveryAgents").doc(agentId);
    const agent = await agentRef.get();

    if (!agent.exists) {
      throw new Error("Agent not found");
    }

    if (agent.data().warehouseId !== warehouseId) {
      throw new Error("Agent does not belong to this warehouse");
    }

    const now = admin.firestore.Timestamp.now();
    await agentRef.update({
      currentLocation: new admin.firestore.GeoPoint(
        location.latitude,
        location.longitude
      ),
      lastActive: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error updating agent location:", error);
    throw error;
  }
}

async function updateAgentStatus(agentId, warehouseId, status) {
  try {
    const agentRef = db.collection("deliveryAgents").doc(agentId);
    const agent = await agentRef.get();

    if (!agent.exists) {
      throw new Error("Agent not found");
    }

    if (agent.data().warehouseId !== warehouseId) {
      throw new Error("Agent does not belong to this warehouse");
    }

    const now = admin.firestore.Timestamp.now();
    await agentRef.update({
      status,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error updating agent status:", error);
    throw error;
  }
}

module.exports = {
  getAgentById,
  createAgent,
  updateAgent,
  updateAgentLocation,
  updateAgentStatus,
};
