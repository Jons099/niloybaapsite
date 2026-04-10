const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/:idOrSlug', productController.getProduct);

// Protected routes (Manager/Admin only)
router.post('/',
  authenticate,
  authorize(['manager', 'admin']),
  (req, res, next) => {
    console.log('POST /api/products - User:', req.user?.email);
    console.log('Request body:', req.body);
    next();
  },
  productController.createProduct
);

router.put('/:id',
  authenticate,
  authorize(['manager', 'admin']),
  productController.updateProduct
);

router.delete('/:id',
  authenticate,
  authorize(['manager', 'admin']),
  productController.deleteProduct
);

router.patch('/:productId/inventory/:size',
  authenticate,
  authorize(['manager', 'admin', 'employee']),
  productController.updateInventory
);

module.exports = router;