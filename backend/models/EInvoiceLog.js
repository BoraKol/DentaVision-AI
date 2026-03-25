const mongoose = require('mongoose');

const eInvoiceLogSchema = new mongoose.Schema({
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: false // May be a corporate bill
    },
    clinicName: {
        type: String,
        required: true,
        index: true
    },
    invoiceId: {
        type: String, // ID returned from the integration provider
        required: false,
        index: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'ERROR', 'CANCELLED'],
        default: 'PENDING'
    },
    amount: {
        type: Number,
        required: true
    },
    requestPayload: {
        type: mongoose.Schema.Types.Mixed // The JSON sent to Uyumsoft/Paratsut
    },
    responsePayload: {
        type: mongoose.Schema.Types.Mixed // Response from the provider
    },
    errorMessage: {
        type: String
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EInvoiceLog', eInvoiceLogSchema);
