const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Document = require('../models/Document');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication Middleware for Sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing.'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Token invalid.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: User ID ${socket.userId} (Socket ID: ${socket.id})`);

    // Join personal private room or admin channel
    socket.on('join_room', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Please call initSocket first.');
  }
  return io;
};

/**
 * Emit "new_order" event to all administrators
 * @param {string} orderId - MongoDB Order Object ID
 */
const emitNewOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('userId', 'name studentId department semester')
      .populate('documentId', 'originalName extension fileSize');

    if (order && io) {
      io.to('admin-room').emit('new_order', {
        success: true,
        order
      });
      console.log(`Realtime: Emitted new_order event for ${order.orderId}`);
    }
  } catch (error) {
    console.error('Realtime emitNewOrder error:', error.message);
  }
};

/**
 * Emit status shift update to the specific customer
 */
const emitStatusUpdate = async (orderId, previousStatus, newStatus, adminNote = '') => {
  try {
    const order = await Order.findById(orderId);
    if (order && io) {
      const targetRoom = `user-${order.userId.toString()}`;
      io.to(targetRoom).emit('order_status_updated', {
        orderId: order._id,
        orderNumber: order.orderId,
        previousStatus,
        newStatus,
        adminNote,
        message: `Your order ${order.orderId} status changed from ${previousStatus} to ${newStatus}.`
      });
      console.log(`Realtime: Emitted order_status_updated to ${targetRoom}`);
    }
  } catch (error) {
    console.error('Realtime emitStatusUpdate error:', error.message);
  }
};

/**
 * Emit document processed details to the owner
 */
const emitDocumentProcessed = async (docId, userId, status, pageCount) => {
  try {
    if (io) {
      const targetRoom = `user-${userId.toString()}`;
      io.to(targetRoom).emit('document_processed', {
        documentId: docId,
        status,
        pageCount,
        message: status === 'processed' 
          ? `File processed successfully! ${pageCount} pages detected.`
          : 'File processing failed.'
      });
      console.log(`Realtime: Emitted document_processed event to ${targetRoom}`);
    }
  } catch (error) {
    console.error('Realtime emitDocumentProcessed error:', error.message);
  }
};

/**
 * Emit "order_cancelled" event to all administrators
 */
const emitOrderCancelled = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('userId', 'name');
    if (order && io) {
      io.to('admin-room').emit('order_cancelled', {
        orderId: order._id,
        orderNumber: order.orderId,
        studentName: order.userId.name,
        message: `Order ${order.orderId} has been cancelled by the student.`
      });
      console.log(`Realtime: Emitted order_cancelled to admin-room`);
    }
  } catch (error) {
    console.error('Realtime emitOrderCancelled error:', error.message);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNewOrder,
  emitStatusUpdate,
  emitDocumentProcessed,
  emitOrderCancelled
};
