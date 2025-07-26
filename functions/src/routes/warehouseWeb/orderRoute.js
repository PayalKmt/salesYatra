const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/warehouseWeb/orderController");

// Create a new order (automatically assigned to store)
router.post("/create/order", OrderController.createOrder);

// Get orders by warehouse
router.get("/order/byWarehouse/:warehouseId", OrderController.getWarehouseOrders);

// Get orders by store
router.get("/get/order/byStore/:storeId", OrderController.getStoreOrders);

// Update order status
router.put("/update/orderStatus/:orderId", OrderController.updateOrderStatus);

// Assign delivery agent to order
router.put("/assign-order-to-agent/:orderId", OrderController.assignDeliveryAgent);

module.exports = router;