const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    title: {
        type: String,
        default: 'Dt.'
    },
    specialty: {
        type: String,
        default: 'General Dentist'
    },
    clinicName: {
        type: String,
        default: 'DentaVision Clinic'
    },
    role: {
        type: String,
        enum: ['admin', 'dentist', 'assistant'],
        default: 'dentist'
    },
    avatar: {
        type: String,
        default: ''
    },
    commissionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        language: {
            type: String,
            enum: ['en', 'tr'],
            default: 'tr'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    geminiApiKey: {
        type: String,
        default: '',
        select: false
    },
    branches: {
        type: [String],
        default: ['Main Branch']
    },
    activeBranch: {
        type: String,
        default: 'Main Branch'
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
