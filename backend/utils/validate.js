const Joi = require('joi');
const AppError = require('./AppError');

/**
 * Reusable middleware to validate request data against a Joi schema
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 * @param {string} [source='body'] - Where to find the data to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown keys from the validated object
        });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message).join(', ');
            return next(new AppError(`Validation failed: ${errorMessages}`, 400));
        }

        // Replace request data with validated/stripped data
        req[source] = value;
        next();
    };
};

module.exports = validate;
