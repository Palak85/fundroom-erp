const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message.replace(/['"]/g, ''));
      return res.status(400).json({
        success: false,
        message: errorMessages[0] || 'Validation failed',
        errors: errorMessages
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = {
  validateRequest
};
