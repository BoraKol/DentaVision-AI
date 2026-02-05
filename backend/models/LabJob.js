const mongoose = require('mongoose');

const LabJobSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: [true, 'Patient name is required']
    },
    doctorName: {
        type: String,
        default: 'Dt. Bora' // Default doctor if not specified
    },
    treatmentType: {
        type: String,
        required: [true, 'Treatment type is required'],
        enum: ['Crown', 'Bridge', 'Denture', 'Implant', 'Night Guard', 'Whitening Tray', 'Other']
    },
    labName: {
        type: String,
        required: [true, 'Lab name is required']
    },
    status: {
        type: String,
        enum: ['Sent', 'In Lab', 'Received', 'Delivered', 'Cancelled'],
        default: 'Sent'
    },
    notes: {
        type: String,
        default: ''
    },
    cost: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'TRY'
    },
    sentDate: {
        type: Date,
        default: Date.now
    },
    expectedDate: {
        type: Date
    },
    receivedDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate isOverdue virtual
LabJobSchema.virtual('isOverdue').get(function() {
    if (this.status === 'Received' || this.status === 'Delivered' || this.status === 'Cancelled') {
        return false;
    }
    if (!this.expectedDate) return false;
    return new Date() > this.expectedDate;
});

// Performance Indexes
LabJobSchema.index({ status: 1 });
LabJobSchema.index({ labName: 1 });
LabJobSchema.index({ patientName: 'text' });
LabJobSchema.index({ sentDate: -1 });

module.exports = mongoose.model('LabJob', LabJobSchema);
