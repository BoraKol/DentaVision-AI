const taskRepository = require('../repositories/TaskRepository');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Get all tasks for the current branch
// @route   GET /api/tasks
// @access  Private
exports.getTasks = catchAsync(async (req, res, next) => {
    const tasks = await taskRepository.findByBranch(req.user.clinicName, req.activeBranch, req.query);
    
    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = catchAsync(async (req, res, next) => {
    const taskData = {
        ...req.body,
        clinicName: req.user.clinicName,
        branch: req.activeBranch,
        creator: req.user._id
    };

    const task = await taskRepository.create(taskData);
    
    res.status(201).json({
        success: true,
        data: task
    });
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = catchAsync(async (req, res, next) => {
    let task = await taskRepository.findById(req.params.id);

    if (!task) {
        return next(new AppError('Task not found', 404));
    }

    // Ensure user belongs to the same clinic
    if (task.clinicName !== req.user.clinicName) {
        return next(new AppError('Unauthorized', 403));
    }

    task = await taskRepository.update({ _id: req.params.id }, req.body);

    res.status(200).json({
        success: true,
        data: task
    });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = catchAsync(async (req, res, next) => {
    const task = await taskRepository.findById(req.params.id);

    if (!task) {
        return next(new AppError('Task not found', 404));
    }

    if (task.clinicName !== req.user.clinicName) {
        return next(new AppError('Unauthorized', 403));
    }

    await taskRepository.delete({ _id: req.params.id });

    res.status(200).json({
        success: true,
        data: {}
    });
});
