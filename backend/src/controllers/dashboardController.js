const dashboardService = require('../services/dashboardService');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats
};
