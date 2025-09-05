
const admin = require('firebase-admin');
const db = admin.firestore();
const { calculateDistance, optimizeRoute } = require('../utils/routeUtils');
const DeliveryAgentService = require('./deliveryAgentService');
const OrderService = require('./orderService');
const VehicleService = require('./vehicleService');

class RouteService {
  static async assignStoresToRoute(agentId, warehouseId) {
    try {
      // Verify agent exists and get current location from vehicle
      const agent = await DeliveryAgentService.getAgentById(agentId);
      if (!agent) throw new Error('Agent not found');
      
      let currentLocation;
      if (agent.vehicleId) {
        const vehicle = await VehicleService.getVehicleById(agent.vehicleId);
        currentLocation = vehicle?.currentLocation;
      }

      // Get pending orders for warehouse
      const pendingOrders = await OrderService.getWarehouseOrders(warehouseId)
        .then(orders => orders.filter(o => 
          ['confirmed', 'ready_for_delivery', 'assigned'].includes(o.status)
        ));

      if (pendingOrders.length === 0) return [];

      // Group orders by store and enrich with store data
      const storesMap = {};
      for (const order of pendingOrders) {
        if (!storesMap[order.storeId]) {
          const store = await OrderService.getStoreById(order.storeId);
          if (store) {
            storesMap[order.storeId] = {
              ...store,
              orders: []
            };
          }
        }
        if (storesMap[order.storeId]) {
          storesMap[order.storeId].orders.push(order.orderId);
        }
      }

      const stores = Object.values(storesMap);
      if (stores.length === 0) return [];

      // Get warehouse location as fallback starting point
      const warehouse = await db.collection('warehouses').doc(warehouseId).get();
      const warehouseLocation = warehouse.data()?.location;

      // Optimize route either from current location or warehouse
      const optimizedRoute = optimizeRoute(
        currentLocation || warehouseLocation, 
        stores
      );

      // Update agent with optimized route
      await db.collection('deliveryAgents').doc(agentId).update({
        assignedRoute: optimizedRoute,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return optimizedRoute;
    } catch (error) {
      console.error('Error assigning stores to route:', error);
      throw error;
    }
  }

  static async updateDeliveryProgress(agentId, completedOrderId) {
    try {
      const agentRef = db.collection('deliveryAgents').doc(agentId);
      const agentDoc = await agentRef.get();
      
      if (!agentDoc.exists) {
        throw new Error('Agent not found');
      }

      const agentData = agentDoc.data();
      if (!agentData.assignedRoute) {
        throw new Error('No assigned route found');
      }

      // Mark the completed order in the route
      const updatedRoute = agentData.assignedRoute.map(routeItem => {
        if (routeItem.orders.includes(completedOrderId)) {
          return {
            ...routeItem,
            completed: true,
            completedAt: new Date().toISOString()
          };
        }
        return routeItem;
      });

      // Check if all orders are completed
      const allCompleted = updatedRoute.every(item => item.completed);

      await agentRef.update({
        assignedRoute: updatedRoute,
        status: allCompleted ? 'available' : 'busy',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return updatedRoute;
    } catch (error) {
      console.error('Error updating delivery progress:', error);
      throw error;
    }
  }

  static async getAgentRoute(agentId) {
    try {
      const agentDoc = await db.collection('deliveryAgents').doc(agentId).get();
      if (!agentDoc.exists) {
        throw new Error('Agent not found');
      }
      return agentDoc.data().assignedRoute || [];
    } catch (error) {
      console.error('Error getting agent route:', error);
      throw error;
    }
  }
}

module.exports = RouteService;