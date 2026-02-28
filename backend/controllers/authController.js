const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendResponse } = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = catchAsync(async (req, res, next) => {
    const user = await authService.register(req.body);
    sendResponse(res, 201, user, 'User registered successfully');
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = catchAsync(async (req, res, next) => {
    const user = await authService.login(req.body.email, req.body.password);
    sendResponse(res, 200, user, 'Login successful');
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = catchAsync(async (req, res, next) => {
    const user = await authService.getMe(req.user._id);
    sendResponse(res, 200, user);
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = catchAsync(async (req, res, next) => {
    const user = await authService.updateProfile(req.user._id, req.body);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    sendResponse(res, 200, user, 'Profile updated successfully');
});

// @desc    Get raw Gemini API Key (Secure)
// @route   GET /api/auth/api-key
// @access  Private
const getApiKey = catchAsync(async (req, res, next) => {
    const apiKey = await authService.getRawApiKey(req.user._id);
    sendResponse(res, 200, { apiKey }, 'API Key retrieved safely');
});

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    getApiKey
};
