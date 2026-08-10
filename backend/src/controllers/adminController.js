const Order = require('../models/Order');
const User = require('../models/User');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const { createAndSendNotification } = require('../services/notificationService');

// @desc    Get all orders (paginated, filterable, searchable)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // 1. Status Filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // 2. Search logic (User Name, Student ID, Order ID)
    if (search) {
      // Find matching users first
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map(u => u._id);

      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } }
      ];
    }

    const skipIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('userId', 'name studentId department semester email')
      .populate('documentId', 'originalName extension fileSize processingStatus')
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit, 10));

    return res.json({
      success: true,
      totalOrders,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalOrders / limit),
      orders
    });
  } catch (error) {
    console.error('Admin fetch orders error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving orders queue.' 
    });
  }
};

// @desc    Get single order details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('documentId')
      .populate('userId', 'name studentId department semester email');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found.' 
      });
    }

    const history = await OrderStatusHistory.find({ orderId: order._id })
      .populate('changedBy', 'name role')
      .sort({ timestamp: 1 });

    return res.json({
      success: true,
      order,
      history
    });
  } catch (error) {
    console.error('Admin fetch single order error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving order details.' 
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const allowedStatuses = ['Order Received', 'Processing', 'Completed', 'Cancelled', 'Failed'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid status.' 
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found.' 
      });
    }

    const previousStatus = order.status;
    order.status = status;
    if (adminNote !== undefined) {
      order.adminNote = adminNote;
    }
    await order.save();

    // Log in history
    await OrderStatusHistory.create({
      orderId: order._id,
      previousStatus,
      newStatus: status,
      changedBy: req.user.id
    });

    // Notify customer of status shift (Phase 8)
    try {
      let notifType = 'info';
      let notifTitle = 'Order Status Updated';
      let notifMsg = `Your print order #${order.orderId} status has changed to ${status}.`;

      if (status === 'Completed') {
        notifType = 'success';
        notifTitle = 'Print Completed! 🎉';
        notifMsg = `Your document is ready for pickup! Collect it from the counter.`;
      } else if (status === 'Processing') {
        notifType = 'info';
        notifTitle = 'Printing Started ⚡';
        notifMsg = `Your document is currently being printed.`;
      } else if (status === 'Cancelled' || status === 'Failed') {
        notifType = 'error';
        notifTitle = 'Print Order Cancelled ❌';
        notifMsg = `Order #${order.orderId} could not be printed. Note: ${adminNote || 'No reason specified'}.`;
      }

      await createAndSendNotification({
        userId: order.userId,
        orderId: order._id,
        type: notifType,
        title: notifTitle,
        message: notifMsg
      });
    } catch (notifErr) {
      console.error('Failed to send status update notification to customer:', notifErr.message);
    }

    // Trigger Socket.IO updates (Phase 8)
    setTimeout(() => {
      try {
        const { emitStatusUpdate } = require('../services/socketService');
        emitStatusUpdate(order._id, previousStatus, status, adminNote || '');
      } catch (err) {
        // Socket service might not be active yet
      }
    }, 0);

    return res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      order
    });
  } catch (error) {
    console.error('Admin update order status error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error updating order status.' 
    });
  }
};

// @desc    Cancel order (Admin)
// @route   PUT /api/admin/orders/:id/cancel
// @access  Private/Admin
const cancelOrderAdmin = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found.' 
      });
    }

    const previousStatus = order.status;
    order.status = 'Cancelled';
    if (adminNote) {
      order.adminNote = adminNote;
    }
    await order.save();

    // Log history
    await OrderStatusHistory.create({
      orderId: order._id,
      previousStatus,
      newStatus: 'Cancelled',
      changedBy: req.user.id
    });

    // Notify customer of cancellation (Phase 8)
    try {
      await createAndSendNotification({
        userId: order.userId,
        orderId: order._id,
        type: 'error',
        title: 'Print Order Cancelled ❌',
        message: `Order #${order.orderId} was cancelled by the administrator. Note: ${adminNote || 'No reason specified'}.`
      });
    } catch (notifErr) {
      console.error('Failed to notify customer of cancellation:', notifErr.message);
    }

    // Trigger Socket.IO updates (Phase 8)
    setTimeout(() => {
      try {
        const { emitStatusUpdate, emitOrderCancelled } = require('../services/socketService');
        emitStatusUpdate(order._id, previousStatus, 'Cancelled', adminNote || '');
        emitOrderCancelled(order._id);
      } catch (err) {
        // Socket service might not be active yet
      }
    }, 0);

    return res.json({
      success: true,
      message: 'Order cancelled by admin.',
      order
    });
  } catch (error) {
    console.error('Admin cancel order error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during admin cancellation.' 
    });
  }
};

// @desc    Get dashboard metrics & aggregation stats
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getStatistics = async (req, res) => {
  try {
    // 1. Basic Stats Counts
    const totalOrders = await Order.countDocuments({});
    const newOrders = await Order.countDocuments({ status: 'Order Received' });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const completedOrders = await Order.countDocuments({ status: 'Completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
    const failedOrders = await Order.countDocuments({ status: 'Failed' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    // 2. Sums for Revenue, Pages, Copies (Completed and overall)
    const overallAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$totalCost", 0] } },
          estimatedRevenue: { $sum: { $cond: [{ $in: ["$status", ["Completed", "Processing", "Order Received"]] }, "$totalCost", 0] } },
          totalPrintedPages: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$totalPages", 0] } },
          estimatedTotalPages: { $sum: "$totalPages" },
          totalCopies: { $sum: "$copies" }
        }
      }
    ]);

    const stats = overallAgg[0] || {
      totalRevenue: 0,
      estimatedRevenue: 0,
      totalPrintedPages: 0,
      estimatedTotalPages: 0,
      totalCopies: 0
    };

    // 3. Time Series Aggregates (Past 30 Days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyVolume = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          pages: { $sum: "$totalPages" },
          revenue: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$totalCost", 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Color vs Black & White ratio
    const typeDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$printType",
          count: { $sum: 1 },
          revenue: { $sum: "$totalCost" }
        }
      }
    ]);

    return res.json({
      success: true,
      counts: {
        total: totalOrders,
        new: newOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        failed: failedOrders,
        users: totalUsers
      },
      metrics: {
        totalRevenue: stats.totalRevenue,
        estimatedRevenue: stats.estimatedRevenue,
        totalPrintedPages: stats.totalPrintedPages,
        estimatedTotalPages: stats.estimatedTotalPages,
        totalCopies: stats.totalCopies
      },
      charts: {
        dailyVolume,
        typeDistribution
      }
    });
  } catch (error) {
    console.error('Admin statistics fetch error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error generating dashboard statistics.' 
    });
  }
};

// @desc    Get all students users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Admin fetch users error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving students database.' 
    });
  }
};

module.exports = {
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrderAdmin,
  getStatistics,
  getUsers
};
