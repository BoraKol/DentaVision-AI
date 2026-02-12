const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(50),
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required().min(6),
    clinicName: Joi.string().required().trim(),
    specialty: Joi.string().allow('', null).trim(),
    title: Joi.string().allow('', null).trim(),
    role: Joi.string().valid('admin', 'doctor', 'staff').default('doctor')
});

const loginSchema = Joi.object({
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50),
    title: Joi.string().allow('', null).trim(),
    specialty: Joi.string().allow('', null).trim(),
    clinicName: Joi.string().trim(),
    avatarUrl: Joi.string().uri().allow('', null)
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema
};
