const express = require('express');
const router = express.Router();
const challanController = require('../controllers/challanController');
const { authenticateUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { validateRequest } = require('../middleware/validator');
const { createChallanSchema } = require('../validators');

router.use(authenticateUser);

// View challans: Admin, Sales, Warehouse, Accounts
router.get(
  '/',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  challanController.getChallans
);

router.get(
  '/:id',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  challanController.getChallanById
);

// Create challan (Draft or Confirmed): Admin, Sales
router.post(
  '/',
  authorizeRoles('Admin', 'Sales'),
  validateRequest(createChallanSchema),
  challanController.createChallan
);

// Confirm draft challan: Admin, Sales
router.post(
  '/:id/confirm',
  authorizeRoles('Admin', 'Sales'),
  challanController.confirmChallan
);

// Cancel challan: Admin, Sales
router.post(
  '/:id/cancel',
  authorizeRoles('Admin', 'Sales'),
  challanController.cancelChallan
);

module.exports = router;
