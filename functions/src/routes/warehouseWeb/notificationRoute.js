const express = require('express');
const router = express.Router();
const NotificationController = require('../../controllers/warehouseWeb/notificationController');

// Create notification
router.post('/create/notification', NotificationController.createNotification);

// Get notifications
router.get('/get/all/notifications', NotificationController.getNotifications);

// Mark as read
router.patch('/read/notification', NotificationController.markAsRead);

// Get unread count
router.get('/unread-count/:userId', NotificationController.getUnreadCount);

// Test endpoint (dev only)
router.post('/test/notification',  NotificationController.sendTestNotification);

module.exports = router;