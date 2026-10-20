const NotificationModel = require("../models/NotificationModel");

const createNotification = async ({
  user,
  title,
  message,
  type = "system",
}) => {
  try {
    const notification = await NotificationModel.create({
      user,
      title,
      message,
      type,
    });

    return notification;
  } catch (error) {
    console.error("Create Notification Error:", error);
    return null;
  }
};

module.exports = {
  createNotification,
};
