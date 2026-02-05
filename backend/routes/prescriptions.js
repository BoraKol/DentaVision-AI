const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @desc    Get all prescriptions for a patient
// @route   GET /api/prescriptions/:patientId
// @access  Private
router.get('/:patientId', async (req, res) => {
    try {
        const prescriptions = await Prescription.find({
            patientId: req.params.patientId,
            clinicName: req.user.clinicName
        }).sort({ date: -1 });
        
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a prescription
// @route   POST /api/prescriptions
// @access  Private
router.post('/', async (req, res) => {
    try {
        const prescription = await Prescription.create({
            ...req.body,
            clinicName: req.user.clinicName
        });
        res.status(201).json(prescription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const prescription = await Prescription.findOneAndDelete({
            _id: req.params.id,
            clinicName: req.user.clinicName
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        res.json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
