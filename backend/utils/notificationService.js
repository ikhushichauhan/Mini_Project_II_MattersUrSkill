const Notification = require('../models/Notification');

const sendNotification = async (io, userSockets, notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name profileImage')
      .populate('task', 'title');

    const recipientSocketId = userSockets.get(notificationData.recipient.toString());
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_notification', populatedNotification);
    }

    return populatedNotification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = { sendNotification };
