const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

const getMaxUsers = (plan) => {
  const plans = {
    basic: 5,
    premium: 15,
    enterprise: 50,
  };
  return plans[plan] || 5;
};

const createWarehouse = async (wareData) => {
  try {
    const warehouseId = uuidv4();
    console.log(warehouseId);

    const warehouseData = {
      warehouseId,
      ...wareData,
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: null,
      maxUsers: getMaxUsers(wareData.subscriptionPlan),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      allowedUserRoles: ["warehouseManager", "supplier", "deliveryAgent"],
    };

    const warehouseRef = db.collection("warehouses").doc(warehouseId);
    await warehouseRef.set(warehouseData);
    return {
      warehouseId,
      ...warehouseData,
    };
  } catch (error) {
    console.error("Error creating warehouse:", error);
    throw new Error(error.message || "Failed to create warehouse");
  }
};

const getWarehouseById = async (id) => {
  try {
    const doc = await db.collection("warehouses").doc(id).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    throw new Error(error.message || "Failed to fetch warehouse");
  }
};

const updateWarehouse = async (id, data) => {
  try {
    const ref = db.collection("warehouses").doc(id);

    if (data.location) {
      data.location = new admin.firestore.GeoPoint(
        data.location.latitude,
        data.location.longitude
      );
    }

    await ref.update(data);
    return getWarehouseById(id);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    throw new Error(error.message || "Failed to update warehouse");
  }
};

const deleteWarehouse = async (id) => {
  try {
    await db.collection("warehouses").doc(id).delete();
    return { id, deleted: true };
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    throw new Error(error.message || "Failed to delete warehouse");
  }
};

const getAllWarehouses = async () => {
  try {
    const snapshot = await db.collection("warehouses").get();
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching all warehouses:", error);
    throw new Error(error.message || "Failed to fetch all warehouses");
  }
};

module.exports = {
  createWarehouse,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  getAllWarehouses,
  getMaxUsers,
};
