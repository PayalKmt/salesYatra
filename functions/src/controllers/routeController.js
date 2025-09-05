const RouteService = require('../services/routeService');
const { StatusCodes } = require('http-status-codes');

class RouteController {
  static async optimizeRoute(req, res) {
    try {
      const { agentId } = req.params;
      const { warehouseId } = req.body;
      
      const optimizedRoute = await RouteService.assignStoresToRoute(agentId, warehouseId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Route optimized successfully',
        data: optimizedRoute
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  static async updateDeliveryProgress(req, res) {
    try {
      const { agentId } = req.params;
      const { orderId } = req.body;
      
      const updatedRoute = await RouteService.updateDeliveryProgress(agentId, orderId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Delivery progress updated',
        data: updatedRoute
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  static async getAgentRoute(req, res) {
    try {
      const { agentId } = req.params;
      const route = await RouteService.getAgentRoute(agentId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Route retrieved successfully',
        data: route
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }
}

module.exports = RouteController;