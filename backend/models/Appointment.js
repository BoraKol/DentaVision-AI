const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clinicName: {
        type: String,
        required: true,
        index: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: {
        type: String,
        required: [true, 'Appointment date is required']
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required']
    },
    duration: {
        type: Number,
        default: 30,
        min: 15,
        max: 480
    },
    procedure: {
        type: String,
        required: [true, 'Procedure is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster date-based queries
appointmentSchema.index({ clinicName: 1, date: 1, status: 1 });
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ patientId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
