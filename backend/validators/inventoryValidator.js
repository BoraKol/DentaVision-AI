const Joi = require('joi');

const createInventoryItemSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Item name is required',
        'string.empty': 'Item name cannot be empty'
    }),
    category: Joi.string().valid('Sarf Malzeme', 'Enstrüman', 'İmplant', 'İlaç', 'Diğer').default('Sarf Malzeme'),
    quantity: Joi.number().min(0).default(0),
    unit: Joi.string().default('Pcs'),
    minLevel: Joi.number().min(0).default(5),
    cost: Joi.number().min(0).default(0),
    supplier: Joi.string().allow('', null),
    expirationDate: Joi.date().iso().allow(null, ''),
    notes: Joi.string().allow('', null)
});

const updateInventoryItemSchema = Joi.object({
    name: Joi.string(),
    category: Joi.string().valid('Sarf Malzeme', 'Enstrüman', 'İmplant', 'İlaç', 'Diğer'),
    quantity: Joi.number().min(0),
    unit: Joi.string(),
    minLevel: Joi.number().min(0),
    cost: Joi.number().min(0),
    supplier: Joi.string().allow('', null),
    expirationDate: Joi.date().iso().allow(null, ''),
    notes: Joi.string().allow('', null)
}).min(1);

module.exports = {
    createInventoryItemSchema,
    updateInventoryItemSchema
};
