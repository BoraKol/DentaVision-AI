const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');

// All routes are protected
router.use(protect);

const CommunicationLog = require('../models/CommunicationLog');

router.get('/:id/logs', async (req, res) => {
    try {
        const logs = await CommunicationLog.find({ patientId: req.params.id }).sort({ sentAt: -1 });
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.route('/')
    .get(getPatients)
    .post(createPatient);

router.route('/:id')
    .get(getPatient)
    .put(updatePatient)
    .delete(deletePatient);

module.exports = router;
