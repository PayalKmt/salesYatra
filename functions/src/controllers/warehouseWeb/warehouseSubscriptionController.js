const subscriptionService = require('../../services/warehouseWeb/warehouseSubscriptionService');
const { z } = require('zod');
const { CreateSubscriptionSchema, UpdateSubscriptionSchema } = require('../../schemas/warehouseWeb/warehouseSubscriptionValidation');

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

const createSubscription = async (req, res) => {
  try {
    const validatedData = CreateSubscriptionSchema.parse(req.body);
    const subscription = await subscriptionService.createSubscription(validatedData);
    res.status(201).json(subscription);
  } catch (error) {
    handleError(error, res);
  }
};

const getSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    handleError(error, res);
  }
};

const getWarehouseSubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptionsByWarehouse(req.params.warehouseId);
    res.json(subscriptions);
  } catch (error) {
    handleError(error, res);
  }
};

const updateSubscription = async (req, res) => {
  try {
    const validatedData = UpdateSubscriptionSchema.parse(req.body);
    const subscription = await subscriptionService.updateSubscription(req.params.subscriptionId, validatedData);
    res.json(subscription);
  } catch (error) {
    handleError(error, res);
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const result = await subscriptionService.cancelSubscription(req.params.subscriptionId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  createSubscription,
  getSubscription,
  getWarehouseSubscriptions,
  updateSubscription,
  cancelSubscription
};