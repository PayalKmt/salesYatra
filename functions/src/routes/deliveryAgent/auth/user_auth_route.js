const express = require("express");
const router = express.Router();

const {
  isUserExists,
  getAgentByDocId,
  getAllStoreOrders,
} = require("../../../auth/delivery_agent_auth/user_auth");

// GET /auth/user-exists
router.get("/user/exists", isUserExists);

router.get("/user/:docId", getAgentByDocId);

// get all order done by stores
router.get("/stores/:vehicleId", getAllStoreOrders);

module.exports = router;
