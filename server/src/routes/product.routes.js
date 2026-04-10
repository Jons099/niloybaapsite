const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/:idOrSlug', productController.getProduct);

// Protected routes (Manager/Admin only)
router.post('/',
  authenticate,
  authorize(['manager', 'admin']),
  upload.array('images', 5),
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