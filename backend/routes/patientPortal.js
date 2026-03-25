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

    // Check for patient with flexible phone matching
    // Remove all non-numeric characters from input
    const cleanPhone = phone.replace(/\D/g, '');
    const last10Digits = cleanPhone.slice(-10);

    // Create a regex that matches these digits spread out with any non-digit characters in between
    // Example: 5555555555 -> 5\D*5\D*5\D*...
    const fuzzyPhoneRegex = last10Digits.split('').join('\\D*');
    
    console.log(`Login Attempt: Input Phone: ${phone.replace(/.(?=.{4})/g, '*')}, Clean: [MASKED], Regex: [MASKED]`);

    // Find patient where phone matches the fuzzy regex (digits appear in order)
    const patient = await Patient.findOne({ 
        phone: { $regex: fuzzyPhoneRegex, $options: 'i' } 
    }).select('+password');

    if (!patient) {
        console.log('Login Failed: Patient not found');
        return res.status(401).json({ success: false, message: 'Invalid credentials (User not found)' });
    }

    // Check if password matches
    const isMatch = await patient.matchPassword(password);

    if (!isMatch) {
         console.log(`Login Failed: Password mismatch for Patient ID: ${patient._id}`);
        return res.status(401).json({ success: false, message: 'Invalid credentials (Password mismatch)' });
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
const Appointment = require('../models/Appointment');
const Analysis = require('../models/Analysis'); // Fix: Require Analysis model to register schema
const smsService = require('../services/smsService');

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

// @desc    Get available appointment slots
// @route   GET /api/portal/available-slots
// @access  Private (Patient)
router.get('/available-slots', protectPatient, async (req, res) => {
    const { date } = req.query; // Format: YYYY-MM-DD
    
    if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
    }

    try {
        // Get clinic details from patient
        const patient = await Patient.findById(req.patient.id);
        const clinicName = patient.clinicName;

        // Get existing appointments for the date
        const existingAppointments = await Appointment.find({
            clinicName,
            date,
            status: { $ne: 'cancelled' }
        });

        // Generate slots (09:00 - 17:00, 30 min intervals)
        const slots = [];
        const startHour = 9;
        const endHour = 17;

        for (let h = startHour; h < endHour; h++) {
            const hour = h.toString().padStart(2, '0');
            slots.push(`${hour}:00`);
            slots.push(`${hour}:30`);
        }

        // Filter out taken slots
        // Simple logic: if an appointment exists at that time, remove it
        const takenTimes = existingAppointments.map(apt => apt.time);
        const availableSlots = slots.filter(time => !takenTimes.includes(time));

        res.status(200).json({ success: true, data: availableSlots });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Book an appointment
// @route   POST /api/portal/book-appointment
// @access  Private (Patient)
router.post('/book-appointment', protectPatient, async (req, res) => {
    const { date, time, procedure, notes } = req.body;

    if (!date || !time || !procedure) {
        return res.status(400).json({ success: false, message: 'Please provide date, time and procedure' });
    }

    try {
        const patient = await Patient.findById(req.patient.id);
        
        // Check availability again (race condition check)
        const existing = await Appointment.findOne({
            clinicName: patient.clinicName,
            date,
            time,
            status: { $ne: 'cancelled' }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Slot already taken' });
        }

        // Create appointment
        // Note: userId is required by schema. In portal context, we might need a default user (e.g. clinic admin)
        // OR populate it from patient's creator if available.
        // For now, we'll try to use the patient's creator (userId field on Patient).
        const creatorId = patient.userId || null; 

        if (!creatorId) {
             // Fallback: If patient creation didn't save userId, we might have an issue.
             // For now, let's error out or find a workaround. 
             // Ideally Patient model has userId populated.
             return res.status(500).json({ success: false, message: 'Clinic configuration error (No assigned doctor)' });
        }

        const appointment = await Appointment.create({
            patientId: patient._id,
            userId: creatorId,
            clinicName: patient.clinicName,
            date,
            time,
            procedure,
            notes: notes || 'Online randevu',
            status: 'scheduled',
            duration: 30
        });

        // Send SMS Confirmation
        if (patient.phone) {
            const message = `Sayın ${patient.name}, ${new Date(date).toLocaleDateString()} saat ${time} için online randevunuz oluşturulmuştur.`;
            smsService.send(patient.phone, message).catch(err => console.error('Portal SMS Error:', err));
        }

        res.status(201).json({ success: true, data: appointment });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (patient, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: patient._id, role: 'patient' }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
