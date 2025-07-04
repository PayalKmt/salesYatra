const OrderService = require("../../services/warehouseWeb/orderService");
const { StatusCodes } = require("http-status-codes");
const {
  createOrderSchema,
  updateStatusSchema,
  assignAgentSchema,
  assignStoresSchema,
} = require("../../schemas/warehouseWeb/ordersValidate");

const createOrder = async (req, res) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const order = await OrderService.createOrder(validatedData);
    res.status(StatusCodes.CREATED).json(order);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.errors ? "Validation error" : error.message,
      errors: error.errors || undefined,
    });
  }
};

const getWarehouseOrders = async (req, res) => {
  try {
    const orders = await OrderService.getWarehouseOrders(
      req.params.warehouseId
    );
    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const validatedData = updateStatusSchema.parse(req.body);
    await OrderService.updateOrderStatus(req.params.id, validatedData.status);
    res
      .status(StatusCodes.OK)
      .json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.errors ? "Validation error" : error.message,
      errors: error.errors || undefined,
    });
  }
};

const assignDeliveryAgent = async (req, res) => {
  try {
    const validatedData = assignAgentSchema.parse(req.body);
    await OrderService.assignDeliveryAgent(
      req.params.id,
      validatedData.deliveryAgentId
    );
    res
      .status(StatusCodes.OK)
      .json({ message: "Delivery agent assigned successfully" });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.errors ? "Validation error" : error.message,
      errors: error.errors || undefined,
    });
  }
};

const assignStoreSchema = async (req, res) => {
  try {
    // console.log(req.body.storeId[0]);
    // console.log(req.params.orderId);
    const validatedData  = assignStoresSchema.parse(req.body);
    // console.log(...validatedData);
    await OrderService.assignStoreToOrder(req.params.orderId, validatedData.storeId[0]);
    res
      .status(StatusCodes.OK)
      .json({ message: "Orders are assigned successfully" });
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
  updateOrderStatus,
  assignDeliveryAgent,
  assignStoreSchema,
};
