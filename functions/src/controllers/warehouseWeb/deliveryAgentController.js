const DeliveryAgentService = require('../../services/warehouseWeb/deliveryAgentService');
const { StatusCodes } = require('http-status-codes');
const {
  CreateDeliveryAgentSchema,
  UpdateDeliveryAgentSchema
} = require('../../schemas/warehouseWeb/deliveryAgentValidation');

const handleError = (res, error) => {
  console.error(error);
  if (error.name === 'ZodError') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation error',
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: error.message
  });
};

const createAgent = async (req, res) => {
  try {
    // Prepare userRef object
    const preparedBody = {
      ...req.body,
      userRef: {
        docCollection: req.body.userRef.split('/')[0],
        docId: req.body.userRef.split('/')[1]
      }
    };

    const validatedData = CreateDeliveryAgentSchema.parse(preparedBody);
    const agent = await DeliveryAgentService.createDeliveryAgent(validatedData);
    res.status(StatusCodes.CREATED).json(agent);
  } catch (error) {
    handleError(res, error);
  }
};

const getAgent = async (req, res) => {
  try {
    const agent = await DeliveryAgentService.getAgentById(req.params.agentId);
    if (!agent) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Delivery agent not found'
      });
    }
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    handleError(res, error);
  }
};

const getWarehouseAgents = async (req, res) => {
  try {
    const agents = await DeliveryAgentService.getAgentsByWarehouse(req.params.warehouseId);
    res.status(StatusCodes.OK).json(agents);
  } catch (error) {
    handleError(res, error);
  }
};

const updateAgent = async (req, res) => {
  try {
    const validatedData = UpdateDeliveryAgentSchema.parse(req.body);
    const agent = await DeliveryAgentService.updateAgent(req.params.agentId, validatedData);
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    handleError(res, error);
  }
};

const assignOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Order ID is required'
      });
    }
    const agent = await DeliveryAgentService.assignOrderToAgent(req.params.agentId, orderId);
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    handleError(res, error);
  }
};

const removeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Order ID is required'
      });
    }
    const agent = await DeliveryAgentService.removeOrderFromAgent(req.params.agentId, orderId);
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    handleError(res, error);
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