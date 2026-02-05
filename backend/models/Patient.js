const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    age: {
        type: Number,
        min: 0,
        max: 150
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        lowercase: true,
        default: 'other'
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    medicalHistory: {
        type: String,
        default: ''
    },
    symptoms: {
        type: String,
        default: ''
    },
    habits: {
        type: String,
        default: ''
    },
    analyses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analysis'
    }],
    analysisCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
patientSchema.index({ clinicName: 1, name: 1 });
patientSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Patient', patientSchema);
