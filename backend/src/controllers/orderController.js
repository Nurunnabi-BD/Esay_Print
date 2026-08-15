const Order = require('../models/Order');
const Document = require('../models/Document');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const User = require('../models/User');
const { createAndSendNotification } = require('../services/notificationService');
const { bwPrice, colorPrice } = require('../config/pricing');

// Helper to generate a readable unique order ID (e.g. ORD-982341)
const generateOrderNumber = () => {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${rand}`;
};

// @desc    Create new print order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { documentId, printType, copies } = req.body;

    if (!documentId || !printType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide document ID and print type.' 
      });
    }

    const numCopies = parseInt(copies, 10) || 1;
    if (numCopies < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Copies count must be at least 1.' 
      });
    }

    if (!['bw', 'color'].includes(printType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid print type. Must be bw or color.' 
      });
    }

    // Find and validate document
    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found.' 
      });
    }

    // Ensure document belongs to the requesting user or user is admin
    if (doc.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access to this document.' 
      });
    }

    // Ensure document processing has finished
    if (doc.processingStatus !== 'processed') {
      return res.status(400).json({
        success: false,
        message: `File is not ready. Current processing state: ${doc.processingStatus}.`
      });
    }

    // Calculate rates
    const pricePerPage = printType === 'bw' ? bwPrice : colorPrice;
    const pages = doc.pageCount;
    const totalPages = pages * numCopies;
    const totalCost = totalPages * pricePerPage;

    // Create Order Number
    let orderId = generateOrderNumber();
    // Verify uniqueness
    let exists = await Order.findOne({ orderId });
    while (exists) {
      orderId = generateOrderNumber();
      exists = await Order.findOne({ orderId });
    }

    // Create Order
    const order = await Order.create({
      orderId,
      userId: req.user.id,
      documentId,
      printType,
      pages,
      copies: numCopies,
      pricePerPage,
      totalPages,
      totalCost,
      status: 'Order Received'
    });

    // Create Order Status History log
    await OrderStatusHistory.create({
      orderId: order._id,
      previousStatus: 'None',
      newStatus: 'Order Received',
      changedBy: req.user.id
    });

    // Send notifications to all admin users (Phase 8)
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      for (const admin of admins) {
        await createAndSendNotification({
          userId: admin._id,
          orderId: order._id,
          type: 'info',
          title: 'New Print Order Received',
          message: `Order #${order.orderId} has been placed by ${req.user.name} for ${order.totalPages} pages.`
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify admins of new order:', notifErr.message);
    }

    // Trigger Socket.IO notification to admin-room (Phase 8)
    setTimeout(() => {
      try {
        const { emitNewOrder } = require('../services/socketService');
        emitNewOrder(order._id);
      } catch (err) {
        // Socket service might not be fully active yet
      }
    }, 0);

    return res.status(201).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Order creation error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during order creation.' 
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('documentId', 'originalName extension fileSize processingStatus')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Fetch user orders error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving your orders.' 
    });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('documentId')
      .populate('userId', 'name studentId semester department email');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found.' 
      });
    }

    // Owner or admin authorization check
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this order.' 
      });
    }

    // Fetch status history logs
    const history = await OrderStatusHistory.find({ orderId: order._id })
      .populate('changedBy', 'name role')
      .sort({ timestamp: 1 });

    return res.json({
      success: true,
      order,
      history
    });
  } catch (error) {
    console.error('Fetch order details error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving order details.' 
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found.' 
      });
    }

    // Authorization check
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel this order.' 
      });
    }

    // Cancellation eligibility rule: status must be "Order Received"
    if (order.status !== 'Order Received') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at this stage. Current state: ${order.status}`
      });
    }

    const previousStatus = order.status;
    order.status = 'Cancelled';
    await order.save();

    // Log status shift
    await OrderStatusHistory.create({
      orderId: order._id,
      previousStatus,
      newStatus: 'Cancelled',
      changedBy: req.user.id
    });

    // Trigger Socket.IO updates (Phase 8)
    setTimeout(() => {
      try {
        const { emitStatusUpdate, emitOrderCancelled } = require('../services/socketService');
        emitStatusUpdate(order._id, previousStatus, 'Cancelled');
        emitOrderCancelled(order._id);
      } catch (err) {
        // Socket service might not be active yet
      }
    }, 0);

    return res.json({
      success: true,
      message: 'Order cancelled successfully.',
      order
    });

  } catch (error) {
    console.error('Cancel order error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during order cancellation.' 
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder
};
