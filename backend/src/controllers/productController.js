const productService = require('../services/productService');

const getProducts = async (req, res, next) => {
  try {
    const { page, limit, search, category, low_stock } = req.query;
    const result = await productService.getProducts({ page, limit, search, category, low_stock });
    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Product details retrieved successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

const stockIn = async (req, res, next) => {
  try {
    const { quantity, reason } = req.body;
    const result = await productService.adjustStock(
      req.params.id,
      { quantity, reason, movement_type: 'IN' },
      req.user
    );
    return res.status(200).json({
      success: true,
      message: `Successfully added ${quantity} units to stock`,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const stockOut = async (req, res, next) => {
  try {
    const { quantity, reason } = req.body;
    const result = await productService.adjustStock(
      req.params.id,
      { quantity, reason, movement_type: 'OUT' },
      req.user
    );
    return res.status(200).json({
      success: true,
      message: `Successfully removed ${quantity} units from stock`,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getProductStockMovements = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await productService.getStockMovements({
      page,
      limit,
      productId: req.params.id
    });
    return res.status(200).json({
      success: true,
      message: 'Stock movements retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getAllStockMovements = async (req, res, next) => {
  try {
    const { page, limit, movement_type } = req.query;
    const result = await productService.getStockMovements({ page, limit, movement_type });
    return res.status(200).json({
      success: true,
      message: 'All stock movements retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  stockIn,
  stockOut,
  getProductStockMovements,
  getAllStockMovements
};
