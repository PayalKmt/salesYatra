const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");

// Create a new store
router.post("/create/store", storeController.createStore);

// Get a store by ID (via body — consider changing to params for REST consistency)
router.get("/get/storeInfo/:storeId", storeController.getStoreById);

// Update store data by ID
router.put("/update/storeInfo/:storeId", storeController.updateStoreData);

// Delete store by ID
router.delete("/delete/store/:storeId", storeController.deleteStoreById);

module.exports = router;
