const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { validateRequest } = require('../middleware/validator');
const { customerSchema, followupSchema } = require('../validators');

// All customer routes require authentication
router.use(authenticateUser);

// View customers: Admin, Sales, Warehouse, Accounts
router.get(
  '/',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  customerController.getCustomers
);

router.get(
  '/:id',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  customerController.getCustomerById
);

// Create / Edit customer: Admin, Sales
router.post(
  '/',
  authorizeRoles('Admin', 'Sales'),
  validateRequest(customerSchema),
  customerController.createCustomer
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Sales'),
  validateRequest(customerSchema),
  customerController.updateCustomer
);

// Delete customer: Admin only
router.delete(
  '/:id',
  authorizeRoles('Admin'),
  customerController.deleteCustomer
);

// Follow-ups
router.get(
  '/:id/followups',
  authorizeRoles('Admin', 'Sales', 'Accounts'),
  customerController.getCustomerFollowups
);

router.post(
  '/:id/followups',
  authorizeRoles('Admin', 'Sales'),
  validateRequest(followupSchema),
  customerController.createCustomerFollowup
);

module.exports = router;
