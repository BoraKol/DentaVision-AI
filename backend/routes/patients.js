const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    getCommunicationLogs
} = require('../controllers/patientController');
const { createPatientSchema, updatePatientSchema } = require('../validations/patientValidation');
const validate = require('../middleware/validate');

// All routes are protected
router.use(protect);

router.get('/', getPatients);
router.post('/', validate(createPatientSchema), createPatient);

router.get('/:id', getPatient);
router.put('/:id', validate(updatePatientSchema), updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);

router.get('/:id/communication-logs', getCommunicationLogs);
router.get('/:id/logs', getCommunicationLogs);

module.exports = router;
