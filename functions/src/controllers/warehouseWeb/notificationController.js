const NotificationService = require('../../services/warehouseWeb/notificationService');
const { getNotificationsSchema, markAsReadSchema } = require('../../schemas/warehouseWeb/notificationValidation');

class NotificationController {
  static async createNotification(req, res) {
    try {
      const notification = await NotificationService.createAndSendNotification(req.body);
      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create notification'
      });
    }
  }
  static async getNotifications(req, res) {
    try {
      const validatedQuery = getNotificationsSchema.parse(req.query);
      const notifications = await NotificationService.getNotifications(validatedQuery);
      
      res.json({
        success: true,
        data: notifications,
        count: notifications.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to fetch notifications'
      });
    }
  }

  static async markAsRead(req, res) {
    try {
      const result = await NotificationService.markAsRead(req.body.notificationIds);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to mark notifications as read'
      });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const { userId } = req.params;
      const count = await NotificationService.getUnreadCount(userId);
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get unread count'
      });
    }
  }

  static async sendTestNotification(req, res) {
    try {
      const { recipientId, title, body } = req.body;
      const notification = await NotificationService.createAndSendNotification({
        recipientId,
        recipientType: 'user',
        senderId: 'system',
        senderType: 'system',
        title,
        body,
        type: 'custom'
      });
      
      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to send test notification'
      });
    }
  }
}

module.exports = NotificationController;