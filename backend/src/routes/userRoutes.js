const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateUser);

// Users management: Admin only
router.get(
  '/',
  authorizeRoles('Admin'),
  authController.getAllUsers
);

module.exports = router;
