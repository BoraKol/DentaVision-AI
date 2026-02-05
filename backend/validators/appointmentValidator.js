const Joi = require('joi');

const createAppointmentSchema = Joi.object({
    patientId: Joi.string().required().messages({
        'any.required': 'Patient ID is required',
        'string.empty': 'Patient ID cannot be empty'
    }),
    date: Joi.string().required().messages({ // Format: YYYY-MM-DD
        'any.required': 'Date is required',
        'string.empty': 'Date cannot be empty'
    }),
    time: Joi.string().required().messages({ // Format: HH:mm
        'any.required': 'Time is required',
        'string.empty': 'Time cannot be empty'
    }),
    duration: Joi.number().min(15).max(480).default(30),
    procedure: Joi.string().required().trim().messages({
        'any.required': 'Procedure is required',
        'string.empty': 'Procedure cannot be empty'
    }),
    status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show').default('scheduled'),
    notes: Joi.string().allow('', null)
});

const updateAppointmentSchema = Joi.object({
    patientId: Joi.string(),
    date: Joi.string(),
    time: Joi.string(),
    duration: Joi.number().min(15).max(480),
    procedure: Joi.string().trim(),
    status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'),
    notes: Joi.string().allow('', null)
}).min(1);

module.exports = {
    createAppointmentSchema,
    updateAppointmentSchema
};
