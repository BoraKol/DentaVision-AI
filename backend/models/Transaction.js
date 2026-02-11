const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Transaction type is required'],
        enum: ['INCOME', 'EXPENSE']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: false
    },
    treatmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatment',
        required: false
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'CREDIT_CARD', 'INSURANCE', 'TRANSFER'],
        default: 'CASH'
    },
    clinicName: {
        type: String,
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);
