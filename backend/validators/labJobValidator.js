const Joi = require('joi');

const createLabJobSchema = Joi.object({
    patientName: Joi.string().required().messages({
        'any.required': 'Patient name is required',
        'string.empty': 'Patient name cannot be empty'
    }),
    doctorName: Joi.string().default('Dt. Bora'),
    treatmentType: Joi.string().valid('Crown', 'Bridge', 'Denture', 'Implant', 'Night Guard', 'Other').required(),
    labName: Joi.string().required(),
    status: Joi.string().valid('Sent', 'In Lab', 'Received', 'Delivered', 'Cancelled').default('Sent'),
    cost: Joi.number().min(0).default(0),
    currency: Joi.string().default('TRY'),
    notes: Joi.string().allow('', null),
    expectedDate: Joi.date().iso(),
    sentDate: Joi.date().iso(),
    receivedDate: Joi.date().iso()
});

const updateLabJobSchema = Joi.object({
    patientName: Joi.string(),
    doctorName: Joi.string(),
    treatmentType: Joi.string().valid('Crown', 'Bridge', 'Denture', 'Implant', 'Night Guard', 'Other'),
    labName: Joi.string(),
    status: Joi.string().valid('Sent', 'In Lab', 'Received', 'Delivered', 'Cancelled'),
    cost: Joi.number().min(0),
    currency: Joi.string(),
    notes: Joi.string().allow('', null),
    expectedDate: Joi.date().iso(),
    sentDate: Joi.date().iso(),
    receivedDate: Joi.date().iso()
}).min(1); // Require at least one field to update

module.exports = {
    createLabJobSchema,
    updateLabJobSchema
};
