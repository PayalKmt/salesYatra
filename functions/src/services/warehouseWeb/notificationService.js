const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const db = admin.firestore();

const {
  notificationSchema,
  OrderMetadataSchema,
  VehicleMetadataSchema,
  getNotificationsSchema,
  markAsReadSchema,
} = require("../../schemas/warehouseWeb/notificationValidation");

class NotificationService {
  static async createAndSendNotification(notificationData) {
    // Validate input data
    const validatedData = notificationSchema.parse(notificationData);

    try {
      const notificationId = uuidv4(); // Generate UUID

      const notificationRef = db
        .collection("notifications")
        .doc(notificationId);
      const now = new Date().toISOString();

      // Save to Firestore with UUID as ID
      await notificationRef.set({
        notificationId: notificationId,
        ...validatedData,
        createdAt: now,
        updatedAt: now,
        isRead: false, // Ensure isRead is initialized if not already handled by schema
      });

      // Send push notification
      await this._sendPushNotification(validatedData, notificationId);

      return { notificationId: notificationId, ...validatedData };
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }

  static async sendOrderAssignmentNotification(
    orderData,
    agentId,
    assignedById
  ) {
    const notificationData = {
      recipientId: agentId,
      recipientType: "deliveryAgent",
      senderId: assignedById || "system",
      senderType: "warehouse",
      title: "New Delivery Assignment",
      body: `You've been assigned Order #${orderData.orderId.substring(0, 8)}`,
      type: "order_assignment",
      relatedId: orderData.orderId,
      metadata: {
        orderId: orderData.orderId,
        storeId: orderData.storeId,
        warehouseId: orderData.warehouseId,
        totalAmount: orderData.totalAmount,
        productCount: orderData.products.length,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime,
      },
    };

    return this.createAndSendNotification(notificationData);
  }

  static async sendVehicleAssignmentNotification(
    vehicleData,
    agentId,
    assignedById
  ) {
    const notificationData = {
      recipientId: agentId,
      recipientType: "deliveryAgent",
      senderId: assignedById || "system",
      senderType: "warehouse",
      title: "New Vehicle Assignment",
      body: `You've been assigned ${vehicleData.licensePlate || "a vehicle"} (${
        vehicleData.vehicleType
      })`,
      type: "vehicle_assignment",
      relatedId: vehicleData.vehicleId,
      metadata: {
        vehicleType: vehicleData.vehicleType,
        licensePlate: vehicleData.licensePlate,
        warehouseId: vehicleData.warehouseId,
        vehicleCapacity: vehicleData.vehicleCapacity,
      },
    };

    return this.createAndSendNotification(notificationData);
  }

  static async getNotifications(queryParams) {
    const validatedQuery = getNotificationsSchema.parse(queryParams);
    let query = db.collection("notifications");

    // Build query based on parameters
    if (validatedQuery.userId) {
      query = query.where("recipientId", "==", validatedQuery.userId);
    }

    if (validatedQuery.warehouseId) {
      query = query.where(
        "metadata.warehouseId",
        "==",
        validatedQuery.warehouseId
      );
    }

    if (validatedQuery.type) {
      query = query.where("type", "==", validatedQuery.type);
    }

    if (validatedQuery.isRead !== undefined) {
      query = query.where("isRead", "==", validatedQuery.isRead);
    }

    // Execute query with pagination
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(validatedQuery.limit)
      .offset((validatedQuery.page - 1) * validatedQuery.limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  static async markAsRead(notificationIds) {
    const validatedData = markAsReadSchema.parse({ notificationIds });
    const batch = db.batch();
    const now = new Date().toISOString();

    validatedData.notificationIds.forEach((id) => {
      const ref = db.collection("notifications").doc(id);
      batch.update(ref, {
        isRead: true,
        updatedAt: now,
      });
    });

    await batch.commit();
    return { success: true, count: validatedData.notificationIds.length };
  }

  static async getUnreadCount(userId) {
    const snapshot = await db
      .collection("notifications")
      .where("recipientId", "==", userId)
      .where("isRead", "==", false)
      .count()
      .get();

    return snapshot.data().count;
  }

  static async _sendPushNotification(notification, notificationId) {
    try {
      // Get recipient's device token
      const recipientDoc = await db
        .collection("users")
        .doc(notification.recipientId)
        .get();
      const deviceToken = recipientDoc.data()?.deviceToken;

      if (!deviceToken) return;

      // Prepare message payload
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          type: notification.type,
          notificationId,
          relatedId: notification.relatedId || "",
          ...this._flattenMetadata(notification.metadata),
        },
        token: deviceToken,
      };

      await admin.messaging().send(message);
    } catch (error) {
      console.error("Error sending push notification:", error);
      // Don't fail the operation if push notification fails
    }
  }

  static _flattenMetadata(metadata = {}) {
    return Object.entries(metadata).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] =
          typeof value === "object" ? JSON.stringify(value) : String(value);
      }
      return acc;
    }, {});
  }
}

module.exports = NotificationService;
