const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const { protectPatient } = require('../middleware/patientAuth');

// @desc    Login patient
// @route   POST /api/portal/login
// @access  Public
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ success: false, message: 'Please provide phone and password' });
    }

    // Check for patient
    const patient = await Patient.findOne({ phone }).select('+password');

    if (!patient) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await patient.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(patient, 200, res);
});

// @desc    Get current logged in patient
// @route   GET /api/portal/me
// @access  Private (Patient)
router.get('/me', protectPatient, async (req, res) => {
    const patient = await Patient.findById(req.patient.id).populate('analyses');
    res.status(200).json({ success: true, data: patient });
});

// @desc    Get patient analyses/x-rays
// @route   GET /api/portal/analyses
// @access  Private (Patient)
router.get('/analyses', protectPatient, async (req, res) => {
    const patient = await Patient.findById(req.patient.id).populate({
        path: 'analyses',
        options: { sort: { createdAt: -1 } }
    });
    res.status(200).json({ success: true, data: patient.analyses });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (patient, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: patient._id, role: 'patient' }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: {
                id: patient._id,
                name: patient.name,
                phone: patient.phone,
                clinicName: patient.clinicName
            }
        });
};

module.exports = router;
