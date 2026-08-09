const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validator');
const { loginSchema } = require('../validators');
const { authenticateUser } = require('../middleware/auth');

router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', authenticateUser, authController.getMe);

module.exports = router;
