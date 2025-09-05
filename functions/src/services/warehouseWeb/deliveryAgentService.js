const { db, FieldValue } = require("../../config/firebase");
const { v4: uuidv4 } = require("uuid");
const VehicleService = require("../warehouseWeb/warehouseVehicleService");

class DeliveryAgentService {
  async createDeliveryAgent(agentData) {
    try {
      // Verify user exists
      const userDoc = await db
        .collection(agentData.userRef.docCollection)
        .doc(agentData.userRef.docId)
        .get();
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      // Verify warehouse exists
      const warehouseDoc = await db
        .collection("allWarehouses")
        .doc(agentData.warehouseId)
        .get();
      if (!warehouseDoc.exists) {
        throw new Error("Warehouse not found");
      }

      // Verify vehicle exists if provided
      if (agentData.vehicleId) {
        const vehicle = await VehicleService.getVehicleById(
          agentData.vehicleId
        );
        if (!vehicle) {
          throw new Error("Vehicle not found");
        }
      }

      const agentId = uuidv4();
      const now = new Date().toISOString();

      const agent = {
        agentId: agentId,
        ...agentData,
        currentOrders: [],
        status: "available",
        createdAt: now,
        updatedAt: now,
      };

      await db.collection("deliveryAgents").doc(agentId).set(agent);

      // If vehicle was provided, assign it to agent
      if (agentData.vehicleId) {
        await VehicleService.assignVehicleToAgent(agentData.vehicleId, agentId);
      }

      return agent;
    } catch (error) {
      console.error("Error creating delivery agent:", error);
      throw error;
    }
  }

  async getAgentById(agentId) {
    try {
      const doc = await db.collection("deliveryAgents").doc(agentId).get();
      if (!doc.exists) return null;

      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toISOString(),
        updatedAt: data.updatedAt?.toISOString(),
      };
    } catch (error) {
      console.error("Error getting delivery agent:", error);
      throw error;
    }
  }

  async getAgentsByWarehouse(warehouseId, options = {}) {
    try {
      let query = db
        .collection("deliveryAgents")
        .where("warehouseId", "==", warehouseId);

      // Add status filter if provided
      if (options.status) {
        query = query.where("status", "==", options.status);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt
            ? new Date(data.createdAt).toISOString()
            : null,
          updatedAt: data.updatedAt
            ? new Date(data.updatedAt).toISOString()
            : null,
        };
      });
    } catch (error) {
      console.error("Error getting warehouse agents:", error);
      throw error;
    }
  }

  async updateAgent(agentId, updateData) {
    try {
      const agentRef = db.collection("deliveryAgents").doc(agentId);
      const now = new Date().toISOString();

      // If updating vehicle, verify it exists
      if (updateData.vehicleId) {
        const vehicle = await VehicleService.getVehicleById(
          updateData.vehicleId
        );
        if (!vehicle) {
          throw new Error("Vehicle not found");
        }
      }

      await agentRef.update({
        ...updateData,
        updatedAt: now,
      });

      return this.getAgentById(agentId);
    } catch (error) {
      console.error("Error updating delivery agent:", error);
      throw error;
    }
  }

  async assignOrderToAgent(agentId, orderId) {
    try {
      const batch = db.batch();
      const now = new Date().toISOString();

      // Get agent and verify they exist
      const agentRef = db.collection("deliveryAgents").doc(agentId);
      const agentDoc = await agentRef.get();
      if (!agentDoc.exists) {
        throw new Error("Agent not found");
      }

      // Get order and verify it exists
      const orderRef = db.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();
      if (!orderDoc.exists) {
        throw new Error("Order not found");
      }

      // Update agent
      batch.update(agentRef, {
        currentOrders: FieldValue.arrayUnion(orderId),
        status: "busy",
        updatedAt: now,
      });

      // Update order
      batch.update(orderRef, {
        deliveryAgentId: agentId,
        status: "assigned",
        updatedAt: now,
      });

      await batch.commit();

      // If agent has a vehicle, update its load
      const agentData = agentDoc.data();
      if (agentData.vehicleId) {
        const orderData = orderDoc.data();
        const load = orderData.products.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        await VehicleService.updateVehicleLoad(agentData.vehicleId, load);
      }

      return this.getAgentById(agentId);
    } catch (error) {
      console.error("Error assigning order to agent:", error);
      throw error;
    }
  }

  async removeOrderFromAgent(agentId, orderId) {
    try {
      const batch = db.batch();
      const now = new Date().toISOString();

      // Get agent and verify they exist
      const agentRef = db.collection("deliveryAgents").doc(agentId);
      const agentDoc = await agentRef.get();
      if (!agentDoc.exists) {
        throw new Error("Agent not found");
      }

      // Get order and verify it exists
      const orderRef = db.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();
      if (!orderDoc.exists) {
        throw new Error("Order not found");
      }

      // Update agent
      batch.update(agentRef, {
        currentOrders: FieldValue.arrayRemove(orderId),
        status:
          agentDoc.data().currentOrders.length <= 1 ? "available" : "busy",
        updatedAt: now,
      });

      // Update order
      batch.update(orderRef, {
        deliveryAgentId: FieldValue.delete(),
        updatedAt: now,
      });

      await batch.commit();

      // If agent has a vehicle, update its load
      const agentData = agentDoc.data();
      if (agentData.vehicleId) {
        const orderData = orderDoc.data();
        const load = orderData.products.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        await VehicleService.updateVehicleLoad(agentData.vehicleId, -load);
      }

      return this.getAgentById(agentId);
    } catch (error) {
      console.error("Error removing order from agent:", error);
      throw error;
    }
  }

  async getAvailableAgents(warehouseId) {
    return this.getAgentsByWarehouse(warehouseId, { status: "available" });
  }
}

module.exports = new DeliveryAgentService();
