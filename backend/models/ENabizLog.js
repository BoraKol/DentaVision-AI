const mongoose = require('mongoose');

const ENabizLogSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    actionType: {
        type: String,
        enum: ['TREATMENT_START', 'TREATMENT_END', 'PRESCRIPTION', 'DIAGNOSIS'],
        required: true
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'ERROR', 'PENDING'],
        default: 'PENDING'
    },
    requestData: {
        type: Object
    },
    responseData: {
        type: Object
    },
    errorCode: String,
    errorMessage: String,
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ENabizLog', ENabizLogSchema);
