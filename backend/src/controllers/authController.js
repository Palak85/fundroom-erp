const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: req.user
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getMe,
  getAllUsers
};
