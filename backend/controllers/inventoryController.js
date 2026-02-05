const inventoryService = require('../services/inventoryService');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
const getInventoryItems = async (req, res, next) => {
    try {
        const items = await inventoryService.getAllItems();
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItem = async (req, res, next) => {
    try {
        const item = await inventoryService.getItemById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new item
// @route   POST /api/inventory
// @access  Private
const createInventoryItem = async (req, res, next) => {
    try {
        const item = await inventoryService.createItem(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

// @desc    Update item
// @route   PUT /api/inventory/:id
// @access  Private
const updateInventoryItem = async (req, res, next) => {
    try {
        const item = await inventoryService.updateItem(req.params.id, req.body);
        
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete item
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteInventoryItem = async (req, res, next) => {
    try {
        const success = await inventoryService.deleteItem(req.params.id);
        
        if (!success) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getInventoryItems,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
};
