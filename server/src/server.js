const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import database configuration
const { pool } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const { authenticate } = require('./middleware/auth.middleware');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Root route - API welcome
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Luxe Attire API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      analytics: '/api/analytics'
    },
    documentation: 'API documentation available at /api/docs',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// API Documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    api_version: '1.0.0',
    base_url: process.env.API_URL || 'http://localhost:5000',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        logout: 'POST /api/auth/logout'
      },
      products: {
        getAll: 'GET /api/products',
        getOne: 'GET /api/products/:idOrSlug',
        create: 'POST /api/products (Manager/Admin)',
        update: 'PUT /api/products/:id (Manager/Admin)',
        delete: 'DELETE /api/products/:id (Manager/Admin)',
        updateInventory: 'PATCH /api/products/:productId/inventory/:size'
      },
      orders: {
        create: 'POST /api/orders',
        track: 'GET /api/orders/track/:orderNumber',
        getAll: 'GET /api/orders (Employee/Manager/Admin)',
        getMyOrders: 'GET /api/orders/my-orders',
        getDetails: 'GET /api/orders/:id',
        updateStatus: 'PATCH /api/orders/:id/status',
        assign: 'POST /api/orders/:id/assign (Manager/Admin)',
        cancel: 'POST /api/orders/:id/cancel'
      },
      users: {
        getAll: 'GET /api/users (Admin)',
        create: 'POST /api/users (Admin)',
        update: 'PUT /api/users/:id (Admin)',
        delete: 'DELETE /api/users/:id (Admin)',
        getEmployees: 'GET /api/users/employees (Manager/Admin)',
        getPerformance: 'GET /api/users/employees/:id/performance'
      },
      analytics: {
        dashboard: 'GET /api/analytics/dashboard',
        reports: 'GET /api/analytics/reports',
        export: 'GET /api/analytics/export/:type',
        realtime: 'GET /api/analytics/realtime'
      }
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>'
    },
    roles: ['customer', 'employee', 'manager', 'admin']
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/docs',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/products',
      'GET /api/products/:id'
    ]
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
  console.log(`📚 Documentation at http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health check at http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing HTTP server');
  await pool.end();
  process.exit(0);
});

module.exports = app;