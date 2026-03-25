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
        toothNumber: { type: String },
        surfaces: [{ type: String }],
        condition: { type: String },
        confidence: { type: Number }
    }],
    notes: {
        type: String
    },
    aiDetails: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Analysis', analysisSchema);
