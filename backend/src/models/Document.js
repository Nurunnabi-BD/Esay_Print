const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  originalName: { 
    type: String, 
    required: true 
  },
  storedName: { 
    type: String, 
    required: true 
  },
  extension: { 
    type: String, 
    required: true 
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  convertedFileUrl: { 
    type: String 
  },
  storageKey: { 
    type: String, 
    required: true 
  },
  convertedStorageKey: { 
    type: String 
  },
  pageCount: { 
    type: Number, 
    default: 0 
  },
  processingStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'processed', 'failed'], 
    default: 'pending',
    index: true
  },
  errorMessage: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
