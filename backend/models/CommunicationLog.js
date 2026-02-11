const mongoose = require('mongoose');

const CommunicationLogSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    type: {
        type: String,
        enum: ['SMS', 'EMAIL', 'PUSH'],
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
    title: {
        type: String, // Subject for email, title for push
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['SENT', 'FAILED', 'PENDING'],
        default: 'SENT'
    },
    provider: {
        type: String, // 'MockService', 'Twilio', 'SendGrid'
        default: 'MockService'
    },
    metadata: {
        type: Object // Flexible field for provider specific response
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CommunicationLog', CommunicationLogSchema);
