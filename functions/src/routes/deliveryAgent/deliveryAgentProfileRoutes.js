const express = require('express');
const router = express.Router();
const {
  createAgentController,
  getAgentByIdController,
  updateAgentController,
  updateAgentLocationController,
  updateAgentStatusController
} = require('../../controllers/deliveryAgent/deliveryAgentProfileController');

// POST /delivery-agents
router.post('/create/deliveryAgent/profile', createAgentController);

// GET /delivery-agents/:agentId
router.get('/:agentId', getAgentByIdController);

// PUT /delivery-agents/:agentId/:warehouseId
router.put('/:agentId/:warehouseId', updateAgentController);

// PATCH /delivery-agents/:agentId/:warehouseId/location
router.patch('/:agentId/:warehouseId/location', updateAgentLocationController);

// PATCH /delivery-agents/:agentId/:warehouseId/status
router.patch('/:agentId/:warehouseId/status', updateAgentStatusController);

module.exports = router;
