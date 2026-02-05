const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    imageUrl: {
        type: String,
        required: false
    },
    diagnosis: {
        type: String,
        required: true
    },
    findings: [{
        type: String
    }],
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Analysis', analysisSchema);
