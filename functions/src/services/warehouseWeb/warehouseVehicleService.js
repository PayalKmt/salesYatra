const admin = require("firebase-admin");
const db = admin.firestore();
const { GeoPoint, Timestamp } = require("firebase-admin/firestore");
const { v4: uuidv4 } = require("uuid");
// const DeliveryAgentService = require("../warehouseWeb/deliveryAgentService");

class VehicleService {
  async createVehicle(vehicleData) {
    try {
      // Verify warehouse exists
      const warehouseDoc = await db
        .collection("allWarehouses")
        .doc(vehicleData.warehouseId)
        .get();
      if (!warehouseDoc.exists) {
        throw new Error("Warehouse not found");
      }

      const vehicleId = uuidv4();
      const now = new Date().toISOString();

      const vehicle = {
        vehicleId,
        ...vehicleData,
        agentId: null,
        currentLoad: 0,
        status: "available",
        createdAt: now,
        updatedAt: now,
      };

      // Convert location to GeoPoint if provided
      if (vehicleData.currentLocation) {
        vehicle.currentLocation = new GeoPoint(
          vehicleData.currentLocation.latitude,
          vehicleData.currentLocation.longitude
        );
      }

      await db.collection("vehicles").doc(vehicleId).set(vehicle);
      return vehicle;
    } catch (error) {
      console.error("Error creating vehicle:", error);
      throw error;
    }
  }

  async getVehicleById(vehicleId) {
    try {
      const doc = await db.collection("vehicles").doc(vehicleId).get();
      if (!doc.exists) return null;

      const data = doc.data();
      // Convert Firestore Timestamp to ISO string for dates
      return {
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
      };
    } catch (error) {
      console.error("Error getting vehicle:", error);
      throw error;
    }
  }

  async getVehiclesByWarehouse(warehouseId, options = {}) {
    try {
      let query = db
        .collection("vehicles")
        .where("warehouseId", "==", warehouseId);

      // Add status filter if provided
      if (options.status) {
        query = query.where("status", "==", options.status);
      }

      // Add vehicle type filter if provided
      if (options.vehicleType) {
        query = query.where("vehicleType", "==", options.vehicleType);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Error getting warehouse vehicles:", error);
      throw error;
    }
  }

  async updateVehicle(vehicleId, updateData) {
    try {
      const vehicleRef = db.collection("vehicles").doc(vehicleId);
      const now = new Date().toISOString();

      const updatePayload = {
        ...updateData,
        updatedAt: now,
      };

      // Handle GeoPoint conversion
      if (updateData.currentLocation) {
        updatePayload.currentLocation = new GeoPoint(
          updateData.currentLocation.latitude,
          updateData.currentLocation.longitude
        );
      }

      await vehicleRef.update(updatePayload);
      return this.getVehicleById(vehicleId);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw error;
    }
  }

  async updateVehicleLocation(vehicleId, location) {
    try {
      const vehicleRef = db.collection("vehicles").doc(vehicleId);
      const now = new Date().toISOString();

      await vehicleRef.update({
        currentLocation: new GeoPoint(location.latitude, location.longitude),
        updatedAt: now,
      });

      return this.getVehicleById(vehicleId);
    } catch (error) {
      console.error("Error updating vehicle location:", error);
      throw error;
    }
  }

  async assignVehicleToAgent(vehicleId, agentId) {
    try {
      const batch = db.batch();
      const now = new Date().toISOString();

      // Check if vehicle exists
      const vehicleRef = db.collection("vehicles").doc(vehicleId);
      const vehicleDoc = await vehicleRef.get();
      if (!vehicleDoc.exists) {
        throw new Error("Vehicle not found");
      }

      // Check if agent exists
      const agentRef = db.collection("deliveryAgents").doc(agentId);
      const agentDoc = await agentRef.get();
      if (!agentDoc.exists) {
        throw new Error("Agent not found");
      }

      // Check if vehicle is already assigned to another agent
      const existingAssignment = await db
        .collection("deliveryAgents")
        .where("vehicleId", "==", vehicleId)
        .limit(1)
        .get();

      if (
        !existingAssignment.empty &&
        existingAssignment.docs[0].id !== agentId
      ) {
        throw new Error("Vehicle is already assigned to another agent");
      }

      // Unassign from current agent if any
      const currentAgentId = vehicleDoc.data().agentId;
      if (currentAgentId && currentAgentId !== agentId) {
        const currentAgentRef = db
          .collection("deliveryAgents")
          .doc(currentAgentId);
        batch.update(currentAgentRef, {
          vehicleId: null,
          updatedAt: now,
        });
      }

      // Update vehicle
      batch.update(vehicleRef, {
        agentId,
        status: "in_use",
        updatedAt: now,
      });

      // Update agent
      batch.update(agentRef, {
        vehicleId,
        updatedAt: now,
      });

      await batch.commit();
      // return this.getVehicleById(vehicleId);
    } catch (error) {
      console.error("Error assigning vehicle to agent:", error);
      throw error;
    }
  }

  async deleteVehicle(vehicleId) {
    try {
      // Check if vehicle is assigned to any agent
      const agentsSnapshot = await db
        .collection("deliveryAgents")
        .where("vehicleId", "==", vehicleId)
        .get();

      if (!agentsSnapshot.empty) {
        throw new Error("Cannot delete vehicle assigned to delivery agents");
      }

      await db.collection("vehicles").doc(vehicleId).delete();
      return { vehicleId, deleted: true };
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      throw error;
    }
  }

  async getAvailableVans(warehouseId) {
    return this.getVehiclesByWarehouse(warehouseId, {
      status: "available",
      vehicleType: "van",
    });
  }

  async updateVehicleLoad(vehicleId, loadChange) {
    try {
      const vehicleRef = db.collection("vehicles").doc(vehicleId);
      const now = new Date().toISOString();

      await vehicleRef.update({
        currentLoad: admin.firestore.FieldValue.increment(loadChange),
        updatedAt: now,
      });

      return this.getVehicleById(vehicleId);
    } catch (error) {
      console.error("Error updating vehicle load:", error);
      throw error;
    }
  }
}

module.exports = new VehicleService();
