const express = require('express');
const router = express.Router();
const { 
  getOrders, 
  getOrder, 
  updateOrderStatus, 
  cancelOrderAdmin, 
  getStatistics, 
  getUsers 
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protect all routes under this router for Admin access only
router.use(protect);
router.use(admin);

router.get('/orders', getOrders);
router.route('/orders/:id')
  .get(getOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/cancel', cancelOrderAdmin);
router.get('/statistics', getStatistics);
router.get('/users', getUsers);

module.exports = router;
