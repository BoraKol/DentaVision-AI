const Joi = require('joi');

const createTransactionSchema = Joi.object({
    type: Joi.string().valid('Income', 'Expense').required(),
    amount: Joi.number().min(0).required(),
    category: Joi.string().required(),
    subCategory: Joi.string().allow('', null),
    paymentMethod: Joi.string().valid('Cash', 'Credit Card', 'Bank Transfer', 'Other').required(),
    description: Joi.string().allow('', null),
    date: Joi.date().iso().allow(null, ''),
    patientId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').messages({
        'string.pattern.base': 'Invalid Patient ID format'
    }),
    doctorId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').messages({
        'string.pattern.base': 'Invalid Doctor ID format'
    }),
    appointmentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').messages({
        'string.pattern.base': 'Invalid Appointment ID format'
    }),
    treatmentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').messages({
        'string.pattern.base': 'Invalid Treatment ID format'
    }),
    invoiceId: Joi.string().allow('', null),
    status: Joi.string().valid('Completed', 'Pending', 'Failed', 'Refunded').default('Completed')
});

module.exports = {
    createTransactionSchema
};
