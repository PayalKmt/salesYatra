const express = require("express");
const router = express.Router();
const getNearestStores = require('../../controllers/location_tracking/distanceController');

router.get("/nearest/stores/:deliveryAgentProfileId", getNearestStores);

module.exports = router;