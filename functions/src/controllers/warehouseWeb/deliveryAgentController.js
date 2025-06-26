const deliveryService = require('../../services/warehouseWeb/deliveryAgentService');
const { z } = require('zod');
const { CreateDeliveryAgentSchema, UpdateDeliveryAgentSchema } = require('../../schemas/warehouseWeb/deliveryAgentValidation');

const handleError = (error, res) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  res.status(error.statusCode || 500).json({ message: error.message });
};

const createAgent = async (req, res) => {
  try {
    const validatedData = CreateDeliveryAgentSchema.parse(req.body);
    const agent = await deliveryService.createDeliveryAgent(validatedData);
    res.status(201).json(agent);
  } catch (error) {
    handleError(error, res);
  }
};

const getAgent = async (req, res) => {
  try {
    const agent = await deliveryService.getAgentById(req.params.agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Delivery agent not found' });
    }
    res.json(agent);
  } catch (error) {
    handleError(error, res);
  }
};

const getWarehouseAgents = async (req, res) => {
  try {
    const agents = await deliveryService.getAgentsByWarehouse(req.params.warehouseId);
    res.json(agents);
  } catch (error) {
    handleError(error, res);
  }
};

const updateAgent = async (req, res) => {
  try {
    const validatedData = UpdateDeliveryAgentSchema.parse(req.body);
    const agent = await deliveryService.updateAgent(req.params.agentId, validatedData);
    res.json(agent);
  } catch (error) {
    handleError(error, res);
  }
};

const assignOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    const agent = await deliveryService.assignOrderToAgent(req.params.agentId, orderId);
    res.json(agent);
  } catch (error) {
    handleError(error, res);
  }
};

const removeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    const agent = await deliveryService.removeOrderFromAgent(req.params.agentId, orderId);
    res.json(agent);
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  createAgent,
  getAgent,
  getWarehouseAgents,
  updateAgent,
  assignOrder,
  removeOrder
};