const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

const createOrder = async (orderData) => {
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
  console.log(orderId);

  // const orderRef = db.collection("orders").doc(productId
  const order = {
    orderId: orderId,
    products: productsWithDetails,
    totalAmount,
    status: "pending",
    retailerId: orderData.retailerId,
    supplierId: orderData.supplierId,
    warehouseId: orderData.warehouseId,
    deliveryAddress: orderData.deliveryAddress,
    estimatedDeliveryTime: new Date(orderData.estimatedDeliveryTime),
    paymentMethod: orderData.paymentMethod,
    deliveryAgentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orderRef = db.collection("orders").doc(orderId);

  await orderRef.set(order);
  return {
    orderId,
    ...order,
  };
};

const getWarehouseOrders = async (warehouseId) => {
  const snapshot = await db
    .collection("orders")
    .where("warehouseId", "==", warehouseId)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => doc.data());
};

const updateOrderStatus = async (orderId, status) => {
  const orderRef = db.collection("orders").doc(orderId);
  await orderRef.update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (status === "shipped") {
    await this._updateInventory(orderId);
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
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
};

const assignDeliveryAgent = async (orderId, deliveryAgentId) => {
  const batch = db.batch();

  const orderRef = db.collection("orders").doc(orderId);
  batch.update(orderRef, {
    deliveryAgentId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const agentRef = db.collection("deliveryAgents").doc(deliveryAgentId);
  batch.update(agentRef, {
    currentOrders: admin.firestore.FieldValue.arrayUnion(orderId),
    status: "busy",
  });

  await batch.commit();
};

module.exports = {
  createOrder,
  getWarehouseOrders,
  updateOrderStatus,
  _updateInventory,
  assignDeliveryAgent,
};
