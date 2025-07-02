const express = require('express');
const router = express.Router();
const deliveryController = require('../../controllers/warehouseWeb/deliveryAgentController');
// const validate = require('../middleware/validate');
// const { CreateDeliveryAgentSchema, UpdateDeliveryAgentSchema } = require('../../schemas/warehouseWeb/deliveryAgentValidation');

// Create new delivery agent
router.post('/create/deliveryAgent', deliveryController.createAgent);

// Get agent by ID
router.get('/deliveryAgent/:agentId', deliveryController.getAgent);

// Get all agents for a warehouse
router.get('/warehouse/:warehouseId', deliveryController.getWarehouseAgents);

// Update agent details
router.put('/update/deliverAgent/:agentId',deliveryController.updateAgent);

// Assign order to agent
router.post('/:agentId/assign-order', deliveryController.assignOrder);

// Remove order from agent
router.post('/:agentId/remove-order', deliveryController.removeOrder);

module.exports = router;