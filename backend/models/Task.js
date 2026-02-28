const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    clinicName: {
        type: String,
        required: true,
        index: true
    },
    branch: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Todo', 'Doing', 'Done'],
        default: 'Todo'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: {
        type: Date
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient filtering
taskSchema.index({ clinicName: 1, branch: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
