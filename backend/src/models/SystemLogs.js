const mongoose = require('mongoose');

const SystemLogsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  action: { 
    type: String, 
    required: true 
  },
  resource: { 
    type: String, 
    required: true 
  },
  resourceId: { 
    type: String 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('SystemLogs', SystemLogsSchema);
