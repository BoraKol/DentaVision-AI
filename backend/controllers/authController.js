const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = catchAsync(async (req, res, next) => {
    const user = await authService.register(req.body);
    res.status(201).json(user);
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = catchAsync(async (req, res, next) => {
    const user = await authService.login(req.body.email, req.body.password);
    res.json(user);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = catchAsync(async (req, res, next) => {
    const user = await authService.getMe(req.user._id);
    res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = catchAsync(async (req, res, next) => {
    const user = await authService.updateProfile(req.user._id, req.body);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    res.json(user);
});

module.exports = {
    register,
    login,
    getMe,
    updateProfile
};
