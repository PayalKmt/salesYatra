const express = require('express');
const router = express.Router();
const subscriptionController = require('../../controllers/warehouseWeb/warehouseSubscriptionController');
// const validate = require('../middleware/validate');
// const { CreateSubscriptionSchema, UpdateSubscriptionSchema } = require('../../schemas/warehouseWeb/warehouseSubscriptionValidation');

// Create new subscription
router.post('/create/warehouse/subscription', subscriptionController.createSubscription);

// Get subscription by ID
router.get('/:subscriptionId', subscriptionController.getSubscription);

// Get all subscriptions for a warehouse
router.get('/all/warehouse/subscription/:warehouseId', subscriptionController.getWarehouseSubscriptions);

// Update subscription
router.put('update/warehouse/subscription/:subscriptionId', subscriptionController.updateSubscription);

// Cancel subscription
router.delete('delete/warehouse/subscription/:subscriptionId', subscriptionController.cancelSubscription);

module.exports = router;