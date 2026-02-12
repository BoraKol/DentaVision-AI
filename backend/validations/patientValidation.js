const Joi = require('joi');

const createPatientSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(100),
    email: Joi.string().email().allow('', null).lowercase().trim(),
    phone: Joi.string().required().trim(),
    age: Joi.number().required().min(0).max(150),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    bloodType: Joi.string().allow('', null),
    allergies: Joi.array().items(Joi.string()).default([]),
    medicalHistory: Joi.string().allow('', null),
    symptoms: Joi.string().allow('', null),
    habits: Joi.string().allow('', null),
    allergies: Joi.array().items(Joi.string()).default([]),
    password: Joi.string().min(6).allow('', null)
});

const updatePatientSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    email: Joi.string().email().allow('', null).lowercase().trim(),
    phone: Joi.string().trim(),
    age: Joi.number().min(0).max(150),
    gender: Joi.string().valid('male', 'female', 'other'),
    bloodType: Joi.string().allow('', null),
    allergies: Joi.array().items(Joi.string()),
    medicalHistory: Joi.string().allow('', null),
    symptoms: Joi.string().allow('', null),
    habits: Joi.string().allow('', null),
    password: Joi.string().min(6).allow('', null)
});

module.exports = {
    createPatientSchema,
    updatePatientSchema
};
