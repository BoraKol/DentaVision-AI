const inventoryService = require('../services/inventoryService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
const getInventoryItems = catchAsync(async (req, res, next) => {
    const items = await inventoryService.getAllItems();
    res.status(200).json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Get single item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItem = catchAsync(async (req, res, next) => {
    const item = await inventoryService.getItemById(req.params.id);
    if (!item) {
        return next(new AppError('Item not found', 404));
    }
    res.status(200).json({ success: true, data: item });
});

// @desc    Create new item
// @route   POST /api/inventory
// @access  Private
const createInventoryItem = catchAsync(async (req, res, next) => {
    const item = await inventoryService.createItem(req.body);
    res.status(201).json({ success: true, data: item });
});

// @desc    Update item
// @route   PUT /api/inventory/:id
// @access  Private
const updateInventoryItem = catchAsync(async (req, res, next) => {
    const item = await inventoryService.updateItem(req.params.id, req.body);
    
    if (!item) {
        return next(new AppError('Item not found', 404));
    }

    res.status(200).json({ success: true, data: item });
});

// @desc    Delete item
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteInventoryItem = catchAsync(async (req, res, next) => {
    const success = await inventoryService.deleteItem(req.params.id);
    
    if (!success) {
        return next(new AppError('Item not found', 404));
    }

    res.status(200).json({ success: true, data: {} });
});

// @desc    Add stock transaction
// @route   POST /api/inventory/:id/transaction
// @access  Private
const addTransaction = catchAsync(async (req, res, next) => {
    const item = await inventoryService.addTransaction(req.params.id, {
        ...req.body,
        performedBy: req.user._id
    });
    
    res.status(200).json({ success: true, data: item });
});

module.exports = {
    getInventoryItems,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addTransaction
};
