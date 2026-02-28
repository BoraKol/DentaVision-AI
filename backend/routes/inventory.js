const express = require('express');
const router = express.Router();
const {
    getInventoryItems,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addTransaction
} = require('../controllers/inventoryController');

const validate = require('../utils/validate');
const { createInventoryItemSchema, updateInventoryItemSchema } = require('../validators/inventoryValidator');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All inventory routes need protection

router.route('/')
    .get(getInventoryItems)
    .post(authorize('admin', 'doctor'), validate(createInventoryItemSchema), createInventoryItem);

router.route('/:id')
    .get(getInventoryItem)
    .put(authorize('admin', 'doctor'), validate(updateInventoryItemSchema), updateInventoryItem)
    .delete(authorize('admin'), deleteInventoryItem);

router.route('/:id/transaction')
    .post(addTransaction);

module.exports = router;
