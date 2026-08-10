const Notification = require('../models/Notification');
const { getIO } = require('./socketService');

/**
 * Create a database notification and emit it to the user's socket room
 */
const createAndSendNotification = async ({ userId, orderId, type = 'info', title, message }) => {
  try {
    const notification = await Notification.create({
      userId,
      orderId,
      type,
      title,
      message
    });

    try {
      const io = getIO();
      // Emit to user room
      io.to(`user-${userId.toString()}`).emit('new_notification', {
        success: true,
        notification
      });
      console.log(`Socket: Emitted new_notification to user-${userId}`);
    } catch (err) {
      // Socket server might not be initialized or active
    }

    return notification;
  } catch (error) {
    console.error('createAndSendNotification error:', error.message);
  }
};

module.exports = {
  createAndSendNotification
};
