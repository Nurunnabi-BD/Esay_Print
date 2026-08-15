const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// Initialize Socket.IO
const { initSocket } = require('./services/socketService');
initSocket(server);

// Connect Database
const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (process.env.NODE_ENV !== 'test' && dbUri) {
  connectDB();
} else if (!dbUri) {
  console.warn('WARNING: Neither MONGODB_URI nor MONGO_URI is set. Database operations will fail.');
}

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 mins
  message: { 
    success: false, 
    message: 'Too many requests from this IP, please try again after 15 minutes' 
  }
});
app.use('/api/', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve Local Uploads Statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Status Route
app.get('/', (req, res) => {
  return res.json({ 
    success: true, 
    message: 'Smart-Print API is running...' 
  });
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/documents', require('./routes/docRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = { app, server };
