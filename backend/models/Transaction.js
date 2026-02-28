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
    },
    invoiceStatus: {
        type: String,
        enum: ['PENDING', 'GENERATED', 'FAILED'],
        default: 'PENDING'
    },
    invoiceId: {
        type: String,
        required: false
    },
    invoiceDocumentUrl: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Indexes for faster reporting and tracking
TransactionSchema.index({ clinicName: 1, date: -1 });
TransactionSchema.index({ patientId: 1 });
TransactionSchema.index({ doctorId: 1 });
TransactionSchema.index({ type: 1, category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
