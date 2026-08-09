const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateUser);

// Dashboard stats: accessible to all authenticated roles
router.get(
  '/stats',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  dashboardController.getDashboardStats
);

module.exports = router;
