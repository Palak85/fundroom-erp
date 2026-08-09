const challanService = require('../services/challanService');

const getChallans = async (req, res, next) => {
  try {
    const { page, limit, search, status, customer_id } = req.query;
    const result = await challanService.getChallans({ page, limit, search, status, customer_id });
    return res.status(200).json({
      success: true,
      message: 'Challans retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getChallanById = async (req, res, next) => {
  try {
    const challan = await challanService.getChallanById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Challan retrieved successfully',
      data: challan
    });
  } catch (err) {
    next(err);
  }
};

const createChallan = async (req, res, next) => {
  try {
    const challan = await challanService.createChallan(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: challan.status === 'CONFIRMED'
        ? 'Challan created and confirmed successfully'
        : 'Challan draft created successfully',
      data: challan
    });
  } catch (err) {
    next(err);
  }
};

const confirmChallan = async (req, res, next) => {
  try {
    const challan = await challanService.confirmChallan(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Challan confirmed successfully. Stock deducted and movements recorded.',
      data: challan
    });
  } catch (err) {
    next(err);
  }
};

const cancelChallan = async (req, res, next) => {
  try {
    const challan = await challanService.cancelChallan(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Challan cancelled successfully',
      data: challan
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getChallans,
  getChallanById,
  createChallan,
  confirmChallan,
  cancelChallan
};
