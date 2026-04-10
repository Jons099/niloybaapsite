const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes (guest checkout allowed)
router.post('/', orderController.createOrder);
router.get('/track/:orderNumber', orderController.trackOrder);

// Protected routes
router.get('/',
  authenticate,
  authorize(['employee', 'manager', 'admin']),
  orderController.getOrders
);

router.get('/my-orders',
  authenticate,
  orderController.getMyOrders
);

router.get('/:id',
  authenticate,
  orderController.getOrderDetails
);

router.patch('/:id/status',
  authenticate,
  authorize(['employee', 'manager', 'admin']),
  orderController.updateOrderStatus
);

router.post('/:id/assign',
  authenticate,
  authorize(['manager', 'admin']),
  orderController.assignOrder
);

router.post('/:id/cancel',
  authenticate,
  orderController.cancelOrder
);

module.exports = router;