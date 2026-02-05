const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category'], // e.g., 'Consumable', 'Instrument', 'Implant'
        enum: ['Sarf Malzeme', 'Enstrüman', 'İmplant', 'İlaç', 'Diğer']
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true, // e.g., 'Box', 'Piece', 'Liter'
        default: 'Piece'
    },
    minLevel: {
        type: Number,
        default: 5 // Alert when quantity matches or drops below this
    },
    cost: {
        type: Number, // Unit cost
        default: 0
    },
    supplier: {
        type: String,
        trim: true
    },
    expirationDate: {
        type: Date
    },
    lastRestocked: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
