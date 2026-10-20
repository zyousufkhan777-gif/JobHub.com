const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

const notificationRoute = express.Router();

// Get all notifications
notificationRoute.get("/", authMiddleware, getNotifications);

// Mark one as read
notificationRoute.put("/:notificationId/read", authMiddleware, markAsRead);

// Mark all as read
notificationRoute.put("/read-all", authMiddleware, markAllAsRead);

// Delete all
notificationRoute.delete("/clear-all", authMiddleware, clearAllNotifications);

// Delete one
notificationRoute.delete(
  "/:notificationId",
  authMiddleware,
  deleteNotification,
);

module.exports = notificationRoute;
