const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Fetch notifications error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving notifications.' 
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found.' 
      });
    }

    return res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error marking notification as read.' 
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    return res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Mark all read error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error marking all notifications as read.' 
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
