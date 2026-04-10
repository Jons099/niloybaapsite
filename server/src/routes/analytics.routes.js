const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All analytics routes require authentication
router.use(authenticate);

// Dashboard analytics
router.get('/dashboard',
  authorize(['employee', 'manager', 'admin']),
  analyticsController.getDashboardAnalytics
);

// Detailed reports (Manager/Admin only)
router.get('/reports',
  authorize(['manager', 'admin']),
  analyticsController.getDetailedReport
);

// Export reports
router.get('/export/:type',
  authorize(['manager', 'admin']),
  analyticsController.exportReport
);

// Real-time metrics
router.get('/realtime',
  authorize(['manager', 'admin']),
  analyticsController.getRealtimeMetrics
);

module.exports = router;