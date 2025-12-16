const dbService = require("../services/dbService");

// Get all notifications for the current user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    const notifications = await dbService.getUserNotifications(userId);

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    const notification = await dbService.markNotificationAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    const notifications = await dbService.markAllNotificationsAsRead(userId);

    res.json({
      message: "All notifications marked as read",
      count: notifications.length,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get unread notifications count
const getUnreadNotificationsCount = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    const count = await dbService.getUnreadNotificationsCount(userId);

    res.json({ count });
  } catch (error) {
    console.error("Get unread notifications count error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
};
