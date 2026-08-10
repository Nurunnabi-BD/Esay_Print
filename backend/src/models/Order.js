const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  documentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document', 
    required: true 
  },
  printType: { 
    type: String, 
    enum: ['bw', 'color'], 
    required: true 
  },
  pages: { 
    type: Number, 
    required: true 
  },
  copies: { 
    type: Number, 
    required: true, 
    default: 1 
  },
  pricePerPage: { 
    type: Number, 
    required: true 
  },
  totalPages: { 
    type: Number, 
    required: true 
  },
  totalCost: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Order Received', 'Processing', 'Completed', 'Cancelled', 'Failed'], 
    default: 'Order Received',
    index: true 
  },
  adminNote: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
