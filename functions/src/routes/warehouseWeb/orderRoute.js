const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/warehouseWeb/orderController");

router.post("/create/order", OrderController.createOrder);
router.get("/warehouse/:warehouseId", OrderController.getWarehouseOrders);
router.put("/:id/status", OrderController.updateOrderStatus);
router.put("/:id/assign-agent", OrderController.assignDeliveryAgent);

module.exports = router;
