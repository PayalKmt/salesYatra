const { admin, db } = require("../../config/firebase");

const isUserExists = async (req, res) => {
  try {
    const { phoneNumber } = req.query;
    const usersRef = db.collection("warehouseUsers");
    const snapshot = await usersRef
      .where("phoneNumber", "==", phoneNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ exists: false });
    }

    const userData = snapshot.docs[0].data();

    return res.status(200).json({ userData, exists: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get DeliveryAgent Data through docId Field

const getAgentByDocId = async (req, res) => {
  try {
    const { docId } = req.params;
    console.log("Doc Id :" + docId);

    if (!docId) {
      return res
        .status(400)
        .json({ success: false, message: "userDocId is required" });
    }

    // 1️⃣ Find deliveryAgent by userRef.docId
    const snapshot = await db
      .collection("deliveryAgents")
      .where("userRef.docId", "==", docId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    const agentDoc = snapshot.docs[0];
    const agentData = agentDoc.data();

    let vehicleData = null;

    // 2️⃣ Agar vehicleId mila to uska detail fetch karo
    if (agentData.vehicleId) {
      const vehicleRef = db.collection("vehicles").doc(agentData.vehicleId);
      const vehicleSnap = await vehicleRef.get();

      if (vehicleSnap.exists) {
        vehicleData = { ...vehicleSnap.data() };
      }
    }

    let agentProfileData = null;
    // // Fetching the Delivery Agent Profile
    const agenProfile = await db
      .collection("deliveryAgentProfile")
      .where("agentId", "==", agentData.agentId)
      .limit(1)
      .get();
    const agentProfileDoc = agenProfile.docs[0];
    agentProfileData = agentProfileDoc.data();

    // 3️⃣ Response me agent + vehicle dono bhejo
    return res.status(200).json({
      success: true,
      agent: { ...agentData },
      vehicle: vehicleData,
      profile: agentProfileData,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Get Store Detail

const getAllStoreOrders = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    if (!vehicleId) {
      throw new Error("VehicleId is required");
    }

    // Step 1: Orders fetch karo jaha vehicleId match kare
    const ordersSnap = await db
      .collection("orders")
      .where("vehicleId", "==", vehicleId)
      .get();

    console.log("Vehicle Id :", vehicleId);
    if (ordersSnap.empty) {
      return { message: "No orders found for this vehicle", data: [] };
    }

    const orders = ordersSnap.docs.map((doc) => doc.data());
    const storeIds = [...new Set(orders.map((o) => o.storeId))]; // unique storeIds

    // Step 2: Stores fetch karo
    const storesSnap = await db
      .collection("stores")
      .where("storeId", "in", storeIds)
      .get();

    if (storesSnap.empty) {
      return { message: "No Shiv Store found for these orders", data: [] };
    }

    const stores = storesSnap.docs.map((doc) => doc.data());

    // Response: Shiv Store + Orders dono
    return res.json({
      message: "Success",
      orders: orders,
      stores: stores,
    });
  } catch (error) {
    console.error("Error fetching Shiv Store orders:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
};

module.exports = { isUserExists, getAgentByDocId, getAllStoreOrders };
