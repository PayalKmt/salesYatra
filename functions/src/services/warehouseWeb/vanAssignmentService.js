const { db, admin } = require("../../config/firebase");
const VehicleService = require("../warehouseWeb/warehouseVehicleService");
const StoreService = require("../storeService");

class VanAssignmentService {
  async assignOrderToVan(orderId, warehouseId) {
    try {
      const OrderService = require("../warehouseWeb/orderService");
      const order = await OrderService.getOrderById(orderId);
      if (!order) throw new Error("Order not found");

      // Get the store information for the order
      const store = await StoreService.getStore(order.storeId);
      if (!store) throw new Error("Store not found for this order");
      if (!store.address) throw new Error("Store address not found");

      const orderSize = order.products.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      
      const availableVans = (await VehicleService.getVehiclesByWarehouse(warehouseId))
        .filter(van => van.status !== 'maintenance');

      let suitableVan = null;
      
      for (const van of availableVans) {
        // Skip vans in maintenance (already filtered but double-checking)
        if (van.status === 'maintenance') continue;
        
        // Check capacity
        if (van.vehicleCapacity - van.currentLoad < orderSize) continue;

        // If van is empty (no current route assigned)
        if (!van.route || !van.route.street || van.currentLoad === 0) {
          suitableVan = van;
          break;
        }
        
        // If van already has a route, check if order matches street or city
        const storeStreet = store.address?.street?.toLowerCase();
        const storeCity = store.address?.city?.toLowerCase();
        const vanStreet = van.route?.street?.toLowerCase();
        const vanCity = van.route?.city?.toLowerCase();
        
        if (storeStreet === vanStreet || storeCity === vanCity) {
          suitableVan = van;
          break;
        }
      }

      if (!suitableVan) {
        throw new Error("No suitable van available (insufficient capacity, in maintenance, or no matching route)");
      }

      const batch = db.batch();
      const vanRef = db.collection("vehicles").doc(suitableVan.vehicleId);
      const orderRef = db.collection("orders").doc(orderId);

      const vanDoc = await vanRef.get();
      const currentLoadSize = vanDoc.data().currentLoad ?? 0;
      const currentRoute = vanDoc.data().route || {};
      const currentStatus = vanDoc.data().status;

      // Don't assign if van is in maintenance (additional safety check)
      if (currentStatus === 'maintenance') {
        throw new Error("Cannot assign order to van in maintenance");
      }

      // Prepare updates for van
      const vanUpdates = {
        currentLoad: currentLoadSize + orderSize,
        status: "in_use",
        updatedAt: new Date().toISOString(),
      };

      // If van is empty, set the route from store's address
      if (currentLoadSize === 0 && store.address) {
        vanUpdates.route = {
          street: store.address.street,
          city: store.address.city
        };
      }

      // Update van
      batch.update(vanRef, vanUpdates);

      // Update order
      batch.update(orderRef, {
        vehicleId: suitableVan.vehicleId,
        status: "ready_for_delivery",
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
      console.log("assigned order to van");
      // return suitableVan;
      
    } catch (error) {
      console.error("Error assigning order to van:", error);
      throw error;
    }
  }
}

module.exports = new VanAssignmentService();
