const labJobService = require('../services/LabJobService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Get all lab jobs
// @route   GET /api/lab-jobs
// @access  Public (Should be Private in future)
const getLabJobs = catchAsync(async (req, res, next) => {
    const jobs = await labJobService.getAllJobs();
    res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs
    });
});

// @desc    Add new lab job
// @route   POST /api/lab-jobs
// @access  Public
const createLabJob = catchAsync(async (req, res, next) => {
    const job = await labJobService.createJob(req.body);
    res.status(201).json({
        success: true,
        data: job
    });
});

// @desc    Update lab job
// @route   PUT /api/lab-jobs/:id
// @access  Public
const updateLabJob = catchAsync(async (req, res, next) => {
    const job = await labJobService.updateJob(req.params.id, req.body);
    
    if (!job) {
        return next(new AppError('Lab job not found', 404));
    }

    res.status(200).json({
        success: true,
        data: job
    });
});

// @desc    Delete lab job
// @route   DELETE /api/lab-jobs/:id
// @access  Public
const deleteLabJob = catchAsync(async (req, res, next) => {
    const success = await labJobService.deleteJob(req.params.id);
    
    if (!success) {
        return next(new AppError('Lab job not found', 404));
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = {
    getLabJobs,
    createLabJob,
    updateLabJob,
    deleteLabJob
};
