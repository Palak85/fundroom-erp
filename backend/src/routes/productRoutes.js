const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { validateRequest } = require('../middleware/validator');
const { productSchema, stockAdjustmentSchema } = require('../validators');

router.use(authenticateUser);

// View products: Admin, Warehouse, Sales, Accounts
router.get(
  '/',
  authorizeRoles('Admin', 'Warehouse', 'Sales', 'Accounts'),
  productController.getProducts
);

// All stock movements audit log
router.get(
  '/stock-movements',
  authorizeRoles('Admin', 'Warehouse', 'Sales', 'Accounts'),
  productController.getAllStockMovements
);

router.get(
  '/:id',
  authorizeRoles('Admin', 'Warehouse', 'Sales', 'Accounts'),
  productController.getProductById
);

// Product specific stock movements
router.get(
  '/:id/stock-movements',
  authorizeRoles('Admin', 'Warehouse', 'Sales', 'Accounts'),
  productController.getProductStockMovements
);

// Create / Edit products: Admin, Warehouse
router.post(
  '/',
  authorizeRoles('Admin', 'Warehouse'),
  validateRequest(productSchema),
  productController.createProduct
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Warehouse'),
  validateRequest(productSchema),
  productController.updateProduct
);

// Stock In / Stock Out: Admin, Warehouse
router.post(
  '/:id/stock-in',
  authorizeRoles('Admin', 'Warehouse'),
  validateRequest(stockAdjustmentSchema),
  productController.stockIn
);

router.post(
  '/:id/stock-out',
  authorizeRoles('Admin', 'Warehouse'),
  validateRequest(stockAdjustmentSchema),
  productController.stockOut
);

module.exports = router;
