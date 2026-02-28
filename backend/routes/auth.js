const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    getMe,
    updateProfile,
    getApiKey,
    updateActiveBranch
} = require('../controllers/authController');

const { registerSchema, loginSchema, updateProfileSchema } = require('../validations/authValidation');
const validate = require('../middleware/validate');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateProfileSchema), updateProfile);
router.get('/api-key', protect, getApiKey);
router.put('/active-branch', protect, updateActiveBranch);

module.exports = router;
