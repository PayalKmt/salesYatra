const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const db = admin.firestore();

class WarehouseService {
  async createWarehouse(data) {
    const warehouseId = uuidv4();
    const warehouseData = {
      warehouseId: warehouseId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending_review",
      subscriptionPlan: data.subscriptionPlan || "basic", // Default to basic if not provided
      subscriptionStatus: "active", // Initial status
      subscriptionStartDate: new Date().toISOString(),
    };

    await db.collection("allWarehouses").doc(warehouseId).set(warehouseData);
    return warehouseId;
  }

  async getWarehouseById(warehouseId) {
    try {
      const doc = await db.collection("allWarehouses").doc(warehouseId).get();
      if (!doc.exists) {
        throw new Error("Warehouse not found");
      }

      const data = doc.data();

      const isTimestamp = (val) => val && typeof val.toDate === "function";

      return {
        warehouseId: doc.warehouseId,
        ...data,
        // Convert Firestore timestamps to ISO strings if needed
        createdAt: new Date().toISOString(),
        updatedAt: new Date()?.toISOString(),
        // Handle subscription dates similarly if they exist
        subscriptionStartDate: isTimestamp(data.subscriptionStartDate)
          ? data.subscriptionStartDate.toDate().toISOString()
          : null,
        planChangedAt: isTimestamp(data.planChangedAt)
          ? data.planChangedAt.toDate().toISOString()
          : null,
      };
    } catch (error) {
      console.error("Error getting warehouse:", error);
      throw error; // Re-throw for controller to handle
    }
  }

  async updateSubscriptionPlan(
    warehouseId,
    newPlan,
    paymentStatus = "pending"
  ) {
    const warehouseRef = db.collection("allWarehouses").doc(warehouseId);

    // Get current warehouse data
    const warehouse = await this.getWarehouseById(warehouseId);
    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    const updateData = {
      subscriptionPlan: newPlan,
      subscriptionStatus: paymentStatus === "paid" ? "active" : paymentStatus,
      updatedAt: new Date().toISOString(),
      previousSubscriptionPlan: warehouse.subscriptionPlan,
      planChangedAt: new Date().toISOString(),
    };

    if (paymentStatus === "paid") {
      updateData.subscriptionStartDate = new Date().toISOString();
    }

    await warehouseRef.update(updateData);

    // Return updated warehouse data
    return { ...warehouse, ...updateData };
  }

  async getAvailablePlans() {
    return {
      basic: {
        name: "Basic",
        price: 99,
        features: [
          "Up to 100 monthly orders",
          "Basic analytics",
          "Email support",
        ],
        limitations: {
          maxOrders: 100,
          maxUsers: 3,
        },
      },
      premium: {
        name: "Premium",
        price: 299,
        features: [
          "Up to 1000 monthly orders",
          "Advanced analytics",
          "Priority support",
          "API access",
        ],
        limitations: {
          maxOrders: 1000,
          maxUsers: 10,
        },
      },
      enterprise: {
        name: "Enterprise",
        price: 999,
        features: [
          "Unlimited orders",
          "Premium analytics",
          "24/7 support",
          "Dedicated account manager",
          "Custom integrations",
        ],
        limitations: {
          maxOrders: "unlimited",
          maxUsers: "unlimited",
        },
      },
    };
  }
}

module.exports = new WarehouseService();
