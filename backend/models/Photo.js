const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    url: {
        type: String, // Relative URL path (e.g., /uploads/123.jpg)
        required: true
    },
    type: {
        type: String,
        enum: ['intraoral', 'extraoral', 'xray', 'other'],
        default: 'other'
    },
    tags: [{
        type: String
    }],
    notes: {
        type: String
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    clinicName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Photo', photoSchema);
