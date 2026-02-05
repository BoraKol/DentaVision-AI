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

router.route('/')
    .get(getPatients)
    .post(createPatient);

router.route('/:id')
    .get(getPatient)
    .put(updatePatient)
    .delete(deletePatient);

module.exports = router;
