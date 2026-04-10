const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Admin only routes
router.get('/',
  authenticate,
  authorize(['admin']),
  userController.getAllUsers
);

router.post('/',
  authenticate,
  authorize(['admin']),
  userController.createUser
);

router.put('/:id',
  authenticate,
  authorize(['admin']),
  userController.updateUser
);

router.delete('/:id',
  authenticate,
  authorize(['admin']),
  userController.deleteUser
);

// Manager routes
router.get('/employees',
  authenticate,
  authorize(['manager', 'admin']),
  userController.getEmployees
);

router.get('/employees/:id/performance',
  authenticate,
  authorize(['manager', 'admin']),
  userController.getEmployeePerformance
);

module.exports = router;