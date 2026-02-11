const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const enabizService = require('../services/ENabizService');
const ENabizLog = require('../models/ENabizLog');

// All routes are protected
router.use(protect);

// @desc    Send treatment data to E-Nabız
// @route   POST /api/enabiz/treatment
// @access  Private
router.post('/treatment', async (req, res) => {
    try {
        const { patientId, treatmentData } = req.body;
        
        if (!patientId || !treatmentData) {
            return res.status(400).json({ success: false, error: 'Missing patientId or treatmentData' });
        }

        const result = await enabizService.sendData(
            patientId, 
            'TREATMENT_START', 
            treatmentData, 
            req.user._id
        );

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Get E-Nabız logs for a patient
// @route   GET /api/enabiz/logs/:patientId
// @access  Private
router.get('/logs/:patientId', async (req, res) => {
    try {
        const logs = await ENabizLog.find({ patientId: req.params.patientId }).sort({ submittedAt: -1 });
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
