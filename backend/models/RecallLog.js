const mongoose = require('mongoose');

const recallLogSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    clinicName: {
        type: String,
        required: true
    },
    recallType: {
        type: String,
        enum: ['periodic_checkup', 'treatment_followup', 'hygiene_cleaning', 'custom'],
        default: 'periodic_checkup'
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'appointment_booked', 'no_response', 'declined'],
        default: 'pending'
    },
    lastTreatmentDate: {
        type: Date,
        required: true
    },
    daysSinceLastVisit: {
        type: Number,
        default: 0
    },
    contactMethod: {
        type: String,
        enum: ['whatsapp', 'sms', 'email', 'phone_call', 'none'],
        default: 'none'
    },
    contactedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

recallLogSchema.index({ clinicName: 1, status: 1 });
recallLogSchema.index({ clinicName: 1, patientId: 1 });

module.exports = mongoose.model('RecallLog', recallLogSchema);
