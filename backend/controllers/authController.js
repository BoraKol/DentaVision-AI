const authService = require('../services/authService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const user = await authService.login(req.body.email, req.body.password);
        res.json(user);
    } catch (error) {
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ message: error.message });
        }
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await authService.getMe(req.user._id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const user = await authService.updateProfile(req.user._id, req.body);
        res.json(user);
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile
};
