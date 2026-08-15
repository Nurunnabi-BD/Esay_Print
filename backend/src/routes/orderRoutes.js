const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getOrderDetails, 
  cancelOrder 
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all routes in this router

router.post('/', createOrder);
router.post('/create', createOrder);
router.get('/my-orders', getMyOrders);
router.route('/:id')
  .get(getOrderDetails);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
