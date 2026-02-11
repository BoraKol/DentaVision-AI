const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Sarf Malzeme', 'Enstrüman', 'Cihaz', 'İlaç', 'Diğer'],
        default: 'Sarf Malzeme'
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true,
        default: 'Adet' // Box, Piece, Liter
    },
    minThreshold: {
        type: Number,
        default: 10,
        help: 'Minimum quantity before alert'
    },
    costPerUnit: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date
    },
    transactions: [{
        type: {
            type: String,
            enum: ['IN', 'OUT', 'ADJUST'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true // Open for now to avoid breaking existing data if any
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
