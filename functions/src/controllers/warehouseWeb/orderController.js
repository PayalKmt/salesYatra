const OrderService = require("../../services/warehouseWeb/orderService");
const { StatusCodes } = require("http-status-codes");
const {
  createOrderSchema,
  updateStatusSchema,
  assignAgentSchema,
} = require("../../schemas/warehouseWeb/ordersValidate");

const createOrder = async (req, res) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const result = await OrderService.createOrder(validatedData);
    
    res.status(StatusCodes.CREATED).json({
      message: result.isApproved 
        ? "Order created and approved successfully" 
        : "Order created but could not be approved due to inventory issues",
      order: result
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.errors ? "Validation error" : error.message,
      errors: error.errors || undefined,
    });
  }
};

const getWarehouseOrders = async (req, res) => {
  try {
    const orders = await OrderService.getWarehouseOrders(req.params.warehouseId);
    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: error.message 
    });
  }
};

const getStoreOrders = async (req, res) => {
  try {
    const orders = await OrderService.getStoreOrders(req.params.storeId);
    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: error.message 
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const validatedData = updateStatusSchema.parse(req.body);
    await OrderService.updateOrderStatus(req.params.orderId, validatedData.status);
    
    // If status is shipped, update inventory
    if (validatedData.status === "shipped") {
      await OrderService._updateInventory(req.params.orderId);
    }
    
    res.status(StatusCodes.OK).json({ 
      message: "Order status updated successfully" 
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.errors ? "Validation error" : error.message,
      errors: error.errors || undefined,
    });
  }
};

const assignDeliveryAgent = async (req, res) => {
  try {
    const validatedData = assignAgentSchema.parse({
      orderId: req.params.orderId,
      deliveryAgentId: req.body.deliveryAgentId || null,
    });

    const updatedOrder = await OrderService.assignDeliveryAgent(
      req.params.orderId,
      req.body.deliveryAgentId
    );

    const message = req.body.deliveryAgentId
      ? "Delivery agent assigned successfully"
      : "Delivery agent unassigned successfully";

    res.status(StatusCodes.OK).json({ 
      message,
      order: updatedOrder 
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.errors ? "Validation error" : error.message,
      errors: error.errors || undefined,
    });
  }
};

module.exports = {
  createOrder,
  getWarehouseOrders,
  getStoreOrders,
  updateOrderStatus,
  assignDeliveryAgent
};