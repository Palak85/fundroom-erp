const customerService = require('../services/customerService');

const getCustomers = async (req, res, next) => {
  try {
    const { page, limit, search, status, customer_type } = req.query;
    const result = await customerService.getCustomers({ page, limit, search, status, customer_type });
    return res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Customer details retrieved successfully',
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

const getCustomerFollowups = async (req, res, next) => {
  try {
    const followups = await customerService.getCustomerFollowups(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Follow-up history retrieved successfully',
      data: followups
    });
  } catch (err) {
    next(err);
  }
};

const createCustomerFollowup = async (req, res, next) => {
  try {
    const followup = await customerService.createCustomerFollowup(req.params.id, req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Follow-up note added successfully',
      data: followup
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerFollowups,
  createCustomerFollowup
};
