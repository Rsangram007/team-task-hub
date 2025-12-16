const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
} = require("../controllers/notificationController");
const { authenticateJWT } = require("../middleware/auth");

// Get all notifications for the current user
router.get("/", authenticateJWT, getUserNotifications);

// Mark a notification as read
router.put("/:id/read", authenticateJWT, markNotificationAsRead);

// Mark all notifications as read
router.put("/read-all", authenticateJWT, markAllNotificationsAsRead);

// Get unread notifications count
router.get("/unread-count", authenticateJWT, getUnreadNotificationsCount);

module.exports = router;
