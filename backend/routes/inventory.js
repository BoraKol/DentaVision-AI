const express = require('express');
const router = express.Router();
const {
    getInventoryItems,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
} = require('../controllers/inventoryController');

const validate = require('../middleware/validate');
const { createInventoryItemSchema, updateInventoryItemSchema } = require('../validators/inventoryValidator');

router.route('/')
    .get(getInventoryItems)
    .post(validate(createInventoryItemSchema), createInventoryItem);

router.route('/:id')
    .get(getInventoryItem)
    .put(validate(updateInventoryItemSchema), updateInventoryItem)
    .delete(deleteInventoryItem);

module.exports = router;
