const labJobService = require('../services/LabJobService');

// @desc    Get all lab jobs
// @route   GET /api/lab-jobs
// @access  Public (Should be Private in future)
const getLabJobs = async (req, res, next) => {
    try {
        const jobs = await labJobService.getAllJobs();
        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add new lab job
// @route   POST /api/lab-jobs
// @access  Public
const createLabJob = async (req, res, next) => {
    try {
        const job = await labJobService.createJob(req.body);
        res.status(201).json({
            success: true,
            data: job
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        next(err);
    }
};

// @desc    Update lab job
// @route   PUT /api/lab-jobs/:id
// @access  Public
const updateLabJob = async (req, res, next) => {
    try {
        const job = await labJobService.updateJob(req.params.id, req.body);
        
        if (!job) {
            return res.status(404).json({ success: false, error: 'Lab job not found' });
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete lab job
// @route   DELETE /api/lab-jobs/:id
// @access  Public
const deleteLabJob = async (req, res, next) => {
    try {
        const success = await labJobService.deleteJob(req.params.id);
        
        if (!success) {
            return res.status(404).json({ success: false, error: 'Lab job not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getLabJobs,
    createLabJob,
    updateLabJob,
    deleteLabJob
};
