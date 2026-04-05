const Notification = require('../models/Notification');
const Pusher = require('pusher');

const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID,
  key:     process.env.PUSHER_KEY,
  secret:  process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER || 'ap2',
  useTLS:  true,
});

const sendNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name profileImage')
      .populate('task', 'title');

    await pusher.trigger(
      `user-${notificationData.recipient.toString()}`,
      'new_notification',
      populated.toObject()
    );

    return populated;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = { sendNotification };
