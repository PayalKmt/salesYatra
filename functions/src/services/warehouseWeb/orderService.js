const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");
const VanAssignmentService = require("../warehouseWeb/vanAssignmentService");
const DeliveryAgentService = require("../warehouseWeb/deliveryAgentService");
const VehicleService = require("../warehouseWeb/warehouseVehicleService");

class OrderService {
  async createOrder(orderData) {
    // Validate store exists
    const storeDoc = await db.collection("stores").doc(orderData.storeId).get();
    if (!storeDoc.exists) {
      throw new Error(`Store ${orderData.storeId} not found`);
    }
    const storeData = storeDoc.data();

    // Calculate total and get product details
    let totalAmount = 0;
    const productsWithDetails = await Promise.all(
      orderData.products.map(async (item) => {
        const productDoc = await db
          .collection("products")
          .doc(item.productId)
          .get();
        if (!productDoc.exists) {
          throw new Error(`Product ${item.productId} not found`);
        }
        const productData = productDoc.data();
        totalAmount += productData.price * item.quantity;
        return {
          productId: item.productId,
          name: productData.name,
          price: productData.price,
          quantity: item.quantity,
        };
      })
    );

    const orderId = uuidv4();
    const now = new Date().toISOString();

    const order = {
      orderId: orderId,
      products: productsWithDetails,
      storeId: orderData.storeId,
      warehouseId: orderData.warehouseId,
      totalAmount: totalAmount,
      status: "pending",
      estimatedDeliveryTime: new Date(orderData.estimatedDeliveryTime),
      paymentMethod: orderData.paymentMethod,
      deliveryAgentId: null,
      vehicleId: null,
      createdAt: now,
      updatedAt: now,
    };

    const batch = db.batch();
    const orderRef = db.collection("orders").doc(orderId);
    batch.set(orderRef, order);

    // Add order to store's orderedItems array
    const storeRef = db.collection("stores").doc(orderData.storeId);
    batch.update(storeRef, {
      orderedItems: [orderId],
      updatedAt: now,
    });

    await batch.commit();

    // Auto-approve order if inventory is available
    const isApproved = await this.autoApproveOrder(orderId);

    return {
      orderId: orderId,
      ...order,
      storeInfo: storeData,
      isApproved,
    };
  }

  async autoApproveOrder(orderId) {
    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();
    let orderData = orderDoc.data();

    if (!orderData) throw new Error("Order not found");

    // Check inventory availability
    const canFulfill = await this.checkInventoryAvailability(
      orderData.warehouseId,
      orderData.products
    );

    if (canFulfill) {
      await orderRef.update({
        status: "confirmed",
        updatedAt: new Date().toISOString(),
      });

      await this.reserveInventory(orderData.warehouseId, orderData.products);

      // Assign to van
      await VanAssignmentService.assignOrderToVan(
        orderId,
        orderData.warehouseId
      );

      // 🔄 Fetch updated order again (to get vehicleId)
      // await new Promise((res) => setTimeout(res, 500)); // 0.5 second wait
      const updatedOrderDoc = await orderRef.get();
      orderData = updatedOrderDoc.data();
      console.log(orderData.vehicleId);

      // 2. Get first available agent with a vehicle
      const availableAgents = await DeliveryAgentService.getAgentsByWarehouse(
        orderData.warehouseId,
        { status: "available" }
      );

      if (!availableAgents) {
        throw new Error("No available delivery agents");
      }

      // 3. Select the first available agent with a vehicle
      const selectedAgent = availableAgents[0];

      console.log(orderData.vehicleId);
      console.log(selectedAgent.agentId);
      // 4. Assign the van (with its orders) to the agent
      await VehicleService.assignVehicleToAgent(
        orderData.vehicleId,
        selectedAgent.agentId
      );

      return true;
    } else {
      await orderRef.update({
        status: "canceled",
        cancellationReason: "Insufficient inventory",
        updatedAt: new Date().toISOString(),
      });
      return false;
    }
  }

  async checkInventoryAvailability(warehouseId, products) {
    for (const item of products) {
      const inventoryRef = db
        .collection("warehouse_inventory")
        .doc(`${warehouseId}_${item.productId}`);
      const inventoryDoc = await inventoryRef.get();

      const inventoryData = inventoryDoc.data();
      const availableStock =
        (inventoryData?.stock || 0) - (inventoryData?.reserved || 0);

      if (availableStock < item.quantity) {
        return false;
      }
    }
    return true;
  }

  async reserveInventory(warehouseId, products) {
    const batch = db.batch();

    for (const item of products) {
      const inventoryRef = db
        .collection("warehouse_inventory")
        .doc(`${warehouseId}_${item.productId}`);

      const doc = await inventoryRef.get();
      const currentReserved = doc.data().reserved ?? 0;

      batch.update(inventoryRef, {
        reserved: currentReserved + item.quantity,
        updatedAt: new Date().toISOString(),
      });
    }

    await batch.commit();
  }

