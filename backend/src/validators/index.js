const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

const customerSchema = Joi.object({
  customer_name: Joi.string().min(2).max(255).required(),
  mobile: Joi.string().min(6).max(50).required(),
  email: Joi.string().email().allow('', null).optional(),
  business_name: Joi.string().max(255).allow('', null).optional(),
  gst_number: Joi.string().max(50).allow('', null).optional(),
  customer_type: Joi.string().valid('Retail', 'Wholesale', 'Distributor').required(),
  address: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('Lead', 'Active', 'Inactive').default('Lead'),
  follow_up_date: Joi.string().isoDate().allow('', null).optional(),
  notes: Joi.string().allow('', null).optional()
});

const followupSchema = Joi.object({
  follow_up_date: Joi.string().isoDate().required().messages({
    'any.required': 'Follow-up date is required'
  }),
  notes: Joi.string().min(2).required().messages({
    'any.required': 'Follow-up note cannot be empty'
  })
});

const productSchema = Joi.object({
  product_name: Joi.string().min(2).max(255).required(),
  sku: Joi.string().min(2).max(100).required(),
  category: Joi.string().min(2).max(100).required(),
  unit_price: Joi.number().min(0).required(),
  current_stock: Joi.number().integer().min(0).default(0),
  minimum_stock: Joi.number().integer().min(0).default(0),
  warehouse_location: Joi.string().max(100).allow('', null).optional(),
  image_url: Joi.string().uri().allow('', null).optional()
});

const stockAdjustmentSchema = Joi.object({
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantity must be greater than 0',
    'any.required': 'Quantity is required'
  }),
  reason: Joi.string().min(3).required().messages({
    'any.required': 'Reason is required for stock adjustment'
  })
});

const challanItemSchema = Joi.object({
  product_id: Joi.string().required().messages({
    'any.required': 'Product ID is required for each item'
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantity must be at least 1',
    'any.required': 'Item quantity is required'
  })
});

const createChallanSchema = Joi.object({
  customer_id: Joi.string().required().messages({
    'any.required': 'Customer is required for creating a challan'
  }),
  status: Joi.string().valid('DRAFT', 'CONFIRMED').default('DRAFT'),
  items: Joi.array().items(challanItemSchema).min(1).required().messages({
    'array.min': 'At least one product item is required in the challan',
    'any.required': 'Challan items are required'
  })
});

const updateChallanSchema = Joi.object({
  customer_id: Joi.string().optional(),
  status: Joi.string().valid('DRAFT', 'CONFIRMED', 'CANCELLED').optional(),
  items: Joi.array().items(challanItemSchema).min(1).optional()
});

module.exports = {
  loginSchema,
  customerSchema,
  followupSchema,
  productSchema,
  stockAdjustmentSchema,
  createChallanSchema,
  updateChallanSchema
};
