const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    drugs: [{
        name: {
            type: String,
            required: true
        },
        dosage: {
            type: String,
            required: true
        },
        frequency: {
            type: String, // e.g., "2x1", "Günde 3 kez"
            required: true
        },
        duration: {
            type: String, // e.g., "5 gün", "1 hafta"
            required: true
        },
        instructions: {
            type: String // e.g., "Tok karnına"
        }
    }],
    notes: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    clinicName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