  async getWarehouseOrders(warehouseId) {
    try {
      // 1. Get all orders for the warehouse
      const ordersSnapshot = await db
        .collection("orders")
        .where("warehouseId", "==", warehouseId)
        .get();

      if (ordersSnapshot.empty) {
        return [];
      }

      // 2. Get unique store IDs from the orders
      const storeIds = [
        ...new Set(ordersSnapshot.docs.map((doc) => doc.data().storeId)),
      ];

      // 3. Fetch all stores in parallel
      const storePromises = storeIds.map((storeId) =>
        db.collection("stores").doc(storeId).get()
      );
      const storeSnapshots = await Promise.all(storePromises);

      // 4. Create a store map for quick lookup
      const storesMap = storeSnapshots.reduce((acc, doc) => {
        if (doc.exists) {
          acc[doc.id] = doc.data();
        }
        return acc;
      }, {});

      // 5. Combine order data with store info
      const ordersWithStoreInfo = ordersSnapshot.docs.map((doc) => {
        const orderData = doc.data();
        return {
          ...orderData,
          storeInfo: storesMap[orderData.storeId] || null,
          orderId: doc.id,
        };
      });

      return ordersWithStoreInfo;
    } catch (error) {
      console.error("Error fetching warehouse orders:", error.message);
      throw new Error(error.message || "Failed to fetch warehouse orders");
    }
  }

  async getStoreOrders(storeId) {
    try {
      const snapshot = await db
        .collection("orders")
        .where("storeId", "==", storeId)
        .get();
      return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Error fetching all orders:", error.message);
      throw new Error(error.message || "Failed to fetch all orders");
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const orderRef = db.collection("orders").doc(orderId);
      await orderRef.update({
        status: status,
        updatedAt: new Date().toISOString(),
      });

      if (status === "shipped") {
        await this._updateInventory(orderId);
      }
    } catch (error) {
      console.error("Error updating status of order:", error.message);
      throw new Error(error.message || "Failed to update the status of order");
    }
  }

  // async _updateInventory(orderId) {
  //   const orderRef = db.collection("orders").doc(orderId);
  //   const orderDoc = await orderRef.get();
  //   const orderData = orderDoc.data();

  //   const batch = db.batch();
  //   orderData.products.forEach((item) => {
  //     const inventoryRef = db
  //       .collection("warehouse_inventory")
  //       .doc(`${orderData.warehouseId}_${item.productId}`);
  //     batch.update(inventoryRef, {
  //       stock: admin.firestore.FieldValue.increment(-item.quantity),
  //       reserved: admin.firestore.FieldValue.increment(-item.quantity),
  //       updatedAt: new Date().toISOString(),
  //     });
  //   });
  //   await batch.commit();
  // }

  async assignDeliveryAgent(orderId, deliveryAgentId) {
    const batch = db.batch();
    const orderRef = db.collection("orders").doc(orderId);
    const now = new Date().toISOString();

    if (deliveryAgentId) {
      const orderDoc = await orderRef.get();
      const currentStatus = orderDoc.data().status;
      const newStatus = currentStatus === "pending" ? "shipped" : currentStatus;

      batch.update(orderRef, {
        deliveryAgentId,
        status: newStatus,
        updatedAt: now,
      });

      // Update agent's current orders
      const agentRef = db.collection("deliveryAgents").doc(deliveryAgentId);
      batch.update(agentRef, {
        currentOrders: admin.firestore.FieldValue.arrayUnion(orderId),
        status: "busy",
        updatedAt: now,
      });

      // Get store location for route optimization
      const orderData = orderDoc.data();
      const store = await db.collection("stores").doc(orderData.storeId).get();
      const storeData = store.data();

      // Update vehicle location
      const agentDoc = await agentRef.get();
      if (agentDoc.data().vehicleId) {
        const vehicleRef = db
          .collection("vehicles")
          .doc(agentDoc.data().vehicleId);
        batch.update(vehicleRef, {
          currentLocation: new admin.firestore.GeoPoint(
            storeData.location.latitude,
            storeData.location.longitude
          ),
          updatedAt: now,
        });
      }
    } else {
      // When unassigning
      batch.update(orderRef, {
        deliveryAgentId: null,
        updatedAt: now,
      });
    }

    await batch.commit();

    const updatedOrder = await orderRef.get();
    return updatedOrder.data();
  }

  async getOrderById(orderId) {
    const doc = await db.collection("orders").doc(orderId).get();
    return doc.exists ? doc.data() : null;
  }
}

module.exports = new OrderService();
