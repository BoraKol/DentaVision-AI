const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    clinicName: {
        type: String,
        required: true
    },
    procedureName: {
        type: String,
        required: true
    },
    toothNumber: {
        type: String,
        default: 'General'
    },
    surfaces: {
        type: [String], // e.g. ['M', 'O', 'D', 'B', 'L']
        default: []
    },
    phase: {
        type: String,
        default: 'Initial'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    cost: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Treatment', treatmentSchema);
