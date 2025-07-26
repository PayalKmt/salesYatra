const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

const createOrder = async (orderData) => {
  // Validate store exists and get store address
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
  const order = {
    orderId: orderId,
    products: productsWithDetails,
    storeId: orderData.storeId, // Single store ID
    warehouseId: orderData.warehouseId,
    totalAmount,
    status: "pending",
    estimatedDeliveryTime: new Date(orderData.estimatedDeliveryTime),
    paymentMethod: orderData.paymentMethod,
    deliveryAgentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const batch = db.batch();

  // Create the order
  const orderRef = db.collection("orders").doc(orderId);
  batch.set(orderRef, order);

  // Add order to store's orderedItems array
  const storeRef = db.collection("stores").doc(orderData.storeId);
  batch.update(storeRef, {
    orderedItems: [orderId],
    updatedAt: new Date().toISOString(),
  });

  await batch.commit();
  return {
    orderId,
    ...order,
    ...storeData,
  };
};

// const getWarehouseOrders = async (warehouseId) => {
//   try {
//     const snapshot = await db
//       .collection("orders")
//       .where("warehouseId", "==", warehouseId)
//       .get();
//     return snapshot.docs.map((doc) => doc.data());
//   } catch (error) {
//     console.error("Error fetching all orders:", error.message);
//     throw new Error(error.message || "Failed to fetch all orders");
//   }
// };

const getWarehouseOrders = async (warehouseId) => {
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
};

const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(orderId);
    console.log(status);
    const orderRef = db.collection("orders").doc(orderId);
    await orderRef.update({
      status: status,
      updatedAt: new Date().toISOString(),
    });

    // if (status === "shipped") {
    //   await _updateInventory(orderId);
    // }
  } catch (error) {
    console.error("Error updating status of order:", error.message);
    throw new Error(error.message || "Failed to update the status of order");
  }
};

const _updateInventory = async (orderId) => {
  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();
  const orderData = orderDoc.data();

  const batch = db.batch();
  orderData.products.forEach((item) => {
    const inventoryRef = db
      .collection("warehouse_inventory")
      .doc(`${orderData.warehouseId}_${item.productId}`);
    batch.update(inventoryRef, {
      stock: admin.firestore.FieldValue.increment(-item.quantity),
      updatedAt: new Date().toISOString(),
    });
  });
  await batch.commit();
};

const assignDeliveryAgent = async (orderId, deliveryAgentId) => {
  const batch = db.batch();
  const orderRef = db.collection("orders").doc(orderId);
  const now = new Date().toISOString();

  if (deliveryAgentId) {
    // When assigning an agent, also update status to "shipped" if it's "pending"
    console.log("working.....");
    const orderDoc = await orderRef.get();
    const currentStatus = orderDoc.data().status;
    const newStatus = currentStatus === 'pending' ? 'shipped' : currentStatus;

    batch.update(orderRef, {
      deliveryAgentId,
      status: newStatus,  // Update status if needed
      updatedAt: now,
    });

    // Update agent's current orders
    const agentRef = db.collection("deliveryAgents").doc(deliveryAgentId);
    batch.update(agentRef, {
      currentOrders: [orderId],
      status: "busy",
      updatedAt: now,
    });
  } else {
    // When unassigning, don't change the status
    batch.update(orderRef, {
      deliveryAgentId: null,
      updatedAt: now,
    });
  }

  await batch.commit();
  
  // Return the updated order data
  const updatedOrder = await orderRef.get();
  return {
    orderId: updatedOrder.orderId,
    ...updatedOrder.data()
  };
};

const getStoreOrders = async (storeId) => {
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
};

module.exports = {
  createOrder,
  getWarehouseOrders,
  updateOrderStatus,
  _updateInventory,
  assignDeliveryAgent,
  getStoreOrders,
};
