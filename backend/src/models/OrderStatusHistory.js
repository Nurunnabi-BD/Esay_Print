const mongoose = require('mongoose');

const OrderStatusHistorySchema = new mongoose.Schema({
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true, 
    index: true 
  },
  previousStatus: { 
    type: String, 
    required: true 
  },
  newStatus: { 
    type: String, 
    required: true 
  },
  changedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('OrderStatusHistory', OrderStatusHistorySchema);
