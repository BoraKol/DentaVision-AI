const Joi = require('joi');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
    // Determine what to validate based on schema structure
    // We can validate body, query, and params
    
    // Simplest approach: if schema is for body
    const { error, value } = schema.validate(req.body, {
        abortEarly: false, // Return all errors
        stripUnknown: true // Remove unknown fields
    });

    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return next(new AppError(errorMessage, 400));
    }

    // Replace req.body with validated value (coerced types, stripped fields)
    req.body = value;
    next();
};

module.exports = validate;
