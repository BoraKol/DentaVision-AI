const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    password: {
        type: String,
        select: false
    },
    portalAccessKey: {
        type: String,
        unique: true,
        sparse: true
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

// Encrypt password using bcrypt
patientSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
patientSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Portal Access Key if not exists
patientSchema.pre('save', function (next) {
    if (!this.portalAccessKey) {
        this.portalAccessKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    next();
});

// Index for faster queries
patientSchema.index({ clinicName: 1, name: 1 });
patientSchema.index({ userId: 1, name: 1 });
patientSchema.index({ name: 'text' }); // Text index for global search
patientSchema.index({ phone: 1 });
patientSchema.index({ email: 1 });

module.exports = mongoose.model('Patient', patientSchema);
